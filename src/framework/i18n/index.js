import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 框架默认翻译 - 按照i18next的resources格式组织
const frameworkTranslations = {
  en: {
    common: {
      appPublicTitle: 'Plugnix',
      appPublicSubtitle: 'Plugin-Driven Web Framework',
      appAdminTitle: 'Plugnix Admin',
      appAdminSubtitle: 'Plugin Management Console',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      view: 'View',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      home: 'Home',
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      getStarted: 'Get Started',
      learnMore: 'Learn More',
      or: 'or',
      createAccount: 'Create New Account',
      backToHome: 'Back to Home',
      language: 'Language',
      switchLanguage: 'Switch Language',
      myAccount: 'My Account',
      english: 'English',
      chinese: '中文',
      appDescription: 'A modern, extensible web application framework built with React and powered by plugins. Create scalable applications with ease.',
      quickLinks: 'Quick Links',
      connect: 'Connect',
      socialLinks: 'Social Links',
      copyright: '© 2024 Plugin Framework. All rights reserved.',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      gotoConsole: 'Console'
    },
    navigation: {
      dashboard: 'Dashboard',
      settings: 'Settings',
      profile: 'Profile'
    },
    group: {
      selectGroup: 'Select Group',
      personalWorkspace: 'Personal Workspace',
      noGroupsFound: 'No groups found',
      createNewGroup: 'Create New Group',
      createGroup: 'Create Group',
      createGroupDescription: 'Create a new group to collaborate with others.',
      groupName: 'Group Name',
      groupDescription: 'Description',
      creating: 'Creating...',
      create: 'Create',
      groupCreatedSuccessfully: 'Group created successfully!',
      errorCreatingGroup: 'Error creating group'
    },
    tabs: {
      welcome: 'Welcome to the admin panel. Please select a menu item to get started.',
      noTabsOpen: 'No tabs are currently open'
    },
  },
  zh: {
    common: {
      appPublicTitle: 'Plugnix',
      appPublicSubtitle: '插件驱动的Web框架',
      appAdminTitle: 'Plugnix后台',
      appAdminSubtitle: '插件管理控制台',
      loading: '加载中...',
      error: '错误',
      success: '成功',
      cancel: '取消',
      confirm: '确认',
      view: '查看',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      add: '添加',
      search: '搜索',
      home: '首页',
      login: '登录',
      logout: '退出',
      register: '注册',
      getStarted: '开始使用',
      learnMore: '了解更多',
      or: '或者',
      createAccount: '创建新账户',
      backToHome: '← 返回首页',
      language: '语言',
      switchLanguage: '切换语言',
      myAccount: '我的账户',
      english: 'English',
      chinese: '中文',
      appDescription: '基于 React 构建的现代化、可扩展的 Web 应用框架，由插件驱动。轻松创建可扩展的应用程序。',
      quickLinks: '快速链接',
      connect: '联系我们',
      socialLinks: '社交链接',
      copyright: '© 2024 插件框架。保留所有权利。',
      privacyPolicy: '隐私政策',
      termsOfService: '服务条款',
      gotoConsole: '控制台'
    },
    navigation: {
      dashboard: '仪表板',
      settings: '设置',
      profile: '个人资料'
    },
    group: {
      selectGroup: '选择组',
      personalWorkspace: '个人工作区',
      noGroupsFound: '未找到任何组',
      createNewGroup: '创建新组',
      createGroup: '创建组',
      createGroupDescription: '创建一个新组以便与他人协作。',
      groupName: '组名称',
      groupDescription: '描述',
      creating: '创建中...',
      create: '创建',
      groupCreatedSuccessfully: '组创建成功！',
      errorCreatingGroup: '创建组时出错'
    },
    tabs: {
      welcome: '欢迎使用管理面板。请选择菜单项开始使用。',
      noTabsOpen: '当前没有打开的标签页'
    },
  }
};

// 初始化 i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: frameworkTranslations,
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    ns: [...Object.keys(frameworkTranslations.en)],
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

// 添加插件翻译的函数
export const addPluginTranslations = (pluginName, translations) => {
  if (!translations || typeof translations !== 'object') {
    console.warn(`Invalid translations for plugin ${pluginName}:`, translations);
    return;
  }
  
  Object.keys(translations).forEach(lang => {
    if (!i18n.hasResourceBundle(lang, pluginName)) {
      i18n.addResourceBundle(lang, pluginName, translations[lang]);
    }
  });
  console.log(`Available namespaces:`, i18n.options.ns);
};

export default i18n;