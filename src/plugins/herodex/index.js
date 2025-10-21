// Herodex (小侠成长录) 插件注册入口
import en from './i18n/en.json';
import zh from './i18n/zh.json';

// 导入页面组件
import AdminDashboard from './pages/AdminDashboard';
import AdminSubmissionReview from './pages/AdminSubmissionReview';
import AdminSkillManagement from './pages/AdminSkillManagement';
import PlayerDashboard from './pages/PlayerDashboard';
import PlayerSubmission from './pages/PlayerSubmission';
import PlayerSkillTree from './pages/PlayerSkillTree';


// 插件注册函数
export default function registerHerodexPlugin({
  registerI18nNamespace,
  registerMenuItem,
  registerRoute,
  registerPermission
}) {
  // 注册国际化资源
  registerI18nNamespace('herodex', { en, zh });

  // 注册权限定义
  // UI权限
  registerPermission({ name: 'ui.herodex.admin.view', description: '查看小侠成长录管理后台' });
  registerPermission({ name: 'ui.herodex.player.view', description: '查看小侠成长录玩家界面' });

  // 数据库权限
  registerPermission({ name: 'db.hdx_players.select', description: '查看玩家信息' });
  registerPermission({ name: 'db.hdx_players.insert', description: '创建玩家' });
  registerPermission({ name: 'db.hdx_players.update', description: '更新玩家信息' });
  registerPermission({ name: 'db.hdx_skills.select', description: '查看技能信息' });
  registerPermission({ name: 'db.hdx_skills.insert', description: '创建技能' });
  registerPermission({ name: 'db.hdx_skills.update', description: '更新技能信息' });
  registerPermission({ name: 'db.hdx_skills.delete', description: '删除技能' });
  registerPermission({ name: 'db.hdx_daily_submissions.select', description: '查看功课呈报' });
  registerPermission({ name: 'db.hdx_daily_submissions.insert', description: '提交功课' });
  registerPermission({ name: 'db.hdx_daily_submissions.update', description: '更新功课呈报' });
  registerPermission({ name: 'db.hdx_activity_log.select', description: '查看活动日志' });
  registerPermission({ name: 'db.hdx_activity_log.insert', description: '创建活动记录' });

  // 注册管理后台路由和菜单
  registerMenuItem({
    key: 'herodex-admin',
    label: 'herodex:admin.title',
    icon: '⚔️',
    order: 10,
    position: 'admin',
    children: [{
      key: 'herodex-admin-dashboard',
      label: 'herodex:admin.dashboard',
      path: '/admin/herodex',
      component: AdminDashboard,
    },
    {
      key: 'herodex-admin-submissions',
      label: 'herodex:admin.submissions',
      path: '/admin/herodex/submissions',
      component: AdminSubmissionReview,
    },
    {
      key: 'herodex-admin-skills',
      label: 'herodex:admin.skills',
      path: '/admin/herodex/skills',
      component: AdminSkillManagement,
    }],
  });

  // 注册玩家端路由和菜单
  registerMenuItem({
    key: 'herodex-player',
    label: 'herodex:player.title',
    icon: '🗡️',
    order: 5,
    position: 'public',
    children: [{
      key: 'herodex-player-dashboard',
      label: 'herodex:player.dashboard',
      path: '/herodex',
      component: PlayerDashboard,
    },
    {
      key: 'herodex-submission',
      label: 'herodex:player.submission',
      path: '/herodex/submission',
      component: PlayerSubmission,
    },
    {
      key: 'herodex-skills',
      label: 'herodex:player.skills',
      path: '/herodex/skills',
      component: PlayerSkillTree,
    }]
  });

}