import * as lucideIcons from 'lucide-react';

const IconRenderer = ({ icon, className = 'h-4 w-4' }) => {
  if (!icon) return null;

  if (typeof icon === 'string') {
    const IconComponent = lucideIcons[icon];
    return IconComponent ? <IconComponent className={className} /> : null;
  }

  // Assuming it's a component
  const IconComponent = icon;
  return <IconComponent className={className} />;
};

export default IconRenderer;