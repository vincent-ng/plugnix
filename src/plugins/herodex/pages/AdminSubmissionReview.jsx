import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Badge } from '@/framework/components/ui/badge';
import { Button } from '@/framework/components/ui/button';
import { Textarea } from '@/framework/components/ui/textarea';
import { Input } from '@/framework/components/ui/input';
import { Label } from '@/framework/components/ui/label';
import { Separator } from '@/framework/components/ui/separator';
import { Alert, AlertDescription } from '@/framework/components/ui/alert';
import { submissionService, skillService, activityService } from '../lib/supabase';

const AdminSubmissionReview = () => {
  const { t } = useTranslation('herodex');
  const [searchParams] = useSearchParams();
  const submissionId = searchParams.get('id');
  
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // AI建议和最终评定
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [finalComment, setFinalComment] = useState('');
  const [finalXp, setFinalXp] = useState(0);
  const [skillRewards, setSkillRewards] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (submissionId && submissions.length > 0) {
      const submission = submissions.find(s => s.submission_id === submissionId);
      if (submission) {
        setSelectedSubmission(submission);
        if (submission.ai_suggestion_json) {
          setAiSuggestion(submission.ai_suggestion_json);
          setFinalComment(submission.ai_suggestion_json.comment || '');
          setFinalXp(submission.ai_suggestion_json.suggested_xp || 0);
          setSkillRewards(submission.ai_suggestion_json.suggested_proficiency || []);
        }
      }
    }
  }, [submissionId, submissions]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [submissionsData, skillsData] = await Promise.all([
        submissionService.getPendingSubmissions(),
        skillService.getAllSkills()
      ]);
      
      setSubmissions(submissionsData);
      setSkills(skillsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAiEvaluation = async () => {
    if (!selectedSubmission) return;
    
    try {
      setProcessing(true);
      
      // 准备AI评定所需的数据
      const submissionData = {
        player_name: selectedSubmission.hdx_players?.game_alias || selectedSubmission.hdx_players?.player_name,
        diary_text: selectedSubmission.diary_text,
        attachments: selectedSubmission.hdx_submission_attachments || []
      };
      
      // 调用AI评定服务
      const { evaluateSubmission } = await import('../lib/ai-service');
      const aiResponse = await evaluateSubmission(submissionData, skills);
      
      setAiSuggestion(aiResponse);
      setFinalComment(aiResponse.comment);
      setFinalXp(aiResponse.suggested_xp);
      setSkillRewards(aiResponse.suggested_proficiency);
      
      // 更新数据库中的AI建议
      await submissionService.updateSubmission(selectedSubmission.submission_id, {
        ai_suggestion_json: aiResponse,
        status: 'PROCESSED'
      });
      
    } catch (error) {
      console.error('Failed to get AI evaluation:', error);
      alert('AI评定失败，请重试');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmAward = async () => {
    if (!selectedSubmission) return;
    
    try {
      setProcessing(true);
      
      // 创建活动日志
      const activityData = {
        player_id: selectedSubmission.player_id,
        activity_type: '功课评阅',
        xp_gained: finalXp,
        proficiency_gained: skillRewards.reduce((sum, reward) => sum + reward.points, 0),
        affected_skill_id: skillRewards[0]?.skill_id || null,
        notes: finalComment
      };
      
      const activity = await activityService.createActivity(activityData);
      
      // 更新呈报状态
      await submissionService.updateSubmission(selectedSubmission.submission_id, {
        status: 'COMPLETED',
        final_log_id: activity.log_id
      });
      
      // 刷新数据
      await loadData();
      setSelectedSubmission(null);
      
    } catch (error) {
      console.error('Failed to confirm award:', error);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const getSkillName = (skillId) => {
    const skill = skills.find(s => s.skill_id === skillId);
    return skill ? skill.skill_name_game : '未知技能';
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
          <h1 className="text-3xl font-bold tracking-tight">{t('admin.submissions')}</h1>
          <p className="text-muted-foreground">评阅小侠们的功课呈报</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 左侧：功课列表 */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>待评阅功课</CardTitle>
            <CardDescription>
              {submissions.length} 条待处理
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {submissions.map((submission) => (
              <div
                key={submission.submission_id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedSubmission?.submission_id === submission.submission_id
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedSubmission(submission)}
              >
                <div className="font-medium">
                  {submission.hdx_players?.game_alias || submission.hdx_players?.player_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(submission.submission_date)}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant={submission.status === 'PROCESSED' ? 'secondary' : 'outline'}>
                    {t(`submissions.${submission.status.toLowerCase()}`)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {submission.hdx_submission_attachments?.length || 0} 附件
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 右侧：详细评阅 */}
        <div className="md:col-span-2 space-y-6">
          {selectedSubmission ? (
            <>
              {/* 功课内容 */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedSubmission.hdx_players?.game_alias || selectedSubmission.hdx_players?.player_name} 
                    的功课呈报
                  </CardTitle>
                  <CardDescription>
                    {formatDate(selectedSubmission.submission_date)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedSubmission.diary_text && (
                    <div>
                      <Label className="text-sm font-medium">修炼心得</Label>
                      <div className="mt-2 p-3 bg-muted rounded-lg">
                        {selectedSubmission.diary_text}
                      </div>
                    </div>
                  )}
                  
                  {selectedSubmission.hdx_submission_attachments?.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">修炼成果附件</Label>
                      <div className="mt-2 space-y-2">
                        {selectedSubmission.hdx_submission_attachments.map((attachment) => (
                          <div key={attachment.attachment_id} className="flex items-center space-x-2 p-2 border rounded">
                            <Badge variant="outline">{attachment.file_type}</Badge>
                            <span className="text-sm">{attachment.file_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI评定区域 */}
              <Card>
                <CardHeader>
                  <CardTitle>师傅评定</CardTitle>
                  <CardDescription>
                    请求AI师傅进行初步评定，然后进行调整
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!aiSuggestion ? (
                    <Button 
                      onClick={handleRequestAiEvaluation}
                      disabled={processing}
                      className="w-full"
                    >
                      {processing ? '师傅评定中...' : '请师傅评定'}
                    </Button>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        AI师傅已完成评定，您可以在下方调整后确认授予奖励。
                      </AlertDescription>
                    </Alert>
                  )}

                  {aiSuggestion && (
                    <div className="space-y-4">
                      <Separator />
                      
                      <div>
                        <Label htmlFor="comment">师傅评语</Label>
                        <Textarea
                          id="comment"
                          value={finalComment}
                          onChange={(e) => setFinalComment(e.target.value)}
                          className="mt-2"
                          rows={4}
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="xp">修为奖励</Label>
                          <Input
                            id="xp"
                            type="number"
                            value={finalXp}
                            onChange={(e) => setFinalXp(parseInt(e.target.value) || 0)}
                            className="mt-2"
                          />
                        </div>
                        
                        <div>
                          <Label>技能熟练度奖励</Label>
                          <div className="mt-2 space-y-2">
                            {skillRewards.map((reward, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <span className="text-sm flex-1">
                                  {getSkillName(reward.skill_id)}
                                </span>
                                <Input
                                  type="number"
                                  value={reward.points}
                                  onChange={(e) => {
                                    const newRewards = [...skillRewards];
                                    newRewards[index].points = parseInt(e.target.value) || 0;
                                    setSkillRewards(newRewards);
                                  }}
                                  className="w-20"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Button 
                        onClick={handleConfirmAward}
                        disabled={processing}
                        className="w-full"
                        size="lg"
                      >
                        {processing ? '授予中...' : '确认授予'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-muted-foreground">
                  <div className="text-4xl mb-4">📝</div>
                  <div>请从左侧选择一个功课呈报进行评阅</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSubmissionReview;