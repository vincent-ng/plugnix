import React from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useTabs } from '@/framework/contexts/TabContext.jsx';
import TabItem from './TabItem';

const TabBar = () => {
  const { tabs, reorderTabs } = useTabs();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px antd
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = tabs.findIndex(t => t.path === active.id);
      const newIndex = tabs.findIndex(t => t.path === over.id);
      reorderTabs(oldIndex, newIndex);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={tabs.map(t => t.path)} strategy={horizontalListSortingStrategy}>
        <div className="flex h-16 border-b bg-background">
          {tabs.map(tab => (
            <TabItem key={tab.path} tab={tab} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default TabBar;