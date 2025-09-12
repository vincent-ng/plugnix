import React from 'react';
import { useTranslation } from 'react-i18next';

const TestPage = () => {
  const { t } = useTranslation('test');
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          {t('title')}
        </h1>
        
        {/* 颜色测试 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('colorTest')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-500 text-white p-4 rounded-lg text-center">{t('colors.red')}</div>
            <div className="bg-blue-500 text-white p-4 rounded-lg text-center">{t('colors.blue')}</div>
            <div className="bg-green-500 text-white p-4 rounded-lg text-center">{t('colors.green')}</div>
            <div className="bg-yellow-500 text-white p-4 rounded-lg text-center">{t('colors.yellow')}</div>
          </div>
        </div>
        
        {/* 按钮测试 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('buttonTest')}</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
              {t('buttons.primary')}
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors">
              {t('buttons.secondary')}
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors">
              {t('buttons.success')}
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors">
              {t('buttons.danger')}
            </button>
          </div>
        </div>
        
        {/* 卡片测试 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('cardTest')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('cardTitle')} 1</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('cardContent')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('cardTitle')} 2</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('cardContent')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('cardTitle')} 3</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('cardContent')}</p>
            </div>
          </div>
        </div>
        
        {/* 表单测试 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('formTest')}</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('username')}
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={t('usernamePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('password')}
                </label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={t('passwordPlaceholder')}
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                {t('submit')}
              </button>
            </form>
          </div>
        </div>
        
        {/* 动画测试 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('animationTest')}</h2>
          <div className="flex flex-wrap gap-4">
            <div className="animate-pulse bg-blue-500 text-white p-4 rounded-lg">{t('pulseAnimation')}</div>
             <div className="animate-bounce bg-green-500 text-white p-4 rounded-lg">{t('bounceAnimation')}</div>
             <div className="animate-spin bg-red-500 text-white p-4 rounded-lg">{t('spinAnimation')}</div>
          </div>
        </div>
        
        {/* 响应式测试 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('responsiveTest')}</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('responsiveDescription')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="bg-purple-500 text-white p-3 rounded text-center">1</div>
              <div className="bg-purple-500 text-white p-3 rounded text-center">2</div>
              <div className="bg-purple-500 text-white p-3 rounded text-center">3</div>
              <div className="bg-purple-500 text-white p-3 rounded text-center">4</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;