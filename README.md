# Plugnix

一个现代化的模块化插件式前端框架，基于 React + Vite 构建，支持动态插件加载和管理。

## ✨ 特性

- 🔌 **插件系统**: 支持动态加载和管理插件
- 🎨 **主题切换**: 内置明暗主题切换功能
- 🌍 **国际化**: 完整的 i18n 支持
- 🔐 **认证系统**: 集成 Supabase 认证
- 🛡️ **权限控制**: 基于 RBAC 的统一权限管理系统
- 📱 **响应式设计**: 基于 Tailwind CSS 的现代化 UI
- ⚡ **高性能**: Vite 构建工具，快速开发和构建
- 🛠️ **TypeScript**: 完整的类型支持
- 📦 **模块化**: 清晰的架构设计，易于扩展

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 使用 CLI 工具创建新项目

推荐使用 Plugnix CLI 工具快速创建新项目：

#### 安装 CLI

```bash
# 全局安装
npm i -g plugnix-cli

# 或使用 npx（无需全局安装）
npx plugnix-cli <command>
```

#### 创建项目

```bash
# 使用官方模板创建新项目
plugnix-cli init my-admin

# 或使用别名
plugnix-cli create my-admin
plugnix-cli new my-admin

# 或使用 npx
npx plugnix-cli init my-admin
```

#### 添加插件

```bash
# 添加官方插件
plugnix-cli add dashboard

# 一次添加多个插件
plugnix-cli add auth tenant

# 使用自定义插件仓库
plugnix-cli add community-calendar --registry=github:some-community/plugnix-extras

# 使用本地目录作为插件源
plugnix-cli add about-us --registry="C:\\workspace\\plugnix\\src\\plugins"
```

### 手动安装依赖

```bash
npm install
```

### 环境配置

1. 复制环境变量文件：
```bash
cp .env.example .env
```

2. 配置 Supabase（可选）：
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📁 项目结构

```
plugnix/
├── src/
│   ├── framework/         # 框架核心
│   │   ├── api/           # API 接口
│   │   ├── contexts/      # React 上下文
│   │   ├── i18n/          # 国际化配置
│   │   ├── layouts/       # 布局组件
│   │   ├── lib/           # 工具库
│   │   └── registry/      # 插件注册中心
│   ├── plugins/           # 插件目录
│   │   ├── plugin-blog/   # 博客插件
│   │   ├── plugin-user/   # 用户管理插件
│   │   └── index.js       # 插件集成入口
│   ├── App.jsx            # 主应用组件
│   ├── main.jsx           # 应用入口
│   └── index.css          # 全局样式
├── docs/                  # 文档
├── public/                # 静态资源
├── supabase/              # Supabase 迁移脚本
└── package.json
```

## 🔌 插件开发

### 创建新插件

1. 在 `src/plugins/` 目录下创建插件文件夹
2. 创建插件入口文件 `index.js` 或 `index.jsx`：

```javascript
// src/plugins/my-plugin/index.js
import MyPage from './pages/MyPage';

const registerMyPlugin = ({ registerRoute, registerMenuItem, registerI18nNamespace, registerPermission }) => {
  // 注册权限
  registerPermission({
    name: 'ui.my-plugin.view',
    description: '查看我的插件'
  });
  
  // 注册路由
  registerRoute({
    path: 'my-feature',
    component: <MyPage />,
    permissions: 'ui.my-plugin.view'
  });
  
  // 注册菜单项
  registerMenuItem({
    key: 'my-feature',
    label: 'My Feature',
    path: '/admin/my-feature',
    icon: '🚀',
    permissions: 'ui.my-plugin.view'
  });
  
  // 注册国际化
  registerI18nNamespace('my-plugin', {
    en: { title: 'My Plugin' },
    zh: { title: '我的插件' }
  });
};

export default registerMyPlugin;
```

### 插件 API

框架提供以下 API 供插件使用：

- `registerRoute(route)` - 注册路由
- `registerMenuItem(menuItem)` - 注册菜单项
- `registerI18nNamespace(namespace, translations)` - 注册国际化资源
- `registerPermission(permissionObject)` - 注册权限定义

## 🎨 主题系统

框架内置主题切换功能，支持：

- 明亮主题
- 暗黑主题

## 🌍 国际化

框架使用 react-i18next 提供国际化支持：

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('my-namespace');
  
  return <h1>{t('title')}</h1>;
}
```

## 🔐 认证系统

框架集成 Supabase 认证，提供：

- 用户注册/登录
- 会话管理
- 权限控制

```jsx
import { useAuthentication } from '@/framework/contexts/AuthenticationContext';

function MyComponent() {
  const { user, login, logout } = useAuthentication();
  
  // 使用认证功能
}
```

## 🛡️ 权限系统

框架提供基于 RBAC 的权限管理系统：

```jsx
import { usePermission, Authorized } from '@/framework/permissions';

function MyComponent() {
  const { hasPermission } = usePermission();
  
  return (
    <div>
      {/* 条件渲染 */}
      {hasPermission('ui.admin.view') && <AdminPanel />}
      
      {/* 组件包装 */}
      <Authorized permissions="db.posts.create">
        <CreatePostButton />
      </Authorized>
    </div>
  );
}
```

## 📚 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产版本
- `npm run lint` - 运行 ESLint 检查
- `npm run lint:fix` - 自动修复 ESLint 问题
- `npm run clean` - 清理构建文件
- `npm run analyze` - 分析打包结果

## 🛠️ 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **路由**: React Router v6
- **状态管理**: React Context
- **样式**: Tailwind CSS
- **国际化**: react-i18next
- **认证**: Supabase
- **权限管理**: 基于 RBAC 的权限系统
- **代码规范**: ESLint

## 📖 文档

更多详细文档请查看 `docs/` 目录：

- [项目介绍](docs/README.md)
- [数据库规范](docs/design/database-conventions.md)
- [权限模型设计](docs/design/feature-permission-model.md)
- [插件开发指南](docs/design/guide-plugin-development.md)
- [API 参考](docs/design/api-reference.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

**Plugnix** - 让前端开发更加模块化和可扩展 🚀