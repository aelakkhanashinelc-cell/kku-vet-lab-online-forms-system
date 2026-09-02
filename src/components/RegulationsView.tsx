import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Clock,
  Sparkles,
  Building2,
  Wrench,
  FlaskConical,
  Flame,
  ChevronRight,
  Info,
  Calendar,
  KeyRound,
  Trash2,
  XCircle,
  AlertCircle,
  Layers,
  FileCheck,
  Award,
  ArrowRight,
  ArrowDown,
  Send,
  Edit3,
  UserCheck,
  Workflow,
} from 'lucide-react';

interface RegulationsViewProps {
  onGoToForm02: () => void;
  onGoToForm03?: () => void;
  onGoToForm04?: () => void;
}

export const RegulationsView: React.FC<RegulationsViewProps> = ({
  onGoToForm02,
  onGoToForm03,
  onGoToForm04,
}) => {
  const [activeSection, setActiveSection] = useState<'all' | 'contact' | 'lab' | 'equipment' | 'chemicals'>('all');

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Building2 className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-xs text-white text-[10px] font-bold uppercase rounded-md border border-white/30 font-mono tracking-wider">
              OFFICIAL GUIDELINES • VET.LAB 01
            </span>
            <span className="px-2.5 py-0.5 bg-amber-900/30 text-amber-100 text-[10px] font-medium rounded-md">
              ระบบออนไลน์ 2569
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
            หลักเกณฑ์และข้อปฏิบัติ งานห้องปฏิบัติการ
          </h1>
          <p className="text-amber-100 text-xs sm:text-sm max-w-3xl leading-relaxed">
            งานห้องปฏิบัติการ งานวิจัยและบริการวิชาการ คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น
          </p>
        </div>
      </div>

      {/* 2. Key Highlights KPI Infographics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-[11px] font-bold text-slate-600">ยื่นคำขอล่วงหน้า</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-700">≥ 3 วัน</div>
          <div className="text-[11px] text-slate-500 mt-1">ก่อนวันเข้าใช้งานจริง</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-teal-100 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-teal-600 mb-2">
            <span className="text-[11px] font-bold text-slate-600">ยืมใช้ภาคสนาม</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-teal-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-700">≤ 10 วัน</div>
          <div className="text-[11px] text-slate-500 mt-1">ยืมได้ครั้งละไม่เกิน 10 วัน</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-[11px] font-bold text-slate-600">มัดจำกุญแจนอกเวลา</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700">100 บาท</div>
          <div className="text-[11px] text-slate-500 mt-1">ต่อห้อง (คืนเงินเมื่อนำกุญแจมาส่ง)</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[11px] font-bold text-slate-600">เวลาเปิดให้บริการ</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">08.30-16.30 น.</div>
          <div className="text-[11px] text-slate-500 mt-1">จันทร์ - ศุกร์ (วันเวลาราชการ)</div>
        </div>
      </div>

      {/* 3. MASTER SERVICE WORKFLOW TIMELINE (แผนภาพไทม์ไลน์ขั้นตอนการขอรับบริการ 6 ขั้นตอน) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>แผนภาพและไทม์ไลน์ขั้นตอนการขอรับบริการ</span>
                <span className="hidden sm:inline-block text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  WORKFLOW TIMELINE
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                กระบวนการแบบ Full-Digital 6 ขั้นตอน ตั้งแต่เริ่มต้นยื่นคำขอ จนถึงเข้าใช้งานและปิดงาน
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            อนุมัติ 2 ระดับ • ติดตามสด
          </span>
        </div>

        {/* Phase Summary Bar (Overview Process Stepper) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-blue-200/80 shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              A
            </div>
            <div className="min-w-0">
              <div className="font-bold text-blue-950 truncate">ระยะที่ 1: ยื่นคำขอออนไลน์</div>
              <div className="text-[11px] text-blue-700 truncate">ขั้นตอนที่ 1 - 3 (ผู้ขอรับบริการ)</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
              B
            </div>
            <div className="min-w-0">
              <div className="font-bold text-amber-950 truncate">ระยะที่ 2: พิจารณาอนุมัติ 2 ระดับ</div>
              <div className="text-[11px] text-amber-700 truncate">ขั้นตอนที่ 4 - 5 (ส่วนที่ 2 และส่วนที่ 3)</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-purple-200/80 shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              C
            </div>
            <div className="min-w-0">
              <div className="font-bold text-purple-950 truncate">ระยะที่ 3: เข้ารับบริการ & สรุปผล</div>
              <div className="text-[11px] text-purple-700 truncate">ขั้นตอนที่ 6 (เข้าใช้ตามระเบียบ)</div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VERTICAL STEPPED TIMELINE (ขั้นตอนชี้ลงด้านล่าง 1 -> 2 -> 3 -> 4 -> 5 -> 6) */}
        {/* ========================================================================= */}
        <div className="space-y-0 pt-2">
          {/* STEP 1 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-white to-blue-50/30 border border-blue-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all group">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 flex-1">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0 mt-0.5">
                  1
                </span>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-200">
                      ขั้นตอนที่ 1 • เตรียมการ
                    </span>
                    <span className="text-xs text-slate-500">ฝั่งผู้ขอรับบริการ</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    ศึกษาข้อปฏิบัติ & เลือกแบบฟอร์มคำขอ
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ทำความเข้าใจกฎระเบียบ (VET.LAB 01) และเลือกแบบฟอร์มที่ตรงกับความต้องการ:
                  </p>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-blue-100 text-blue-900 font-medium shadow-2xs">
                      • <strong>VET.LAB 02:</strong> ขอใช้ห้องปฏิบัติการ (6 สาขาวิชา)
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-teal-100 text-teal-900 font-medium shadow-2xs">
                      • <strong>VET.LAB 03:</strong> ขอใช้เครื่องมือ / ครุภัณฑ์
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-purple-100 text-purple-900 font-medium shadow-2xs">
                      • <strong>VET.LAB 04:</strong> ขอเบิกสารเคมีและวัสดุ
                    </div>
                  </div>
                </div>
              </div>
              <div className="self-start sm:self-center shrink-0">
                <span className="text-[11px] text-blue-700 font-semibold bg-white px-3 py-1.5 rounded-full border border-blue-200 shadow-2xs inline-flex items-center gap-1">
                  📘 ศึกษาระเบียบข้อปฏิบัติ
                </span>
              </div>
            </div>
          </div>

          {/* DOWNWARD ARROW 1 -> 2 */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-0.5 h-3 bg-gradient-to-b from-blue-300 to-sky-400"></div>
            <div className="w-8 h-8 rounded-full bg-white border-2 border-sky-400 text-sky-600 flex items-center justify-center shadow-xs">
              <ArrowDown className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="w-0.5 h-3 bg-gradient-to-b from-sky-400 to-sky-500"></div>
          </div>

          {/* STEP 2 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-50/80 via-white to-sky-50/30 border border-sky-200 shadow-xs hover:border-sky-400 hover:shadow-md transition-all group">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 flex-1">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-sky-500/25 shrink-0 mt-0.5">
                  2
                </span>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-sky-800 bg-sky-100/80 px-2.5 py-0.5 rounded-full border border-sky-200">
                      ขั้นตอนที่ 2 • กรอกข้อมูล
                    </span>
                    <span className="text-xs text-slate-500">ฝั่งผู้ขอรับบริการ</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                    กรอกข้อมูลคำขอ & ลงนามดิจิทัล (Digital Signature)
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ระบุรายละเอียดการขอใช้ วัตถุประสงค์ วันและเวลา พร้อมลงลายมือชื่อในระบบ:
                  </p>
                  <div className="mt-2 space-y-1.5 text-xs bg-white/90 p-2.5 rounded-xl border border-sky-100 text-slate-700">
                    <div>
                      • <strong>ผู้ขอรับบริการ:</strong> วาดลายมือชื่อสดบนหน้าจอได้ทันที (รองรับทั้งคอม ไอแพด และมือถือ)
                    </div>
                    <div className="text-amber-900 font-medium">
                      • <strong>กรณีเป็นนักศึกษา:</strong> ต้องให้อาจารย์ที่ปรึกษา / หัวหน้าโครงการ ร่วมลงนามดิจิทัลให้ความเห็นชอบ
                    </div>
                  </div>
                </div>
              </div>
              <div className="self-start sm:self-center shrink-0">
                <span className="text-[11px] text-sky-700 font-semibold bg-white px-3 py-1.5 rounded-full border border-sky-200 shadow-2xs inline-flex items-center gap-1">
                  ✍️ เซ็นชื่อดิจิทัลในระบบ
                </span>
              </div>
            </div>
          </div>

          {/* DOWNWARD ARROW 2 -> 3 */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-0.5 h-3 bg-gradient-to-b from-sky-400 to-indigo-400"></div>
            <div className="w-8 h-8 rounded-full bg-white border-2 border-indigo-400 text-indigo-600 flex items-center justify-center shadow-xs">
              <ArrowDown className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="w-0.5 h-3 bg-gradient-to-b from-indigo-400 to-indigo-500"></div>
          </div>

          {/* STEP 3 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/30 border border-indigo-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all group">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 flex-1">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0 mt-0.5">
                  3
                </span>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      ขั้นตอนที่ 3 • ส่งคำขอ
                    </span>
                    <span className="text-xs text-slate-500">ฝั่งผู้ขอรับบริการ</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                    ยื่นคำขอล่วงหน้า ≥ 3 วันทำการ & รับรหัสติดตามคำขอ
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ส่งแบบฟอร์มผ่านระบบออนไลน์ล่วงหน้าอย่างน้อย <strong>3 วันทำการ</strong> ก่อนวันเข้าใช้งานจริง:
                  </p>
                  <div className="mt-2 space-y-1.5 text-xs bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-200 text-indigo-950">
                    <div>
                      • ระบบออกรหัส <strong>Tracking No.</strong> อัตโนมัติ (เช่น <code>LAB02-2603-0001</code>)
                    </div>
                    <div>
                      • ส่งอีเมลยืนยันการรับคำขอพร้อมแนบเอกสาร PDF ให้ผู้ขอและอาจารย์ทันที
                    </div>
                  </div>
                </div>
              </div>
              <div className="self-start sm:self-center shrink-0">
                <span className="text-[11px] text-indigo-700 font-semibold bg-white px-3 py-1.5 rounded-full border border-indigo-200 shadow-2xs inline-flex items-center gap-1">
                  ⚡ ออก Tracking No. สด
                </span>
              </div>
            </div>
          </div>

          {/* DOWNWARD TRANSITION: USER -> APPROVAL STAGE */}
          <div className="flex flex-col items-center justify-center py-3 sm:py-4">
            <div className="w-0.5 h-4 bg-gradient-to-b from-indigo-500 to-amber-500"></div>
            <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-amber-950 text-white border border-amber-400/40 shadow-md flex items-center gap-2.5 text-xs text-center">
              <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                <ArrowDown className="w-3.5 h-3.5 animate-bounce stroke-[2.5]" />
              </div>
              <div>
                <span className="font-bold text-cyan-200">ส่งคำขอเข้าสู่ระบบแล้ว</span>{' '}
                <span className="text-white/90">— เข้าสู่กระบวนการพิจารณาอนุมัติ 2 ระดับ (ส่วนที่ 2 และส่วนที่ 3)</span>
              </div>
            </div>
            <div className="w-0.5 h-4 bg-gradient-to-b from-amber-500 to-amber-500"></div>
          </div>

          {/* STEP 4 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50/80 via-white to-amber-50/30 border border-amber-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all group">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 flex-1">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0 mt-0.5">
                  4
                </span>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                      ส่วนที่ 2 • หน.ห้องปฏิบัติการ
                    </span>
                    <span className="text-xs text-slate-500">การอนุมัติระดับที่ 1</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    หัวหน้าห้องปฏิบัติการพิจารณา & มอบหมายผู้รับผิดชอบ
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>หัวหน้างานห้องปฏิบัติการ (นางสุธิดา จันทร์ลุน)</strong> เข้าพิจารณาคำขอในระบบ:
                  </p>
                  <div className="mt-2 space-y-1.5 text-xs bg-white/90 p-2.5 rounded-xl border border-amber-100 text-slate-700">
                    <div>
                      • <strong>กรณีอนุมัติ:</strong> บันทึกความเห็น ลงนามส่วนที่ 2 และมอบหมายงานให้นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ
                    </div>
                    <div>
                      • <strong>กรณีไม่อนุมัติ:</strong> ระบุเหตุผลอย่างชัดเจน และระบบส่งอีเมลแจ้งผู้ยื่นทันที
                    </div>
                  </div>
                </div>
              </div>
              <div className="self-start sm:self-center shrink-0">
                <span className="text-[11px] text-amber-800 font-semibold bg-white px-3 py-1.5 rounded-full border border-amber-200 shadow-2xs inline-flex items-center gap-1">
                  ⚖️ การอนุมัติส่วนที่ 2
                </span>
              </div>
            </div>
          </div>

          {/* DOWNWARD ARROW 4 -> 5 */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-0.5 h-3 bg-gradient-to-b from-amber-400 to-emerald-400"></div>
            <div className="w-8 h-8 rounded-full bg-white border-2 border-emerald-400 text-emerald-600 flex items-center justify-center shadow-xs">
              <ArrowDown className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="w-0.5 h-3 bg-gradient-to-b from-emerald-400 to-emerald-500"></div>
          </div>

          {/* STEP 5 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/30 border border-emerald-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all group">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 flex-1">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0 mt-0.5">
                  5
                </span>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ส่วนที่ 3 • นักวิทยาศาสตร์ผู้รับผิดชอบ
                    </span>
                    <span className="text-xs text-slate-500">การอนุมัติระดับที่ 2 (สมบูรณ์)</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    ตรวจสอบความพร้อม, นัดหมาย & ลงนามอนุมัติส่งมอบ
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ</strong> เข้าตรวจสอบความพร้อมและบันทึกผล:
                  </p>
                  <div className="mt-2 space-y-1.5 text-xs bg-white/90 p-2.5 rounded-xl border border-emerald-100 text-slate-700">
                    <div>
                      • ตรวจสอบความพร้อมของสถานที่ เครื่องมือ หรือสารเคมี และยืนยันวันเวลานัดหมาย
                    </div>
                    <div>
                      • ลงนามอนุมัติส่วนที่ 3 ครบถ้วน (สถานะเปลี่ยนเป็น <em>"อนุมัติครบถ้วน / พร้อมให้บริการ"</em>)
                    </div>
                    <div>
                      • ผู้ขอสามารถดาวน์โหลดหรือพิมพ์เอกสารที่มีลายมือชื่อครบ 3 ส่วนเพื่อใช้ติดต่อขอรับบริการ
                    </div>
                  </div>
                </div>
              </div>
              <div className="self-start sm:self-center shrink-0">
                <span className="text-[11px] text-emerald-800 font-semibold bg-white px-3 py-1.5 rounded-full border border-emerald-200 shadow-2xs inline-flex items-center gap-1">
                  ✅ อนุมัติสมบูรณ์พร้อมเข้าใช้
                </span>
              </div>
            </div>
          </div>

          {/* DOWNWARD ARROW 5 -> 6 */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-0.5 h-3 bg-gradient-to-b from-emerald-400 to-purple-400"></div>
            <div className="w-8 h-8 rounded-full bg-white border-2 border-purple-400 text-purple-600 flex items-center justify-center shadow-xs">
              <ArrowDown className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="w-0.5 h-3 bg-gradient-to-b from-purple-400 to-purple-500"></div>
          </div>

          {/* STEP 6 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50/80 via-white to-purple-50/30 border border-purple-200 shadow-xs hover:border-purple-400 hover:shadow-md transition-all group">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3.5 flex-1">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-purple-500/25 shrink-0 mt-0.5">
                  6
                </span>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-purple-800 bg-purple-100/80 px-2.5 py-0.5 rounded-full border border-purple-200">
                      ขั้นตอนที่ 6 • สิ้นสุดบริการ
                    </span>
                    <span className="text-xs text-slate-500">การเข้าใช้งานจริง</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                    เข้ารับบริการจริง, บันทึก Log Book & คืนพื้นที่/สรุปผล
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    เข้าใช้งานตามวันและเวลาที่ได้รับการอนุมัติอย่างเคร่งครัด:
                  </p>
                  <div className="mt-2 space-y-1.5 text-xs bg-white/90 p-2.5 rounded-xl border border-purple-100 text-slate-700">
                    <div>
                      • ลงบันทึกการเข้าใช้ในสมุด <strong>Log Book</strong> ประจำห้องปฏิบัติการทุกครั้ง
                    </div>
                    <div>
                      • ปฏิบัติตามกฎความปลอดภัย ทำความสะอาดพื้นที่ คืนอุปกรณ์และกุญแจหลังใช้งานเสร็จ
                    </div>
                    <div className="text-purple-900 font-medium">
                      • กรณีเบิกสารเคมี (VET.LAB 04): สรุปยอดตัดสต๊อกและสรุปค่าใช้จ่ายเพื่อตัดงบประมาณ
                    </div>
                  </div>
                </div>
              </div>
              <div className="self-start sm:self-center shrink-0">
                <span className="text-[11px] text-purple-800 font-semibold bg-white px-3 py-1.5 rounded-full border border-purple-200 shadow-2xs inline-flex items-center gap-1">
                  🎉 เสร็จสิ้นกระบวนการบริการ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section Navigation Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
        <button
          onClick={() => setActiveSection('all')}
          className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeSection === 'all'
              ? 'bg-slate-900 text-white shadow-xs scale-[1.02]'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          ทั้งหมด (ทุกหมวด)
        </button>
        <button
          onClick={() => setActiveSection('contact')}
          className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSection === 'contact'
              ? 'bg-blue-600 text-white shadow-xs scale-[1.02]'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> 1. การติดต่อ & แบบฟอร์ม
        </button>
        <button
          onClick={() => setActiveSection('lab')}
          className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSection === 'lab'
              ? 'bg-amber-600 text-white shadow-xs scale-[1.02]'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" /> 2. ข้อปฏิบัติการใช้ห้อง
        </button>
        <button
          onClick={() => setActiveSection('equipment')}
          className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSection === 'equipment'
              ? 'bg-teal-600 text-white shadow-xs scale-[1.02]'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" /> 3. การใช้เครื่องมือ/ครุภัณฑ์
        </button>
        <button
          onClick={() => setActiveSection('chemicals')}
          className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSection === 'chemicals'
              ? 'bg-purple-600 text-white shadow-xs scale-[1.02]'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" /> 4. การเบิกสารเคมี/วัสดุ
        </button>
      </div>

      {/* 5. Detailed Sections with Visual Cards */}
      <div className="space-y-6">

        {/* ========================================================================= */}
        {/* หมวดที่ 1: การติดต่อเพื่อขอใช้บริการ */}
        {/* ========================================================================= */}
        {(activeSection === 'all' || activeSection === 'contact') && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                1
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  หมวดที่ 1: การติดต่อเพื่อขอใช้บริการ
                </h2>
                <p className="text-xs text-slate-500">
                  หลักเกณฑ์การยื่นแบบฟอร์มและการพิจารณาของคณะสัตวแพทยศาสตร์ มข.
                </p>
              </div>
            </div>

            {/* Quick Action Interactive Cards for Forms 02, 03, 04 */}
            <div>
              <div className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                <span>เลือกแบบฟอร์มตามลักษณะการขอรับบริการ:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Card Form 02 */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-200 flex flex-col justify-between hover:shadow-xs transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                        <Building2 className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-100">
                        VET.LAB 02
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                      ขอใช้ห้องปฏิบัติการ
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      จองเข้าใช้พื้นที่ห้องแล็บ 6 สาขาวิชา สำหรับการเรียนการสอนและวิจัย
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onGoToForm02}
                    className="mt-3.5 w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    เปิดกรอกแบบฟอร์ม 02 <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card Form 03 */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50/70 to-emerald-50/40 border border-teal-200 flex flex-col justify-between hover:shadow-xs transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                        <Wrench className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[10px] font-bold text-teal-700 bg-white px-2 py-0.5 rounded-full border border-teal-100">
                        VET.LAB 03
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                      ขอใช้เครื่องมือวิทยาศาสตร์
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      ขอใช้งานเครื่องมือวิทยาศาสตร์และครุภัณฑ์ ทั้งในห้องแล็บและยืมภาคสนาม
                    </p>
                  </div>
                  {onGoToForm03 && (
                    <button
                      type="button"
                      onClick={onGoToForm03}
                      className="mt-3.5 w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      เปิดกรอกแบบฟอร์ม 03 <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Card Form 04 */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50/70 to-fuchsia-50/40 border border-purple-200 flex flex-col justify-between hover:shadow-xs transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                        <FlaskConical className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[10px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded-full border border-purple-100">
                        VET.LAB 04
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                      ขอเบิกสารเคมีและวัสดุ
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      ขอเบิกสารเคมีและวัสดุสิ้นเปลือง พร้อมระบบคำนวณและสรุปค่าใช้จ่าย
                    </p>
                  </div>
                  {onGoToForm04 && (
                    <button
                      type="button"
                      onClick={onGoToForm04}
                      className="mt-3.5 w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      เปิดกรอกแบบฟอร์ม 04 <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Steps & Key Rules Breakdown */}
            <div className="space-y-3 pt-2 text-xs text-slate-700">
              <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1.1
                </span>
                <p>
                  ผู้ขอใช้บริการต้องศึกษาข้อปฏิบัติ (VET.LAB 01) และลงนามยินยอมปฏิบัติตามข้อตกลงต่างๆ ในแบบฟอร์ม
                </p>
              </div>

              <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1.2
                </span>
                <p>
                  เลือกใช้แบบฟอร์มให้ถูกต้องตามประเภทการขอใช้บริการ (VET.LAB 02, 03 หรือ 04) และกรอกข้อมูลให้ครบถ้วนชัดเจน
                </p>
              </div>

              <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1.3
                </span>
                <p>
                  <strong>กรณีผู้ขอใช้บริการเป็นนักศึกษา:</strong> จะต้องมีลายมือชื่อของ <strong>อาจารย์ที่ปรึกษา / หัวหน้าโครงการ</strong> เพื่อพิจารณาลงนามให้ความเห็นชอบในแบบฟอร์ม
                </p>
              </div>

              <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1.4
                </span>
                <p>
                  ส่งแบบฟอร์มการขอใช้บริการ (VET.LAB 02-04) ผ่านระบบออนไลน์ล่วงหน้าอย่างน้อย <strong>3 วันทำการ</strong> ก่อนวันเข้าใช้บริการจริง
                </p>
              </div>

              <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1.5
                </span>
                <div>
                  <strong>ผู้ประสานงานห้องปฏิบัติการ</strong> เสนอ <strong>หัวหน้าห้องปฏิบัติการ (นางสุธิดา จันทร์ลุน นักวิชาการวิทยาศาสตร์ ชำนาญการพิเศษ)</strong> พิจารณา:
                  <ul className="list-disc pl-5 mt-1 space-y-0.5 text-slate-600">
                    <li><strong>กรณีไม่อนุญาต:</strong> แจ้งผู้ขอใช้บริการเพื่อนำกลับไปแก้ไข</li>
                    <li><strong>กรณีอนุญาต:</strong> ผู้ประสานงานนำส่งแบบฟอร์มไปยังนักวิชาการวิทยาศาสตร์ผู้รับผิดชอบดูแลห้องปฏิบัติการ</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1.6
                </span>
                <p>
                  ผู้ขอใช้บริการ <strong>นัดหมายการเข้าใช้บริการกับนักวิชาการวิทยาศาสตร์ผู้รับผิดชอบประจำห้องปฏิบัติการ</strong> และเข้าใช้บริการตามวันและเวลาที่ได้รับอนุมัติ
                </p>
              </div>
            </div>

            {/* Official Personnel Contact Note */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1.5 text-amber-950">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <Info className="w-4 h-4 text-amber-700" /> ข้อมูลผู้ประสานงานและผู้มีอำนาจพิจารณา:
              </div>
              <ul className="space-y-1 pl-4 list-disc text-[11px] text-slate-700">
                <li>
                  <strong>ผู้ประสานงานห้องปฏิบัติการ:</strong> คุณรัตนา หลายวิวัฒน์
                </li>
                <li>
                  <strong>หัวหน้าห้องปฏิบัติการ:</strong> นางสุธิดา จันทร์ลุน (ตำแหน่งนักวิชาการวิทยาศาสตร์ ชำนาญการพิเศษ)
                </li>
                <li>
                  <strong>กรณีหน่วยงานภายนอกคณะฯ:</strong> บุคลากร นักศึกษา หรือหน่วยงานภายนอกคณะสัตวแพทยศาสตร์ ให้ทำบันทึกข้อความขอใช้บริการถึง <strong>คณบดีคณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น</strong> โดยตรง
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* หมวดที่ 2: ข้อปฏิบัติในการขอใช้ห้องปฏิบัติการ */}
        {/* ========================================================================= */}
        {(activeSection === 'all' || activeSection === 'lab') && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-7 space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                2
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  หมวดที่ 2: ข้อปฏิบัติในการขอใช้ห้องปฏิบัติการ
                </h2>
                <p className="text-xs text-slate-500">
                  มาตรการด้านความปลอดภัย การจัดการกุญแจ และระเบียบวินัยในห้องปฏิบัติการ
                </p>
              </div>
            </div>

            {/* Diagram 1: Operating Hours & Key Deposit Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" /> 2.1 ในเวลาราชการ (จันทร์ - ศุกร์)
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  เปิดให้บริการเวลา <strong>08.30 - 16.30 น.</strong> โดยต้องแจ้งนักวิชาการวิทยาศาสตร์ผู้รับผิดชอบก่อนทุกครั้ง เพื่อทำการเปิดห้องปฏิบัติการให้
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                <div className="font-bold text-amber-950 text-xs sm:text-sm flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-600" /> 2.2 นอกเวลาราชการและวันหยุด
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  (16.30 น. เป็นต้นไป, เสาร์-อาทิตย์, วันหยุดนักขัตฤกษ์) ต้องได้รับอนุมัติเป็นกรณีพิเศษ และต้องอยู่ในความดูแลของอาจารย์ที่ปรึกษาอย่างเคร่งครัด
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1.5">
                <div className="font-bold text-blue-950 text-xs sm:text-sm flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-blue-600" /> 2.3 การเบิกกุญแจและมัดจำ
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  เบิกกุญแจได้เฉพาะกรณีนอกเวลาเท่านั้น มัดจำดอกละ <strong>100 บาท/ห้อง</strong> และจะได้รับเงินคืนเต็มจำนวนเมื่อนำกุญแจมาส่งคืนครบถ้วน
                </p>
              </div>

              <div className="p-4 rounded-xl bg-red-50/60 border border-red-200 space-y-1.5">
                <div className="font-bold text-red-950 text-xs sm:text-sm flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-600" /> 2.4 ข้อห้ามเด็ดขาดเรื่องกุญแจ
                </div>
                <p className="text-[11px] text-red-900 leading-relaxed">
                  <strong>ห้ามนำกุญแจไปปั๊มเอง หรือให้ผู้อื่นยืมต่อโดยเด็ดขาด</strong> หากฝ่าฝืน คณะฯ จะพิจารณาตัดสิทธิ์การขอใช้ห้องปฏิบัติการ 1 ภาคการศึกษา
                </p>
              </div>
            </div>

            {/* Infographic: 8 Golden Rules of Lab Safety */}
            <div>
              <div className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>ข้อปฏิบัติความปลอดภัยและระเบียบวินัย (ข้อ 2.5 - 2.12):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">2.5 การแต่งกาย:</strong>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      แต่งกายสุภาพ สวมเสื้อกาวน์ (Lab Coat) และรองเท้าหุ้มส้นทุกครั้ง ห้ามใส่กางเกงขาสั้นและรองเท้าแตะ
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-red-50/50 rounded-xl border border-red-200 flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-red-950">2.6 ข้อห้ามการบริโภค:</strong>
                    <div className="text-[11px] text-red-900 mt-0.5">
                      ห้ามสูบบุหรี่ นำอาหาร ขนม หรือเครื่องดื่มเข้ามารับประทานในห้องปฏิบัติการโดยเด็ดขาด
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-950">2.7 การทิ้งของเสียอันตราย:</strong>
                    <div className="text-[11px] text-slate-700 mt-0.5">
                      ห้ามทิ้งของเหลว สารเคมีอันตราย หรือเศษขยะลงในอ่างน้ำ ให้ทิ้งในภาชนะจัดเก็บเฉพาะที่เตรียมไว้เท่านั้น
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">2.8 เมื่อเกิดอุบัติเหตุ:</strong>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      ไม่ว่าจะเล็กน้อยหรือรุนแรง ต้องแจ้งนักวิชาการวิทยาศาสตร์หรืออาจารย์ที่ปรึกษาให้ทราบทันที
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">2.9 บันทึก Log Book:</strong>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      ลงบันทึกเวลาเข้า-ออก และรายละเอียดการปฏิบัติงานในสมุด Log Book ประจำห้องทุกครั้ง
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">2.10 ความรับผิดชอบสถานที่:</strong>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      ทำความสะอาดโต๊ะปฏิบัติการ ปิดประตู หน้าต่าง ก๊อกน้ำ และระบบไฟฟ้าทุกจุดก่อนออกจากห้อง
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">2.11 การชดใช้ความเสียหาย:</strong>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      หากเกิดความเสียหายจากความประมาทเลินเล่อ ผู้ขอใช้บริการต้องรับผิดชอบค่าเสียหายตามที่เกิดขึ้นจริง
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">2.12 สิทธิ์การยกเลิก:</strong>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      หากผู้ใช้บริการไม่ปฏิบัติตามระเบียบ หัวหน้าห้องปฏิบัติการมีสิทธิ์ยกเลิกการอนุญาตทันที
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* หมวดที่ 3: การใช้เครื่องมือ/อุปกรณ์วิทยาศาสตร์ และครุภัณฑ์ */}
        {/* ========================================================================= */}
        {(activeSection === 'all' || activeSection === 'equipment') && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-7 space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                3
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  หมวดที่ 3: ข้อปฏิบัติในการขอใช้เครื่องมือ/อุปกรณ์วิทยาศาสตร์ และครุภัณฑ์
                </h2>
                <p className="text-xs text-slate-500">
                  เกณฑ์ระยะเวลาการยืม การจองล่วงหน้า การดูแล และเงื่อนไขการส่งคืน
                </p>
              </div>
            </div>

            {/* Visual Timeline Cards of Borrowing Time Limits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 space-y-1 text-center">
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">เครื่องมือประจำห้องแล็บ</span>
                <div className="text-xl font-black text-teal-800 mt-1">ไม่เกิน 1 เดือน</div>
                <p className="text-[10px] text-slate-600">
                  ยื่นแบบฟอร์มได้ครั้งละไม่เกิน 1 เดือน (เครื่องมือจำกัดอาจลดเหลือ 1 สัปดาห์)
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1 text-center">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">ยืมนำออกนอกสถานที่ / ภาคสนาม</span>
                <div className="text-xl font-black text-blue-800 mt-1">ไม่เกิน 10 วัน</div>
                <p className="text-[10px] text-slate-600">
                  ยื่นขอใช้นำออกนอกสถานที่ได้ครั้งละไม่เกิน 10 วันทำการ
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1 text-center">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">การจองตารางล่วงหน้า</span>
                <div className="text-xl font-black text-amber-800 mt-1">ล่วงหน้า ≤ 2 วัน</div>
                <p className="text-[10px] text-slate-600">
                  จองต่อเนื่องได้ไม่เกิน 3 วัน (หากไม่มาตามนัดถือว่าสละสิทธิ์)
                </p>
              </div>
            </div>

            {/* 4-Step Checklist for Equipment Usage */}
            <div className="space-y-3 pt-1">
              <div className="text-xs font-bold text-slate-900 mb-2">
                ขั้นตอนและระเบียบปฏิบัติสำคัญ (ข้อ 3.3 - 3.12):
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-teal-600" /> 3.3 การอบรมก่อนใช้งาน
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    นักศึกษาและบุคลากรภายนอก <strong>ต้องผ่านการทดสอบหรืออบรมการใช้งาน</strong> จากนักวิชาการวิทยาศาสตร์ อาจารย์ที่ปรึกษา หรือหัวหน้าห้องปฏิบัติการก่อน จึงจะได้รับอนุญาต
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-600" /> 3.5 กรณีเร่งด่วน
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    กรณีจำเป็นเร่งด่วน ให้ชี้แจงเหตุผลและความจำเป็นต่อหัวหน้าห้องปฏิบัติการ (กรณีนักศึกษาให้อาจารย์ที่ปรึกษาเป็นผู้ชี้แจง) เพื่อพิจารณาอนุมัติเป็นรายกรณี
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 3.6 การตรวจรับเครื่องมือ
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    ตรวจสอบรายการ จำนวน และสภาพของเครื่องมือก่อนนำไปใช้ หากพบชำรุดหรือไม่ครบให้แจ้งเจ้าหน้าที่ทันที เพราะเป็นความรับผิดชอบของผู้ใช้หลังจากรับของไปแล้ว
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" /> 3.7 - 3.8 ข้อควรระวังและบันทึก Log Book
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    ปฏิบัติตามข้อควรระวังของแต่ละเครื่องอย่างเคร่งครัด เมื่อใช้เสร็จแล้วต้องลงบันทึกในสมุด Log Book ทุกครั้ง และทำความสะอาดให้อยู่ในสภาพพร้อมใช้งาน
                  </p>
                </div>

                <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1">
                  <div className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> 3.9 เงื่อนไขการส่งคืน (ทำความสะอาด & ลอกสติกเกอร์)
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    เครื่องมือที่นำมาส่งคืนต้องทำความสะอาด เช็ดล้างรอยปากกาที่เขียนติด และลอกสติกเกอร์ออกให้หมด <em>จะไม่รับคืนอุปกรณ์ที่ไม่สะอาดหรือชำรุดเสียหาย</em> หากชำรุดผู้ขอยืมต้องชดใช้ค่าเสียหาย
                  </p>
                </div>

                <div className="p-3.5 bg-red-50/60 rounded-xl border border-red-200 space-y-1">
                  <div className="font-bold text-red-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> 3.10 - 3.12 กรณีไม่คืนตามกำหนด / การใช้งานผิดวิธี
                  </div>
                  <p className="text-[11px] text-red-900 leading-relaxed">
                    หากไม่ส่งคืนตามกำหนดจะถูกดำเนินการตามระเบียบราชการ ความเสียหายจากการใช้งานผิดวิธีผู้ใช้ต้องรับผิดชอบค่าใช้จ่าย และหัวหน้าห้องปฏิบัติการมีสิทธิ์เพิกถอนการอนุญาตได้
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* หมวดที่ 4: ข้อปฏิบัติในการเบิกสารเคมี และวัสดุสิ้นเปลือง */}
        {/* ========================================================================= */}
        {(activeSection === 'all' || activeSection === 'chemicals') && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-7 space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                4
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  หมวดที่ 4: ข้อปฏิบัติในการเบิกสารเคมี และวัสดุสิ้นเปลือง
                </h2>
                <p className="text-xs text-slate-500">
                  เกณฑ์ปริมาณที่ขอเบิก การตรวจรับของ และระบบการชำระเงิน/ตัดงบประมาณ
                </p>
              </div>
            </div>

            {/* Chemical Dispensing Flow Infographic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-1.5">
                <div className="font-bold text-purple-950 flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-purple-600" /> 4.1 ปริมาณที่ขอเบิก (พอดีใช้)
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  จำนวนที่ขอเบิกต้องไม่มากจนเกินไป เพราะสารเคมีที่ใช้ไม่หมด <strong>ห้ามเทคืนใส่ขวดบรรจุเดิม</strong> เนื่องจากอาจเกิดการปนเปื้อนหรือเสื่อมสภาพ
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-1.5">
                <div className="font-bold text-amber-950 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> 4.2 - 4.3 กรณีไม่มารับของ / ตรวจนับ
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  หากไม่มาติดต่อรับของที่ยื่นเบิกไว้ ขอสงวนสิทธิ์ว่าท่านมียอดใช้จ่ายตามรายการนั้น และโปรดตรวจนับความถูกต้องก่อนลงนามรับของ
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-1.5">
                <div className="font-bold text-blue-950 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-blue-600" /> 4.4 การชำระเงินค่าสารเคมี
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  เมื่อสิ้นสุดการทดลอง นักวิชาการวิทยาศาสตร์จะคำนวณสรุปยอด เพื่อให้ผู้ใช้บริการนำไปติดต่อชำระเงินที่งานการเงินของคณะฯ
                </p>
              </div>

              <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 space-y-1.5">
                <div className="font-bold text-teal-950 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-teal-600" /> 4.5 กรณีนักศึกษาวิชาปัญหาพิเศษ
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  เจ้าหน้าที่จะสรุปยอดส่งงานการเงินเพื่อตัดออกจากงบวิชาปัญหาพิเศษที่ได้รับ หากยอดเกินงบ นักศึกษาต้องชำระส่วนต่างเพิ่มเติม
                </p>
              </div>
            </div>

            {/* Post-experiment Cleanup Golden Notice Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-xs space-y-2">
              <div className="font-bold text-amber-950 flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>ข้อกำหนดสำคัญเมื่อสิ้นสุดการทดลอง (Post-Experiment Protocol):</span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                เมื่อสิ้นสุดจากการทำงานทดลองแล้ว ผู้ขอใช้บริการจะต้อง:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                <div className="p-3 bg-white/90 rounded-xl border border-amber-200/80 font-medium text-amber-950 shadow-2xs">
                  🔑 <strong>1. คืนกุญแจห้องแล็บ</strong> และอุปกรณ์เครื่องมือที่ยืมมาให้ครบถ้วน
                </div>
                <div className="p-3 bg-white/90 rounded-xl border border-amber-200/80 font-medium text-amber-950 shadow-2xs">
                  ❄️ <strong>2. เคลียร์ตัวอย่าง</strong> จัดเก็บหรือกำจัดออกจากตู้เย็นและตู้แช่แข็งให้หมด
                </div>
                <div className="p-3 bg-white/90 rounded-xl border border-amber-200/80 font-medium text-amber-950 shadow-2xs">
                  🧹 <strong>3. ทำความสะอาด</strong> บริเวณโต๊ะ พื้นห้อง และเครื่องมือให้เรียบร้อย
                </div>
              </div>
              <div className="text-[10px] text-amber-800 font-bold mt-2">
                * หากพบว่าผู้ใช้บริการไม่ปฏิบัติตามข้อกำหนด หัวหน้าห้องปฏิบัติการขอใช้สิทธิ์งดให้บริการในครั้งต่อไป
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

