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
        <div className="relative z-10 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-xs text-white text-xs font-bold uppercase rounded-xl border border-white/30 font-mono tracking-wider">
              OFFICIAL GUIDELINES • VET.LAB 01
            </span>
            <span className="px-3 py-1 bg-amber-900/30 text-amber-100 text-xs font-semibold rounded-xl border border-amber-800/30">
              ระบบออนไลน์ 2569
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            หลักเกณฑ์และข้อปฏิบัติ งานห้องปฏิบัติการ
          </h1>
          <p className="text-amber-100 text-sm sm:text-base max-w-3xl leading-relaxed">
            งานห้องปฏิบัติการ งานวิจัยและบริการวิชาการ คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น
          </p>
        </div>
      </div>

      {/* 2. Key Highlights KPI Infographics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-100 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700">ยื่นคำขอล่วงหน้า</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-700">≥ 3 วัน</div>
          <div className="text-xs text-slate-500 mt-1">ก่อนวันเข้าใช้งานจริง</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-teal-100 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-teal-600 mb-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700">ยืมใช้ภาคสนาม</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-teal-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-700">≤ 10 วัน</div>
          <div className="text-xs text-slate-500 mt-1">ยืมได้ครั้งละไม่เกิน 10 วัน</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-100 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700">มัดจำกุญแจนอกเวลา</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">100 บาท</div>
          <div className="text-xs text-slate-500 mt-1">ต่อห้อง (คืนเงินเมื่อนำกุญแจมาส่ง)</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700">เวลาเปิดให้บริการ</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-700">08.30-16.30 น.</div>
          <div className="text-xs text-slate-500 mt-1">จันทร์ - ศุกร์ (วันเวลาราชการ)</div>
        </div>
      </div>

      {/* 3. MASTER SERVICE WORKFLOW TIMELINE (แผนภาพขั้นตอนการขอรับบริการ 6 ขั้นตอน - ฉบับกระชับ) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>ขั้นตอนการขอรับบริการ</span>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  6 ขั้นตอน
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                กระบวนการ Full-Digital ตั้งแต่ยื่นคำขอ อนุมัติ 2 ระดับ จนถึงเข้าใช้งานจริง
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200 self-start sm:self-auto font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ยื่นล่วงหน้า ≥ 3 วัน • อนุมัติ 2 ระดับ</span>
          </div>
        </div>

        {/* Compact Vertical Downward Workflow */}
        <div className="space-y-2">
          {/* STEP 1 */}
          <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-slate-50/80 hover:bg-blue-50/40 border border-slate-200/90 hover:border-blue-300 transition-all">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
              1
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  1. ศึกษาข้อปฏิบัติ & เลือกแบบฟอร์มคำขอ
                </span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                  VET.LAB 01 - 04
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                ศึกษาระเบียบ <strong>VET.LAB 01</strong> และเลือกฟอร์ม: <strong>02</strong> (ห้องแล็บ 6 สาขา) • <strong>03</strong> (เครื่องมือ/ครุภัณฑ์) • <strong>04</strong> (สารเคมี/วัสดุ)
              </p>
            </div>
          </div>

          {/* DOWNWARD ARROW */}
          <div className="flex items-center justify-center py-0.5 text-blue-500">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* STEP 2 */}
          <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-slate-50/80 hover:bg-sky-50/40 border border-slate-200/90 hover:border-sky-300 transition-all">
            <div className="w-8 h-8 rounded-xl bg-sky-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
              2
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  2. กรอกข้อมูล & ลงนามดิจิทัล (Digital Signature)
                </span>
                <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-100">
                  เซ็นชื่อบนหน้าจอ
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                ระบุวันเวลาและวัตถุประสงค์ พร้อมวาดลายมือชื่อดิจิทัลในระบบ (กรณีนักศึกษา ให้อาจารย์ที่ปรึกษา/หน.โครงการ ร่วมลงนาม)
              </p>
            </div>
          </div>

          {/* DOWNWARD ARROW */}
          <div className="flex items-center justify-center py-0.5 text-sky-500">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* STEP 3 */}
          <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-slate-50/80 hover:bg-indigo-50/40 border border-slate-200/90 hover:border-indigo-300 transition-all">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
              3
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  3. ยื่นคำขอล่วงหน้า ≥ 3 วันทำการ & รับรหัสติดตาม
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                  Tracking No. สด
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                ส่งคำขอล่วงหน้า ≥ 3 วันทำการ ระบบออกรหัส <strong>Tracking No.</strong> และส่งอีเมลยืนยันพร้อมไฟล์ PDF ทันที
              </p>
            </div>
          </div>

          {/* TRANSITION DIVIDER */}
          <div className="flex items-center justify-center py-1">
            <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200">
              <ArrowDown className="w-3.5 h-3.5 text-indigo-600 animate-bounce" />
              <span>ส่งคำขอเข้าสู่ระบบ ➔ การพิจารณาอนุมัติ 2 ระดับ</span>
            </div>
          </div>

          {/* STEP 4 */}
          <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-slate-50/80 hover:bg-amber-50/40 border border-slate-200/90 hover:border-amber-300 transition-all">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
              4
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  4. หัวหน้าห้องปฏิบัติการพิจารณา & มอบหมายงาน
                </span>
                <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-100">
                  ส่วนที่ 2 (หน.ห้องแล็บ)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                <strong>หัวหน้างานห้องปฏิบัติการ (นางสุธิดา จันทร์ลุน)</strong> ตรวจสอบคำขอ บันทึกความเห็น ลงนามส่วนที่ 2 และมอบหมายนักวิทยาศาสตร์ผู้รับผิดชอบ
              </p>
            </div>
          </div>

          {/* DOWNWARD ARROW */}
          <div className="flex items-center justify-center py-0.5 text-amber-500">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* STEP 5 */}
          <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-slate-50/80 hover:bg-emerald-50/40 border border-slate-200/90 hover:border-emerald-300 transition-all">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
              5
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  5. นักวิทย์ตรวจความพร้อม & นัดหมายเข้าใช้
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                  ส่วนที่ 3 (อนุมัติสมบูรณ์)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                <strong>นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ</strong> ตรวจความพร้อม ยืนยันนัดหมาย และลงนามส่วนที่ 3 ผู้ขอพิมพ์แบบฟอร์มที่มีลายเซ็นครบ 3 ส่วนได้ทันที
              </p>
            </div>
          </div>

          {/* DOWNWARD ARROW */}
          <div className="flex items-center justify-center py-0.5 text-emerald-500">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* STEP 6 */}
          <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-slate-50/80 hover:bg-purple-50/40 border border-slate-200/90 hover:border-purple-300 transition-all">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
              6
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  6. เข้ารับบริการจริง, คืนพื้นที่ & สรุปผล
                </span>
                <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-100">
                  Log Book & ปิดงาน
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                เข้าใช้ตามนัดหมาย บันทึกลงสมุด <strong>Log Book</strong> ทำความสะอาด/คืนกุญแจ (กรณีสารเคมี 04: สรุปยอดตัดสต๊อกและค่าใช้จ่ายเพื่อตัดงบประมาณ)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section Navigation Filter Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1 text-xs sm:text-sm">
        <button
          onClick={() => setActiveSection('all')}
          className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeSection === 'all'
              ? 'bg-slate-900 text-white shadow-xs scale-[1.02]'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          ทั้งหมด (ทุกหมวด)
        </button>
        <button
          onClick={() => setActiveSection('contact')}
          className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSection === 'contact'
              ? 'bg-blue-600 text-white shadow-xs scale-[1.02]'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" /> 1. การติดต่อ & แบบฟอร์ม
        </button>
        <button
          onClick={() => setActiveSection('lab')}
          className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSection === 'lab'
              ? 'bg-amber-600 text-white shadow-xs scale-[1.02]'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> 2. ข้อปฏิบัติการใช้ห้อง
        </button>
        <button
          onClick={() => setActiveSection('equipment')}
          className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSection === 'equipment'
              ? 'bg-teal-600 text-white shadow-xs scale-[1.02]'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wrench className="w-4 h-4" /> 3. การใช้เครื่องมือ/ครุภัณฑ์
        </button>
        <button
          onClick={() => setActiveSection('chemicals')}
          className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSection === 'chemicals'
              ? 'bg-purple-600 text-white shadow-xs scale-[1.02]'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FlaskConical className="w-4 h-4" /> 4. การเบิกสารเคมี/วัสดุ
        </button>
      </div>

      {/* 5. Detailed Sections with Visual Cards */}
      <div className="space-y-6">

        {/* ========================================================================= */}
        {/* หมวดที่ 1: การติดต่อเพื่อขอใช้บริการ */}
        {/* ========================================================================= */}
        {(activeSection === 'all' || activeSection === 'contact') && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                1
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  หมวดที่ 1: การติดต่อเพื่อขอใช้บริการ
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  หลักเกณฑ์การยื่นแบบฟอร์มและการพิจารณาของคณะสัตวแพทยศาสตร์ มข.
                </p>
              </div>
            </div>

            {/* Quick Action Interactive Cards for Forms 02, 03, 04 */}
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span>เลือกแบบฟอร์มตามลักษณะการขอรับบริการ:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Card Form 02 */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-200 flex flex-col justify-between hover:shadow-xs transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-bold text-blue-700 bg-white px-2.5 py-0.5 rounded-full border border-blue-100">
                        VET.LAB 02
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      ขอใช้ห้องปฏิบัติการ
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      จองเข้าใช้พื้นที่ห้องแล็บ 6 สาขาวิชา สำหรับการเรียนการสอนและวิจัย
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onGoToForm02}
                    className="mt-4 w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs active:scale-95"
                  >
                    เปิดกรอกแบบฟอร์ม 02 <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Card Form 03 */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50/70 to-emerald-50/40 border border-teal-200 flex flex-col justify-between hover:shadow-xs transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                        <Wrench className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-bold text-teal-700 bg-white px-2.5 py-0.5 rounded-full border border-teal-100">
                        VET.LAB 03
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      ขอใช้เครื่องมือวิทยาศาสตร์
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      ขอใช้งานเครื่องมือวิทยาศาสตร์และครุภัณฑ์ ทั้งในห้องแล็บและยืมภาคสนาม
                    </p>
                  </div>
                  {onGoToForm03 && (
                    <button
                      type="button"
                      onClick={onGoToForm03}
                      className="mt-4 w-full py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs active:scale-95"
                    >
                      เปิดกรอกแบบฟอร์ม 03 <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Card Form 04 */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/70 to-fuchsia-50/40 border border-purple-200 flex flex-col justify-between hover:shadow-xs transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                        <FlaskConical className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-bold text-purple-700 bg-white px-2.5 py-0.5 rounded-full border border-purple-100">
                        VET.LAB 04
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      ขอเบิกสารเคมีและวัสดุ
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      ขอเบิกสารเคมีและวัสดุสิ้นเปลือง พร้อมระบบคำนวณและสรุปค่าใช้จ่าย
                    </p>
                  </div>
                  {onGoToForm04 && (
                    <button
                      type="button"
                      onClick={onGoToForm04}
                      className="mt-4 w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs active:scale-95"
                    >
                      เปิดกรอกแบบฟอร์ม 04 <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Steps & Key Rules Breakdown */}
            <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-700">
              <div className="flex gap-3 items-start p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1.1
                </span>
                <p>
                  เลือกใช้แบบฟอร์มให้ถูกต้องตามประเภทการขอใช้บริการ (VET.LAB 02, 03 หรือ 04) และกรอกข้อมูลให้ครบถ้วนชัดเจน
                </p>
              </div>

              <div className="flex gap-3 items-start p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1.2
                </span>
                <p>
                  <strong>กรณีผู้ขอใช้บริการเป็นนักศึกษา:</strong> จะต้องมีลายมือชื่อของ <strong>อาจารย์ที่ปรึกษา / หัวหน้าโครงการ</strong> เพื่อพิจารณาลงนามให้ความเห็นชอบในแบบฟอร์ม
                </p>
              </div>

              <div className="flex gap-3 items-start p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1.3
                </span>
                <p>
                  ส่งแบบฟอร์มการขอใช้บริการ (VET.LAB 02-04) ผ่านระบบออนไลน์ล่วงหน้าอย่างน้อย <strong>3 วันทำการ</strong> ก่อนวันเข้าใช้บริการจริง
                </p>
              </div>

              <div className="flex gap-3 items-start p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1.4
                </span>
                <div>
                  <strong>ผู้ประสานงานห้องปฏิบัติการ</strong> เสนอ <strong>หัวหน้างานห้องปฏิบัติการ (นางสุธิดา จันทร์ลุน นักวิชาการวิทยาศาสตร์ ชำนาญการพิเศษ)</strong> พิจารณา:
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                    <li><strong>กรณีไม่อนุญาต:</strong> แจ้งผู้ขอใช้บริการเพื่อนำกลับไปแก้ไข</li>
                    <li><strong>กรณีอนุญาต:</strong> ผู้ประสานงานนำส่งแบบฟอร์มไปยังนักวิชาการวิทยาศาสตร์ผู้รับผิดชอบดูแลห้องปฏิบัติการ</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1.5
                </span>
                <p>
                  ผู้ขอใช้บริการ <strong>นัดหมายการเข้าใช้บริการกับนักวิชาการวิทยาศาสตร์ผู้รับผิดชอบประจำห้องปฏิบัติการ</strong> และเข้าใช้บริการตามวันและเวลาที่ได้รับอนุมัติ
                </p>
              </div>
            </div>

            {/* Official Personnel Contact Note */}
            <div className="p-4 sm:p-5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs sm:text-sm space-y-2 text-amber-950">
              <div className="font-bold flex items-center gap-2 text-amber-900 text-sm sm:text-base">
                <Info className="w-4 h-4 text-amber-700" /> ข้อมูลผู้ประสานงานและผู้มีอำนาจพิจารณา:
              </div>
              <ul className="space-y-1.5 pl-4 list-disc text-xs sm:text-sm text-slate-700 leading-relaxed">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" /> 2.1 ในเวลาราชการ (จันทร์ - ศุกร์)
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  เปิดให้บริการเวลา <strong>08.30 - 16.30 น.</strong> โดยต้องแจ้งนักวิชาการวิทยาศาสตร์ผู้รับผิดชอบก่อนทุกครั้ง เพื่อทำการเปิดห้องปฏิบัติการให้
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="font-bold text-amber-950 text-sm sm:text-base flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-600" /> 2.2 นอกเวลาราชการและวันหยุด
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  (16.30 น. เป็นต้นไป, เสาร์-อาทิตย์, วันหยุดนักขัตฤกษ์) ต้องได้รับอนุมัติเป็นกรณีพิเศษ และต้องอยู่ในความดูแลของอาจารย์ที่ปรึกษาอย่างเคร่งครัด
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="font-bold text-blue-950 text-sm sm:text-base flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-blue-600" /> 2.3 การเบิกกุญแจและมัดจำ
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  เบิกกุญแจได้เฉพาะกรณีนอกเวลาเท่านั้น มัดจำดอกละ <strong>100 บาท/ห้อง</strong> และจะได้รับเงินคืนเต็มจำนวนเมื่อนำกุญแจมาส่งคืนครบถ้วน
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-red-50/70 border border-red-200 space-y-2">
                <div className="font-bold text-red-950 text-sm sm:text-base flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600" /> 2.4 ข้อห้ามเด็ดขาดเรื่องกุญแจ
                </div>
                <p className="text-xs sm:text-sm text-red-900 leading-relaxed">
                  <strong>ห้ามนำกุญแจไปปั๊มเอง หรือให้ผู้อื่นยืมต่อโดยเด็ดขาด</strong> หากฝ่าฝืน คณะฯ จะพิจารณาตัดสิทธิ์การขอใช้ห้องปฏิบัติการ 1 ภาคการศึกษา
                </p>
              </div>
            </div>

            {/* Infographic: 8 Golden Rules of Lab Safety */}
            <div>
              <div className="text-sm font-bold text-slate-900 mb-3.5 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span>ข้อปฏิบัติความปลอดภัยและระเบียบวินัย (ข้อ 2.5 - 2.12):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 text-sm">2.5 การแต่งกาย:</strong>
                    <div className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      แต่งกายสุภาพ สวมเสื้อกาวน์ (Lab Coat) และรองเท้าหุ้มส้นทุกครั้ง ห้ามใส่กางเกงขาสั้นและรองเท้าแตะ
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-red-50/60 rounded-2xl border border-red-200 flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-red-950 text-sm">2.6 ข้อห้ามการบริโภค:</strong>
                    <div className="text-xs sm:text-sm text-red-900 mt-1 leading-relaxed">
                      ห้ามสูบบุหรี่ นำอาหาร ขนม หรือเครื่องดื่มเข้ามารับประทานในห้องปฏิบัติการโดยเด็ดขาด
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-950 text-sm">2.7 การทิ้งของเสียอันตราย:</strong>
                    <div className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                      ห้ามทิ้งของเหลว สารเคมีอันตราย หรือเศษขยะลงในอ่างน้ำ ให้ทิ้งในภาชนะจัดเก็บเฉพาะที่เตรียมไว้เท่านั้น
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 text-sm">2.8 เมื่อเกิดอุบัติเหตุ:</strong>
                    <div className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      ไม่ว่าจะเล็กน้อยหรือรุนแรง ต้องแจ้งนักวิชาการวิทยาศาสตร์หรืออาจารย์ที่ปรึกษาให้ทราบทันที
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 text-sm">2.9 บันทึก Log Book:</strong>
                    <div className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      ลงบันทึกเวลาเข้า-ออก และรายละเอียดการปฏิบัติงานในสมุด Log Book ประจำห้องทุกครั้ง
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 text-sm">2.10 ความรับผิดชอบสถานที่:</strong>
                    <div className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      ทำความสะอาดโต๊ะปฏิบัติการ ปิดประตู หน้าต่าง ก๊อกน้ำ และระบบไฟฟ้าทุกจุดก่อนออกจากห้อง
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 text-sm">2.11 การชดใช้ความเสียหาย:</strong>
                    <div className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      หากเกิดความเสียหายจากความประมาทเลินเล่อ ผู้ขอใช้บริการต้องรับผิดชอบค่าเสียหายตามที่เกิดขึ้นจริง
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 text-sm">2.12 สิทธิ์การยกเลิก:</strong>
                    <div className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
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
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                3
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  หมวดที่ 3: ข้อปฏิบัติในการขอใช้เครื่องมือ/อุปกรณ์วิทยาศาสตร์ และครุภัณฑ์
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  เกณฑ์ระยะเวลาการยืม การจองล่วงหน้า การดูแล และเงื่อนไขการส่งคืน
                </p>
              </div>
            </div>

            {/* Visual Timeline Cards of Borrowing Time Limits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1.5 text-center">
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">เครื่องมือประจำห้องแล็บ</span>
                <div className="text-2xl font-black text-teal-800 mt-1">ไม่เกิน 1 เดือน</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ยื่นแบบฟอร์มได้ครั้งละไม่เกิน 1 เดือน (เครื่องมือจำกัดอาจลดเหลือ 1 สัปดาห์)
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5 text-center">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">ยืมนำออกนอกสถานที่ / ภาคสนาม</span>
                <div className="text-2xl font-black text-blue-800 mt-1">ไม่เกิน 10 วัน</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ยื่นขอใช้นำออกนอกสถานที่ได้ครั้งละไม่เกิน 10 วันทำการ
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5 text-center">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">การจองตารางล่วงหน้า</span>
                <div className="text-2xl font-black text-amber-800 mt-1">ล่วงหน้า ≤ 2 วัน</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  จองต่อเนื่องได้ไม่เกิน 3 วัน (หากไม่มาตามนัดถือว่าสละสิทธิ์)
                </p>
              </div>
            </div>

            {/* 4-Step Checklist for Equipment Usage */}
            <div className="space-y-3.5 pt-1">
              <div className="text-sm font-bold text-slate-900 mb-2">
                ขั้นตอนและระเบียบปฏิบัติสำคัญ (ข้อ 3.3 - 3.12):
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-teal-600" /> 3.3 การอบรมก่อนใช้งาน
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    นักศึกษาและบุคลากรภายนอก <strong>ต้องผ่านการทดสอบหรืออบรมการใช้งาน</strong> จากนักวิชาการวิทยาศาสตร์ อาจารย์ที่ปรึกษา หรือหัวหน้าห้องปฏิบัติการก่อน จึงจะได้รับอนุญาต
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <Flame className="w-4 h-4 text-amber-600" /> 3.5 กรณีเร่งด่วน
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    กรณีจำเป็นเร่งด่วน ให้ชี้แจงเหตุผลและความจำเป็นต่อหัวหน้าห้องปฏิบัติการ (กรณีนักศึกษาให้อาจารย์ที่ปรึกษาเป็นผู้ชี้แจง) เพื่อพิจารณาอนุมัติเป็นรายกรณี
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 3.6 การตรวจรับเครื่องมือ
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    ตรวจสอบรายการ จำนวน และสภาพของเครื่องมือก่อนนำไปใช้ หากพบชำรุดหรือไม่ครบให้แจ้งเจ้าหน้าที่ทันที เพราะเป็นความรับผิดชอบของผู้ใช้หลังจากรับของไปแล้ว
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-blue-600" /> 3.7 - 3.8 ข้อควรระวังและบันทึก Log Book
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    ปฏิบัติตามข้อควรระวังของแต่ละเครื่องอย่างเคร่งครัด เมื่อใช้เสร็จแล้วต้องลงบันทึกในสมุด Log Book ทุกครั้ง และทำความสะอาดให้อยู่ในสภาพพร้อมใช้งาน
                  </p>
                </div>

                <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-1">
                  <div className="font-bold text-amber-950 flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-amber-600" /> 3.9 เงื่อนไขการส่งคืน (ทำความสะอาด & ลอกสติกเกอร์)
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    เครื่องมือที่นำมาส่งคืนต้องทำความสะอาด เช็ดล้างรอยปากกาที่เขียนติด และลอกสติกเกอร์ออกให้หมด <em>จะไม่รับคืนอุปกรณ์ที่ไม่สะอาดหรือชำรุดเสียหาย</em> หากชำรุดผู้ขอยืมต้องชดใช้ค่าเสียหาย
                  </p>
                </div>

                <div className="p-4 bg-red-50/70 rounded-2xl border border-red-200 space-y-1">
                  <div className="font-bold text-red-950 flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-600" /> 3.10 - 3.12 กรณีไม่คืนตามกำหนด / การใช้งานผิดวิธี
                  </div>
                  <p className="text-xs sm:text-sm text-red-900 leading-relaxed">
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
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                4
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  หมวดที่ 4: ข้อปฏิบัติในการเบิกสารเคมี และวัสดุสิ้นเปลือง
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  เกณฑ์ปริมาณที่ขอเบิก การตรวจรับของ และระบบการชำระเงิน/ตัดงบประมาณ
                </p>
              </div>
            </div>

            {/* Chemical Dispensing Flow Infographic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700">
              <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
                <div className="font-bold text-purple-950 flex items-center gap-2 text-sm sm:text-base">
                  <FlaskConical className="w-4 h-4 text-purple-600" /> 4.1 ปริมาณที่ขอเบิก (พอดีใช้)
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  จำนวนที่ขอเบิกต้องไม่มากจนเกินไป เพราะสารเคมีที่ใช้ไม่หมด <strong>ห้ามเทคืนใส่ขวดบรรจุเดิม</strong> เนื่องจากอาจเกิดการปนเปื้อนหรือเสื่อมสภาพ
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="font-bold text-amber-950 flex items-center gap-2 text-sm sm:text-base">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> 4.2 - 4.3 กรณีไม่มารับของ / ตรวจนับ
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  หากไม่มาติดต่อรับของที่ยื่นเบิกไว้ ขอสงวนสิทธิ์ว่าท่านมียอดใช้จ่ายตามรายการนั้น และโปรดตรวจนับความถูกต้องก่อนลงนามรับของ
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                <div className="font-bold text-blue-950 flex items-center gap-2 text-sm sm:text-base">
                  <FileCheck className="w-4 h-4 text-blue-600" /> 4.4 การชำระเงินค่าสารเคมี
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  เมื่อสิ้นสุดการทดลอง นักวิชาการวิทยาศาสตร์จะคำนวณสรุปยอด เพื่อให้ผู้ใช้บริการนำไปติดต่อชำระเงินที่งานการเงินของคณะฯ
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
                <div className="font-bold text-teal-950 flex items-center gap-2 text-sm sm:text-base">
                  <Award className="w-4 h-4 text-teal-600" /> 4.5 กรณีนักศึกษาวิชาปัญหาพิเศษ
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  เจ้าหน้าที่จะสรุปยอดส่งงานการเงินเพื่อตัดออกจากงบวิชาปัญหาพิเศษที่ได้รับ หากยอดเกินงบ นักศึกษาต้องชำระส่วนต่างเพิ่มเติม
                </p>
              </div>
            </div>

            {/* Post-experiment Cleanup Golden Notice Box */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-xs sm:text-sm space-y-2.5">
              <div className="font-bold text-amber-950 flex items-center gap-2 text-sm sm:text-base">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>ข้อกำหนดสำคัญเมื่อสิ้นสุดการทดลอง (Post-Experiment Protocol):</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                เมื่อสิ้นสุดจากการทำงานทดลองแล้ว ผู้ขอใช้บริการจะต้อง:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs sm:text-sm">
                <div className="p-3.5 bg-white/90 rounded-xl border border-amber-200/80 font-medium text-amber-950 shadow-2xs">
                  🔑 <strong>1. คืนกุญแจห้องแล็บ</strong> และอุปกรณ์เครื่องมือที่ยืมมาให้ครบถ้วน
                </div>
                <div className="p-3.5 bg-white/90 rounded-xl border border-amber-200/80 font-medium text-amber-950 shadow-2xs">
                  ❄️ <strong>2. เคลียร์ตัวอย่าง</strong> จัดเก็บหรือกำจัดออกจากตู้เย็นและตู้แช่แข็งให้หมด
                </div>
                <div className="p-3.5 bg-white/90 rounded-xl border border-amber-200/80 font-medium text-amber-950 shadow-2xs">
                  🧹 <strong>3. ทำความสะอาด</strong> บริเวณโต๊ะ พื้นห้อง และเครื่องมือให้เรียบร้อย
                </div>
              </div>
              <div className="text-xs text-amber-900 font-bold mt-2">
                * หากพบว่าผู้ใช้บริการไม่ปฏิบัติตามข้อกำหนด หัวหน้าห้องปฏิบัติการขอใช้สิทธิ์งดให้บริการในครั้งต่อไป
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

