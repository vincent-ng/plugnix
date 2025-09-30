import React from 'react';
import { NodeToolbar, Position } from 'reactflow';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Badge } from '@/framework/components/ui/badge';
import { Progress } from '@/framework/components/ui/progress';
import { Button } from '@/framework/components/ui/button';
import { Separator } from '@/framework/components/ui/separator';

const SkillNodeToolbar = ({ 
  skill, 
  skillStatus, 
  prerequisites, 
  isVisible, 
  onClose,
  position = Position.Top
}) => {
  const { t } = useTranslation('herodex');

  if (!skill || !isVisible) return null;

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
      case 'LOCKED': return 'destructive';
      case 'UNLOCKED': return 'default';
      case 'MASTERED': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'LOCKED': return '已锁定';
      case 'UNLOCKED': return '可学习';
      case 'MASTERED': return '已掌握';
      default: return '未知';
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

  const progressPercentage = skillStatus.maxProficiency > 0 
    ? (skillStatus.proficiency / skillStatus.maxProficiency) * 100 
    : 0;

  return (
    <NodeToolbar 
      isVisible={isVisible} 
      position={position}
      offset={15}
      align="center"
    >
      <Card className="w-80 shadow-lg bg-background border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getStatusIcon(skillStatus.status)}</span>
              <div>
                <CardTitle className="text-lg">{skill.skill_name_game}</CardTitle>
                <CardDescription className="text-sm">
                  {skill.skill_name_real}
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={getStatusColor(skillStatus.status)}>
              {getStatusText(skillStatus.status)}
            </Badge>
            {skillStatus.level > 0 && (
              <Badge variant="outline">
                {getLevelTitle(skillStatus.level)}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 技能描述 */}
          <div>
            <h4 className="font-semibold text-sm mb-2">技能描述</h4>
            <p className="text-sm text-muted-foreground">
              {skill.description_game || '暂无描述'}
            </p>
          </div>

          <Separator />

          {/* 当前进度 */}
          {skillStatus.status !== 'LOCKED' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-sm">修炼进度</h4>
                <span className="text-xs text-muted-foreground">
                  {skillStatus.proficiency} / {skillStatus.maxProficiency}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>等级 {skillStatus.level}</span>
                <span>{progressPercentage.toFixed(1)}%</span>
              </div>
            </div>
          )}

          {/* 前置条件 */}
          {prerequisites && prerequisites.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm mb-2">前置条件</h4>
                <div className="space-y-2">
                  {prerequisites.map((prereq, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className={prereq.isMet ? 'text-green-600' : 'text-red-600'}>
                          {prereq.isMet ? '✓' : '✗'}
                        </span>
                        {prereq.skill?.skill_name_game || '未知技能'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        需要等级 {prereq.unlock_level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 技能效果 */}
          {skill.effects_json && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm mb-2">技能效果</h4>
                <div className="text-sm text-muted-foreground">
                  {typeof skill.effects_json === 'string' 
                    ? skill.effects_json 
                    : JSON.stringify(skill.effects_json, null, 2)
                  }
                </div>
              </div>
            </>
          )}

          {/* 操作按钮 */}
          {skillStatus.status === 'UNLOCKED' && (
            <div className="pt-2">
              <Button className="w-full" size="sm">
                开始修炼
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </NodeToolbar>
  );
};

export default SkillNodeToolbar;