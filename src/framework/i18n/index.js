import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 框架默认翻译 - 按照i18next的resources格式组织
const frameworkTranslations = {
  en: {
    common: {
      appPublicTitle: 'ModularHub',
      appPublicSubtitle: 'Plugin-Driven Web Framework',
      appAdminTitle: 'ModularHub Admin',
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
      english: 'English',
      chinese: '中文'
    },
    navigation: {
      dashboard: 'Dashboard',
      settings: 'Settings',
      profile: 'Profile'
    },
  },
  zh: {
    common: {
      appPublicTitle: 'ModularHub',
      appPublicSubtitle: '插件驱动的Web框架',
      appAdminTitle: 'ModularHub后台',
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
      english: 'English',
      chinese: '中文'
    },
    navigation: {
      dashboard: '仪表板',
      settings: '设置',
      profile: '个人资料'
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