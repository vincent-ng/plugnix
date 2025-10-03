import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { registry, registryApi } from './framework/api';
import { addPluginTranslations } from './framework/i18n';
import importAllPlugins from './plugins'; // 导入异步插件加载器

// 异步初始化应用
const initializeApp = async () => {
  try {
    // 动态加载所有插件
    const allPlugins = await importAllPlugins();
    
    // 执行所有插件的注册逻辑
    allPlugins.forEach(registerFunc => {
      registerFunc(registryApi);
    });

    // 插件注册完成后，将注册的翻译资源添加到i18n实例
    const i18nNamespaces = registry.getI18nNamespaces();
    i18nNamespaces.forEach((translations, pluginName) => {
      addPluginTranslations(pluginName, translations);
    });

    console.log('All plugins loaded and translations added.');

    // 创建根元素并渲染应用
    ReactDOM.createRoot(document.getElementById('root')).render(
      <App />
    );
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
};

// 启动应用
initializeApp();