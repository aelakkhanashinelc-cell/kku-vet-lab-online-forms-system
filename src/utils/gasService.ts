/**
 * Google Apps Script Integration Service
 * Provides client-side and server-side utilities to interact with Google Apps Script Web Apps
 */

import { VetLabRequest } from '../types';
import { AuthUser } from './staffData';

const GAS_URL_STORAGE_KEY = 'kku_vet_lab_gas_url';
const GAS_SYNC_ENABLED_KEY = 'kku_vet_lab_gas_sync_enabled';

export interface GasConnectionStatus {
  connected: boolean;
  message: string;
  spreadsheetName?: string;
  spreadsheetUrl?: string;
  userEmail?: string;
  timestamp?: string;
}

export async function safeJsonFromResponse(response: Response): Promise<any> {
  try {
    const text = await response.text();
    if (!text || !text.trim()) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbxAS8NOJ8s8RM5cgrvPyP6pBQTnh0jhs5VakMYzAEqxfOVBMRELyP1IuasnX8b1i04eIA/exec';

/**
 * Retrieve saved Google Apps Script Web App URL
 */
export function getGasUrl(): string {
  try {
    const saved = localStorage.getItem(GAS_URL_STORAGE_KEY);
    // If the saved URL is empty or matches the old inactive URL, migrate to new default
    if (!saved || saved.includes('AKfycbzI_t4oiogCWZRE1kNhdn4v2ojaJIzDEDJP-hIHxZxGs_lRNPTKHwad5XUDydK5xWuG')) {
      localStorage.setItem(GAS_URL_STORAGE_KEY, DEFAULT_GAS_URL);
      return DEFAULT_GAS_URL;
    }
    return saved;
  } catch {
    return DEFAULT_GAS_URL;
  }
}

export const getGasWebAppUrl = getGasUrl;

/**
 * Save Google Apps Script Web App URL
 */
export function setGasUrl(url: string): void {
  try {
    const trimmed = url.trim();
    localStorage.setItem(GAS_URL_STORAGE_KEY, trimmed);
  } catch (err) {
    console.error('Failed to save GAS URL to localStorage', err);
  }
}

export const setGasWebAppUrl = setGasUrl;

/**
 * Clear saved Google Apps Script Web App URL
 */
export function clearGasUrl(): void {
  try {
    localStorage.removeItem(GAS_URL_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear GAS URL', err);
  }
}

/**
 * Check if Google Apps Script is configured
 */
export function isGasConfigured(): boolean {
  const url = getGasUrl();
  return typeof url === 'string' && url.length > 10 && url.includes('script.google.com');
}

/**
 * Check if auto-sync to Google Apps Script is enabled
 */
export function isGasSyncEnabled(): boolean {
  try {
    const val = localStorage.getItem(GAS_SYNC_ENABLED_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

/**
 * Set auto-sync preference
 */
export function setGasSyncEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(GAS_SYNC_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch (err) {
    console.error('Failed to save GAS sync preference', err);
  }
}

/**
 * Test connection to Google Apps Script Web App
 */
export async function testGasConnection(customUrl?: string): Promise<GasConnectionStatus> {
  const url = (customUrl || getGasUrl()).trim();
  if (!url) {
    return {
      connected: false,
      message: 'กรุณากรอก Google Apps Script Web App URL',
    };
  }

  if (!url.startsWith('https://script.google.com')) {
    return {
      connected: false,
      message: 'URL ต้องขึ้นต้นด้วย https://script.google.com/macros/s/.../exec',
    };
  }

  try {
    // 1. Try POST action=test_connection
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Using text/plain avoids CORS preflight issues in Google Apps Script
      },
      body: JSON.stringify({
        action: 'test_connection',
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Status ${response.status}`);
    }

    const data = (await safeJsonFromResponse(response)) || {};
    if (data.success) {
      return {
        connected: true,
        message: data.message || 'เชื่อมต่อกับ Google Apps Script สำเร็จ',
        spreadsheetName: data.spreadsheetName,
        spreadsheetUrl: data.spreadsheetUrl,
        userEmail: data.userEmail,
        timestamp: data.timestamp,
      };
    } else {
      return {
        connected: false,
        message: data.error || data.message || 'เกิดข้อผิดพลาดในการตอบกลับจาก Google Apps Script',
      };
    }
  } catch (err: any) {
    // If standard fetch fails due to CORS or redirect, try a GET request ping
    try {
      const getUrl = new URL(url);
      getUrl.searchParams.set('action', 'ping');
      const getRes = await fetch(getUrl.toString(), { method: 'GET' });
      if (getRes.ok) {
        const getData = (await safeJsonFromResponse(getRes)) || {};
        return {
          connected: true,
          message: 'เชื่อมต่อกับ Google Apps Script สำเร็จ (ผ่าน GET Ping)',
          spreadsheetName: getData.spreadsheetName,
        };
      }
    } catch {
      // Fallback message
    }

    return {
      connected: false,
      message:
        'ไม่สามารถเชื่อมต่อได้: ' +
        (err.message || 'กรุณาตรวจสอบสิทธิ์การเข้าถึงว่าเป็น "Anyone" (ทุกคนที่มีลิงก์) ในหน้า Deploy ของสคริปต์'),
    };
  }
}

/**
 * Submit form data directly to Google Apps Script Web App
 */
export async function submitToGoogleAppsScript(
  requestData: Partial<VetLabRequest>
): Promise<{ success: boolean; trackingNo?: string; message?: string }> {
  const gasUrl = getGasUrl();
  if (!gasUrl) {
    return { success: false, message: 'Google Apps Script URL not configured' };
  }

  try {
    const payload = {
      action: 'submit_form',
      requestData: {
        ...requestData,
        webAppUrl: window.location.origin,
        submittedVia: 'KKU_VET_LAB_WEB_APP',
        timestamp: new Date().toISOString(),
      },
    };

    // Google Apps Script Web App responds best when POST body is text/plain or standard fetch
    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script responded with HTTP ${response.status}`);
    }

    const result = (await safeJsonFromResponse(response)) || {};
    return {
      success: !!result.success,
      trackingNo: result.trackingNo,
      message: result.message,
    };
  } catch (error: any) {
    console.warn('Direct Google Apps Script submission failed (will continue with local database):', error);
    return {
      success: false,
      message: error.message || 'Failed to submit to Google Apps Script',
    };
  }
}

/**
 * Sync status and data update to Google Apps Script Web App in real-time
 */
export async function syncUpdateToGoogleAppsScript(
  requestData: VetLabRequest
): Promise<{ success: boolean; message?: string }> {
  const gasUrl = getGasUrl();
  if (!gasUrl) {
    return { success: false, message: 'Google Apps Script URL not configured' };
  }

  try {
    const payload = {
      action: 'update_status',
      trackingNo: requestData.trackingNo,
      status: requestData.status,
      webAppUrl: window.location.origin,
      requestData: {
        ...requestData,
        webAppUrl: window.location.origin,
        updatedVia: 'KKU_VET_LAB_WEB_APP',
        timestamp: new Date().toISOString(),
      },
    };

    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script responded with HTTP ${response.status}`);
    }

    const result = (await safeJsonFromResponse(response)) || {};
    return {
      success: !!result.success,
      message: result.message,
    };
  } catch (error: any) {
    console.warn('Google Apps Script real-time sync failed:', error);
    return {
      success: false,
      message: error.message || 'Failed to sync update to Google Apps Script',
    };
  }
}

/**
 * Fetch all requests directly from Google Apps Script for real-time multi-device synchronization
 */
export async function fetchRequestsFromGoogleAppsScript(): Promise<VetLabRequest[] | null> {
  const gasUrl = getGasUrl();
  if (!gasUrl) return null;

  // Attempt to use Cloudflare Proxy to bypass strict mobile browser tracking preventions
  try {
    const url = new URL(gasUrl);
    url.searchParams.set('action', 'get_requests');
    url.searchParams.set('_t', String(Date.now()));

    // Try Cloudflare Proxy first
    const proxyUrl = "/api/proxy-gas?url=" + encodeURIComponent(url.toString());
    const proxyRes = await fetch(proxyUrl, { method: 'GET' });
    
    if (proxyRes.ok) {
      const proxyJson = await safeJsonFromResponse(proxyRes);
      if (proxyJson && proxyJson.success && Array.isArray(proxyJson.data)) {
        return proxyJson.data;
      }
    }
  } catch (proxyError) {
    console.warn('Proxy fetch failed, falling back to direct GET...', proxyError);
  }

  try {
    // Direct GET
    const url = new URL(gasUrl);
    url.searchParams.set('action', 'get_requests');
    url.searchParams.set('_t', String(Date.now()));

    const response = await fetch(url.toString(), { method: 'GET' });
    if (response.ok) {
      const json = await safeJsonFromResponse(response);
      if (json && json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (error) {
    console.warn('Direct GET request to GAS failed (CORS?), attempting POST fallback...');
  }

  try {
    // Direct POST Fallback
    const postRes = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'get_requests',
        timestamp: new Date().toISOString(),
      }),
    });

    if (postRes.ok) {
      const postJson = await safeJsonFromResponse(postRes);
      if (postJson && postJson.success && Array.isArray(postJson.data)) {
        return postJson.data;
      }
    }
  } catch (postError) {
    console.error('POST fallback to GAS also failed:', postError);
  }

  return null;
}

/**
 * Log user login event to Google Apps Script Sheet: เข้าสู่ระบบ in real-time
 */
export async function logLoginToGoogleAppsScript(
  user: AuthUser,
  userAgent?: string
): Promise<{ success: boolean; message?: string }> {
  const gasUrl = getGasUrl();
  if (!gasUrl) {
    return { success: false, message: 'Google Apps Script URL not configured' };
  }

  try {
    const payload = {
      action: 'log_login',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        roleTitle: user.roleTitle,
        isStaff: user.isStaff,
        department: user.department,
        loggedInAt: user.loggedInAt,
      },
      userAgent: userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '-'),
      source: 'KKU Vet Lab Portal (Client)',
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script responded with HTTP ${response.status}`);
    }

    const result = (await safeJsonFromResponse(response)) || {};
    return {
      success: !!result.success,
      message: result.message,
    };
  } catch (error: any) {
    console.warn('Google Apps Script login log failed:', error);
    return {
      success: false,
      message: error.message || 'Failed to log login to Google Apps Script',
    };
  }
}

/**
 * Export requests data to CSV format and trigger browser download
 */
export function exportRequestsToCSV(requests: VetLabRequest[], filename = 'KKU_Vet_Lab_Requests.csv'): void {
  if (!requests || requests.length === 0) {
    alert('ไม่มีข้อมูลคำขอสำหรับส่งออก');
    return;
  }

  const headers = [
    'Tracking No',
    'Form Type',
    'Submission Date (TH)',
    'Status',
    'Applicant Name',
    'Role',
    'Student ID',
    'Department',
    'Phone',
    'Email',
    'Work Type',
    'Project Title',
    'Created At',
  ];

  const csvRows = [headers.join(',')];

  requests.forEach((req) => {
    const row = [
      `"${req.trackingNo || ''}"`,
      `"${req.formType || ''}"`,
      `"${req.submissionDateTh || ''}"`,
      `"${req.status || ''}"`,
      `"${(req.applicantName || '').replace(/"/g, '""')}"`,
      `"${req.role || ''}"`,
      `"${req.studentId || ''}"`,
      `"${(req.department || '').replace(/"/g, '""')}"`,
      `"${req.phone || ''}"`,
      `"${req.email || ''}"`,
      `"${req.workType || ''}"`,
      `"${(req.projectTitle || '').replace(/"/g, '""')}"`,
      `"${req.createdAt || ''}"`,
    ];
    csvRows.push(row.join(','));
  });

  // Include UTF-8 BOM so Excel opens Thai characters without garbled text
  const bom = '\uFEFF';
  const csvContent = bom + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

