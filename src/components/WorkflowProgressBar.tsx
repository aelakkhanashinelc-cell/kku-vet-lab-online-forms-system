import React from 'react';
import { Check, Clock, AlertCircle, CheckCircle2, XCircle, ArrowRight, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
import { VetLabRequest } from '../types';

export interface WorkflowProgressBarProps {
  request: VetLabRequest;
  variant?: 'compact' | 'standard' | 'detailed';
  showLabels?: boolean;
  className?: string;
}

export interface WorkflowProgressState {
  currentStep: number; // 1 to 4
  progressPercent: number; // 0 to 100
  statusKey: 'pending' | 'in_review' | 'approved' | 'completed' | 'rejected';
  statusText: string;
  statusBadgeColor: string;
  progressColor: string;
  isRejected: boolean;
  steps: {
    number: number;
    title: string;
    description: string;
    status: 'completed' | 'current' | 'upcoming' | 'rejected';
  }[];
}

export function getWorkflowProgress(request: VetLabRequest): WorkflowProgressState {
  const isHeadApproved = request.part2?.approvalStatus === 'approved' || request.status === 'approved_by_head';
  const isHeadRejected = request.part2?.approvalStatus === 'rejected';
  const isOfficerApproved =
    (request.part3?.approvalStatus === 'approved' && request.status !== 'approved_by_head') ||
    request.status === 'completed' ||
    request.status === 'dispensed';
  const isOfficerRejected = request.part3?.approvalStatus === 'rejected' && request.status !== 'approved_by_head';
  const isRejected = request.status === 'rejected' || isHeadRejected || isOfficerRejected;

  const isCompleted = request.status === 'completed' || request.status === 'dispensed';

  if (isRejected) {
    return {
      currentStep: 3,
      progressPercent: 50,
      statusKey: 'rejected',
      statusText: isHeadRejected ? 'ไม่อนุมัติ (หัวหน้างาน)' : 'ไม่อนุมัติ (ผู้ดูแลห้อง)',
      statusBadgeColor: 'bg-red-50 text-red-700 border-red-200',
      progressColor: 'from-red-500 to-rose-600',
      isRejected: true,
      steps: [
        { number: 1, title: 'ศึกษาระเบียบ', description: 'รับทราบ VET.LAB 01', status: 'completed' },
        { number: 2, title: 'ยื่นแบบฟอร์ม', description: 'ลงนามดิจิทัลเรียบร้อย', status: 'completed' },
        { number: 3, title: 'พิจารณาอนุมัติ', description: request.part2?.rejectionReason || 'คำขอไม่ผ่านการอนุมัติ', status: 'rejected' },
        { number: 4, title: 'เข้ารับบริการ', description: 'ระงับการให้บริการ', status: 'upcoming' },
      ],
    };
  }

  if (isCompleted) {
    return {
      currentStep: 4,
      progressPercent: 100,
      statusKey: 'completed',
      statusText: request.status === 'dispensed' ? 'จ่ายของ/เสร็จสมบูรณ์' : 'เข้ารับบริการเรียบร้อย',
      statusBadgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      progressColor: 'from-emerald-500 to-teal-500',
      isRejected: false,
      steps: [
        { number: 1, title: 'ศึกษาระเบียบ', description: 'รับทราบ VET.LAB 01', status: 'completed' },
        { number: 2, title: 'ยื่นแบบฟอร์ม', description: 'ลงนามสำเร็จ', status: 'completed' },
        { number: 3, title: 'พิจารณาอนุมัติ', description: 'อนุมัติครบ 2 ส่วน', status: 'completed' },
        { number: 4, title: 'เข้ารับบริการ', description: 'เสร็จสมบูรณ์ 100%', status: 'completed' },
      ],
    };
  }

  if (isOfficerApproved || request.status === 'approved') {
    return {
      currentStep: 4,
      progressPercent: 88,
      statusKey: 'approved',
      statusText: 'อนุมัติครบถ้วน (พร้อมเข้ารับบริการ)',
      statusBadgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      progressColor: 'from-emerald-500 to-cyan-500',
      isRejected: false,
      steps: [
        { number: 1, title: 'ศึกษาระเบียบ', description: 'รับทราบ VET.LAB 01', status: 'completed' },
        { number: 2, title: 'ยื่นแบบฟอร์ม', description: 'บันทึกคำขอสำเร็จ', status: 'completed' },
        { number: 3, title: 'พิจารณาอนุมัติ', description: 'ผ่านการอนุมัติแล้ว', status: 'completed' },
        { number: 4, title: 'เข้ารับบริการ', description: 'รอเข้ารับบริการตามนัด', status: 'current' },
      ],
    };
  }

  if (isHeadApproved) {
    const assignedName = request.part2?.assignedStaffName || 'นักวิชาการวิทยาศาสตร์';
    return {
      currentStep: 3,
      progressPercent: 70,
      statusKey: 'in_review',
      statusText: `หัวหน้าอนุมัติแล้ว (${assignedName})`,
      statusBadgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      progressColor: 'from-blue-500 to-indigo-600',
      isRejected: false,
      steps: [
        { number: 1, title: 'ศึกษาระเบียบ', description: 'รับทราบ VET.LAB 01', status: 'completed' },
        { number: 2, title: 'ยื่นแบบฟอร์ม', description: 'บันทึกคำขอสำเร็จ', status: 'completed' },
        { number: 3, title: 'พิจารณาอนุมัติ', description: `มอบหมาย: ${assignedName}`, status: 'current' },
        { number: 4, title: 'เข้ารับบริการ', description: 'รอผลพิจารณาส่วนที่ 3', status: 'upcoming' },
      ],
    };
  }

  // Default: Pending Head approval (Part 2)
  return {
    currentStep: 3,
    progressPercent: 45,
    statusKey: 'pending',
    statusText: 'รอพิจารณา (หัวหน้าห้อง Lab)',
    statusBadgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    progressColor: 'from-amber-400 to-indigo-500',
    isRejected: false,
    steps: [
      { number: 1, title: 'ศึกษาระเบียบ', description: 'รับทราบ VET.LAB 01', status: 'completed' },
      { number: 2, title: 'ยื่นแบบฟอร์ม', description: 'ยื่นคำขอเรียบร้อย', status: 'completed' },
      { number: 3, title: 'พิจารณาอนุมัติ', description: 'รอหัวหน้าพิจารณาส่วน 2', status: 'current' },
      { number: 4, title: 'เข้ารับบริการ', description: 'รอการอนุมัติ', status: 'upcoming' },
    ],
  };
}

export const WorkflowProgressBar: React.FC<WorkflowProgressBarProps> = ({
  request,
  variant = 'standard',
  showLabels = true,
  className = '',
}) => {
  const state = getWorkflowProgress(request);

  // 1. Compact Variant (for Table rows in Dashboard)
  if (variant === 'compact') {
    return (
      <div className={`space-y-1.5 min-w-[160px] max-w-[220px] mx-auto ${className}`}>
        {/* Top Info row */}
        <div className="flex items-center justify-between text-[11px]">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border text-[10px] ${state.statusBadgeColor}`}
          >
            {state.isRejected ? (
              <XCircle className="w-3 h-3 text-red-500" />
            ) : state.progressPercent === 100 ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ) : (
              <Clock className="w-3 h-3 text-amber-500" />
            )}
            <span className="truncate max-w-[130px]">{state.statusText}</span>
          </span>
          <span className="font-mono font-bold text-[10px] text-slate-500">
            {state.progressPercent}%
          </span>
        </div>

        {/* Mini 4-Segment Progress Track */}
        <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
          <div
            className={`h-full bg-gradient-to-r ${state.progressColor} transition-all duration-500 rounded-full`}
            style={{ width: `${state.progressPercent}%` }}
          />
        </div>

        {/* 4 Step Dots */}
        <div className="flex items-center justify-between px-1">
          {state.steps.map((s) => (
            <div key={s.number} className="flex flex-col items-center gap-0.5">
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  s.status === 'completed'
                    ? 'bg-emerald-500 ring-1 ring-emerald-300'
                    : s.status === 'rejected'
                    ? 'bg-red-500 ring-1 ring-red-300'
                    : s.status === 'current'
                    ? 'bg-indigo-600 ring-2 ring-indigo-300 animate-pulse'
                    : 'bg-slate-200'
                }`}
                title={`ขั้นตอนที่ ${s.number}: ${s.title} (${s.description})`}
              />
              <span className="text-[8.5px] font-mono text-slate-400 font-semibold">{s.number}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Detailed / Standard Variant (for My Requests card & modals)
  return (
    <div
      className={`bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3.5 shadow-2xs ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
            4
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>ความคืบหน้าตามขั้นตอนบริการ 4 ลำดับ (Workflow Progress)</span>
            </h4>
            <div className="text-[11px] text-slate-500">
              สถานะ: <span className="font-semibold text-slate-700">{state.statusText}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${state.statusBadgeColor}`}
          >
            {state.isRejected ? (
              <XCircle className="w-3.5 h-3.5 text-red-500" />
            ) : state.progressPercent === 100 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            )}
            <span>
              {state.isRejected
                ? 'ไม่อนุมัติคำขอ'
                : state.progressPercent === 100
                ? 'เสร็จสมบูรณ์'
                : `ขั้นตอนที่ ${state.currentStep} จาก 4`}
            </span>
          </span>

          <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold text-indigo-700 shadow-2xs">
            {state.progressPercent}%
          </div>
        </div>
      </div>

      {/* Visual Progress Bar Track */}
      <div className="relative pt-1">
        <div className="w-full h-2.5 bg-slate-200/90 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full bg-gradient-to-r ${state.progressColor} rounded-full transition-all duration-700 ease-out shadow-xs`}
            style={{ width: `${state.progressPercent}%` }}
          />
        </div>
      </div>

      {/* 4 Steps Grid Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
        {state.steps.map((step) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isRejected = step.status === 'rejected';

          return (
            <div
              key={step.number}
              className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                isCompleted
                  ? 'bg-white border-emerald-200 shadow-2xs'
                  : isRejected
                  ? 'bg-red-50/80 border-red-200 shadow-2xs'
                  : isCurrent
                  ? 'bg-white border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-slate-100/60 border-slate-200/60 opacity-65'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-transform ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : isRejected
                    ? 'bg-red-500 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300/60 scale-105'
                    : 'bg-slate-300 text-slate-600'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : isRejected ? <XCircle className="w-3.5 h-3.5" /> : step.number}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <div
                    className={`text-xs font-bold truncate ${
                      isCompleted
                        ? 'text-emerald-900'
                        : isRejected
                        ? 'text-red-900'
                        : isCurrent
                        ? 'text-indigo-950'
                        : 'text-slate-600'
                    }`}
                  >
                    {step.number}. {step.title}
                  </div>
                  {isCurrent && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping shrink-0" />
                  )}
                </div>
                <div
                  className={`text-[10.5px] line-clamp-1 mt-0.5 ${
                    isCompleted
                      ? 'text-emerald-700'
                      : isRejected
                      ? 'text-red-600'
                      : isCurrent
                      ? 'text-indigo-700 font-medium'
                      : 'text-slate-400'
                  }`}
                  title={step.description}
                >
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
