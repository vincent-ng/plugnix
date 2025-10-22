import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Badge } from '@/framework/components/ui/badge';
import { Button } from '@/framework/components/ui/button';
import { Textarea } from '@/framework/components/ui/textarea';
import { Input } from '@/framework/components/ui/input';
import { Label } from '@/framework/components/ui/label';
import { Alert, AlertDescription } from '@/framework/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/framework/components/ui/tabs';
import { playerService, submissionService } from '../lib/supabase';

const PlayerSubmission = () => {
  const { t } = useTranslation('herodex');
  const [player, setPlayer] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // 表单状态
  const [diaryText, setDiaryText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [todaySubmission, setTodaySubmission] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 获取当前玩家
      const currentPlayer = await playerService.getCurrentPlayer();
      if (!currentPlayer) {
        // 如果没有玩家，跳转到角色面板创建
        window.location.href = '/herodex';
        return;
      }
      
      setPlayer(currentPlayer);
      
      // 获取玩家的呈报历史
      const submissionsData = await submissionService.getPlayerSubmissions(currentPlayer.player_id);
      setSubmissions(submissionsData);
      
      // 检查今天是否已经呈报
      const today = new Date().toISOString().split('T')[0];
      const todaySubmissionData = submissionsData.find(s => s.submission_date === today);
      setTodaySubmission(todaySubmissionData);
      
      if (todaySubmissionData && todaySubmissionData.diary_text) {
        setDiaryText(todaySubmissionData.diary_text);
      }
      
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      file,
      name: file.name,
      type: getFileType(file.type),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const getFileType = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType.startsWith('audio/')) return 'AUDIO';
    if (mimeType.startsWith('video/')) return 'VIDEO';
    return 'IMAGE'; // 默认为图片
  };

  const removeAttachment = (index) => {
    setAttachments(prev => {
      const newAttachments = [...prev];
      if (newAttachments[index].preview) {
        URL.revokeObjectURL(newAttachments[index].preview);
      }
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  };

  const handleSubmit = async () => {
    if (!diaryText.trim() && attachments.length === 0) {
      alert('请至少填写修炼心得或上传一个附件');
      return;
    }

    try {
      setSubmitting(true);
      
      let submission = todaySubmission;
      
      // 如果今天还没有呈报，创建新的呈报
      if (!submission) {
        submission = await submissionService.createSubmission({
          player_id: player.player_id,
          diary_text: diaryText.trim() || null,
          status: 'PENDING'
        });
      } else {
        // 更新现有呈报
        submission = await submissionService.updateSubmission(submission.submission_id, {
          diary_text: diaryText.trim() || null,
          status: 'PENDING'
        });
      }
      
      // 上传附件（这里简化处理，实际应该上传到Supabase Storage）
      for (const attachment of attachments) {
        await submissionService.addAttachment({
          submission_id: submission.submission_id,
          file_type: attachment.type,
          file_path: `/uploads/${Date.now()}-${attachment.name}`, // 模拟路径
          file_name: attachment.name,
          file_size_bytes: attachment.file.size
        });
      }
      
      // 重新加载数据
      await loadData();
      setAttachments([]);
      
      alert('功课呈报成功！师傅会尽快评阅。');
      
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('呈报失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { variant: 'outline', text: '待审核' },
      'PROCESSED': { variant: 'secondary', text: '已处理' },
      'COMPLETED': { variant: 'default', text: '已完成' }
    };
    
    const statusInfo = statusMap[status] || statusMap['PENDING'];
    return <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">功课呈报</h1>
          <p className="text-muted-foreground">向师傅汇报今日的修炼成果</p>
        </div>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">今日呈报</TabsTrigger>
          <TabsTrigger value="history">历史记录</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{today} 的修炼呈报</span>
                {todaySubmission && getStatusBadge(todaySubmission.status)}
              </CardTitle>
              <CardDescription>
                记录您今天的学习心得和成果，师傅会根据您的呈报给予相应的奖励
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {todaySubmission?.status === 'COMPLETED' && (
                <Alert>
                  <AlertDescription>
                    🎉 今日功课已完成评阅！师傅已给予您奖励，请查看角色面板。
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="diary">修炼心得</Label>
                <Textarea
                  id="diary"
                  placeholder={t('player.diaryPlaceholder')}
                  value={diaryText}
                  onChange={(e) => setDiaryText(e.target.value)}
                  className="mt-2"
                  rows={6}
                  disabled={todaySubmission?.status === 'COMPLETED'}
                />
                <div className="text-sm text-muted-foreground mt-1">
                  分享您今天学到了什么，遇到了什么困难，有什么收获...
                </div>
              </div>

              <div>
                <Label>修炼成果附件</Label>
                <div className="mt-2 space-y-4">
                  {/* 文件上传 */}
                  {todaySubmission?.status !== 'COMPLETED' && (
                    <div>
                      <Input
                        type="file"
                        multiple
                        accept="image/*,audio/*,video/*"
                        onChange={handleFileUpload}
                        className="cursor-pointer"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        支持上传图片、音频、视频文件
                      </div>
                    </div>
                  )}

                  {/* 附件预览 */}
                  {attachments.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {attachments.map((attachment, index) => (
                        <div key={index} className="relative border rounded-lg p-3">
                          {attachment.preview && (
                            <img
                              src={attachment.preview}
                              alt={attachment.name}
                              className="w-full h-32 object-cover rounded mb-2"
                            />
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {attachment.name}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {attachment.type}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeAttachment(index)}
                            >
                              删除
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 已上传的附件 */}
                  {todaySubmission?.hdx_submission_attachments?.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">已上传的附件：</div>
                      <div className="space-y-2">
                        {todaySubmission.hdx_submission_attachments.map((attachment) => (
                          <div key={attachment.attachment_id} className="flex items-center space-x-2 p-2 border rounded">
                            <Badge variant="outline">{attachment.file_type}</Badge>
                            <span className="text-sm">{attachment.file_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {todaySubmission?.status !== 'COMPLETED' && (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full"
                  size="lg"
                >
                  {submitting ? '呈报中...' : '呈报师傅'}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>呈报历史</CardTitle>
              <CardDescription>
                您过往的功课呈报记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-4">📜</div>
                  <div>还没有呈报记录</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div
                      key={submission.submission_id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {formatDate(submission.submission_date)}
                        </div>
                        {getStatusBadge(submission.status)}
                      </div>
                      
                      {submission.diary_text && (
                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                          {submission.diary_text}
                        </div>
                      )}
                      
                      {submission.hdx_submission_attachments?.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">附件：</span>
                          {submission.hdx_submission_attachments.map((attachment) => (
                            <Badge key={attachment.attachment_id} variant="outline" className="text-xs">
                              {attachment.file_type}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlayerSubmission;