import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Mail, ArrowRight, Copy, Check, Send, X } from 'lucide-react';
import { VetLabRequest } from '../types';
import { generateMailtoUrl, LAB_OFFICIALS } from '../utils/emailWorkflow';

interface SuccessModalProps {
  request: VetLabRequest;
  onClose: () => void;
  onPrint?: (request: VetLabRequest) => void;
  onGoToDashboard: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  request,
  onClose,
  onGoToDashboard,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#6366f1', '#f59e0b', '#334155'],
      });
    } catch {
      // ignore
    }
  }, []);

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(request.trackingNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFormLabel = () => {
    switch (request.formType) {
      case 'VET_LAB_01':
        return 'VET.LAB 01 (แบบรับทราบระเบียบ)';
      case 'VET_LAB_02':
        return 'VET.LAB 02 (ขอใช้ห้องปฏิบัติการ)';
      case 'VET_LAB_03':
        return 'VET.LAB 03 (ขอใช้เครื่องมือ)';
      case 'VET_LAB_04':
        return 'VET.LAB 04 (ขอเบิกสารเคมี)';
      default:
        return 'แบบคำขอ';
    }
  };

  const mailtoUrl = generateMailtoUrl(request);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 text-center p-6 sm:p-7">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          title="ปิดหน้าต่าง"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200 uppercase tracking-wider inline-block mb-2">
          {getFormLabel()}
        </span>

        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          ยื่นคำขอสำเร็จเรียบร้อยแล้ว
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          ระบบได้บันทึกคำขอและส่งอีเมลแจ้งเตือนถึงอาจารย์และเจ้าหน้าที่เรียบร้อยแล้ว
        </p>

        {/* Tracking Number Box */}
        <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">
            รหัสติดตามคำขอ (TRACKING NO.)
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl sm:text-2xl font-mono font-bold text-slate-900 tracking-wider">
              {request.trackingNo}
            </span>
            <button
              onClick={handleCopyTracking}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
              title="คัดลอกรหัสติดตาม"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {copied && <span className="text-xs text-emerald-600 font-medium mt-1 block">คัดลอกสำเร็จ!</span>}
        </div>

        {/* Email Routing Info Box */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs text-slate-700 space-y-2 mb-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-600" /> ปลายทางแจ้งเตือน:
            </span>
            <span className="font-mono text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded font-medium text-[11px] border border-indigo-100">
              {LAB_OFFICIALS.primaryEmail}
            </span>
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            <div>• <strong>อาจารย์ผู้พิจารณา:</strong> {LAB_OFFICIALS.headOfLab.name} ({LAB_OFFICIALS.headOfLab.position})</div>
            <div>• <strong>เจ้าหน้าที่ประสานงาน:</strong> {LAB_OFFICIALS.coordinator.name}</div>
            <div>• <strong>ส่งสำเนาถึงผู้ขอ (CC):</strong> {request.email}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <a
            href={mailtoUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
          >
            <Send className="w-4 h-4 text-indigo-600" /> เปิดโปรแกรมอีเมล
          </a>

          <button
            type="button"
            onClick={onGoToDashboard}
            className="w-full py-2.5 px-4 bg-transparent hover:bg-slate-100 text-slate-600 font-medium text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            ดูรายการคำขอทั้งหมด <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
