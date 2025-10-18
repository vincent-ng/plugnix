# 通知中心插件

这是一个插件化的通知中心，允许其他插件通过事件总线发送通知，并在UI右上角通过一个"小铃铛"图标进行展示。

## 功能特性

- **插件化实现**：通知功能作为一个独立的插件，不侵入框架核心代码
- **事件驱动**：应用内其他模块通过全局事件总线 (`eventBus`) 发送通知
- **UI集成**：在 `AdminLayout` 和 `PublicLayout` 的右上角导航栏插槽中显示通知图标和列表
- **多级别通知**：支持 info、success、warning、error 四种通知级别
- **操作按钮**：支持为通知添加自定义操作按钮
- **国际化支持**：内置中英文翻译

## 如何发送通知

其他插件可以通过以下方式发送通知：

```javascript
import eventBus from '@/framework/lib/eventBus';

// 发送一个基本通知
eventBus.emit('notification:new', {
  level: 'info',
  source: 'tenant',
  title: 'notifications:tenant.addedToOrg.title',
  message: 'notifications:tenant.addedToOrg.message'
});

// 发送一个带有操作按钮的通知
eventBus.emit('notification:new', {
  level: 'warning',
  source: 'permission',
  title: 'notifications:permission.roleChanged.title',
  message: 'notifications:permission.roleChanged.message',
  actions: [
    {
      label: '查看详情',
      event: 'tenant:view-tenant-details',
      payload: { tId: 'org-uuid-123' }
    }
  ]
});
```

## 通知参数说明

- `id` (可选): 通知的唯一标识符。若不提供，通知中心会自动生成
- `level` (可选): 通知级别。可选值为 `'info'`, `'success'`, `'warning'`, `'error'`。默认为 `'info'`
- `source` (可选): 通知来源标识，如 `'tenant'` 或 `'auth'`，便于调试和追溯
- `title` (必需): 通知的标题（支持i18n Key）
- `message` (可选): 通知的详细描述（支持i18n Key）
- `actions` (可选): 一个操作按钮数组，用于"查看详情"等交互

## 如何响应通知操作

源插件可以监听由 `actions` 触发的事件，以处理后续逻辑：

```javascript
// 在某个 React 组件中
useEffect(() => {
  const unsubscribe = eventBus.on('tenant:view-tenant-details', (payload) => {
    // 跳转到组织详情页
    navigate(`/admin/ts/${payload.tId}`);
  });
  return unsubscribe;
}, [navigate]);
```

## 测试页面

插件包含一个测试页面，可以通过访问 `/admin/notifications/test` 来测试通知功能。

## 文件结构

```
src/plugins/notifications/
├── components/
│   └── NotificationBell.jsx     # 通知铃铛UI组件
├── providers/
│   └── NotificationProvider.jsx # 通知状态管理Provider
├── pages/
│   └── NotificationTestPage.jsx # 测试页面
├── i18n/
│   ├── en.json                  # 英文翻译
│   └── zh.json                  # 中文翻译
└── index.js                     # 插件注册入口
```