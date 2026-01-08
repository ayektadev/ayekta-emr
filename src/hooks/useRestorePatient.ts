import { useEffect, useState } from 'react';
import { loadFromStorage } from '../utils/storage';
import { usePatientStore } from '../store/patientStore';

/**
 * Restore patient data from IndexedDB on app startup
 * Shows a loading state while checking storage
 */
export function useRestorePatient() {
  const [isLoading, setIsLoading] = useState(true);
  const loadPatient = usePatientStore((state) => state.loadPatient);
  const isLoggedIn = usePatientStore((state) => state.isLoggedIn);

  useEffect(() => {
    // Only attempt to restore if not already logged in
    if (isLoggedIn) {
      setIsLoading(false);
      return;
    }

    const restorePatient = async () => {
      try {
        const data = await loadFromStorage();
        if (data) {
          loadPatient(data);
        }
      } catch (error) {
        console.error('Failed to restore patient from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    restorePatient();
  }, [isLoggedIn, loadPatient]);

  return isLoading;
}
