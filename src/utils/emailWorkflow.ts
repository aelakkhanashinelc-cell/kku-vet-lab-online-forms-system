import { VetLabRequest } from '../types';

export const LAB_OFFICIALS = {
  headOfLab: {
    name: 'นางสุธิดา จันทร์ลุน',
    position: 'นักวิชาการวิทยาศาสตร์ ชำนาญการพิเศษ',
    roleTitle: 'หัวหน้าห้องปฏิบัติการ',
    department: 'คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น',
    email: 'aelakkhana.shine.lc@gmail.com',
  },
  coordinator: {
    name: 'คุณรัตนา หลายวิวัฒน์',
    roleTitle: 'ผู้ประสานงานห้องปฏิบัติการ',
  },
  primaryEmail: 'aelakkhana.shine.lc@gmail.com',
  fallbackEmails: ['aelakkhana.shine.lc@gmail.com', 'lakkch@kku.ac.th'],
};

export function getFormTypeName(formType: string): string {
  switch (formType) {
    case 'VET_LAB_01':
      return 'VET.LAB 01 (แบบรับทราบระเบียบการใช้ห้องปฏิบัติการ)';
    case 'VET_LAB_02':
      return 'VET.LAB 02 (แบบฟอร์มขอใช้ห้องปฏิบัติการ)';
    case 'VET_LAB_03':
      return 'VET.LAB 03 (แบบฟอร์มขอใช้เครื่องมือวิทยาศาสตร์)';
    case 'VET_LAB_04':
      return 'VET.LAB 04 (แบบฟอร์มขอเบิกจ่ายสารเคมีและวัสดุวิทยาศาสตร์)';
    default:
      return 'แบบคำขอใช้บริการห้องปฏิบัติการ';
  }
}

export function formatItemsSummary(request: VetLabRequest): string {
  if (request.formType === 'VET_LAB_02' && request.labItems?.length) {
    return `รายการห้องปฏิบัติการที่ขอใช้:\n` +
      request.labItems.map((item, idx) => `  ${idx + 1}. ${item.labName} ${item.remarks ? `(หมายเหตุ: ${item.remarks})` : ''}`).join('\n') +
      `\nช่วงเวลา: ${request.timeSlot === 'official_hours' ? 'ในเวลาราชการ' : request.timeSlot === 'after_hours' ? 'นอกเวลาราชการ' : 'ทั้งในและนอกเวลาราชการ'}` +
      `\nระยะเวลา: ${request.durationDays || '-'} วัน (${request.startDate || '-'} ถึง ${request.endDate || '-'})`;
  } else if (request.formType === 'VET_LAB_03' && request.equipmentItems?.length) {
    return `รายการเครื่องมือที่ขอใช้:\n` +
      request.equipmentItems.map((item, idx) => `  ${idx + 1}. ${item.itemName} - จำนวน ${item.quantity} ${item.remarksLab ? `(ประจำห้อง: ${item.remarksLab})` : ''}`).join('\n') +
      `\nประเภทการใช้งาน: ${request.equipmentType === 'lab_based' ? 'ใช้ภายในห้องปฏิบัติการ' : 'ใช้นอกสถานที่/ภาคสนาม'}` +
      `\nระยะเวลา: ${request.durationDays || '-'} วัน (${request.startDate || '-'} ถึง ${request.endDate || '-'})`;
  } else if (request.formType === 'VET_LAB_04' && request.chemicalItems?.length) {
    return `รายการสารเคมี/วัสดุที่ขอเบิก:\n` +
      request.chemicalItems.map((item, idx) => `  ${idx + 1}. ${item.itemName} - จำนวน ${item.quantity} ${item.remarks ? `(วัตถุประสงค์: ${item.remarks})` : ''}`).join('\n') +
      `\nกำหนดรับของ: ${request.pickupDate || '-'} เวลา ${request.pickupTime || '-'} น.`;
  }
  return '-';
}

/**
 * 1. Step 1: อีเมลแจ้งเตือนคำขอใหม่ไปยังหัวหน้างาน (นางสุธิดา จันทร์ลุน) พร้อมปุ่มจัดการคำขอ
 */
export function generateHeadNotificationEmail(request: VetLabRequest, baseUrl?: string): { subject: string; body: string; reviewUrl: string } {
  const formName = getFormTypeName(request.formType);
  const appOrigin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const reviewUrl = appOrigin ? `${appOrigin}?action=review&id=${encodeURIComponent(request.id)}&trackingNo=${encodeURIComponent(request.trackingNo)}` : '';
  const printUrl = appOrigin ? `${appOrigin}?action=print&id=${encodeURIComponent(request.id)}&trackingNo=${encodeURIComponent(request.trackingNo)}` : '';
  const downloadUrl = appOrigin ? `${appOrigin}?action=print&id=${encodeURIComponent(request.id)}&trackingNo=${encodeURIComponent(request.trackingNo)}&download=1` : '';
  const itemsDetail = formatItemsSummary(request);

  const subject = `[คำขอใหม่] ${formName} - ${request.applicantName} (รหัส: ${request.trackingNo})`;
  const body = `เรียน หัวหน้าห้องปฏิบัติการ (${LAB_OFFICIALS.headOfLab.name}, ${LAB_OFFICIALS.headOfLab.position})

มีผู้ขอรับบริการได้กรอกและยื่นคำขอ ${formName} เข้าสู่ระบบ โดยมีรายละเอียดดังนี้:

• รหัสติดตามคำขอ (Tracking No): ${request.trackingNo}
• ผู้ยื่นคำขอ: ${request.applicantName} ${request.studentId ? `(รหัสนักศึกษา: ${request.studentId})` : ''}
• สังกัด/ภาควิชา: ${request.department || '-'}
• โทรศัพท์: ${request.phone}
• อีเมล: ${request.email}
• ประเภทงาน: ${request.workType === 'teaching' ? 'การเรียนการสอน' : request.workType === 'research' ? 'งานวิจัย' : request.workType === 'special_problem' ? 'ปัญหาพิเศษ' : 'อื่นๆ'}
• หัวข้อโครงงาน/วิจัย: ${request.projectTitle || '-'}
• อาจารย์ที่ปรึกษา/ผู้รับผิดชอบ: ${request.advisorSignature?.name || '-'}
• วันที่ยื่นคำขอ: ${request.submissionDateTh}

${itemsDetail}

--------------------------------------------------
[การดำเนินการสำหรับหัวหน้าห้องปฏิบัติการ]
คลิกปุ่มหรือลิงก์ด้านล่างเพื่อเข้าสู่ระบบพิจารณา อนุมัติ/ปฏิเสธ หรือมอบหมายผู้ดูแล:
>> จัดการคำขอ (ส่วนที่ 2): ${reviewUrl}
>> ดาวน์โหลด / ดูแบบฟอร์ม PDF A4 บนหน้าเว็บ: ${downloadUrl || printUrl}
--------------------------------------------------

ระบบบริการห้องปฏิบัติการออนไลน์ คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น`;

  return { subject, body, reviewUrl };
}

/**
 * 2. Step 2 (กรณีปฏิเสธ): อีเมลแจ้งเตือนผู้รับบริการว่าหัวหน้างานไม่อนุมัติ พร้อมเหตุผลและแนบลิงก์ดาวน์โหลด PDF
 */
export function generateHeadRejectedEmail(request: VetLabRequest, baseUrl?: string): { subject: string; body: string; printUrl: string } {
  const formName = getFormTypeName(request.formType);
  const appOrigin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const printUrl = appOrigin ? `${appOrigin}?action=print&id=${encodeURIComponent(request.id)}&trackingNo=${encodeURIComponent(request.trackingNo)}` : '';
  const downloadUrl = appOrigin ? `${appOrigin}?action=print&id=${encodeURIComponent(request.id)}&trackingNo=${encodeURIComponent(request.trackingNo)}&download=1` : '';
  const reason = request.part2?.rejectionReason || request.part2?.comment || 'ไม่เป็นไปตามเกณฑ์การขอใช้บริการห้องปฏิบัติการ';

  const subject = `[แจ้งผลการพิจารณาคำขอ] ไม่อนุมัติคำขอ ${request.trackingNo} - ${formName}`;
  const body = `เรียน คุณ ${request.applicantName},

ตามที่ท่านได้ยื่นคำขอ ${formName} (รหัสติดตาม: ${request.trackingNo}) นั้น
หัวหน้าห้องปฏิบัติการ (${LAB_OFFICIALS.headOfLab.name}) ได้พิจารณาคำขอของท่านแล้ว มีผลการพิจารณา: "ไม่อนุมัติ"

• เหตุผลการไม่อนุมัติ / ความเห็น:
  ${reason}

• รายละเอียดผู้พิจารณา: ${request.part2?.signature?.name || LAB_OFFICIALS.headOfLab.name} (${LAB_OFFICIALS.headOfLab.position})
• วันที่พิจารณา: ${request.part2?.signature?.date || request.submissionDateTh}

--------------------------------------------------
[เอกสารแบบฟอร์มที่มีรายละเอียดการปฏิเสธ]
ท่านสามารถคลิกลิงก์ด้านล่างเพื่อเชื่อมต่อไปยังหน้าเว็บและดาวน์โหลดเอกสารแบบฟอร์ม PDF ที่บันทึกเหตุผลการปฏิเสธ:
>> ดาวน์โหลดเอกสาร PDF จากหน้าเว็บ: ${downloadUrl || printUrl}
--------------------------------------------------

หากมีข้อสงสัยเพิ่มเติม สามารถติดต่อผู้ประสานงานห้องปฏิบัติการ (${LAB_OFFICIALS.coordinator.name})

ขอแสดงความนับถือ
งานห้องปฏิบัติการ คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น`;

  return { subject, body, printUrl };
}

/**
 * 3. Step 2 (กรณีอนุมัติ): อีเมลแจ้งเตือนผู้ดูแลห้องปฏิบัติการ/อุปกรณ์เครื่องมือว่าได้รับการอนุมัติแล้ว พร้อมปุ่มจัดการคำขอ
 */
export function generateCaretakerNotificationEmail(request: VetLabRequest, baseUrl?: string): { subject: string; body: string; reviewUrl: string } {
  const formName = getFormTypeName(request.formType);
  const appOrigin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const reviewUrl = appOrigin ? `${appOrigin}?action=review&id=${encodeURIComponent(request.id)}&trackingNo=${encodeURIComponent(request.trackingNo)}` : '';
  const printUrl = appOrigin ? `${appOrigin}?action=print&id=${encodeURIComponent(request.id)}&trackingNo=${encodeURIComponent(request.trackingNo)}` : '';
  const downloadUrl = appOrigin ? `${appOrigin}?action=print&id=${encodeURIComponent(request.id)}&trackingNo=${encodeURIComponent(request.trackingNo)}&download=1` : '';
  const itemsDetail = formatItemsSummary(request);
  const assignedStaffName = request.part2?.assignedStaffName || 'นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ';
  const assignedComment = request.part2?.assignedStaffComment || request.part2?.comment || 'มอบหมายให้ดูแลและประสานงานกับผู้ขอใช้บริการ';

  const subject = `[มอบหมายงาน] คำขอ ${request.trackingNo} ได้รับการอนุมัติจากหัวหน้าห้องปฏิบัติการแล้ว - โปรดพิจารณาคำขอเพื่อเข้ารับบริการ`;
  const body = `เรียน ${assignedStaffName} (นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ),

คำขอใช้บริการ ${formName} (รหัสติดตาม: ${request.trackingNo}) ได้รับการพิจารณา "อนุมัติ" จากหัวหน้าห้องปฏิบัติการ (${LAB_OFFICIALS.headOfLab.name}) เรียบร้อยแล้ว
และได้มอบหมายให้ท่านเป็นนักวิชาการวิทยาศาสตร์ผู้รับผิดชอบสำหรับการขอใช้บริการนี้

• รายละเอียดคำสั่งมอบหมาย: ${assignedComment}
• ผู้ขอใช้บริการ: ${request.applicantName} ${request.studentId ? `(รหัสนักศึกษา: ${request.studentId})` : ''}
• สังกัด/ภาควิชา: ${request.department || '-'}
• โทรศัพท์: ${request.phone}
• อีเมล: ${request.email}
• โครงการ/งาน: ${request.projectTitle || '-'}

${itemsDetail}

--------------------------------------------------
[การดำเนินการสำหรับผู้ดูแล]
โปรดพิจารณาความพร้อมของสถานที่/อุปกรณ์ และจัดการคำขอเพื่อเข้ารับบริการต่อไป:
>> จัดการคำขอ (ส่วนที่ 3): ${reviewUrl}
>> ดาวน์โหลด / ดูแบบฟอร์ม PDF A4 บนหน้าเว็บ: ${downloadUrl || printUrl}
--------------------------------------------------

งานห้องปฏิบัติการ คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น`;

  return { subject, body, reviewUrl };
}

