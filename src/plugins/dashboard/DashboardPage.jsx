import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
  const { t } = useTranslation('dashboard');
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('menu.title')}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card text-card-foreground p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">{t('welcome.title')}</h2>
          <p className="text-muted-foreground">{t('welcome.description')}</p>
        </div>
        
        <div className="bg-card text-card-foreground p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">{t('plugin_system.title')}</h2>
          <p className="text-muted-foreground">{t('plugin_system.description')}</p>
        </div>
        
        <div className="bg-card text-card-foreground p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">{t('theme_switching.title')}</h2>
          <p className="text-muted-foreground">{t('theme_switching.description')}</p>
        </div>
      </div>
    </div>
  );
}