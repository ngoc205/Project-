import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const timeoutRef = useRef(null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setNotification(null), 3500);
  }, []);

  const showSuccess = useCallback((message) => showNotification(message), [showNotification]);
  const showError = useCallback((message) => showNotification(message, 'error'), [showNotification]);

  const closeNotification = useCallback(() => {
    window.clearTimeout(timeoutRef.current);
    setNotification(null);
  }, []);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  return (
    <NotificationContext.Provider value={{ showSuccess, showError }}>
      {children}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed', top: '24px', right: '24px', zIndex: 2000,
            display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '360px',
            padding: '14px 16px', borderRadius: '10px', background: notification.type === 'error' ? '#b91c1c' : '#166534', color: 'white',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.22)', fontWeight: 600,
          }}
        >
          <span aria-hidden="true">✓</span>
          <span>{notification.message}</span>
          <button type="button" onClick={closeNotification} aria-label="Đóng thông báo" style={{ border: 0, color: 'white', background: 'transparent', fontSize: '20px', lineHeight: 1, cursor: 'pointer' }}>×</button>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
}