/**
 * 4. Step 3: อีเมลแจ้งเตือนผู้รับบริการเมื่อผู้ดูแลจัดการคำขอสำเร็จ พร้อมลิงก์ดาวน์โหลด PDF และข้อความแนะนำการติดต่อ
 */
export function generateFinalReviewEmail(request: VetLabRequest, baseUrl?: string): { subject: string; body: string; printUrl: string } {
  const formName = getFormTypeName(request.formType);
  const appOrigin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const printUrl = appOrigin ? `${appOrigin}?action=print&id=${encodeURIComponent(request.id)}&trackingNo=${encodeURIComponent(request.trackingNo)}` : '';
  const downloadUrl = appOrigin ? `${appOrigin}?action=print&id=${encodeURIComponent(request.id)}&trackingNo=${encodeURIComponent(request.trackingNo)}&download=1` : '';
  const trackUrl = appOrigin ? `${appOrigin}?action=track&trackingNo=${encodeURIComponent(request.trackingNo)}` : '';
  const isApproved = request.part3?.approvalStatus === 'approved' || request.status === 'completed' || request.status === 'dispensed';
  const officerName = request.part3?.signature?.name || request.part2?.assignedStaffName || 'เจ้าหน้าที่ประจำห้องปฏิบัติการ';
  const officerEmail = request.part2?.assignedStaffEmail || '-';
  const officerRemarks = request.part3?.comment || request.part3?.rejectionReason || '-';

  const subject = `[แจ้งผลการจัดการคำขอ] ${isApproved ? 'อนุมัติพร้อมให้บริการ' : 'ไม่อนุมัติ'} คำขอ ${request.trackingNo} - ${formName}`;
  const body = `เรียน คุณ ${request.applicantName},

คำขอใช้บริการ ${formName} (รหัสติดตาม: ${request.trackingNo}) ได้รับการจัดการและพิจารณาจากผู้ดูแลห้องปฏิบัติการ/อุปกรณ์เครื่องมือเรียบร้อยแล้ว:

• ผลการพิจารณา: ${isApproved ? 'อนุมัติ (พร้อมให้บริการ / ตรวจสอบความพร้อมเรียบร้อย)' : 'ไม่อนุมัติ / ไม่พร้อมให้บริการ'}
• ผู้ดูแลที่รับผิดชอบ: ${officerName} (${officerEmail})
• ความเห็น/ข้อกำหนด/บันทึกการนัดหมาย: ${officerRemarks}

==================================================
*** ข้อสำคัญ: โปรดติดต่อผู้ดูแลห้องปฏิบัติการ/อุปกรณ์เครื่องมือตามรายละเอียดในแบบฟอร์ม ***
- ผู้ดูแล: ${officerName}
- อีเมลติดต่อ: ${officerEmail}
- สถานที่: งานห้องปฏิบัติการ คณะสัตวแพทยศาสตร์ มข.
==================================================

--------------------------------------------------
[ดาวน์โหลดแบบฟอร์มเอกสารฉบับสมบูรณ์ (PDF)]
ท่านสามารถดาวน์โหลดไฟล์แบบฟอร์ม PDF ที่มีรายละเอียดครบถ้วน (ส่วนที่ 1, 2 และ 3 พร้อมลายเซ็นราชการ) ได้ที่ลิงก์นี้:
>> ดาวน์โหลดแบบฟอร์ม PDF ฉบับสมบูรณ์จากหน้าเว็บ: ${downloadUrl || printUrl}
>> ตรวจสอบสถานะออนไลน์: ${trackUrl}
--------------------------------------------------

ขอแสดงความนับถือ
งานห้องปฏิบัติการ คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น`;

  return { subject, body, printUrl };
}

/**
 * สรุปข้อความสำหรับ Mailto หรือ Copy ใน UI
 */
export function generateEmailTextSummary(request: VetLabRequest, baseUrl?: string): string {
  const result = generateHeadNotificationEmail(request, baseUrl);
  return result.body;
}

export function generateMailtoUrl(request: VetLabRequest): string {
  const formName = getFormTypeName(request.formType);
  const subject = `[คำขอออนไลน์] ${formName} - ${request.applicantName} (เลขที่: ${request.trackingNo})`;
  const body = generateEmailTextSummary(request);
  const recipient = LAB_OFFICIALS.primaryEmail;
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&cc=${encodeURIComponent(request.email)}`;
}

