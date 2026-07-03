import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const [confirmOptions, setConfirmOptions] = useState(null);
  const timeoutRef = useRef(null);
  const confirmResolveRef = useRef(null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setNotification(null), 3500);
  }, []);

  const showSuccess = useCallback((message) => showNotification(message), [showNotification]);
  const showError = useCallback((message) => showNotification(message, 'error'), [showNotification]);

  const showConfirm = useCallback((options) => new Promise((resolve) => {
    const nextOptions = typeof options === 'string' ? { message: options } : options;
    confirmResolveRef.current = resolve;
    setConfirmOptions({
      title: 'Xác nhận thao tác',
      message: '',
      confirmText: 'Đồng ý',
      cancelText: 'Hủy',
      danger: false,
      ...nextOptions,
    });
  }), []);

  const closeNotification = useCallback(() => {
    window.clearTimeout(timeoutRef.current);
    setNotification(null);
  }, []);

  const closeConfirm = useCallback((confirmed) => {
    confirmResolveRef.current?.(confirmed);
    confirmResolveRef.current = null;
    setConfirmOptions(null);
  }, []);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showConfirm }}>
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
      {confirmOptions && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1900,
            display: 'grid', placeItems: 'center', padding: '20px',
            background: 'rgba(15, 23, 42, 0.45)',
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            style={{
              width: 'min(430px, 100%)', padding: '22px', borderRadius: '10px',
              background: 'white', boxShadow: '0 24px 50px rgba(15, 23, 42, 0.28)',
            }}
          >
            <h3 id="confirm-dialog-title" style={{ margin: '0 0 10px', color: '#1a365d' }}>
              {confirmOptions.title}
            </h3>
            <p style={{ margin: '0 0 20px', color: '#475569', lineHeight: 1.6 }}>
              {confirmOptions.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                style={{
                  padding: '9px 14px', borderRadius: '7px', border: '1px solid #94a3b8',
                  background: 'white', color: '#334155', cursor: 'pointer', fontWeight: 700,
                }}
              >
                {confirmOptions.cancelText}
              </button>
              <button
                type="button"
                onClick={() => closeConfirm(true)}
                style={{
                  padding: '9px 14px', borderRadius: '7px', border: 'none',
                  background: confirmOptions.danger ? '#b91c1c' : '#1a365d',
                  color: 'white', cursor: 'pointer', fontWeight: 700,
                }}
              >
                {confirmOptions.confirmText}
              </button>
            </div>
          </section>
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
