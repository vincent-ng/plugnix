import { useTranslation } from 'react-i18next';
import { Bell, BellRing, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@components/ui/dropdown-menu';
import { useNotifications } from '../providers/useNotifications';

// 通知级别对应的样式
const getLevelStyles = (level) => {
  // 直接使用Tailwind配置中定义的主题色变量
  switch (level) {
    case 'success':
      return 'bg-success-50 dark:bg-success-700/10 border-success-200 dark:border-success-700/50 text-success-800 dark:text-success-50';
    case 'warning':
      return 'bg-warning-50 dark:bg-warning-700/10 border-warning-200 dark:border-warning-700/50 text-warning-800 dark:text-warning-50';
    case 'error':
      return 'bg-danger-50 dark:bg-danger-700/10 border-danger-200 dark:border-danger-700/50 text-danger-800 dark:text-danger-50';
    default: // info
      return 'bg-blue-50 dark:bg-blue-700/10 border-blue-200 dark:border-blue-700/50 text-blue-800 dark:text-blue-50';
  }
};

// 格式化时间
const formatTime = (date, t) => {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t('notificationCenter.time.justNow');
  if (minutes < 60) return t('notificationCenter.time.minutesAgo', { count: minutes });
  if (hours < 24) return t('notificationCenter.time.hoursAgo', { count: hours });
  if (days < 7) return t('notificationCenter.time.daysAgo', { count: days });
  
  return date.toLocaleDateString();
};

// 单个通知项组件
const NotificationItem = ({ notification, onMarkAsRead, onDelete, onTriggerAction }) => {
  const { t } = useTranslation('notifications');
  const { title, message, level, read, timestamp, actions } = notification;

  const handleActionClick = (action) => {
    onTriggerAction(action);
    // 触发操作后标记为已读
    if (!read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div className={`p-3 rounded-md border ${getLevelStyles(level)} ${!read ? 'font-semibold' : ''}`}>
      <div className="flex justify-between items-start mb-1">
        <h4 className="text-sm font-medium">{t(title)}</h4>
        <div className="flex items-center gap-1">
          {!read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onMarkAsRead(notification.id)}
              title={t('notificationCenter.markAsRead')}
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onDelete(notification.id)}
            title={t('notificationCenter.delete')}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {message && (
        <p className="text-xs mb-2 opacity-90">{t(message)}</p>
      )}
      
      <div className="flex justify-between items-center">
        <span className="text-xs opacity-70">{formatTime(timestamp, t)}</span>
        
        {actions && actions.length > 0 && (
          <div className="flex gap-1">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-6 text-xs px-2"
                onClick={() => handleActionClick(action)}
              >
                {t(action.label)}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 通知铃铛组件
const NotificationBell = () => {
  const { t } = useTranslation('notifications');
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications, 
    getUnreadCount,
    triggerAction 
  } = useNotifications();
  
  const unreadCount = getUnreadCount();
  const hasNotifications = notifications.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">{t('notificationCenter.title')}</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-0" align="end">
        <DropdownMenuLabel className="p-3 flex justify-between items-center">
          <span>{t('notificationCenter.title')}</span>
          {hasNotifications && (
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={markAllAsRead}
                  title={t('notificationCenter.markAllAsRead')}
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={clearAllNotifications}
                title={t('notificationCenter.clear')}
              >
                <Trash2 className="h-3 w-3 mr-1" />
              </Button>
            </div>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <div className="max-h-96 overflow-y-auto">
          {hasNotifications ? (
            <div className="p-2 space-y-2">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                  onTriggerAction={triggerAction}
                />
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground text-sm">
              {t('notificationCenter.noNotifications')}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;