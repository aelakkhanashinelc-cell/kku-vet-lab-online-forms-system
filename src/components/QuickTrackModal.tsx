import React, { useState } from 'react';
import {
  Search,
  X,
  CheckCircle,
  Clock,
  XCircle,
  ShieldCheck,
  Printer,
  Calendar,
  User,
  Building2,
  Wrench,
  FlaskConical,
  Mail,
  ArrowRight,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { VetLabRequest, RequestStatus } from '../types';
import { apiGetRequests } from '../utils/apiClient';

interface QuickTrackModalProps {
  onClose: () => void;
  onSelectPrint: (request: VetLabRequest) => void;
  initialTrackingNo?: string;
}

export const QuickTrackModal: React.FC<QuickTrackModalProps> = ({
  onClose,
  onSelectPrint,
  initialTrackingNo,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialTrackingNo || '');
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<VetLabRequest[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const performSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSearched(true);
    try {
      const json = await apiGetRequests({ q: queryText.trim() });
      if (json.success) {
        setResults(json.data);
      } else {
        setErrorMsg('ไม่สามารถค้นหาข้อมูลได้');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (initialTrackingNo && initialTrackingNo.trim()) {
      setSearchQuery(initialTrackingNo.trim());
      performSearch(initialTrackingNo.trim());
    }
  }, [initialTrackingNo]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const getStatusDisplay = (status: RequestStatus) => {
    switch (status) {
      case 'approved':
        return {
          text: 'อนุมัติเรียบร้อย (Approved)',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
          step: 3,
        };
      case 'dispensed':
        return {
          text: 'จ่ายของเรียบร้อย (Dispensed)',
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />,
          step: 4,
        };
      case 'completed':
        return {
          text: 'เสร็จสิ้นกระบวนการ (Completed)',
          badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />,
          step: 4,
        };
      case 'rejected':
        return {
          text: 'ไม่อนุมัติ (Rejected)',
          badgeClass: 'bg-red-50 text-red-700 border-red-200',
          icon: <XCircle className="w-3.5 h-3.5 text-red-600" />,
          step: 2,
        };
      default:
        return {
          text: 'รอการพิจารณา (Pending Review)',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
          step: 1,
        };
    }
  };

  const getFormTitle = (formType: string) => {
    switch (formType) {
      case 'VET_LAB_02':
        return { code: 'VET.LAB 02', name: 'ขอใช้ห้องปฏิบัติการ', icon: <Building2 className="w-3.5 h-3.5 text-indigo-600" /> };
      case 'VET_LAB_03':
        return { code: 'VET.LAB 03', name: 'ขอใช้เครื่องมือวิทยาศาสตร์', icon: <Wrench className="w-3.5 h-3.5 text-indigo-600" /> };
      case 'VET_LAB_04':
        return { code: 'VET.LAB 04', name: 'ขอเบิกจ่ายสารเคมี/วัสดุ', icon: <FlaskConical className="w-3.5 h-3.5 text-indigo-600" /> };
      default:
        return { code: formType, name: 'แบบคำขอ', icon: <Building2 className="w-3.5 h-3.5 text-indigo-600" /> };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/30 flex items-center justify-center border border-indigo-500/30">
              <Search className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <h2 className="font-semibold text-base tracking-tight">
                ติดตามสถานะคำขอ (Quick Tracking)
              </h2>
              <p className="text-xs text-slate-400">
                ค้นหาด้วยเลขที่คำขอ (Tracking No.), รหัสนักศึกษา หรือชื่อผู้ยื่น
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Search Box */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              พิมพ์คำค้นหา:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="เช่น VL02-202608-0001, 653180123-4 หรือชื่อ-สกุล"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" /> ค้นหา
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
              <span>ตัวอย่างค้นหา:</span>
              <button
                type="button"
                onClick={() => setSearchQuery('VL02-2026-001')}
                className="text-indigo-600 hover:underline font-mono cursor-pointer"
              >
                VL02-2026-001
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setSearchQuery('VL03-2026-002')}
                className="text-indigo-600 hover:underline font-mono cursor-pointer"
              >
                VL03-2026-002
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setSearchQuery('VL04-2026-003')}
                className="text-indigo-600 hover:underline font-mono cursor-pointer"
              >
                VL04-2026-003
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Results Display */}
          {searched && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-semibold text-slate-700">ผลการค้นหา</span>
                <span className="text-xs text-slate-500">พบ {results.length} รายการ</span>
              </div>

              {results.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-lg border border-slate-200">
                  <Clock className="w-7 h-7 text-slate-400 mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-semibold text-slate-700">ไม่พบข้อมูลคำขอ</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    โปรดตรวจสอบรหัสติดตาม (Tracking No) หรือคำค้นหาอีกครั้ง
                  </p>
                </div>
              ) : (
                results.map((req) => {
                  const statusInfo = getStatusDisplay(req.status);
                  const formInfo = getFormTitle(req.formType);
                  return (
                    <div
                      key={req.id}
                      className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition-colors space-y-3"
                    >
                      {/* Top Row */}
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-slate-900">
                              {req.trackingNo}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {formInfo.icon}
                              {formInfo.code}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-800 mt-1">
                            {req.projectTitle}
                          </h4>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.icon}
                          {statusInfo.text}
                        </span>
                      </div>

                      {/* Timeline Stepper */}
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="text-[11px] font-semibold text-slate-600 mb-2">ลำดับขั้นตอนการดำเนินการ:</div>
                        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                          <div className="space-y-1">
                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center font-bold text-[10px]">
                              ✓
                            </div>
                            <span className="font-semibold text-slate-800 block">1. ผู้ขอยื่นคำขอ</span>
                            <span className="text-slate-500">{req.submissionDateTh}</span>
                          </div>

                          <div className="space-y-1">
                            <div
                              className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center font-bold text-[10px] ${
                                req.status === 'approved' || req.status === 'dispensed' || req.status === 'completed'
                                  ? 'bg-emerald-600 text-white'
                                  : req.status === 'rejected'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-amber-500 text-white animate-pulse'
                              }`}
                            >
                              {req.status === 'approved' || req.status === 'dispensed' || req.status === 'completed'
                                ? '✓'
                                : req.status === 'rejected'
                                ? '✕'
                                : '2'}
                            </div>
                            <span className="font-semibold text-slate-800 block">2. หัวหน้างานห้องปฏิบัติการฯ</span>
                            <span className="text-slate-500">
                              {req.part2?.approvalStatus === 'approved'
                                ? 'อนุมัติแล้ว'
                                : req.part2?.approvalStatus === 'rejected'
                                ? 'ไม่อนุมัติ'
                                : 'รอการพิจารณา'}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div
                              className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center font-bold text-[10px] ${
                                req.status === 'completed' || req.status === 'dispensed'
                                  ? 'bg-emerald-600 text-white'
                                  : req.status === 'approved'
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {req.status === 'completed' || req.status === 'dispensed' ? '✓' : '3'}
                            </div>
                            <span className="font-semibold text-slate-800 block">3. นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ</span>
                            <span className="text-slate-500">
                              {req.status === 'dispensed'
                                ? 'จ่ายของแล้ว'
                                : req.status === 'approved'
                                ? 'รอส่งมอบ'
                                : 'รอขั้นตอนก่อนหน้า'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Details summary */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                        <div>
                          ผู้ขอ: <strong className="text-slate-800">{req.applicantName}</strong> ({req.department})
                        </div>
                        <div>
                          อีเมล: <strong className="text-slate-800">{req.email}</strong>
                        </div>
                        {req.part2?.comment && (
                          <div className="sm:col-span-2 p-2 rounded bg-indigo-50/50 border border-indigo-100 text-indigo-950 text-xs">
                            <strong>ความเห็นอาจารย์:</strong> {req.part2.comment}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectPrint(req);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-indigo-600" /> ดูเอกสารฉบับพิมพ์ / PDF
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
