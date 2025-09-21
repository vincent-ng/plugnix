### **设计文档：后台管理界面的多Tab导航功能**

#### **1. 概述**

为了提升后台管理系统的用户体验，本项目将引入一个多Tab导航功能。该功能允许用户在同一个浏览器窗口内打开多个功能页面，并通过Tab标签进行快速切换，从而避免在不同任务间频繁跳转和丢失上下文。

**核心功能点:**

*   **打开Tab**: 点击侧边栏菜单项时，在主内容区顶部打开一个新的Tab页。如果该页面已在Tab中打开，则自动切换到已存在的Tab。
*   **切换Tab**: 用户可以点击不同的Tab标签，在已打开的页面之间自由切换。
*   **关闭Tab**: 每个Tab标签提供一个关闭按钮。用户可以关闭单个Tab，或者提供“关闭其他”、“关闭所有”等快捷操作。
*   **状态保持**: 切换Tab时，非活动页面的状态（例如表单中已填写的数据、滚动位置等）应被完整保留。

#### **2. 对现有架构的影响**

此功能的实现将主要影响框架的 `AdminLayout` 和路由处理逻辑，同时需要引入新的状态管理机制。

*   **`AdminLayout.jsx`**: 作为后台布局的核心，它将是本次修改的重点。需要在此组件中集成Tab栏的渲染和逻辑控制。
*   **路由机制**: 当前点击菜单项会直接触发页面跳转。需要调整此行为，改为通过Tab管理器来控制页面的加载和显示。
*   **状态管理**: 需要引入一个新的全局状态来管理所有打开的Tab（包括它们的路径、标题等信息）以及当前活动的Tab是哪一个。

#### **3. 实施方案**

我们将采用基于React Context的方案来管理Tab状态，并对 `AdminLayout` 进行改造以支持Tab式界面。

##### **3.1. Tab状态管理 (`TabContext`)**

1.  **创建 `TabContext.jsx`**
    *   **位置**: `src/framework/contexts/TabContext.jsx`
    *   **目的**: 创建一个 `TabContext` 来全局管理Tab状态。
    *   **`TabProvider` 提供的值**:
        *   `tabs`: 一个数组，存储所有已打开的Tab对象。每个对象包含 `{ path, label, component }` 等信息。
        *   `activeTab`: 字符串，存储当前活动Tab的 `path`。
        *   `openTab(tabData)`: 函数，用于打开一个新Tab。`tabData` 包含 `{ path, label, component }`。该函数会检查 `path` 是否已存在，如果存在则激活该Tab，否则创建新Tab。
        *   `closeTab(path)`: 函数，用于根据 `path` 关闭一个Tab。
        *   `switchTab(path)`: 函数，用于切换到指定 `path` 的Tab。

##### **3.2. UI组件**

1.  **`tabs.jsx` (shadcn/ui)**
    *   **位置**: `src/framework/components/ui/tabs.jsx`
    *   **来源**: 通过 `npx shadcn-ui@latest add tabs` 命令安装。
    *   **目的**: 提供构建Tab界面的基础UI组件，包括 `Tabs`, `TabsList`, `TabsTrigger` 和 `TabsContent`。

2.  **创建 `TabBar.jsx`**
    *   **位置**: `src/framework/components/TabBar.jsx`
    *   **目的**: 这是我们自定义的业务组件，负责渲染和管理整个Tab栏。它将：
        *   从 `TabContext` 中获取 `tabs` 和 `activeTab` 状态。
        *   使用 `shadcn/ui` 的 `Tabs` 和 `TabsList` 作为基础布局。
        *   遍历 `tabs` 数组，为每个 tab 渲染一个 `TabItem` 组件。
        *   处理Tab的切换逻辑。

3.  **创建 `TabItem.jsx`**
    *   **位置**: `src/framework/components/TabItem.jsx`
    *   **目的**: 代表Tab栏中的单个可交互的Tab项。它将包含：
        *   页面标题 (`label`)。
        *   一个关闭图标按钮。
        *   点击Tab本身会触发 `switchTab`。
        *   点击关闭按钮会触发 `closeTab`。
    *   **技术**: 使用 `shadcn/ui` 的 `TabsTrigger` 作为基础，并在其内部添加一个关闭按钮（例如使用 `X` 图标）。

