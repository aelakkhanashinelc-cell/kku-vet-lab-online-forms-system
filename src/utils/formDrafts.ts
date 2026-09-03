/**
 * Utility functions for saving, loading, and clearing auto-saved form drafts in localStorage.
 */

const STORAGE_PREFIX = 'kku_vet_lab_draft_';

export interface FormDraftEnvelope<T> {
  data: T;
  savedAt: string; // ISO string
}

export function saveFormDraft<T>(formKey: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    const envelope: FormDraftEnvelope<T> = {
      data,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(`${STORAGE_PREFIX}${formKey}`, JSON.stringify(envelope));
  } catch (err) {
    console.warn(`[Draft] Failed to save draft for ${formKey}:`, err);
  }
}

export function loadFormDraft<T>(formKey: string): FormDraftEnvelope<T> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${formKey}`);
    if (!raw) return null;
    return JSON.parse(raw) as FormDraftEnvelope<T>;
  } catch (err) {
    console.warn(`[Draft] Failed to load draft for ${formKey}:`, err);
    return null;
  }
}

export function clearFormDraft(formKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${formKey}`);
  } catch (err) {
    console.warn(`[Draft] Failed to clear draft for ${formKey}:`, err);
  }
}
