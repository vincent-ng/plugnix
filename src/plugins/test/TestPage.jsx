import React from 'react';
import { useTranslation } from 'react-i18next';

const TestPage = () => {
  const { t } = useTranslation('test');
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8 text-center">
          {t('title')}
        </h1>
        
        {/* 颜色测试 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">{t('colorTest')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-500 text-white p-4 rounded-lg text-center">{t('colors.red')}</div>
            <div className="bg-blue-500 text-white p-4 rounded-lg text-center">{t('colors.blue')}</div>
            <div className="bg-green-500 text-white p-4 rounded-lg text-center">{t('colors.green')}</div>
            <div className="bg-yellow-500 text-white p-4 rounded-lg text-center">{t('colors.yellow')}</div>
          </div>
        </div>
        
        {/* 按钮测试 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">{t('buttonTest')}</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded transition-colors">
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
          <h2 className="text-2xl font-semibold text-foreground mb-4">{t('cardTest')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-2">{t('cardTitle')} 1</h3>
              <p className="text-muted-foreground">{t('cardContent')}</p>
            </div>
            <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-2">{t('cardTitle')} 2</h3>
              <p className="text-muted-foreground">{t('cardContent')}</p>
            </div>
            <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-2">{t('cardTitle')} 3</h3>
              <p className="text-muted-foreground">{t('cardContent')}</p>
            </div>
          </div>
        </div>
        
        {/* 表单测试 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">{t('formTest')}</h2>
          <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6 max-w-md">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('username')}
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  placeholder={t('usernamePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('password')}
                </label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  placeholder={t('passwordPlaceholder')}
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded transition-colors"
              >
                {t('submit')}
              </button>
            </form>
          </div>
        </div>
        
        {/* 动画测试 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">{t('animationTest')}</h2>
          <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6">
            <div className="flex flex-wrap gap-4">
              <div className="w-16 h-16 bg-blue-500 rounded-lg animate-pulse flex items-center justify-center text-white font-bold">
                {t('pulseAnimation')}
              </div>
              <div className="w-16 h-16 bg-green-500 rounded-lg animate-bounce flex items-center justify-center text-white font-bold">
                {t('bounceAnimation')}
              </div>
              <div className="w-16 h-16 bg-purple-500 rounded-lg animate-spin flex items-center justify-center text-white font-bold">
                {t('spinAnimation')}
              </div>
            </div>
          </div>
        </div>
        
        {/* 响应式测试 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">{t('responsiveTest')}</h2>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
            <p className="mb-4">{t('responsiveDescription')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white bg-opacity-20 p-4 rounded">
                <h4 className="font-bold">Mobile</h4>
                <p className="text-sm">1 column</p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded">
                <h4 className="font-bold">Tablet</h4>
                <p className="text-sm">2 columns</p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded">
                <h4 className="font-bold">Desktop</h4>
                <p className="text-sm">4 columns</p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded">
                <h4 className="font-bold">Large</h4>
                <p className="text-sm">4 columns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;