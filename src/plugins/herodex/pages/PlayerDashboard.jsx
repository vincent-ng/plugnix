import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Badge } from '@/framework/components/ui/badge';
import { Button } from '@/framework/components/ui/button';
import { Progress } from '@/framework/components/ui/progress';
import { Label } from '@/framework/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/framework/components/ui/tabs';
import { playerService, skillService, activityService, subjectService } from '../lib/supabase';
import { calculatePlayerLevel } from '../lib/game-mechanics';

const PlayerDashboard = () => {
  const { t } = useTranslation('herodex');
  const [player, setPlayer] = useState(null);
  const [playerSkills, setPlayerSkills] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayerData();
  }, []);

  const loadPlayerData = async () => {
    try {
      setLoading(true);
      
      // 获取当前玩家信息
      let currentPlayer = await playerService.getCurrentPlayer();
      
      // 如果玩家不存在，创建一个默认玩家
      if (!currentPlayer) {
        currentPlayer = await playerService.createPlayer({
          player_name: '小侠',
          game_alias: '初入江湖',
          total_xp: 0,
          level_title: '初窥门径'
        });
      }
      
      setPlayer(currentPlayer);
      
      // 获取玩家技能进度
      const [skills, subjectsData, activity] = await Promise.all([
        skillService.getPlayerSkills(currentPlayer.player_id),
        subjectService.getAllSubjects(),
        activityService.getActivityLog(currentPlayer.player_id, 10)
      ]);
      
      setPlayerSkills(skills);
      setSubjects(subjectsData);
      setRecentActivity(activity);
      
    } catch (error) {
      console.error('Failed to load player data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlayerLevel = (totalXp) => {
    return calculatePlayerLevel(totalXp);
  };

  const getSubjectProgress = (subjectId) => {
    const subjectSkills = playerSkills.filter(ps => ps.hdx_skills?.subject_id === subjectId);
    if (subjectSkills.length === 0) return { mastered: 0, total: 0, percentage: 0 };
    
    const mastered = subjectSkills.filter(ps => ps.status === 'MASTERED').length;
    const total = subjectSkills.length;
    const percentage = Math.round((mastered / total) * 100);
    
    return { mastered, total, percentage };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">⚔️</div>
          <div className="text-lg mb-4">欢迎来到小侠成长录</div>
          <Button onClick={loadPlayerData}>开始修炼之路</Button>
        </div>
      </div>
    );
  }

  const playerLevel = getPlayerLevel(player.total_xp);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 角色面板头部 */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{player.game_alias || player.player_name}</h1>
              <p className="text-blue-100 mt-1">{playerLevel.title}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{player.total_xp}</div>
              <div className="text-blue-100">总修为</div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold">Lv.{playerLevel.level}</div>
              <div className="text-blue-100 text-sm">等级</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">
                {playerSkills.filter(ps => ps.status === 'MASTERED').length}
              </div>
              <div className="text-blue-100 text-sm">已精通技能</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">
                {playerSkills.filter(ps => ps.status === 'UNLOCKED').length}
              </div>
              <div className="text-blue-100 text-sm">修炼中技能</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{recentActivity.length}</div>
              <div className="text-blue-100 text-sm">最近活动</div>
            </div>
          </div>
        </div>
        
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-20">
          <div className="text-8xl">⚔️</div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <Tabs defaultValue="subjects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subjects">修炼进度</TabsTrigger>
          <TabsTrigger value="activity">修炼记录</TabsTrigger>
          <TabsTrigger value="profile">侠客档案</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {subjects.map((subject) => {
              const progress = getSubjectProgress(subject.subject_id);
              return (
                <Card key={subject.subject_id} className="relative overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{subject.subject_name_game}</span>
                      <Badge variant="outline">{progress.percentage}%</Badge>
                    </CardTitle>
                    <CardDescription>{subject.description_game}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Progress value={progress.percentage} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>已精通 {progress.mastered} 项</span>
                        <span>共 {progress.total} 项技能</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      asChild
                    >
                      <a href="/herodex/skills">查看技能树</a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>最近修炼记录</CardTitle>
              <CardDescription>
                您最近的修炼成果和师傅的嘉奖
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-4">📜</div>
                  <div>还没有修炼记录</div>
                  <div className="text-sm mt-2">
                    <a href="/herodex/submission" className="text-primary hover:underline">
                      去呈报今日功课
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.log_id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{activity.activity_type}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(activity.created_at)}
                        </div>
                        {activity.notes && (
                          <div className="text-sm text-muted-foreground max-w-md">
                            {activity.notes}
                          </div>
                        )}
                      </div>
                      <div className="text-right space-y-1">
                        {activity.xp_gained > 0 && (
                          <Badge variant="secondary">
                            +{activity.xp_gained} 修为
                          </Badge>
                        )}
                        {activity.proficiency_gained > 0 && (
                          <div>
                            <Badge variant="outline">
                              +{activity.proficiency_gained} 熟练度
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>侠客档案</CardTitle>
              <CardDescription>
                您的基本信息和修炼历程
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">侠名</Label>
                  <div className="mt-1 text-lg">{player.game_alias || player.player_name}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">当前称号</Label>
                  <div className="mt-1">
                    <Badge variant="secondary">{playerLevel.title}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">总修为</Label>
                  <div className="mt-1 text-lg font-bold text-primary">{player.total_xp}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">入门时间</Label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {new Date(player.created_at).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">修炼天数</span>
                  <span className="text-lg font-bold">
                    {Math.ceil((new Date() - new Date(player.created_at)) / (1000 * 60 * 60 * 24))} 天
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 快速操作 */}
      <div className="flex justify-center space-x-4">
        <Button size="lg" asChild>
          <a href="/herodex/submission">
            📝 呈报今日功课
          </a>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <a href="/herodex/skills">
            ⚔️ 查看技能树
          </a>
        </Button>
      </div>
    </div>
  );
};

export default PlayerDashboard;