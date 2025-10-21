import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * 自定义Logo组件
 * 支持根据layout参数显示不同的样式和文本
 */
const CustomLogo = ({
  layout, // 'admin' 或 'public'
  ...props
}) => {
  const { t } = useTranslation();

  const titleKey = layout === 'admin' ? 'logo:admin.title' : 'logo:public.title';
  const subtitleKey = layout === 'admin' ? 'logo:admin.subtitle' : 'logo:public.subtitle';
  const layoutClassName = layout === 'admin'
    ? 'bg-gradient-to-br from-green-500 to-teal-600'
    : 'bg-gradient-to-br from-blue-500 to-purple-600'
  const IconComponent = layout === 'admin' ? Sparkles : Zap;

  return (
    <Link to='/'>
      <div className={`flex items-center gap-3`} {...props}>
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${layoutClassName}`}>
          <IconComponent className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className={`font-bold text-lg text-foreground`}>
            {t(titleKey)}
          </span>
          <span className="text-xs text-muted-foreground -mt-1">
            {t(subtitleKey)}
          </span>
        </div>
      </div>
    </Link>
  );

};

export default CustomLogo;