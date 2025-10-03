import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTabs } from '@/framework/contexts/TabContext.jsx';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/ui/button';
import { X } from 'lucide-react';

const TabItem = ({ tab }) => {
  const { t } = useTranslation();
  const { isTabActive, switchTab, closeTab } = useTabs();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: tab.path });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center px-4 py-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap 
        ${
          isTabActive(tab)
            ? 'border-primary text-primary bg-muted'
            : 'text-muted-foreground'
        }`}
      onClick={() => switchTab(tab)}
    >
      {t(tab.label)}
      <Button
        variant="ghost"
        size="icon"
        className="w-6 h-6 ml-2 rounded-full hover:bg-muted"
        onClick={(e) => {
          e.stopPropagation();
          closeTab(tab.path);
        }}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default TabItem;