import { useContext } from 'react';
import { NotificationContext } from './NotificationProvider';

// 自定义Hook，用于使用通知上下文
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
