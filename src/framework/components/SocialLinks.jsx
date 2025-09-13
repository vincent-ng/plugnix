import React from 'react';
import { Button } from '@components/ui/button';
import { Github, Twitter } from 'lucide-react';

const SocialLinks = ({ 
  className = '',
  size = 'icon',
  variant = 'ghost',
  showLabels = false,
  ...props 
}) => {
  const socialItems = [
    {
      name: 'GitHub',
      icon: Github,
      href: '#', // 这里可以配置实际的链接
      label: 'GitHub'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: '#', // 这里可以配置实际的链接
      label: 'Twitter'
    }
  ];

  return (
    <div className={`flex gap-2 ${className}`} {...props}>
      {socialItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.name}
            variant={variant}
            size={size}
            className="w-8 h-8"
            asChild
          >
            <a 
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.label}
            >
              <Icon className="w-4 h-4" />
              {showLabels && (
                <span className="ml-2">{item.label}</span>
              )}
            </a>
          </Button>
        );
      })}
    </div>
  );
};

export default SocialLinks;