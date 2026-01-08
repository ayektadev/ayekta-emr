import { jsPDF } from 'jspdf';
import type { Discharge, Demographics, SurgicalNeeds } from '../types/patient.types';

export interface DischargeSummaryData {
  demographics: Demographics;
  discharge: Discharge;
  surgicalNeeds: SurgicalNeeds;
  ishiId: string;
}

export function generateDischargeSummaryPDF(data: DischargeSummaryData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;

  // Helper function to add text with automatic page break
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.text(text, margin, yPosition);
    yPosition += lineHeight;
  };

  // Helper function to add a section
  const addSection = (title: string, content: string) => {
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, yPosition);
    yPosition += lineHeight;

    if (content) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(content, pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
    }
    yPosition += 3; // Add extra space after section
  };

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('DISCHARGE SUMMARY', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += lineHeight * 1.5;

  // Patient Identifiers
  addText('PATIENT INFORMATION', 12, true);
  addText(`Name: ${data.demographics.firstName} ${data.demographics.lastName}`, 10);
  addText(`Date of Birth: ${data.demographics.dob}`, 10);
  addText(`ISHI ID: ${data.ishiId}`, 10);
  addText(`Age: ${data.demographics.age} | Gender: ${data.demographics.gender}`, 10);
  yPosition += 5;

  // Procedure Performed
  if (data.surgicalNeeds.selectedProcedures && data.surgicalNeeds.selectedProcedures.length > 0) {
    addSection('PROCEDURE PERFORMED', data.surgicalNeeds.selectedProcedures.join(', '));
  }

  // Discharge Date/Time
  if (data.discharge.dischargeDate || data.discharge.dischargeTime) {
    const dischargeDateTime = `${data.discharge.dischargeDate || 'N/A'} at ${data.discharge.dischargeTime || 'N/A'}`;
    addSection('DISCHARGE DATE & TIME', dischargeDateTime);
  }

  // Discharge Instructions
  if (data.discharge.dischargeInstructions) {
    addSection('GENERAL DISCHARGE INSTRUCTIONS', data.discharge.dischargeInstructions);
  }

  // Return Precautions
  if (data.discharge.returnPrecautions) {
    addSection('RETURN PRECAUTIONS', data.discharge.returnPrecautions);
  }

  // Diet Instructions
  if (data.discharge.dietInstructions) {
    addSection('DIET', data.discharge.dietInstructions);
  }

  // Activity Restrictions
  if (data.discharge.activityRestrictions) {
    addSection('ACTIVITY RESTRICTIONS', data.discharge.activityRestrictions);
  }

  // Shower Instructions
  if (data.discharge.showerInstructions) {
    addSection('SHOWER INSTRUCTIONS', data.discharge.showerInstructions);
  }

  // Dressing Instructions
  if (data.discharge.dressingInstructions) {
    addSection('DRESSING INSTRUCTIONS', data.discharge.dressingInstructions);
  }

  // Wound Care
  if (data.discharge.woundCare) {
    addSection('WOUND CARE', data.discharge.woundCare);
  }

  // Medications Dispensed
  if (data.discharge.medicationDispenseList && data.discharge.medicationDispenseList.length > 0) {
    addText('MEDICATIONS DISPENSED AT DISCHARGE', 11, true);
    data.discharge.medicationDispenseList.forEach((med, index) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const medText = `${index + 1}. ${med.name} - ${med.dose}`;
      doc.text(medText, margin, yPosition);
      yPosition += lineHeight;

      // Add quantity (stored in frequency field) and instructions (stored in route field)
      if (med.frequency) {
        doc.text(`   Quantity: ${med.frequency}`, margin, yPosition);
        yPosition += lineHeight;
      }
      if (med.route) {
        const instructionLines = doc.splitTextToSize(`   Instructions: ${med.route}`, pageWidth - 2 * margin - 10);
        instructionLines.forEach((line: string) => {
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
      }
      yPosition += 3;
    });
    yPosition += 3;
  }

  // Follow-up Appointment
  if (data.discharge.followupDate || data.discharge.followupProvider) {
    addText('FOLLOW-UP APPOINTMENT', 11, true);
    if (data.discharge.followupDate) {
      addText(`Date: ${data.discharge.followupDate}${data.discharge.followupTime ? ` at ${data.discharge.followupTime}` : ''}`, 10);
    }
    if (data.discharge.followupProvider) {
      addText(`Provider: ${data.discharge.followupProvider}`, 10);
    }
    if (data.discharge.followupPlace) {
      addText(`Location: ${data.discharge.followupPlace}`, 10);
    }
    yPosition += 5;
  }

  // Discharge Criteria
  if (data.discharge.dischargeCriteria) {
    addText('DISCHARGE CRITERIA MET', 11, true);
    const criteria = data.discharge.dischargeCriteria;
    if (criteria.voiding) addText('✓ Patient voiding', 10);
    if (criteria.ambulating) addText('✓ Patient ambulating', 10);
    if (criteria.dietTolerated) addText('✓ Diet tolerated', 10);
    if (criteria.painControlled) addText('✓ Pain controlled', 10);
    if (criteria.instructionsGiven) addText('✓ Instructions given', 10);
    if (criteria.followUpBooked) addText('✓ Follow-up booked', 10);
    if (criteria.woundClean) addText('✓ Wound clean', 10);
    yPosition += 5;
  }

  // Care Team Signatures
  addText('CARE TEAM', 11, true);
  if (data.discharge.mdVerificationName) {
    addText(`MD: ${data.discharge.mdVerificationName}${data.discharge.mdVerificationDate ? ` (${data.discharge.mdVerificationDate})` : ''}`, 10);
  }
  if (data.discharge.rnVerificationName) {
    addText(`RN: ${data.discharge.rnVerificationName}${data.discharge.rnVerificationDate ? ` (${data.discharge.rnVerificationDate})` : ''}`, 10);
  }

  // Footer
  yPosition = pageHeight - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
  doc.text(`Page ${doc.internal.pages.length - 1}`, pageWidth - margin - 20, yPosition);

  // Open PDF in new tab
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
}
