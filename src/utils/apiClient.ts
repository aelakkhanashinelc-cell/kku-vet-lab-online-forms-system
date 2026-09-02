/**
 * Universal API Client with Automatic Static-Hosting & Google Apps Script Fallback
 * Works seamlessly both with Node.js Express server (local) AND purely static hosting (Cloudflare Pages / Vercel)
 */

import { VetLabRequest } from '../types';
import {
  getGasUrl,
  isGasConfigured,
  isGasSyncEnabled,
  submitToGoogleAppsScript,
  syncUpdateToGoogleAppsScript,
  logLoginToGoogleAppsScript,
} from './gasService';

const CLIENT_REQUESTS_KEY = 'kku_vet_lab_client_requests';

// Initial seed requests (same as server.ts)
const SEED_REQUESTS: VetLabRequest[] = [
  {
    id: 'req-001',
    trackingNo: 'VL02-2026-001',
    formType: 'VET_LAB_02',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    submissionDateTh: '28 สิงหาคม 2569',
    applicantName: 'นายสมชาย พันธุ์งาม',
    role: 'student',
    studentId: '653180123-4',
    department: 'กลุ่มวิชาอายุรศาสตร์ (Medicine)',
    phone: '081-234-5678',
    email: 'somchai.p@kkumail.com',
    workType: 'research',
    projectTitle: 'การศึกษาการดื้อยาปฏิชีวนะของเชื้อแบคทีเรียในสุนัข',
    labItems: [
      { id: '1', no: 1, labName: 'ห้องปฏิบัติการจุลชีววิทยา ชั้น 3 อาคารพิเชฏฐ์ฯ', remarks: 'งานเพาะเลี้ยงเชื้อ' },
      { id: '2', no: 2, labName: 'ห้องปฏิบัติการชีวเคมีคลินิก ชั้น 2 อาคารพิเชฏฐ์ฯ', remarks: 'ทดสอบความไวต่อยา' },
    ],
    timeSlot: 'official_hours',
    durationDays: 5,
    startDate: '2026-09-01',
    endDate: '2026-09-05',
    termsAccepted: true,
    applicantSignature: {
      name: 'นายสมชาย พันธุ์งาม',
      date: '28 สิงหาคม 2569',
    },
    advisorSignature: {
      name: 'ผศ.ดร.ลักขณา ฉัตรทอง',
      date: '28 สิงหาคม 2569',
    },
    part2: {
      approvalStatus: 'approved',
      comment: 'เห็นควรอนุมัติให้ใช้ห้องปฏิบัติการตามกำหนดเวลา',
      signature: {
        name: 'ผศ.ดร.ลักขณา ฉัตรทอง',
        date: '28 สิงหาคม 2569',
      },
      reviewedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      assignedStaffName: 'นางสาววันศิริ สุขสวัสดิ์',
      assignedStaffEmail: 'wansiri@kku.ac.th',
      assignedStaffComment: 'ประสานงานเปิดห้องและแนะนำอุปกรณ์ความปลอดภัย',
    },
    part3: {
      approvalStatus: 'approved',
      comment: 'ตรวจสอบความพร้อมของห้องปฏิบัติการและตู้ชีวนิรภัยเรียบร้อย',
      signature: {
        name: 'นางสาววันศิริ สุขสวัสดิ์',
        date: '28 สิงหาคม 2569',
      },
      reviewedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  },
  {
    id: 'req-002',
    trackingNo: 'VL03-2026-002',
    formType: 'VET_LAB_03',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    submissionDateTh: '29 สิงหาคม 2569',
    applicantName: 'ผศ.น.สพ.ดร.กิตติคม วงศ์สว่าง',
    role: 'faculty_staff',
    department: 'กลุ่มวิชาศัลยศาสตร์ (Surgery)',
    phone: '089-765-4321',
    email: 'kittikom@kku.ac.th',
    workType: 'research',
    projectTitle: 'การวิเคราะห์โครงสร้างกระดูกและเนื้อเยื่อข้อต่อด้วยกล้องจุลทรรศน์',
    equipmentType: 'lab_based',
    equipmentItems: [
      { id: '1', no: 1, itemName: 'กล้องจุลทรรศน์สเตอริโอ (Stereo Microscope)', quantity: '1 เครื่อง', remarksLab: 'ห้องจุลทรรศน์ ชั้น 2' },
    ],
    timeSlot: 'official_hours',
    durationDays: 3,
    startDate: '2026-09-02',
    endDate: '2026-09-04',
    termsAccepted: true,
    applicantSignature: {
      name: 'ผศ.น.สพ.ดร.กิตติคม วงศ์สว่าง',
      date: '29 สิงหาคม 2569',
    },
    advisorSignature: {
      name: '-',
      date: '-',
    },
  },
];

/**
 * Get client-stored requests
 */
export function getLocalRequests(): VetLabRequest[] {
  if (typeof window === 'undefined') return SEED_REQUESTS;
  try {
    const raw = localStorage.getItem(CLIENT_REQUESTS_KEY);
    if (!raw) {
      localStorage.setItem(CLIENT_REQUESTS_KEY, JSON.stringify(SEED_REQUESTS));
      return SEED_REQUESTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_REQUESTS;
  } catch {
    return SEED_REQUESTS;
  }
}

/**
 * Save client-stored requests
 */
export function saveLocalRequests(requests: VetLabRequest[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CLIENT_REQUESTS_KEY, JSON.stringify(requests));
  } catch (err) {
    console.error('Failed to save requests to localStorage:', err);
  }
}

/**
 * Safe fetch wrapper that handles non-JSON / 404 / 405 from static hosts
 */
async function safeFetchJson(url: string, options?: RequestInit): Promise<any> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    const text = await res.text();
    if (!text || !text.trim()) {
      return null;
    }
    try {
      const json = JSON.parse(text);
      if (res.ok) {
        return json;
      }
      return { _error: true, message: json.message || 'API Error', status: res.status };
    } catch {
      return null;
    }
  } catch (e) {
    return null;
  }
}

