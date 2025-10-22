import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/framework/components/ui/button';
import { Input } from '@/framework/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { ArrowLeft, ExternalLink, Globe } from 'lucide-react';

const UrlNavigationPage = () => {
  const { t } = useTranslation('test');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [customUrl, setCustomUrl] = useState('');

  // 从URL参数获取要渲染的组件类型
  const componentType = searchParams.get('component') || 'default';
  const sourceUrl = searchParams.get('from') || '';

  // 预定义的一些示例URL和组件
  const predefinedUrls = [
    { 
      label: t('urlNavigation.examples.dashboard'), 
      url: '/test/url-navigation?component=dashboard',
      description: t('urlNavigation.examples.dashboardDesc')
    },
    { 
      label: t('urlNavigation.examples.profile'), 
      url: '/test/url-navigation?component=profile',
      description: t('urlNavigation.examples.profileDesc')
    },
    { 
      label: t('urlNavigation.examples.settings'), 
      url: '/test/url-navigation?component=settings',
      description: t('urlNavigation.examples.settingsDesc')
    }
  ];

  // 根据componentType渲染不同的组件内容
  const renderDynamicComponent = () => {
    switch (componentType) {
      case 'dashboard':
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('urlNavigation.components.dashboard.title')}
              </CardTitle>
              <CardDescription>
                {t('urlNavigation.components.dashboard.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                    {t('urlNavigation.components.dashboard.stats.users')}
                  </h4>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">1,234</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200">
                    {t('urlNavigation.components.dashboard.stats.orders')}
                  </h4>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-300">567</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200">
                    {t('urlNavigation.components.dashboard.stats.revenue')}
                  </h4>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">$12,345</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'profile':
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t('urlNavigation.components.profile.title')}</CardTitle>
              <CardDescription>
                {t('urlNavigation.components.profile.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    JD
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">John Doe</h3>
                    <p className="text-muted-foreground">john.doe@example.com</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <label className="text-sm font-medium">{t('urlNavigation.components.profile.fields.name')}</label>
                    <p className="text-foreground">John Doe</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t('urlNavigation.components.profile.fields.role')}</label>
                    <p className="text-foreground">Administrator</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'settings':
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t('urlNavigation.components.settings.title')}</CardTitle>
              <CardDescription>
                {t('urlNavigation.components.settings.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{t('urlNavigation.components.settings.options.notifications')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('urlNavigation.components.settings.options.notificationsDesc')}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    {t('urlNavigation.components.settings.actions.toggle')}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{t('urlNavigation.components.settings.options.darkMode')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('urlNavigation.components.settings.options.darkModeDesc')}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    {t('urlNavigation.components.settings.actions.toggle')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t('urlNavigation.components.default.title')}</CardTitle>
              <CardDescription>
                {t('urlNavigation.components.default.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('urlNavigation.components.default.content')}
              </p>
              {sourceUrl && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>{t('urlNavigation.components.default.sourceUrl')}:</strong> {sourceUrl}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
    }
  };

  const handleCustomNavigation = () => {
    if (customUrl.trim()) {
      // 如果是外部链接，在新窗口打开
      if (customUrl.startsWith('http://') || customUrl.startsWith('https://')) {
        window.open(customUrl, '_blank');
      } else {
        // 内部路由跳转
        navigate(customUrl);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/test')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('urlNavigation.backToTest')}
        </Button>

        <h1 className="text-4xl font-bold text-foreground mb-8 text-center">
          {t('urlNavigation.title')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：预定义示例 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('urlNavigation.predefined.title')}</CardTitle>
              <CardDescription>
                {t('urlNavigation.predefined.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {predefinedUrls.map((item, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.label}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => navigate(item.url)}
                      className="ml-3"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 右侧：自定义URL输入 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('urlNavigation.custom.title')}</CardTitle>
              <CardDescription>
                {t('urlNavigation.custom.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('urlNavigation.custom.inputLabel')}
                </label>
                <Input
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder={t('urlNavigation.custom.inputPlaceholder')}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomNavigation()}
                />
              </div>
              <Button 
                onClick={handleCustomNavigation}
                disabled={!customUrl.trim()}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('urlNavigation.custom.navigateButton')}
              </Button>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>{t('urlNavigation.custom.examples.title')}</p>
                <p>• /dashboard</p>
                <p>• /test/url-navigation?component=profile</p>
                <p>• https://www.example.com</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 动态渲染的组件内容 */}
        {renderDynamicComponent()}
      </div>
    </div>
  );
};

export default UrlNavigationPage;