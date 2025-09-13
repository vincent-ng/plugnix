import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TabsTrigger } from './ui/tabs';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { useTabs } from '../contexts/TabContext';

const TabItem = ({ tab }) => {
  const { switchTab, closeTab, activeTab } = useTabs();
  const navigate = useNavigate();

  const handleTabClick = (e) => {
    e.preventDefault();
    switchTab(tab.path);
    navigate(tab.path);
  };

  const handleCloseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeTab(tab.path);
  };

  return (
    <TabsTrigger
      value={tab.path}
      className="group relative pr-8 max-w-48"
      onClick={handleTabClick}
    >
      <span className="truncate">{tab.label}</span>
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-1 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-opacity"
        onClick={handleCloseClick}
      >
        <X className="h-3 w-3" />
      </Button>
    </TabsTrigger>
  );
};

export default TabItem;