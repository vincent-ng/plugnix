# 插件开发指南

本指南为新开发者提供详细的插件开发步骤和集成流程。

## 插件契约 (`src/plugins/*`)

每个插件都必须遵循一套统一的规范。

  * **入口文件 (`index.js` 或 `index.jsx`)**

      * 每个插件目录必须包含一个 `index.js` 或 `index.jsx` 文件作为插件入口。
      * 该文件必须导出一个默认函数作为插件注册函数。此函数接收框架的注册API作为参数。
      * **函数签名**: `export default function registerPluginName({ registerRoute, registerAdminMenuItem, registerPublicMenuItem, registerI18nNamespace, registerComponent, registerPermission }) { /* ... */ }`

  * **插件内部结构**

      * 插件的内部目录结构是**完全灵活**的。开发者可以根据插件的复杂度和个人偏好自由组织代码，例如将组件、页面、样式、国际化文件等放在不同的子目录中，或者将所有文件直接放在插件根目录下。
      * 唯一的要求是 `index.js` 或 `index.jsx` 文件必须能够正确导出注册函数，并处理其内部依赖。

## 开发新插件

1.  **创建插件目录**

    在 `src/plugins/` 目录下为你的新插件创建一个目录。

    ```bash
    mkdir src/plugins/your-plugin-name
    ```

2.  **创建插件入口文件 (`index.js` 或 `index.jsx`)**

    在插件目录中创建 `index.js` 或 `index.jsx` 文件。这是插件的唯一必需文件。它必须导出一个默认的注册函数。

    ```javascript
    // src/plugins/your-plugin-name/index.js 或 index.jsx

    // 导入该插件所需的任何组件、页面或资源
    import YourMainPage from './YourMainPage'; // 这是一个示例

    // 插件注册函数
    export default function registerYourPlugin({ registerRoute, registerPublicMenuItem, registerPermission }) {
      // 注册权限（如果需要）
      registerPermission({
        name: 'ui.your-plugin.view',
        description: '查看你的插件'
      });

      // 在这里调用框架API来注册功能
      registerRoute({
        path: '/your-path',
        component: YourMainPage
      });

      registerPublicMenuItem({
        label: 'Your Plugin',
        path: '/your-path'
      });

      console.log('Your plugin registered.');
    }
    ```

3.  **组织插件内部代码**

    插件的内部结构是完全灵活的。你可以根据需要创建子目录来组织组件、页面、样式或国际化文件，或者将所有内容都放在插件的根目录中。

    **简单插件示例:**
    ```
    src/plugins/your-plugin-name/
    ├── YourMainPage.jsx
    └── index.js (或 index.jsx)
    ```

    **复杂插件示例:**
    ```
    src/plugins/your-plugin-name/
    ├── components/
    │   └── YourComponent.jsx
    ├── pages/
    │   ├── YourMainPage.jsx
    │   └── YourDetailPage.jsx
    ├── i18n/
    │   ├── en.json
    │   └── zh.json
    └── index.js (或 index.jsx)
    ```

## 集成插件到主应用

插件的集成是**完全自动化**的，开发者无需进行任何手动配置。

**工作原理:**

1.  **自动发现**: 框架的启动逻辑会自动扫描 `src/plugins/` 目录下的所有子目录。
2.  **自动加载**: 任何包含有效 `index.js` 或 `index.jsx` 入口文件的子目录都将被识别为一个插件，并被自动加载和注册。

你只需要将你完成的插件目录放入 `src/plugins/` 下，框架就会完成剩下的所有工作。

## 完整示例：一个简单的“关于”页面插件

您说得对，对于简单的插件，一个 `.jsx` 文件就足够了。这使得创建插件的过程非常高效。

下面我们通过一个**单文件插件**的完整例子，来展示如何创建一个在公共菜单中添加“关于”链接并指向一个简单页面的插件。

**1. 创建插件文件**

在 `src/plugins/` 目录下创建一个新目录，并在其中创建一个 `index.jsx` 文件。这是唯一需要的文件。

```
src/plugins/about/
└── index.jsx
```

**2. 编写插件代码 (`index.jsx`)**

在这个文件中，我们同时定义React组件和插件的注册逻辑。

