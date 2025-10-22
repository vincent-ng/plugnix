// 游戏机制工具库
// 处理等级计算、技能解锁、经验值转换等游戏逻辑

/**
 * 等级称号映射
 */
export const LEVEL_TITLES = {
  0: '未入门',
  1: '初窥门径',
  2: '略有小成', 
  3: '驾轻就熟',
  4: '炉火纯青',
  5: '登峰造极'
};

/**
 * 玩家总体等级计算
 */
export function calculatePlayerLevel(totalXp) {
  if (totalXp < 50) return { level: 1, title: '初窥门径', nextLevelXp: 50 };
  if (totalXp < 150) return { level: 2, title: '略有小成', nextLevelXp: 150 };
  if (totalXp < 300) return { level: 3, title: '驾轻就熟', nextLevelXp: 300 };
  if (totalXp < 500) return { level: 4, title: '炉火纯青', nextLevelXp: 500 };
  if (totalXp < 800) return { level: 5, title: '登峰造极', nextLevelXp: 800 };
  
  // 超过最高等级后，每1000经验一个等级
  const extraLevels = Math.floor((totalXp - 800) / 1000);
  return { 
    level: 6 + extraLevels, 
    title: '武学宗师', 
    nextLevelXp: 800 + (extraLevels + 1) * 1000 
  };
}

/**
 * 技能等级计算
 */
export function calculateSkillLevel(proficiency, thresholds) {
  if (!thresholds || typeof thresholds !== 'object') {
    // 如果没有阈值配置，使用默认计算
    return calculateDefaultSkillLevel(proficiency);
  }
  
  let level = 0;
  for (let i = 1; i <= 5; i++) {
    if (proficiency >= (thresholds[i] || 0)) {
      level = i;
    } else {
      break;
    }
  }
  
  return {
    level,
    title: LEVEL_TITLES[level],
    currentProficiency: proficiency,
    nextLevelProficiency: thresholds[level + 1] || null,
    progress: level < 5 ? (proficiency / (thresholds[level + 1] || proficiency + 1)) * 100 : 100
  };
}

/**
 * 默认技能等级计算（当没有自定义阈值时）
 */
function calculateDefaultSkillLevel(proficiency) {
  const defaultThresholds = { 1: 10, 2: 30, 3: 60, 4: 100, 5: 150 };
  return calculateSkillLevel(proficiency, defaultThresholds);
}

/**
 * 检查技能是否可以解锁
 */
export function canUnlockSkill(skillId, playerSkills, dependencies) {
  // 获取该技能的所有前置条件
  const prerequisites = dependencies.filter(dep => dep.skill_id === skillId);
  
  // 如果没有前置条件，可以直接解锁
  if (prerequisites.length === 0) {
    return { canUnlock: true, missingPrerequisites: [] };
  }
  
  const missingPrerequisites = [];
  
  for (const prereq of prerequisites) {
    const playerSkill = playerSkills.find(ps => ps.skill_id === prereq.prerequisite_skill_id);
    
    if (!playerSkill || playerSkill.current_level < prereq.unlock_level) {
      missingPrerequisites.push({
        skillId: prereq.prerequisite_skill_id,
        requiredLevel: prereq.unlock_level,
        currentLevel: playerSkill?.current_level || 0
      });
    }
  }
  
  return {
    canUnlock: missingPrerequisites.length === 0,
    missingPrerequisites
  };
}

/**
 * 应用奖励到玩家和技能
 */
export async function applyRewards(playerId, rewards, { playerService, skillService, activityService }) {
  const { xp_gained, proficiency_rewards, activity_type, notes } = rewards;
  
  try {
    // 1. 更新玩家总经验
    if (xp_gained > 0) {
      const currentPlayer = await playerService.getCurrentPlayer();
      const newTotalXp = currentPlayer.total_xp + xp_gained;
      const newLevel = calculatePlayerLevel(newTotalXp);
      
      await playerService.updatePlayer(playerId, {
        total_xp: newTotalXp,
        level_title: newLevel.title
      });
    }
    
    // 2. 更新技能熟练度
    for (const reward of proficiency_rewards) {
      const { skill_id, points } = reward;
      
      // 获取或创建玩家技能记录
      let playerSkills = await skillService.getPlayerSkills(playerId);
      let playerSkill = playerSkills.find(ps => ps.skill_id === skill_id);
      
      if (!playerSkill) {
        // 如果玩家还没有这个技能记录，创建一个
        playerSkill = await createPlayerSkill(playerId, skill_id);
      }
      
      // 计算新的熟练度和等级
      const newProficiency = playerSkill.current_proficiency + points;
      const skill = await getSkillById(skill_id);
      const newSkillLevel = calculateSkillLevel(newProficiency, skill.thresholds_json);
      
      // 更新玩家技能
      await updatePlayerSkill(playerSkill.player_skill_id, {
        current_proficiency: newProficiency,
        current_level: newSkillLevel.level,
        status: newSkillLevel.level >= 5 ? 'MASTERED' : 'UNLOCKED'
      });
    }
    
    // 3. 记录活动日志
    await activityService.createActivity({
      player_id: playerId,
      activity_type: activity_type || '奖励发放',
      xp_gained,
      proficiency_gained: proficiency_rewards.reduce((sum, r) => sum + r.points, 0),
      affected_skill_id: proficiency_rewards[0]?.skill_id || null,
      notes
    });
    
    // 4. 检查并解锁新技能
    await checkAndUnlockNewSkills(playerId, { skillService });
    
    return { success: true };
    
  } catch (error) {
    console.error('Failed to apply rewards:', error);
    throw error;
  }
}

