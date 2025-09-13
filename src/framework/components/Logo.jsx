import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const Logo = ({ 
  title = 'Plugin Framework',
  subtitle = 'Modern Web Platform', 
  className = '',
  linkTo = null,
  ...props 
}) => {


  const showText = title || subtitle;

  const LogoContent = () => (
    <div className={`flex items-center gap-3 ${className}`} {...props}>
      <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
        <Sparkles className="w-4 h-4 text-primary-foreground" />
      </div>
      {showText && (
        <div className="flex flex-col">
          {title && (
            <span className="text-lg font-bold text-foreground">
              {title}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-muted-foreground -mt-1">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo}>
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
};

export default Logo;