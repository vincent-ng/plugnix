import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Badge } from '@/framework/components/ui/badge';
import { Button } from '@/framework/components/ui/button';
import { Input } from '@/framework/components/ui/input';
import { Label } from '@/framework/components/ui/label';
import { Textarea } from '@/framework/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/framework/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/framework/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/framework/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/framework/components/ui/tabs';
import { skillService, subjectService } from '../lib/supabase';

const AdminSkillManagement = () => {
  const { t } = useTranslation('herodex');
  const [skills, setSkills] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSkill, setEditingSkill] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    skill_name_game: '',
    skill_name_real: '',
    description_game: '',
    description_real: '',
    subject_id: '',
    grade_level: 1,
    max_level: 5
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [skillsData, subjectsData, dependenciesData] = await Promise.all([
        skillService.getAllSkills(),
        subjectService.getAllSubjects(),
        skillService.getSkillDependencies()
      ]);
      
      setSkills(skillsData);
      setSubjects(subjectsData);
      setDependencies(dependenciesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSkill = () => {
    setEditingSkill(null);
    setFormData({
      skill_name_game: '',
      skill_name_real: '',
      description_game: '',
      description_real: '',
      subject_id: '',
      grade_level: 1,
      max_level: 5
    });
    setIsDialogOpen(true);
  };

  const handleEditSkill = (skill) => {
    setEditingSkill(skill);
    setFormData({
      skill_name_game: skill.skill_name_game,
      skill_name_real: skill.skill_name_real,
      description_game: skill.description_game || '',
      description_real: skill.description_real || '',
      subject_id: skill.subject_id,
      grade_level: skill.grade_level || 1,
      max_level: skill.max_level || 5
    });
    setIsDialogOpen(true);
  };

  const handleSaveSkill = async () => {
    try {
      if (editingSkill) {
        await skillService.updateSkill(editingSkill.skill_id, formData);
      } else {
        await skillService.createSkill(formData);
      }
      
      setIsDialogOpen(false);
      await loadData();
    } catch (error) {
      console.error('Failed to save skill:', error);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!confirm('确定要删除这个技能吗？此操作不可撤销。')) {
      return;
    }
    
    try {
      await skillService.deleteSkill(skillId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete skill:', error);
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.subject_id === subjectId);
    return subject ? subject.subject_name_real : '未知学科';
  };

  const getSkillsBySubject = () => {
    const grouped = {};
    skills.forEach(skill => {
      const subjectName = getSubjectName(skill.subject_id);
      if (!grouped[subjectName]) {
        grouped[subjectName] = [];
      }
      grouped[subjectName].push(skill);
    });
    return grouped;
  };

  const getSkillDependencies = (skillId) => {
    return dependencies.filter(dep => dep.skill_id === skillId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  const skillsBySubject = getSkillsBySubject();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('admin.skills')}</h1>
          <p className="text-muted-foreground">管理技能树和学习路径</p>
        </div>
        <Button onClick={handleCreateSkill}>
          创建新技能
        </Button>
      </div>

      <Tabs defaultValue="skills" className="space-y-4">
        <TabsList>
          <TabsTrigger value="skills">技能列表</TabsTrigger>
          <TabsTrigger value="dependencies">依赖关系</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-4">
          {Object.entries(skillsBySubject).map(([subjectName, subjectSkills]) => (
            <Card key={subjectName}>
              <CardHeader>
                <CardTitle>{subjectName}</CardTitle>
                <CardDescription>
                  {subjectSkills.length} 个技能
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>游戏名称</TableHead>
                      <TableHead>真实名称</TableHead>
                      <TableHead>年级</TableHead>
                      <TableHead>最大等级</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectSkills.map((skill) => (
                      <TableRow key={skill.skill_id}>
                        <TableCell className="font-medium">
                          {skill.skill_name_game}
                        </TableCell>
                        <TableCell>{skill.skill_name_real}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {skill.grade_level}年级
                          </Badge>
                        </TableCell>
                        <TableCell>{skill.max_level}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditSkill(skill)}
                            >
                              编辑
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteSkill(skill.skill_id)}
                            >
                              删除
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>技能依赖关系</CardTitle>
              <CardDescription>
                技能树的前置条件设置
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>技能</TableHead>
                    <TableHead>前置技能</TableHead>
                    <TableHead>需要等级</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dependencies.map((dep) => (
                    <TableRow key={dep.dependency_id}>
                      <TableCell className="font-medium">
                        {dep.skill?.skill_name_game}
                      </TableCell>
                      <TableCell>
                        {dep.prerequisite?.skill_name_game}
                      </TableCell>
                      <TableCell>
                        <Badge>Lv.{dep.unlock_level}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 编辑/创建技能对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingSkill ? '编辑技能' : '创建新技能'}
            </DialogTitle>
            <DialogDescription>
              设置技能的基本信息和属性
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="skill_name_game" className="text-right">
                游戏名称
              </Label>
              <Input
                id="skill_name_game"
                value={formData.skill_name_game}
                onChange={(e) => setFormData({...formData, skill_name_game: e.target.value})}
                className="col-span-3"
                placeholder="如：正音心法"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="skill_name_real" className="text-right">
                真实名称
              </Label>
              <Input
                id="skill_name_real"
                value={formData.skill_name_real}
                onChange={(e) => setFormData({...formData, skill_name_real: e.target.value})}
                className="col-span-3"
                placeholder="如：拼音掌握"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject_id" className="text-right">
                学科
              </Label>
              <Select
                value={formData.subject_id}
                onValueChange={(value) => setFormData({...formData, subject_id: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="选择学科" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.subject_id} value={subject.subject_id}>
                      {subject.subject_name_real}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grade_level" className="text-right">
                年级
              </Label>
              <Input
                id="grade_level"
                type="number"
                min="1"
                max="6"
                value={formData.grade_level}
                onChange={(e) => setFormData({...formData, grade_level: parseInt(e.target.value)})}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="max_level" className="text-right">
                最大等级
              </Label>
              <Input
                id="max_level"
                type="number"
                min="1"
                max="10"
                value={formData.max_level}
                onChange={(e) => setFormData({...formData, max_level: parseInt(e.target.value)})}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description_game" className="text-right">
                游戏描述
              </Label>
              <Textarea
                id="description_game"
                value={formData.description_game}
                onChange={(e) => setFormData({...formData, description_game: e.target.value})}
                className="col-span-3"
                placeholder="武侠风格的描述..."
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description_real" className="text-right">
                真实描述
              </Label>
              <Textarea
                id="description_real"
                value={formData.description_real}
                onChange={(e) => setFormData({...formData, description_real: e.target.value})}
                className="col-span-3"
                placeholder="教学目标描述..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveSkill}>
              {editingSkill ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSkillManagement;