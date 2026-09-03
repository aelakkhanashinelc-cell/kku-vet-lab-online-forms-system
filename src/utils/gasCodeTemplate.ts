/**
 * Google Apps Script (GAS) Complete Script Template for KKU Veterinary Laboratory
 * This script can be copied directly into Google Sheets > Extensions > Apps Script
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ==============================================================================
 * KKU Veterinary Laboratory System - Google Apps Script (Backend & Email Gateway)
 * ==============================================================================
 * คุณสมบัติสำคัญ:
 * 1. บันทึกคำขอลง Google Sheets แยกตามประเภทแบบฟอร์ม (02, 03, 04)
 * 2. ส่งอีเมลแจ้งเตือนอัตโนมัติตามลำดับขั้นตอนใน Workflow ครบถ้วน
 * 3. ส่งอีเมลแจ้งเตือนพร้อมปุ่มดาวน์โหลดแบบฟอร์มทางการ PDF A4 เชื่อมต่อมายังหน้าเว็บ
 *    (ยกเลิกการแนบไฟล์ในอีเมล เพื่อความรวดเร็วและป้องกันอีเมลตกสแปม)
 * ==============================================================================
 */

// อีเมลหัวหน้าห้องปฏิบัติการ (สำหรับรับแจ้งเตือนคำขอใหม่เพื่อพิจารณาส่วนที่ 2)
const HEAD_OF_LAB_EMAIL = "aelakkhana.shine.lc@gmail.com";
const SENDER_NAME = "งานห้องปฏิบัติการ คณะสัตวแพทยศาสตร์ มข.";

/**
 * จัดการคำขอ POST จาก Web Application (บันทึกข้อมูล, อัปเดตสถานะ, ส่งอีเมลแจ้งเตือน)
 */
function doPost(e) {
  try {
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    } else {
      throw new Error("No data received");
    }

    const action = data.action || "submit_form";
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. รับการส่งแบบฟอร์มคำขอใหม่ (VET.LAB 02, 03, 04)
    if (action === "submit_form" || !data.action) {
      const requestData = data.requestData || data;
      const result = processNewSubmission(ss, requestData);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "บันทึกลง Google Sheets และส่งอีเมลพร้อมแนบไฟล์ PDF A4 สำเร็จ",
        trackingNo: result.trackingNo,
        row: result.row,
        sheetName: result.sheetName
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. ทดสอบการเชื่อมต่อ
    if (action === "test_connection" || action === "ping") {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        status: "online",
        message: "KKU Vet Lab Service is active",
        spreadsheetName: ss.getName(),
        userEmail: Session.getActiveUser().getEmail() || HEAD_OF_LAB_EMAIL
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. อัปเดตสถานะการอนุมัติ (Workflow ขั้นที่ 2 และ 3 พร้อมแนบ PDF A4 ล่าสุด)
    if (action === "update_status" || action === "review_request") {
      const updateResult = processStatusUpdate(ss, data);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "อัปเดตสถานะและส่งอีเมลแจ้งเตือนพร้อมแนบไฟล์ PDF A4 เรียบร้อย",
        data: updateResult
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. บันทึกประวัติการเข้าสู่ระบบ
    if (action === "log_login" || action === "login") {
      const loginResult = processLoginLog(ss, data);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: loginResult
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Unknown action" })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("doPost Error: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    status: "online",
    message: "KKU Vet Lab Service Ready"
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * WORKFLOW ขั้นที่ 1: รับแบบฟอร์มคำขอใหม่
 * 1. บันทึกลง Google Sheets
 * 2. ส่งใบตอบรับการยื่นคำขอ + แนบไฟล์แบบฟอร์ม PDF A4 -> ไปยังผู้ขอรับบริการ
 * 3. ส่งแจ้งเตือนคำขอใหม่ + แนบไฟล์แบบฟอร์ม PDF A4 -> ไปยังหัวหน้าห้องปฏิบัติการ
 */
function processNewSubmission(ss, req) {
  const formType = req.formType || "VET_LAB_02";
  const trackingNo = req.trackingNo || ("VL-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000));
  const now = new Date();
  const webAppUrl = req.webAppUrl || "https://kku-vet-lab-forms-system.pages.dev";

  let itemsSummary = "-";
  if (formType === "VET_LAB_02" && req.labItems) {
    itemsSummary = req.labItems.map(function(i, idx) {
      return (idx + 1) + ". " + i.labName + (i.remarks ? " (" + i.remarks + ")" : "");
    }).join(" | ");
  } else if (formType === "VET_LAB_03" && req.equipmentItems) {
    itemsSummary = req.equipmentItems.map(function(i, idx) {
      return (idx + 1) + ". " + i.itemName + " จำนวน " + i.quantity + (i.remarksLab ? " [" + i.remarksLab + "]" : "");
    }).join(" | ");
  } else if (formType === "VET_LAB_04" && req.chemicalItems) {
    itemsSummary = req.chemicalItems.map(function(i, idx) {
      return (idx + 1) + ". " + i.itemName + " จำนวน " + i.quantity + (i.remarks ? " [" + i.remarks + "]" : "");
    }).join(" | ");
  }

  let targetSheetName = "คำขอ_" + formType;
  let sheet = ss.getSheetByName(targetSheetName);
  if (!sheet) {
    sheet = ss.insertSheet(targetSheetName);
    const headers = [
      "วันเวลาที่ยื่นคำขอ", "รหัสติดตาม (Tracking No)", "ประเภทแบบฟอร์ม", "สถานะคำขอ",
      "วันที่ระบุในฟอร์ม", "ชื่อผู้ขอใช้บริการ", "สถานภาพ", "รหัสนักศึกษา",
      "สาขาวิชา/สังกัด", "เบอร์โทรศัพท์", "อีเมล", "ลักษณะงาน",
      "ชื่องาน/โครงการวิจัย", "รายการที่ขอใช้/เบิก", "ช่วงเวลาที่ขอใช้",
      "จำนวนวัน", "วันที่เริ่มต้น", "วันที่สิ้นสุด", "ลายมือชื่อผู้ขอ",
      "ลายมือชื่ออาจารย์ที่ปรึกษา", "ผลการพิจารณาส่วนที่ 2 (หัวหน้า)", "ผลการพิจารณาส่วนที่ 3 (นักวิทยาศาสตร์)"
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setBackground("#1e3a8a").setFontColor("#ffffff").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  const rowData = [
    now, trackingNo, formType, req.status || "pending", req.submissionDateTh || "",
    req.applicantName || "", req.role || "-", req.studentId || "-", req.department || "",
    req.phone || "", req.email || "", req.workType || "-", req.projectTitle || "",
    itemsSummary, req.timeSlot || "-", req.durationDays || "-", req.startDate || "-", req.endDate || "-",
    req.applicantSignature ? req.applicantSignature.name : "-",
    req.advisorSignature ? req.advisorSignature.name : "-", "-", "-"
  ];
  sheet.appendRow(rowData);

  // 1. ส่งใบตอบรับไปยังผู้ขอรับบริการ (พร้อมแนบไฟล์ PDF A4)
  sendApplicantReceiptEmail(req, trackingNo, formType, itemsSummary, webAppUrl);

  // 2. ส่งแจ้งเตือนคำขอใหม่ไปยังหัวหน้าห้องปฏิบัติการ (พร้อมแนบไฟล์ PDF A4)
  sendHeadNotificationEmail(req, trackingNo, formType, itemsSummary, webAppUrl);

  return { trackingNo: trackingNo, sheetName: targetSheetName, row: sheet.getLastRow() };
}

/**
 * WORKFLOW ขั้นที่ 2 และ 3: การพิจารณาอนุมัติ
 */
function processStatusUpdate(ss, data) {
  const trackingNo = data.trackingNo || (data.requestData && data.requestData.trackingNo);
  if (!trackingNo) throw new Error("Missing trackingNo");

  const req = data.requestData || data;
  const status = data.status || req.status || "updated";
  const webAppUrl = req.webAppUrl || data.webAppUrl || "https://kku-vet-lab-forms-system.pages.dev";
  const formType = req.formType || "VET_LAB_02";

  // อัปเดตแถวในสเปรดชีต
  updateSheetRow(ss, trackingNo, status, req);

  // กรณี 2B: หัวหน้าห้องปฏิบัติการไม่อนุมัติส่วนที่ 2 (Rejected) -> ส่งอีเมลแจ้งผู้ขอ + แนบ PDF A4
  if (req.part2 && req.part2.approvalStatus === "rejected") {
    sendHeadRejectedToApplicant(req, trackingNo, formType, webAppUrl);
    return { trackingNo: trackingNo, status: status, actionTaken: "head_rejected_email_sent" };
  }

  // กรณี 3: นักวิชาการวิทยาศาสตร์บันทึกผลตรวจสอบความพร้อม + ลงนามส่วนที่ 3 (เสร็จสิ้นครบ 2 ฝ่าย) -> ส่งผลฉบับสมบูรณ์ + แนบ PDF A4 สมบูรณ์
  if (req.part3 && req.part3.approvalStatus && req.part2 && req.part2.approvalStatus === "approved") {
    sendFinalReviewToApplicant(req, trackingNo, formType, webAppUrl);
    return { trackingNo: trackingNo, status: status, actionTaken: "final_review_email_sent" };
  }

  // กรณี 2A: หัวหน้าห้องปฏิบัติการอนุมัติส่วนที่ 2 (Approved) + เลือกนักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ -> มอบหมายงานตรง + แนบ PDF A4
  if (req.part2 && req.part2.approvalStatus === "approved" && (!req.part3 || !req.part3.approvalStatus)) {
    sendCaretakerAssignmentEmail(req, trackingNo, formType, webAppUrl);
    return { trackingNo: trackingNo, status: status, actionTaken: "caretaker_assigned_email_sent" };
  }

  return { trackingNo: trackingNo, status: status };
}

/**
 * ==============================================================================
 * ฟังก์ชันสร้างไฟล์ PDF A4 สำหรับแนบในอีเมล
 * ==============================================================================
 */
function createA4FormPdfBlob(req, trackingNo, formType) {
  try {
    const htmlContent = generateA4DocumentHtml(req, trackingNo, formType);
    const blob = Utilities.newBlob(htmlContent, 'text/html', 'form.html');
    const pdf = blob.getAs('application/pdf');
    pdf.setName(formType + '_' + trackingNo + '.pdf');
    return pdf;
  } catch (err) {
    Logger.log('Error creating PDF Blob: ' + err.toString());
    return null;
  }
}

/**
 * สร้าง HTML สำหรับแปลงเป็นแบบฟอร์มเอกสาร PDF ขนาด A4
 */
function generateA4DocumentHtml(req, trackingNo, formType) {
  const formName = getFormNameTh(formType);
  const nowTh = Utilities.formatDate(new Date(), 'GMT+7', 'd MMMM yyyy HH:mm น.');

  // สรุปตารางรายการ
  let itemsTableRows = '';
  if (formType === 'VET_LAB_02' && req.labItems && req.labItems.length > 0) {
    itemsTableRows = req.labItems.map(function(item, idx) {
      return '<tr><td style="text-align: center;">' + (idx + 1) + '</td><td>' + item.labName + '</td><td>' + (item.remarks || '-') + '</td></tr>';
    }).join('');
  } else if (formType === 'VET_LAB_03' && req.equipmentItems && req.equipmentItems.length > 0) {
    itemsTableRows = req.equipmentItems.map(function(item, idx) {
      return '<tr><td style="text-align: center;">' + (idx + 1) + '</td><td>' + item.itemName + '</td><td style="text-align: center;">' + item.quantity + '</td><td>' + (item.remarksLab || '-') + '</td></tr>';
    }).join('');
  } else if (formType === 'VET_LAB_04' && req.chemicalItems && req.chemicalItems.length > 0) {
    itemsTableRows = req.chemicalItems.map(function(item, idx) {
      return '<tr><td style="text-align: center;">' + (idx + 1) + '</td><td>' + item.itemName + '</td><td style="text-align: center;">' + item.quantity + '</td><td>' + (item.remarks || '-') + '</td></tr>';
    }).join('');
  } else {
    itemsTableRows = '<tr><td colspan="4" style="text-align: center; color: #64748b;">ไม่มีรายการที่ระบุ</td></tr>';
  }

  // ลายมือชื่อส่วนที่ 2 (หัวหน้าห้องปฏิบัติการ)
  let part2StatusText = "อยู่ระหว่างรอพิจารณา";
  let part2Signer = "....................................................";
  let part2Comment = "-";
  let assignedStaff = "-";
  if (req.part2) {
    part2StatusText = req.part2.approvalStatus === "approved" ? "อนุมัติ / เห็นควรอนุญาต" : (req.part2.approvalStatus === "rejected" ? "ไม่อนุมัติ" : req.part2.approvalStatus);
    part2Signer = (req.part2.signature && req.part2.signature.name) || "นางสุธิดา จันทร์ลุน";
    part2Comment = req.part2.rejectionReason || req.part2.comment || req.part2.assignedStaffComment || "-";
    assignedStaff = req.part2.assignedStaffName || "-";
  }

  // ลายมือชื่อส่วนที่ 3 (นักวิชาการวิทยาศาสตร์)
  let part3StatusText = "อยู่ระหว่างรอตรวจสอบ";
  let part3Signer = "....................................................";
  let part3Comment = "-";
  if (req.part3) {
    part3StatusText = req.part3.approvalStatus === "approved" ? "ตรวจสอบความพร้อมแล้ว เห็นควรให้บริการได้" : (req.part3.approvalStatus === "rejected" ? "ไม่อนุมัติ" : req.part3.approvalStatus);
    part3Signer = (req.part3.signature && req.part3.signature.name) || "-";
    part3Comment = req.part3.comment || req.part3.rejectionReason || "-";
  }

  return \`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>\${formName} - \${trackingNo}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm; }
    body { font-family: 'Sarabun', -apple-system, sans-serif, Arial; font-size: 13px; color: #1e293b; line-height: 1.4; margin: 0; padding: 0; }
    .header-table { width: 100%; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 12px; }
    .title { font-size: 16px; font-weight: bold; color: #1e3a8a; margin: 0; }
    .subtitle { font-size: 12px; color: #475569; margin: 2px 0 0 0; }
    .tracking-badge { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 12px; }
    .section-title { font-size: 13px; font-weight: bold; color: #0f172a; background: #f1f5f9; padding: 4px 8px; border-left: 4px solid #2563eb; margin: 12px 0 6px 0; }
    .grid-table { width: 100%; font-size: 12.5px; border-collapse: collapse; }
    .grid-table td { padding: 4px 6px; vertical-align: top; }
    .label { color: #64748b; font-weight: bold; width: 140px; }
    .items-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 12px; }
    .items-table th, .items-table td { border: 1px solid #cbd5e1; padding: 6px 8px; }
    .items-table th { background: #f8fafc; font-weight: bold; text-align: left; }
    .box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; margin-top: 6px; background: #fafafa; }
    .sig-table { width: 100%; margin-top: 8px; border-collapse: collapse; }
    .sig-cell { width: 50%; text-align: center; vertical-align: top; padding: 6px; font-size: 12px; }
    .footer-note { font-size: 10.5px; color: #94a3b8; text-align: center; margin-top: 14px; border-top: 1px dashed #e2e8f0; padding-top: 6px; }
  </style>
</head>
<body>
  <!-- Header -->
  <table class="header-table">
    <tr>
      <td style="vertical-align: middle;">
        <h1 class="title">คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น</h1>
        <div class="subtitle">งานห้องปฏิบัติการ งานวิจัยและบริการวิชาการ • \${formName}</div>
      </td>
      <td style="text-align: right; vertical-align: middle;">
        <span class="tracking-badge">Tracking: \${trackingNo}</span>
      </td>
    </tr>
  </table>

  <!-- ส่วนที่ 1: ข้อมูลผู้ขอรับบริการ -->
  <div class="section-title">ส่วนที่ 1: ข้อมูลคำขอรับบริการ</div>
  <table class="grid-table">
    <tr>
      <td class="label">ผู้ยื่นคำขอ:</td>
      <td><strong>\${req.applicantName || '-'}</strong> (สถานภาพ: \${req.role || '-'})</td>
      <td class="label">รหัสนักศึกษา:</td>
      <td>\${req.studentId || '-'}</td>
    </tr>
    <tr>
      <td class="label">สาขาวิชา/สังกัด:</td>
      <td>\${req.department || '-'}</td>
      <td class="label">เบอร์โทรศัพท์:</td>
      <td>\${req.phone || '-'}</td>
    </tr>
    <tr>
      <td class="label">อีเมล:</td>
      <td>\${req.email || '-'}</td>
      <td class="label">ลักษณะงาน:</td>
      <td>\${req.workType || '-'}</td>
    </tr>
    <tr>
      <td class="label">ชื่องาน/โครงการ:</td>
      <td colspan="3"><strong>\${req.projectTitle || '-'}</strong></td>
    </tr>
    <tr>
      <td class="label">ช่วงเวลาที่ขอใช้:</td>
      <td>\${req.timeSlot || '-'} (จำนวน \${req.durationDays || '-'} วัน)</td>
      <td class="label">ระยะเวลา:</td>
      <td>\${req.startDate || '-'} ถึง \${req.endDate || '-'}</td>
    </tr>
  </table>

  <!-- ตารางรายการที่ขอ -->
  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 40px; text-align: center;">ลำดับ</th>
        <th>รายการที่ขอรับบริการ</th>
        \${formType === 'VET_LAB_02' ? '<th>วัตถุประสงค์ / หมายเหตุ</th>' : '<th style="width: 80px; text-align: center;">จำนวน</th><th>หมายเหตุ / ห้องที่ตั้ง</th>'}
      </tr>
    </thead>
    <tbody>
      \${itemsTableRows}
    </tbody>
  </table>

  <!-- ลายมือชื่อส่วนที่ 1 -->
  <table class="sig-table">
    <tr>
      <td class="sig-cell">
        <br/>
        (ลงชื่อ) <strong>\${(req.applicantSignature && req.applicantSignature.name) || req.applicantName || '...........................................'}</strong><br/>
        ผู้ขอรับบริการ<br/>
        วันที่: \${req.submissionDateTh || '-'}
      </td>
      <td class="sig-cell">
        <br/>
        (ลงชื่อ) <strong>\${(req.advisorSignature && req.advisorSignature.name) || '...........................................'}</strong><br/>
        อาจารย์ที่ปรึกษา / ผู้รับผิดชอบ<br/>
        วันที่: \${req.submissionDateTh || '-'}
      </td>
    </tr>
  </table>

  <!-- ส่วนที่ 2: หัวหน้าห้องปฏิบัติการ -->
  <div class="section-title">ส่วนที่ 2: ผลการพิจารณาของหัวหน้างานห้องปฏิบัติการ (นางสุธิดา จันทร์ลุน)</div>
  <div class="box">
    <table class="grid-table">
      <tr>
        <td class="label">ผลการพิจารณา:</td>
        <td><strong>\${part2StatusText}</strong></td>
        <td class="label">ผู้รับผิดชอบที่มอบหมาย:</td>
        <td><strong>\${assignedStaff}</strong></td>
      </tr>
      <tr>
        <td class="label">ความเห็น / คำสั่ง:</td>
        <td colspan="3">\${part2Comment}</td>
      </tr>
      <tr>
        <td class="label">ผู้ลงนามพิจารณา:</td>
        <td colspan="3">(ลงชื่อ) <strong>\${part2Signer}</strong> (หัวหน้างานห้องปฏิบัติการ งานวิจัยและบริการวิชาการ)</td>
      </tr>
    </table>
  </div>

  <!-- ส่วนที่ 3: นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ -->
  <div class="section-title">ส่วนที่ 3: ผลการตรวจสอบความพร้อมของนักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ</div>
  <div class="box">
    <table class="grid-table">
      <tr>
        <td class="label">ผลการตรวจสอบ:</td>
        <td colspan="3"><strong>\${part3StatusText}</strong></td>
      </tr>
      <tr>
        <td class="label">ความเห็น/เงื่อนไข:</td>
        <td colspan="3">\${part3Comment}</td>
      </tr>
      <tr>
        <td class="label">ผู้ลงนามตรวจสอบ:</td>
        <td colspan="3">(ลงชื่อ) <strong>\${part3Signer}</strong> (นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบดูแล)</td>
      </tr>
    </table>
  </div>

  <!-- Footer -->
  <div class="footer-note">
    เอกสารแบบฟอร์มนี้จัดทำขึ้นจากระบบบริการห้องปฏิบัติการออนไลน์ คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น • วันที่สร้างเอกสาร: \${nowTh}
  </div>
</body>
</html>\`;
}

/**
 * ==============================================================================
 * ฟังก์ชันจัดส่งอีเมลทั้ง 5 รูปแบบ พร้อมแนบไฟล์แบบฟอร์ม PDF A4
 * ==============================================================================
 */

// 1. ใบตอบรับการยื่นคำขอ (ส่งถึง ผู้ขอรับบริการ)
function sendApplicantReceiptEmail(req, trackingNo, formType, itemsSummary, webAppUrl) {
  if (!req.email) return;
  try {
    const printUrl = webAppUrl + "/?action=print&trackingNo=" + encodeURIComponent(trackingNo);
    const trackUrl = webAppUrl + "/?action=track&trackingNo=" + encodeURIComponent(trackingNo);
    const downloadUrl = printUrl + "&download=1";
    const subject = "[KKU VET LAB] ใบตอบรับการยื่นคำขอ: " + trackingNo + " (สถานะ: รอหัวหน้าพิจารณา)";

    const htmlBody = 
      '<div style="font-family: \'Sarabun\', sans-serif, Arial; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">' +
      '  <div style="background-color: #1e3a8a; padding: 22px; text-align: center; color: white;">' +
      '    <h2 style="margin: 0; font-size: 19px;">ใบตอบรับการยื่นคำขอใช้บริการห้องปฏิบัติการ</h2>' +
      '    <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น</p>' +
      '  </div>' +
      '  <div style="padding: 24px; color: #1e293b; line-height: 1.6;">' +
      '    <p style="font-size: 15px; margin-top: 0;">เรียน คุณ <strong>' + req.applicantName + '</strong></p>' +
      '    <p style="color: #475569;">ระบบได้รับแบบฟอร์มคำขอของท่านเรียบร้อยแล้ว โดยมีรายละเอียดดังต่อไปนี้:</p>' +
      '    <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; margin: 18px 0; border-radius: 6px;">' +
      '      <p style="margin: 3px 0;"><strong>รหัสติดตามคำขอ (Tracking No):</strong> <span style="color: #2563eb; font-weight: bold; font-size: 16px;">' + trackingNo + '</span></p>' +
      '      <p style="margin: 3px 0;"><strong>ชื่องาน/โครงการ:</strong> ' + (req.projectTitle || '-') + '</p>' +
      '      <p style="margin: 3px 0;"><strong>รายการที่ขอ:</strong> ' + itemsSummary + '</p>' +
      '      <p style="margin: 3px 0;"><strong>สถานะปัจจุบัน:</strong> <span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 4px; font-weight: bold;">รอหัวหน้าห้องปฏิบัติการพิจารณา (ส่วนที่ 2)</span></p>' +
      '    </div>' +
      '    <!-- กล่องปุ่มดาวน์โหลดไฟล์ PDF เชื่อมต่อไปยังหน้าเว็บ -->' +
      '    <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 16px; border-radius: 10px; margin: 20px 0; text-align: center;">' +
      '      <p style="margin: 0 0 10px 0; font-size: 13px; color: #166534; font-weight: bold;">' +
      '        📄 เอกสารแบบฟอร์มคำขอขนาด A4 สำหรับดาวน์โหลดและพิมพ์:' +
      '      </p>' +
      '      <a href="' + downloadUrl + '" target="_blank" style="background: #16a34a; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(22,163,74,0.25); margin-bottom: 8px;">' +
      '        📥 ดาวน์โหลดแบบฟอร์ม PDF (A4)' +
      '      </a>' +
      '      <br/>' +
      '      <a href="' + trackUrl + '" target="_blank" style="color: #2563eb; font-size: 13px; text-decoration: underline; font-weight: 500;">' +
      '        🔍 หรือคลิกตรวจสอบสถานะคำขอออนไลน์' +
      '      </a>' +
      '      <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">' +
      '        * กดปุ่มเพื่อเปิดดูหน้าเว็บและดาวน์โหลดไฟล์ PDF ได้ทันทีโดยไม่ต้องแนบไฟล์ในอีเมล' +
      '      </p>' +
      '    </div>' +
      '    <p style="font-size: 13px; color: #64748b;">เมื่อหัวหน้าห้องปฏิบัติการและนักวิชาการวิทยาศาสตร์พิจารณาแล้ว ระบบจะส่งอีเมลแจ้งผลให้ท่านทราบในลำดับถัดไป</p>' +
      '  </div>' +
      '  <div style="background: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">' +
      '    งานห้องปฏิบัติการ คณะสัตวแพทยศาสตร์ มข. • โทร. 043-009700' +
      '  </div>' +
      '</div>';

    const emailOptions = { to: req.email, subject: subject, htmlBody: htmlBody, name: SENDER_NAME };
    MailApp.sendEmail(emailOptions);
  } catch(e) { Logger.log("Error applicant receipt: " + e.toString()); }
}

// 2. อีเมลแจ้งเตือนคำขอใหม่ (ส่งถึง หัวหน้าห้องปฏิบัติการ)
function sendHeadNotificationEmail(req, trackingNo, formType, itemsSummary, webAppUrl) {
  try {
    const reviewUrl = webAppUrl + "/?action=review&trackingNo=" + encodeURIComponent(trackingNo);
    const printUrl = webAppUrl + "/?action=print&trackingNo=" + encodeURIComponent(trackingNo);
    const downloadUrl = printUrl + "&download=1";
    const subject = "[คำขอใหม่รอพิจารณา] " + trackingNo + " (" + req.applicantName + ")";

    const htmlBody = 
      '<div style="font-family: \'Sarabun\', sans-serif, Arial; max-width: 620px; margin: 0 auto; border: 1px solid #fed7aa; border-radius: 12px; overflow: hidden; background: #ffffff;">' +
      '  <div style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 22px; text-align: center; color: white;">' +
      '    <h2 style="margin: 0; font-size: 19px;">แจ้งเตือนคำขอใหม่รอการพิจารณา (ส่วนที่ 2)</h2>' +
      '    <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">เรียน หัวหน้างานห้องปฏิบัติการ งานวิจัยและบริการวิชาการ</p>' +
      '  </div>' +
      '  <div style="padding: 24px; color: #1e293b; line-height: 1.6;">' +
      '    <p style="font-size: 15px; margin-top: 0;">มีผู้ขอรับบริการได้ยื่นคำขอใหม่เข้าสู่ระบบ โปรดพิจารณาอนุมัติและมอบหมายงาน:</p>' +
      '    <div style="background: #fff7ed; border-left: 4px solid #ea580c; padding: 16px; margin: 18px 0; border-radius: 6px;">' +
      '      <p style="margin: 3px 0;"><strong>รหัสติดตาม:</strong> <span style="color: #c2410c; font-weight: bold; font-size: 16px;">' + trackingNo + '</span></p>' +
      '      <p style="margin: 3px 0;"><strong>ผู้ยื่นคำขอ:</strong> ' + req.applicantName + ' (โทร. ' + req.phone + ' | ' + req.email + ')</p>' +
      '      <p style="margin: 3px 0;"><strong>สังกัด:</strong> ' + (req.department || '-') + '</p>' +
      '      <p style="margin: 3px 0;"><strong>รายการ:</strong> ' + itemsSummary + '</p>' +
      '    </div>' +
      '    <div style="text-align: center; margin: 24px 0;">' +
      '      <a href="' + reviewUrl + '" target="_blank" style="background: #ea580c; color: #ffffff !important; padding: 12px 26px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(234,88,12,0.3); margin-bottom: 10px;">🔘 เข้าพิจารณาคำขอและมอบหมายงาน (ส่วนที่ 2)</a><br/>' +
      '      <a href="' + downloadUrl + '" target="_blank" style="background: #0284c7; color: #ffffff !important; padding: 10px 22px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; display: inline-block;">📥 ดาวน์โหลด / ดูแบบฟอร์ม PDF A4 บนหน้าเว็บ</a>' +
      '      <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">' +
      '        * เชื่อมต่อมายังไฟล์ PDF ที่หน้าเว็บเพื่อดูข้อมูลฉบับเต็มและดาวน์โหลดได้สะดวกรวดเร็ว' +
      '      </p>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    const emailOptions = { to: HEAD_OF_LAB_EMAIL, subject: subject, htmlBody: htmlBody, name: SENDER_NAME };
    MailApp.sendEmail(emailOptions);
  } catch(e) { Logger.log("Error head alert: " + e.toString()); }
}

// 3. ส่งอีเมลมอบหมายงานตรง (ส่งถึง นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ)
function sendCaretakerAssignmentEmail(req, trackingNo, formType, webAppUrl) {
  const assignedEmail = req.part2 && req.part2.assignedStaffEmail;
  if (!assignedEmail) return;
  try {
    const reviewUrl = webAppUrl + "/?action=review&trackingNo=" + encodeURIComponent(trackingNo);
    const printUrl = webAppUrl + "/?action=print&trackingNo=" + encodeURIComponent(trackingNo);
    const downloadUrl = printUrl + "&download=1";
    const staffName = (req.part2 && req.part2.assignedStaffName) || "นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ";
    const comment = (req.part2 && (req.part2.assignedStaffComment || req.part2.comment)) || "โปรดตรวจสอบความพร้อม";
    const subject = "[มอบหมายงาน] คำขอ " + trackingNo + " ได้รับการอนุมัติจากหัวหน้าแล้ว - โปรดตรวจสอบความพร้อม (ส่วนที่ 3)";

    const htmlBody = 
      '<div style="font-family: \'Sarabun\', sans-serif, Arial; max-width: 620px; margin: 0 auto; border: 1px solid #bfdbfe; border-radius: 12px; overflow: hidden; background: #ffffff;">' +
      '  <div style="background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%); padding: 22px; text-align: center; color: white;">' +
      '    <h2 style="margin: 0; font-size: 19px;">แจ้งคำสั่งมอบหมายงานตรวจสอบความพร้อม (ส่วนที่ 3)</h2>' +
      '    <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">เรียน ' + staffName + '</p>' +
      '  </div>' +
      '  <div style="padding: 24px; color: #1e293b; line-height: 1.6;">' +
      '    <p style="font-size: 15px; margin-top: 0;">คำขอใช้บริการ (รหัส: <strong>' + trackingNo + '</strong>) ได้รับการพิจารณา <strong>"อนุมัติ"</strong> จากหัวหน้าห้องปฏิบัติการแล้ว</p>' +
      '    <p>และได้มอบหมายให้ท่านเป็น <strong>นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ</strong> ในการดูแลและตรวจสอบความพร้อม:</p>' +
      '    <div style="background: #eff6ff; border-left: 4px solid #1d4ed8; padding: 16px; margin: 18px 0; border-radius: 6px;">' +
      '      <p style="margin: 3px 0;"><strong>คำสั่งมอบหมาย / ความเห็นหัวหน้า:</strong> <span style="color: #1e40af; font-weight: bold;">' + comment + '</span></p>' +
      '      <p style="margin: 3px 0;"><strong>ผู้ขอใช้บริการ:</strong> ' + req.applicantName + ' (โทร. ' + req.phone + ')</p>' +
      '      <p style="margin: 3px 0;"><strong>ชื่องาน:</strong> ' + (req.projectTitle || '-') + '</p>' +
      '    </div>' +
      '    <div style="text-align: center; margin: 24px 0;">' +
      '      <a href="' + reviewUrl + '" target="_blank" style="background: #1d4ed8; color: #ffffff !important; padding: 12px 26px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; margin-bottom: 10px;">🔘 เข้าตรวจสอบความพร้อมและลงนาม (ส่วนที่ 3)</a><br/>' +
      '      <a href="' + downloadUrl + '" target="_blank" style="background: #0284c7; color: #ffffff !important; padding: 10px 22px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; display: inline-block;">📥 ดาวน์โหลด / ดูแบบฟอร์ม PDF A4 บนหน้าเว็บ</a>' +
      '      <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">' +
      '        * เอกสารมีลายมือชื่ออนุมัติของหัวหน้าห้องปฏิบัติการแล้ว สามารถดาวน์โหลดหรือพิมพ์จากหน้าเว็บได้ทันที' +
      '      </p>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    const emailOptions = { to: assignedEmail, subject: subject, htmlBody: htmlBody, name: SENDER_NAME };
    MailApp.sendEmail(emailOptions);
  } catch(e) { Logger.log("Error caretaker assignment: " + e.toString()); }
}

// 4. กรณีหัวหน้าไม่อนุมัติส่วนที่ 2 (ส่งถึง ผู้ขอรับบริการ)
function sendHeadRejectedToApplicant(req, trackingNo, formType, webAppUrl) {
  if (!req.email) return;
  try {
    const printUrl = webAppUrl + "/?action=print&trackingNo=" + encodeURIComponent(trackingNo);
    const downloadUrl = printUrl + "&download=1";
    const reason = (req.part2 && (req.part2.rejectionReason || req.part2.comment)) || "ไม่เป็นไปตามเกณฑ์การขอใช้บริการ";
    const subject = "[แจ้งผลการพิจารณาคำขอ] ไม่อนุมัติคำขอ " + trackingNo;

    const htmlBody = 
      '<div style="font-family: \'Sarabun\', sans-serif, Arial; max-width: 620px; margin: 0 auto; border: 1px solid #fecaca; border-radius: 12px; overflow: hidden; background: #ffffff;">' +
      '  <div style="background: #dc2626; padding: 22px; text-align: center; color: white;">' +
      '    <h2 style="margin: 0; font-size: 19px;">แจ้งผลการพิจารณาคำขอใช้บริการห้องปฏิบัติการ</h2>' +
      '  </div>' +
      '  <div style="padding: 24px; color: #1e293b; line-height: 1.6;">' +
      '    <p style="font-size: 15px; margin-top: 0;">เรียน คุณ <strong>' + req.applicantName + '</strong></p>' +
      '    <p>หัวหน้าห้องปฏิบัติการได้พิจารณาคำขอของท่านแล้ว มีผลการพิจารณา: <strong style="color: #dc2626; font-size: 16px;">"ไม่อนุมัติ"</strong></p>' +
      '    <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 18px 0; border-radius: 6px;">' +
      '      <p style="margin: 3px 0;"><strong>เหตุผลการไม่อนุมัติ / ความเห็น:</strong></p>' +
      '      <p style="margin: 6px 0 0 0; color: #991b1b; font-weight: bold; font-size: 14px;">' + reason + '</p>' +
      '    </div>' +
      '    <div style="text-align: center; margin: 24px 0;">' +
      '      <a href="' + downloadUrl + '" target="_blank" style="background: #475569; color: #ffffff !important; padding: 12px 26px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">📥 ดาวน์โหลดเอกสารแบบฟอร์ม PDF (A4) บนหน้าเว็บ</a>' +
      '      <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">' +
      '        * เปิดดูและดาวน์โหลดแบบฟอร์มทางการที่มีบันทึกเหตุผลการปฏิเสธจากหน้าเว็บ' +
      '      </p>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    const emailOptions = { to: req.email, subject: subject, htmlBody: htmlBody, name: SENDER_NAME };
    MailApp.sendEmail(emailOptions);
  } catch(e) { Logger.log("Error rejection: " + e.toString()); }
}

// 5. กรณีพิจารณาเสร็จสิ้นครบ 2 ฝ่าย (ส่งถึง ผู้ขอรับบริการ)
function sendFinalReviewToApplicant(req, trackingNo, formType, webAppUrl) {
  if (!req.email) return;
  try {
    const printUrl = webAppUrl + "/?action=print&trackingNo=" + encodeURIComponent(trackingNo);
    const downloadUrl = printUrl + "&download=1";
    const trackUrl = webAppUrl + "/?action=track&trackingNo=" + encodeURIComponent(trackingNo);
    const isApproved = req.part3 && req.part3.approvalStatus === "approved";
    const officerName = (req.part3 && req.part3.signature && req.part3.signature.name) || (req.part2 && req.part2.assignedStaffName) || "นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ";
    const officerComment = (req.part3 && req.part3.comment) || "ตรวจสอบความพร้อมเรียบร้อย";
    const subject = "[แจ้งผลการพิจารณาคำขอ] " + (isApproved ? "อนุมัติพร้อมให้บริการ" : "ไม่อนุมัติ") + " คำขอ " + trackingNo + " (เสร็จสิ้นครบ 2 ฝ่าย)";

    const htmlBody = 
      '<div style="font-family: \'Sarabun\', sans-serif, Arial; max-width: 620px; margin: 0 auto; border: 1px solid #bbf7d0; border-radius: 12px; overflow: hidden; background: #ffffff;">' +
      '  <div style="background: linear-gradient(135deg, #15803d 0%, #166534 100%); padding: 22px; text-align: center; color: white;">' +
      '    <h2 style="margin: 0; font-size: 19px;">แจ้งผลการพิจารณาคำขอฉบับสมบูรณ์</h2>' +
      '    <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">ผ่านการพิจารณาครบถ้วนทั้ง 2 ฝ่ายแล้ว</p>' +
      '  </div>' +
      '  <div style="padding: 24px; color: #1e293b; line-height: 1.6;">' +
      '    <p style="font-size: 15px; margin-top: 0;">เรียน คุณ <strong>' + req.applicantName + '</strong></p>' +
      '    <p>คำขอใช้บริการของท่าน ได้รับการพิจารณาครบถ้วนแล้ว มีผลการพิจารณา: <strong style="color: #15803d; font-size: 16px;">"อนุมัติพร้อมให้บริการ"</strong></p>' +
      '    <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 18px 0; border-radius: 6px;">' +
      '      <p style="margin: 3px 0;"><strong>ผลส่วนที่ 2 (หัวหน้าห้องปฏิบัติการ):</strong> <span style="color: #15803d; font-weight: bold;">อนุมัติ</span></p>' +
      '      <p style="margin: 3px 0;"><strong>ผลส่วนที่ 3 (นักวิชาการวิทยาศาสตร์):</strong> <span style="color: #15803d; font-weight: bold;">ตรวจสอบความพร้อมเรียบร้อย</span></p>' +
      '      <p style="margin: 3px 0;"><strong>ผู้รับผิดชอบดูแล:</strong> ' + officerName + '</p>' +
      '      <p style="margin: 3px 0;"><strong>ข้อความแนะนำ/เงื่อนไข:</strong> ' + officerComment + '</p>' +
      '    </div>' +
      '    <div style="text-align: center; margin: 26px 0;">' +
      '      <a href="' + downloadUrl + '" target="_blank" style="background: #16a34a; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(22,163,74,0.3); margin-bottom: 8px;">📥 ดาวน์โหลดใบคำขอฉบับสมบูรณ์ (PDF A4)</a><br/>' +
      '      <a href="' + trackUrl + '" target="_blank" style="color: #0284c7; font-size: 13px; text-decoration: underline;">🔍 ตรวจสอบสถานะคำขอออนไลน์</a>' +
      '      <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">' +
      '        * เชื่อมต่อมายังไฟล์ PDF ฉบับสมบูรณ์ที่มีลายมือชื่ออิเล็กทรอนิกส์ครบทั้ง 2 ฝ่ายที่หน้าเว็บ' +
      '      </p>' +
      '    </div>' +
      '    <div style="background: #f8fafc; border: 1px dashed #cbd5e1; padding: 12px; border-radius: 8px; font-size: 13px; color: #475569;">' +
      '      <strong>คำแนะนำการเข้ารับบริการ:</strong><br>' +
      '      โปรดพิมพ์หรือบันทึกไฟล์ PDF ใบคำขอนี้ นำมาแสดงต่อเจ้าหน้าที่ในวันและเวลาที่เข้าใช้บริการห้องปฏิบัติการ/รับอุปกรณ์' +
      '    </div>' +
      '  </div>' +
      '</div>';

    const emailOptions = { to: req.email, subject: subject, htmlBody: htmlBody, name: SENDER_NAME };
    MailApp.sendEmail(emailOptions);
  } catch(e) { Logger.log("Error final review: " + e.toString()); }
}

function updateSheetRow(ss, trackingNo, newStatus, fullData) {
  const formSheets = ["คำขอ_VET_LAB_02", "คำขอ_VET_LAB_03", "คำขอ_VET_LAB_04"];
  for (let i = 0; i < formSheets.length; i++) {
    const sheet = ss.getSheetByName(formSheets[i]);
    if (!sheet) continue;
    const data = sheet.getDataRange().getValues();
    for (let r = 1; r < data.length; r++) {
      if (data[r][1] === trackingNo) {
        sheet.getRange(r + 1, 4).setValue(newStatus);
        if (fullData && fullData.part2 && fullData.part2.signature) {
          sheet.getRange(r + 1, 21).setValue(fullData.part2.signature.name + " (" + (fullData.part2.approvalStatus === "approved" ? "อนุมัติ" : "ไม่อนุมัติ") + ")");
        }
        if (fullData && fullData.part3 && fullData.part3.signature) {
          sheet.getRange(r + 1, 22).setValue(fullData.part3.signature.name + " (" + (fullData.part3.approvalStatus === "approved" ? "อนุมัติ" : "ไม่อนุมัติ") + ")");
        }
        return;
      }
    }
  }
}

function processLoginLog(ss, data) {
  const user = data.user || {};
  let sheet = ss.getSheetByName("เข้าสู่ระบบ");
  if (!sheet) {
    sheet = ss.insertSheet("เข้าสู่ระบบ");
    sheet.appendRow(["วัน-เวลา", "ชื่อ-สกุล", "อีเมล", "บทบาท (Role)", "สิทธิ์"]);
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([new Date(), user.name || "-", user.email || "-", user.role || "-", user.roleTitle || "-"]);
  return { success: true };
}

function getFormNameTh(type) {
  if (type === "VET_LAB_02") return "แบบขอใช้ห้องปฏิบัติการ (VET.LAB 02)";
  if (type === "VET_LAB_03") return "แบบขอใช้เครื่องมือวิทยาศาสตร์ (VET.LAB 03)";
  if (type === "VET_LAB_04") return "แบบขอใช้น้ำยา/สารเคมี/วัสดุ (VET.LAB 04)";
  return type || "แบบฟอร์มขอรับบริการห้องปฏิบัติการ";
}
`;
