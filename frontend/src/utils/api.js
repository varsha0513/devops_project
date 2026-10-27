/**
 * API client module for Smart Campus Issue Reporting & Management System.
 * Connects to FastAPI backend endpoints.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');

/**
 * Helper to handle fetch responses and standardize error messages.
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = 'An error occurred while communicating with the campus API';
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        if (typeof errorJson.detail === 'string') {
          errorDetail = errorJson.detail;
        } else if (Array.isArray(errorJson.detail)) {
          errorDetail = errorJson.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        } else {
          errorDetail = JSON.stringify(errorJson.detail);
        }
      } else if (errorJson.errors && Array.isArray(errorJson.errors)) {
        errorDetail = errorJson.errors.map((e) => `${e.field}: ${e.message}`).join('; ');
      }
    } catch {
      errorDetail = `Request failed with HTTP status ${response.status} (${response.statusText})`;
    }
    const err = new Error(errorDetail);
    err.status = response.status;
    throw err;
  }
  return response.json();
}

/**
 * Fetch list of issues with query filters.
 */
export async function getIssues(params = {}) {
  const query = new URLSearchParams();
  if (params.search && params.search.trim()) query.append('search', params.search.trim());
  if (params.status && params.status !== 'All') query.append('status', params.status);
  if (params.category && params.category !== 'All') query.append('category', params.category);
  if (params.priority && params.priority !== 'All') query.append('priority', params.priority);
  if (params.sortBy) query.append('sort_by', params.sortBy);
  if (params.page) query.append('page', params.page);
  if (params.pageSize) query.append('page_size', params.pageSize);

  const queryString = query.toString();
  const url = `${BASE_URL}/api/issues${queryString ? `?${queryString}` : ''}`;
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse(res);
}

/**
 * Fetch single issue by numeric ID or string ticket ID.
 */
export async function getIssueById(identifier) {
  const url = `${BASE_URL}/api/issues/${encodeURIComponent(identifier)}`;
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse(res);
}

/**
 * Create a new complaint.
 */
export async function createIssue(issueData) {
  const payload = {
    student_name: issueData.studentName || issueData.student_name,
    title: issueData.title,
    description: issueData.description,
    category: issueData.category,
    location: issueData.location,
    priority: issueData.priority || 'Medium',
  };

  const url = `${BASE_URL}/api/issues`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/**
 * Update issue fields and/or status.
 */
export async function updateIssue(identifier, updateData) {
  const payload = {};
  if (updateData.status !== undefined) payload.status = updateData.status;
  if (updateData.priority !== undefined) payload.priority = updateData.priority;
  if (updateData.title !== undefined) payload.title = updateData.title;
  if (updateData.description !== undefined) payload.description = updateData.description;
  if (updateData.category !== undefined) payload.category = updateData.category;
  if (updateData.location !== undefined) payload.location = updateData.location;
  if (updateData.studentName !== undefined || updateData.student_name !== undefined) {
    payload.student_name = updateData.studentName || updateData.student_name;
  }

  const url = `${BASE_URL}/api/issues/${encodeURIComponent(identifier)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/**
 * Delete complaint by ID or ticket.
 */
export async function deleteIssue(identifier) {
  const url = `${BASE_URL}/api/issues/${encodeURIComponent(identifier)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse(res);
}

/**
 * Fetch aggregated dashboard statistics.
 */
export async function getDashboardStats() {
  const url = `${BASE_URL}/api/dashboard/stats`;
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse(res);
}

/**
 * Development-only: Reset and reseed backend sample complaints.
 */
export async function devResetSeed() {
  const url = `${BASE_URL}/api/dev/reset-seed`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse(res);
}

/**
 * Check backend health.
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`, {
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      return { online: true, data };
    }
    return { online: false, error: `HTTP ${res.status}` };
  } catch (err) {
    return { online: false, error: err.message };
  }
}
