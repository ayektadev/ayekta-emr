export function encounterIdForPatient(patientId: string): string {
  return `enc:${patientId}`;
}

export function draftVersionIdForEncounter(encounterId: string): string {
  return `${encounterId}:draft`;
}
