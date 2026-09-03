import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

function getNetworkIpAddress(): string {
  try {
    const ifaces = os.networkInterfaces();
    for (const dev in ifaces) {
      const list = ifaces[dev];
      if (!list) continue;
      for (const details of list) {
        if (details.family === 'IPv4' && !details.internal && details.address !== '127.0.0.1') {
          return details.address;
        }
      }
    }
  } catch (e) {}
  return 'localhost';
}

function resolveAppBaseUrl(req?: express.Request): string {
  const envUrl = process.env.APP_URL?.trim();
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/+$/, '');
  }

  const port = process.env.PORT || 3000;
  const protocol = req ? (req.headers['x-forwarded-proto'] || req.protocol || 'http') : 'http';
  const host = req ? req.get('host') : '';

  // If host is a real public domain or already has a reachable IP
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    return `${protocol}://${host}`;
  }

  // Fallback to local network IP so mobile devices and computers on KKU Wi-Fi can open email links
  const lanIp = getNetworkIpAddress();
  if (lanIp && lanIp !== 'localhost') {
    return `http://${lanIp}:${port}`;
  }

  return `http://localhost:${port}`;
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Initial seed requests
let requests: any[] = [
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
    durationDays: '5',
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
      { id: '1', no: 1, itemName: 'เครื่อง Real-time PCR (QuantStudio 5)', quantity: '1 เครื่อง', remarksLab: 'ห้องอณูชีววิทยา ชั้น 4' },
      { id: '2', no: 2, itemName: 'ตู้ดูดควันไอสารเคมี (Fume Hood Class II)', quantity: '1 ตู้', remarksLab: 'ห้องเคมี ชั้น 2' },
    ],
    timeSlot: 'official_hours',
    durationDays: '3',
    startDate: '2026-09-03',
    endDate: '2026-09-05',
    termsAccepted: true,
    applicantSignature: {
      name: 'ผศ.น.สพ.ดร.กิตติคม วงศ์สว่าง',
      date: '29 สิงหาคม 2569',
    },
    advisorSignature: {
      name: 'ผศ.น.สพ.ดร.กิตติคม วงศ์สว่าง',
      date: '29 สิงหาคม 2569',
    },
  },
  {
    id: 'req-003',
    trackingNo: 'VL04-2026-003',
    formType: 'VET_LAB_04',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submissionDateTh: '30 สิงหาคม 2569',
    applicantName: 'นางสาวพิชญา สุขุมพันธ์',
    role: 'student',
    studentId: '665180045-8',
    department: 'กลุ่มวิชาพยาธิชีววิทยา (Pathobiology)',
    phone: '086-987-6543',
    email: 'pichaya.s@kkumail.com',
    workType: 'research',
    projectTitle: 'การศึกษาการดื้อยาของแบคทีเรียในสุนัขและแมว',
    chemicalItems: [
      { id: '1', no: 1, itemName: 'Ethanol 95% AR Grade', quantity: '2 ขวด', remarks: 'ใช้ทำความสะอาดและสกัดสาร' },
      { id: '2', no: 2, itemName: 'Agarose Gel Electrophoresis Grade', quantity: '50 g', remarks: 'ใช้ทำเจลตรวจแยก DNA' },
      { id: '3', no: 3, itemName: 'Pipette Tips 10-200 µL (Yellow)', quantity: '2 กล่อง', remarks: 'งานดูดจ่ายสาร' },
    ],
    pickupDate: '2026-09-02',
    pickupTime: '13:30',
    termsAccepted: true,
    applicantSignature: {
      name: 'นางสาวพิชญา สุขุมพันธ์',
      date: '30 สิงหาคม 2569',
    },
    advisorSignature: {
      name: 'ผศ.ดร.ลักขณา ฉัตรทอง',
      date: '30 สิงหาคม 2569',
    },
  },
];

// In-memory Outbox logs
let emailLogs: any[] = [
  {
    id: 'mail-001',
    to: 'lakkch@kku.ac.th',
    subject: '[คำขอใหม่] ขอใช้ห้องปฏิบัติการ (VET.LAB 02) - นายสมชาย พันธุ์งาม (VL02-2026-001)',
    trackingNo: 'VL02-2026-001',
    status: 'sent',
    sentAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    htmlBody: `<div style="font-family: sans-serif; padding: 20px;"><h2>แจ้งเตือนคำขอใช้ห้องปฏิบัติการ</h2><p>ผู้ยื่น: นายสมชาย พันธุ์งาม</p><p>รหัสติดตาม: VL02-2026-001</p></div>`,
  },
];

