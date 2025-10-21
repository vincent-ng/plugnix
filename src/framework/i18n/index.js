import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './en.json';
import zhTranslations from './zh.json';

// 框架默认翻译 - 按照i18next的resources格式组织
const frameworkTranslations = {
  en: {
    ...enTranslations
  },
  zh: {
    ...zhTranslations
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
  // console.log(`Available namespaces:`, i18n.options.ns);
};

export default i18n;