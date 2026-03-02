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
 * Format: 13-digit random number
 */
export function generateIshiId(): string {
  // Generate a 13-digit random number
  let id = '';
  for (let i = 0; i < 13; i++) {
    id += Math.floor(Math.random() * 10);
  }
  return id;
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

/**
 * Calculate MET (Metabolic Equivalent of Task) score from activity checklist.
 * Returns the highest MET level the patient can perform.
 * Used to assess functional capacity for anesthesia clearance (ACC/AHA guidelines:
 * ≥ 4 METs generally indicates adequate capacity without additional cardiac workup).
 */
export function calculateMETs(activities: {
  selfCare: boolean;
  walkIndoors: boolean;
  walkFlat: boolean;
  lightHousework: boolean;
  climbStairs: boolean;
  runShortDistance: boolean;
  heavyHousework: boolean;
  moderateRecreation: boolean;
  strenuousSports: boolean;
}): number {
  if (activities.strenuousSports) return 8;
  if (activities.heavyHousework || activities.moderateRecreation ||
      activities.climbStairs || activities.runShortDistance) return 4;
  if (activities.lightHousework || activities.walkFlat) return 2;
  if (activities.selfCare || activities.walkIndoors) return 1;
  return 0;
}
