import { clearSessionAndChart } from '../utils/storage';
import { usePatientStore } from '../store/patientStore';
import { useAuthStore } from '../store/authStore';

/** Ends auth session and clears the in-memory + persisted chart draft. */
export async function signOutAndResetChart(): Promise<void> {
  try {
    await clearSessionAndChart();
  } catch (e) {
    console.error('signOutAndResetChart:', e);
  } finally {
    useAuthStore.setState({ user: null, accessToken: null });
    usePatientStore.getState().reset();
  }
}
