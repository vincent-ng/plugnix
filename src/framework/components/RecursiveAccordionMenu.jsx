import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/framework/components/ui/accordion";
import { Separator } from "@/framework/components/ui/separator";

const RecursiveAccordionMenuItem = ({ item, renderItem }) => {
  const { t } = useTranslation();

  const renderSeparator = (position) => {
    if (item.separator === position || item.separator === 'both') {
      return <Separator className="my-1" />;
    }
    return null;
  };

  if (item.children && item.children.length > 0) {
    return (
      <>
        {renderSeparator('front')}
        <AccordionItem value={item.key} className="border-b-0">
          <AccordionTrigger className="py-3 hover:no-underline text-sm font-medium">
            {t(item.label)}
          </AccordionTrigger>
          <AccordionContent className="pl-4">
            <div className="space-y-2">
              {item.children.map((child) => (
                <RecursiveAccordionMenuItem key={child.key} item={child} renderItem={renderItem} />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        {renderSeparator('end')}
      </>
    );
  }

  return (
    <>
      {renderSeparator('front')}
      {renderItem(item)}
      {renderSeparator('end')}
    </>
  );
};

export const RecursiveAccordionMenu = ({ menuItems, renderItem }) => {
  return (
    <Accordion type="multiple" defaultValue={menuItems.map((item) => item.key)} className="w-full">
      {menuItems.map((item) => (
        <RecursiveAccordionMenuItem key={item.key} item={item} renderItem={renderItem} />
      ))}
    </Accordion>
  );
};
