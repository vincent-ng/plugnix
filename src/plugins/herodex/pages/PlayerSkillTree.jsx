import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Badge } from '@/framework/components/ui/badge';
import { Progress } from '@/framework/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/framework/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/framework/components/ui/dialog';
import { playerService, skillService, subjectService } from '../lib/supabase';

const PlayerSkillTree = () => {
  const { t } = useTranslation('herodex');
  const [player, setPlayer] = useState(null);
  const [allSkills, setAllSkills] = useState([]);
  const [playerSkills, setPlayerSkills] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const currentPlayer = await playerService.getCurrentPlayer();
      if (!currentPlayer) {
        window.location.href = '/herodex';
        return;
      }
      
      setPlayer(currentPlayer);
      
      const [allSkillsData, playerSkillsData, subjectsData, dependenciesData] = await Promise.all([
        skillService.getAllSkills(),
        skillService.getPlayerSkills(currentPlayer.player_id),
        subjectService.getAllSubjects(),
        skillService.getSkillDependencies()
      ]);
      
      setAllSkills(allSkillsData);
      setPlayerSkills(playerSkillsData);
      setSubjects(subjectsData);
      setDependencies(dependenciesData);
      
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlayerSkillData = (skillId) => {
    return playerSkills.find(ps => ps.skill_id === skillId) || {
      status: 'LOCKED',
      current_level: 0,
      current_proficiency: 0
    };
  };

  const getSkillStatus = (skill) => {
    const playerSkill = getPlayerSkillData(skill.skill_id);
    return {
      status: playerSkill.status,
      level: playerSkill.current_level || 0,
      proficiency: playerSkill.current_proficiency || 0,
      maxProficiency: getMaxProficiencyForLevel(skill, playerSkill.current_level || 1)
    };
  };

  const getMaxProficiencyForLevel = (skill, level) => {
    if (!skill.thresholds_json || !skill.thresholds_json[level]) {
      return 100; // 默认值
    }
    return skill.thresholds_json[level];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'LOCKED': return '🔒';
      case 'UNLOCKED': return '📖';
      case 'MASTERED': return '⭐';
      default: return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'LOCKED': return 'text-muted-foreground';
      case 'UNLOCKED': return 'text-blue-600';
      case 'MASTERED': return 'text-yellow-600';
      default: return 'text-muted-foreground';
    }
  };

  const getLevelTitle = (level) => {
    const titles = {
      0: '未入门',
      1: '初窥门径',
      2: '略有小成',
      3: '驾轻就熟',
      4: '炉火纯青',
      5: '登峰造极'
    };
    return titles[level] || '未知境界';
  };

  const getSkillsBySubject = (subjectId) => {
    return allSkills.filter(skill => skill.subject_id === subjectId);
  };

  const getPrerequisites = (skillId) => {
    return dependencies
      .filter(dep => dep.skill_id === skillId)
      .map(dep => ({
        ...dep,
        skill: allSkills.find(s => s.skill_id === dep.prerequisite_skill_id)
      }));
  };

  const isSkillUnlockable = (skill) => {
    const prerequisites = getPrerequisites(skill.skill_id);
    if (prerequisites.length === 0) return true;
    
    return prerequisites.every(prereq => {
      const playerSkill = getPlayerSkillData(prereq.prerequisite_skill_id);
      return playerSkill.current_level >= prereq.unlock_level;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">技能树</h1>
          <p className="text-muted-foreground">探索您的修炼之路，掌握各种武学技能</p>
        </div>
      </div>

      <Tabs defaultValue={subjects[0]?.subject_id} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          {subjects.map((subject) => (
            <TabsTrigger key={subject.subject_id} value={subject.subject_id}>
              {subject.subject_name_game}
            </TabsTrigger>
          ))}
        </TabsList>

        {subjects.map((subject) => (
          <TabsContent key={subject.subject_id} value={subject.subject_id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{subject.subject_name_game}</CardTitle>
                <CardDescription>{subject.description_game}</CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getSkillsBySubject(subject.subject_id).map((skill) => {
                const skillStatus = getSkillStatus(skill);
                const prerequisites = getPrerequisites(skill.skill_id);
                const unlockable = isSkillUnlockable(skill);
                
                return (
                  <Dialog key={skill.skill_id}>
                    <DialogTrigger asChild>
                      <Card 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          skillStatus.status === 'LOCKED' && !unlockable 
                            ? 'opacity-50' 
                            : 'hover:scale-105'
                        }`}
                        onClick={() => setSelectedSkill(skill)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className={`text-2xl ${getStatusColor(skillStatus.status)}`}>
                              {getStatusIcon(skillStatus.status)}
                            </div>
                            <Badge variant="outline">
                              {skill.grade_level}年级
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">
                            {skill.skill_name_game}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {skill.skill_name_real}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                {getLevelTitle(skillStatus.level)}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                Lv.{skillStatus.level}
                              </span>
                            </div>
                            
                            {skillStatus.status !== 'LOCKED' && (
                              <div className="space-y-1">
                                <Progress 
                                  value={(skillStatus.proficiency / skillStatus.maxProficiency) * 100} 
                                  className="h-2"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>{skillStatus.proficiency}</span>
                                  <span>{skillStatus.maxProficiency}</span>
                                </div>
                              </div>
                            )}
                            
                            {prerequisites.length > 0 && skillStatus.status === 'LOCKED' && (
                              <div className="text-xs text-muted-foreground">
                                需要：{prerequisites[0].skill?.skill_name_game} Lv.{prerequisites[0].unlock_level}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <span className={`text-2xl ${getStatusColor(skillStatus.status)}`}>
                            {getStatusIcon(skillStatus.status)}
                          </span>
                          <span>{skill.skill_name_game}</span>
                        </DialogTitle>
                        <DialogDescription>
                          {skill.skill_name_real}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">技能描述</h4>
                          <p className="text-sm text-muted-foreground">
                            {skill.description_game}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-1">当前等级</h4>
                            <div className="text-lg font-bold">
                              Lv.{skillStatus.level}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {getLevelTitle(skillStatus.level)}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-1">熟练度</h4>
                            <div className="text-lg font-bold">
                              {skillStatus.proficiency}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              / {skillStatus.maxProficiency}
                            </div>
                          </div>
                        </div>

                        {skillStatus.status !== 'LOCKED' && (
                          <div>
                            <h4 className="font-medium mb-2">修炼进度</h4>
                            <Progress 
                              value={(skillStatus.proficiency / skillStatus.maxProficiency) * 100} 
                              className="h-3"
                            />
                          </div>
                        )}

                        {prerequisites.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">前置条件</h4>
                            <div className="space-y-2">
                              {prerequisites.map((prereq) => {
                                const prereqStatus = getPlayerSkillData(prereq.prerequisite_skill_id);
                                const isMet = prereqStatus.current_level >= prereq.unlock_level;
                                
                                return (
                                  <div 
                                    key={prereq.dependency_id}
                                    className={`flex items-center justify-between p-2 border rounded ${
                                      isMet ? 'border-green-200 bg-green-50' : 'border-gray-200'
                                    }`}
                                  >
                                    <span className="text-sm">
                                      {prereq.skill?.skill_name_game}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                      <Badge variant={isMet ? 'default' : 'outline'}>
                                        需要 Lv.{prereq.unlock_level}
                                      </Badge>
                                      {isMet && <span className="text-green-600">✓</span>}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="bg-muted p-3 rounded-lg">
                          <h4 className="font-medium mb-1">学习目标</h4>
                          <p className="text-sm text-muted-foreground">
                            {skill.description_real}
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* 图例 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">图例说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🔒</span>
              <span>未解锁 - 需要完成前置条件</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">📖</span>
              <span>修炼中 - 可以获得熟练度</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">⭐</span>
              <span>已精通 - 达到最高等级</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerSkillTree;