import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { registryApi } from '@/framework/api';

// 可复用的默认Logo组件，用于布局中
const DefaultLogo = ({ layout, ...props }) => {
  const { t } = useTranslation();
  const LogoComponent = registryApi.getLogo()?.component;

  if (LogoComponent) {
    return <LogoComponent layout={layout} {...props} />;
  }

  // 如果没有注册的Logo组件，返回一个简单的文本Logo
  const LogoContent = () => (
    <div className="flex items-center gap-2" {...props}>
      <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
        <Sparkles className="w-4 h-4 text-primary-foreground" />
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold text-foreground">
          {t(title)}
        </span>
        <span className="text-xs text-muted-foreground -mt-1">
          {t(subtitle)}
        </span>
      </div>
    </div>
  );

  return (
    <Link to='/'>
      <LogoContent />
    </Link>
  );
};

export { DefaultLogo };
export default DefaultLogo;