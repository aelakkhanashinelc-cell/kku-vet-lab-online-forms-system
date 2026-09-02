/**
 * Google Apps Script (GAS) Complete Script Template for KKU Veterinary Laboratory
 * This script can be copied directly into Google Sheets > Extensions > Apps Script
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ==============================================================================
 * KKU Veterinary Laboratory System - Google Apps Script (Backend & Email Gateway)
 * ==============================================================================
 * คำแนะนำในการติดตั้ง (Installation Instructions):
 * 1. เปิด Google Sheets ที่เชื่อมต่อกับระบบ (เช่น "KKU Vet Lab Form Database")
 * 2. ไปที่เมนู "ส่วนขยาย" (Extensions) > "Apps Script"
 * 3. ลบโค้ดเดิมใน Code.gs ทั้งหมด แล้ววางโค้ดชุดใหม่นี้ลงไปแทน
 * 4. กดบันทึก (Ctrl+S / Cmd+S)
 * 5. กดปุ่มสีฟ้า "ทำให้ใช้งานได้" (Deploy) > "จัดการการปรับใช้" (Manage deployments)
 * 6. กดไอคอนดินสอ ✏️ (แก้ไข) ที่การปรับใช้ล่าสุด
 *    - เวอร์ชัน: เลือก "เวอร์ชันใหม่" (New version)
 *    - ดำเนินการในฐานะ (Execute as): "ฉัน" (Me)
 *    - ผู้ที่มีสิทธิ์เข้าถึง (Who has access): "ทุกคน" (Anyone) **สำคัญมาก**
 * 7. กด "ทำให้ใช้งานได้" (Deploy)
 * ==============================================================================
 */

// อีเมลหัวหน้าห้องปฏิบัติการ (สำหรับรับแจ้งเตือนคำขอใหม่เพื่อพิจารณาส่วนที่ 2)
const HEAD_OF_LAB_EMAIL = "aelakkhana.shine.lc@gmail.com";
const ADMIN_EMAILS = ["aelakkhana.shine.lc@gmail.com", "lakkch@kku.ac.th"];
const SENDER_NAME = "งานห้องปฏิบัติการ คณะสัตวแพทยศาสตร์ มข.";

/**
 * จัดการคำขอ POST จาก Web Application (บันทึกข้อมูล, อัปเดตสถานะ, ส่งอีเมลตาม Workflow)
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
        message: "บันทึกลง Google Sheets และส่งอีเมลแจ้งเตือนตาม Workflow สำเร็จ",
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
        message: "KKU Vet Lab Google Apps Script Service is active",
        spreadsheetName: ss.getName(),
        spreadsheetUrl: ss.getUrl(),
        userEmail: Session.getActiveUser().getEmail() || HEAD_OF_LAB_EMAIL,
        time: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. อัปเดตสถานะการอนุมัติ (Workflow ขั้นที่ 2: หัวหน้าอนุมัติ/ไม่อนุมัติ และ ขั้นที่ 3: นักวิทยาศาสตร์ลงนาม)
    if (action === "update_status" || action === "review_request") {
      const updateResult = processStatusUpdate(ss, data);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "อัปเดตสถานะลง Google Sheets และส่งอีเมลแจ้งเตือนตาม Workflow เรียบร้อย",
        data: updateResult
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. บันทึกประวัติการเข้าสู่ระบบ
    if (action === "log_login" || action === "login") {
      const loginResult = processLoginLog(ss, data);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "บันทึกประวัติเข้าสู่ระบบสำเร็จ",
        data: loginResult
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Unknown action: " + action
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("doPost Error: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * จัดการคำขอ GET (ค้นหาคำขอ, Ping)
 */
