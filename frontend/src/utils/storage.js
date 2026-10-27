import { INITIAL_DEMO_ISSUES } from '../data/seedIssues';

const STORAGE_KEY = 'smart_campus_issues_data_v1';

/**
 * Safely loads issues from localStorage.
 * If no data exists or if the data is corrupted, initializes with INITIAL_DEMO_ISSUES.
 */
export function getStoredIssues() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ISSUES));
      return INITIAL_DEMO_ISSUES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    // If empty array or invalid structure, return the parsed array or fallback
    if (Array.isArray(parsed)) {
      return parsed;
    }
    // Corrupt data fallback
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ISSUES));
    return INITIAL_DEMO_ISSUES;
  } catch (error) {
    console.error('Failed to read issues from localStorage:', error);
    return INITIAL_DEMO_ISSUES;
  }
}

/**
 * Safely saves the issue list to localStorage.
 */
export function saveStoredIssues(issues) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
  } catch (error) {
    console.error('Failed to save issues to localStorage:', error);
  }
}

/**
 * Resets storage back to initial demo dataset.
 */
export function resetStoredIssuesToDemo() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ISSUES));
    return INITIAL_DEMO_ISSUES;
  } catch (error) {
    console.error('Failed to reset demo issues:', error);
    return INITIAL_DEMO_ISSUES;
  }
}

/**
 * Generates a unique, standardized complaint ID: e.g. SCI-2026-XXXX
 */
export function generateIssueId(existingIssues = []) {
  const year = new Date().getFullYear();
  let candidate = '';
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 50) {
    attempts++;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    candidate = `SCI-${year}-${randomNum}`;
    if (!existingIssues.some((issue) => issue.id === candidate)) {
      isUnique = true;
    }
  }

  return candidate || `SCI-${year}-${Date.now().toString().slice(-4)}`;
}

/**
 * Formats ISO date string to user-friendly readable date and time.
 */
export function formatDate(isoString) {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}
