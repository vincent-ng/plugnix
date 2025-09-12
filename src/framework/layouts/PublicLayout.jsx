import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { registry } from '../api';

const PublicLayout = () => {
  const { t, i18n } = useTranslation('common');
  const { theme, toggleTheme } = useTheme();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const menuItems = registry.getPublicMenuItems();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航栏 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
                Plugin Framework
              </Link>
            </div>

            {/* 导航菜单 */}
            <nav className="hidden md:flex space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium"
                >
                  {t(item.label)}
                </Link>
              ))}
            </nav>

            {/* 右侧菜单 */}
            <div className="flex items-center space-x-4">
              {/* 语言切换 */}
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => changeLanguage('zh')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    i18n.language === 'zh'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {t('chinese')}
                </button>
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    i18n.language === 'en'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {t('english')}
                </button>
              </div>

              {/* 主题切换 */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>

              {/* 登录按钮 */}
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {t('auth:signIn')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main>
        <Outlet />
      </main>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>&copy; 2024 Plugin Framework. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;