##### **3.3. 改造 `AdminLayout.jsx`**

1.  **引入 `TabProvider`**: 在 `AdminLayout` 的顶层或其父组件中，使用 `<TabProvider>` 包裹其子组件，以便整个后台布局都能访问Tab状态。

2.  **集成 `TabBar`**: 在主内容区的上方渲染 `<TabBar />` 组件。

3.  **修改菜单点击行为**:
    *   获取侧边栏菜单项的点击事件。
    *   阻止默认的路由跳转行为。
    *   从被点击的菜单项中提取 `path` 和 `label`。
    *   **关键**: 根据 `path` 从应用的路由配置中查找对应的 `component`。
    *   调用 `TabContext` 中的 `openTab({ path, label, component })` 函数来打开或激活Tab。

4.  **改造主内容区渲染逻辑**:
    *   原先由 `<Outlet />` 渲染单个路由页面的区域需要被修改。
    *   遍历 `TabContext` 中的 `tabs` 数组。
    *   为每个 `tab` 渲染其对应的 `component`。
    *   **状态保持**: 使用 CSS (`display: block / none`) 来控制Tab的显示和隐藏，而不是条件渲染。这样可以确保非活动Tab的React组件实例不会被卸载，其内部状态得以保留。

    **示例代码:**
    ```jsx
    // AdminLayout.jsx (部分)
    import { useTabs } from '../contexts/TabContext';

    function AdminLayout() {
      const { tabs, activeTab } = useTabs();

      return (
        <div className="admin-layout">
          {/* ... Sidebar ... */}
          <main>
            <TabBar />
            <div className="content-area">
              {tabs.map(tab => (
                <div
                  key={tab.path}
                  className="tab-content"
                  style={{ display: tab.path === activeTab ? 'block' : 'none' }}
                >
                  <tab.component />
                </div>
              ))}
            </div>
          </main>
        </div>
      );
    }
    ```

##### **3.4. 路由与组件的关联**

`AdminLayout` 在处理菜单点击时，需要知道每个 `path` 对应的React组件是什么。由于插件通过 `registerRoute` API注册路由，这些信息最终会汇集到React Router的配置中。`AdminLayout` 需要一种方式来访问这份路由配置，以便在 `openTab` 时能传入正确的 `component`。

一个可行的方法是在应用初始化时，将扁平化的路由列表（包含 `path` 和 `component`）也存入一个全局可访问的地方，例如一个独立的Context或Registry模块。

#### **4. 插件API的兼容性**

现有的插件API (`registerRoute`, `registerAdminMenuItem` 等) **无需任何改动**。插件开发者可以像以前一样注册菜单和路由。所有的多Tab逻辑都在框架层面 (`framework`) 内部消化，对插件保持透明。

#### **5. 开发步骤建议**

1.  **创建 `TabContext.jsx`**: 实现 `TabProvider` 和 `useTabs` hook，管理 `tabs` 和 `activeTab` 状态。
2.  **创建 `TabBar.jsx` 和 `Tab.jsx`**: 开发Tab栏的UI组件。
3.  **修改 `AdminLayout.jsx`**:
    *   集成 `TabProvider` 和 `TabBar`。
    *   实现新的主内容区渲染逻辑，以支持多Tab并保持状态。
4.  **处理菜单点击**:
    *   修改 `AdminLayout` 中的菜单渲染逻辑，使其在点击时调用 `openTab`。
    *   解决如何根据 `path` 获取 `component` 的问题。可以考虑在 `App.jsx` 或 `main.jsx` 中处理路由配置，并将其传递给 `TabProvider`。
5.  **测试**:
    *   测试打开、关闭、切换Tab的功能。
    *   测试非活动Tab的状态是否正确保留。
    *   测试与现有插件的兼容性。