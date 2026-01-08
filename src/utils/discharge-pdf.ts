import { jsPDF } from 'jspdf';
import { PatientData } from '../types/patient.types';

/**
 * Generate discharge summary PDF
 * Maintains exact format from original HTML version
 */
export function generateDischargePDF(patient: PatientData): void {
  const doc = new jsPDF();
  
  const { demographics, discharge } = patient;
  
  // Extract data
  const name = `${demographics.firstName} ${demographics.lastName}`;
  const dob = demographics.dob;
  const ishiId = patient.ishiId;
  const dischargeDate = discharge.dischargeDate;
  
  const instructions = discharge.dischargeInstructions;
  const returnPrecautions = discharge.returnPrecautions;
  const fuDate = discharge.followupDate;
  const fuTime = discharge.followupTime;
  const fuPlace = discharge.followupPlace;
  
  let y = 20;
  
  // Header row inline (exact format from original)
  doc.setFontSize(12);
  doc.text(
    `Name: ${name}    DOB: ${dob}    ISHI ID: ${ishiId}    Date of Discharge: ${dischargeDate}`,
    10,
    y
  );
  y += 15;
  
  // Instructions section
  doc.setFontSize(14);
  doc.text('Instructions:', 10, y);
  y += 8;
  doc.setFontSize(12);
  if (instructions) {
    const lines = doc.splitTextToSize(instructions, 180);
    doc.text(lines, 10, y);
  }
  y += 25;
  
  // Return Precautions section
  doc.setFontSize(14);
  doc.text('Return Precautions:', 10, y);
  y += 8;
  doc.setFontSize(12);
  if (returnPrecautions) {
    const lines = doc.splitTextToSize(returnPrecautions, 180);
    doc.text(lines, 10, y);
  }
  y += 25;
  
  // Follow-up section
  doc.setFontSize(14);
  doc.text('Follow-up:', 10, y);
  y += 8;
  doc.setFontSize(12);
  doc.text(
    `Date: ${fuDate}    Time: ${fuTime}    Place: ${fuPlace}`,
    10,
    y
  );
  y += 25;
  
  // Signature lines
  doc.setFontSize(12);
  doc.text('MD Signature: ______________________', 10, y);
  y += 15;
  doc.text('RN Signature: ______________________', 10, y);
  
  // Save with filename
  doc.save('discharge_summary.pdf');
}
