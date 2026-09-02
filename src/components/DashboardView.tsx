import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Printer,
  Edit3,
  CheckCircle,
  Clock,
  XCircle,
  FileSpreadsheet,
  Building2,
  Wrench,
  FlaskConical,
  ShieldCheck,
  Calendar,
  AlertCircle,
  UserCheck,
  UserPlus,
  Lock,
  ArrowRight,
  Eye,
  Inbox,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import { VetLabRequest, FormType, RequestStatus } from '../types';
import { isGasConfigured, isGasSyncEnabled, exportRequestsToCSV } from '../utils/gasService';
import { apiGetRequests } from '../utils/apiClient';
import { getUserRoleInfo, isStaffUser, isHeadOfLab, isSuperAdmin } from '../utils/staffData';
import { ManageStaffModal } from './ManageStaffModal';
import { RequestDetailsModal } from './RequestDetailsModal';

interface DashboardViewProps {
  onSelectRequestForReview: (request: VetLabRequest) => void;
  onSelectRequestForPrint: (request: VetLabRequest) => void;
  onOpenOutbox: () => void;
  onOpenGasSettings: () => void;
  currentUserEmail?: string;
  onSwitchToMyRequests?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectRequestForReview,
  onSelectRequestForPrint,
  onOpenOutbox,
  onOpenGasSettings,
  currentUserEmail = '',
  onSwitchToMyRequests,
}) => {
  const [requests, setRequests] = useState<VetLabRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFormType, setFilterFormType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showManageStaff, setShowManageStaff] = useState(false);
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<VetLabRequest | null>(null);

  const roleInfo = getUserRoleInfo(currentUserEmail);
  const isAuthorized = roleInfo.isStaff;
  const isSuperAdminOrHead = roleInfo.role === 'admin' || roleInfo.role === 'head';

  const fetchRequests = async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const json = await apiGetRequests({
        formType: filterFormType,
        status: filterStatus,
        q: searchQuery,
      });
      if (json.success && Array.isArray(json.data)) {
        let list: VetLabRequest[] = json.data;

        // Strict Role-Based Visibility Control:
        // Super Admin (ผู้ดูแลระบบ) & Head of Lab (หัวหน้างาน) can see and review ALL requests.
        // Assigned Scientists (นักวิชาการวิทยาศาสตร์) can ONLY see and review requests assigned to them by the Head of Lab.
        if (!isSuperAdminOrHead) {
          const userEmail = (currentUserEmail || '').trim().toLowerCase();
          const userName = (roleInfo.userName || '').trim().toLowerCase();
          list = list.filter((r) => {
            const assignedEmail = (r.part2?.assignedStaffEmail || '').trim().toLowerCase();
            const assignedName = (r.part2?.assignedStaffName || '').trim().toLowerCase();
            return (
              (Boolean(assignedEmail) && assignedEmail === userEmail) ||
              (Boolean(assignedName) && Boolean(userName) && (assignedName.includes(userName) || userName.includes(assignedName)))
            );
          });
        }

        setRequests(list);
      }
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // Real-time Live Sync: Refresh data automatically every 4 seconds
    const interval = setInterval(() => {
      fetchRequests(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [filterFormType, filterStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleExportCsv = () => {
    exportRequestsToCSV(requests);
  };

  // If user is not authorized staff, show access restricted view
  if (!isAuthorized) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          จำกัดสิทธิ์เฉพาะเจ้าหน้าที่และผู้ดูแลระบบ
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          เมนู "รายการคำขอ & การอนุมัติ" สงวนสิทธิ์สำหรับ <strong>ผู้ดูแลระบบ (นางสาวลักขณา ฉันทะกลาง)</strong>, <strong>หัวหน้าห้องปฏิบัติการ (นางสุธิดา จันทร์ลุน)</strong> และ <strong>นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ</strong> เท่านั้น
        </p>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
          บัญชีปัจจุบันของคุณ: <span className="font-mono font-bold text-slate-800">{currentUserEmail || 'ผู้ใช้ทั่วไป'}</span> (สถานะ: ผู้ขอรับบริการ)
        </div>
        <div className="pt-2">
          {onSwitchToMyRequests && (
            <button
              type="button"
              onClick={onSwitchToMyRequests}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              ไปยังเมนู "คำขอรับบริการของฉัน"
            </button>
          )}
        </div>
      </div>
    );
  }

  const getWorkflowStatus = (req: VetLabRequest) => {
    const isHeadApproved = req.part2?.approvalStatus === 'approved' || req.status === 'approved_by_head';
    const isHeadRejected = req.part2?.approvalStatus === 'rejected';
    const isOfficerApproved = (req.part3?.approvalStatus === 'approved' && req.status !== 'approved_by_head') || req.status === 'completed' || req.status === 'dispensed';
    const isOfficerRejected = req.part3?.approvalStatus === 'rejected' && req.status !== 'approved_by_head';
    const isRejected = req.status === 'rejected' || isHeadRejected || isOfficerRejected;

    if (isRejected) {
      return {
        stage: 'rejected',
        step: 0,
        badge: (
          <div className="flex flex-col items-center gap-0.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
              <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>ไม่อนุมัติ</span>
            </span>
            <span className="text-[10px] text-rose-600 font-medium">
              {isHeadRejected ? 'หัวหน้าไม่อนุมัติ (ส่วน 2)' : 'ผู้ดูแลไม่อนุมัติ (ส่วน 3)'}
            </span>
          </div>
        ),
        buttonText: 'ดูผลการพิจารณา',
        buttonClass: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 hover:border-rose-300',
        buttonIcon: <Eye className="w-3.5 h-3.5 text-rose-600" />,
      };
    }

    if (isOfficerApproved) {
      return {
        stage: 'completed',
        step: 2,
        badge: (
          <div className="flex flex-col items-center gap-0.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{req.status === 'dispensed' ? 'จ่ายสารเคมีแล้ว' : 'อนุมัติครบถ้วน'}</span>
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">
              {req.status === 'dispensed' ? 'จ่ายสารเคมีเรียบร้อย' : 'พร้อมให้บริการ (ผ่าน 2 ส่วน)'}
            </span>
          </div>
        ),
        buttonText: 'ดูผลการอนุมัติ',
        buttonClass: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 hover:border-emerald-300',
        buttonIcon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
      };
    }

    if (isHeadApproved) {
      const assigned = req.part2?.assignedStaffName || 'นักวิชาการวิทยาศาสตร์';
      return {
        stage: 'part2_done',
        step: 1,
        badge: (
          <div className="flex flex-col items-center gap-0.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>รอนักวิทย์พิจารณา</span>
            </span>
            <span className="text-[10px] text-slate-500 max-w-[170px] truncate" title={`ผู้รับผิดชอบ: ${assigned}`}>
              มอบหมาย: <strong className="text-indigo-900">{assigned}</strong>
            </span>
          </div>
        ),
        buttonText: 'บันทึก (ส่วนที่ 3)',
        buttonClass: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-xs border-transparent',
        buttonIcon: <UserCheck className="w-3.5 h-3.5" />,
      };
    }

    return {
      stage: 'pending_head',
      step: 0,
      badge: (
        <div className="flex flex-col items-center gap-0.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
            <span>รอหัวหน้าพิจารณา</span>
          </span>
          <span className="text-[10px] text-amber-700">
            ขั้นตอนที่ 1 / 2 (ส่วนที่ 2)
          </span>
        </div>
      ),
      buttonText: 'พิจารณา (ส่วนที่ 2)',
      buttonClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-xs border-transparent',
      buttonIcon: <Edit3 className="w-3.5 h-3.5" />,
    };
  };

  const getFormBadge = (formType: FormType) => {
    switch (formType) {
      case 'VET_LAB_02':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs whitespace-nowrap">
            <Building2 className="w-3.5 h-3.5 text-blue-600" /> ห้องแล็บ (02)
          </span>
        );
      case 'VET_LAB_03':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 shadow-2xs whitespace-nowrap">
            <Wrench className="w-3.5 h-3.5 text-teal-600" /> เครื่องมือ (03)
          </span>
        );
      case 'VET_LAB_04':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs whitespace-nowrap">
            <FlaskConical className="w-3.5 h-3.5 text-purple-600" /> สารเคมี (04)
          </span>
        );
      default:
        return <span className="font-mono text-xs text-[#5f6368]">{formType}</span>;
    }
  };

  // Infographic Analytics Calculations
  const totalCount = requests.length;
  const pendingHeadCount = requests.filter((r) => r.status === 'pending').length;
  const pendingScientistCount = requests.filter((r) => r.status === 'approved_by_head').length;
  const completedCount = requests.filter(
    (r) => r.status === 'approved' || r.status === 'dispensed' || r.status === 'completed'
  ).length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 sm:space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl border border-indigo-400/25 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        {/* Ambient Decorative Glows */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -bottom-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg border border-white/20 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight drop-shadow-xs">
                รายการคำขอ & การอนุมัติ
              </h1>
              <div className="text-[11px] sm:text-xs font-medium text-cyan-200/90 font-mono mt-0.5">
                Request & Approval Portal
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-[13px] text-blue-100/90 leading-relaxed pt-0.5">
            {isSuperAdminOrHead
              ? 'พิจารณาอนุมัติคำขอ (ส่วนที่ 2-3), มอบหมายผู้รับผิดชอบ, ตรวจสอบความพร้อม และส่งออกเอกสาร PDF'
              : `แสดงและพิจารณาเฉพาะรายการคำขอที่หัวหน้าห้องปฏิบัติการมอบหมายให้ ${roleInfo.userName} ตรวจสอบ (ส่วนที่ 3)`}
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5 self-start md:self-center shrink-0">
          {(roleInfo.role === 'admin' || roleInfo.role === 'head') && (
            <button
              onClick={() => setShowManageStaff(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold flex items-center gap-2 border border-indigo-400/40 backdrop-blur-md shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer active:scale-95"
              title="เพิ่ม/แก้ไข รายชื่อนักวิทยาศาสตร์และผู้มีสิทธิ์"
            >
              <UserPlus className="w-4 h-4 text-indigo-200" /> จัดการนักวิทยาศาสตร์
            </button>
          )}
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md hover:shadow-emerald-500/25 border border-emerald-400/30 transition-all cursor-pointer active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" /> ส่งออก CSV (Excel)
          </button>
          <button
            onClick={fetchRequests}
            className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 backdrop-blur-md transition-all shadow-xs cursor-pointer active:scale-95"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role-Based Notice Banner for Scientists */}
      {!isSuperAdminOrHead && (
        <div className="p-4 bg-gradient-to-r from-indigo-50/90 to-blue-50/90 border border-indigo-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-3 text-indigo-950">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900">
                สิทธิ์การเข้าถึงเฉพาะ: {roleInfo.userName} (นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ)
              </div>
              <div className="text-slate-600 text-[11px] mt-0.5">
                ระบบจำกัดสิทธิ์ให้ท่านมองเห็นและพิจารณาได้เฉพาะรายการคำขอที่ <strong>หัวหน้าห้องปฏิบัติการมอบหมายให้ท่านพิจารณาเท่านั้น</strong>
              </div>
            </div>
          </div>
          <div className="text-[11px] font-mono px-3 py-1 bg-white/80 rounded-lg border border-indigo-200 text-indigo-800 font-bold self-start sm:self-center shrink-0">
            {currentUserEmail}
          </div>
        </div>
      )}

      {/* Infographic KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Total / Assigned (Google Blue) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#dadce0] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#1a73e8] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-[#5f6368] truncate mr-1">
              {isSuperAdminOrHead ? 'คำขอทั้งหมด' : 'คำขอที่มอบหมาย'}
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center border border-[#d2e3fc] shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight">
              {totalCount} <span className="text-xs sm:text-sm font-normal text-[#5f6368]">รายการ</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#5f6368] font-medium truncate">
              <span className="inline-block w-2 h-2 rounded-full bg-[#1a73e8] shrink-0"></span>
              <span className="truncate">{isSuperAdminOrHead ? 'บันทึกผ่านดิจิทัล' : 'มอบหมายให้ท่าน'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Head Review (for Head/Admin) OR Pending Action (for Scientist) */}
        {isSuperAdminOrHead ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#feefc3] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#fbbc04] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-[#b06000] truncate mr-1">1. รอหัวหน้าพิจารณา</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#fef7e0] text-[#b06000] flex items-center justify-center border border-[#feefc3] shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <div className="text-2xl sm:text-3xl font-bold text-[#b06000] tracking-tight">
                {pendingHeadCount} <span className="text-xs sm:text-sm font-normal text-[#b06000]">รายการ</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#b06000] font-medium truncate">
                <span className="inline-block w-2 h-2 rounded-full bg-[#fbbc04] animate-ping shrink-0"></span>
                <span className="truncate">รอพิจารณา & มอบหมาย</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#d2e3fc] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#1a73e8] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-[#1a73e8] truncate mr-1">รอนักวิทย์พิจารณา</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center border border-[#d2e3fc] shrink-0">
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <div className="text-2xl sm:text-3xl font-bold text-[#1a73e8] tracking-tight">
                {pendingScientistCount} <span className="text-xs sm:text-sm font-normal text-[#1a73e8]">รายการ</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#1a73e8] font-medium truncate">
                <span className="inline-block w-2 h-2 rounded-full bg-[#1a73e8] animate-pulse shrink-0"></span>
                <span className="truncate">รอตรวจสอบความพร้อม</span>
              </div>
            </div>
          </div>
        )}

        {/* Card 3: Pending Scientist (for Head/Admin) OR Completed (for Scientist) */}
        {isSuperAdminOrHead ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#d2e3fc] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#1a73e8] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-[#1a73e8] truncate mr-1">2. รอนักวิทย์พิจารณา</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center border border-[#d2e3fc] shrink-0">
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <div className="text-2xl sm:text-3xl font-bold text-[#1a73e8] tracking-tight">
                {pendingScientistCount} <span className="text-xs sm:text-sm font-normal text-[#1a73e8]">รายการ</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#1a73e8] font-medium truncate">
                <span className="inline-block w-2 h-2 rounded-full bg-[#1a73e8] shrink-0"></span>
                <span className="truncate">รอนักวิชาการตรวจสอบ</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#ceead6] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#34a853] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-[#137333] truncate mr-1">อนุมัติครบถ้วน</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#e6f4ea] text-[#137333] flex items-center justify-center border border-[#ceead6] shrink-0">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <div className="text-2xl sm:text-3xl font-bold text-[#137333] tracking-tight">
                {completedCount} <span className="text-xs sm:text-sm font-normal text-[#137333]">รายการ</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#137333] font-medium truncate">
                <span className="inline-block w-2 h-2 rounded-full bg-[#34a853] shrink-0"></span>
                <span className="truncate">ผ่านการพิจารณาแล้ว</span>
              </div>
            </div>
          </div>
        )}

        {/* Card 4: Completed (for Head/Admin) OR Rejected (for Scientist) */}
        {isSuperAdminOrHead ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#ceead6] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#34a853] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-[#137333] truncate mr-1">อนุมัติครบถ้วน</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#e6f4ea] text-[#137333] flex items-center justify-center border border-[#ceead6] shrink-0">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <div className="text-2xl sm:text-3xl font-bold text-[#137333] tracking-tight">
                {completedCount} <span className="text-xs sm:text-sm font-normal text-[#137333]">รายการ</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#137333] font-medium truncate">
                <span className="inline-block w-2 h-2 rounded-full bg-[#34a853] shrink-0"></span>
                <span className="truncate">เสร็จสิ้นครบทั้ง 2 ฝ่าย</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#fad2cf] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#ea4335] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-[#c5221f] truncate mr-1">ไม่อนุมัติ / ยกเลิก</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#fce8e6] text-[#c5221f] flex items-center justify-center border border-[#fad2cf] shrink-0">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <div className="text-2xl sm:text-3xl font-bold text-[#c5221f] tracking-tight">
                {rejectedCount} <span className="text-xs sm:text-sm font-normal text-[#c5221f]">รายการ</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#c5221f] font-medium truncate">
                <span className="inline-block w-2 h-2 rounded-full bg-[#ea4335] shrink-0"></span>
                <span className="truncate">คำขอที่ไม่อนุมัติ</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar in Google Style */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#dadce0] flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-4 top-3 text-[#5f6368]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อผู้ยื่น, รหัสติดตาม, สังกัด หรือชื่องาน..."
            className="w-full pl-12 pr-4 py-2.5 sm:py-3 bg-[#f8fafd] border border-[#dadce0] rounded-full text-sm sm:text-base text-[#202124] placeholder-[#80868b] focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] focus:bg-white outline-none font-normal transition-all"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#5f6368] font-semibold">
            <Filter className="w-4 h-4" /> ตัวกรอง:
          </div>

          <select
            value={filterFormType}
            onChange={(e) => setFilterFormType(e.target.value)}
            className="px-4 py-2 bg-white border border-[#dadce0] rounded-full text-xs sm:text-sm font-medium text-[#3c4043] outline-none cursor-pointer focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8]"
          >
            <option value="all">ทุกแบบฟอร์ม</option>
            <option value="VET_LAB_02">VET.LAB 02 (ห้อง Lab)</option>
            <option value="VET_LAB_03">VET.LAB 03 (เครื่องมือ)</option>
            <option value="VET_LAB_04">VET.LAB 04 (สารเคมี)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white border border-[#dadce0] rounded-full text-xs sm:text-sm font-medium text-[#3c4043] outline-none cursor-pointer focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8]"
          >
            <option value="all">-- ทุกขั้นตอน/สถานะ --</option>
            {isSuperAdminOrHead && (
              <option value="pending">1. รอหัวหน้าพิจารณา (ส่วนที่ 2)</option>
            )}
            <option value="approved_by_head">2. รอนักวิทย์พิจารณา (ส่วนที่ 3)</option>
            <option value="approved">3. อนุมัติครบถ้วน (พร้อมบริการ)</option>
            <option value="dispensed">4. จ่ายของแล้ว</option>
            <option value="rejected">5. ไม่อนุมัติ</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Table Sub-header Hint */}
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 px-5 py-3 border-b border-indigo-100/80 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold">
            <Eye className="w-4 h-4 shrink-0 text-indigo-500" />
            <span>คลิกที่รายการคำขอเพื่อเปิดหน้าต่างดูข้อมูลคำขอฉบับเต็ม</span>
          </div>
          <span className="hidden md:inline-flex items-center gap-1.5 text-xs sm:text-sm text-indigo-900 font-bold bg-white/90 px-3 py-1 rounded-full border border-indigo-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            {requests.length} รายการคำขอ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gradient-to-r from-slate-100 via-indigo-50/40 to-blue-50/30 text-slate-800 font-bold border-b border-slate-200 text-xs sm:text-sm">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900">รหัสติดตาม</th>
                <th className="py-3.5 px-3.5 whitespace-nowrap font-bold text-slate-900">แบบฟอร์ม</th>
                <th className="py-3.5 px-4 font-bold text-slate-900 min-w-[160px] max-w-[240px]">ผู้ยื่นคำขอ / สังกัด</th>
                <th className="py-3.5 px-4 font-bold text-slate-900 min-w-[170px] max-w-sm">โครงงาน / เรื่อง</th>
                <th className="py-3.5 px-3.5 whitespace-nowrap text-center font-bold text-slate-900">วันที่ยื่น</th>
                <th className="py-3.5 px-3.5 whitespace-nowrap text-center font-bold text-slate-900">ขั้นตอน & สถานะ</th>
                <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-right font-bold text-slate-900">การพิจารณา / เอกสาร</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 font-normal text-sm">
                    กำลังโหลดข้อมูลคำขอ...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center text-slate-500 font-normal">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <div className="font-bold text-slate-800 text-base">
                      {isSuperAdminOrHead
                        ? 'ไม่พบรายการคำขอตามเงื่อนไขที่เลือก'
                        : 'ยังไม่มีรายการคำขอที่ได้รับมอบหมายในขณะนี้'}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                      {isSuperAdminOrHead
                        ? 'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองด้านบนเพื่อค้นหารายการคำขออื่น'
                        : `เมื่อหัวหน้าห้องปฏิบัติการพิจารณาอนุมัติส่วนที่ 2 และมอบหมายงานให้ ${roleInfo.userName} รายการคำขอจะปรากฏขึ้นที่นี่เพื่อรอท่านตรวจสอบและบันทึกส่วนที่ 3`}
                    </p>
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const wf = getWorkflowStatus(req);
                  return (
                    <tr
                      key={req.id}
                      onClick={() => setSelectedRequestForDetails(req)}
                      className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 font-mono font-bold text-slate-800 bg-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:border-indigo-200 px-3 py-1 rounded-xl text-xs sm:text-sm tracking-wider border border-slate-200 transition-colors shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                          <span>{req.trackingNo}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 whitespace-nowrap">{getFormBadge(req.formType)}</td>
                      <td className="py-3.5 px-4 max-w-[240px]">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm sm:text-base truncate">
                          {req.applicantName}
                        </div>
                        <div className="text-xs text-slate-500 truncate mt-0.5" title={req.department}>
                          {req.department}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-medium text-slate-800 line-clamp-1 text-xs sm:text-sm" title={req.projectTitle}>
                          {req.projectTitle}
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          {req.phone || '-'}
                        </div>
                      </td>
                      <td className="py-3.5 px-3.5 whitespace-nowrap text-center text-slate-600 text-xs sm:text-sm font-mono">
                        {req.submissionDateTh}
                      </td>
                      <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                        {wf.badge}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* Dynamic Action Button based on Workflow Stage */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectRequestForReview(req);
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer border active:scale-95 shadow-2xs hover:scale-[1.02] ${wf.buttonClass}`}
                            title="คลิกเพื่อพิจารณา / จัดการคำขอ หรือดูผลการพิจารณา"
                          >
                            {wf.buttonIcon}
                            <span>{wf.buttonText}</span>
                          </button>

                          {/* Print / PDF Document Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectRequestForPrint(req);
                            }}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-white border border-slate-200 transition-all cursor-pointer shadow-2xs hover:shadow-xs hover:border-slate-300"
                            title="ดูเอกสารฉบับพิมพ์ / ดาวน์โหลด PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Stats */}
        <div className="bg-slate-50/80 px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            {isSuperAdminOrHead
              ? <>แสดงรายการคำขอทั้งหมด <strong>{requests.length}</strong> รายการ</>
              : <>แสดงรายการคำขอที่ได้รับมอบหมาย <strong>{requests.length}</strong> รายการ</>}
          </span>
          <div className="flex items-center gap-4 flex-wrap">
            {isSuperAdminOrHead && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#fbbc04]"></span>
                รอหัวหน้าพิจารณา: {pendingHeadCount}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1a73e8]"></span>
              {isSuperAdminOrHead ? 'รอนักวิทย์พิจารณา' : 'รอดำเนินการ (ส่วน 3)'}: {pendingScientistCount}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#34a853]"></span>
              อนุมัติครบถ้วน: {completedCount}
            </span>
            {!isSuperAdminOrHead && rejectedCount > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ea4335]"></span>
                ไม่อนุมัติ: {rejectedCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      <RequestDetailsModal
        request={selectedRequestForDetails}
        isOpen={!!selectedRequestForDetails}
        onClose={() => setSelectedRequestForDetails(null)}
        onSelectForReview={onSelectRequestForReview}
        onSelectForPrint={onSelectRequestForPrint}
        isStaff={isAuthorized}
      />

      {/* Manage Staff Modal */}
      <ManageStaffModal
        isOpen={showManageStaff}
        onClose={() => setShowManageStaff(false)}
        onStaffUpdated={fetchRequests}
      />
    </div>
  );
};
