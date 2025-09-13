# 框架颜色系统使用指南

## 概述

本框架采用 shadcn/ui 的 CSS 变量颜色系统，支持明暗主题自动切换。作为插件开发者，你需要使用框架提供的颜色变量，而不是硬编码的颜色类，这样可以确保你的插件与框架保持视觉一致性。

## 核心原则

### ✅ 正确做法
```jsx
// 使用框架的 CSS 变量
<div className="bg-card text-card-foreground">
<div className="bg-background text-foreground">
<div className="bg-muted text-muted-foreground">
```

### ❌ 错误做法
```jsx
// 不要使用硬编码颜色
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
<div className="bg-gray-50 dark:bg-gray-900">
```

## 为什么要使用 CSS 变量？

1. **主题一致性**：自动适配明暗主题，无需手动处理
2. **维护性**：统一的颜色管理，便于后续调整
3. **可访问性**：确保对比度符合标准
4. **性能**：减少重复的条件类名

## 可用的颜色变量

### 背景色

| 变量名 | 用途 | 示例 |
|--------|------|------|
| `bg-background` | 页面主背景 | `<div className="bg-background">` |
| `bg-card` | 卡片、容器背景 | `<div className="bg-card">` |
| `bg-muted` | 次要背景区域 | `<div className="bg-muted">` |
| `bg-popover` | 弹出层背景 | `<div className="bg-popover">` |
| `bg-accent` | 强调背景 | `<div className="bg-accent">` |
| `bg-secondary` | 次要按钮背景 | `<button className="bg-secondary">` |
| `bg-primary` | 主要按钮背景 | `<button className="bg-primary">` |
| `bg-sidebar-background` | 侧边栏背景（管理后台） | `<aside className="bg-sidebar-background">` |

### 文字颜色

| 变量名 | 用途 | 示例 |
|--------|------|------|
| `text-foreground` | 主要文字 | `<p className="text-foreground">` |
| `text-card-foreground` | 卡片文字 | `<div className="bg-card text-card-foreground">` |
| `text-muted-foreground` | 次要文字 | `<span className="text-muted-foreground">` |
| `text-accent-foreground` | 强调文字 | `<span className="text-accent-foreground">` |
| `text-secondary-foreground` | 次要按钮文字 | `<button className="text-secondary-foreground">` |
| `text-primary-foreground` | 主要按钮文字 | `<button className="text-primary-foreground">` |

### 边框和其他

| 变量名 | 用途 | 示例 |
|--------|------|------|
| `border-border` | 标准边框 | `<div className="border border-border">` |
| `border-input` | 输入框边框 | `<input className="border-input">` |
| `ring-ring` | 焦点环颜色 | `<input className="focus:ring-ring">` |

## 实际开发示例

### 创建一个卡片组件

```jsx
// 推荐的写法
function UserCard({ user }) {
  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6">
      <h3 className="font-semibold mb-2">{user.name}</h3>
      <p className="text-muted-foreground mb-4">{user.email}</p>
      <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
        查看详情
      </button>
    </div>
  );
}
```

### 创建一个表单

```jsx
function LoginForm() {
  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">登录</h2>
      <form>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            邮箱
          </label>
          <input 
            type="email"
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
          />
        </div>
        <button 
          type="submit"
          className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90"
        >
          登录
        </button>
      </form>
    </div>
  );
}
```

## 使用 shadcn/ui 组件（推荐）

更好的做法是直接使用框架提供的 shadcn/ui 组件：

```jsx
import { Card, CardContent, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Button } from '@/framework/components/ui/button';
import { Input } from '@/framework/components/ui/input';

function UserCard({ user }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{user.email}</p>
        <Button>查看详情</Button>
      </CardContent>
    </Card>
  );
}
```

## 最佳实践

### 1. 背景和文字颜色搭配

```jsx
// 正确的搭配
<div className="bg-card text-card-foreground">卡片内容</div>
<div className="bg-background text-foreground">页面内容</div>
<div className="bg-muted text-muted-foreground">次要内容</div>
```

### 2. 按钮颜色使用

```jsx
// 主要操作按钮
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  确认
</button>

// 次要操作按钮
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
  取消
</button>
```

### 3. 表单元素

```jsx
<input 
  className="bg-background text-foreground border border-input focus:ring-ring"
/>
```

## 常见问题

### Q: 什么时候使用 `bg-card` vs `bg-background`？
**A:** `bg-background` 用于页面主背景，`bg-card` 用于卡片、对话框等容器组件。

### Q: 如何处理悬停状态？
**A:** 使用透明度修饰符，如 `hover:bg-primary/90`（90% 透明度）。

### Q: 可以混用硬编码颜色吗？
**A:** 不建议。这会破坏主题一致性，应该始终使用框架提供的颜色变量。

### Q: 如何自定义颜色？
**A:** 在 `tailwind.config.js` 中扩展颜色变量，或联系框架维护者添加新的颜色变量。

## 开发检查清单

在提交代码前，请确认：

- [ ] 没有使用硬编码颜色类（如 `bg-white`、`text-gray-900`）
- [ ] 背景色和文字色正确搭配
- [ ] 在明暗主题下都能正常显示
- [ ] 优先使用 shadcn/ui 组件而不是自定义样式
- [ ] 按钮、输入框等交互元素有正确的状态样式