function doGet(e) {
  try {
    const action = (e.parameter && e.parameter.action) || "ping";
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "ping") {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        status: "online",
        message: "KKU Vet Lab Google Apps Script Service is active",
        spreadsheetName: ss.getName(),
        time: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "KKU Vet Lab Service Ready"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ------------------------------------------------------------------------------
 * WORKFLOW ขั้นที่ 1: รับแบบฟอร์มคำขอใหม่
 * 1. บันทึกลง Google Sheets
 * 2. ส่งใบตอบรับการยื่นคำขอ (สถานะ: รอหัวหน้าพิจารณา) -> ไปยังผู้ขอรับบริการ
 * 3. ส่งอีเมลแจ้งเตือนคำขอใหม่ (พร้อมปุ่มเข้าพิจารณาส่วนที่ 2) -> ไปยังหัวหน้าห้องแล็บ
 * ------------------------------------------------------------------------------
 */
function processNewSubmission(ss, req) {
  const formType = req.formType || "VET_LAB_02";
  const trackingNo = req.trackingNo || ("VL-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000));
  const now = new Date();
  const timestampStr = Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd HH:mm:ss");
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
    now,
    trackingNo,
    formType,
    req.status || "pending",
    req.submissionDateTh || "",
    req.applicantName || "",
    getRoleTh(req.role),
    req.studentId || "-",
    req.department || "",
    req.phone || "",
    req.email || "",
    getWorkTypeTh(req.workType),
    req.projectTitle || "",
    itemsSummary,
    getTimeSlotTh(req.timeSlot),
    req.durationDays || "-",
    req.startDate || "-",
    req.endDate || "-",
    req.applicantSignature ? req.applicantSignature.name : "-",
    req.advisorSignature ? req.advisorSignature.name : "-",
    "-",
    "-"
  ];

  sheet.appendRow(rowData);
  const newRow = sheet.getLastRow();

  // ส่งอีเมลตาม Workflow ขั้นที่ 1:
  // 1. ส่งใบตอบรับไปยังผู้ขอรับบริการ (สถานะ: รอหัวหน้าพิจารณา)
  sendApplicantReceiptEmail(req, trackingNo, formType, itemsSummary, webAppUrl);

  // 2. ส่งแจ้งเตือนคำขอใหม่ไปยังหัวหน้าห้องปฏิบัติการ (พร้อมปุ่มเข้าพิจารณาส่วนที่ 2)
  sendHeadNotificationEmail(req, trackingNo, formType, itemsSummary, webAppUrl);

  return { trackingNo: trackingNo, sheetName: targetSheetName, row: newRow };
}

/**
 * ------------------------------------------------------------------------------
 * WORKFLOW ขั้นที่ 2 และ 3: การพิจารณาอนุมัติ
 * - กรณีหัวหน้าอนุมัติ: ส่งอีเมลมอบหมายงานตรงไปยังนักวิชาการวิทยาศาสตร์ (ยังไม่ส่งผลให้ผู้ขอ)
 * - กรณีหัวหน้าไม่อนุมัติ: ส่งอีเมลแจ้งผลไม่อนุมัติและเหตุผลทันทีไปยังผู้ขอรับบริการ (สิ้นสุด)
 * - กรณีนักวิทยาศาสตร์ลงนามส่วนที่ 3 เสร็จสิ้น: ส่งอีเมลแจ้งผลฉบับสมบูรณ์ทันทีไปยังผู้ขอรับบริการ
 * ------------------------------------------------------------------------------
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

  // ----------------------------------------------------------------------------
  // ตรวจสอบเงื่อนไขตาม Workflow Diagram:
  // ----------------------------------------------------------------------------
  
  // กรณี 2B: หัวหน้าห้องปฏิบัติการไม่อนุมัติส่วนที่ 2 (Rejected)
  if (req.part2 && req.part2.approvalStatus === "rejected") {
    sendHeadRejectedToApplicant(req, trackingNo, formType, webAppUrl);
    return { trackingNo: trackingNo, status: status, actionTaken: "head_rejected_email_sent" };
  }

  // กรณี 3: นักวิชาการวิทยาศาสตร์บันทึกผลตรวจสอบความพร้อม + ลงนามส่วนที่ 3 (เสร็จสิ้นครบ 2 ฝ่าย)
  if (req.part3 && req.part3.approvalStatus && req.part2 && req.part2.approvalStatus === "approved") {
    sendFinalReviewToApplicant(req, trackingNo, formType, webAppUrl);
    return { trackingNo: trackingNo, status: status, actionTaken: "final_review_email_sent" };
  }

  // กรณี 2A: หัวหน้าห้องปฏิบัติการอนุมัติส่วนที่ 2 (Approved) + เลือกนักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ
  // (ยังไม่ส่งอีเมลแจ้งผลสุดท้ายไปยังผู้ขอรับบริการ -> ส่งอีเมลมอบหมายงานตรงไปยังนักวิทยาศาสตร์)
  if (req.part2 && req.part2.approvalStatus === "approved" && (!req.part3 || !req.part3.approvalStatus)) {
    sendCaretakerAssignmentEmail(req, trackingNo, formType, webAppUrl);
    return { trackingNo: trackingNo, status: status, actionTaken: "caretaker_assigned_email_sent" };
  }

  return { trackingNo: trackingNo, status: status };
}

/**
 * ==============================================================================
 * ฟังก์ชันสร้างและจัดส่งอีเมลทั้ง 4 รูปแบบตาม Workflow
 * ==============================================================================
 */

// 1. ใบตอบรับการยื่นคำขอ (ส่งถึง ผู้ขอรับบริการ)
function sendApplicantReceiptEmail(req, trackingNo, formType, itemsSummary, webAppUrl) {
  if (!req.email) return;
  try {
    const formName = getFormNameTh(formType);
    const trackUrl = webAppUrl + "/?action=track&trackingNo=" + encodeURIComponent(trackingNo);
    const subject = "[KKU VET LAB] ใบตอบรับการยื่นคำขอ: " + trackingNo + " - " + formName + " (สถานะ: รอหัวหน้าพิจารณา)";

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
      '      <p style="margin: 3px 0;"><strong>ประเภทแบบฟอร์ม:</strong> ' + formName + '</p>' +
      '      <p style="margin: 3px 0;"><strong>ชื่องาน/โครงการ:</strong> ' + (req.projectTitle || '-') + '</p>' +
      '      <p style="margin: 3px 0;"><strong>รายการที่ขอ:</strong> ' + itemsSummary + '</p>' +
      '      <p style="margin: 3px 0;"><strong>สถานะปัจจุบัน:</strong> <span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 4px; font-weight: bold;">รอหัวหน้าห้องปฏิบัติการพิจารณา (ส่วนที่ 2)</span></p>' +
      '    </div>' +
      '    <div style="text-align: center; margin: 24px 0;">' +
      '      <a href="' + trackUrl + '" style="background: #2563eb; color: #ffffff; padding: 10px 22px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">ตรวจสอบสถานะคำขอออนไลน์</a>' +
      '    </div>' +
      '    <p style="font-size: 13px; color: #64748b;">เมื่อหัวหน้าห้องปฏิบัติการและนักวิชาการวิทยาศาสตร์พิจารณาแล้ว ระบบจะส่งอีเมลแจ้งผลให้ท่านทราบในลำดับถัดไป</p>' +
      '  </div>' +
      '  <div style="background: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">' +
      '    งานห้องปฏิบัติการ คณะสัตวแพทยศาสตร์ มข. • โทร. 043-009700' +
      '  </div>' +
      '</div>';

    MailApp.sendEmail({ to: req.email, subject: subject, htmlBody: htmlBody, name: SENDER_NAME });
  } catch(e) { Logger.log("Error sending applicant receipt: " + e.toString()); }
}

// 2. อีเมลแจ้งเตือนคำขอใหม่ (ส่งถึง หัวหน้าห้องปฏิบัติการ)
function sendHeadNotificationEmail(req, trackingNo, formType, itemsSummary, webAppUrl) {
  try {
    const formName = getFormNameTh(formType);
    const reviewUrl = webAppUrl + "/?action=review&trackingNo=" + encodeURIComponent(trackingNo);
    const subject = "[คำขอใหม่รอพิจารณา] " + trackingNo + " - " + formName + " (" + req.applicantName + ")";

    const htmlBody = 
      '<div style="font-family: \'Sarabun\', sans-serif, Arial; max-width: 620px; margin: 0 auto; border: 1px solid #fed7aa; border-radius: 12px; overflow: hidden; background: #ffffff;">' +
      '  <div style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 22px; text-align: center; color: white;">' +
      '    <h2 style="margin: 0; font-size: 19px;">แจ้งเตือนคำขอใหม่รอการพิจารณา (ส่วนที่ 2)</h2>' +
      '    <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">เรียน หัวหน้างานห้องปฏิบัติการ งานวิจัยและบริการวิชาการ</p>' +
      '  </div>' +
      '  <div style="padding: 24px; color: #1e293b; line-height: 1.6;">' +
      '    <p style="font-size: 15px; margin-top: 0;">มีผู้ขอรับบริการได้ยื่นคำขอใหม่เข้าสู่ระบบ โปรดพิจารณาอนุมัติและมอบหมายงาน:</p>' +
      '    <div style="background: #fff7ed; border-left: 4px solid #ea580c; padding: 16px; margin: 18px 0; border-radius: 6px;">' +
      '      <p style="margin: 3px 0;"><strong>รหัสติดตาม (Tracking No):</strong> <span style="color: #c2410c; font-weight: bold; font-size: 16px;">' + trackingNo + '</span></p>' +
      '      <p style="margin: 3px 0;"><strong>ประเภทคำขอ:</strong> ' + formName + '</p>' +
      '      <p style="margin: 3px 0;"><strong>ผู้ยื่นคำขอ:</strong> ' + req.applicantName + ' (โทร. ' + req.phone + ' | ' + req.email + ')</p>' +
      '      <p style="margin: 3px 0;"><strong>สังกัด/ภาควิชา:</strong> ' + (req.department || '-') + '</p>' +
      '      <p style="margin: 3px 0;"><strong>ชื่องาน/โครงการ:</strong> ' + (req.projectTitle || '-') + '</p>' +
      '      <p style="margin: 3px 0;"><strong>รายการที่ขอ:</strong> ' + itemsSummary + '</p>' +
      '    </div>' +
      '    <div style="text-align: center; margin: 26px 0;">' +
      '      <a href="' + reviewUrl + '" style="background: #ea580c; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(234,88,12,0.3);">เข้าพิจารณาคำขอและมอบหมายงาน (ส่วนที่ 2)</a>' +
      '    </div>' +
      '    <p style="font-size: 12px; color: #64748b; text-align: center;">เมื่อท่านพิจารณาเห็นชอบแล้ว ระบบจะส่งต่อให้นักวิชาการวิทยาศาสตร์ที่ท่านมอบหมายดำเนินการในส่วนที่ 3 ต่อไป</p>' +
      '  </div>' +
      '</div>';

    MailApp.sendEmail({ to: HEAD_OF_LAB_EMAIL, subject: subject, htmlBody: htmlBody, name: SENDER_NAME });
  } catch(e) { Logger.log("Error sending head alert: " + e.toString()); }
}

// 3. ส่งอีเมลมอบหมายงานตรง (ส่งถึง นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ)
function sendCaretakerAssignmentEmail(req, trackingNo, formType, webAppUrl) {
  const assignedEmail = req.part2 && req.part2.assignedStaffEmail;
  if (!assignedEmail) return;
  try {
    const formName = getFormNameTh(formType);
    const reviewUrl = webAppUrl + "/?action=review&trackingNo=" + encodeURIComponent(trackingNo);
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
      '    <p style="font-size: 15px; margin-top: 0;">คำขอใช้บริการ <strong>' + formName + '</strong> (รหัส: ' + trackingNo + ') ได้รับการพิจารณา <strong>"อนุมัติ"</strong> จากหัวหน้าห้องปฏิบัติการแล้ว</p>' +
      '    <p>และได้มอบหมายให้ท่านเป็น <strong>นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ</strong> ในการดูแลและตรวจสอบความพร้อม:</p>' +
      '    <div style="background: #eff6ff; border-left: 4px solid #1d4ed8; padding: 16px; margin: 18px 0; border-radius: 6px;">' +
      '      <p style="margin: 3px 0;"><strong>คำสั่งมอบหมาย / ความเห็นหัวหน้า:</strong> <span style="color: #1e40af; font-weight: bold;">' + comment + '</span></p>' +
      '      <p style="margin: 3px 0;"><strong>ผู้ขอใช้บริการ:</strong> ' + req.applicantName + ' (โทร. ' + req.phone + ')</p>' +
      '      <p style="margin: 3px 0;"><strong>สังกัด/ภาควิชา:</strong> ' + (req.department || '-') + '</p>' +
      '      <p style="margin: 3px 0;"><strong>ชื่องาน:</strong> ' + (req.projectTitle || '-') + '</p>' +
      '    </div>' +
      '    <div style="text-align: center; margin: 26px 0;">' +
      '      <a href="' + reviewUrl + '" style="background: #1d4ed8; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">เข้าตรวจสอบความพร้อมและลงนาม (ส่วนที่ 3)</a>' +
      '    </div>' +
      '    <p style="font-size: 12px; color: #64748b; text-align: center;">เมื่อท่านตรวจสอบและลงนามส่วนที่ 3 ครบถ้วนแล้ว ระบบจะส่งอีเมลแจ้งผลฉบับสมบูรณ์พร้อมใบ PDF ให้ผู้ขอรับบริการทันที</p>' +
      '  </div>' +
      '</div>';

    MailApp.sendEmail({ to: assignedEmail, subject: subject, htmlBody: htmlBody, name: SENDER_NAME });
  } catch(e) { Logger.log("Error sending caretaker assignment: " + e.toString()); }
}

// 4. กรณีหัวหน้าไม่อนุมัติส่วนที่ 2 (ส่งถึง ผู้ขอรับบริการ)
function sendHeadRejectedToApplicant(req, trackingNo, formType, webAppUrl) {
  if (!req.email) return;
  try {
    const formName = getFormNameTh(formType);
    const printUrl = webAppUrl + "/?action=print&trackingNo=" + encodeURIComponent(trackingNo);
    const reason = (req.part2 && (req.part2.rejectionReason || req.part2.comment)) || "ไม่เป็นไปตามเกณฑ์การขอใช้บริการ";
    const subject = "[แจ้งผลการพิจารณาคำขอ] ไม่อนุมัติคำขอ " + trackingNo + " - " + formName;

    const htmlBody = 
      '<div style="font-family: \'Sarabun\', sans-serif, Arial; max-width: 620px; margin: 0 auto; border: 1px solid #fecaca; border-radius: 12px; overflow: hidden; background: #ffffff;">' +
      '  <div style="background: #dc2626; padding: 22px; text-align: center; color: white;">' +
      '    <h2 style="margin: 0; font-size: 19px;">แจ้งผลการพิจารณาคำขอใช้บริการห้องปฏิบัติการ</h2>' +
      '    <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น</p>' +
      '  </div>' +
      '  <div style="padding: 24px; color: #1e293b; line-height: 1.6;">' +
      '    <p style="font-size: 15px; margin-top: 0;">เรียน คุณ <strong>' + req.applicantName + '</strong></p>' +
      '    <p>ตามที่ท่านได้ยื่นคำขอ <strong>' + formName + '</strong> (รหัส: ' + trackingNo + ') นั้น</p>' +
      '    <p>หัวหน้าห้องปฏิบัติการได้พิจารณาคำขอของท่านแล้ว มีผลการพิจารณา: <strong style="color: #dc2626; font-size: 16px;">"ไม่อนุมัติ"</strong></p>' +
      '    <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 18px 0; border-radius: 6px;">' +
      '      <p style="margin: 3px 0;"><strong>เหตุผลการไม่อนุมัติ / ความเห็น:</strong></p>' +
      '      <p style="margin: 6px 0 0 0; color: #991b1b; font-weight: bold; font-size: 14px;">' + reason + '</p>' +
      '    </div>' +
      '    <div style="text-align: center; margin: 24px 0;">' +
      '      <a href="' + printUrl + '" style="background: #64748b; color: #ffffff; padding: 10px 22px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">ดาวน์โหลดเอกสาร PDF (มีบันทึกการไม่อนุมัติ)</a>' +
      '    </div>' +
      '    <p style="font-size: 13px; color: #64748b;">หากมีข้อสงสัยเพิ่มเติม สามารถติดต่อสอบถามได้ที่งานห้องปฏิบัติการฯ คณะสัตวแพทยศาสตร์ มข.</p>' +
      '  </div>' +
      '</div>';

    MailApp.sendEmail({ to: req.email, subject: subject, htmlBody: htmlBody, name: SENDER_NAME });
  } catch(e) { Logger.log("Error sending rejection email: " + e.toString()); }
}

// 5. กรณีพิจารณาเสร็จสิ้นครบ 2 ฝ่าย (ส่งถึง ผู้ขอรับบริการ)
function sendFinalReviewToApplicant(req, trackingNo, formType, webAppUrl) {
  if (!req.email) return;
  try {
    const formName = getFormNameTh(formType);
    const printUrl = webAppUrl + "/?action=print&trackingNo=" + encodeURIComponent(trackingNo);
    const isApproved = req.part3 && req.part3.approvalStatus === "approved";
    const officerName = (req.part3 && req.part3.signature && req.part3.signature.name) || (req.part2 && req.part2.assignedStaffName) || "นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ";
    const officerComment = (req.part3 && req.part3.comment) || "ตรวจสอบความพร้อมเรียบร้อย";
    const subject = "[แจ้งผลการพิจารณาคำขอ] " + (isApproved ? "อนุมัติพร้อมให้บริการ" : "ไม่อนุมัติ") + " คำขอ " + trackingNo + " - " + formName + " (เสร็จสิ้นครบ 2 ฝ่าย)";

    const htmlBody = 
      '<div style="font-family: \'Sarabun\', sans-serif, Arial; max-width: 620px; margin: 0 auto; border: 1px solid #bbf7d0; border-radius: 12px; overflow: hidden; background: #ffffff;">' +
      '  <div style="background: linear-gradient(135deg, #15803d 0%, #166534 100%); padding: 22px; text-align: center; color: white;">' +
      '    <h2 style="margin: 0; font-size: 19px;">แจ้งผลการพิจารณาคำขอฉบับสมบูรณ์</h2>' +
      '    <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">ผ่านการพิจารณาครบถ้วนทั้ง 2 ฝ่ายแล้ว</p>' +
      '  </div>' +
      '  <div style="padding: 24px; color: #1e293b; line-height: 1.6;">' +
      '    <p style="font-size: 15px; margin-top: 0;">เรียน คุณ <strong>' + req.applicantName + '</strong></p>' +
      '    <p>คำขอใช้บริการ <strong>' + formName + '</strong> (รหัส: ' + trackingNo + ') ของท่าน ได้รับการพิจารณาครบถ้วนแล้ว มีผลการพิจารณา: <strong style="color: #15803d; font-size: 16px;">"อนุมัติพร้อมให้บริการ"</strong></p>' +
      '    <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 18px 0; border-radius: 6px;">' +
      '      <p style="margin: 3px 0;"><strong>ผลส่วนที่ 2 (หัวหน้าห้องปฏิบัติการ):</strong> <span style="color: #15803d; font-weight: bold;">อนุมัติ</span></p>' +
      '      <p style="margin: 3px 0;"><strong>ผลส่วนที่ 3 (นักวิชาการวิทยาศาสตร์):</strong> <span style="color: #15803d; font-weight: bold;">ตรวจสอบความพร้อมเรียบร้อย</span></p>' +
      '      <p style="margin: 3px 0;"><strong>ผู้รับผิดชอบดูแล:</strong> ' + officerName + '</p>' +
      '      <p style="margin: 3px 0;"><strong>ข้อความแนะนำ/เงื่อนไข:</strong> ' + officerComment + '</p>' +
      '    </div>' +
      '    <div style="text-align: center; margin: 26px 0;">' +
      '      <a href="' + printUrl + '" style="background: #16a34a; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(22,163,74,0.3);">ดาวน์โหลดใบคำขอฉบับสมบูรณ์ (PDF)</a>' +
      '    </div>' +
      '    <div style="background: #f8fafc; border: 1px dashed #cbd5e1; padding: 12px; border-radius: 8px; font-size: 13px; color: #475569;">' +
      '      <strong>คำแนะนำการเข้ารับบริการ:</strong><br>' +
      '      โปรดพิมพ์หรือบันทึกไฟล์ PDF ใบคำขอนี้ นำมาแสดงต่อเจ้าหน้าที่ในวันและเวลาที่เข้าใช้บริการห้องปฏิบัติการ/รับอุปกรณ์' +
      '    </div>' +
      '  </div>' +
      '</div>';

    MailApp.sendEmail({ to: req.email, subject: subject, htmlBody: htmlBody, name: SENDER_NAME });
  } catch(e) { Logger.log("Error sending final review email: " + e.toString()); }
}

/**
 * อัปเดตแถวข้อมูลในสเปรดชีต
 */
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

function logUserLogin(ss, user, userAgent, source) {
  let sheet = ss.getSheetByName("เข้าสู่ระบบ");
  if (!sheet) {
    sheet = ss.insertSheet("เข้าสู่ระบบ");
    sheet.appendRow(["วัน-เวลาที่เข้าสู่ระบบ", "ชื่อ-สกุล", "อีเมล", "บทบาท (Role)", "ตำแหน่ง/สิทธิ์", "หน่วยงาน/สังกัด", "User Agent / เบราว์เซอร์", "แหล่งที่มา"]);
    sheet.getRange(1, 1, 1, 8).setBackground("#334155").setFontColor("#ffffff").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([
    new Date(),
    user.name || "-",
    user.email || "-",
    user.role || "-",
    user.roleTitle || "-",
    user.department || "-",
    userAgent || "-",
    source || "Web Client"
  ]);
}

function processLoginLog(ss, data) {
  const user = data.user || {};
  logUserLogin(ss, user, data.userAgent, data.source);
  return { success: true };
}

function getFormNameTh(type) {
  if (type === "VET_LAB_02") return "แบบขอใช้ห้องปฏิบัติการ (VET.LAB 02)";
  if (type === "VET_LAB_03") return "แบบขอใช้เครื่องมือวิทยาศาสตร์ (VET.LAB 03)";
  if (type === "VET_LAB_04") return "แบบขอใช้น้ำยา/สารเคมี/วัสดุ (VET.LAB 04)";
  return type;
}
function getRoleTh(role) {
  if (role === "student") return "นักศึกษา";
  if (role === "faculty_staff") return "อาจารย์ / บุคลากรในคณะ";
  if (role === "external") return "บุคคลภายนอก";
  return role || "-";
}
function getWorkTypeTh(type) {
  if (type === "teaching") return "การเรียนการสอน";
  if (type === "research") return "งานวิจัย";
  if (type === "special_problem") return "ปัญหาพิเศษ";
  return type || "-";
}
function getTimeSlotTh(slot) {
  if (slot === "official_hours") return "ในเวลาราชการ";
  if (slot === "after_hours") return "นอกเวลาราชการ";
  if (slot === "both") return "ทั้งในและนอกเวลาราชการ";
  return slot || "-";
}
`;
