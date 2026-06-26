'use client';

import { useState, useEffect } from 'react';

export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: number;
  txId?: string;
}

interface NotificationProps {
  notification: NotificationItem;
  onDismiss: (id: string) => void;
}

function NotificationCard({ notification, onDismiss }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in
    setIsVisible(true);
    
    // Auto dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(notification.id), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  const colors = {
    success: 'bg-green-100 border-green-400 text-green-800',
    error: 'bg-red-100 border-red-400 text-red-800',
    info: 'bg-blue-100 border-blue-400 text-blue-800',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  return (
    <div
      className={`${colors[notification.type]} border rounded-lg p-4 mb-3 shadow-lg transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span>{icons[notification.type]}</span>
            <p className="font-semibold">{notification.message}</p>
          </div>
          {notification.txId && (
            <p className="text-xs mt-1 opacity-75">
              TX: {notification.txId.slice(0, 20)}...
            </p>
          )}
          <p className="text-xs mt-1 opacity-50">
            {new Date(notification.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onDismiss(notification.id), 300);
          }}
          className="text-lg hover:opacity-75 ml-2"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

interface NotificationContainerProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
}

export default function NotificationContainer({ notifications, onDismiss }: NotificationContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-full">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    setNotifications((prev) => [...prev, newNotification]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const notifySuccess = (message: string, txId?: string) => {
    addNotification({ type: 'success', message, txId });
  };

  const notifyError = (message: string) => {
    addNotification({ type: 'error', message });
  };

  const notifyInfo = (message: string) => {
    addNotification({ type: 'info', message });
  };

  const notifyWarning = (message: string) => {
    addNotification({ type: 'warning', message });
  };

  return {
    notifications,
    dismissNotification,
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
  };
}