/**
 * 创建玩家技能记录
 */
async function createPlayerSkill(playerId, skillId) {
  // 这里需要直接操作数据库，因为skillService可能没有这个方法
  // 实际实现时需要添加到skillService中
  const { supabase } = await import('./supabase');
  
  const { data, error } = await supabase
    .from('hdx_player_skills')
    .insert({
      player_id: playerId,
      skill_id: skillId,
      current_proficiency: 0,
      current_level: 1,
      status: 'UNLOCKED',
      unlocked_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

/**
 * 更新玩家技能
 */
async function updatePlayerSkill(playerSkillId, updates) {
  const { supabase } = await import('./supabase');
  
  const { data, error } = await supabase
    .from('hdx_player_skills')
    .update(updates)
    .eq('player_skill_id', playerSkillId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

/**
 * 根据ID获取技能信息
 */
async function getSkillById(skillId) {
  const { supabase } = await import('./supabase');
  
  const { data, error } = await supabase
    .from('hdx_skills')
    .select('*')
    .eq('skill_id', skillId)
    .single();
    
  if (error) throw error;
  return data;
}

/**
 * 检查并解锁新技能
 */
async function checkAndUnlockNewSkills(playerId, { skillService }) {
  const { supabase } = await import('./supabase');
  
  // 获取所有技能和依赖关系
  const [allSkills, playerSkills, dependencies] = await Promise.all([
    skillService.getAllSkills(),
    skillService.getPlayerSkills(playerId),
    skillService.getSkillDependencies()
  ]);
  
  // 找出玩家还没有的技能
  const playerSkillIds = new Set(playerSkills.map(ps => ps.skill_id));
  const unownedSkills = allSkills.filter(skill => !playerSkillIds.has(skill.skill_id));
  
  // 检查每个未拥有的技能是否可以解锁
  for (const skill of unownedSkills) {
    const unlockCheck = canUnlockSkill(skill.skill_id, playerSkills, dependencies);
    
    if (unlockCheck.canUnlock) {
      // 解锁技能
      await supabase
        .from('hdx_player_skills')
        .insert({
          player_id: playerId,
          skill_id: skill.skill_id,
          current_proficiency: 0,
          current_level: 1,
          status: 'UNLOCKED',
          unlocked_at: new Date().toISOString()
        });
        
      console.log(`Unlocked new skill: ${skill.skill_name_game}`);
    }
  }
}

/**
 * 获取技能树统计信息
 */
export function getSkillTreeStats(playerSkills, allSkills) {
  const totalSkills = allSkills.length;
  const unlockedSkills = playerSkills.filter(ps => ps.status !== 'LOCKED').length;
  const masteredSkills = playerSkills.filter(ps => ps.status === 'MASTERED').length;
  const lockedSkills = totalSkills - unlockedSkills;
  
  return {
    total: totalSkills,
    unlocked: unlockedSkills,
    mastered: masteredSkills,
    locked: lockedSkills,
    progress: totalSkills > 0 ? Math.round((unlockedSkills / totalSkills) * 100) : 0,
    masteryRate: unlockedSkills > 0 ? Math.round((masteredSkills / unlockedSkills) * 100) : 0
  };
}

/**
 * 生成默认的技能阈值
 */
export function generateDefaultThresholds(maxLevel = 5, baseXp = 10) {
  const thresholds = {};
  let cumulative = 0;
  
  for (let i = 1; i <= maxLevel; i++) {
    cumulative += baseXp * i;
    thresholds[i] = cumulative;
  }
  
  return thresholds;
}