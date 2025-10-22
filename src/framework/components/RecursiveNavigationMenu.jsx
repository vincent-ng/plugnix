import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/framework/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/framework/components/ui/dropdown-menu';
import { Button } from '@/framework/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { RecursiveDropdownMenuItem } from './RecursiveDropdownMenuItem';

const RecursiveNavigationMenuItem = ({ item, isActiveRoute, getNavLinkClassName }) => {
  const { t } = useTranslation('common');

  if (item.children && item.children.length > 0) {
    return (
      <NavigationMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={`${navigationMenuTriggerStyle()} gap-1`}>
              {t(item.label)}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {item.children.map((child) => (
              <RecursiveDropdownMenuItem key={child.key} item={child} />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild>
        <Link to={item.path} className={getNavLinkClassName(isActiveRoute(item.path))}>
          {t(item.label)}
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

export const RecursiveNavigationMenu = ({ menuItems, isActiveRoute, getNavLinkClassName }) => {
  return (
    <>
      {menuItems.map((item) => (
        <RecursiveNavigationMenuItem
          key={item.key}
          item={item}
          getNavLinkClassName={getNavLinkClassName}
          isActiveRoute={isActiveRoute}
        />
      ))}
    </>
  );
};
