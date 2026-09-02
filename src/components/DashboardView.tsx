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
} from 'lucide-react';
import { VetLabRequest, FormType, RequestStatus } from '../types';
import { isGasConfigured, isGasSyncEnabled, exportRequestsToCSV } from '../utils/gasService';
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

  const fetchRequests = async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const url = new URL('/api/requests', window.location.origin);
      if (filterFormType !== 'all') url.searchParams.set('formType', filterFormType);
      if (filterStatus !== 'all') url.searchParams.set('status', filterStatus);
      if (searchQuery.trim()) url.searchParams.set('q', searchQuery.trim());

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setRequests(json.data);
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-[#dadce0] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-[#1a73e8] animate-pulse"></span>
            <span className="text-[11px] font-bold text-[#1a73e8] uppercase tracking-wider font-mono">
              STAFF MANAGEMENT & APPROVAL PORTAL
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Real-time Live Sync
            </span>
            <span className="px-3 py-0.5 rounded-full bg-[#202124] text-white text-[11px] font-semibold">
              {roleInfo.roleTitle}: {roleInfo.userName}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#202124] mt-1.5 tracking-tight">
            รายการคำขอ & การอนุมัติ (Request & Approval Portal)
          </h1>
          <p className="text-xs sm:text-sm text-[#5f6368] mt-1">
            พิจารณาอนุมัติคำขอ (ส่วนที่ 2-3), มอบหมายผู้รับผิดชอบ, ตรวจสอบความพร้อม และส่งออกเอกสาร PDF
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(roleInfo.role === 'admin' || roleInfo.role === 'head') && (
            <button
              onClick={() => setShowManageStaff(true)}
              className="px-4 py-2 rounded-full border border-[#d2e3fc] bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="เพิ่ม/แก้ไข รายชื่อนักวิทยาศาสตร์และผู้มีสิทธิ์"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#1a73e8]" /> จัดการนักวิทยาศาสตร์
            </button>
          )}
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-full border border-[#dadce0] bg-white hover:bg-[#f1f3f4] text-[#3c4043] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#34a853]" /> ส่งออก CSV (Excel)
          </button>
          <button
            onClick={fetchRequests}
            className="p-2.5 rounded-full border border-[#dadce0] bg-white hover:bg-[#f1f3f4] text-[#5f6368] transition-colors cursor-pointer"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Infographic KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total (Google Blue) */}
        <div className="bg-white rounded-3xl p-5 border border-[#dadce0] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#1a73e8] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5f6368]">คำขอทั้งหมดในระบบ</span>
            <div className="w-9 h-9 rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center border border-[#d2e3fc]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-semibold text-[#202124] tracking-tight">
              {totalCount} <span className="text-xs font-normal text-[#5f6368]">รายการ</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#5f6368] font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1a73e8]"></span>
              <span>บันทึกผ่านระบบดิจิทัล</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Head Review (Google Yellow) */}
        <div className="bg-white rounded-3xl p-5 border border-[#feefc3] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#fbbc04] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#b06000]">1. รอหัวหน้าพิจารณา (ส่วน 2)</span>
            <div className="w-9 h-9 rounded-2xl bg-[#fef7e0] text-[#b06000] flex items-center justify-center border border-[#feefc3]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-semibold text-[#b06000] tracking-tight">
              {pendingHeadCount} <span className="text-xs font-normal text-[#b06000]">รายการ</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#b06000] font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#fbbc04] animate-ping"></span>
              <span>รอการพิจารณาและมอบหมายงาน</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Scientist Review (Google Blue/Sky) */}
        <div className="bg-white rounded-3xl p-5 border border-[#d2e3fc] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#1a73e8] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1a73e8]">2. รอนักวิทย์พิจารณา (ส่วน 3)</span>
            <div className="w-9 h-9 rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center border border-[#d2e3fc]">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-semibold text-[#1a73e8] tracking-tight">
              {pendingScientistCount} <span className="text-xs font-normal text-[#1a73e8]">รายการ</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#1a73e8] font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1a73e8]"></span>
              <span>รอนักวิชาการวิทยาศาสตร์ตรวจสอบ</span>
            </div>
          </div>
        </div>

        {/* Card 4: Completed / Approved (Google Green) */}
        <div className="bg-white rounded-3xl p-5 border border-[#ceead6] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#34a853] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#137333]">อนุมัติครบถ้วน (พร้อมบริการ)</span>
            <div className="w-9 h-9 rounded-2xl bg-[#e6f4ea] text-[#137333] flex items-center justify-center border border-[#ceead6]">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-semibold text-[#137333] tracking-tight">
              {completedCount} <span className="text-xs font-normal text-[#137333]">รายการ</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#137333] font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#34a853]"></span>
              <span>เสร็จสิ้นครบทั้ง 2 ฝ่าย</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar in Google Style */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#dadce0] flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#5f6368]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อผู้ยื่น, รหัสติดตาม, สังกัด หรือชื่องาน..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafd] border border-[#dadce0] rounded-full text-xs sm:text-sm text-[#202124] placeholder-[#80868b] focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] focus:bg-white outline-none font-normal transition-all"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#5f6368] font-medium">
            <Filter className="w-3.5 h-3.5" /> ตัวกรอง:
          </div>

          <select
            value={filterFormType}
            onChange={(e) => setFilterFormType(e.target.value)}
            className="px-3.5 py-2 bg-white border border-[#dadce0] rounded-full text-xs font-medium text-[#3c4043] outline-none cursor-pointer focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8]"
          >
            <option value="all">ทุกแบบฟอร์ม</option>
            <option value="VET_LAB_02">VET.LAB 02 (ห้อง Lab)</option>
            <option value="VET_LAB_03">VET.LAB 03 (เครื่องมือ)</option>
            <option value="VET_LAB_04">VET.LAB 04 (สารเคมี)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2 bg-white border border-[#dadce0] rounded-full text-xs font-medium text-[#3c4043] outline-none cursor-pointer focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8]"
          >
            <option value="all">-- ทุกขั้นตอน/สถานะ --</option>
            <option value="pending">1. รอหัวหน้าพิจารณา (ส่วนที่ 2)</option>
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
        <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 text-indigo-600 font-medium">
            <Eye className="w-4 h-4 shrink-0" />
            <span>คลิกที่รายการคำขอเพื่อเปิดหน้าต่างดูข้อมูลคำขอฉบับเต็ม</span>
          </div>
          <span className="hidden md:inline text-xs text-slate-500 font-mono">
            {requests.length} คำขอ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-200 text-xs">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800">รหัสติดตาม</th>
                <th className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800">แบบฟอร์ม</th>
                <th className="py-3.5 px-4 font-bold text-slate-800 min-w-[170px]">ผู้ยื่นคำขอ / สังกัด</th>
                <th className="py-3.5 px-4 font-bold text-slate-800 min-w-[200px]">โครงงาน / เรื่อง</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-center font-bold text-slate-800">วันที่ยื่น</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-center font-bold text-slate-800">ขั้นตอน & สถานะ</th>
                <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-right font-bold text-slate-800">การพิจารณา / เอกสาร</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 font-normal">
                    กำลังโหลดข้อมูลคำขอ...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 font-normal">
                    ไม่พบรายการคำขอตามเงื่อนไขที่เลือก
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
                        <span className="inline-flex items-center gap-1.5 font-mono font-bold text-slate-800 bg-slate-100/90 group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:border-indigo-200 px-3 py-1 rounded-lg text-xs tracking-wider border border-slate-200 transition-colors shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0"></span>
                          <span>{req.trackingNo}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">{getFormBadge(req.formType)}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-xs sm:text-sm">
                          {req.applicantName}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5" title={req.department}>
                          {req.department}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-slate-800 line-clamp-1 text-xs" title={req.projectTitle}>
                          {req.projectTitle}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {req.phone || '-'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-center text-slate-600 text-xs font-mono">
                        {req.submissionDateTh}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
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
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border active:scale-95 shadow-2xs hover:scale-[1.02] ${wf.buttonClass}`}
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
        <div className="bg-[#f8fafd] px-5 py-3.5 border-t border-[#dadce0] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#5f6368]">
          <span>
            แสดงรายการทั้งหมด <strong>{requests.length}</strong> รายการ
          </span>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#fbbc04]"></span>
              รอหัวหน้าพิจารณา: {pendingHeadCount}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1a73e8]"></span>
              รอนักวิทย์พิจารณา: {pendingScientistCount}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#34a853]"></span>
              อนุมัติครบถ้วน: {completedCount}
            </span>
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