```jsx
// src/plugins/about/index.jsx

import React from 'react';

// 1. 直接在入口文件中定义页面组件
const AboutPage = () => {
  return (
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">关于我们</h1>
      <p>这是一个通过单文件插件动态加载的“关于”页面。</p>
      <p>Web Plugin Framework 提供了一套强大的工具，可以轻松扩展你的应用。</p>
    </div>
  );
};

// 2. 默认导出一个注册函数
export default function registerAboutPlugin({ registerRoute, registerPublicMenuItem }) {
  // 注册路由，将路径 '/about' 指向上面定义的 AboutPage 组件
  registerRoute({
    path: '/about',
    component: AboutPage,
  });

  // 注册一个公共菜单项，方便用户访问
  registerPublicMenuItem({
    label: '关于', // 菜单显示的文本
    path: '/about', // 点击后跳转的路径
  });
}
```

**3. 完成！**

完成以上步骤后，将 `about` 目录放入 `src/plugins/`。框架会自动发现并加载它。重新运行应用，你就会在菜单栏看到“关于”链接，点击后即可访问我们刚刚创建的页面。

这个例子展示了插件系统的灵活性：从一个简单的单文件插件，到具有复杂内部结构的插件，框架都能很好地支持。

## 扩展插件：支持国际化

当插件功能变复杂时，我们可能需要将其拆分为多个文件，并添加国际化等高级功能。下面我们将展示如何为“关于”插件添加中英文支持。

**1. 更新目录结构**

我们将组件拆分到独立文件，并为国际化资源创建 `i18n` 目录。

```
src/plugins/about/
├── i18n/
│   ├── en.json
│   └── zh.json
├── AboutPage.jsx
└── index.js
```

**2. 创建国际化文件**

*   `i18n/en.json`:
    ```json
    {
      "title": "About Us",
      "menu_label": "About",
      "description": "This is an 'About' page dynamically loaded from a plugin.",
      "framework_intro": "Web Plugin Framework provides a powerful set of tools to easily extend your application."
    }
    ```

*   `i18n/zh.json`:
    ```json
    {
      "title": "关于我们",
      "menu_label": "关于",
      "description": "这是一个通过插件动态加载的“关于”页面。",
      "framework_intro": "Web Plugin Framework 提供了一套强大的工具，可以轻松扩展你的应用。"
    }
    ```

**3. 更新页面组件 (`AboutPage.jsx`)**

组件现在使用 `useTranslation` 钩子来消费翻译文本。

```jsx
// src/plugins/about/AboutPage.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const AboutPage = () => {
  const { t } = useTranslation('about'); // 'about' 是在入口文件中注册的命名空间

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <p>{t('description')}</p>
      <p>{t('framework_intro')}</p>
    </div>
  );
};

export default AboutPage;
```

**4. 更新插件入口 (`index.js`)**

入口文件现在需要导入翻译资源，并使用 `registerI18nNamespace` API 进行注册。同时，我们也可以让菜单项的标签实现国际化。

```javascript
// src/plugins/about/index.js
import AboutPage from './AboutPage';
import en from './i18n/en.json';
import zh from './i18n/zh.json';

export default function registerAboutPlugin({ registerRoute, registerPublicMenuItem, registerI18nNamespace }) {
  // 注册国际化命名空间
  registerI18nNamespace({
    name: 'about',
    resources: {
      en: { translation: en },
      zh: { translation: zh },
    },
  });

  // 注册路由
  registerRoute({
    path: '/about',
    component: AboutPage,
  });

  // 注册菜单项，标签使用 i18n key
  registerPublicMenuItem({
    label: 'about:menu_label', // 格式: <namespace>:<key>
    path: '/about',
  });
}
```

这个例子展示了如何将一个简单的插件扩展为一个结构更清晰、支持国际化的复杂插件。

## 最佳实践

*   **保持自包含**: 插件应避免直接依赖其他插件。
*   **命名规范**: 插件目录使用小写和连字符，组件使用 `PascalCase`。
*   **国际化**: 所有面向用户的文本都应通过 `registerI18nNamespace` API 进行国际化。
*   **权限管理**: 如果插件需要权限控制，应通过 `registerPermission` API 声明所需权限。