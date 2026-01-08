// Calculation utilities

/**
 * Calculate age from date of birth
 * Matches the exact logic from the original HTML version
 */
export function calculateAge(dob: string): number {
  if (!dob) return 0;
  
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Generate ISHI ID
 * Format: ISHI-{timestamp}
 */
export function generateIshiId(): string {
  return `ISHI-${Date.now()}`;
}

/**
 * Check if a string contains "hernia" (case-insensitive)
 * Used for conditional hernia scoring display
 */
export function containsHernia(text: string): boolean {
  return text.toLowerCase().includes('hernia');
}

/**
 * Format date for display
 */
export function formatDate(date: string): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
}

/**
 * Format time for display
 */
export function formatTime(time: string): string {
  if (!time) return '';
  return time;
}

/**
 * Get current date in YYYY-MM-DD format
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get current time in HH:MM format
 */
export function getCurrentTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
