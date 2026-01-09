import localforage from 'localforage';
import { PatientData } from '../types/patient.types';

// Configure IndexedDB
const patientDB = localforage.createInstance({
  name: 'ayekta-emr',
  storeName: 'patients',
  description: 'Offline patient records'
});

/**
 * Save patient data to IndexedDB
 */
export async function saveToStorage(data: PatientData): Promise<void> {
  try {
    await patientDB.setItem('current-patient', data);
  } catch (error) {
    console.error('Failed to save to storage:', error);
    throw error;
  }
}

/**
 * Load patient data from IndexedDB
 */
export async function loadFromStorage(): Promise<PatientData | null> {
  try {
    const data = await patientDB.getItem<PatientData>('current-patient');
    return data;
  } catch (error) {
    console.error('Failed to load from storage:', error);
    return null;
  }
}

/**
 * Clear all patient data from storage
 */
export async function clearStorage(): Promise<void> {
  try {
    await patientDB.clear();
    localStorage.clear();
    sessionStorage.clear();
  } catch (error) {
    console.error('Failed to clear storage:', error);
    throw error;
  }
}

/**
 * Export patient data as JSON file
 * Filename format: GH26{ishiId}.json
 * Returns true if successful, false if failed
 */
export function exportPatientToJSON(data: PatientData): boolean {
  try {
    const filename = `GH26${data.ishiId}.json`;

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: 'application/json' }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`JSON file exported successfully: ${filename}`);
    return true;
  } catch (error) {
    console.error('Failed to export JSON file:', error);
    return false;
  }
}

/**
 * Import patient data from JSON file
 */
export async function importPatientFromJSON(file: File): Promise<PatientData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Basic validation
        if (!data.demographics || !data.ishiId) {
          reject(new Error('Invalid patient data file'));
          return;
        }
        
        resolve(data as PatientData);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Check if there's a saved patient in storage
 */
export async function hasSavedPatient(): Promise<boolean> {
  try {
    const data = await patientDB.getItem('current-patient');
    return data !== null;
  } catch {
    return false;
  }
}
