# 功能设计：插件化通知中心

本文档描述了 Plugnix 通知中心的设计。该功能以插件形式实现，允许其他插件通过事件总线发送通知，并在 UI 右上角通过一个“小铃铛”图标进行展示。

## 核心目标

- **插件化实现**：通知功能作为一个独立的插件，不侵入框架核心代码。
- **事件驱动**：应用内其他模块通过全局事件总线 (`eventBus`) 发送通知，并通过事件监听响应通知上的交互操作。
- **UI集成**：在 `AdminLayout` 和 `PublicLayout` 的右上角导航栏插槽中显示一个通知图标和列表。
- **简单性**：只包含核心功能，易于理解和实现。

## 技术方案

### 1. 事件总线通信

#### a. 发送新通知

- **事件名称**: `'notification:new'`
- **消息负载 (Payload)**: 一个包含以下字段的对象：
  - `id` (`string`, 可选): 通知的唯一标识符。若不提供，通知中心会自动生成。
  - `level` (`string`): 通知级别。可选值为 `'info'`, `'success'`, `'warning'`, `'error'`。默认为 `'info'`。
  - `source` (`string`, 可选): 通知来源标识，如 `'tenant'` 或 `'auth'`，便于调试和追溯。
  - `title` (`string`): 通知的标题（支持i18n Key）。
  - `message` (`string`, 可选): 通知的详细描述（支持i18n Key）。
  - `actions` (`Array<Object>`, 可选): 一个操作按钮数组，用于“查看详情”等交互。每个对象包含：
    - `label` (`string`): 按钮上显示的文本。
    - `event` (`string`): 点击按钮时触发的事件名称。
    - `payload` (`Object`): 随事件一起发送的数据。

**示例：发送一个通知**

```javascript
import eventBus from '@/framework/lib/eventBus';

// 示例1：用户被添加到新组织
eventBus.emit('notification:new', {
  level: 'info',
  source: 'tenant',
  title: 'notifications:tenant.addedToOrg.title',
  message: 'notifications:tenant.addedToOrg.message', // "管理员将您添加到了 '市场部' 组织。"
  actions: [
    {
      label: '查看详情',
      event: 'tenant:view-t-details',
      payload: { tId: 'org-uuid-123' }
    }
  ]
});

// 示例2：角色发生变更
eventBus.emit('notification:new', {
  level: 'warning',
  source: 'permission',
  title: 'notifications:permission.roleChanged.title', // "您的角色已变更"
  message: 'notifications:permission.roleChanged.message' // "您的角色已由 '访客' 变更为 '编辑'。"
});
```

#### b. 响应通知操作

源插件可以监听由 `actions` 触发的事件，以处理后续逻辑，例如页面跳转。

```javascript
// 在 tenant 插件的某个 React 组件中
useEffect(() => {
  const unsubscribe = eventBus.on('tenant:view-tenant-details', (payload) => {
    // 跳转到组织详情页
    navigate(`/admin/ts/${payload.tId}`);
  });
  return unsubscribe;
}, [navigate]);
```

### 2. 通知中心插件 (`plugins/notifications`)

此插件包含实现通知功能的所有逻辑。

#### a. `NotificationProvider.jsx`

- **职责**:
  - 监听全局的 `'notification:new'` 事件，为没有 `id` 的通知生成唯一ID。
  - 在内存中维护一个通知列表（一个 React state 数组）。
  - 提供一个 React Context，将通知列表和操作函数（如“标记为已读”、“删除”）暴露给子组件。
  - 提供处理内部事件的函数，如 `markAsRead(id)` 和 `delete(id)`。
- **注册**:
  - 通过框架的 `registerProvider` API 注册到应用中。

```javascript
// plugins/notifications/index.js
registryApi.registerProvider({
  name: 'NotificationProvider',
  component: NotificationProvider,
  order: 50
});
```

#### b. `NotificationBell.jsx`

- **职责**:
  - UI 组件，显示一个“铃铛”图标，并用徽章显示未读通知数量。
  - 点击图标时，弹出一个 `Dropdown` 或 `Popover`，显示通知列表。
  - 列表中的每一项都应显示其 `level`, `title`, `message` 以及 `actions` 中定义的按钮。
  - 当用户点击 `actions` 按钮时，触发其定义的 `event` 和 `payload`。
  - 提供“标记为已读”和“删除”按钮，调用 `NotificationProvider` 提供的内部处理函数。
- **注册**:
  - 通过 `registerNavbarItem` API 将此组件注入到后台和公共布局的导航栏中。

```javascript
// plugins/notifications/index.js
registryApi.registerNavbarItem({
  key: 'notification-bell',
  component: NotificationBell,
  order: 20
}, 'admin');

registryApi.registerNavbarItem({
  key: 'notification-bell',
  component: NotificationBell,
  order: 20
}, 'public');
```

### 3. 目录结构

```
src/
└── plugins/
    └── notifications/
        ├── components/
        │   └── NotificationBell.jsx
        ├── providers/
        │   └── NotificationProvider.jsx
        ├── index.js                # 插件注册入口
        └── i18n/                   # (可选) 国际化文件
            ├── en.json
            └── zh.json
```

## 实现步骤

1.  **创建 `plugins/notifications` 目录**。
2.  **实现 `NotificationProvider.jsx`**。
3.  **实现 `NotificationBell.jsx`**。
4.  **创建 `plugins/notifications/index.js`**，完成插件注册。
5.  **在其他插件中测试**：在一个现有插件（如 `tenant`）中，调用 `eventBus.emit('notification:new', ...)` 并监听 `actions` 触发的事件来验证功能。

这个经过优化的设计，在保持简洁的同时，极大地增强了通知系统的灵活性和实用性。