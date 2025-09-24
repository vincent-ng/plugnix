import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Button } from '@/framework/components/ui/button';
import { Input } from '@/framework/components/ui/input';
import { Textarea } from '@/framework/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/framework/components/ui/tabs';
import { ExternalLink } from 'lucide-react';
import PermissionTestPanel from './components/PermissionTestPanel';

const TestPage = () => {
  const { t } = useTranslation('test');
  const navigate = useNavigate();
  const [counter, setCounter] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-6 text-center">
          {t('title')}
        </h1>
        
        {/* URL导航功能按钮 */}
        <div className="flex justify-center mb-8">
          <Button 
            onClick={() => navigate('/test/url-navigation')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            {t('urlNavigation.buttonText')}
          </Button>
        </div>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">{t('tabs.basic')}</TabsTrigger>
            <TabsTrigger value="state">{t('tabs.state')}</TabsTrigger>
            <TabsTrigger value="animation">{t('tabs.animation')}</TabsTrigger>
            <TabsTrigger value="permission">{t('tabs.permission')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="mt-6">
        
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
                   <h3 className="text-xl font-semibold mb-2">{t('cards.card1.title')}</h3>
                   <p className="text-muted-foreground">{t('cards.card1.content')}</p>
                 </div>
                 <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6">
                   <h3 className="text-xl font-semibold mb-2">{t('cards.card2.title')}</h3>
                   <p className="text-muted-foreground">{t('cards.card2.content')}</p>
                 </div>
                 <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6">
                   <h3 className="text-xl font-semibold mb-2">{t('cards.card3.title')}</h3>
                   <p className="text-muted-foreground">{t('cards.card3.content')}</p>
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
          </TabsContent>
          
          <TabsContent value="state" className="mt-6">
        
            {/* 状态保持测试 */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('stateTest.title')}</h2>
              <Card>
                <CardHeader>
                  <CardTitle>{t('stateTest.title')}</CardTitle>
                  <CardDescription>{t('stateTest.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 表单测试 */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">{t('stateTest.formTest')}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('stateTest.inputLabel')}</label>
                        <Input
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder={t('stateTest.inputPlaceholder')}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          {t('stateTest.currentValue')}: {inputValue || t('stateTest.empty')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('stateTest.textareaLabel')}</label>
                        <Textarea
                          value={textareaValue}
                          onChange={(e) => setTextareaValue(e.target.value)}
                          placeholder={t('stateTest.textareaPlaceholder')}
                          rows={4}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          {t('stateTest.currentValue')}: {textareaValue || t('stateTest.empty')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 计数器测试 */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">{t('stateTest.counterTest')}</h3>
                    <div className="flex items-center space-x-4">
                      <Button onClick={() => setCounter(counter - 1)} variant="outline">
                        -
                      </Button>
                      <span className="text-2xl font-bold min-w-[3rem] text-center">{counter}</span>
                      <Button onClick={() => setCounter(counter + 1)} variant="outline">
                        +
                      </Button>
                      <Button onClick={() => setCounter(0)} variant="secondary">
                        {t('stateTest.reset')}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {t('stateTest.counterDescription')}
                    </p>
                  </div>
                  
                  {/* 说明文字 */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {t('stateTest.instruction')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="animation" className="mt-6">
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
                     <h4 className="font-bold">{t('responsive.mobile')}</h4>
                     <p className="text-sm">{t('responsive.oneColumn')}</p>
                   </div>
                   <div className="bg-white bg-opacity-20 p-4 rounded">
                     <h4 className="font-bold">{t('responsive.tablet')}</h4>
                     <p className="text-sm">{t('responsive.twoColumns')}</p>
                   </div>
                   <div className="bg-white bg-opacity-20 p-4 rounded">
                     <h4 className="font-bold">{t('responsive.desktop')}</h4>
                     <p className="text-sm">{t('responsive.fourColumns')}</p>
                   </div>
                   <div className="bg-white bg-opacity-20 p-4 rounded">
                     <h4 className="font-bold">{t('responsive.large')}</h4>
                     <p className="text-sm">{t('responsive.fourColumns')}</p>
                   </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="permission" className="mt-6">
            <PermissionTestPanel />
          </TabsContent>
        </Tabs>
        </div>
      </div>
  );
};

export default TestPage;