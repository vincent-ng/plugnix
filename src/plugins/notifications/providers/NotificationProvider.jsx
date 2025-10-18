import React, { createContext, useContext, useState, useEffect } from 'react';
import eventBus from '@/framework/lib/eventBus';

// 创建通知上下文
const NotificationContext = createContext();

// 通知提供者组件
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // 生成唯一ID
  const generateId = () => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // 监听新通知事件
  useEffect(() => {
    const unsubscribe = eventBus.on('notification:new', (notification) => {
      // 如果没有提供ID，则生成一个
      const notificationWithId = {
        id: notification.id || generateId(),
        timestamp: new Date(),
        read: false,
        level: notification.level || 'info',
        source: notification.source || 'system',
        title: notification.title,
        message: notification.message,
        actions: notification.actions || []
      };

      setNotifications(prev => [notificationWithId, ...prev]);
    });

    return unsubscribe;
  }, []);

  // 标记通知为已读
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // 标记所有通知为已读
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // 删除通知
  const deleteNotification = (id) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };

  // 清空所有通知
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // 获取未读通知数量
  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  // 触发通知操作事件
  const triggerAction = (action) => {
    if (action && action.event) {
      eventBus.emit(action.event, action.payload || {});
    }
  };

  const contextValue = {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getUnreadCount,
    triggerAction
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// 自定义Hook，用于使用通知上下文
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;