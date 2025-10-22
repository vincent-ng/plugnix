import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Badge } from '@/framework/components/ui/badge';
import { Button } from '@/framework/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/framework/components/ui/tabs';
import { submissionService, skillService } from '../lib/supabase';

const AdminDashboard = () => {
  const { t } = useTranslation('herodex');
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalSkills: 0,
    pendingSubmissions: 0
  });
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 获取统计数据
      const [submissions, skills] = await Promise.all([
        submissionService.getPendingSubmissions(),
        skillService.getAllSkills()
      ]);

      setStats({
        totalPlayers: 1, // 暂时硬编码，后续可以添加统计查询
        totalSkills: skills.length,
        pendingSubmissions: submissions.length
      });

      setPendingSubmissions(submissions.slice(0, 5)); // 只显示前5条
      
      // 获取最近活动（这里需要修改为获取所有玩家的活动）
      // 暂时留空，后续实现
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
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
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('admin.title')}</h1>
          <p className="text-muted-foreground">{t('admin.overview')}</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.totalPlayers')}</CardTitle>
            <div className="text-2xl">👥</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlayers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.totalSkills')}</CardTitle>
            <div className="text-2xl">⚔️</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSkills}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.pendingSubmissions')}</CardTitle>
            <div className="text-2xl">📝</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
            {stats.pendingSubmissions > 0 && (
              <Badge variant="destructive" className="mt-2">
                {t('submissions.pending')}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <Tabs defaultValue="submissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="submissions">{t('admin.submissions')}</TabsTrigger>
          <TabsTrigger value="activity">{t('admin.recentActivity')}</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.pendingSubmissions')}</CardTitle>
              <CardDescription>
                需要您评阅的功课呈报
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingSubmissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无待评阅的功课
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingSubmissions.map((submission) => (
                    <div
                      key={submission.submission_id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">
                          {submission.hdx_players?.game_alias || submission.hdx_players?.player_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(submission.submission_date)}
                        </div>
                        {submission.diary_text && (
                          <div className="text-sm text-muted-foreground max-w-md truncate">
                            {submission.diary_text}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {submission.hdx_submission_attachments?.length || 0} 个附件
                        </Badge>
                        <Button size="sm" asChild>
                          <a href={`/admin/herodex/submissions?id=${submission.submission_id}`}>
                            {t('submissions.review')}
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.recentActivity')}</CardTitle>
              <CardDescription>
                最近的修炼活动记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                功能开发中...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;