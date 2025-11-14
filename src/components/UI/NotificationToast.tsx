import React, { useEffect } from 'react';
import { useMAPOStore } from '../../store';
import './NotificationToast.css';

export const NotificationToast: React.FC = () => {
  const { ui, removeNotification } = useMAPOStore();

  useEffect(() => {
    // Auto-remover notificaciones después de 5 segundos
    const timers: NodeJS.Timeout[] = [];

    ui.notifications.forEach((notification) => {
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
      timers.push(timer);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [ui.notifications, removeNotification]);

  if (ui.notifications.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div className="notification-container">
      {ui.notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification-toast notification-${notification.type}`}
        >
          <div className="notification-icon">{getIcon(notification.type)}</div>
          <div className="notification-content">
            <h4 className="notification-title">{notification.title}</h4>
            <p className="notification-message">{notification.message}</p>
          </div>
          <button
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
