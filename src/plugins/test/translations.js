// Test插件的翻译文件
export default {
  en: {
    title: 'Test Page',
    colorTest: 'Color Test',
    buttonTest: 'Button Test',
    cardTest: 'Card Test',
    colors: {
      red: 'Red',
      blue: 'Blue',
      green: 'Green',
      yellow: 'Yellow',
      purple: 'Purple',
      pink: 'Pink'
    },
    buttons: {
      primary: 'Primary Button',
      secondary: 'Secondary Button',
      success: 'Success Button',
      danger: 'Danger Button',
      warning: 'Warning Button',
      info: 'Info Button'
    },
    cards: {
      card1: {
        title: 'Card Title 1',
        content: 'This is the first card content, used to display some information or operations.'
      },
      card2: {
        title: 'Card Title 2',
        content: 'This is the second card content, showcasing different information.'
      },
      card3: {
        title: 'Card Title 3',
        content: 'This is the third card content, demonstrating various use cases.'
      }
    },
    formTest: 'Form Test',
    username: 'Username',
    password: 'Password',
    usernamePlaceholder: 'Please enter username',
    passwordPlaceholder: 'Please enter password',
    submit: 'Submit',
    animationTest: 'Animation Test',
    pulseAnimation: 'Pulse Animation',
    bounceAnimation: 'Bounce Animation',
    spinAnimation: 'Spin Animation',
    responsiveTest: 'Responsive Test',
    responsiveDescription: 'This container will behave differently on different screen sizes:',
    responsive: {
      mobile: 'Mobile',
      tablet: 'Tablet',
      desktop: 'Desktop',
      large: 'Large',
      oneColumn: '1 column',
      twoColumns: '2 columns',
      fourColumns: '4 columns'
    },
    tabs: {
      basic: 'Basic Tests',
      state: 'State Tests',
      animation: 'Animation Tests',
      permission: 'Permission Tests'
    },
    stateTest: {
      title: 'Tab State Persistence Test',
      description: 'This section tests whether form inputs and component state are preserved when switching between tabs.',
      formTest: 'Form Input Test',
      inputLabel: 'Text Input',
      inputPlaceholder: 'Enter some text...',
      textareaLabel: 'Textarea Input',
      textareaPlaceholder: 'Enter a longer message...',
      counterTest: 'Counter Test',
      counterDescription: 'Click the buttons to change the counter, then switch tabs to see if the value persists.',
      reset: 'Reset',
      currentValue: 'Current value',
      empty: '(empty)',
      instruction: 'How to test: Fill out the inputs above, change the counter, then switch to another tab and come back. All values should be preserved.'
    },
    permission: {
      title: 'Permission System Demo',
      description: 'Demonstrate basic features of the permission system',
      uiPermission: 'UI Permission Control',
      specialFeature: 'Special Feature',
      specialFeatureDesc: 'This content is only visible to users with the ui.test.show-special-feature permission',
      dbPermission: 'Database Permission Control',
      createPost: 'Create Post (requires db.posts.create permission)',
      fallbackContent: 'Fallback Content When No Permission',
      noPermissionMessage: 'You do not have permission to access this feature',
      adminFunction: 'Admin Function'
    },
    urlNavigation: {
      buttonText: 'URL Navigation Test',
      title: 'URL Navigation & Component Rendering',
      backToTest: 'Back to Test Page',
      predefined: {
        title: 'Predefined Examples',
        description: 'Click the buttons below to navigate to different components'
      },
      custom: {
        title: 'Custom URL Navigation',
        description: 'Enter any URL to navigate to it',
        inputLabel: 'URL or Path',
        inputPlaceholder: 'e.g., /dashboard or https://example.com',
        navigateButton: 'Navigate',
        examples: {
          title: 'Examples:'
        }
      },
      examples: {
        dashboard: 'Dashboard Component',
        dashboardDesc: 'Shows a sample dashboard with statistics',
        profile: 'Profile Component',
        profileDesc: 'Displays user profile information',
        settings: 'Settings Component',
        settingsDesc: 'Shows application settings panel'
      },
      components: {
        default: {
          title: 'Default Component',
          description: 'This is the default component that renders when no specific component is requested',
          content: 'You can pass URL parameters to control what component gets rendered on this page.',
          sourceUrl: 'Source URL'
        },
        dashboard: {
          title: 'Dashboard Overview',
          description: 'A sample dashboard showing key metrics and statistics',
          stats: {
            users: 'Total Users',
            orders: 'Orders',
            revenue: 'Revenue'
          }
        },
        profile: {
          title: 'User Profile',
          description: 'User profile information and settings',
          fields: {
            name: 'Full Name',
            role: 'Role'
          }
        },
        settings: {
          title: 'Application Settings',
          description: 'Configure your application preferences',
          options: {
            notifications: 'Email Notifications',
            notificationsDesc: 'Receive email notifications for important updates',
            darkMode: 'Dark Mode',
            darkModeDesc: 'Switch between light and dark themes'
          },
          actions: {
            toggle: 'Toggle'
          }
        }
      }
    },
    notificationTest: {
      title: 'Notification Center Test',
      description: 'Use this page to test the notification center functionality. Sent notifications will appear in the notification bell in the top right corner.',
      level: 'Notification Level',
      source: 'Source',
      message: 'Message Content',
      includeActionButton: 'Include Action Button',
      sendNotification: 'Send Notification',
      sendMultipleNotifications: 'Send Multiple Test Notifications',
      placeholder: {
        selectLevel: 'Select notification level',
        source: 'Notification source',
        title: 'Notification title',
        message: 'Notification message content'
      },
      levels: {
        info: 'Info',
        success: 'Success',
        warning: 'Warning',
        error: 'Error'
      },
      testNotifications: {
        info: {
          title: 'Test Info Notification',
          message: 'This is an example of an info notification'
        },
        success: {
          title: 'Test Success Notification',
          message: 'The operation has been completed successfully'
        },
        warning: {
          title: 'Test Warning Notification',
          message: 'Please note, this may require your attention'
        },
        error: {
          title: 'Test Error Notification',
          message: 'An error has occurred, please check your operation'
        }
      },
      eventReceived: 'View details event received, ID: {{id}}'
    },
    errorBoundary: {
      tab: 'Error Boundary Tests',
      renderButton: 'Trigger render-phase error',
      handlerButton: 'Trigger event handler error',
      asyncButton: 'Trigger async error (setTimeout)',
      renderDesc: 'This error is thrown during render and is caught by the nearest error boundary.',
      handlerDesc: 'Errors in event handlers are not caught by error boundaries; use try/catch.',
      asyncDesc: 'Async errors (setTimeout, promises) are not caught; use global handling or state-driven render.'
    }
  },
  zh: {
    title: '测试页',
    colorTest: '颜色测试',
    buttonTest: '按钮测试',
    cardTest: '卡片测试',
    colors: {
      red: '红色',
      blue: '蓝色',
      green: '绿色',
      yellow: '黄色',
      purple: '紫色',
      pink: '粉色'
    },
    buttons: {
      primary: '主要按钮',
      secondary: '次要按钮',
      success: '成功按钮',
      danger: '危险按钮',
      warning: '警告按钮',
      info: '信息按钮'
    },
    cards: {
      card1: {
        title: '卡片标题 1',
        content: '这是第一个卡片内容，用于显示一些信息或操作。'
      },
      card2: {
        title: '卡片标题 2',
        content: '这是第二个卡片内容，展示不同的信息。'
      },
      card3: {
        title: '卡片标题 3',
        content: '这是第三个卡片内容，演示各种用例。'
      }
    },
    formTest: '表单测试',
    username: '用户名',
    password: '密码',
    usernamePlaceholder: '请输入用户名',
    passwordPlaceholder: '请输入密码',
    submit: '提交',
    animationTest: '动画测试',
    pulseAnimation: '脉冲动画',
    bounceAnimation: '弹跳动画',
    spinAnimation: '旋转动画',
    responsiveTest: '响应式测试',
    responsiveDescription: '这个容器在不同屏幕尺寸下会有不同的表现：',
    responsive: {
      mobile: '移动端',
      tablet: '平板端',
      desktop: '桌面端',
      large: '大屏幕',
      oneColumn: '1列',
      twoColumns: '2列',
      fourColumns: '4列'
    },
    tabs: {
      basic: '基础测试',
      state: '状态测试',
      animation: '动画测试',
      permission: '权限测试'
    },
    stateTest: {
      title: 'Tab状态保持测试',
      description: '此部分测试在切换标签页时表单输入和组件状态是否被保留。',
      formTest: '表单输入测试',
      inputLabel: '文本输入',
      inputPlaceholder: '请输入一些文本...',
      textareaLabel: '文本域输入',
      textareaPlaceholder: '请输入较长的消息...',
      counterTest: '计数器测试',
      counterDescription: '点击按钮改变计数器，然后切换标签页查看数值是否保持。',
      reset: '重置',
      currentValue: '当前值',
      empty: '(空)',
      instruction: '测试方法：填写上面的输入框，改变计数器，然后切换到其他标签页再回来。所有数值都应该被保留。'
    },
    permission: {
      title: '权限系统演示',
      description: '演示权限系统的基本功能',
      uiPermission: 'UI权限控制',
      specialFeature: '特殊功能',
      specialFeatureDesc: '这个内容只有拥有 ui.test.show-special-feature 权限的用户才能看到',
      dbPermission: '数据库权限控制',
      createPost: '创建文章 (需要 db.posts.create 权限)',
      fallbackContent: '无权限时的回退内容',
      noPermissionMessage: '您没有访问此功能的权限',
      adminFunction: '管理员功能'
    },
    urlNavigation: {
      buttonText: 'URL导航测试',
      title: 'URL导航与组件渲染',
      backToTest: '返回测试页面',
      predefined: {
        title: '预定义示例',
        description: '点击下方按钮导航到不同的组件'
      },
      custom: {
        title: '自定义URL导航',
        description: '输入任意URL进行导航',
        inputLabel: 'URL或路径',
        inputPlaceholder: '例如：/dashboard 或 https://example.com',
        navigateButton: '导航',
        examples: {
          title: '示例：'
        }
      },
      examples: {
        dashboard: '仪表板组件',
        dashboardDesc: '显示包含统计数据的示例仪表板',
        profile: '个人资料组件',
        profileDesc: '显示用户个人资料信息',
        settings: '设置组件',
        settingsDesc: '显示应用程序设置面板'
      },
      components: {
        default: {
          title: '默认组件',
          description: '这是在没有请求特定组件时渲染的默认组件',
          content: '您可以通过URL参数来控制此页面渲染哪个组件。',
          sourceUrl: '来源URL'
        },
        dashboard: {
          title: '仪表板概览',
          description: '显示关键指标和统计数据的示例仪表板',
          stats: {
            users: '总用户数',
            orders: '订单数',
            revenue: '收入'
          }
        },
        profile: {
          title: '用户资料',
          description: '用户资料信息和设置',
          fields: {
            name: '全名',
            role: '角色'
          }
        },
        settings: {
          title: '应用程序设置',
          description: '配置您的应用程序偏好设置',
          options: {
            notifications: '邮件通知',
            notificationsDesc: '接收重要更新的邮件通知',
            darkMode: '深色模式',
            darkModeDesc: '在浅色和深色主题之间切换'
          },
          actions: {
            toggle: '切换'
          }
        }
      }
    },
    notificationTest: {
      title: '通知中心测试',
      description: '使用此页面测试通知中心功能。发送的通知将显示在右上角的通知铃铛中。',
      level: '通知级别',
      source: '来源',
      message: '消息内容',
      includeActionButton: '包含操作按钮',
      sendNotification: '发送通知',
      sendMultipleNotifications: '发送多个测试通知',
      placeholder: {
        selectLevel: '选择通知级别',
        source: '通知来源',
        title: '通知标题',
        message: '通知消息内容'
      },
      levels: {
        info: '信息',
        success: '成功',
        warning: '警告',
        error: '错误'
      },
      testNotifications: {
        info: {
          title: '测试信息通知',
          message: '这是一个信息通知的示例'
        },
        success: {
          title: '测试成功通知',
          message: '操作已成功完成'
        },
        warning: {
          title: '测试警告通知',
          message: '请注意，这可能需要您的关注'
        },
        error: {
          title: '测试错误通知',
          message: '发生了一个错误，请检查您的操作'
        }
      },
      eventReceived: '收到查看详情事件，ID: {{id}}'
    },
    errorBoundary: {
      tab: '错误边界测试',
      renderButton: '触发渲染阶段错误',
      handlerButton: '触发事件处理错误（不被边界捕获）',
      asyncButton: '触发异步错误（setTimeout）',
      renderDesc: '该错误在渲染期间抛出，可被最近的错误边界捕获。',
      handlerDesc: '事件处理中的错误不会被错误边界捕获，请使用 try/catch。',
      asyncDesc: '异步错误（setTimeout、Promise）不会被错误边界捕获；可通过状态驱动在渲染期抛错或使用全局错误处理。'
    }
  }
};