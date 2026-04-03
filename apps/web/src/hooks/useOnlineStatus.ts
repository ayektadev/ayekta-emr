import { useState, useEffect } from 'react';

/**
 * Hook to detect online/offline status
 * Returns true when device has internet connection
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      console.log('Device is now online');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('Device is now offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
