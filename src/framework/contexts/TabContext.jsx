import React, { createContext, useContext, useState, useEffect } from 'react';
import { registry } from '../api';
import { matchPath, useLocation } from 'react-router-dom';

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
  const location = useLocation();

  // 当路由变化时，同步更新activeTab
  useEffect(() => {
    const currentPath = location.pathname;

    // 检查是否有完全匹配的已打开标签页
    const directMatch = tabs.find(tab => tab.path === currentPath);
    if (directMatch) {
      setActiveTab(directMatch.path);
      return;
    }

    // 如果没有完全匹配的，尝试寻找动态路由匹配
    const dynamicMatch = tabs.find(tab => {
      const route = registry.getRoute(tab.path);
      return route && matchPath(route.path, currentPath);
    });

    if (dynamicMatch) {
      setActiveTab(dynamicMatch.path);
    }
    // 如果都找不到，可能是个全新的页面，openTab会处理

  }, [location.pathname, tabs]);


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
      let route = routes.find(r => r.path === path);

      if (!route) {
        for (const r of routes) {
          if (matchPath(r.path, path)) {
            route = r;
            break;
          }
        }
      }
      
      if (route) {
        // 创建新Tab，包含组件引用
        const newTab = {
          path,
          label,
          component: route.component
        };
        
        setTabs(prevTabs => [...prevTabs, newTab]);
        setActiveTab(path);
      } else {
        console.error(`[TabContext] No route found for path: ${path}`);
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
    // switchTab 应该只更新 activeTab 状态，而不触发导航
    // 导航应该由点击Tab时的Link组件处理
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