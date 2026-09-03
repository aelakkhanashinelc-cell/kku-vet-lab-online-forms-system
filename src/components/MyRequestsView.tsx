import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  Printer,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  Wrench,
  FlaskConical,
  User,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  ArrowRight,
  Plus,
  ShieldCheck,
  UserCheck,
  HelpCircle,
  Copy,
  Check,
  ExternalLink,
  Eye,
  FileText,
} from 'lucide-react';
import { VetLabRequest, FormType, RequestStatus } from '../types';
import { RequestDetailsModal } from './RequestDetailsModal';
import { apiGetRequests } from '../utils/apiClient';

interface MyRequestsViewProps {
  onSelectRequestForPrint: (request: VetLabRequest) => void;
  onNewRequest: (formType: FormType) => void;
  currentUserEmail?: string;
}

export const MyRequestsView: React.FC<MyRequestsViewProps> = ({
  onSelectRequestForPrint,
  onNewRequest,
  currentUserEmail = '',
}) => {
  const [requests, setRequests] = useState<VetLabRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customEmailFilter, setCustomEmailFilter] = useState(currentUserEmail);
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<VetLabRequest | null>(null);

  const fetchMyRequests = async (emailToQuery = customEmailFilter, searchQ = searchQuery, isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      // Fetch all requests
      const json = await apiGetRequests();
      if (json.success && Array.isArray(json.data)) {
        let all: VetLabRequest[] = json.data;

        // If email or search is provided, filter
        const targetEmail = (emailToQuery || '').trim().toLowerCase();
        const search = (searchQ || '').trim().toLowerCase();

        let filtered = all;

        if (targetEmail) {
          filtered = filtered.filter(
            (r) =>
              (r.email && r.email.toLowerCase() === targetEmail) ||
              (r.trackingNo && r.trackingNo.toLowerCase().includes(targetEmail)) ||
              (r.applicantName && r.applicantName.toLowerCase().includes(targetEmail))
          );
        }

        if (search) {
          filtered = filtered.filter(
            (r) =>
              r.trackingNo.toLowerCase().includes(search) ||
              r.applicantName.toLowerCase().includes(search) ||
              (r.projectTitle && r.projectTitle.toLowerCase().includes(search)) ||
              (r.phone && r.phone.includes(search))
          );
        }

        // If no strict matches with targetEmail and list is empty, show user friendly state
        setRequests(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch my requests', err);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests(currentUserEmail, searchQuery);
    setCustomEmailFilter(currentUserEmail);

    // Instant Real-time Event: Reload data on form submission / approval in 0ms
    const handleLiveUpdate = () => {
      fetchMyRequests(customEmailFilter || currentUserEmail, searchQuery, true);
    };
    window.addEventListener('vet_lab_requests_updated', handleLiveUpdate);

    // Live Sync Interval: Automatically refresh status every 3 seconds
    const interval = setInterval(() => {
      fetchMyRequests(customEmailFilter || currentUserEmail, searchQuery, true);
    }, 3000);

    return () => {
      window.removeEventListener('vet_lab_requests_updated', handleLiveUpdate);
      clearInterval(interval);
    };
  }, [currentUserEmail, customEmailFilter, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMyRequests(customEmailFilter, searchQuery);
  };

  const handleCopyTracking = (trackingNo: string) => {
    navigator.clipboard.writeText(trackingNo);
    setCopiedId(trackingNo);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getFormBadge = (formType: FormType) => {
    switch (formType) {
      case 'VET_LAB_02':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Building2 className="w-3.5 h-3.5 text-blue-600" /> VET.LAB 02 (ขอใช้ห้องปฏิบัติการ)
          </span>
        );
      case 'VET_LAB_03':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <Wrench className="w-3.5 h-3.5 text-teal-600" /> VET.LAB 03 (ขอใช้เครื่องมือวิทยาศาสตร์)
          </span>
        );
      case 'VET_LAB_04':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <FlaskConical className="w-3.5 h-3.5 text-purple-600" /> VET.LAB 04 (ขอเบิกสารเคมี/วัสดุ)
          </span>
        );
      default:
        return <span className="font-mono text-xs text-slate-600">{formType}</span>;
    }
  };

  const getStatusDisplay = (req: VetLabRequest) => {
    const isHeadApproved = req.part2?.approvalStatus === 'approved' || req.status === 'approved_by_head';
    const isOfficerApproved = (req.part3?.approvalStatus === 'approved' && req.status !== 'approved_by_head') || req.status === 'completed' || req.status === 'dispensed';
    const isRejected = req.status === 'rejected' || req.part2?.approvalStatus === 'rejected' || (req.part3?.approvalStatus === 'rejected' && req.status !== 'approved_by_head');

    if (isRejected) {
      return {
        label: 'ไม่อนุมัติคำขอ',
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: <XCircle className="w-4 h-4 text-red-600" />,
        step: 0,
      };
    }

    if (isOfficerApproved) {
      return {
        label: 'อนุมัติเรียบร้อย (พร้อมให้บริการ/ส่งมอบ)',
        color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
        step: 3,
      };
    }

    if (isHeadApproved) {
      return {
        label: 'หัวหน้างานอนุมัติแล้ว (รอนักวิทย์พิจารณา ส่วนที่ 3)',
        color: 'bg-sky-50 text-sky-800 border-sky-300',
        icon: <UserCheck className="w-4 h-4 text-sky-600" />,
        step: 2,
      };
    }

    return {
      label: 'รอดำเนินการพิจารณา (หัวหน้าห้องปฏิบัติการ)',
      color: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: <Clock className="w-4 h-4 text-amber-600" />,
      step: 1,
    };
  };

  const filteredRequests = requests.filter((r) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return r.status === 'pending';
    if (activeFilter === 'approved') return r.status === 'approved' || r.status === 'approved_by_head' || r.status === 'completed' || r.status === 'dispensed';
    if (activeFilter === 'rejected') return r.status === 'rejected';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner for Applicant */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-200 mb-2.5">
              <User className="w-4 h-4 text-cyan-300" />
              <span>ระบบตรวจสอบคำขอของผู้ขอรับบริการ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              คำขอรับบริการของฉัน (My Service Requests)
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1.5 max-w-2xl leading-relaxed">
              ติดตามสถานะการพิจารณาคำขอใช้ห้องปฏิบัติการ เครื่องมือวิทยาศาสตร์ และการเบิกจ่ายสารเคมี พร้อมพิมพ์แบบฟอร์มราชการ (PDF)
            </p>
          </div>

          {/* Quick Submit Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNewRequest('VET_LAB_02')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" /> ขอใช้ห้อง Lab (02)
            </button>
            <button
              type="button"
              onClick={() => onNewRequest('VET_LAB_03')}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" /> ขอใช้เครื่องมือ (03)
            </button>
            <button
              type="button"
              onClick={() => onNewRequest('VET_LAB_04')}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" /> เบิกสารเคมี (04)
            </button>
          </div>
        </div>

        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Lookup Bar & Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาด้วยรหัสติดตามคำขอ (Tracking No เช่น VET-2026-XXXX) หรือหัวข้องานวิจัย..."
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-base text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-normal"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-6 py-2.5 sm:py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-2xs active:scale-95"
            >
              ค้นหา
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                fetchMyRequests(customEmailFilter, '');
              }}
              className="p-2.5 sm:p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer active:scale-95"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Filter Pills */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 flex-wrap gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด ({requests.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('pending')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              รอพิจารณา ({requests.filter((r) => r.status === 'pending').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('approved')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              อนุมัติแล้ว ({requests.filter((r) => r.status === 'approved' || r.status === 'approved_by_head' || r.status === 'completed' || r.status === 'dispensed').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('rejected')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeFilter === 'rejected'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-red-50 text-red-800 hover:bg-red-100'
              }`}
            >
              ไม่อนุมัติ ({requests.filter((r) => r.status === 'rejected').length})
            </button>
          </div>

          <div className="text-xs text-slate-500">
            อีเมลผู้ใช้ปัจจุบัน: <span className="font-mono font-semibold text-slate-800">{currentUserEmail || 'ผู้ใช้ทั่วไป'}</span>
          </div>
        </div>
      </div>

      {/* Requests Cards List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
            <p className="text-sm font-medium">กำลังโหลดรายการคำขอของท่าน...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100">
              <Search className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">ยังไม่พบรายการคำขอในระบบ</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                หากท่านเพิ่งยื่นคำขอใหม่ โปรดตรวจสอบรหัสติดตาม (Tracking No) หรือกดเลือกเมนูยื่นแบบฟอร์มด้านบนเพื่อเริ่มต้นยื่นคำขอ
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => onNewRequest('VET_LAB_02')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer active:scale-95"
              >
                + ยื่นคำขอขอใช้ห้องปฏิบัติการ (VET.LAB 02)
              </button>
            </div>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const statusInfo = getStatusDisplay(req);
            const isApproved = req.part2?.approvalStatus === 'approved' || req.part3?.approvalStatus === 'approved' || req.status === 'completed' || req.status === 'dispensed';
            const assignedStaff = req.part2?.assignedStaffName;
            const assignedEmail = req.part2?.assignedStaffEmail;

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-sm bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2">
                      <span>{req.trackingNo}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyTracking(req.trackingNo)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                        title="คัดลอกรหัสติดตาม"
                      >
                        {copiedId === req.trackingNo ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </span>
                    {getFormBadge(req.formType)}
                    <span className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" /> ยื่นเมื่อ {req.submissionDateTh}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRequestForDetails(req)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="กดเพื่อดูรายละเอียดคำขอทั้งหมด"
                    >
                      <Eye className="w-4 h-4 text-slate-600" />
                      <span>ดูรายละเอียด</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectRequestForPrint(req)}
                      className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="กดเพื่อเปิดดูแบบฟอร์มคำขอและดาวน์โหลด PDF"
                    >
                      <FileText className="w-4 h-4 text-indigo-600" /> เปิดดูแบบฟอร์ม
                    </button>
                  </div>
                </div>

                {/* Body Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                  <div className="space-y-1.5 md:col-span-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      หัวข้อโครงงาน / วัตถุประสงค์
                    </div>
                    <div className="text-base font-bold text-slate-900 leading-snug">
                      {req.projectTitle || 'ไม่ได้ระบุ'}
                    </div>
                    <div className="text-slate-600 flex flex-wrap items-center gap-2.5 pt-1">
                      <span><strong>ผู้ขอ:</strong> {req.applicantName}</span>
                      <span>•</span>
                      <span><strong>สังกัด:</strong> {req.department || '-'}</span>
                      <span>•</span>
                      <span><strong>โทร:</strong> {req.phone}</span>
                    </div>
                  </div>

                  {/* Status Badge Block */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        สถานะคำขอปัจจุบัน
                      </div>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border ${statusInfo.color}`}>
                        {statusInfo.icon}
                        <span>{statusInfo.label}</span>
                      </div>
                    </div>

                    {req.part2?.comment && (
                      <div className="mt-2 text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                        <strong>ความเห็นหัวหน้างาน:</strong> {req.part2.comment}
                      </div>
                    )}
                  </div>
                </div>

                {/* Workflow Progress Steps */}
                <div className="pt-2">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="text-xs font-bold text-slate-500 mb-2.5 flex items-center justify-between">
                      <span>ขั้นตอนความคืบหน้าของคำขอ (Workflow Timeline)</span>
                      <span className="font-mono text-indigo-600 font-bold">ขั้นตอน {statusInfo.step} จาก 3</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs sm:text-sm">
                      {/* Step 1 */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          ✓
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">1. ยื่นคำขอเข้าระบบ</div>
                          <div className="text-xs text-slate-400">บันทึกสำเร็จ</div>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                        statusInfo.step >= 2 ? 'bg-white border-slate-200' : 'bg-slate-100/60 border-slate-200/60 opacity-60'
                      }`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          statusInfo.step >= 2 ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
                        }`}>
                          {statusInfo.step >= 2 ? '✓' : '2'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">2. หัวหน้างานพิจารณา</div>
                          <div className="text-xs text-slate-500">
                            {req.part2?.approvalStatus === 'approved' ? 'อนุมัติแล้ว' : req.part2?.approvalStatus === 'rejected' ? 'ไม่อนุมัติ' : 'กำลังพิจารณา'}
                          </div>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                        statusInfo.step >= 3 ? 'bg-white border-slate-200' : 'bg-slate-100/60 border-slate-200/60 opacity-60'
                      }`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          statusInfo.step >= 3 ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
                        }`}>
                          {statusInfo.step >= 3 ? '✓' : '3'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">3. ผู้ดูแลห้องปฏิบัติการ</div>
                          <div className="text-xs text-slate-500">
                            {statusInfo.step >= 3 ? 'ส่งมอบ/พร้อมให้บริการ' : 'รอรับมอบงาน'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Contact Information for Applicant */}
                {isApproved && (
                  <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-amber-950 text-sm sm:text-base">
                          คำแนะนำสำหรับการเข้ารับบริการ:
                        </div>
                        <div className="text-amber-800 mt-0.5">
                          *** โปรดติดต่อนักวิชาการวิทยาศาสตร์ผู้รับผิดชอบตามรายละเอียดในแบบฟอร์ม ***
                        </div>
                        {assignedStaff && (
                          <div className="mt-1 font-bold text-indigo-950">
                            นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ: {assignedStaff} ({assignedEmail || '-'})
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Request Details Modal */}
      <RequestDetailsModal
        request={selectedRequestForDetails}
        isOpen={!!selectedRequestForDetails}
        onClose={() => setSelectedRequestForDetails(null)}
        onSelectForPrint={onSelectRequestForPrint}
        isStaff={false}
      />
    </div>
  );
};
