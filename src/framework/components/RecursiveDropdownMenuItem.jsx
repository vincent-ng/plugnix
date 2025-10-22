import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSeparator,
} from '@components/ui/dropdown-menu';
import IconRenderer from './IconRenderer.jsx';

export function RecursiveDropdownMenuItem({ item }) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  // 统一语义：route 使用 `component`；菜单项自定义渲染使用 `menuItemComponent`
  if (item.menuItemComponent) {
    const Component = item.menuItemComponent;
    return <Component item={item} />;
  }

  const handleClick = () => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const renderSeparator = (position) => {
    if (item.separator === position || item.separator === 'both') {
      return <DropdownMenuSeparator />;
    }
    return null;
  };

  if (item.children && item.children.length > 0) {
    return (
      <>
        {renderSeparator('front')}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconRenderer icon={item.icon} />
            <span>{t(item.label)}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {item.children.map((child) => (
                <RecursiveDropdownMenuItem key={child.key} item={child} />
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        {renderSeparator('end')}
      </>
    );
  }

  return (
    <>
      {renderSeparator('front')}
      <DropdownMenuItem onClick={handleClick} className={item.className}>
        <IconRenderer icon={item.icon} />
        <span>{t(item.label)}</span>
      </DropdownMenuItem>
      {renderSeparator('end')}
    </>
  );
}