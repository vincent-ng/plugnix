import { useTranslation } from 'react-i18next';
import { Button } from '@components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { Globe, ChevronDown } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation('common');
  const changeLanguage = (lng) => i18n.changeLanguage(lng);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{i18n.language.startsWith('zh') ? '中文' : 'EN'}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('zh')} className={i18n.language === 'zh' ? 'bg-accent' : ''}>中文</DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('en')} className={i18n.language === 'en' ? 'bg-accent' : ''}>English</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};