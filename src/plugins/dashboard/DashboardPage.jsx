import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
  const { t } = useTranslation('dashboard');
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t('menu.title')}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('welcome.title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('welcome.description')}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('plugin_system.title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('plugin_system.description')}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('theme_switching.title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('theme_switching.description')}
          </p>
        </div>
      </div>
    </div>
  );
}