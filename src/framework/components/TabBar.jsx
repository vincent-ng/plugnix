import React from 'react';
import { Tabs, TabsList } from './ui/tabs';
import TabItem from './TabItem';
import { useTabs } from '../contexts/TabContext';

const TabBar = () => {
  const { tabs, activeTab } = useTabs();

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="border-b bg-background">
      <Tabs value={activeTab} className="w-full">
        <TabsList className="h-auto p-0 bg-transparent justify-start rounded-none border-0">
          {tabs.map((tab) => (
            <TabItem key={tab.path} tab={tab} />
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TabBar;