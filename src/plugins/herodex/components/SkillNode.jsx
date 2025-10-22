import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import SkillNodeToolbar from './SkillNodeToolbar';

const SkillNode = ({ data, selected }) => {
  const { skill, skillStatus, prerequisites, onSkillClick } = data;
  const [showToolbar, setShowToolbar] = useState(false);

  const getStatusStyles = (status) => {
    switch (status) {
      case 'LOCKED':
        return {
          icon: '🔒',
          bgColor: 'bg-gray-200 dark:bg-gray-700',
          textColor: 'text-gray-500 dark:text-gray-400',
          borderColor: 'border-gray-300 dark:border-gray-600',
        };
      case 'UNLOCKED':
        return {
          icon: '📖',
          bgColor: 'bg-blue-100 dark:bg-blue-900',
          textColor: 'text-blue-800 dark:text-blue-200',
          borderColor: 'border-blue-400 dark:border-blue-600',
        };
      case 'MASTERED':
        return {
          icon: '⭐',
          bgColor: 'bg-yellow-100 dark:bg-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          borderColor: 'border-yellow-500 dark:border-yellow-600',
        };
      default:
        return {
          icon: '❓',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          textColor: 'text-gray-500 dark:text-gray-400',
          borderColor: 'border-gray-300 dark:border-gray-600',
        };
    }
  };

  const styles = getStatusStyles(skillStatus.status);

  const handleClick = () => {
    setShowToolbar(!showToolbar);
    if (onSkillClick) {
      onSkillClick(skill);
    }
  };

  const handleCloseToolbar = () => {
    setShowToolbar(false);
  };

  return (
    <div
      className={`skill-node-container p-1 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-110 hover:shadow-lg cursor-pointer ${styles.bgColor} ${styles.borderColor} border-2 ${selected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={handleClick}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      
      <div className="flex flex-col items-center justify-center text-center p-2">
        <div className="text-4xl mb-2">{styles.icon}</div>
        <div className={`font-bold text-sm ${styles.textColor}`}>
          {skill.skill_name_game}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
      
      {/* 集成的NodeToolbar */}
      <SkillNodeToolbar
        skill={skill}
        skillStatus={skillStatus}
        prerequisites={prerequisites}
        isVisible={showToolbar}
        onClose={handleCloseToolbar}
        position={Position.Top}
      />
    </div>
  );
};

export default SkillNode;