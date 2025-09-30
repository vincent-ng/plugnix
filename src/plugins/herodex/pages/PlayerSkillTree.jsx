import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardDescription, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/framework/components/ui/tabs';
import { playerService, skillService, subjectService } from '../lib/supabase';
import SkillNode from '../components/SkillNode';
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 100; // 节点宽度调整
const nodeHeight = 80; // 节点高度调整

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};


const PlayerSkillTree = () => {
  const { t } = useTranslation('herodex');
  const [player, setPlayer] = useState(null);
  const [allSkills, setAllSkills] = useState([]);
  const [playerSkills, setPlayerSkills] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [loading, setLoading] = useState(true);

  // React Flow 状态
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 使用useMemo优化nodeTypes，避免不必要的重新渲染
  const nodeTypes = useMemo(() => ({
    skillNode: SkillNode,
  }), []);

  // 生成React Flow的节点和边数据
  const generateFlowData = (skills, playerSkillsData, dependenciesData) => {
    const flowNodes = skills.map(skill => {
      const skillStatus = getSkillStatus(skill, {
        playerSkillsData,
        dependenciesData,
        skillsData: skills
      });

      const prerequisites = getPrerequisites(skill.skill_id, {
        dependenciesData,
        skillsData: skills,
        playerSkillsData
      });

      return {
        id: skill.skill_id,
        type: 'skillNode',
        data: {
          skill,
          skillStatus,
          prerequisites,
          onSkillClick: handleSkillClick
        },
        position: { x: 0, y: 0 } // 初始位置，会被Dagre覆盖
      };
    });

    const flowEdges = dependenciesData.map(dep => ({
      id: `${dep.prerequisite_skill_id}-${dep.skill_id}`,
      source: dep.prerequisite_skill_id,
      target: dep.skill_id,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#60a5fa', strokeWidth: 3 } // 连线样式调整
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      flowNodes,
      flowEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  };

  // 处理技能点击 - 现在由SkillNode内部处理
  const handleSkillClick = useCallback((skill) => {
    // 这个函数现在主要用于兼容性，实际的工具栏显示由SkillNode内部管理
    console.log('Skill clicked:', skill.skill_name_game);
  }, []);

  // 处理连接
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

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

      // 生成React Flow的节点和边
      generateFlowData(allSkillsData, playerSkillsData, dependenciesData);

    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 统一的技能状态计算函数
  const getSkillStatus = (skill, options = {}) => {
    const {
      playerSkillsData = playerSkills,
      dependenciesData = dependencies,
      skillsData = allSkills
    } = options;

    // 创建玩家技能映射表
    const playerSkillsMap = new Map(playerSkillsData.map(ps => [ps.skill_id, ps]));
    const playerSkillData = playerSkillsMap.get(skill.skill_id);

    // 如果玩家有这个技能的记录，直接使用数据库中的状态
    if (playerSkillData) {
      return {
        status: playerSkillData.status,
        level: playerSkillData.current_level || 0,
        proficiency: playerSkillData.current_proficiency || 0,
        maxProficiency: getMaxProficiencyForLevel(skill, playerSkillData.current_level || 1)
      };
    }

    // 如果玩家没有这个技能的记录，需要根据前置条件判断状态
    const isUnlockable = isSkillUnlockable(skill, { playerSkillsData, dependenciesData, skillsData });

    return {
      status: isUnlockable ? 'UNLOCKED' : 'LOCKED',
      level: 0,
      proficiency: 0,
      maxProficiency: getMaxProficiencyForLevel(skill, 1)
    };
  };

  const getMaxProficiencyForLevel = (skill, level) => {
    if (!skill.thresholds_json || !skill.thresholds_json[level]) {
      return 100; // 默认值
    }
    return skill.thresholds_json[level];
  };

  // 统一的前置条件获取函数
  const getPrerequisites = (skillId, options = {}) => {
    const {
      dependenciesData = dependencies,
      skillsData = allSkills,
      playerSkillsData = playerSkills
    } = options;

    const playerSkillsMap = new Map(playerSkillsData.map(ps => [ps.skill_id, ps]));

    return dependenciesData
      .filter(dep => dep.skill_id === skillId)
      .map(dep => {
        const skill = skillsData.find(s => s.skill_id === dep.prerequisite_skill_id);
        const playerSkill = playerSkillsMap.get(dep.prerequisite_skill_id);
        const isMet = playerSkill ? playerSkill.current_level >= dep.unlock_level : false;

        return {
          ...dep,
          skill,
          isMet
        };
      });
  };

  // 统一的技能解锁判断函数
  const isSkillUnlockable = (skill, options = {}) => {
    const {
      playerSkillsData = playerSkills,
      dependenciesData = dependencies,
      skillsData = allSkills
    } = options;

    const prerequisites = getPrerequisites(skill.skill_id, { dependenciesData, skillsData, playerSkillsData });
    if (prerequisites.length === 0) return true;

    const playerSkillsMap = new Map(playerSkillsData.map(ps => [ps.skill_id, ps]));

    return prerequisites.every(prereq => {
      const playerSkill = playerSkillsMap.get(prereq.prerequisite_skill_id);
      // 如果没有找到玩家技能记录，说明该前置技能还没有解锁，返回false
      if (!playerSkill) return false;
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

            {/* React Flow 技能树 */}
            <div className="h-[600px] border rounded-lg">
              <ReactFlow
                nodes={nodes.filter(node => {
                  const skill = allSkills.find(s => s.skill_id === node.id);
                  return skill && skill.subject_id === subject.subject_id;
                })}
                edges={edges.filter(edge => {
                  const sourceSkill = allSkills.find(s => s.skill_id === edge.source);
                  const targetSkill = allSkills.find(s => s.skill_id === edge.target);
                  return sourceSkill && targetSkill &&
                    sourceSkill.subject_id === subject.subject_id &&
                    targetSkill.subject_id === subject.subject_id;
                })}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                proOptions={{ hideAttribution: true }}
              >
                <Controls />
                <Background variant="dots" gap={12} size={1} />
              </ReactFlow>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PlayerSkillTree;