// Helper to get nodemailer transporter with Gmail / Google Workspace / custom SMTP support
function getMailTransporter() {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, ''); // strip spaces from App Password
  const host = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!user || !pass) {
    return null;
  }

  // If host is gmail or email is @gmail.com or @kku.ac.th (Google Workspace)
  if (host.includes('gmail') || user.endsWith('@gmail.com') || user.endsWith('@kku.ac.th')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

// Helper to send email notification
async function dispatchEmailNotification(to: string, subject: string, htmlBody: string, trackingNo?: string) {
  const isConfigured = !!(process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim());
  const newLog: any = {
    id: 'mail-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    to,
    subject,
    trackingNo: trackingNo || 'SYS',
    status: isConfigured ? 'pending' : 'simulated',
    sentAt: new Date().toISOString(),
    htmlBody,
    mode: isConfigured ? 'smtp' : 'simulated',
    error: null,
  };

  if (isConfigured) {
    try {
      const transporter = getMailTransporter();
      if (!transporter) {
        throw new Error('การตั้งค่า SMTP ไม่สมบูรณ์ (ขาด User หรือ App Password)');
      }

      const senderName = process.env.SMTP_SENDER_NAME || 'งานห้องปฏิบัติการฯ คณะสัตวแพทยศาสตร์ มข.';
      const from = `"${senderName}" <${process.env.SMTP_USER}>`;

      await transporter.sendMail({
        from,
        to,
        subject,
        html: htmlBody,
      });

      newLog.status = 'sent';
      console.log(`[SMTP SUCCESS] Sent email to ${to}: "${subject}"`);
    } catch (err: any) {
      console.error('[SMTP ERROR] Failed to send email to', to, err);
      newLog.status = 'failed';
      newLog.error = err?.message || String(err);
    }
  } else {
    console.log(`[SMTP SIMULATED] No SMTP configured. Saved to outbox: "${subject}" to ${to}`);
  }

  emailLogs.unshift(newLog);
  return newLog;
}

// Helper to format items list
function formatItemsListText(request: any) {
  if (request.formType === 'VET_LAB_02' && request.labItems?.length) {
    return request.labItems.map((item: any, idx: number) => `<tr><td style="padding: 4px 0; color: #64748b;">ห้อง ${idx + 1}:</td><td style="padding: 4px 0; color: #0f172a; font-weight: 500;">${item.labName} ${item.remarks ? `(${item.remarks})` : ''}</td></tr>`).join('');
  } else if (request.formType === 'VET_LAB_03' && request.equipmentItems?.length) {
    return request.equipmentItems.map((item: any, idx: number) => `<tr><td style="padding: 4px 0; color: #64748b;">เครื่องมือ ${idx + 1}:</td><td style="padding: 4px 0; color: #0f172a; font-weight: 500;">${item.itemName} (${item.quantity}) ${item.remarksLab ? `[${item.remarksLab}]` : ''}</td></tr>`).join('');
  } else if (request.formType === 'VET_LAB_04' && request.chemicalItems?.length) {
    return request.chemicalItems.map((item: any, idx: number) => `<tr><td style="padding: 4px 0; color: #64748b;">รายการ ${idx + 1}:</td><td style="padding: 4px 0; color: #0f172a; font-weight: 500;">${item.itemName} (${item.quantity}) ${item.remarks ? `[${item.remarks}]` : ''}</td></tr>`).join('');
  }
  return '';
}

// Generate HTML email template with interactive buttons & clear workflow instructions
// Generate HTML email template with interactive buttons & clear workflow instructions
function createEmailNotificationHtml(
  request: any,
  stage: 'new_request_to_head' | 'submission_receipt_to_applicant' | 'head_rejected_to_applicant' | 'head_approved_to_caretaker' | 'final_review_to_applicant',
  baseUrl = ''
) {
  const origin = baseUrl || resolveAppBaseUrl();
  const cleanTrackingNo = encodeURIComponent(request.trackingNo || '');
  const cleanId = encodeURIComponent(request.id || '');

  const reviewUrl = `${origin}/?action=review&trackingNo=${cleanTrackingNo}&id=${cleanId}`;
  const printUrl = `${origin}/?action=print&trackingNo=${cleanTrackingNo}&id=${cleanId}`;
  const downloadUrl = `${origin}/?action=print&trackingNo=${cleanTrackingNo}&id=${cleanId}&download=1`;
  const trackUrl = `${origin}/?action=track&trackingNo=${cleanTrackingNo}`;

  const itemsHtml = formatItemsListText(request);
  const isCaretakerApproved = request.part3?.approvalStatus === 'approved' || request.status === 'completed' || request.status === 'dispensed';

  let bannerTitle = 'ระบบแบบฟอร์มขอรับบริการห้องปฏิบัติการ';
  let headerColor = 'linear-gradient(135deg, #c2410c, #7c2d12)';
  let stageHeadline = '';
  let actionSection = '';

  if (stage === 'new_request_to_head') {
    bannerTitle = 'แจ้งเตือนคำขอใช้บริการใหม่ (รอการพิจารณาส่วนที่ 2)';
    stageHeadline = `
      <div style="background: #fff7ed; border-left: 4px solid #ea580c; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 15px; font-weight: bold; color: #9a3412;">
          เรียน หัวหน้าห้องปฏิบัติการ (aelakkhana.shine.lc@gmail.com)
        </p>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #7c2d12;">
          มีผู้ขอรับบริการได้ยื่นแบบฟอร์มคำขอ <strong>${request.formType}</strong> เข้าสู่ระบบ โปรดเข้าพิจารณาคำขอในส่วนที่ 2 (อนุมัติ/ไม่อนุมัติ หรือมอบหมายนักวิชาการวิทยาศาสตร์ผู้รับผิดชอบดูแล)
        </p>
      </div>
    `;
    actionSection = `
      <div style="margin-top: 24px; text-align: center; background: #fafaf9; border: 1px dashed #d6d3d1; padding: 22px; border-radius: 12px;">
        <p style="margin: 0 0 14px 0; font-size: 14px; color: #1e293b; font-weight: bold;">
          กดปุ่มด้านล่างเพื่อเข้าสู่ระบบพิจารณาคำขอในส่วนที่ 2:
        </p>
        <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            <td align="center" style="background-color: #ea580c; border-radius: 8px;">
              <a href="${reviewUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: 'Sarabun', sans-serif; font-size: 14px; font-weight: bold; color: #ffffff !important; text-decoration: none; border-radius: 8px;">
                <span style="color: #ffffff !important; text-decoration: none;">🔘 เข้าพิจารณาคำขอ (ดูรายละเอียดคำขอ)</span>
              </a>
            </td>
          </tr>
        </table>
        <div style="margin-top: 14px;">
          <a href="${printUrl}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #0284c7; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px;">
            📥 ดาวน์โหลด / ดูแบบฟอร์ม PDF
          </a>
        </div>
        <p style="margin-top: 14px; font-size: 11px; color: #64748b; word-break: break-all; line-height: 1.4;">
          หากปุ่มไม่ทำงาน สามารถคัดลอกลิงก์นี้เปิดในเบราว์เซอร์:<br/>
          <a href="${reviewUrl}" target="_blank" style="color: #0284c7;">${reviewUrl}</a>
        </p>
      </div>
    `;
  } else if (stage === 'submission_receipt_to_applicant') {
    bannerTitle = 'ยื่นแบบฟอร์มคำขอสำเร็จ (รอการพิจารณา)';
    headerColor = 'linear-gradient(135deg, #0284c7, #0369a1)';
    stageHeadline = `
      <div style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 15px; font-weight: bold; color: #0369a1;">
          เรียน คุณ ${request.applicantName} (ผู้ขอรับบริการ)
        </p>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #0c4a6e;">
          ระบบได้รับแบบฟอร์มคำขอ <strong>${request.formType}</strong> (รหัสติดตาม: <strong>${request.trackingNo}</strong>) เรียบร้อยแล้ว
        </p>
        <p style="margin: 6px 0 0 0; font-size: 12px; color: #475569;">
          * ขณะนี้ระบบได้ส่งอีเมลแจ้งเตือนไปยังหัวหน้าห้องปฏิบัติการเพื่อเข้าพิจารณาคำขอในส่วนที่ 2 เรียบร้อยแล้ว เมื่อผ่านการพิจารณาครบถ้วน ระบบจะส่งอีเมลแจ้งผลฉบับสมบูรณ์ให้ท่านทราบต่อไป
        </p>
      </div>
    `;
    actionSection = `
      <div style="margin-top: 24px; text-align: center; background: #f8fafc; border: 1px solid #e2e8f0; padding: 22px; border-radius: 12px;">
        <p style="margin: 0 0 14px 0; font-size: 14px; color: #334155; font-weight: bold;">
          กดปุ่มด้านล่างเพื่อเชื่อมต่อไปยังหน้าเปิดไฟล์ PDF ของระบบ:
        </p>
        <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            <td align="center" style="background-color: #16a34a; border-radius: 8px;">
              <a href="${printUrl}" target="_blank" style="display: inline-block; padding: 13px 26px; font-family: 'Sarabun', sans-serif; font-size: 14px; font-weight: bold; color: #ffffff !important; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(22,163,74,0.25);">
                <span style="color: #ffffff !important; text-decoration: none;">📥 ดาวน์โหลด / ดูแบบฟอร์ม PDF</span>
              </a>
            </td>
          </tr>
        </table>
        <div style="margin-top: 14px;">
          <a href="${trackUrl}" target="_blank" style="font-size: 13px; color: #0284c7; text-decoration: underline; font-weight: 500;">
            🔍 ตรวจสอบสถานะคำขอออนไลน์
          </a>
        </div>
        <p style="margin-top: 10px; font-size: 11px; color: #64748b;">
          * กดปุ่มเพื่อเปิดดูและบันทึกไฟล์แบบฟอร์ม PDF ได้ทันทีจากระบบหน้าเว็บโดยตรง ไม่ต้องแนบไฟล์ในอีเมล
        </p>
      </div>
    `;
  } else if (stage === 'head_rejected_to_applicant') {
    bannerTitle = 'แจ้งผลการพิจารณาคำขอใช้บริการ';
    headerColor = 'linear-gradient(135deg, #dc2626, #991b1b)';
    stageHeadline = `
      <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 15px; font-weight: bold; color: #991b1b;">
          ผลการพิจารณา: ไม่อนุมัติคำขอ (สิ้นสุดกระบวนการ)
        </p>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #7f1d1d;">
          หัวหน้าห้องปฏิบัติการได้พิจารณาคำขอของท่านในส่วนที่ 2 แล้ว มีผลการพิจารณา "ไม่อนุมัติ"
        </p>
        <div style="margin-top: 10px; padding: 10px; background: #ffffff; border-radius: 6px; border: 1px solid #fecaca; font-size: 13px; color: #991b1b;">
          <strong>เหตุผลการไม่อนุมัติ / ความเห็น:</strong> ${request.part2?.rejectionReason || request.part2?.comment || 'ไม่เป็นไปตามเกณฑ์การขอใช้บริการ'}
        </div>
      </div>
    `;
    actionSection = `
      <div style="margin-top: 24px; text-align: center; background: #fafaf9; border: 1px solid #e7e5e4; padding: 22px; border-radius: 12px;">
        <p style="margin: 0 0 14px 0; font-size: 14px; color: #44403c; font-weight: bold;">
          กดปุ่มด้านล่างเพื่อเปิดดูเอกสารแบบฟอร์ม PDF ที่บันทึกการไม่อนุมัติบนหน้าเว็บ:
        </p>
        <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            <td align="center" style="background-color: #475569; border-radius: 8px;">
              <a href="${printUrl}" target="_blank" style="display: inline-block; padding: 13px 26px; font-family: 'Sarabun', sans-serif; font-size: 14px; font-weight: bold; color: #ffffff !important; text-decoration: none; border-radius: 8px;">
                <span style="color: #ffffff !important; text-decoration: none;">📥 ดาวน์โหลด / ดูแบบฟอร์ม PDF</span>
              </a>
            </td>
          </tr>
        </table>
        <p style="margin-top: 14px; font-size: 11px; color: #64748b; word-break: break-all; line-height: 1.4;">
          ลิงก์เปิดเอกสาร: <a href="${printUrl}" target="_blank" style="color: #0284c7;">${printUrl}</a>
        </p>
      </div>
    `;
  } else if (stage === 'head_approved_to_caretaker') {
    bannerTitle = 'มอบหมายงาน: ได้รับการอนุมัติจากหัวหน้าห้องปฏิบัติการแล้ว';
    headerColor = 'linear-gradient(135deg, #0284c7, #0369a1)';
    const assignedName = request.part2?.assignedStaffName || 'นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ';
    const assignedDept = request.part2?.assignedStaffDepartment ? ` (สาขาวิชา: ${request.part2.assignedStaffDepartment})` : '';
    stageHeadline = `
      <div style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 15px; font-weight: bold; color: #0369a1;">
          เรียน ${assignedName}${assignedDept} (นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบดูแลห้องปฏิบัติการ/เครื่องมือ)
        </p>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #0c4a6e;">
          คำขอใช้บริการนี้<strong>ได้รับการอนุมัติจากหัวหน้าห้องปฏิบัติการแล้ว</strong> และได้มอบหมายงานตรงมายังท่าน โปรดเข้าสู่ระบบเพื่อตรวจสอบความพร้อมและพิจารณาลงนามในส่วนที่ 3 ต่อไป
        </p>
        <div style="margin-top: 10px; padding: 10px; background: #ffffff; border-radius: 6px; border: 1px solid #bae6fd; font-size: 13px; color: #0369a1;">
          <strong>คำสั่งการมอบหมาย:</strong> ${request.part2?.assignedStaffComment || request.part2?.comment || 'มอบหมายให้ตรวจสอบความพร้อมและประสานงาน'}
        </div>
      </div>
    `;
    actionSection = `
      <div style="margin-top: 24px; text-align: center; background: #f8fafc; border: 1px dashed #cbd5e1; padding: 22px; border-radius: 12px;">
        <p style="margin: 0 0 14px 0; font-size: 14px; color: #334155; font-weight: bold;">
          กดปุ่มด้านล่างเพื่อเข้าจัดการคำขอและตรวจสอบความพร้อมในส่วนที่ 3:
        </p>
        <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            <td align="center" style="background-color: #0284c7; border-radius: 8px;">
              <a href="${reviewUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: 'Sarabun', sans-serif; font-size: 14px; font-weight: bold; color: #ffffff !important; text-decoration: none; border-radius: 8px;">
                <span style="color: #ffffff !important; text-decoration: none;">🔘 เข้าพิจารณาคำขอ (ดูรายละเอียดคำขอ)</span>
              </a>
            </td>
          </tr>
        </table>
        <div style="margin-top: 14px;">
          <a href="${printUrl}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #16a34a; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px;">
            📥 ดาวน์โหลด / ดูแบบฟอร์ม PDF
          </a>
        </div>
        <p style="margin-top: 14px; font-size: 11px; color: #64748b; word-break: break-all; line-height: 1.4;">
          หากปุ่มไม่ทำงาน สามารถคัดลอกลิงก์นี้เปิดในเบราว์เซอร์:<br/>
          <a href="${reviewUrl}" target="_blank" style="color: #0284c7;">${reviewUrl}</a>
        </p>
      </div>
    `;
  } else if (stage === 'final_review_to_applicant') {
    bannerTitle = 'แจ้งผลการพิจารณาคำขอใช้บริการห้องปฏิบัติการ (เสร็จสิ้นครบทั้ง 2 ฝ่าย)';
    headerColor = isCaretakerApproved ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, #dc2626, #991b1b)';
    const headName = request.part2?.signature?.name || 'หัวหน้าห้องปฏิบัติการ';
    const headComment = request.part2?.comment || '-';
    const officerName = request.part3?.signature?.name || request.part2?.assignedStaffName || 'นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ';
    const officerEmail = request.part2?.assignedStaffEmail || '-';
    const officerDept = request.part2?.assignedStaffDepartment ? ` (สาขาวิชา: ${request.part2.assignedStaffDepartment})` : '';
    const officerComment = request.part3?.comment || request.part3?.rejectionReason || '-';

    stageHeadline = `
      <div style="background: ${isCaretakerApproved ? '#f0fdf4' : '#fef2f2'}; border-left: 4px solid ${isCaretakerApproved ? '#16a34a' : '#dc2626'}; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 16px; font-weight: bold; color: ${isCaretakerApproved ? '#166534' : '#991b1b'};">
          ผลการพิจารณาคำขอ: ${isCaretakerApproved ? '✓ อนุมัติพร้อมให้บริการ' : '✕ ไม่อนุมัติ / ไม่พร้อมให้บริการ'}
        </p>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #334155;">
          นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบได้บันทึกผลการตรวจสอบความพร้อมและลงนามเรียบร้อยแล้ว โดยคำขอของท่าน<strong>ผ่านการพิจารณาเสร็จสิ้นครบถ้วนทั้ง 2 ฝ่าย</strong> ดังนี้:
        </p>

        <!-- Summary of Both Review Steps -->
        <div style="margin-top: 14px; padding: 14px; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 13px; color: #1e293b;">
          <div style="padding-bottom: 10px; border-bottom: 1px dashed #cbd5e1;">
            <div style="font-weight: bold; color: #0284c7; font-size: 13px;">
              ส่วนที่ 2: การพิจารณาโดยหัวหน้าห้องปฏิบัติการ
            </div>
            <div style="font-size: 12px; color: #334155; margin-top: 3px;">
              • <strong>ผู้พิจารณา:</strong> ${headName}
            </div>
            <div style="font-size: 12px; color: #334155; margin-top: 2px;">
              • <strong>ผลการพิจารณา:</strong> ${request.part2?.approvalStatus === 'approved' ? 'อนุมัติและมอบหมายงาน' : 'ไม่อนุมัติ'}
            </div>
            ${headComment !== '-' ? `<div style="font-size: 12px; color: #475569; margin-top: 2px;">• <strong>ความเห็น/คำสั่งมอบหมาย:</strong> ${headComment}</div>` : ''}
          </div>

          <div style="padding-top: 10px;">
            <div style="font-weight: bold; color: #059669; font-size: 13px;">
              ส่วนที่ 3: การตรวจสอบโดยนักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ
            </div>
            <div style="font-size: 12px; color: #334155; margin-top: 3px;">
              • <strong>ผู้รับผิดชอบ:</strong> ${officerName}${officerDept} (${officerEmail})
            </div>
            <div style="font-size: 12px; color: #334155; margin-top: 2px;">
              • <strong>ผลการตรวจสอบความพร้อม:</strong> ${isCaretakerApproved ? 'พร้อมให้บริการ' : 'ไม่พร้อมให้บริการ'}
            </div>
            <div style="font-size: 12px; color: #475569; margin-top: 2px;">
              • <strong>บันทึก/คำแนะนำ:</strong> ${officerComment}
            </div>
          </div>
        </div>

        <!-- Official Contact Warning Notice as requested -->
        <div style="margin-top: 14px; background: #fff7ed; border: 1px solid #fdba74; padding: 12px 14px; border-radius: 8px; color: #9a3412; font-weight: bold; font-size: 13px; text-align: center; line-height: 1.5;">
          ** โปรดติดต่อนักวิชาการวิทยาศาสตร์ผู้รับผิดชอบตามรายละเอียดในแบบฟอร์ม **
        </div>
      </div>
    `;
    actionSection = `
      <div style="margin-top: 24px; text-align: center; background: #f8fafc; border: 1px solid #e2e8f0; padding: 22px; border-radius: 12px;">
        <p style="margin: 0 0 14px 0; font-size: 14px; color: #334155; font-weight: bold;">
          กดปุ่มด้านล่างเพื่อเปิดหน้าไฟล์ PDF ของระบบ (ฉบับสมบูรณ์ มีลายมือชื่ออิเล็กทรอนิกส์ครบทุกส่วน):
        </p>
        <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            <td align="center" style="background-color: #16a34a; border-radius: 8px;">
              <a href="${printUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: 'Sarabun', sans-serif; font-size: 14px; font-weight: bold; color: #ffffff !important; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(22,163,74,0.3);">
                <span style="color: #ffffff !important; text-decoration: none;">📥 ดาวน์โหลด / ดูแบบฟอร์ม PDF</span>
              </a>
            </td>
          </tr>
        </table>
        <div style="margin-top: 14px;">
          <a href="${trackUrl}" target="_blank" style="font-size: 13px; color: #0284c7; text-decoration: underline; font-weight: 500;">
            🔍 ตรวจสอบสถานะคำขอออนไลน์
          </a>
        </div>
        <p style="margin-top: 14px; font-size: 11px; color: #64748b; word-break: break-all; line-height: 1.4;">
          ลิงก์เปิดเอกสาร PDF: <a href="${printUrl}" target="_blank" style="color: #0284c7;">${printUrl}</a>
        </p>
      </div>
    `;
  }

  return `
    <div style="font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <!-- Header Banner -->
      <div style="background: ${headerColor}; color: #ffffff; padding: 24px 28px; text-align: center;">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #fef08a; font-weight: bold; margin-bottom: 4px;">
          คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น
        </div>
        <h1 style="margin: 0; font-size: 19px; font-weight: bold; color: #ffffff;">
          ${bannerTitle}
        </h1>
        <div style="margin-top: 10px; display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; color: #ffffff;">
          รหัสติดตาม (Tracking No): <span style="color: #fef08a; font-family: monospace;">${request.trackingNo}</span>
        </div>
      </div>

      <!-- Main Body -->
      <div style="padding: 26px 28px; color: #1e293b; line-height: 1.6;">
        ${stageHeadline}

        <!-- Details Box -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 16px 0;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
            รายละเอียดคำขอ (${request.formType})
          </h3>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px 0; color: #64748b; width: 130px;"><strong>ผู้ยื่นคำขอ:</strong></td>
              <td style="padding: 5px 0; color: #0f172a;">${request.applicantName} (${request.role === 'student' ? `นักศึกษา รหัส ${request.studentId}` : request.role === 'faculty_staff' ? 'อาจารย์/บุคลากร' : 'บุคคลภายนอก'})</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;"><strong>สังกัด/ภาควิชา:</strong></td>
              <td style="padding: 5px 0; color: #0f172a;">${request.department || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;"><strong>โทรศัพท์/อีเมล:</strong></td>
              <td style="padding: 5px 0; color: #0f172a;">${request.phone} | ${request.email}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;"><strong>หัวข้อโครงงาน/วิจัย:</strong></td>
              <td style="padding: 5px 0; color: #0f172a; font-weight: bold;">${request.projectTitle || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;"><strong>วันที่ยื่น:</strong></td>
              <td style="padding: 5px 0; color: #0f172a;">${request.submissionDateTh || '-'}</td>
            </tr>
            ${itemsHtml}
          </table>
        </div>

        ${actionSection}
      </div>

      <!-- Footer -->
      <div style="background: #f1f5f9; padding: 14px 28px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
        คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น 123 ถ.มิตรภาพ อ.เมือง จ.ขอนแก่น 40002
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), activeRequests: requests.length });
});

// 2. Get all requests (with filtering)
app.get('/api/requests', (req, res) => {
  let list = [...requests];
  const { formType, status, q } = req.query;

  if (formType && formType !== 'all') {
    list = list.filter((r) => r.formType === formType);
  }
  if (status && status !== 'all') {
    list = list.filter((r) => r.status === status);
  }
  if (q && typeof q === 'string' && q.trim()) {
    const term = q.trim().toLowerCase();
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

  // Sort descending by creation date
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ success: true, count: list.length, data: list });
});

// Helper: Real-time Google Sheets Backup
async function syncToGoogleSheets(action: 'submit_form' | 'update_status' | 'log_login', payloadData: any) {
  const gasUrl = (process.env.GAS_WEB_APP_URL || '').trim();
  if (!gasUrl) return null;

  try {
    const payload = {
      action,
      trackingNo: payloadData?.trackingNo,
      status: payloadData?.status,
      ...payloadData,
      requestData: action !== 'log_login' ? {
        ...payloadData,
        syncedVia: 'SERVER_REALTIME_BACKUP',
        syncedAt: new Date().toISOString(),
      } : undefined,
    };

    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`[GOOGLE SHEETS REAL-TIME BACKUP SUCCESS] (${action})`, data);
      return data;
    } else {
      console.warn(`[GOOGLE SHEETS BACKUP WARN] HTTP ${res.status}`);
    }
  } catch (err: any) {
    console.warn(`[GOOGLE SHEETS BACKUP ERROR] ${err.message}`);
  }
  return null;
}

// 3. Create new request
app.post('/api/requests', async (req, res) => {
  try {
    const body = req.body;
    const year = new Date().getFullYear();
    const countSeq = String(requests.length + 1).padStart(3, '0');
    let prefix = 'VL';

    if (body.formType === 'VET_LAB_02') prefix = 'VL02';
    else if (body.formType === 'VET_LAB_03') prefix = 'VL03';
    else if (body.formType === 'VET_LAB_04') prefix = 'VL04';

    const trackingNo = `${prefix}-${year}-${countSeq}`;
    const newRequest = {
      ...body,
      id: 'req-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      trackingNo,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    requests.unshift(newRequest);

    // Real-time Backup submission to Google Sheets
    syncToGoogleSheets('submit_form', newRequest).catch(() => {});

    // Step 1: Send email notification to Head of Lab (aelakkhana.shine.lc@gmail.com) to review Part 2
    const baseUrl = resolveAppBaseUrl(req);

    const headLabEmail = process.env.HEAD_LAB_EMAIL || 'aelakkhana.shine.lc@gmail.com';
    const headEmailHtml = createEmailNotificationHtml(newRequest, 'new_request_to_head', baseUrl);
    const headEmailSubject = `[คำขอใหม่] ${newRequest.formType} - ${newRequest.applicantName} (${newRequest.trackingNo}) เพื่อเข้าพิจารณาคำขอในส่วนที่ 2`;
    const emailResult = await dispatchEmailNotification(headLabEmail, headEmailSubject, headEmailHtml, trackingNo);

    // Also send receipt notification to applicant if email is provided
    if (newRequest.email) {
      const applicantReceiptHtml = createEmailNotificationHtml(newRequest, 'submission_receipt_to_applicant', baseUrl);
      await dispatchEmailNotification(
        newRequest.email,
        `[ยื่นคำขอสำเร็จ] ${newRequest.formType} - รหัสติดตาม ${newRequest.trackingNo} (รอการพิจารณาในส่วนที่ 2)`,
        applicantReceiptHtml,
        trackingNo
      );
    }

    res.status(201).json({
      success: true,
      message: 'ยื่นคำขอสำเร็จและส่งอีเมลแจ้งเตือนหัวหน้างานเรียบร้อยแล้ว',
      data: newRequest,
      emailResult,
    });
  } catch (err: any) {
    console.error('Error creating request:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// 4. Get single request
app.get('/api/requests/:id', (req, res) => {
  const found = requests.find((r) => r.id === req.params.id || r.trackingNo === req.params.id);
  if (!found) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }
  res.json({ success: true, data: found });
});

// 5. Update / Review / Approve request (Workflow Step 2 & Step 3)
app.post('/api/requests/:id/approve', async (req, res) => {
  const index = requests.findIndex((r) => r.id === req.params.id || r.trackingNo === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  const { status, part2, part3, reviewerName } = req.body;
  const current = requests[index];
  const isHeadAction = part2 && (!current.part2 || current.status === 'pending');

  const updated = {
    ...current,
    status: status || current.status,
    part2: part2 !== undefined ? part2 : current.part2,
    part3: part3 !== undefined ? part3 : current.part3,
    updatedAt: new Date().toISOString(),
  };

  requests[index] = updated;
  const baseUrl = resolveAppBaseUrl(req);

  // WORKFLOW STEP 2: Head of Lab Review (นางสุธิดา จันทร์ลุน)
  if (isHeadAction || (part2 && part2.approvalStatus)) {
    if (part2.approvalStatus === 'rejected') {
      // Step 2.A: Rejected by Head -> Send email to applicant immediately with rejection reason & PDF download link
      if (updated.email) {
        const rejectHtml = createEmailNotificationHtml(updated, 'head_rejected_to_applicant', baseUrl);
        const rejectSubject = `[แจ้งผลการพิจารณาคำขอ] ไม่อนุมัติคำขอ ${updated.trackingNo} - ${updated.formType}`;
        await dispatchEmailNotification(updated.email, rejectSubject, rejectHtml, updated.trackingNo);
      }
    } else if (part2.approvalStatus === 'approved') {
      // Step 2.B: Approved by Head -> Send email to assigned Scientist/Caretaker with notification that Head approved & review button
      const caretakerEmail = part2.assignedStaffEmail || 'schaiya@kku.ac.th';
      const assignHtml = createEmailNotificationHtml(updated, 'head_approved_to_caretaker', baseUrl);
      const assignSubject = `[มอบหมายงาน] คำขอ ${updated.trackingNo} ได้รับการอนุมัติจากหัวหน้าห้องปฏิบัติการแล้ว - โปรดดำเนินการตรวจสอบความพร้อม`;
      await dispatchEmailNotification(caretakerEmail, assignSubject, assignHtml, updated.trackingNo);
    }
  }

  // WORKFLOW STEP 3: Scientist / Lab Officer Review (ผู้รับผิดชอบดูแลห้องปฏิบัติการ/อุปกรณ์เครื่องมือ)
  // Send email to applicant ONLY after consideration is finished by both Head and Scientist
  if (part3 && part3.approvalStatus && status !== 'approved_by_head') {
    if (updated.email) {
      const isApproved = part3.approvalStatus === 'approved';
      const finalHtml = createEmailNotificationHtml(updated, 'final_review_to_applicant', baseUrl);
      const finalSubject = `[แจ้งผลการพิจารณาคำขอ] ${isApproved ? 'อนุมัติพร้อมให้บริการ' : 'ไม่อนุมัติ'} คำขอ ${updated.trackingNo} - ${updated.formType} (เสร็จสิ้นการพิจารณา)`;
      await dispatchEmailNotification(updated.email, finalSubject, finalHtml, updated.trackingNo);
    }
  }

  // Real-time Backup consideration & review result to Google Sheets
  syncToGoogleSheets('update_status', updated).catch(() => {});

  res.json({ success: true, message: 'บันทึกผลการพิจารณาและส่งอีเมลแจ้งเตือนตามขั้นตอนเรียบร้อย', data: updated });
});

// 6. Delete request
app.delete('/api/requests/:id', (req, res) => {
  const index = requests.findIndex((r) => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }
  const deleted = requests.splice(index, 1);
  res.json({ success: true, message: 'ลบรายการสำเร็จ', data: deleted[0] });
});

// Direct Action Routes (Convenience redirects for email links)
app.get('/review/:trackingNo', (req, res) => {
  res.redirect(302, `/?action=review&trackingNo=${encodeURIComponent(req.params.trackingNo)}`);
});
app.get('/print/:trackingNo', (req, res) => {
  res.redirect(302, `/?action=print&trackingNo=${encodeURIComponent(req.params.trackingNo)}`);
});
app.get('/track/:trackingNo', (req, res) => {
  res.redirect(302, `/?action=track&trackingNo=${encodeURIComponent(req.params.trackingNo)}`);
});

// 7. Get outbox emails
app.get('/api/emails', (req, res) => {
  res.json({ success: true, count: emailLogs.length, data: emailLogs });
});

// 8. Test email sending
app.post('/api/emails/test', async (req, res) => {
  const { toEmail } = req.body;
  const target = (toEmail || process.env.SMTP_USER || 'lakkch@kku.ac.th').trim();
  const html = `
    <div style="font-family: 'Sarabun', -apple-system, sans-serif; padding: 24px; border: 1px solid #ea580c; border-radius: 12px; background: #ffffff; max-width: 520px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="background: #c2410c; color: white; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;">
        <h2 style="margin: 0; font-size: 18px;">🎉 ทดสอบระบบอีเมลแจ้งเตือนสำเร็จ</h2>
        <div style="font-size: 12px; opacity: 0.9;">KKU Vet Lab Online Forms System</div>
      </div>
      <p style="color: #334155; line-height: 1.6; font-size: 14px;">
        นี่คืออีเมลทดสอบจาก <strong>ระบบแบบฟอร์มขอรับบริการห้องปฏิบัติการ คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น</strong>
        หากคุณได้รับอีเมลนี้ แสดงว่าระบบสามารถส่งออกอีเมลจริงผ่าน Mail Server ได้อย่างถูกต้องสมบูรณ์แล้ว
      </p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; font-size: 12px; color: #64748b; margin-top: 16px;">
        <div><strong>ส่งโดย:</strong> ${process.env.SMTP_USER || 'ยังไม่ได้ระบุ'}</div>
        <div><strong>ส่งถึง:</strong> ${target}</div>
        <div><strong>เวลาที่ส่ง:</strong> ${new Date().toLocaleString('th-TH')}</div>
      </div>
    </div>
  `;

  const log = await dispatchEmailNotification(target, '[KKU Vet Lab] ทดสอบระบบส่งอีเมลแจ้งเตือนจริง', html, 'TEST-EMAIL');

  if (log.status === 'sent') {
    res.json({
      success: true,
      message: `ส่งอีเมลจริงไปยัง ${target} สำเร็จแล้ว! โปรดตรวจสอบในกล่องจดหมายเข้า (Inbox) หรือโฟลเดอร์สแปม`,
      data: log,
    });
  } else if (log.status === 'failed') {
    res.status(400).json({
      success: false,
      message: `ส่งอีเมลไม่สำเร็จ: ${log.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ SMTP'}`,
      data: log,
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'ยังไม่ได้ตั้งค่าบัญชีอีเมลส่งออก (SMTP) จริง กรุณาตั้งค่าอีเมลและ App Password ในแท็บ "ตั้งค่าอีเมลส่งจริง"',
      data: log,
    });
  }
});