/**
 * Generate a new tracking number locally
 */
function generateTrackingNo(formType: string, existingList: VetLabRequest[]): string {
  const year = new Date().getFullYear();
  let prefix = 'VL';
  if (formType === 'VET_LAB_02') prefix = 'VL02';
  else if (formType === 'VET_LAB_03') prefix = 'VL03';
  else if (formType === 'VET_LAB_04') prefix = 'VL04';

  const countSeq = String(existingList.length + 1).padStart(3, '0');
  return `${prefix}-${year}-${countSeq}`;
}

/**
 * 1. Submit a new request (Supports both Server & Client / Google Apps Script)
 */
export async function apiSubmitRequest(payload: any): Promise<{ success: boolean; data: VetLabRequest; message: string; emailResult?: any }> {
  // 1. Attempt Node.js server API
  const serverRes = await safeFetchJson('/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (serverRes && serverRes.success && serverRes.data) {
    // Keep local cache in sync
    const list = getLocalRequests();
    saveLocalRequests([serverRes.data, ...list.filter((r) => r.id !== serverRes.data.id)]);
    return serverRes;
  }

  // 2. Client-side fallback (Cloudflare Pages / Static Hosting)
  const currentList = getLocalRequests();
  const trackingNo = generateTrackingNo(payload.formType, currentList);
  const newRequest: VetLabRequest = {
    ...payload,
    id: 'req-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    trackingNo,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedList = [newRequest, ...currentList];
  saveLocalRequests(updatedList);

  // 3. Real-time sync to Google Apps Script / Google Sheets
  let gasResult = null;
  if (isGasConfigured() && isGasSyncEnabled()) {
    try {
      gasResult = await submitToGoogleAppsScript(newRequest);
    } catch (gasErr) {
      console.warn('Google Apps Script submission notice:', gasErr);
    }
  }

  return {
    success: true,
    data: newRequest,
    message: 'ยื่นคำขอสำเร็จและบันทึกข้อมูลเรียบร้อยแล้ว',
    emailResult: gasResult,
  };
}

/**
 * 2. Get all requests (Supports filtering)
 */
export async function apiGetRequests(filter?: { formType?: string; status?: string; q?: string }): Promise<{ success: boolean; data: VetLabRequest[]; count: number }> {
  // 1. Attempt Node.js server API
  const queryParams = new URLSearchParams();
  if (filter?.formType && filter.formType !== 'all') queryParams.set('formType', filter.formType);
  if (filter?.status && filter.status !== 'all') queryParams.set('status', filter.status);
  if (filter?.q) queryParams.set('q', filter.q);

  const serverRes = await safeFetchJson(`/api/requests?${queryParams.toString()}`);
  if (serverRes && serverRes.success && Array.isArray(serverRes.data)) {
    saveLocalRequests(serverRes.data);
    return serverRes;
  }

  // 2. Client-side fallback
  let list = getLocalRequests();
  if (filter?.formType && filter.formType !== 'all') {
    list = list.filter((r) => r.formType === filter.formType);
  }
  if (filter?.status && filter.status !== 'all') {
    list = list.filter((r) => r.status === filter.status);
  }
  if (filter?.q && filter.q.trim()) {
    const term = filter.q.trim().toLowerCase();
    list = list.filter(
      (r) =>
        (r.id && r.id.toLowerCase().includes(term)) ||
        (r.trackingNo && r.trackingNo.toLowerCase().includes(term)) ||
        (r.applicantName && r.applicantName.toLowerCase().includes(term)) ||
        (r.studentId && r.studentId.toLowerCase().includes(term)) ||
        (r.projectTitle && r.projectTitle.toLowerCase().includes(term)) ||
        (r.department && r.department.toLowerCase().includes(term))
    );
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { success: true, data: list, count: list.length };
}

/**
 * 3. Get single request by ID or TrackingNo
 */
export async function apiGetRequestById(idOrTracking: string): Promise<{ success: boolean; data: VetLabRequest | null }> {
  const clean = idOrTracking.trim();
  // 1. Attempt Node server
  const serverRes = await safeFetchJson(`/api/requests/${encodeURIComponent(clean)}`);
  if (serverRes && serverRes.success && serverRes.data) {
    return serverRes;
  }

  // 2. Client fallback
  const list = getLocalRequests();
  const found = list.find((r) => r.id === clean || (r.trackingNo && r.trackingNo.toLowerCase() === clean.toLowerCase()));
  return { success: !!found, data: found || null };
}

/**
 * 4. Update / Approve request (Part 2 / Part 3)
 */
export async function apiApproveRequest(idOrTracking: string, approvalData: any): Promise<{ success: boolean; data: VetLabRequest; message: string }> {
  // 1. Attempt Node server
  const serverRes = await safeFetchJson(`/api/requests/${encodeURIComponent(idOrTracking)}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(approvalData),
  });

  if (serverRes && serverRes.success && serverRes.data) {
    const list = getLocalRequests();
    saveLocalRequests(list.map((r) => (r.id === serverRes.data.id || r.trackingNo === serverRes.data.trackingNo ? serverRes.data : r)));
    return serverRes;
  }

  // 2. Client fallback
  const list = getLocalRequests();
  const idx = list.findIndex((r) => r.id === idOrTracking || r.trackingNo === idOrTracking);
  if (idx === -1) {
    throw new Error('ไม่พบข้อมูลคำขอที่ต้องการอนุมัติ');
  }

  const existing = list[idx];
  const { status: newStatus, part2: newPart2, part3: newPart3, stage, approvalStatus, comment, signature, assignedStaffName, assignedStaffEmail, assignedStaffComment, rejectionReason } = approvalData;

  const updated: VetLabRequest = { ...existing, updatedAt: new Date().toISOString() };

  if (newPart2) {
    updated.part2 = newPart2;
  }
  if (newPart3) {
    updated.part3 = newPart3;
  }
  if (newStatus) {
    updated.status = newStatus;
  }

  if (stage === 'part2' && !newPart2) {
    updated.part2 = {
      approvalStatus,
      comment,
      signature,
      reviewedAt: new Date().toISOString(),
      assignedStaffName,
      assignedStaffEmail,
      assignedStaffComment,
      rejectionReason,
    };
    if (approvalStatus === 'approved') {
      updated.status = 'approved_by_head';
    } else if (approvalStatus === 'rejected') {
      updated.status = 'rejected';
    }
  } else if (stage === 'part3' && !newPart3) {
    updated.part3 = {
      approvalStatus,
      comment,
      signature,
      reviewedAt: new Date().toISOString(),
    };
    if (approvalStatus === 'approved') {
      if (updated.formType === 'VET_LAB_04') {
        updated.status = 'dispensed';
      } else {
        updated.status = 'completed';
      }
    } else if (approvalStatus === 'rejected') {
      updated.status = 'rejected';
    }
  }

  list[idx] = updated;
  saveLocalRequests([...list]);

  // Sync to Google Apps Script
  if (isGasConfigured() && isGasSyncEnabled()) {
    try {
      await syncUpdateToGoogleAppsScript(updated);
    } catch (gasErr) {
      console.warn('GAS sync update error:', gasErr);
    }
  }

  return {
    success: true,
    data: updated,
    message: 'บันทึกการพิจารณาคำขอสำเร็จเรียบร้อย',
  };
}

/**
 * 5. Log User Login Event
 */
export async function apiLogLogin(user: any): Promise<void> {
  // Fire and forget server API
  safeFetchJson('/api/auth/login-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '-' }),
  }).catch(() => {});

  // Direct Google Apps Script logging
  if (isGasConfigured()) {
    logLoginToGoogleAppsScript(user).catch(() => {});
  }
}
