import React, { createContext, useContext, useState, useEffect } from 'react';
import { registry } from '../api';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';

const TabContext = createContext();

export const useTabs = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabs must be used within a TabProvider');
  }
  return context;
};

export const TabProvider = ({ children }) => {
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null); // Now a tab object
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = location.pathname;

    const findTabForPath = (path) => {
      return tabs.find(tab => tab.path === path) || null;
    };

    const newActiveTab = findTabForPath(currentPath);

    if (newActiveTab?.path !== activeTab?.path) {
      setActiveTab(newActiveTab);
    }
  }, [location.pathname, tabs, activeTab?.path]);

  const openTab = ({ path, label }) => {
    const existingTab = tabs.find(tab => tab.path === path);

    if (existingTab) {
      if (activeTab?.path !== existingTab.path) {
        switchTab(existingTab);
      }
    } else {
      const route = registry.findRoute(path);
      if (route) {
        const newTab = { path, label, component: route.component };
        setTabs(prevTabs => [...prevTabs, newTab]);
        setActiveTab(newTab);
      } else {
        console.error(`[TabContext] No route found for path: ${path}`);
      }
    }
  };

  const closeTab = (path) => {
    const tabIndex = tabs.findIndex(tab => tab.path === path);
    if (tabIndex === -1) return;

    const newTabs = tabs.filter(tab => tab.path !== path);

    if (activeTab?.path === path) {
      const newActiveTab = newTabs.length > 0
        ? (newTabs[tabIndex] || newTabs[tabIndex - 1] || newTabs[0])
        : null;

      setActiveTab(newActiveTab);
      if (newActiveTab) {
        navigate(newActiveTab.path);
      } else {
        navigate('/admin');
      }
    }
    setTabs(newTabs);
  };

  const reorderTabs = (fromIndex, toIndex) => {
    setTabs(prevTabs => {
      const newTabs = Array.from(prevTabs);
      const [movedTab] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, movedTab);
      return newTabs;
    });
  };

  const switchTab = (tab) => {
    if (tab && tab.path !== activeTab?.path) {
      setActiveTab(tab);
      navigate(tab.path);
    }
  };

  const isTabActive = (tab) => {
    if (!activeTab || !tab) return false;
    return activeTab.path === tab.path;
  };

  const value = {
    tabs,
    activeTab,
    openTab,
    closeTab,
    reorderTabs,
    switchTab,
    isTabActive,
  };

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
};