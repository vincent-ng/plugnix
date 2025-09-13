import React, { createContext, useContext, useState } from 'react';
import { registry } from '../api';

// 创建Tab上下文
const TabContext = createContext();

// 自定义Hook用于使用Tab上下文
export const useTabs = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabs must be used within a TabProvider');
  }
  return context;
};

// Tab Provider组件
export const TabProvider = ({ children }) => {
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  // 打开新Tab或切换到已存在的Tab
  const openTab = ({ path, label }) => {
    // 检查Tab是否已存在
    const existingTab = tabs.find(tab => tab.path === path);
    
    if (existingTab) {
      // 如果Tab已存在，切换到该Tab
      setActiveTab(path);
    } else {
      // 从registry获取路由信息
      const routes = registry.getRoutes();
      const route = routes.find(r => r.path === path);
      
      if (route) {
        // 创建新Tab，包含组件引用
        const newTab = {
          path,
          label,
          component: route.component
        };
        
        setTabs(prevTabs => [...prevTabs, newTab]);
        setActiveTab(path);
      }
    }
  };

  const closeTab = (path) => {
    setTabs(prevTabs => {
      const tabIndex = prevTabs.findIndex(tab => tab.path === path);
      if (tabIndex === -1) return prevTabs;

      const newTabs = prevTabs.filter(tab => tab.path !== path);

      // If the closed tab was the active one, switch to another tab
      if (activeTab === path) {
        if (newTabs.length > 0) {
          // Switch to the previous tab or the first one
          const newActivePath = newTabs[tabIndex - 1]?.path || newTabs[0]?.path;
          setActiveTab(newActivePath);
        } else {
          setActiveTab(null); // No tabs left
        }
      }

      return newTabs;
    });
  };

  const switchTab = (path) => {
    setActiveTab(path);
  };

  const value = {
    tabs,
    activeTab,
    openTab,
    closeTab,
    switchTab,
  };

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
};