import { jsPDF } from 'jspdf';
import type { PatientData } from '../types/patient.types';

/**
 * Generate a comprehensive PDF of the entire patient chart
 * Filename format: GH26{ishiId}_Chart.pdf
 * Returns PDF as Blob for upload to Google Drive or local download
 * NOTE: This function does NOT trigger a download. The caller is responsible
 * for either uploading the blob or triggering a local download.
 */
export function generateFullChartPDF(data: PatientData): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const lineHeight = 6;
  let yPosition = margin;

  // Helper function to check if we need a new page
  const checkPageBreak = (neededSpace: number = lineHeight) => {
    if (yPosition + neededSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper to add text
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false, indent: number = 0) => {
    checkPageBreak();
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin - indent);
    lines.forEach((line: string) => {
      checkPageBreak();
      doc.text(line, margin + indent, yPosition);
      yPosition += lineHeight;
    });
  };

  // Helper to add section header
  const addSectionHeader = (title: string) => {
    yPosition += 3;
    checkPageBreak(lineHeight * 2);
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, 8, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 2, yPosition);
    yPosition += lineHeight + 2;
  };

  // Helper to add field
  const addField = (label: string, value: string | number | boolean) => {
    if (value === '' || value === null || value === undefined) return;
    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
    addText(`${label}: ${displayValue}`, 9, false, 0);
  };

  // COVER PAGE
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT CHART', pageWidth / 2, 40, { align: 'center' });

  doc.setFontSize(14);
  doc.text(`${data.demographics.firstName} ${data.demographics.lastName}`, pageWidth / 2, 55, { align: 'center' });
  doc.text(`ISHI ID: ${data.ishiId}`, pageWidth / 2, 65, { align: 'center' });
  doc.text(`DOB: ${data.demographics.dob}`, pageWidth / 2, 75, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 90, { align: 'center' });
  doc.text(`Provider: ${data.currentProvider}`, pageWidth / 2, 100, { align: 'center' });

  doc.addPage();
  yPosition = margin;

  // DEMOGRAPHICS
  addSectionHeader('DEMOGRAPHICS');
  addField('First Name', data.demographics.firstName);
  addField('Middle Name', data.demographics.middleName);
  addField('Last Name', data.demographics.lastName);
  addField('Date of Birth', data.demographics.dob);
  addField('Age', data.demographics.age);
  addField('Gender', data.demographics.gender);
  addField('Address', data.demographics.address);
  addField('Phone', data.demographics.phone);
  addField('Email', data.demographics.email);
  addField('Blood Group', data.demographics.bloodGroup);

  if (data.demographics.emergencyContactName) {
    yPosition += 2;
    addText('Emergency Contact:', 10, true);
    addField('Name', data.demographics.emergencyContactName);
    addField('Phone', data.demographics.emergencyContactPhone);
    addField('Relationship', data.demographics.emergencyContactRelationship);
  }

  if (data.demographics.pastMedicalHistory) {
    yPosition += 2;
    addText('Past Medical History:', 10, true);
    addText(data.demographics.pastMedicalHistory, 9, false, 5);
  }

  if (data.demographics.pastSurgicalHistory) {
    yPosition += 2;
    addText('Past Surgical History:', 10, true);
    addText(data.demographics.pastSurgicalHistory, 9, false, 5);
  }

  // TRIAGE
  addSectionHeader('TRIAGE');
  addField('Date', data.triage.date);
  addField('Time', data.triage.time);
  addField('Attending Surgeon', data.triage.attendingSurgeon);
  addField('Temperature', data.triage.temperature);
  addField('Heart Rate', data.triage.hr);
  addField('Respiratory Rate', data.triage.rr);
  addField('Blood Pressure', data.triage.bp);
  addField('SpO2', data.triage.spo2);
  addField('Weight', data.triage.weight);
  addField('Height', data.triage.height);
  addField('Pain Scale', data.triage.painScale);

  if (data.triage.chiefComplaint) {
    yPosition += 2;
    addText('Chief Complaint:', 10, true);
    addText(data.triage.chiefComplaint, 9, false, 5);
  }

  // SURGICAL NEEDS
  addSectionHeader('SURGICAL NEEDS');
  addField('Procedure', data.surgicalNeeds.procedure);
  addField('Urgency Level', data.surgicalNeeds.urgencyLevel);
  addField('Anesthesia Type', data.surgicalNeeds.anesthesiaType);

  const procedures: string[] = [];
  if (data.surgicalNeeds.opInguinalHerniaL) procedures.push('Inguinal Hernia (L)');
  if (data.surgicalNeeds.opInguinalHerniaR) procedures.push('Inguinal Hernia (R)');
  if (data.surgicalNeeds.opInguinalHerniaBilateral) procedures.push('Inguinal Hernia (Bilateral)');
  if (data.surgicalNeeds.opVentralUmbilicalHernia) procedures.push('Ventral/Umbilical Hernia');
  if (data.surgicalNeeds.opHysterectomy) procedures.push('Hysterectomy');
  if (data.surgicalNeeds.opProstatectomy) procedures.push('Prostatectomy');
  if (data.surgicalNeeds.opHydrocelectomyL) procedures.push('Hydrocelectomy (L)');
  if (data.surgicalNeeds.opHydrocelectomyR) procedures.push('Hydrocelectomy (R)');
  if (data.surgicalNeeds.opHydrocelectomyBilateral) procedures.push('Hydrocelectomy (Bilateral)');
  if (data.surgicalNeeds.opMassExcision) procedures.push('Mass Excision');

  if (procedures.length > 0) {
    addText('Planned Operations:', 10, true);
    procedures.forEach(p => addText(`• ${p}`, 9, false, 5));
  }

  // CONSENT
  addSectionHeader('CONSENT');
  addField('Procedure Name', data.consent.procedureName);
  addField('Planned Date', data.consent.plannedDate);
  addField('Performing Surgeon', data.consent.performingSurgeon);
  addField('Patient/Guardian Name', data.consent.patientGuardianName);
  addField('Relationship', data.consent.relationshipToPatient);
  addField('Signature Date', data.consent.signatureDate);

  // MEDICATIONS
  if (data.medications.currentMedications.length > 0) {
    addSectionHeader('CURRENT MEDICATIONS');
    data.medications.currentMedications.forEach((med, idx) => {
      addText(`${idx + 1}. ${med.name} - ${med.dose} (${med.frequency})`, 9);
    });
  }

  if (data.medications.allergies.length > 0) {
    addSectionHeader('ALLERGIES');
    data.medications.allergies.forEach((allergy, idx) => {
      addText(`${idx + 1}. ${allergy.allergen} - ${allergy.reaction} (${allergy.severity})`, 9);
    });
  }

  // PRE-ANESTHESIA
  addSectionHeader('PRE-ANESTHESIA EVALUATION');
  addField('ASA Class', data.preAnesthesia.asaClass);
  addField('Mallampati', data.preAnesthesia.mallampatiClass);
  addField('Anesthesia Plan', data.preAnesthesia.anesthesiaPlan);
  addField('Risk Level', data.preAnesthesia.riskLevel);

  // OPERATIVE NOTE
  addSectionHeader('OPERATIVE NOTE');
  addField('Date of Surgery', data.operativeNote.dateOfSurgery);
  addField('Surgeon', data.operativeNote.surgeon);
  addField('Assistants', data.operativeNote.assistants);
  addField('Anesthesiologist', data.operativeNote.anesthesiologist);
  addField('Anesthesia Type', data.operativeNote.anesthesiaType);

  if (data.operativeNote.preopDiagnosis) {
    yPosition += 2;
    addText('Pre-op Diagnosis:', 10, true);
    addText(data.operativeNote.preopDiagnosis, 9, false, 5);
  }

  if (data.operativeNote.postopDiagnosis) {
    yPosition += 2;
    addText('Post-op Diagnosis:', 10, true);
    addText(data.operativeNote.postopDiagnosis, 9, false, 5);
  }

  if (data.operativeNote.operativeTechnique) {
    yPosition += 2;
    addText('Operative Technique:', 10, true);
    addText(data.operativeNote.operativeTechnique, 9, false, 5);
  }

  addField('EBL', data.operativeNote.estimatedBloodLoss);
  addField('Complications', data.operativeNote.complications);
  addField('Case Duration', data.operativeNote.caseDuration);

  // OR RECORD
  addSectionHeader('OR RECORD');
  addField('OR Entry Time', data.orRecord.orEntryTime);
  addField('Anesthesia Start', data.orRecord.anesthesiaStartTime);
  addField('Procedure Start', data.orRecord.procedureStartTime);
  addField('Procedure End', data.orRecord.procedureEndTime);
  addField('Anesthesia End', data.orRecord.anesthesiaEndTime);
  addField('OR Exit Time', data.orRecord.orExitTime);

  // PROGRESS NOTES
  if (data.progressNotes.notes.length > 0) {
    addSectionHeader('PROGRESS NOTES');
    data.progressNotes.notes.forEach((note, idx) => {
      yPosition += 2;
      addText(`Note ${idx + 1} - POD ${note.pod}`, 10, true);
      addField('Date', note.date);
      addField('Time', note.time);
      addField('Pain Level', note.painLevel);
      if (note.assessmentPlan) {
        addText('Assessment & Plan:', 9, true, 5);
        addText(note.assessmentPlan, 9, false, 10);
      }
      addField('Provider', note.providerName);
    });
  }

  // LABS
  if (data.labs.length > 0) {
    addSectionHeader('LABORATORY RESULTS');
    data.labs.forEach((lab, idx) => {
      yPosition += 2;
      addText(`Lab ${idx + 1}: ${lab.testName}`, 10, true);
      addField('Date Ordered', lab.dateOrdered);
      addField('Date Resulted', lab.dateResulted);
      addField('Result', lab.resultValue);
      addField('Reference Range', lab.referenceRange);
      addField('Status', lab.status);
      if (lab.interpretation) {
        addText('Interpretation:', 9, true, 5);
        addText(lab.interpretation, 9, false, 10);
      }
    });
  }

  // IMAGING
  if (data.imaging.length > 0) {
    addSectionHeader('IMAGING STUDIES');
    data.imaging.forEach((study, idx) => {
      yPosition += 2;
      addText(`Study ${idx + 1}: ${study.studyType}`, 10, true);
      addField('Body Part', study.bodyPart);
      addField('Date Ordered', study.dateOrdered);
      addField('Date Performed', study.datePerformed);
      if (study.findings) {
        addText('Findings:', 9, true, 5);
        addText(study.findings, 9, false, 10);
      }
      if (study.impression) {
        addText('Impression:', 9, true, 5);
        addText(study.impression, 9, false, 10);
      }

      // Add images if available
      if (study.attachments && study.attachments.length > 0) {
        yPosition += 2;
        addText('Attached Images:', 9, true, 5);

        study.attachments.forEach((attachment) => {
          // Only render images (not PDFs or other file types)
          if (attachment.fileType.startsWith('image/')) {
            checkPageBreak(60); // Need space for image

            try {
              // Determine image format from fileType
              let format = 'JPEG'; // default
              if (attachment.fileType.includes('png')) {
                format = 'PNG';
              } else if (attachment.fileType.includes('gif')) {
                format = 'GIF';
              } else if (attachment.fileType.includes('webp')) {
                format = 'WEBP';
              }

              // Add image to PDF (50mm wide, auto height)
              // base64Data is a data URL (data:image/png;base64,...)
              doc.addImage(attachment.base64Data, format, margin + 10, yPosition, 50, 0);
              yPosition += 55; // Space for image + caption

              // Add caption
              doc.setFontSize(8);
              doc.setFont('helvetica', 'italic');
              doc.text(attachment.filename, margin + 10, yPosition);
              yPosition += lineHeight;
            } catch (error) {
              console.warn('Could not add image to PDF:', attachment.filename, error);
              addText(`[Image: ${attachment.filename}]`, 8, false, 10);
            }
          } else {
            addText(`[Attachment: ${attachment.filename}]`, 8, false, 10);
          }
        });
      }
    });
  }

  // DISCHARGE
  addSectionHeader('DISCHARGE');
  addField('Discharge Date', data.discharge.dischargeDate);
  addField('Discharge Time', data.discharge.dischargeTime);

  if (data.discharge.dischargeInstructions) {
    yPosition += 2;
    addText('Instructions:', 10, true);
    addText(data.discharge.dischargeInstructions, 9, false, 5);
  }

  if (data.discharge.medicationDispenseList && data.discharge.medicationDispenseList.length > 0) {
    yPosition += 2;
    addText('Medications Dispensed:', 10, true);
    data.discharge.medicationDispenseList.forEach((med, idx) => {
      addText(`${idx + 1}. ${med.name} - ${med.dose}`, 9, false, 5);
      if (med.frequency) addText(`   Quantity: ${med.frequency}`, 9, false, 5);
      if (med.route) addText(`   Instructions: ${med.route}`, 9, false, 5);
    });
  }

  addField('Follow-up Date', data.discharge.followupDate);
  addField('Follow-up Provider', data.discharge.followupProvider);
  if (data.discharge.mdVerificationName) {
    addField('MD Verification', data.discharge.mdVerificationName);
  }
  if (data.discharge.rnVerificationName) {
    addField('RN Verification', data.discharge.rnVerificationName);
  }

  // FOLLOW-UP NOTES
  if (data.followUpNotes.notes.length > 0) {
    addSectionHeader('FOLLOW-UP APPOINTMENT NOTES');
    data.followUpNotes.notes.forEach((note, idx) => {
      yPosition += 2;
      addText(`Follow-up Visit ${idx + 1}`, 10, true);
      addField('Visit Date', note.visitDate);
      addField('Visit Time', note.visitTime);
      addField('Chief Complaint', note.chiefComplaint);
      addField('Pain Level', note.painLevel);

      if (note.intervalHistory) {
        yPosition += 2;
        addText('Interval History:', 9, true, 5);
        addText(note.intervalHistory, 9, false, 10);
      }

      if (note.woundCheck) {
        addText('Wound Check:', 9, true, 5);
        addText(note.woundCheck, 9, false, 10);
      }

      if (note.complications) {
        addText('Complications:', 9, true, 5);
        addText(note.complications, 9, false, 10);
      }

      if (note.examination) {
        addText('Examination:', 9, true, 5);
        addText(note.examination, 9, false, 10);
      }

      if (note.assessment) {
        addText('Assessment:', 9, true, 5);
        addText(note.assessment, 9, false, 10);
      }

      if (note.plan) {
        addText('Plan:', 9, true, 5);
        addText(note.plan, 9, false, 10);
      }

      addField('Next Follow-up', note.nextFollowUp);
      addField('Provider', note.providerName);
      addField('Signature Date', note.providerSignatureDate);
    });
  }

  // Footer on each page
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
    doc.text(`ISHI ID: ${data.ishiId}`, margin, pageHeight - 10);
  }

  // Return PDF as blob for Google Drive upload and local download
  // NOTE: Caller is responsible for triggering the download
  return doc.output('blob');
}
