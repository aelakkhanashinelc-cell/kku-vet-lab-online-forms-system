import React, { useState } from 'react';
import {
  X,
  FileText,
  Building2,
  Wrench,
  FlaskConical,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  ShieldCheck,
  FileDown,
  Edit3,
  Copy,
  Check,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { VetLabRequest, FormType, RequestStatus } from '../types';

interface RequestDetailsModalProps {
  request: VetLabRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectForReview?: (request: VetLabRequest) => void;
  onSelectForPrint?: (request: VetLabRequest) => void;
  isStaff?: boolean;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  request,
  isOpen,
  onClose,
  onSelectForReview,
  onSelectForPrint,
  isStaff = true,
}) => {
  const [copiedTracking, setCopiedTracking] = useState(false);

  if (!isOpen || !request) return null;

  const handleCopyTracking = () => {
    if (request.trackingNo) {
      navigator.clipboard.writeText(request.trackingNo);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  const getFormInfo = (formType: FormType) => {
    switch (formType) {
      case 'VET_LAB_02':
        return {
          code: 'VET.LAB 02',
          title: 'แบบขอใช้ห้องปฏิบัติการ',
          subtitle: 'งานห้องปฏิบัติการ งานวิจัยและบริการวิชาการ',
          color: 'blue',
          bgHeader: 'bg-[#1a73e8]',
          badgeClass: 'bg-[#e8f0fe] text-[#1a73e8] border-[#d2e3fc]',
          icon: <Building2 className="w-5 h-5 text-[#1a73e8]" />,
          lightBg: 'bg-[#e8f0fe]/60',
        };
      case 'VET_LAB_03':
        return {
          code: 'VET.LAB 03',
          title: 'แบบขอใช้เครื่องมือวิทยาศาสตร์',
          subtitle: 'งานห้องปฏิบัติการ งานวิจัยและบริการวิชาการ',
          color: 'green',
          bgHeader: 'bg-[#137333]',
          badgeClass: 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]',
          icon: <Wrench className="w-5 h-5 text-[#34a853]" />,
          lightBg: 'bg-[#e6f4ea]/60',
        };
      case 'VET_LAB_04':
        return {
          code: 'VET.LAB 04',
          title: 'แบบขอเบิกสารเคมีและวัสดุวิทยาศาสตร์',
          subtitle: 'งานห้องปฏิบัติการ งานวิจัยและบริการวิชาการ',
          color: 'purple',
          bgHeader: 'bg-[#7627bb]',
          badgeClass: 'bg-[#f3e8fd] text-[#7627bb] border-[#e1bee7]',
          icon: <FlaskConical className="w-5 h-5 text-[#9334e8]" />,
          lightBg: 'bg-[#f3e8fd]/60',
        };
      default:
        return {
          code: formType,
          title: 'แบบฟอร์มขอรับบริการ',
          subtitle: 'งานห้องปฏิบัติการ งานวิจัยและบริการวิชาการ',
          color: 'blue',
          bgHeader: 'bg-[#1a73e8]',
          badgeClass: 'bg-[#e8f0fe] text-[#1a73e8] border-[#d2e3fc]',
          icon: <FileText className="w-5 h-5 text-[#1a73e8]" />,
          lightBg: 'bg-[#e8f0fe]/60',
        };
    }
  };

  const getWorkflowStep = () => {
    const isHeadApproved =
      request.part2?.approvalStatus === 'approved' || request.status === 'approved_by_head';
    const isOfficerApproved =
      (request.part3?.approvalStatus === 'approved' && request.status !== 'approved_by_head') ||
      request.status === 'completed' ||
      request.status === 'dispensed';
    const isRejected =
      request.status === 'rejected' ||
      request.part2?.approvalStatus === 'rejected' ||
      (request.part3?.approvalStatus === 'rejected' && request.status !== 'approved_by_head');

    if (isRejected) {
      return {
        currentStep: 0,
        label: 'ไม่อนุมัติคำขอ',
        statusColor: 'text-[#c5221f] bg-[#fce8e6] border-[#fad2cf]',
        icon: <XCircle className="w-4 h-4 text-[#ea4335]" />,
      };
    }
    if (isOfficerApproved) {
      return {
        currentStep: 3,
        label: 'อนุมัติครบถ้วน (พร้อมให้บริการ / ส่งมอบ)',
        statusColor: 'text-[#137333] bg-[#e6f4ea] border-[#ceead6]',
        icon: <CheckCircle className="w-4 h-4 text-[#34a853]" />,
      };
    }
    if (isHeadApproved) {
      return {
        currentStep: 2,
        label: 'หัวหน้างานอนุมัติแล้ว (รอนักวิชาการวิทยาศาสตร์ตรวจสอบ ส่วนที่ 3)',
        statusColor: 'text-[#1a73e8] bg-[#e8f0fe] border-[#d2e3fc]',
        icon: <UserCheck className="w-4 h-4 text-[#1a73e8]" />,
      };
    }
    return {
      currentStep: 1,
      label: 'รอดำเนินการพิจารณา (หัวหน้าห้องปฏิบัติการ ส่วนที่ 2)',
      statusColor: 'text-[#b06000] bg-[#fef7e0] border-[#feefc3]',
      icon: <Clock className="w-4 h-4 text-[#fbbc04]" />,
    };
  };

  const formInfo = getFormInfo(request.formType);
  const workflow = getWorkflowStep();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#202124]/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-[#dadce0]">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-white text-[#202124] flex items-center justify-between border-b border-[#dadce0] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center border border-[#d2e3fc]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1a73e8] text-white font-mono">
                  {formInfo.code}
                </span>
                <span className="text-xs text-[#5f6368] font-medium">
                  {formInfo.title}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-[#202124] tracking-tight mt-0.5">
                รายละเอียดคำขอรับบริการ (Request Details)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyTracking}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f8fafd] hover:bg-[#f1f3f4] text-[#3c4043] border border-[#dadce0] text-xs font-mono transition-colors cursor-pointer"
              title="คัดลอกรหัสติดตามคำขอ"
            >
              {copiedTracking ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#34a853]" />
                  <span className="text-[#137333] font-sans font-medium">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#5f6368]" />
                  <span>{request.trackingNo}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#5f6368] hover:text-[#202124] rounded-full hover:bg-[#f1f3f4] transition-colors cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 text-[#202124]">
          {/* Status & Tracking Ribbon */}
          <div className="bg-[#f8fafd] border border-[#dadce0] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#5f6368] font-medium">รหัสติดตามคำขอ (Tracking No.):</span>
                <span className="text-sm font-mono font-semibold text-[#1a73e8] bg-[#e8f0fe] border border-[#d2e3fc] px-2.5 py-0.5 rounded-full">
                  {request.trackingNo}
                </span>
                <button
                  type="button"
                  onClick={handleCopyTracking}
                  className="sm:hidden text-[#5f6368] hover:text-[#1a73e8] p-1"
                  title="คัดลอก"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-xs text-[#5f6368] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#5f6368]" />
                <span>วันที่ยื่นคำขอ: <strong>{request.submissionDateTh || '-'}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${workflow.statusColor}`}>
                {workflow.icon}
                <span>{workflow.label}</span>
              </div>
            </div>
          </div>

          {/* Workflow Progress Steps */}
          <div className="bg-white border border-[#dadce0] rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-[#202124] mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#1a73e8]" />
              ลำดับขั้นตอนการพิจารณา (Workflow Progress)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {/* Step 1 */}
              <div className="p-3 rounded-xl border bg-[#e6f4ea]/50 border-[#ceead6] flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#34a853] text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  ✓
                </div>
                <div>
                  <div className="font-semibold text-[#137333]">1. ผู้ขอรับบริการยื่นคำขอ</div>
                  <div className="text-[11px] text-[#137333] mt-0.5">ลงนามและส่งข้อมูลเรียบร้อย</div>
                  <div className="text-[10px] text-[#5f6368] font-mono mt-0.5">{request.submissionDateTh}</div>
                </div>
              </div>

              {/* Step 2 */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  request.part2?.approvalStatus === 'approved'
                    ? 'bg-[#e6f4ea]/50 border-[#ceead6]'
                    : request.part2?.approvalStatus === 'rejected'
                    ? 'bg-[#fce8e6]/50 border-[#fad2cf]'
                    : 'bg-[#fef7e0]/60 border-[#feefc3]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 ${
                    request.part2?.approvalStatus === 'approved'
                      ? 'bg-[#34a853] text-white'
                      : request.part2?.approvalStatus === 'rejected'
                      ? 'bg-[#ea4335] text-white'
                      : 'bg-[#fbbc04] text-white animate-pulse'
                  }`}
                >
                  {request.part2?.approvalStatus === 'approved' ? '✓' : request.part2?.approvalStatus === 'rejected' ? '✗' : '2'}
                </div>
                <div>
                  <div className="font-semibold text-[#202124]">2. หัวหน้าห้องปฏิบัติการ</div>
                  <div className="text-[11px] text-[#5f6368] mt-0.5">
                    {request.part2?.approvalStatus === 'approved'
                      ? 'พิจารณาอนุมัติ & มอบหมายงานแล้ว'
                      : request.part2?.approvalStatus === 'rejected'
                      ? 'พิจารณาไม่อนุมัติ'
                      : 'รอหัวหน้าพิจารณา (ส่วนที่ 2)'}
                  </div>
                  {request.part2?.assignedStaffName && (
                    <div className="text-[10px] text-[#1a73e8] font-medium mt-0.5">
                      ผู้รับผิดชอบ: {request.part2.assignedStaffName}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3 */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  request.part3?.approvalStatus === 'approved' || request.status === 'completed' || request.status === 'dispensed'
                    ? 'bg-[#e6f4ea]/50 border-[#ceead6]'
                    : request.part3?.approvalStatus === 'rejected'
                    ? 'bg-[#fce8e6]/50 border-[#fad2cf]'
                    : request.part2?.approvalStatus === 'approved'
                    ? 'bg-[#e8f0fe]/60 border-[#d2e3fc]'
                    : 'bg-[#f8fafd] border-[#dadce0] opacity-70'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 ${
                    request.part3?.approvalStatus === 'approved' || request.status === 'completed' || request.status === 'dispensed'
                      ? 'bg-[#34a853] text-white'
                      : request.part3?.approvalStatus === 'rejected'
                      ? 'bg-[#ea4335] text-white'
                      : request.part2?.approvalStatus === 'approved'
                      ? 'bg-[#1a73e8] text-white animate-pulse'
                      : 'bg-[#dadce0] text-[#5f6368]'
                  }`}
                >
                  {request.part3?.approvalStatus === 'approved' || request.status === 'completed' || request.status === 'dispensed'
                    ? '✓'
                    : request.part3?.approvalStatus === 'rejected'
                    ? '✗'
                    : '3'}
                </div>
                <div>
                  <div className="font-semibold text-[#202124]">3. นักวิชาการวิทยาศาสตร์</div>
                  <div className="text-[11px] text-[#5f6368] mt-0.5">
                    {request.part3?.approvalStatus === 'approved' || request.status === 'completed' || request.status === 'dispensed'
                      ? 'ตรวจสอบความพร้อม / ส่งมอบแล้ว'
                      : request.part3?.approvalStatus === 'rejected'
                      ? 'ไม่อนุมัติการใช้'
                      : 'รอนักวิทย์ตรวจสอบ (ส่วนที่ 3)'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Applicant Information & Request Data */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  ส่วนที่ 1: ข้อมูลผู้ขอรับบริการและรายละเอียดคำขอ
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Form: {request.formType}
              </span>
            </div>

            <div className="p-4 sm:p-5 space-y-4 text-xs">
              {/* Applicant Profile Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50/80 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <div className="text-slate-500 text-[11px]">ชื่อผู้ขอรับบริการ:</div>
                  <div className="font-bold text-slate-900 text-sm">{request.applicantName || '-'}</div>
                </div>

                <div>
                  <div className="text-slate-500 text-[11px]">สถานภาพ / ตำแหน่ง:</div>
                  <div className="font-semibold text-slate-800">
                    {request.role === 'student' ? 'นักศึกษา' : request.role === 'faculty_staff' ? 'อาจารย์ / บุคลากร' : request.otherRoleText || 'บุคคลภายนอก'}
                    {request.studentId && <span className="ml-1 text-slate-500 font-mono">({request.studentId})</span>}
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 text-[11px]">สาขาวิชา / ภาควิชา:</div>
                  <div className="font-semibold text-slate-800">{request.department || '-'}</div>
                </div>

                <div>
                  <div className="text-slate-500 text-[11px]">เบอร์โทรศัพท์ติดต่อ:</div>
                  <div className="font-mono font-medium text-slate-800 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {request.phone || '-'}
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 text-[11px]">อีเมล (KKU Mail):</div>
                  <div className="font-mono text-slate-800 flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {request.email || '-'}
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 text-[11px]">ลักษณะงานที่ขอใช้:</div>
                  <div className="font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded inline-block">
                    {request.workType === 'teaching'
                      ? 'การเรียนการสอน'
                      : request.workType === 'research'
                      ? 'งานวิจัย'
                      : request.workType === 'special_problem'
                      ? 'ปัญหาพิเศษ / สารนิพนธ์'
                      : request.workTypeOtherText || 'อื่นๆ'}
                  </div>
                </div>
              </div>

              {/* Project Title */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <div className="text-slate-500 text-[11px]">ชื่อโครงงาน / หัวข้องานวิจัย / วิชาที่ขอใช้:</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{request.projectTitle || '-'}</div>
              </div>

              {/* Form Specific Details */}
              {/* Form VET.LAB 02: Lab rooms */}
              {request.formType === 'VET_LAB_02' && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      รายการห้องปฏิบัติการที่ขอใช้ ({request.labItems?.length || 0} ห้อง)
                    </div>
                    {request.durationDays && (
                      <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                        ระยะเวลา: <strong>{request.durationDays}</strong> วัน
                      </span>
                    )}
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3 w-12 text-center">ลำดับ</th>
                          <th className="py-2 px-3">ห้องปฏิบัติการ / สาขาวิชา</th>
                          <th className="py-2 px-3">หมายเหตุ / วัตถุประสงค์เฉพาะ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {request.labItems && request.labItems.length > 0 ? (
                          request.labItems.map((item, idx) => (
                            <tr key={item.id || idx} className="hover:bg-slate-50">
                              <td className="py-2 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                              <td className="py-2 px-3 font-medium text-slate-800">{item.labName}</td>
                              <td className="py-2 px-3 text-slate-600">{item.remarks || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="py-3 text-center text-slate-400">
                              ไม่มีข้อมูลห้องปฏิบัติการ
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Time slot and date range */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    <div>
                      <span className="text-slate-500">ช่วงวันที่ขอใช้:</span>{' '}
                      <strong className="text-slate-800">
                        {request.startDate || '-'} ถึง {request.endDate || '-'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">ช่วงเวลาที่ขอใช้:</span>{' '}
                      <strong className="text-blue-800">
                        {request.timeSlot === 'official_hours'
                          ? 'ในเวลาราชการ (08:30 - 16:30 น.)'
                          : request.timeSlot === 'after_hours'
                          ? 'นอกเวลาราชการ / วันหยุด'
                          : 'ทั้งในและนอกเวลาราชการ'}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Form VET.LAB 03: Equipment items */}
              {request.formType === 'VET_LAB_03' && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-teal-600" />
                      รายการเครื่องมือวิทยาศาสตร์ที่ขอใช้ ({request.equipmentItems?.length || 0} รายการ)
                    </div>
                    {request.equipmentType && (
                      <span className="text-[11px] text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-medium">
                        ประเภท: {request.equipmentType === 'lab_based' ? 'ใช้ในห้องแล็บ' : request.equipmentType === 'field_based' ? 'ใช้นอกสถานที่/ภาคสนาม' : 'ทั้งสองประเภท'}
                      </span>
                    )}
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3 w-12 text-center">ลำดับ</th>
                          <th className="py-2 px-3">รายการเครื่องมือวิทยาศาสตร์</th>
                          <th className="py-2 px-3 w-24 text-center">จำนวน</th>
                          <th className="py-2 px-3">ห้องปฏิบัติการ / สถานที่ตั้ง</th>
                          <th className="py-2 px-3 w-28 text-center">ประเภท</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {request.equipmentItems && request.equipmentItems.length > 0 ? (
                          request.equipmentItems.map((item, idx) => (
                            <tr key={item.id || idx} className="hover:bg-slate-50">
                              <td className="py-2 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                              <td className="py-2 px-3 font-medium text-slate-800">{item.itemName}</td>
                              <td className="py-2 px-3 text-center font-bold text-slate-700">{item.quantity}</td>
                              <td className="py-2 px-3 text-slate-600">{item.remarksLab || '-'}</td>
                              <td className="py-2 px-3 text-center">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${item.isFieldEquipment ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                                  {item.isFieldEquipment ? 'ภาคสนาม' : 'ในห้องแล็บ'}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-3 text-center text-slate-400">
                              ไม่มีข้อมูลเครื่องมือวิทยาศาสตร์
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Form VET.LAB 04: Chemicals & Supplies */}
              {request.formType === 'VET_LAB_04' && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <FlaskConical className="w-4 h-4 text-purple-600" />
                      รายการสารเคมีและวัสดุที่ขอเบิก ({request.chemicalItems?.length || 0} รายการ)
                    </div>
                    {request.pickupDate && (
                      <span className="text-[11px] text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded font-medium">
                        กำหนดรับ: {request.pickupDate} {request.pickupTime ? `(${request.pickupTime} น.)` : ''}
                      </span>
                    )}
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3 w-12 text-center">ลำดับ</th>
                          <th className="py-2 px-3">ชื่อสารเคมี / วัสดุวิทยาศาสตร์</th>
                          <th className="py-2 px-3 w-28 text-center">จำนวน / ปริมาณ</th>
                          <th className="py-2 px-3">หมายเหตุ / วัตถุประสงค์</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {request.chemicalItems && request.chemicalItems.length > 0 ? (
                          request.chemicalItems.map((item, idx) => (
                            <tr key={item.id || idx} className="hover:bg-slate-50">
                              <td className="py-2 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                              <td className="py-2 px-3 font-medium text-slate-800">{item.itemName}</td>
                              <td className="py-2 px-3 text-center font-bold text-purple-800 bg-purple-50/50">{item.quantity}</td>
                              <td className="py-2 px-3 text-slate-600">{item.remarks || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-3 text-center text-slate-400">
                              ไม่มีข้อมูลรายการสารเคมี/วัสดุ
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Signatures of Applicant & Advisor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Applicant Signature */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between">
                  <div className="text-[11px] text-slate-500 font-medium">ลายมือชื่อผู้ขอรับบริการ:</div>
                  <div className="my-2 min-h-[64px] flex items-center justify-center bg-white border border-slate-200 rounded-lg p-2 overflow-hidden">
                    {request.applicantSignature?.dataUrl ? (
                      <img
                        src={request.applicantSignature.dataUrl}
                        alt="Applicant Signature"
                        className="h-12 max-h-14 max-w-[240px] object-contain mx-auto block"
                      />
                    ) : (
                      <span className="font-serif italic text-slate-700 text-base font-semibold">
                        {request.applicantSignature?.name || request.applicantName}
                      </span>
                    )}
                  </div>
                  <div className="text-center text-[11px] text-slate-600">
                    ({request.applicantSignature?.name || request.applicantName})
                    <div className="text-[10px] text-slate-400">
                      วันที่ลงนาม: {request.applicantSignature?.date || request.submissionDateTh}
                    </div>
                  </div>
                </div>

                {/* Advisor Signature */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between">
                  <div className="text-[11px] text-slate-500 font-medium">ลายมือชื่ออาจารย์ที่ปรึกษา / หน.โครงการ:</div>
                  <div className="my-2 min-h-[64px] flex items-center justify-center bg-white border border-slate-200 rounded-lg p-2 overflow-hidden">
                    {request.advisorSignature?.dataUrl ? (
                      <img
                        src={request.advisorSignature.dataUrl}
                        alt="Advisor Signature"
                        className="h-12 max-h-14 max-w-[240px] object-contain mx-auto block"
                      />
                    ) : (
                      <span className="font-serif italic text-slate-700 text-base font-semibold">
                        {request.advisorSignature?.name || 'อาจารย์ที่ปรึกษา'}
                      </span>
                    )}
                  </div>
                  <div className="text-center text-[11px] text-slate-600">
                    ({request.advisorSignature?.name || 'อาจารย์ที่ปรึกษา / หัวหน้าโครงการ'})
                    <div className="text-[10px] text-slate-400">
                      วันที่ลงนาม: {request.advisorSignature?.date || request.submissionDateTh}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Head of Lab Review */}
          <div
            className={`border rounded-xl overflow-hidden shadow-2xs ${
              request.part2?.approvalStatus === 'approved'
                ? 'border-emerald-300 bg-emerald-50/20'
                : request.part2?.approvalStatus === 'rejected'
                ? 'border-red-300 bg-red-50/20'
                : 'border-amber-200 bg-amber-50/20'
            }`}
          >
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    request.part2?.approvalStatus === 'approved'
                      ? 'bg-emerald-600'
                      : request.part2?.approvalStatus === 'rejected'
                      ? 'bg-red-600'
                      : 'bg-amber-500 animate-pulse'
                  }`}
                ></span>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  ส่วนที่ 2: ผลการพิจารณาของประธาน/หัวหน้าห้องปฏิบัติการ (นางสุธิดา จันทร์ลุน)
                </h3>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  request.part2?.approvalStatus === 'approved'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : request.part2?.approvalStatus === 'rejected'
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {request.part2?.approvalStatus === 'approved'
                  ? 'อนุมัติแล้ว'
                  : request.part2?.approvalStatus === 'rejected'
                  ? 'ไม่อนุมัติ'
                  : 'รอดำเนินการพิจารณา'}
              </span>
            </div>

            <div className="p-4 sm:p-5 space-y-3 text-xs">
              {request.part2?.approvalStatus ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white border border-slate-200 rounded-lg">
                      <div className="text-slate-500 text-[11px]">ความเห็น / คำสั่งการ:</div>
                      <div className="font-medium text-slate-800 mt-0.5">
                        {request.part2.comment || request.part2.rejectionReason || 'เห็นควรอนุมัติให้ดำเนินการได้'}
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-lg">
                      <div className="text-slate-500 text-[11px]">เจ้าหน้าที่ผู้รับผิดชอบที่มอบหมาย:</div>
                      <div className="font-bold text-indigo-900 mt-0.5">
                        {request.part2.assignedStaffName || 'นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ'}
                      </div>
                      {request.part2.assignedStaffEmail && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          {request.part2.assignedStaffEmail}
                        </div>
                      )}
                      {request.part2.assignedStaffComment && (
                        <div className="text-[11px] text-slate-600 mt-1 italic">
                          "{request.part2.assignedStaffComment}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Head Signature */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-slate-500 text-[11px]">ผู้พิจารณาอนุมัติ (หัวหน้าห้องปฏิบัติการ):</div>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {request.part2.signature?.name || 'นางสุธิดา จันทร์ลุน'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        วันที่พิจารณา: {request.part2.reviewedAt || request.part2.signature?.date || '-'}
                      </div>
                    </div>
                    <div className="min-w-[150px] h-16 border border-slate-200 rounded-lg flex items-center justify-center p-2 bg-white overflow-hidden shadow-2xs">
                      {request.part2.signature?.dataUrl ? (
                        <img
                          src={request.part2.signature.dataUrl}
                          alt="Head Signature"
                          className="h-12 max-h-14 max-w-[200px] object-contain mx-auto block"
                        />
                      ) : (
                        <span className="font-serif italic text-sm font-semibold text-slate-700">
                          {request.part2.signature?.name || 'สุธิดา จันทร์ลุน'}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-4 text-center text-amber-700 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertCircle className="w-5 h-5 mx-auto text-amber-600 mb-1" />
                  <div className="font-semibold">ยังไม่ได้รับการพิจารณาจากหัวหน้าห้องปฏิบัติการ</div>
                  <div className="text-[11px] text-amber-600 mt-0.5">
                    กรุณาเข้าสู่ระบบด้วยบัญชีหัวหน้าห้องปฏิบัติการเพื่อบันทึกผลการพิจารณาและมอบหมายงาน
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Scientist / Caretaker Review */}
          {request.part2?.approvalStatus !== 'rejected' && (
            <div
              className={`border rounded-xl overflow-hidden shadow-2xs ${
                request.part3?.approvalStatus === 'approved' || request.status === 'completed' || request.status === 'dispensed'
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : request.part3?.approvalStatus === 'rejected'
                  ? 'border-red-300 bg-red-50/20'
                  : 'border-slate-200 bg-slate-50/30'
              }`}
            >
              <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      request.part3?.approvalStatus === 'approved' || request.status === 'completed' || request.status === 'dispensed'
                        ? 'bg-emerald-600'
                        : request.part3?.approvalStatus === 'rejected'
                        ? 'bg-red-600'
                        : 'bg-slate-400'
                    }`}
                  ></span>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                    ส่วนที่ 3: ผลการพิจารณาและการตรวจสอบของนักวิชาการวิทยาศาสตร์ / เจ้าหน้าที่ผู้ดูแล
                  </h3>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                    request.part3?.approvalStatus === 'approved' || request.status === 'completed' || request.status === 'dispensed'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : request.part3?.approvalStatus === 'rejected'
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  {request.part3?.approvalStatus === 'approved' || request.status === 'completed' || request.status === 'dispensed'
                    ? 'ตรวจสอบ & อนุมัติแล้ว'
                    : request.part3?.approvalStatus === 'rejected'
                    ? 'ไม่อนุมัติ'
                    : 'รอนักวิชาการตรวจสอบ'}
                </span>
              </div>

              <div className="p-4 sm:p-5 space-y-3 text-xs">
                {request.part3?.approvalStatus ? (
                  <>
                    <div className="p-3 bg-white border border-slate-200 rounded-lg">
                      <div className="text-slate-500 text-[11px]">บันทึกการตรวจสอบความพร้อม / ความเห็น:</div>
                      <div className="font-medium text-slate-800 mt-0.5">
                        {request.part3.comment || request.part3.rejectionReason || 'ตรวจสอบความพร้อมของห้องแล็บ/เครื่องมือเรียบร้อย พร้อมให้บริการ'}
                      </div>
                    </div>

                    {/* Form 04 Dispensing / Expense details */}
                    {request.formType === 'VET_LAB_04' && request.part3.totalExpense !== undefined && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="text-slate-600 text-xs">สรุปยอดค่าใช้จ่ายในการเบิกสารเคมี/วัสดุ:</span>
                          <div className="font-bold text-purple-900 text-sm">
                            {request.part3.totalExpense.toLocaleString()} บาท
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-200 text-purple-900">
                          {request.part3.isDispensed ? 'จ่ายสารเคมีแล้ว' : 'รอรับมอบ'}
                        </span>
                      </div>
                    )}

                    {/* Officer Signature */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-slate-500 text-[11px]">นักวิชาการวิทยาศาสตร์ / เจ้าหน้าที่ผู้รับผิดชอบ:</div>
                        <div className="font-bold text-slate-900 mt-0.5">
                          {request.part3.signature?.name || request.part2?.assignedStaffName || 'เจ้าหน้าที่ผู้ดูแล'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          วันที่พิจารณา: {request.part3.reviewedAt || request.part3.signature?.date || '-'}
                        </div>
                      </div>
                      <div className="min-w-[150px] h-16 border border-slate-200 rounded-lg flex items-center justify-center p-2 bg-white overflow-hidden shadow-2xs">
                        {request.part3.signature?.dataUrl ? (
                          <img
                            src={request.part3.signature.dataUrl}
                            alt="Officer Signature"
                            className="h-12 max-h-14 max-w-[200px] object-contain mx-auto block"
                          />
                        ) : (
                          <span className="font-serif italic text-sm font-semibold text-slate-700">
                            {request.part3.signature?.name || 'เจ้าหน้าที่ผู้ดูแล'}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-4 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                    <Clock className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                    <div className="font-semibold">ยังไม่ได้รับการพิจารณาจากนักวิชาการวิทยาศาสตร์ (ส่วนที่ 3)</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      ขั้นตอนส่วนที่ 3 จะดำเนินการหลังจากหัวหน้าห้องปฏิบัติการพิจารณาอนุมัติในส่วนที่ 2 แล้ว
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions - Google Style */}
        <div className="px-6 py-4 bg-[#f8fafd] border-t border-[#dadce0] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {onSelectForPrint && (
              <button
                type="button"
                onClick={() => {
                  onSelectForPrint(request);
                  onClose();
                }}
                className="px-4 py-2 rounded-full bg-white hover:bg-[#f1f3f4] text-[#3c4043] border border-[#dadce0] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="ดูเอกสารฉบับพิมพ์ทางการ / ดาวน์โหลด PDF"
              >
                <FileDown className="w-4 h-4 text-[#1a73e8]" />
                <span>ดูเอกสาร & ดาวน์โหลด PDF</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-white hover:bg-[#f1f3f4] text-[#3c4043] border border-[#dadce0] text-xs font-semibold transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>

            {isStaff && onSelectForReview && (
              <button
                type="button"
                onClick={() => {
                  onSelectForReview(request);
                  onClose();
                }}
                className="px-6 py-2 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Edit3 className="w-4 h-4" />
                <span>ดำเนินการพิจารณา / อนุมัติ (Review)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
