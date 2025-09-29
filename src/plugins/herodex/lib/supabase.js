// Herodex 数据库操作工具库
import { createClient } from '@supabase/supabase-js';

// 从环境变量获取 Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 玩家相关操作
export const playerService = {
  // 获取当前用户的玩家信息
  async getCurrentPlayer() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('hdx_players')
      .select('*')
      .eq('player_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  // 创建玩家
  async createPlayer(playerData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('hdx_players')
      .insert({
        player_id: user.id,
        ...playerData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 更新玩家信息
  async updatePlayer(playerId, updates) {
    const { data, error } = await supabase
      .from('hdx_players')
      .update(updates)
      .eq('player_id', playerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// 技能相关操作
export const skillService = {
  // 获取所有技能
  async getAllSkills() {
    const { data, error } = await supabase
      .from('hdx_skills')
      .select(`
        *,
        hdx_subjects (
          subject_name_real,
          subject_name_game
        )
      `)
      .order('grade_level', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // 获取玩家技能进度
  async getPlayerSkills(playerId) {
    const { data, error } = await supabase
      .from('hdx_player_skills')
      .select(`
        *,
        hdx_skills (
          *,
          hdx_subjects (
            subject_name_real,
            subject_name_game
          )
        )
      `)
      .eq('player_id', playerId);

    if (error) throw error;
    return data;
  },

  // 获取技能依赖关系
  async getSkillDependencies() {
    const { data, error } = await supabase
      .from('hdx_skill_dependencies')
      .select(`
        *,
        skill:hdx_skills!hdx_skill_dependencies_skill_id_fkey (skill_name_real, skill_name_game),
        prerequisite:hdx_skills!hdx_skill_dependencies_prerequisite_skill_id_fkey (skill_name_real, skill_name_game)
      `);

    if (error) throw error;
    return data;
  },

  // 创建技能
  async createSkill(skillData) {
    const { data, error } = await supabase
      .from('hdx_skills')
      .insert(skillData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 更新技能
  async updateSkill(skillId, updates) {
    const { data, error } = await supabase
      .from('hdx_skills')
      .update(updates)
      .eq('skill_id', skillId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 删除技能
  async deleteSkill(skillId) {
    const { error } = await supabase
      .from('hdx_skills')
      .delete()
      .eq('skill_id', skillId);

    if (error) throw error;
  }
};

// 功课呈报相关操作
export const submissionService = {
  // 获取待审核的功课呈报
  async getPendingSubmissions() {
    const { data, error } = await supabase
      .from('hdx_daily_submissions')
      .select(`
        *,
        hdx_players (
          player_name,
          game_alias
        ),
        hdx_submission_attachments (*)
      `)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // 获取玩家的功课呈报历史
  async getPlayerSubmissions(playerId) {
    const { data, error } = await supabase
      .from('hdx_daily_submissions')
      .select(`
        *,
        hdx_submission_attachments (*)
      `)
      .eq('player_id', playerId)
      .order('submission_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  // 创建功课呈报
  async createSubmission(submissionData) {
    const { data, error } = await supabase
      .from('hdx_daily_submissions')
      .insert(submissionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 更新功课呈报
  async updateSubmission(submissionId, updates) {
    const { data, error } = await supabase
      .from('hdx_daily_submissions')
      .update(updates)
      .eq('submission_id', submissionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 添加附件
  async addAttachment(attachmentData) {
    const { data, error } = await supabase
      .from('hdx_submission_attachments')
      .insert(attachmentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// 活动日志相关操作
export const activityService = {
  // 获取活动日志
  async getActivityLog(playerId, limit = 50) {
    const { data, error } = await supabase
      .from('hdx_activity_log')
      .select(`
        *,
        hdx_skills (
          skill_name_real,
          skill_name_game
        )
      `)
      .eq('player_id', playerId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // 创建活动记录
  async createActivity(activityData) {
    const { data, error } = await supabase
      .from('hdx_activity_log')
      .insert(activityData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// 学科相关操作
export const subjectService = {
  // 获取所有学科
  async getAllSubjects() {
    const { data, error } = await supabase
      .from('hdx_subjects')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }
};