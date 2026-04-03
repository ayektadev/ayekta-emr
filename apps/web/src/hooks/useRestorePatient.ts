import { useEffect, useState } from 'react';
import { loadFromStorage } from '../utils/storage';
import { usePatientStore } from '../store/patientStore';
import { useAuthStore } from '../store/authStore';

/**
 * Restore chart draft from Dexie when an authenticated session exists.
 */
export function useRestorePatient() {
  const [isLoading, setIsLoading] = useState(true);
  const loadPatient = usePatientStore((state) => state.loadPatient);
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let cancelled = false;

    const restorePatient = async () => {
      try {
        const data = await loadFromStorage();
        if (!cancelled && data) {
          loadPatient(data);
        }
      } catch (error) {
        console.error('Failed to restore patient from storage:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void restorePatient();

    return () => {
      cancelled = true;
    };
  }, [hydrated, user, loadPatient]);

  return isLoading;
}
