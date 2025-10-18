import React, { useState, useEffect } from 'react';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Textarea } from '@components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import eventBus from '@/framework/lib/eventBus';

const NotificationTestPage = () => {
  const { t } = useTranslation('test');
  const [notificationData, setNotificationData] = useState({
    level: 'info',
    source: 'test',
    title: 'notifications:tenant.addedToOrg.title',
    message: 'notifications:tenant.addedToOrg.message',
    hasAction: false
  });

  // 添加事件监听器，处理通知操作的响应
  useEffect(() => {
    const handleViewDetails = (payload) => {
      console.log('收到查看详情事件:', payload);
      toast.success(t('notificationTest.eventReceived', { id: payload.id }));
    };

    // 订阅事件
    const unsubscribe = eventBus.on('test:view-details', handleViewDetails);

    // 清理函数，组件卸载时取消订阅
    return () => {
      unsubscribe();
    };
  }, [t]);

  const handleInputChange = (field, value) => {
    setNotificationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const sendNotification = () => {
    const payload = {
      level: notificationData.level,
      source: notificationData.source,
      title: notificationData.title,
      ...(notificationData.message && { message: notificationData.message })
    };

    if (notificationData.hasAction) {
      payload.actions = [
        {
          label: 'notifications:notificationCenter.viewDetails',
          event: 'test:view-details',
          payload: { id: 'test-123' }
        }
      ];
    }

    eventBus.emit('notification:new', payload);
  };

  const sendMultipleNotifications = () => {
    // 发送不同类型的通知
    eventBus.emit('notification:new', {
      level: 'info',
      source: 'test',
      title: t('notificationTest.testNotifications.info.title'),
      message: t('notificationTest.testNotifications.info.message')
    });

    eventBus.emit('notification:new', {
      level: 'success',
      source: 'test',
      title: t('notificationTest.testNotifications.success.title'),
      message: t('notificationTest.testNotifications.success.message')
    });

    eventBus.emit('notification:new', {
      level: 'warning',
      source: 'test',
      title: t('notificationTest.testNotifications.warning.title'),
      message: t('notificationTest.testNotifications.warning.message')
    });

    eventBus.emit('notification:new', {
      level: 'error',
      source: 'test',
      title: t('notificationTest.testNotifications.error.title'),
      message: t('notificationTest.testNotifications.error.message')
    });
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{t('notificationTest.title')}</CardTitle>
          <CardDescription>
            {t('notificationTest.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">{t('notificationTest.level')}</Label>
              <Select
                value={notificationData.level}
                onValueChange={(value) => handleInputChange('level', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('notificationTest.placeholder.selectLevel')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">{t('notificationTest.levels.info')}</SelectItem>
                  <SelectItem value="success">{t('notificationTest.levels.success')}</SelectItem>
                  <SelectItem value="warning">{t('notificationTest.levels.warning')}</SelectItem>
                  <SelectItem value="error">{t('notificationTest.levels.error')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">{t('notificationTest.source')}</Label>
              <Input
                id="source"
                value={notificationData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                placeholder={t('notificationTest.placeholder.source')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">{t('notificationTest.title')}</Label>
            <Input
              id="title"
              value={notificationData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={t('notificationTest.placeholder.title')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">{t('notificationTest.message')}</Label>
            <Textarea
              id="message"
              value={notificationData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder={t('notificationTest.placeholder.message')}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasAction"
              checked={notificationData.hasAction}
              onChange={(e) => handleInputChange('hasAction', e.target.checked)}
            />
            <Label htmlFor="hasAction">{t('notificationTest.includeActionButton')}</Label>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button onClick={sendNotification}>{t('notificationTest.sendNotification')}</Button>
            <Button variant="outline" onClick={sendMultipleNotifications}>
              {t('notificationTest.sendMultipleNotifications')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationTestPage;