/**
 * Google Apps Script (GAS) Complete Script Template for KKU Veterinary Laboratory
 * This script can be copied directly into Google Sheets > Extensions > Apps Script
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ==============================================================================
 * KKU Veterinary Laboratory System - Google Apps Script (Backend & Email Gateway)
 * ==============================================================================
 * คำแนะนำในการติดตั้ง (Installation Instructions):
 * 1. สร้าง Google Sheets เปล่าขึ้นมา 1 ไฟล์ (เช่นชื่อ "ระบบแบบฟอร์ม KKU VET LAB")
 * 2. ไปที่เมนู "ส่วนขยาย" (Extensions) > "Apps Script"
 * 3. ลบโค้ดเดิมใน Code.gs ทั้งหมด แล้ววางโค้ดนี้ลงไปแทน
 * 4. กดบันทึก (Ctrl+S)
 * 5. กดปุ่มสีน้ำเงิน "ทำให้ใช้งานได้" (Deploy) > "การทำให้ใช้งานได้รายการใหม่" (New deployment)
 * 6. เลือกประเภทเป็น "เว็บแอป" (Web app)
 *    - คำอธิบาย: KKU Vet Lab API v1.0
 *    - ดำเนินการในฐานะ (Execute as): "ฉัน" (Me / บัญชี Google ของท่าน)
 *    - ผู้ที่มีสิทธิ์เข้าถึง (Who has access): "ทุกคน" (Anyone) **สำคัญมาก**
 * 7. กด "ทำให้ใช้งานได้" (Deploy) และอนุญาตสิทธิ์การเข้าถึง (Authorize access)
 * 8. คัดลอก "URL ของเว็บแอป" (Web App URL ที่ลงท้ายด้วย /exec) มาใส่ในเว็บระบบ
 * ==============================================================================
 */

const ADMIN_EMAILS = ["suthidaj@kku.ac.th", "lakkch@kku.ac.th"];
const SENDER_NAME = "งานห้องปฏิบัติการฯ คณะสัตวแพทยศาสตร์ มข.";

/**
 * จัดการคำขอ POST จาก Web Application (บันทึกข้อมูล, อัปเดตสถานะ, ส่งอีเมล)
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

    // 1. รับการส่งแบบฟอร์มใหม่
    if (action === "submit_form" || !data.action) {
      const requestData = data.requestData || data;
      const result = processNewSubmission(ss, requestData);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "บันทึกลง Google Sheets และส่งการแจ้งเตือนสำเร็จ",
        trackingNo: result.trackingNo,
        row: result.row,
        sheetName: result.sheetName
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. ทดสอบการเชื่อมต่อ
    if (action === "test_connection" || action === "ping") {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "เชื่อมต่อกับ Google Apps Script สำเร็จ",
        spreadsheetName: ss.getName(),
        spreadsheetUrl: ss.getUrl(),
        userEmail: Session.getActiveUser().getEmail() || "Authorized User",
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. อัปเดตสถานะการอนุมัติ
    if (action === "update_status" || action === "review_request") {
      const updateResult = processStatusUpdate(ss, data);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "อัปเดตสถานะลง Google Sheets สำเร็จ",
        data: updateResult
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. บันทึกประวัติการเข้าสู่ระบบ (Sheet: เข้าสู่ระบบ)
    if (action === "log_login" || action === "login") {
      const loginResult = processLoginLog(ss, data);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "บันทึกประวัติเข้าสู่ระบบลง Google Sheets สำเร็จ",
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

    // 1. Ping / Test
    if (action === "ping") {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        status: "online",
        message: "KKU Vet Lab Google Apps Script Service is active",
        spreadsheetName: ss.getName(),
        time: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. ค้นหาคำขอด้วย Tracking Number
    if (action === "track") {
      const trackingNo = e.parameter.trackingNo;
      if (!trackingNo) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Missing trackingNo" })).setMimeType(ContentService.MimeType.JSON);
      }
      const item = findRequestByTrackingNo(ss, trackingNo);
      return ContentService.createTextOutput(JSON.stringify({
        success: !!item,
        data: item,
        message: item ? "Found request" : "Request not found"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. ดึงรายการคำขอทั้งหมด
    if (action === "get_requests") {
      const formType = e.parameter.formType || "all";
      const requests = getAllRequestsFromSheets(ss, formType);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        count: requests.length,
        data: requests
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Ready"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * บันทึกข้อมูลลง Google Sheets แยกตามประเภทแบบฟอร์ม
 */
function processNewSubmission(ss, req) {
  const formType = req.formType || "VET_LAB_02";
  const trackingNo = req.trackingNo || generateTrackingNo(formType);
  const now = new Date();
  const timestampStr = Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd HH:mm:ss");

  // สรุปรายการห้อง/เครื่องมือ/สารเคมี
  let itemsSummary = "";
  if (formType === "VET_LAB_02" && req.labItems) {
    itemsSummary = req.labItems.map(function(i, idx) {
      return (idx + 1) + ". " + i.labName + (i.remarks ? " (" + i.remarks + ")" : "");
    }).join("\\n");
  } else if (formType === "VET_LAB_03" && req.equipmentItems) {
    itemsSummary = req.equipmentItems.map(function(i, idx) {
      return (idx + 1) + ". " + i.itemName + " จำนวน " + i.quantity + (i.remarksLab ? " [" + i.remarksLab + "]" : "");
    }).join("\\n");
  } else if (formType === "VET_LAB_04" && req.chemicalItems) {
    itemsSummary = req.chemicalItems.map(function(i, idx) {
      return (idx + 1) + ". " + i.itemName + " จำนวน " + i.quantity + (i.remarks ? " [" + i.remarks + "]" : "");
    }).join("\\n");
  }

  // กำหนดชื่อ Sheet ปลายทาง
  let targetSheetName = "รายการคำขอ_Master";
  if (formType === "VET_LAB_02") targetSheetName = "VET_LAB_02_ขอใช้ห้องแล็บ";
  else if (formType === "VET_LAB_03") targetSheetName = "VET_LAB_03_ขอใช้เครื่องมือ";
  else if (formType === "VET_LAB_04") targetSheetName = "VET_LAB_04_ขอเบิกสารเคมี";

  // ดึงหรือสร้าง Sheet
  let sheet = ss.getSheetByName(targetSheetName);
  if (!sheet) {
    sheet = ss.insertSheet(targetSheetName);
    setupSheetHeader(sheet, formType);
  }

  // จัดโครงสร้างแถวข้อมูล
  const rowData = [
    timestampStr,
    trackingNo,
    getFormNameTh(formType),
    req.submissionDateTh || Utilities.formatDate(now, "GMT+7", "d MMMM yyyy"),
    req.status || "pending",
    req.applicantName || "",
    getRoleNameTh(req.role),
    req.studentId || "-",
    req.department || "",
    req.phone || "",
    req.email || "",
    getWorkTypeNameTh(req.workType),
    req.projectTitle || "",
    itemsSummary,
    req.durationDays ? req.durationDays + " วัน (" + (req.startDate || "-") + " ถึง " + (req.endDate || "-") + ")" : (req.pickupDate ? req.pickupDate + " " + (req.pickupTime || "") : "-"),
    req.timeSlot === "official_hours" ? "ในเวลาราชการ" : (req.timeSlot === "after_hours" ? "นอกเวลาราชการ" : (req.timeSlot === "both" ? "ทั้งในและนอกเวลา" : "-")),
    req.applicantSignature ? (req.applicantSignature.name + " (" + req.applicantSignature.date + ")") : req.applicantName,
    req.advisorSignature ? (req.advisorSignature.name + " (" + req.advisorSignature.date + ")") : "-",
    JSON.stringify(req) // เก็บ Raw JSON Payload ไว้กู้คืนหรือแสดงผลเต็ม
  ];

  sheet.appendRow(rowData);
  const rowIndex = sheet.getLastRow();

  // บันทึกลง Master Sheet สำหรับค้นหาภาพรวม
  let masterSheet = ss.getSheetByName("ภาพรวม_Tracking");
  if (!masterSheet) {
    masterSheet = ss.insertSheet("ภาพรวม_Tracking");
    setupMasterSheetHeader(masterSheet);
  }
  masterSheet.appendRow([
    timestampStr,
    trackingNo,
    formType,
    req.applicantName,
    req.email,
    req.phone,
    req.projectTitle,
    req.status || "pending",
    targetSheetName,
    rowIndex
  ]);

  // ส่งอีเมลแจ้งเตือน
  sendNotificationEmails(req, trackingNo, formType, itemsSummary);

  return {
    trackingNo: trackingNo,
    sheetName: targetSheetName,
    row: rowIndex
  };
}

/**
 * อัปเดตสถานะและข้อมูลการพิจารณาลง Google Sheets แบบ Real-time
 */
function processStatusUpdate(ss, data) {
  const trackingNo = data.trackingNo || (data.requestData && data.requestData.trackingNo);
  if (!trackingNo) throw new Error("Missing trackingNo for status update");

  const req = data.requestData || data;
  const status = data.status || req.status || "updated";
  const now = new Date();
  const timestampStr = Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd HH:mm:ss");

  // ข้อความสรุปส่วนที่ 2 (หัวหน้าห้องปฏิบัติการ)
  let part2Summary = "-";
  if (req.part2) {
    const p2Status = req.part2.approvalStatus === "approved" ? "อนุมัติ" : (req.part2.approvalStatus === "rejected" ? "ไม่อนุมัติ" : req.part2.approvalStatus);
    part2Summary = p2Status + " | ผู้พิจารณา: " + (req.part2.signature ? req.part2.signature.name : "-");
    if (req.part2.assignedStaffName) part2Summary += " | มอบหมาย: " + req.part2.assignedStaffName;
    if (req.part2.comment) part2Summary += " | ความเห็น: " + req.part2.comment;
    if (req.part2.rejectionReason) part2Summary += " | เหตุผล: " + req.part2.rejectionReason;
  }

  // ข้อความสรุปส่วนที่ 3 (นักวิชาการวิทยาศาสตร์)
  let part3Summary = "-";
  if (req.part3) {
    const p3Status = req.part3.approvalStatus === "approved" ? "อนุมัติพร้อมให้บริการ" : (req.part3.approvalStatus === "rejected" ? "ไม่อนุมัติ" : req.part3.approvalStatus);
    part3Summary = p3Status + " | ผู้ตรวจสอบ: " + (req.part3.signature ? req.part3.signature.name : "-");
    if (req.part3.comment) part3Summary += " | ความเห็น: " + req.part3.comment;
  }

  // 1. ค้นหาแถวใน Sheet ประจำประเภทฟอร์ม
  const found = findRequestByTrackingNo(ss, trackingNo);
  if (found) {
    const sheet = ss.getSheetByName(found.sheetName);
    if (sheet) {
      // Column 5: สถานะ
      sheet.getRange(found.row, 5).setValue(status);
      
      const lastCol = sheet.getLastColumn();
      if (lastCol >= 19) {
        sheet.getRange(found.row, 19).setValue(part2Summary);
        sheet.getRange(found.row, 20).setValue(part3Summary);
        sheet.getRange(found.row, 21).setValue(timestampStr);
        sheet.getRange(found.row, 22).setValue(JSON.stringify(req));
      } else {
        sheet.getRange(found.row, lastCol).setValue(JSON.stringify(req));
      }
    }
  }

  // 2. บันทึกลง Sheet ประวัติการพิจารณา (Review_Logs) สำหรับ Backup ทุกครั้งแบบ Real-time
  let logSheet = ss.getSheetByName("ประวัติการพิจารณา_Logs");
  if (!logSheet) {
    logSheet = ss.insertSheet("ประวัติการพิจารณา_Logs");
    const logHeaders = [
      "วันเวลาที่พิจารณา",
      "รหัสติดตาม (Tracking No)",
      "สถานะใหม่ (Status)",
      "ส่วนที่ 2 (หัวหน้าห้องปฏิบัติการ)",
      "ส่วนที่ 3 (นักวิชาการวิทยาศาสตร์)",
      "ผู้บันทึก/ผู้พิจารณา",
      "JSON Full Data"
    ];
    logSheet.getRange(1, 1, 1, logHeaders.length).setValues([logHeaders]);
    logSheet.getRange(1, 1, 1, logHeaders.length)
      .setBackground("#4338ca")
      .setFontColor("#ffffff")
      .setFontWeight("bold");
    logSheet.setFrozenRows(1);
  }

  const reviewer = (req.part3 && req.part3.signature && req.part3.signature.name) ||
                   (req.part2 && req.part2.signature && req.part2.signature.name) ||
                   "ผู้พิจารณาในระบบ";

  logSheet.appendRow([
    timestampStr,
    trackingNo,
    status,
    part2Summary,
    part3Summary,
    reviewer,
    JSON.stringify(req)
  ]);

  return {
    trackingNo: trackingNo,
    status: status,
    updatedAt: timestampStr,
    foundInSheet: found ? found.sheetName : null
  };
}