// 9. Get SMTP Configuration Status
app.get('/api/smtp-config', (req, res) => {
  const user = process.env.SMTP_USER || '';
  const hasPass = !!(process.env.SMTP_PASS && process.env.SMTP_PASS.trim());
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const adminEmail = process.env.ADMIN_EMAIL || user || 'suthidaj@kku.ac.th';
  const senderName = process.env.SMTP_SENDER_NAME || 'งานห้องปฏิบัติการฯ คณะสัตวแพทยศาสตร์ มข.';

  res.json({
    success: true,
    configured: !!(user && hasPass),
    host,
    port,
    user,
    hasPass,
    secure,
    adminEmail,
    senderName,
  });
});

// Helper to update or append .env variables
const setEnvVar = (content: string, key: string, value: string) => {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}="${value}"`);
  }
  return content.trim() + `\n${key}="${value}"\n`;
};

// 10. Save & Verify SMTP Configuration
app.post('/api/smtp-config', async (req, res) => {
  const { host, port, user, pass, secure, adminEmail, senderName } = req.body;

  const testUser = (user || process.env.SMTP_USER || '').trim();
  const testPass = pass !== undefined ? pass.replace(/\s+/g, '') : (process.env.SMTP_PASS || '').replace(/\s+/g, '');
  const testHost = (host || process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const testPort = Number(port) || 465;
  const testSecure = secure !== undefined ? Boolean(secure) : testPort === 465;
  const newSenderName = (senderName || 'งานห้องปฏิบัติการฯ คณะสัตวแพทยศาสตร์ มข.').trim();

  if (!testUser || !testPass) {
    return res.status(400).json({
      success: false,
      message: 'กรุณาระบุอีเมลผู้ส่งและรหัสผ่านแอป (App Password 16 หลัก)',
    });
  }

  // Create transporter to verify credentials
  let testTransporter;
  if (testHost.includes('gmail') || testUser.endsWith('@gmail.com') || testUser.endsWith('@kku.ac.th')) {
    testTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: testUser, pass: testPass },
    });
  } else {
    testTransporter = nodemailer.createTransport({
      host: testHost,
      port: testPort,
      secure: testSecure,
      auth: { user: testUser, pass: testPass },
    });
  }

  try {
    // Attempt real connection handshake
    await testTransporter.verify();

    // Update in-memory process.env
    process.env.SMTP_USER = testUser;
    process.env.SMTP_PASS = testPass;
    process.env.SMTP_HOST = testHost;
    process.env.SMTP_PORT = String(testPort);
    process.env.SMTP_SECURE = String(testSecure);
    process.env.SMTP_SENDER_NAME = newSenderName;
    if (adminEmail) {
      process.env.ADMIN_EMAIL = adminEmail.trim();
    }

    // Persist to .env
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }


    envContent = setEnvVar(envContent, 'SMTP_USER', testUser);
    envContent = setEnvVar(envContent, 'SMTP_PASS', testPass);
    envContent = setEnvVar(envContent, 'SMTP_HOST', testHost);
    envContent = setEnvVar(envContent, 'SMTP_PORT', String(testPort));
    envContent = setEnvVar(envContent, 'SMTP_SECURE', String(testSecure));
    envContent = setEnvVar(envContent, 'SMTP_SENDER_NAME', newSenderName);
    if (adminEmail) {
      envContent = setEnvVar(envContent, 'ADMIN_EMAIL', adminEmail.trim());
    }

    fs.writeFileSync(envPath, envContent, 'utf8');

    res.json({
      success: true,
      message: 'เชื่อมต่อและตรวจสอบสิทธิ์กับ Mail Server สำเร็จ! บันทึกการตั้งค่าเรียบร้อยแล้ว',
      configured: true,
    });
  } catch (err: any) {
    console.error('SMTP verify error:', err);
    let friendlyMsg = err?.message || 'ไม่สามารถเชื่อมต่อกับ SMTP Server ได้';
    if (err?.code === 'EAUTH' || friendlyMsg.includes('Username and Password not accepted') || friendlyMsg.includes('Invalid login')) {
      friendlyMsg = 'อีเมลหรือ App Password ไม่ถูกต้อง (สำหรับ Gmail หรือ @kku.ac.th ต้องใช้รหัสผ่านสำหรับแอป 16 หลัก ที่สร้างจาก Google Account เท่านั้น)';
    }
    res.status(400).json({
      success: false,
      message: friendlyMsg,
      errorCode: err?.code,
    });
  }
});

// 11. Get Google Apps Script / Google Sheets config
app.get('/api/gas-config', (req, res) => {
  const url = process.env.GAS_WEB_APP_URL || '';
  res.json({
    success: true,
    configured: !!url,
    url,
  });
});

// 12. Save & Test Google Apps Script / Google Sheets config
app.post('/api/gas-config', async (req, res) => {
  try {
    const { url } = req.body;
    const cleanUrl = (url || '').trim();

    if (cleanUrl) {
      // Test ping connection
      const testRes = await fetch(cleanUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'test_connection', timestamp: new Date().toISOString() }),
      });

      if (!testRes.ok) {
        throw new Error(`Google Apps Script ตอบกลับด้วยรหัส HTTP ${testRes.status}`);
      }

      const testData = await testRes.json();
      if (!testData.success) {
        throw new Error(testData.message || testData.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ Google Apps Script');
      }

      // Save to process.env and .env
      process.env.GAS_WEB_APP_URL = cleanUrl;
      const envPath = path.join(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        envContent = setEnvVar(envContent, 'GAS_WEB_APP_URL', cleanUrl);
        fs.writeFileSync(envPath, envContent, 'utf8');
      }

      return res.json({
        success: true,
        message: `เชื่อมต่อและบันทึก Google Sheets (${testData.spreadsheetName || 'สำเร็จ'}) เรียบร้อยแล้ว`,
        data: testData,
      });
    } else {
      process.env.GAS_WEB_APP_URL = '';
      const envPath = path.join(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        envContent = setEnvVar(envContent, 'GAS_WEB_APP_URL', '');
        fs.writeFileSync(envPath, envContent, 'utf8');
      }
      return res.json({ success: true, message: 'ยกเลิกการเชื่อมต่อ Google Sheets แล้ว' });
    }
  } catch (err: any) {
    console.error('GAS config test error:', err);
    res.status(400).json({ success: false, message: err.message || 'ไม่สามารถเชื่อมต่อ Google Apps Script ได้' });
  }
});

// 13. Real-time User Login Logger to Google Sheets (Sheet: เข้าสู่ระบบ)
app.post('/api/auth/login-log', (req, res) => {
  const { user, userAgent } = req.body;
  if (user && user.email) {
    console.log(`[USER LOGIN EVENT] ${user.name} (${user.email}) - ${user.roleTitle || user.role}`);
    syncToGoogleSheets('log_login', {
      user,
      userAgent: userAgent || req.headers['user-agent'] || '-',
      source: 'KKU Vet Lab Portal (Server Log)',
    }).catch(() => {});
  }
  res.json({ success: true, message: 'บันทึกประวัติการเข้าสู่ระบบเรียบร้อย' });
});

// ----------------------------------------------------
// Vite Middleware / Static Server
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KKU Vet Lab Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
