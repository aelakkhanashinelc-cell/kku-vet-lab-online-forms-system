import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  XCircle,
  FileText,
  Send,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Building2,
  Wrench,
  FlaskConical,
  Eye,
  Printer,
  Lock,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  AlertCircle,
  Check,
} from 'lucide-react';
import { VetLabRequest, RequestStatus, SignatureData } from '../types';
import { DigitalSignaturePad } from './DigitalSignaturePad';
import { getCurrentThaiDateParts } from '../utils/thaiDate';
import { isGasConfigured, isGasSyncEnabled, syncUpdateToGoogleAppsScript } from '../utils/gasService';
import { STAFF_BY_DEPARTMENT, getFlatPresetStaff, isHeadOfLab, isSuperAdmin, isStaffUser } from '../utils/staffData';
import { generateElectronicSignatureDataUrl } from '../utils/signatureHelper';

interface AdminReviewModalProps {
  request: VetLabRequest;
  onClose: () => void;
  onSaved: (updatedRequest: VetLabRequest) => void;
  onPrint?: (request: VetLabRequest) => void;
  currentUserEmail?: string;
}

export const AdminReviewModal: React.FC<AdminReviewModalProps> = ({
  request,
  onClose,
  onSaved,
  onPrint,
  currentUserEmail = '',
}) => {
  const thaiDate = getCurrentThaiDateParts();
  const normalizedUserEmail = currentUserEmail.trim().toLowerCase();

  // Check if this request has already concluded / fully approved / completed / rejected
  const isPart2Done = Boolean(request.part2?.approvalStatus);
  const isPart3Done = Boolean(request.part3?.approvalStatus);
  const isFullyCompleted =
    request.status === 'completed' ||
    request.status === 'dispensed' ||
    (request.part2?.approvalStatus === 'approved' && request.part3?.approvalStatus === 'approved') ||
    request.status === 'rejected' ||
    request.part2?.approvalStatus === 'rejected' ||
    request.part3?.approvalStatus === 'rejected';

  // Rule 1: Head of Lab (นางสุธิดา จันทร์ลุน: sutvir@kku.ac.th / suthidaj@kku.ac.th) and Admin (lakkch@kku.ac.th) can fill out Part 2
  const isHeadAuthorized = isHeadOfLab(normalizedUserEmail) || isSuperAdmin(normalizedUserEmail);

  // Rule 2: Assigned caretaker, or authorized scientist, or Head/Admin can fill out Part 3
  const assignedCaretakerEmail = (request.part2?.assignedStaffEmail || '').trim().toLowerCase();
  const isCaretakerAuthorized =
    isSuperAdmin(normalizedUserEmail) ||
    isHeadOfLab(normalizedUserEmail) ||
    normalizedUserEmail === assignedCaretakerEmail ||
    isStaffUser(normalizedUserEmail);

  // Review status
  const [targetStatus, setTargetStatus] = useState<RequestStatus>(request.status || 'pending');
  const isHeadOfLabStage = request.status === 'pending' || !request.part2?.approvalStatus;

  // Pre-populated Lab Staff/Caretakers list
  const PRESET_STAFF = getFlatPresetStaff();

  // Part 2 States (Head of Lab)
  const [headApproval, setHeadApproval] = useState<'approved' | 'rejected' | 'forwarded' | 'pending'>(
    request.part2?.approvalStatus || 'approved'
  );
  const [headComment, setHeadComment] = useState(
    request.part2?.comment || 'เห็นควรอนุมัติให้ใช้ห้องปฏิบัติการ/เครื่องมือตามที่ร้องขอ'
  );
  const [headRejectionReason, setHeadRejectionReason] = useState(request.part2?.rejectionReason || '');
  const [headSignature, setHeadSignature] = useState<SignatureData>(
    request.part2?.signature || {
      name: 'นางสุธิดา จันทร์ลุน',
      date: thaiDate.fullStr,
    }
  );

  // States for Assigning Lab Staff (Caretaker) with department filters
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedStaffEmail, setSelectedStaffEmail] = useState<string>(PRESET_STAFF[0]?.email || 'custom');
  const [customStaffName, setCustomStaffName] = useState('');
  const [customStaffEmail, setCustomStaffEmail] = useState('');
  const [assignedStaffComment, setAssignedStaffComment] = useState(
    'มอบหมายเจ้าหน้าที่ดูแลห้องปฏิบัติการ/เครื่องมือวิทยาศาสตร์และตรวจสอบความเรียบร้อย'
  );

  // Part 3 States (Scientist / Lab Officer)
  const [officerApproval, setOfficerApproval] = useState<'approved' | 'rejected' | 'other' | 'pending'>(
    request.part3?.approvalStatus || 'approved'
  );
  const [officerComment, setOfficerComment] = useState(
    request.part3?.comment || request.part3?.rejectionReason || 'ตรวจสอบความพร้อมเรียบร้อย พร้อมให้บริการ'
  );
  const [officerSignature, setOfficerSignature] = useState<SignatureData>(
    request.part3?.signature || {
      name: request.part2?.assignedStaffName || 'นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ',
      date: thaiDate.fullStr,
    }
  );

  const [showDetailsSection, setShowDetailsSection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);

    // Strict Authorization Checks
    if (isHeadOfLabStage && !isHeadAuthorized) {
      setErrorMsg('เฉพาะหัวหน้าห้องปฏิบัติการ (นางสุธิดา จันทร์ลุน: suthidaj@kku.ac.th) เท่านั้นที่มีสิทธิ์พิจารณาส่วนที่ 2');
      setIsSaving(false);
      return;
    }

    if (!isHeadOfLabStage && !isCaretakerAuthorized) {
      setErrorMsg(`เฉพาะเจ้าหน้าที่ผู้ดูแลที่ได้รับมอบหมาย (${request.part2?.assignedStaffEmail || ''}) เท่านั้นที่มีสิทธิ์บันทึกส่วนที่ 3`);
      setIsSaving(false);
      return;
    }

    // Build Part 2 payload
    let part2Payload = request.part2 || null;
    if (isHeadOfLabStage) {
      const staffObj = PRESET_STAFF.find(s => s.email === selectedStaffEmail);
      const assignedStaffName = headApproval === 'approved'
        ? (selectedStaffEmail === 'custom' ? customStaffName : (staffObj ? staffObj.name : ''))
        : undefined;
      const assignedStaffEmail = headApproval === 'approved'
        ? (selectedStaffEmail === 'custom' ? customStaffEmail : selectedStaffEmail)
        : undefined;
      const assignedStaffDepartment = headApproval === 'approved'
        ? (selectedStaffEmail === 'custom' ? 'ระบุเอง' : (staffObj ? staffObj.dept : ''))
        : undefined;

      const headName = headSignature.name || 'นางสุธิดา จันทร์ลุน';
      const headDate = headSignature.date || thaiDate.fullStr;
      const headDataUrl = headSignature.dataUrl || generateElectronicSignatureDataUrl(headName, 'หัวหน้าห้องปฏิบัติการ', headDate);

      part2Payload = {
        approvalStatus: headApproval,
        comment: headComment,
        rejectionReason: headApproval === 'rejected' ? headRejectionReason : undefined,
        signature: {
          name: headName,
          date: headDate,
          dataUrl: headDataUrl,
        },
        reviewedAt: new Date().toISOString(),
        assignedStaffName,
        assignedStaffEmail,
        assignedStaffDepartment,
        assignedStaffComment: headApproval === 'approved' ? assignedStaffComment : undefined,
      };
    }

    // Build Part 3 payload (Only when not in Head of Lab stage)
    let part3Payload: any = request.part3 || null;
    if (!isHeadOfLabStage) {
      const offName = officerSignature.name || request.part2?.assignedStaffName || 'นักวิชาการวิทยาศาสตร์';
      const offDate = officerSignature.date || thaiDate.fullStr;
      const offDataUrl = officerSignature.dataUrl || generateElectronicSignatureDataUrl(offName, 'นักวิชาการวิทยาศาสตร์', offDate);

      part3Payload = {
        approvalStatus: officerApproval,
        comment: officerComment,
        rejectionReason: officerApproval === 'rejected' ? officerComment : undefined,
        signature: {
          name: offName,
          date: offDate,
          dataUrl: offDataUrl,
        },
        reviewedAt: new Date().toISOString(),
      };
    }

    // Determine target RequestStatus
    let nextStatus: RequestStatus = request.status;
    if (isHeadOfLabStage) {
      if (headApproval === 'rejected') {
        nextStatus = 'rejected';
      } else {
        nextStatus = 'approved_by_head'; // Transitions to pending scientist stage
      }
    } else {
      // Scientist / Officer stage
      if (officerApproval === 'rejected') {
        nextStatus = 'rejected';
      } else {
        nextStatus = 'completed';
      }
    }

    try {
      const res = await fetch(`/api/requests/${request.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          part2: part2Payload,
          part3: part3Payload,
          reviewerName: isHeadOfLabStage ? headSignature.name : officerSignature.name,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'เกิดข้อผิดพลาดในการบันทึกผลการพิจารณา');
      }

      // Sync to Google Apps Script in real-time if configured
      if (isGasConfigured() && isGasSyncEnabled()) {
        try {
          await syncUpdateToGoogleAppsScript(json.data);
        } catch (gasErr) {
          console.warn('Google Apps Script real-time sync failed:', gasErr);
        }
      }

      onSaved(json.data);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper for form badge
  const getFormBadge = (type: string) => {
    switch (type) {
      case 'VET_LAB_02':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded border border-blue-200">แบบฟอร์ม 02: ขอใช้ห้องแล็บ</span>;
      case 'VET_LAB_03':
        return <span className="bg-teal-100 text-teal-800 text-[11px] font-bold px-2 py-0.5 rounded border border-teal-200">แบบฟอร์ม 03: ขอใช้เครื่องมือวิทยาศาสตร์</span>;
      case 'VET_LAB_04':
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2 py-0.5 rounded border border-purple-200">แบบฟอร์ม 04: ขอเบิกสารเคมี/วัสดุ</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded">{type}</span>;
    }
  };

  // ---------------------------------------------------------------------------
  // READ-ONLY / FULLY APPROVED & LOCKED VIEW
  // ---------------------------------------------------------------------------
  if (isFullyCompleted) {
    const isHeadRejected = request.part2?.approvalStatus === 'rejected';
    const isOfficerRejected = request.part3?.approvalStatus === 'rejected';
    const isApprovedAll =
      (request.part2?.approvalStatus === 'approved' && request.part3?.approvalStatus === 'approved') ||
      request.status === 'completed' ||
      request.status === 'dispensed';

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700 font-semibold text-slate-200">
                  {request.trackingNo}
                </span>
                {getFormBadge(request.formType)}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <Lock className="w-3 h-3" />
                  ล็อคผลการพิจารณา (Read-Only)
                </span>
              </div>
              <h2 className="font-bold text-base sm:text-lg mt-1 tracking-tight text-white flex items-center gap-2">
                {isApprovedAll ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    รายละเอียดคำขอและผลการพิจารณาฉบับสมบูรณ์ (อนุมัติครบถ้วน)
                  </>
                ) : isHeadRejected ? (
                  <>
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                    รายละเอียดคำขอและผลการพิจารณา (หัวหน้าห้องปฏิบัติการไม่อนุมัติ)
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                    รายละเอียดคำขอและผลการพิจารณา (ไม่อนุมัติ)
                  </>
                )}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
            {/* Status Banner */}
            {isApprovedAll ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-3 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-sm text-emerald-950">
                    คำขอนี้ได้รับการพิจารณาและอนุมัติครบถ้วนทั้ง 2 ส่วนเรียบร้อยแล้ว
                  </div>
                  <div className="text-emerald-800 mt-1">
                    ข้อมูลคำขอ รายการที่ขอใช้ และผลการพิจารณาพร้อมลายมือชื่อดิจิทัลถูกบันทึกลงฐานข้อมูลอย่างเป็นทางการแล้ว (ไม่สามารถแก้ไขได้อีก) ท่านสามารถพิมพ์แบบฟอร์มเพื่อใช้ติดต่อเข้ารับบริการ
                  </div>
                </div>
              </div>
            ) : isHeadRejected ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 flex items-start gap-3 shadow-xs">
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-sm text-red-950">
                    คำขอนี้ไม่ได้รับการอนุมัติจากหัวหน้าห้องปฏิบัติการ (สิ้นสุดขั้นตอนการพิจารณาในส่วนที่ 2)
                  </div>
                  <div className="text-red-800 mt-1">
                    ผลการพิจารณาและเหตุผลที่ไม่อนุมัติถูกบันทึกลงระบบและล็อคเรียบร้อยแล้ว ไม่สามารถแก้ไขได้อีก (ไม่มีการส่งต่อการพิจารณาส่วนที่ 3)
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 flex items-start gap-3 shadow-xs">
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-sm text-red-950">
                    คำขอนี้เสร็จสิ้นขั้นตอนการพิจารณาแล้ว (ไม่อนุมัติ)
                  </div>
                  <div className="text-red-800 mt-1">
                    ผลการพิจารณาถูกล็อคเรียบร้อยแล้ว ไม่สามารถแก้ไขได้
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 1: ข้อมูลคำขอของผู้ขอรับบริการ */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                    ส่วนที่ 1: รายละเอียดข้อมูลคำขอ (ผู้ขอรับบริการ)
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  ยื่นเมื่อ: {request.submissionDateTh}
                </span>
              </div>

              <div className="p-4 sm:p-5 space-y-4 text-xs">
                {/* Applicant info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 text-[11px]">ชื่อ-สกุล ผู้ขอรับบริการ:</span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{request.applicantName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">สถานะ/ตำแหน่ง:</span>
                    <div className="font-semibold text-slate-800 mt-0.5">{request.position || request.applicantPosition || '-'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">รหัสนักศึกษา/บุคลากร:</span>
                    <div className="font-mono text-slate-800 mt-0.5">{request.studentId || '-'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">สังกัด / ภาควิชา:</span>
                    <div className="font-semibold text-slate-800 mt-0.5">{request.department || '-'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">เบอร์โทรศัพท์:</span>
                    <div className="font-mono text-slate-800 mt-0.5">{request.phone || '-'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">อีเมล:</span>
                    <div className="font-mono text-slate-800 mt-0.5">{request.email || '-'}</div>
                  </div>
                </div>

                {/* Project Title */}
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                  <span className="text-indigo-900 font-bold text-[11px] block">หัวข้อโครงงาน / วัตถุประสงค์ในการขอใช้:</span>
                  <div className="font-semibold text-slate-900 text-sm mt-0.5">{request.projectTitle || '-'}</div>
                  {request.subjectCode && (
                    <div className="text-slate-600 text-xs mt-1">
                      รหัสวิชา / โครงการ: <strong>{request.subjectCode}</strong>
                    </div>
                  )}
                </div>

                {/* Form 02 Lab Items */}
                {request.formType === 'VET_LAB_02' && (
                  <div className="space-y-2">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      รายการห้องปฏิบัติการที่ขอใช้ ({request.labItems?.length || 0} ห้อง)
                    </div>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 font-semibold text-slate-700">
                          <tr>
                            <th className="p-2 w-10 text-center">#</th>
                            <th className="p-2">ห้องปฏิบัติการ / สาขาวิชา</th>
                            <th className="p-2">หมายเหตุ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {request.labItems?.map((item, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="p-2 text-center text-slate-500 font-mono">{i + 1}</td>
                              <td className="p-2 font-medium text-slate-800">{item.labName}</td>
                              <td className="p-2 text-slate-600">{item.remarks || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200 flex flex-wrap gap-4">
                      <span>ช่วงวันที่ขอใช้: <strong>{request.startDate} ถึง {request.endDate}</strong> ({request.durationDays || 1} วัน)</span>
                      <span>ช่วงเวลา: <strong>{request.timeSlot === 'official_hours' ? 'ในเวลาราชการ' : request.timeSlot === 'after_hours' ? 'นอกเวลาราชการ' : 'ทั้งในและนอกเวลาราชการ'}</strong></span>
                    </div>
                  </div>
                )}

                {/* Form 03 Equipment Items */}
                {request.formType === 'VET_LAB_03' && (
                  <div className="space-y-2">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-teal-600" />
                      รายการเครื่องมือวิทยาศาสตร์ที่ขอใช้ ({request.equipmentItems?.length || 0} รายการ)
                    </div>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 font-semibold text-slate-700">
                          <tr>
                            <th className="p-2 w-10 text-center">#</th>
                            <th className="p-2">ชื่อเครื่องมือวิทยาศาสตร์</th>
                            <th className="p-2 w-20 text-center">จำนวน</th>
                            <th className="p-2">สถานที่/ห้องปฏิบัติการ</th>
                            <th className="p-2 w-24 text-center">ประเภท</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {request.equipmentItems?.map((item, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="p-2 text-center text-slate-500 font-mono">{i + 1}</td>
                              <td className="p-2 font-medium text-slate-800">{item.itemName}</td>
                              <td className="p-2 text-center font-bold text-slate-800">{item.quantity}</td>
                              <td className="p-2 text-slate-600">{item.remarksLab || '-'}</td>
                              <td className="p-2 text-center">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${item.isFieldEquipment ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                                  {item.isFieldEquipment ? 'ภาคสนาม' : 'ห้องแล็บ'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Form 04 Chemical Items */}
                {request.formType === 'VET_LAB_04' && (
                  <div className="space-y-2">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <FlaskConical className="w-4 h-4 text-purple-600" />
                      รายการสารเคมีและวัสดุที่ขอเบิก ({request.chemicalItems?.length || 0} รายการ)
                    </div>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 font-semibold text-slate-700">
                          <tr>
                            <th className="p-2 w-10 text-center">#</th>
                            <th className="p-2">ชื่อสารเคมี / วัสดุ</th>
                            <th className="p-2 w-28 text-center">จำนวนที่ขอเบิก</th>
                            <th className="p-2">หมายเหตุ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {request.chemicalItems?.map((item, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="p-2 text-center text-slate-500 font-mono">{i + 1}</td>
                              <td className="p-2 font-medium text-slate-800">{item.itemName}</td>
                              <td className="p-2 text-center font-bold text-purple-800">{item.quantity}</td>
                              <td className="p-2 text-slate-600">{item.remarks || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Part 1 Signatures */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-[11px] text-slate-500">ผู้ขอรับบริการ:</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {request.applicantSignature?.name || request.applicantName}
                    </div>
                    <div className="text-[10px] text-slate-400">วันที่ลงนาม: {request.submissionDateTh}</div>
                    {request.applicantSignature?.dataUrl && (
                      <div className="mt-2 h-10 flex items-center p-1 bg-white border border-slate-200 rounded">
                        <img src={request.applicantSignature.dataUrl} alt="Applicant Signature" className="max-h-8 object-contain" />
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-[11px] text-slate-500">อาจารย์ที่ปรึกษา / หัวหน้าโครงการ:</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {request.advisorSignature?.name || 'อาจารย์ที่ปรึกษา'}
                    </div>
                    <div className="text-[10px] text-slate-400">วันที่ลงนาม: {request.advisorSignature?.date || request.submissionDateTh}</div>
                    {request.advisorSignature?.dataUrl && (
                      <div className="mt-2 h-10 flex items-center p-1 bg-white border border-slate-200 rounded">
                        <img src={request.advisorSignature.dataUrl} alt="Advisor Signature" className="max-h-8 object-contain" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: ผลการพิจารณาของหัวหน้าห้องปฏิบัติการ */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${request.part2?.approvalStatus === 'approved' ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                    ส่วนที่ 2: ผลการพิจารณาของหัวหน้าห้องปฏิบัติการ (นางสุธิดา จันทร์ลุน)
                  </h3>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border ${
                  request.part2?.approvalStatus === 'approved'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                }`}>
                  {request.part2?.approvalStatus === 'approved' ? 'อนุมัติแล้ว' : 'ไม่อนุมัติ'}
                </span>
              </div>

              <div className="p-4 sm:p-5 space-y-3 text-xs">
                {/* Comment / Directive */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-slate-500 text-[11px]">ความเห็น / ข้อสั่งการของหัวหน้าห้องปฏิบัติการ:</div>
                  <div className="font-semibold text-slate-900 mt-1">
                    {request.part2?.comment || request.part2?.rejectionReason || 'เห็นควรอนุมัติให้ใช้ห้องปฏิบัติการ/เครื่องมือตามที่ร้องขอ'}
                  </div>
                </div>

                {/* Assigned Staff */}
                {request.part2?.assignedStaffName && (
                  <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg">
                    <div className="text-indigo-900 text-[11px] font-bold">นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบที่ได้รับมอบหมาย:</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      {request.part2.assignedStaffName}
                    </div>
                    <div className="text-slate-600 text-xs mt-0.5 flex flex-wrap gap-3">
                      <span>สังกัด: <strong>{request.part2.assignedStaffDepartment || 'งานห้องปฏิบัติการ'}</strong></span>
                      {request.part2.assignedStaffEmail && (
                        <span>อีเมล: <strong className="font-mono">{request.part2.assignedStaffEmail}</strong></span>
                      )}
                    </div>
                    {request.part2.assignedStaffComment && (
                      <div className="mt-2 text-[11px] text-indigo-950 bg-white p-2 rounded border border-indigo-100">
                        <strong>คำสั่งมอบหมาย:</strong> {request.part2.assignedStaffComment}
                      </div>
                    )}
                  </div>
                )}

                {/* Head Signature */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="text-slate-500 text-[11px]">หัวหน้าห้องปฏิบัติการ:</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {request.part2?.signature?.name || 'นางสุธิดา จันทร์ลุน'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      วันที่พิจารณา: {request.part2?.reviewedAt ? new Date(request.part2.reviewedAt).toLocaleDateString('th-TH') : request.part2?.signature?.date || '-'}
                    </div>
                  </div>
                  <div className="min-w-[130px] h-12 border border-slate-200 rounded flex items-center justify-center p-1 bg-white">
                    {request.part2?.signature?.dataUrl ? (
                      <img src={request.part2.signature.dataUrl} alt="Head Signature" className="max-h-10 object-contain" />
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 font-mono">ลงนามทางอิเล็กทรอนิกส์</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: ผลการพิจารณาของนักวิชาการวิทยาศาสตร์ (แสดงเฉพาะเมื่อส่วนที่ 2 ผ่านการอนุมัติ) */}
            {!isHeadRejected && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${request.part3?.approvalStatus === 'approved' || request.status === 'completed' || request.status === 'dispensed' ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                      ส่วนที่ 3: ผลการพิจารณาและการตรวจสอบของนักวิชาการวิทยาศาสตร์ / ผู้รับผิดชอบ
                    </h3>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border ${
                    request.part3?.approvalStatus === 'approved' || request.status === 'completed' || request.status === 'dispensed'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-red-100 text-red-800 border-red-300'
                  }`}>
                    {request.part3?.approvalStatus === 'approved' || request.status === 'completed' || request.status === 'dispensed'
                      ? 'ตรวจสอบ & อนุมัติแล้ว'
                      : 'ไม่อนุมัติ'}
                  </span>
                </div>

                <div className="p-4 sm:p-5 space-y-3 text-xs">
                  {/* Inspection comment */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="text-slate-500 text-[11px]">บันทึกการตรวจสอบความพร้อม / ความเห็น:</div>
                    <div className="font-semibold text-slate-900 mt-1">
                      {request.part3?.comment || request.part3?.rejectionReason || 'ตรวจสอบความพร้อมของห้องปฏิบัติการ/เครื่องมือวิทยาศาสตร์เรียบร้อย พร้อมให้บริการ'}
                    </div>
                  </div>

                  {/* Form 04 Dispensing / Expense details */}
                  {request.formType === 'VET_LAB_04' && request.part3?.totalExpense !== undefined && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-slate-600 text-xs">สรุปยอดค่าใช้จ่ายในการเบิกสารเคมี/วัสดุ:</span>
                        <div className="font-bold text-purple-900 text-sm">
                          {request.part3.totalExpense.toLocaleString()} บาท
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded bg-purple-200 text-purple-900">
                        {request.part3.isDispensed ? 'จ่ายสารเคมีแล้ว' : 'รอส่งมอบ'}
                      </span>
                    </div>
                  )}

                  {/* Officer Signature */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="text-slate-500 text-[11px]">นักวิชาการวิทยาศาสตร์ / เจ้าหน้าที่ผู้รับผิดชอบ:</div>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {request.part3?.signature?.name || request.part2?.assignedStaffName || 'นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        วันที่พิจารณา: {request.part3?.reviewedAt ? new Date(request.part3.reviewedAt).toLocaleDateString('th-TH') : request.part3?.signature?.date || '-'}
                      </div>
                    </div>
                    <div className="min-w-[130px] h-12 border border-slate-200 rounded flex items-center justify-center p-1 bg-white">
                      {request.part3?.signature?.dataUrl ? (
                        <img src={request.part3.signature.dataUrl} alt="Officer Signature" className="max-h-10 object-contain" />
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 font-mono">ลงนามทางอิเล็กทรอนิกส์</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls (No edit inputs or save buttons) */}
          <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>เอกสารถูกล็อคตามระเบียบการพิจารณา (Read-Only) ข้อมูลสมบูรณ์แล้ว</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {onPrint && (
                <button
                  type="button"
                  onClick={() => onPrint(request)}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-indigo-600" />
                  <span>พิมพ์แบบฟอร์ม / ดาวน์โหลด PDF</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // ACTIVE REVIEW FORM VIEW (For pending approvals)
  // ---------------------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700 font-semibold text-slate-200">
                {request.trackingNo}
              </span>
              <span className="text-xs text-indigo-300 font-medium">({request.formType})</span>
            </div>
            <h2 className="font-semibold text-base sm:text-lg mt-1 tracking-tight">
              พิจารณาและอนุมัติคำขอ ({isHeadOfLabStage ? 'ส่วนที่ 2: หัวหน้าห้องปฏิบัติการ' : 'ส่วนที่ 3: นักวิชาการวิทยาศาสตร์'})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Quick Summary Banner with Expandable Full Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden text-xs text-slate-700 shadow-2xs">
            <div className="p-4 space-y-1.5">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">ผู้ขอใช้บริการ:</span>
                  <strong className="text-slate-900 font-bold text-sm">{request.applicantName}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">วันที่ยื่น:</span>
                  <strong className="text-slate-900 font-semibold">{request.submissionDateTh}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-600">
                <div>สังกัด: <strong>{request.department}</strong> | โทรศัพท์: <strong className="font-mono">{request.phone}</strong></div>
                <div>อีเมล: <strong className="font-mono">{request.email}</strong></div>
              </div>

              <div className="pt-1">
                <span className="text-slate-500">หัวข้อโครงงาน/เรื่อง:</span>{' '}
                <strong className="text-indigo-950 font-semibold">{request.projectTitle || '-'}</strong>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDetailsSection(!showDetailsSection)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-indigo-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{showDetailsSection ? 'ซ่อนรายละเอียดรายการคำขอ' : 'ดูรายละเอียดรายการที่ขอใช้ (ห้องแล็บ / เครื่องมือ / สารเคมี / ลายมือชื่อ)'}</span>
                  {showDetailsSection ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Collapsible Details Panel */}
            {showDetailsSection && (
              <div className="p-4 border-t border-slate-200 bg-white space-y-4 animate-in fade-in duration-150">
                {/* Form 02 Items */}
                {request.formType === 'VET_LAB_02' && (
                  <div className="space-y-2">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      รายการห้องปฏิบัติการที่ขอใช้ ({request.labItems?.length || 0} ห้อง)
                    </div>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 font-semibold text-slate-700">
                          <tr>
                            <th className="p-2 w-10 text-center">#</th>
                            <th className="p-2">ห้องปฏิบัติการ / สาขาวิชา</th>
                            <th className="p-2">หมายเหตุ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {request.labItems?.map((item, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="p-2 text-center text-slate-500 font-mono">{i + 1}</td>
                              <td className="p-2 font-medium text-slate-800">{item.labName}</td>
                              <td className="p-2 text-slate-600">{item.remarks || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                      ช่วงวัน: <strong>{request.startDate} ถึง {request.endDate}</strong> ({request.durationDays || 1} วัน) | ช่วงเวลา: <strong>{request.timeSlot === 'official_hours' ? 'ในเวลาราชการ' : request.timeSlot === 'after_hours' ? 'นอกเวลาราชการ' : 'ทั้งสองช่วง'}</strong>
                    </div>
                  </div>
                )}

                {/* Form 03 Items */}
                {request.formType === 'VET_LAB_03' && (
                  <div className="space-y-2">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-teal-600" />
                      รายการเครื่องมือวิทยาศาสตร์ที่ขอใช้ ({request.equipmentItems?.length || 0} รายการ)
                    </div>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 font-semibold text-slate-700">
                          <tr>
                            <th className="p-2 w-10 text-center">#</th>
                            <th className="p-2">ชื่อเครื่องมือ</th>
                            <th className="p-2 w-20 text-center">จำนวน</th>
                            <th className="p-2">สถานที่/ห้อง</th>
                            <th className="p-2 w-24 text-center">ประเภท</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {request.equipmentItems?.map((item, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="p-2 text-center text-slate-500 font-mono">{i + 1}</td>
                              <td className="p-2 font-medium text-slate-800">{item.itemName}</td>
                              <td className="p-2 text-center font-bold text-slate-700">{item.quantity}</td>
                              <td className="p-2 text-slate-600">{item.remarksLab || '-'}</td>
                              <td className="p-2 text-center">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${item.isFieldEquipment ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                                  {item.isFieldEquipment ? 'ภาคสนาม' : 'ห้องแล็บ'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Form 04 Items */}
                {request.formType === 'VET_LAB_04' && (
                  <div className="space-y-2">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <FlaskConical className="w-4 h-4 text-purple-600" />
                      รายการสารเคมีและวัสดุที่ขอเบิก ({request.chemicalItems?.length || 0} รายการ)
                    </div>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 font-semibold text-slate-700">
                          <tr>
                            <th className="p-2 w-10 text-center">#</th>
                            <th className="p-2">ชื่อสารเคมี / วัสดุ</th>
                            <th className="p-2 w-24 text-center">ปริมาณ</th>
                            <th className="p-2">หมายเหตุ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {request.chemicalItems?.map((item, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="p-2 text-center text-slate-500 font-mono">{i + 1}</td>
                              <td className="p-2 font-medium text-slate-800">{item.itemName}</td>
                              <td className="p-2 text-center font-bold text-purple-700">{item.quantity}</td>
                              <td className="p-2 text-slate-600">{item.remarks || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Signatures Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-[11px] text-slate-500 font-medium">ผู้ขอรับบริการ:</div>
                    <div className="font-semibold text-slate-900 mt-1">
                      {request.applicantSignature?.name || request.applicantName}
                    </div>
                    {request.applicantSignature?.dataUrl && (
                      <img src={request.applicantSignature.dataUrl} alt="Signature" className="max-h-8 mt-1" />
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-[11px] text-slate-500 font-medium">อาจารย์ที่ปรึกษา / หน.โครงการ:</div>
                    <div className="font-semibold text-slate-900 mt-1">
                      {request.advisorSignature?.name || 'อาจารย์ที่ปรึกษา'}
                    </div>
                    {request.advisorSignature?.dataUrl && (
                      <img src={request.advisorSignature.dataUrl} alt="Advisor Signature" className="max-h-8 mt-1" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Head of Lab Approval */}
          {isHeadOfLabStage && (
            <div className="border border-indigo-200 rounded-lg p-5 bg-indigo-50/20 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                ส่วนที่ 2 : ความเห็นของหัวหน้าห้องปฏิบัติการ (นางสุธิดา จันทร์ลุน นักวิชาการวิทยาศาสตร์ ชำนาญการพิเศษ)
              </h3>

              {!isHeadAuthorized && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-lg text-xs font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    ระบบจำกัดสิทธิ์: บัญชีของท่านไม่ใช่หัวหน้าห้องปฏิบัติการ (<strong>suthidaj@kku.ac.th</strong>)
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  ผลการพิจารณา:
                </label>
                <div className="flex flex-wrap gap-3">
                  <label className={`flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-lg border border-emerald-200 shadow-2xs ${!isHeadAuthorized ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                      type="radio"
                      name="headApprove"
                      disabled={!isHeadAuthorized}
                      checked={headApproval === 'approved'}
                      onChange={() => {
                        setHeadApproval('approved');
                        setTargetStatus('approved');
                      }}
                      className="text-emerald-600 focus:ring-emerald-500 disabled:cursor-not-allowed"
                    />
                    <span>อนุมัติคำขอ</span>
                  </label>

                  <label className={`flex items-center gap-2 text-xs font-medium text-red-800 bg-red-50 px-3.5 py-2 rounded-lg border border-red-200 shadow-2xs ${!isHeadAuthorized ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                      type="radio"
                      name="headApprove"
                      disabled={!isHeadAuthorized}
                      checked={headApproval === 'rejected'}
                      onChange={() => {
                        setHeadApproval('rejected');
                        setTargetStatus('rejected');
                      }}
                      className="text-red-600 focus:ring-red-500 disabled:cursor-not-allowed"
                    />
                    <span>ไม่อนุมัติ</span>
                  </label>
                </div>
              </div>

              {headApproval === 'approved' && (
                <div className="space-y-4 border-t border-indigo-100 pt-4">
                  {/* Staff Assignment Section */}
                  <div className="space-y-3 bg-white p-4 rounded-lg border border-indigo-200 shadow-2xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-indigo-600" />
                        มอบหมายนักวิชาการวิทยาศาสตร์ / เจ้าหน้าที่ผู้รับผิดชอบ:
                      </label>

                      {/* Department Filter Pills */}
                      <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
                        <button
                          type="button"
                          disabled={!isHeadAuthorized}
                          onClick={() => setSelectedDeptFilter('all')}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                            selectedDeptFilter === 'all'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          ทั้งหมด
                        </button>
                        {Object.keys(STAFF_BY_DEPARTMENT).map((dept) => (
                          <button
                            key={dept}
                            type="button"
                            disabled={!isHeadAuthorized}
                            onClick={() => setSelectedDeptFilter(dept)}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                              selectedDeptFilter === dept
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {dept.replace('สาขาวิชา', '')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Staff Dropdown */}
                    <div className="space-y-2">
                      <select
                        disabled={!isHeadAuthorized}
                        value={selectedStaffEmail}
                        onChange={(e) => setSelectedStaffEmail(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
                      >
                        {Object.entries(STAFF_BY_DEPARTMENT)
                          .filter(([deptName]) => selectedDeptFilter === 'all' || deptName === selectedDeptFilter)
                          .map(([deptName, staffList]) => (
                            <optgroup key={deptName} label={deptName}>
                              {staffList.map((staff) => (
                                <option key={staff.email} value={staff.email}>
                                  {staff.name} — {staff.position || 'นักวิชาการวิทยาศาสตร์'} ({staff.email})
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        <option value="custom">-- กำหนดชื่อเจ้าหน้าที่เอง (ระบุอิสระ) --</option>
                      </select>

                      {/* Custom staff fields if selected */}
                      {selectedStaffEmail === 'custom' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded border border-slate-200 animate-in fade-in">
                          <input
                            type="text"
                            placeholder="ชื่อ-สกุล เจ้าหน้าที่"
                            disabled={!isHeadAuthorized}
                            value={customStaffName}
                            onChange={(e) => setCustomStaffName(e.target.value)}
                            className="text-xs px-3 py-1.5 border border-slate-300 rounded bg-white"
                          />
                          <input
                            type="email"
                            placeholder="อีเมลเจ้าหน้าที่ (@kku.ac.th)"
                            disabled={!isHeadAuthorized}
                            value={customStaffEmail}
                            onChange={(e) => setCustomStaffEmail(e.target.value)}
                            className="text-xs px-3 py-1.5 border border-slate-300 rounded bg-white"
                          />
                        </div>
                      )}

                      {/* Selected staff detail badge */}
                      {selectedStaffEmail !== 'custom' && (
                        <div className="text-[11px] text-slate-600 bg-indigo-50/50 p-2 rounded border border-indigo-100 flex items-center justify-between">
                          <span>
                            ผู้ได้รับมอบหมาย: <strong>{PRESET_STAFF.find((s) => s.email === selectedStaffEmail)?.name}</strong>
                          </span>
                          <span className="font-mono text-indigo-700">{selectedStaffEmail}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">
                        คำสั่งการ / ข้อความมอบหมายถึงเจ้าหน้าที่:
                      </label>
                      <input
                        type="text"
                        disabled={!isHeadAuthorized}
                        value={assignedStaffComment}
                        onChange={(e) => setAssignedStaffComment(e.target.value)}
                        placeholder="ระบุข้อความมอบหมาย..."
                        className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      ความเห็นและข้อสั่งการของหัวหน้าห้องปฏิบัติการ:
                    </label>
                    <textarea
                      rows={3}
                      disabled={!isHeadAuthorized}
                      value={headComment}
                      onChange={(e) => setHeadComment(e.target.value)}
                      placeholder="ระบุความเห็น ข้อเสนอแนะ หรือเงื่อนไขการอนุมัติ..."
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-sky-500 outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed font-normal"
                    />
                  </div>
                </div>
              )}

              {headApproval === 'rejected' && (
                <div className="space-y-1.5 border-t border-indigo-100 pt-3">
                  <label className="text-xs font-semibold text-red-700 block">
                    เหตุผลที่ไม่อนุมัติ: <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    disabled={!isHeadAuthorized}
                    value={headRejectionReason}
                    onChange={(e) => setHeadRejectionReason(e.target.value)}
                    placeholder="ระบุเหตุผลที่ไม่อนุมัติ เช่น ตารางเวลาซ้อนทับ, เครื่องมืออยู่ระหว่างซ่อมบำรุง..."
                    className="w-full text-xs px-3 py-2 border border-red-300 rounded-md bg-white focus:ring-1 focus:ring-red-500 outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed font-normal"
                  />
                </div>
              )}

              <DigitalSignaturePad
                label="ลายมือชื่อหัวหน้าห้องปฏิบัติการ (นางสุธิดา จันทร์ลุน)"
                value={headSignature}
                onChange={setHeadSignature}
                disabled={!isHeadAuthorized}
              />
            </div>
          )}

          {/* Section 3: Scientist / Caretaker Approval */}
          {!isHeadOfLabStage && (
            <div className="border border-sky-200 rounded-lg p-5 bg-sky-50/20 space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ส่วนที่ 2 ผ่านการพิจารณาจากหัวหน้าห้องปฏิบัติการแล้ว
                </div>
                <div className="text-slate-700">
                  <strong>ความเห็นหัวหน้างาน:</strong> {request.part2?.comment}
                </div>
                {request.part2?.assignedStaffName && (
                  <div className="text-indigo-900 font-medium pt-1 border-t border-emerald-200/60 mt-1">
                    ผู้ได้รับมอบหมาย: <strong>{request.part2.assignedStaffName}</strong> ({request.part2.assignedStaffEmail || '-'})
                  </div>
                )}
              </div>

              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pt-1">
                <UserCheck className="w-4 h-4 text-sky-600" />
                ส่วนที่ 3 : การตรวจสอบและพิจารณาของนักวิชาการวิทยาศาสตร์ / เจ้าหน้าที่ผู้รับผิดชอบ
              </h3>

              {!isCaretakerAuthorized && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-lg text-xs font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    ระบบจำกัดสิทธิ์: เฉพาะนักวิชาการวิทยาศาสตร์ผู้ได้รับมอบหมาย (<strong>{request.part2?.assignedStaffName || 'เจ้าหน้าที่'} - {request.part2?.assignedStaffEmail || ''}</strong>)
                  </span>
                </div>
              )}

              {/* 1. Approval buttons */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  ผลการพิจารณาคำขอ:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={!isCaretakerAuthorized}
                    onClick={() => setOfficerApproval('approved')}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      officerApproval === 'approved'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-200'
                        : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                    } ${!isCaretakerAuthorized ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>อนุมัติ</span>
                  </button>

                  <button
                    type="button"
                    disabled={!isCaretakerAuthorized}
                    onClick={() => setOfficerApproval('rejected')}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      officerApproval === 'rejected'
                        ? 'bg-red-600 text-white border-red-600 shadow-sm ring-2 ring-red-200'
                        : 'bg-white text-red-800 border-red-300 hover:bg-red-50'
                    } ${!isCaretakerAuthorized ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>ไม่อนุมัติ</span>
                  </button>
                </div>
              </div>

              {/* 2. Comment field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  เหตุผล / ความเห็นประกอบการพิจารณา:
                </label>
                <textarea
                  rows={3}
                  required={officerApproval === 'rejected'}
                  disabled={!isCaretakerAuthorized}
                  value={officerComment}
                  onChange={(e) => setOfficerComment(e.target.value)}
                  placeholder={
                    officerApproval === 'rejected'
                      ? 'โปรดระบุเหตุผลที่ไม่อนุมัติ...'
                      : 'ระบุเหตุผล ข้อคิดเห็น หรือรายละเอียดการให้บริการเพิ่มเติม (ถ้ามี)...'
                  }
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-sky-500 outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed font-normal"
                />
              </div>

              {/* 3. Signature Pad */}
              <DigitalSignaturePad
                label="ลายมือชื่อนักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ"
                value={officerSignature}
                onChange={setOfficerSignature}
                disabled={!isCaretakerAuthorized}
              />
            </div>
          )}

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              เมื่อบันทึกผลการพิจารณา ระบบจะส่งอีเมลแจ้งผลไปยัง <strong>{request.email}</strong> พร้อมไฟล์ PDF อัตโนมัติ
            </span>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="submit"
              disabled={isSaving || (isHeadOfLabStage ? !isHeadAuthorized : !isCaretakerAuthorized)}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-md shadow-2xs flex items-center gap-2 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  กำลังบันทึกและส่งแจ้งเตือน...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> บันทึกและส่งอีเมลแจ้งเตือน
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
