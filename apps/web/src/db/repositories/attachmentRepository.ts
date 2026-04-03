import { getAyektaDB } from '../dexie/database';
import type { LocalAttachmentMetaRow, LocalPendingAttachmentRow } from '../dexie/schemaTypes';

/** Register metadata for a file already stored remotely (Phase 8). */
export async function putAttachmentMeta(row: LocalAttachmentMetaRow): Promise<void> {
  try {
    await getAyektaDB().attachmentsMeta.put(row);
  } catch (e) {
    console.error('attachmentRepository.putAttachmentMeta:', e);
  }
}

export async function listAttachmentMetaForPatient(patientId: string): Promise<LocalAttachmentMetaRow[]> {
  try {
    return await getAyektaDB().attachmentsMeta.where('patientId').equals(patientId).toArray();
  } catch (e) {
    console.error('listAttachmentMetaForPatient:', e);
    return [];
  }
}

/** Queue binary for later upload when API exists (Blueprint: pendingAttachments). */
export async function enqueuePendingAttachment(
  row: Omit<LocalPendingAttachmentRow, 'id'>
): Promise<void> {
  try {
    await getAyektaDB().pendingAttachments.add(row);
  } catch (e) {
    console.error('enqueuePendingAttachment:', e);
  }
}

export async function listPendingAttachmentsForPatient(
  patientId: string
): Promise<LocalPendingAttachmentRow[]> {
  try {
    return await getAyektaDB().pendingAttachments.where('patientId').equals(patientId).toArray();
  } catch (e) {
    console.error('listPendingAttachmentsForPatient:', e);
    return [];
  }
}