/**
 * บันทึกประวัติการเข้าสู่ระบบลง Sheet: เข้าสู่ระบบ แบบ Real-time
 */
function processLoginLog(ss, data) {
  const user = data.user || data.userData || data;
  const now = new Date();
  const timestampStr = Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd HH:mm:ss");

  const targetSheetName = "เข้าสู่ระบบ";
  let sheet = ss.getSheetByName(targetSheetName);
  if (!sheet) {
    sheet = ss.insertSheet(targetSheetName);
    const headers = [
      "วันเวลาเข้าสู่ระบบ",
      "ชื่อ-นามสกุล",
      "อีเมล",
      "บทบาทในระบบ",
      "สิทธิ์เจ้าหน้าที่",
      "สังกัด/หน่วยงาน",
      "อุปกรณ์/เบราว์เซอร์",
      "ที่มาการเชื่อมต่อ"
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground("#4338ca")
      .setFontColor("#ffffff")
      .setFontWeight("bold")
      .setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  }

  const roleTitle = user.roleTitle || user.role || "ผู้ขอรับบริการ";
  const isStaffStr = user.isStaff ? "เจ้าหน้าที่ (Staff)" : "ผู้ใช้ทั่วไป (Applicant)";
  const userAgent = data.userAgent || user.userAgent || "-";
  const source = data.source || "KKU Vet Lab Web Portal";

  sheet.appendRow([
    timestampStr,
    user.name || "-",
    user.email || "-",
    roleTitle,
    isStaffStr,
    user.department || "คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น",
    userAgent,
    source
  ]);

  return {
    timestamp: timestampStr,
    email: user.email,
    name: user.name,
    sheetName: targetSheetName,
    row: sheet.getLastRow()
  };
}

/**
 * ส่งอีเมลแจ้งเตือนพร้อมแบบคำขอผ่าน Gmail
 */
function sendNotificationEmails(req, trackingNo, formType, itemsSummary) {
  try {
    const formName = getFormNameTh(formType);
    const applicantEmail = req.email;
    const recipients = [applicantEmail].concat(ADMIN_EMAILS).filter(Boolean).join(",");
    const subject = "[KKU VET LAB] ยื่นคำขอสำเร็จ: " + trackingNo + " - " + formName + " (" + req.applicantName + ")";

    const htmlBody = \`
      <div style="font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #c2410c 0%, #9a3412 50%, #431407 100%); padding: 24px 28px; color: #ffffff;">
          <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #fed7aa; font-weight: bold; margin-bottom: 4px;">
            คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น
          </div>
          <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff;">
            ระบบบริการห้องปฏิบัติการออนไลน์
          </h1>
          <div style="margin-top: 10px; display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 8px; font-size: 13px; font-weight: bold;">
            รหัสติดตามคำขอ (Tracking No): <span style="color: #fef08a;">\${trackingNo}</span>
          </div>
        </div>

        <!-- Content -->
        <div style="padding: 28px; color: #1e293b; line-height: 1.6;">
          <p style="margin-top: 0; font-size: 15px;">
            เรียน คุณ <strong>\${req.applicantName}</strong> และหัวหน้างานห้องปฏิบัติการ งานวิจัยและบริการวิชาการ,
          </p>
          <p style="font-size: 14px; color: #475569;">
            ระบบได้รับข้อมูลคำขอของท่านและบันทึกลงฐานข้อมูล Google Sheets เรียบร้อยแล้ว โดยมีรายละเอียดดังนี้:
          </p>

          <!-- Info Box -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0;">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
              รายละเอียดคำขอ (\${formName})
            </h3>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 0; color: #64748b; width: 140px;"><strong>ผู้ยื่นคำขอ:</strong></td>
                <td style="padding: 5px 0; color: #0f172a;">\${req.applicantName} (\${getRoleNameTh(req.role)})</td>
              </tr>
              \${req.studentId ? \`<tr><td style="padding: 5px 0; color: #64748b;"><strong>รหัสนักศึกษา:</strong></td><td style="padding: 5px 0;">\${req.studentId}</td></tr>\` : ''}
              <tr>
                <td style="padding: 5px 0; color: #64748b;"><strong>สังกัด/ภาควิชา:</strong></td>
                <td style="padding: 5px 0; color: #0f172a;">\${req.department || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #64748b;"><strong>เบอร์โทรศัพท์:</strong></td>
                <td style="padding: 5px 0; color: #0f172a;">\${req.phone || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #64748b;"><strong>หัวข้อโครงงาน:</strong></td>
                <td style="padding: 5px 0; color: #0f172a;"><strong>\${req.projectTitle || '-'}</strong></td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #64748b;"><strong>วันที่ยื่นคำขอ:</strong></td>
                <td style="padding: 5px 0; color: #0f172a;">\${req.submissionDateTh || '-'}</td>
              </tr>
            </table>

            <!-- Items -->
            <div style="margin-top: 14px; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px dashed #cbd5e1;">
              <strong style="font-size: 13px; color: #334155;">รายการที่ขอใช้บริการ:</strong>
              <div style="font-size: 13px; color: #1e293b; margin-top: 6px; white-space: pre-line;">\${itemsSummary || '-'}</div>
            </div>
          </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f1f5f9; padding: 16px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น 123 ถ.มิตรภาพ อ.เมือง จ.ขอนแก่น 40002
        </div>
      </div>
    \`;

    MailApp.sendEmail({
      to: recipients,
      subject: subject,
      htmlBody: htmlBody,
      name: SENDER_NAME
    });

    Logger.log("Email sent to: " + recipients);
  } catch (err) {
    Logger.log("Failed to send email: " + err.toString());
  }
}

/**
 * ค้นหาคำขอด้วย Tracking No จากทุก Sheet
 */
function findRequestByTrackingNo(ss, trackingNo) {
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) continue;

    for (let r = 1; r < data.length; r++) {
      if (data[r][1] && String(data[r][1]).trim().toUpperCase() === trackingNo.trim().toUpperCase()) {
        return {
          trackingNo: data[r][1],
          formType: data[r][2],
          submissionDate: data[r][3],
          status: data[r][4],
          applicantName: data[r][5],
          department: data[r][8],
          projectTitle: data[r][12],
          sheetName: sheet.getName(),
          row: r + 1
        };
      }
    }
  }
  return null;
}

/**
 * ดึงรายการทั้งหมดจาก Sheets
 */
function getAllRequestsFromSheets(ss, formType) {
  const results = [];
  const sheets = ss.getSheets();
  sheets.forEach(function(sheet) {
    const sheetName = sheet.getName();
    if (sheetName.indexOf("VET_LAB_") !== 0) return;

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return;

    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      if (!row[1]) continue;

      let fullJson = null;
      const lastColVal = row[row.length - 1];
      if (typeof lastColVal === 'string' && lastColVal.startsWith('{')) {
        try { fullJson = JSON.parse(lastColVal); } catch(e) {}
      }

      if (fullJson) {
        results.push(fullJson);
      } else {
        results.push({
          trackingNo: row[1],
          formType: row[2],
          submissionDateTh: row[3],
          status: row[4] || 'pending',
          applicantName: row[5],
          department: row[8],
          projectTitle: row[12]
        });
      }
    }
  });
  return results;
}

/**
 * ตั้งค่าหัวตาราง (Header) อัตโนมัติ
 */
function setupSheetHeader(sheet, formType) {
  const headers = [
    "วันเวลาที่ยื่น",
    "รหัสติดตาม (Tracking No)",
    "ประเภทแบบฟอร์ม",
    "วันที่ยื่น (ไทย)",
    "สถานะคำขอ (Status)",
    "ชื่อ-นามสกุล ผู้ขอ",
    "สถานภาพ",
    "รหัสนักศึกษา",
    "สังกัด/ภาควิชา",
    "เบอร์โทรศัพท์",
    "อีเมล",
    "ประเภทงาน",
    "ชื่อโครงงาน/วิจัย",
    "รายการที่ขอใช้บริการ",
    "ระยะเวลา/กำหนดรับ",
    "ช่วงเวลาที่ใช้",
    "ลงนามผู้ยื่น",
    "ลงนามอาจารย์ที่ปรึกษา",
    "JSON Data (Raw Payload)"
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground("#c2410c")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
}

function setupMasterSheetHeader(sheet) {
  const headers = [
    "Timestamp",
    "Tracking No",
    "Form Type",
    "Applicant Name",
    "Email",
    "Phone",
    "Project Title",
    "Status",
    "Target Sheet",
    "Row Index"
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground("#0f172a")
    .setFontColor("#ffffff")
    .setFontWeight("bold");
  sheet.setFrozenRows(1);
}

/**
 * Helpers
 */
function getFormNameTh(type) {
  switch (type) {
    case "VET_LAB_02": return "VET.LAB 02 (ขอใช้ห้องปฏิบัติการ)";
    case "VET_LAB_03": return "VET.LAB 03 (ขอใช้เครื่องมือวิทยาศาสตร์)";
    case "VET_LAB_04": return "VET.LAB 04 (ขอเบิกจ่ายสารเคมี/วัสดุ)";
    default: return type;
  }
}

function getRoleNameTh(role) {
  switch (role) {
    case "faculty_staff": return "อาจารย์/บุคลากร";
    case "student": return "นักศึกษา";
    case "external": return "บุคคลภายนอก";
    case "other": return "อื่นๆ";
    default: return role || "-";
  }
}

function getWorkTypeNameTh(workType) {
  switch (workType) {
    case "research": return "งานวิจัย";
    case "special_problem": return "ปัญหาพิเศษ";
    case "teaching": return "การเรียนการสอน";
    case "other": return "อื่นๆ";
    default: return workType || "-";
  }
}

function generateTrackingNo(formType) {
  const prefix = formType ? formType.replace("VET_LAB_", "VL") : "VL";
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return prefix + "-" + year + "-" + randomNum;
}
`;
