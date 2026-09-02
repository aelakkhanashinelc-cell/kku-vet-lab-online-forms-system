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
  FileCheck,
  ChevronRight,
  Info,
  Phone,
  MapPin,
  Calendar,
  KeyRound,
  Trash2,
  FileSpreadsheet,
  HelpCircle,
  Award,
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
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white p-6 sm:p-8 rounded-xl shadow-xs relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-xs text-white text-[10px] font-bold uppercase rounded border border-white/30 font-mono tracking-wider">
              OFFICIAL GUIDELINES • VET.LAB 01
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            หลักเกณฑ์และข้อปฏิบัติ งานห้องปฏิบัติการ
          </h1>
          <p className="text-amber-100 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
            งานห้องปฏิบัติการ งานวิจัยและบริการวิชาการ คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น
          </p>
        </div>
      </div>

      {/* Visual Infographic KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold">ยื่นล่วงหน้า</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-blue-600">อย่างน้อย 3 วัน</div>
          <div className="text-[10px] text-slate-500 mt-0.5">ล่วงหน้าก่อนวันเข้าใช้บริการ</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold">ยืมใช้ภาคสนาม</span>
            <Wrench className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-teal-600">ไม่เกิน 10 วัน</div>
          <div className="text-[10px] text-slate-500 mt-0.5">ครั้งละไม่เกิน 10 วัน</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold">มัดจำกุญแจ</span>
            <KeyRound className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-600">100 บาท/ห้อง</div>
          <div className="text-[10px] text-slate-500 mt-0.5">ได้รับคืนเมื่อนำกุญแจมาคืน</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold">เวลาเปิดบริการ</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-600">08.30-16.30 น.</div>
          <div className="text-[10px] text-slate-500 mt-0.5">จันทร์-ศุกร์ (เวลาราชการ)</div>
        </div>
      </div>

      {/* Preamble Intro Box */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-5 text-xs text-amber-950 leading-relaxed shadow-2xs">
        <div className="font-bold flex items-center gap-1.5 text-amber-900 text-sm mb-1.5">
          <Info className="w-4 h-4 text-amber-700" /> คำชี้แจงและวัตถุประสงค์
        </div>
        <p className="text-slate-700 leading-relaxed">
          หลักเกณฑ์และข้อปฏิบัติของงานห้องปฏิบัติการนี้ เป็นหลักเกณฑ์และข้อควรปฏิบัติในภาพรวมที่ผู้ขอใช้บริการ ได้แก่ <strong>อาจารย์ เจ้าหน้าที่ นักวิจัย นักศึกษา บุคลากรภายในและภายนอกคณะฯ</strong> ที่เข้ามาใช้บริการในส่วนของงานห้องปฏิบัติการ เพื่อการเรียนการสอน การวิจัย งานวิชาปัญหาพิเศษ หรืองานโครงการต่างๆ จะต้องทราบและลงนามยอมรับข้อตกลง เพื่อให้ทุกคนปฏิบัติเป็นไปตามหลักเกณฑ์เดียวกัน ช่วยให้ทำงานได้สะดวกเป็นขั้นตอน มีความเป็นระเบียบเรียบร้อย และง่ายต่อการติดตามและตรวจสอบ โดยมีรายละเอียดดังต่อไปนี้
        </p>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        <button
          onClick={() => setActiveSection('all')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          ทั้งหมด (ทุกหมวด)
        </button>
        <button
          onClick={() => setActiveSection('contact')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'contact'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          1. การติดต่อขอใช้บริการ
        </button>
        <button
          onClick={() => setActiveSection('lab')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'lab'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          2. ข้อปฏิบัติการใช้ห้อง
        </button>
        <button
          onClick={() => setActiveSection('equipment')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'equipment'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          3. การใช้เครื่องมือ/ครุภัณฑ์
        </button>
        <button
          onClick={() => setActiveSection('chemicals')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeSection === 'chemicals'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          4. การเบิกสารเคมี/วัสดุ
        </button>
      </div>

      {/* Content Container */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-8 text-slate-700 leading-relaxed text-xs sm:text-sm">
        
        {/* ========================================================================= */}
        {/* 1. การติดต่อเพื่อขอใช้บริการ */}
        {/* ========================================================================= */}
        {(activeSection === 'all' || activeSection === 'contact') && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs flex items-center justify-center font-bold shrink-0">
                1
              </span>
              <h2 className="text-base font-bold text-slate-900">
                การติดต่อเพื่อขอใช้บริการ
              </h2>
            </div>

            <div className="space-y-3 pl-1">
              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-blue-600 shrink-0 mt-0.5">1.1</span>
                <div>
                  อ่านระเบียบและข้อปฏิบัติ (VET.LAB 01) พร้อมทั้งลงนามยินยอมปฏิบัติตามข้อตกลงต่างๆ ของห้องปฏิบัติการ
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-blue-600 shrink-0 mt-0.5">1.2</span>
                <div className="space-y-2">
                  <span>
                    เลือกใช้ <strong>“แบบฟอร์ม”</strong> ให้ถูกต้อง และกรอกรายละเอียดให้ครบถ้วนและชัดเจน โดยขอแบบฟอร์มได้ที่เจ้าหน้าที่ ห้องประสานงาน* ซึ่งมีแบบฟอร์มต่างๆ ดังต่อไปนี้:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-blue-900 flex items-center gap-1.5 text-xs">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" /> ก. VET.LAB 02
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1">
                          แบบฟอร์มการขอใช้ห้องปฏิบัติการ
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onGoToForm02}
                        className="mt-2.5 text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        กรอกแบบฟอร์มนี้ <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="p-3 rounded-lg bg-teal-50/70 border border-teal-200 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-teal-900 flex items-center gap-1.5 text-xs">
                          <Wrench className="w-3.5 h-3.5 text-teal-600" /> ข. VET.LAB 03
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1">
                          แบบฟอร์มการขอใช้วัสดุ/อุปกรณ์วิทยาศาสตร์และครุภัณฑ์
                        </div>
                      </div>
                      {onGoToForm03 && (
                        <button
                          type="button"
                          onClick={onGoToForm03}
                          className="mt-2.5 text-[11px] font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                        >
                          กรอกแบบฟอร์มนี้ <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="p-3 rounded-lg bg-purple-50/70 border border-purple-200 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-purple-900 flex items-center gap-1.5 text-xs">
                          <FlaskConical className="w-3.5 h-3.5 text-purple-600" /> ค. VET.LAB 04
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1">
                          แบบฟอร์มการเบิกสารเคมีและวัสดุสิ้นเปลือง
                        </div>
                      </div>
                      {onGoToForm04 && (
                        <button
                          type="button"
                          onClick={onGoToForm04}
                          className="mt-2.5 text-[11px] font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                        >
                          กรอกแบบฟอร์มนี้ <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-blue-600 shrink-0 mt-0.5">1.3</span>
                <div>
                  <strong>กรณีผู้ขอใช้บริการเป็นนักศึกษา:</strong> จะต้องมีลายมือชื่อของ <strong>อาจารย์ที่ปรึกษา / หัวหน้าโครงการ</strong> เพื่อพิจารณาลงนามให้ความเห็นชอบในแบบฟอร์ม
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-blue-600 shrink-0 mt-0.5">1.4</span>
                <div>
                  ส่ง <strong>“แบบฟอร์มการขอใช้บริการ (VET.LAB 02-04)”</strong> ผ่านระบบอีเมลหรือยื่นเอกสาร โดยต้องส่งล่วงหน้าอย่างน้อย <strong>3 วัน</strong> ก่อนวันเข้าใช้บริการจริง
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-blue-600 shrink-0 mt-0.5">1.5</span>
                <div>
                  <strong>ผู้ประสานงานห้องปฏิบัติการ</strong> เสนอ <strong>หัวหน้าห้องปฏิบัติการ (นางสุธิดา จันทร์ลุน นักวิชาการวิทยาศาสตร์ ชำนาญการพิเศษ)</strong> พิจารณา:
                  <ul className="list-disc pl-5 mt-1 text-slate-600 space-y-0.5">
                    <li><strong>กรณีไม่อนุญาต:</strong> แจ้งผู้ขอใช้บริการเพื่อนำกลับไปแก้ไข</li>
                    <li><strong>กรณีอนุญาต:</strong> ผู้ประสานงานนำส่งแบบฟอร์มไปยังนักวิทยาศาสตร์ผู้ดูแลห้องปฏิบัติการ</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-blue-600 shrink-0 mt-0.5">1.6</span>
                <div>
                  ผู้ขอใช้บริการ <strong>นัดหมายการเข้าใช้บริการกับนักวิทยาศาสตร์ประจำห้องปฏิบัติการ</strong> และเข้าใช้บริการตามวันและเวลาที่กำหนด
                </div>
              </div>
            </div>

            {/* Note box */}
            <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5 text-slate-700">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-600" /> หมายเหตุ:
              </div>
              <ul className="space-y-1 pl-4 list-decimal text-[11px] text-slate-600">
                <li>
                  <strong>ผู้ประสานงานห้องปฏิบัติการ*</strong> หมายถึง <strong>คุณรัตนา หลายวิวัฒน์</strong>
                </li>
                <li>
                  <strong>หัวหน้าห้องปฏิบัติการ**</strong> หมายถึง <strong>นางสุธิดา จันทร์ลุน (ตำแหน่งนักวิชาการวิทยาศาสตร์ ชำนาญการพิเศษ)</strong>
                </li>
                <li>
                  ในกรณีที่ผู้ขอใช้บริการเป็นบุคลากร นักศึกษา หรือหน่วยงานภายนอกคณะฯ ให้ทำบันทึกข้อความขอใช้บริการถึง <strong>คณบดีคณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น</strong> โดยตรง
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. ข้อปฏิบัติในการขอใช้ห้องปฏิบัติการ */}
        {/* ========================================================================= */}
        {(activeSection === 'all' || activeSection === 'lab') && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <span className="w-7 h-7 rounded-lg bg-amber-500 text-white text-xs flex items-center justify-center font-bold shrink-0">
                2
              </span>
              <h2 className="text-base font-bold text-slate-900">
                ข้อปฏิบัติในการขอใช้ห้องปฏิบัติการ
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> 2.1 เวลาทำการราชการ
                </div>
                <p className="text-slate-600 text-[11px]">
                  ห้องปฏิบัติการจะเปิดให้ใช้บริการในเวลาราชการ (จันทร์-ศุกร์ เวลา 08.30-16.30 น.) โดยต้องแจ้งเจ้าหน้าที่ก่อนทุกครั้งที่ใช้ เพื่อทำการเปิดห้องปฏิบัติการให้
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-600" /> 2.2 การใช้นอกเวลาราชการ
                </div>
                <p className="text-slate-600 text-[11px]">
                  กรณีขอใช้นอกเวลาราชการ (16.30 น. เป็นต้นไป, เสาร์-อาทิตย์, วันหยุดนักขัตฤกษ์) ต้องขออนุมัติพิเศษเป็นรายๆ ไป และต้องอยู่ในความดูแลของอาจารย์ที่ปรึกษา (กรณีนักศึกษา)
                </p>
              </div>

              <div className="p-3.5 bg-amber-50/60 rounded-lg border border-amber-200 space-y-1">
                <div className="font-bold text-amber-950 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" /> 2.3 การเบิกกุญแจและมัดจำ
                </div>
                <p className="text-slate-700 text-[11px]">
                  เบิกกุญแจได้เฉพาะกรณีนอกเวลาราชการเท่านั้น โดยต้องจ่ายเงินมัดจำค่ากุญแจกับเจ้าหน้าที่ดอกละ <strong>100 บาท/ห้อง</strong> และจะได้รับเงินคืนเมื่อนำกุญแจมาคืน
                </p>
              </div>

              <div className="p-3.5 bg-red-50/60 rounded-lg border border-red-200 space-y-1">
                <div className="font-bold text-red-950 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" /> 2.4 ข้อห้ามเรื่องกุญแจ
                </div>
                <p className="text-slate-700 text-[11px]">
                  <strong>ห้ามนำกุญแจไปปั๊มเอง หรือให้ผู้อื่นยืมต่อโดยเด็ดขาด</strong> หากฝ่าฝืน คณะฯ จะพิจารณาตัดสิทธิ์การขอใช้ห้องปฏิบัติการเป็นระยะเวลา 1 ภาคการศึกษา
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pl-1 text-xs">
              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-amber-600 shrink-0">2.5</span>
                <div>
                  <strong>การแต่งกาย:</strong> แต่งกายสุภาพเรียบร้อย ไม่ใส่กางเกงขาสั้นและรองเท้าแตะ และสวมเสื้อกาวน์ (Lab Coat) ทุกครั้งที่ปฏิบัติงานในห้องปฏิบัติการ
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-amber-600 shrink-0">2.6</span>
                <div>
                  <strong>ข้อห้ามบริโภค:</strong> ห้ามสูบบุหรี่ นำอาหาร ขนม หรือน้ำดื่ม เข้าไปรับประทานในห้องปฏิบัติการโดยเด็ดขาด
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-amber-600 shrink-0">2.7</span>
                <div>
                  <strong>การทิ้งของเสีย:</strong> ห้ามทิ้งของเหลว หรือสารเคมีที่เป็นอันตราย รวมทั้งเศษขยะต่างๆ ลงในอ่างน้ำโดยเด็ดขาด ให้ทิ้งในที่ที่จัดเตรียมไว้ให้เท่านั้น
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-amber-600 shrink-0">2.8</span>
                <div>
                  <strong>กรณีอุบัติเหตุ:</strong> เมื่อเกิดอุบัติเหตุไม่ว่าจะมากหรือน้อย ต้องแจ้งเจ้าหน้าที่หรืออาจารย์ที่ปรึกษา ให้ทราบทันที
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-amber-600 shrink-0">2.9</span>
                <div>
                  <strong>สมุดบันทึก (Log Book):</strong> ลงบันทึกการเข้า-ออกห้องปฏิบัติการ ในสมุดการใช้ห้องปฏิบัติการ (Log Book) ทุกครั้ง
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-amber-600 shrink-0">2.10</span>
                <div>
                  <strong>ความรับผิดชอบสถานที่:</strong> ต้องรับผิดชอบดูแลความเรียบร้อยในการเปิด-ปิด ประตู หน้าต่าง ก๊อกน้ำ ไฟฟ้า รวมทั้งทำความสะอาดบริเวณโต๊ะปฏิบัติการ พื้นห้อง เครื่องมือ และวัสดุอุปกรณ์ทุกครั้งที่ใช้บริการ
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-amber-600 shrink-0">2.11</span>
                <div>
                  <strong>ความเสียหาย:</strong> หากเกิดความเสียหายต่อเครื่องมือ อุปกรณ์ และห้องปฏิบัติการ โดยพิจารณาแล้วว่าเป็นเหตุเนื่องมาจากความประมาทเลินเล่อ ผู้ขอใช้บริการต้องรับผิดชอบค่าเสียหายตามที่เกิดขึ้นจริง
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-amber-600 shrink-0">2.12</span>
                <div>
                  <strong>สิทธิ์การยกเลิก:</strong> หากพบว่าผู้ใช้บริการไม่ปฏิบัติตามระเบียบและข้อปฏิบัติ หัวหน้าห้องปฏิบัติการขอใช้สิทธิ์ยกเลิกการให้ใช้ห้องปฏิบัติการนั้นๆ ได้
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. ข้อปฏิบัติในการขอใช้เครื่องมือ/อุปกรณ์วิทยาศาสตร์ และครุภัณฑ์ */}
        {/* ========================================================================= */}
        {(activeSection === 'all' || activeSection === 'equipment') && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <span className="w-7 h-7 rounded-lg bg-teal-600 text-white text-xs flex items-center justify-center font-bold shrink-0">
                3
              </span>
              <h2 className="text-base font-bold text-slate-900">
                ข้อปฏิบัติในการขอใช้เครื่องมือ/อุปกรณ์วิทยาศาสตร์ และครุภัณฑ์
              </h2>
            </div>

            <div className="space-y-2.5 pl-1 text-xs">
              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-teal-600 shrink-0">3.1</span>
                <div>
                  <strong>ระยะเวลาการยื่นแบบฟอร์ม:</strong> สามารถยื่นแบบฟอร์มขอใช้เครื่องมือได้ครั้งละไม่เกิน <strong>1 เดือน</strong> (กรณีเครื่องมือที่ประจำอยู่แต่ละห้องปฏิบัติการ) ยกเว้นกรณีที่เครื่องมือ/อุปกรณ์บางอย่างมีจำนวนจำกัดหรือมีผู้ขอใช้เป็นจำนวนมาก อาจจะให้ใช้ได้ครั้งละไม่เกิน 1 สัปดาห์ และให้ใช้ได้ในจำนวนที่จำกัด โดยพิจารณาตามความเหมาะสม หรือตามเหตุผลและความจำเป็นของผู้ขอใช้
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-teal-600 shrink-0">3.2</span>
                <div>
                  <strong>การนำออกนอกสถานที่:</strong> สามารถยื่นแบบฟอร์มขอใช้เครื่องมือได้ครั้งละไม่เกิน <strong>10 วัน</strong> (กรณีเครื่องมือนำไปใช้นอกสถานที่)
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-teal-600 shrink-0">3.3</span>
                <div>
                  <strong>การอบรมการใช้งาน:</strong> กรณีที่ผู้ขอใช้เป็นนักศึกษา หรือบุคลากรภายนอก ต้องผ่านการทดสอบหรือการอบรมการใช้เครื่องมือวิทยาศาสตร์หรือครุภัณฑ์จากเจ้าหน้าที่ อาจารย์ที่ปรึกษา หรือหัวหน้าห้องปฏิบัติการก่อน จึงจะได้รับอนุญาตให้ใช้เครื่องมือนั้นๆ ได้
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-teal-600 shrink-0">3.4</span>
                <div>
                  <strong>การจองเครื่องมือล่วงหน้า:</strong> ลงบันทึกตารางการจองขอใช้เครื่องมือล่วงหน้าได้ไม่เกิน <strong>2 วัน</strong> และต่อเนื่องได้ครั้งละไม่เกิน <strong>3 วัน</strong> หากไม่มาติดต่อขอใช้บริการตามวัน เวลาที่จองไว้ ถือว่าท่านสละสิทธิ์ และให้ผู้ที่จองขอใช้เครื่องมือต่อจากท่านเป็นผู้ใช้รายต่อไป
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-teal-600 shrink-0">3.5</span>
                <div>
                  <strong>กรณีเร่งด่วน:</strong> ในกรณีจำเป็นต้องใช้เครื่องมือ/อุปกรณ์อย่างเร่งด่วน ให้ผู้ขอใช้ชี้แจงเหตุผลและความจำเป็นต่อหัวหน้าห้องปฏิบัติการเพื่อพิจารณาอนุมัติเป็นรายๆ ไป และหากผู้ขอใช้เป็นนักศึกษาให้อาจารย์ที่ปรึกษาเป็นผู้ชี้แจงเหตุผล
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-teal-600 shrink-0">3.6</span>
                <div>
                  <strong>การตรวจสอบก่อนรับของ:</strong> ตรวจสอบความถูกต้องของรายการ จำนวน และสภาพของเครื่องมือ/อุปกรณ์ที่ขอยืมก่อนนำไปใช้ หากพบว่าชำรุดเสียหาย หรือมีจำนวนไม่ครบให้รีบแจ้งเจ้าหน้าที่ทันที เพราะเป็นความรับผิดชอบของผู้ใช้บริการภายหลังจากการเบิกของไปแล้ว
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-teal-600 shrink-0">3.7</span>
                <div>
                  <strong>ข้อควรระวัง:</strong> ต้องปฏิบัติตามข้อควรระวังของเครื่องมือแต่ละเครื่องอย่างเคร่งครัด หากเกิดเหตุขัดข้องหรือชำรุดเสียหายต้องแจ้งเจ้าหน้าที่ทันที
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-teal-600 shrink-0">3.8</span>
                <div>
                  <strong>บันทึก Log Book & ทำความสะอาด:</strong> เมื่อใช้เครื่องมือเสร็จแล้ว ให้ลงบันทึกการใช้งานในสมุด Log Book ทุกครั้ง และทำความสะอาด จัดเครื่องมือให้อยู่ในสภาพเรียบร้อยพร้อมใช้งานได้ต่อไป
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-teal-600 shrink-0">3.9</span>
                <div>
                  <strong>เงื่อนไขการส่งคืน:</strong> เครื่องมือ/อุปกรณ์ที่นำมาส่งคืน ต้องทำความสะอาดให้เรียบร้อย เช็ดล้างปากกาที่เขียนติดบนอุปกรณ์ และลอกสติกเกอร์ออกให้หมด <em>จะไม่รับคืนอุปกรณ์ที่ไม่สะอาด และชำรุดเสียหาย</em> ในกรณีที่อุปกรณ์ชำรุดเสียหายผู้ขอยืมต้องชดใช้ค่าเสียหายเป็นเงินตามราคาของอุปกรณ์นั้นๆ หรือตามราคาที่คณะฯ กำหนด
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-teal-600 shrink-0">3.10</span>
                <div>
                  <strong>กรณีไม่คืนตามกำหนด:</strong> กรณีไม่ส่งเครื่องมือ/อุปกรณ์คืนตามระยะเวลาที่กำหนด ผู้ขอยืมจะถูกดำเนินการตามระเบียบของทางราชการ
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-teal-600 shrink-0">3.11</span>
                <div>
                  <strong>ความเสียหายจากการใช้งานผิดวิธี:</strong> หากเครื่องมือหรืออุปกรณ์ประกอบ เกิดความเสียหายหรือชำรุด อันเนื่องมาจากการใช้งานอย่างไม่ระมัดระวัง ไม่ถูกวิธี หรือจากความประมาทเลินเล่อของผู้ใช้บริการ ผู้ใช้บริการจะต้องรับผิดชอบต่อค่าเสียหายที่เกิดขึ้น
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-teal-600 shrink-0">3.12</span>
                <div>
                  <strong>การเพิกถอนสิทธิ์:</strong> หากพบว่าผู้ใช้บริการไม่ปฏิบัติตามระเบียบและข้อปฏิบัติ หัวหน้าห้องปฏิบัติการขอใช้สิทธิ์ยกเลิกการให้ใช้เครื่องมือ/อุปกรณ์ และครุภัณฑ์ งานวิจัย วิชาปัญหาพิเศษ และงานบริการวิชาการ นั้นๆ
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. ข้อปฏิบัติในการเบิกสารเคมี และวัสดุสิ้นเปลือง */}
        {/* ========================================================================= */}
        {(activeSection === 'all' || activeSection === 'chemicals') && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <span className="w-7 h-7 rounded-lg bg-purple-600 text-white text-xs flex items-center justify-center font-bold shrink-0">
                4
              </span>
              <h2 className="text-base font-bold text-slate-900">
                ข้อปฏิบัติในการเบิกสารเคมี และวัสดุสิ้นเปลือง
              </h2>
            </div>

            <div className="space-y-2.5 pl-1 text-xs">
              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-purple-600 shrink-0">4.1</span>
                <div>
                  <strong>ปริมาณที่ขอเบิก:</strong> จำนวนที่ขอเบิกต้องไม่มากจนเกินไป เพราะสารเคมีที่ใช้ไม่หมดไม่สามารถเทคืนใส่ขวดบรรจุเดิมได้ หรือมีการเสื่อมสภาพนำกลับมาใช้อีกไม่ได้
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-purple-600 shrink-0">4.2</span>
                <div>
                  <strong>กรณีไม่มารับของ:</strong> หากผู้ขอเบิกไม่มาติดต่อขอรับของที่ยื่นเรื่องเบิกไว้ ขอสงวนสิทธิ์ว่าท่านได้มียอดใช้จ่ายตามรายการที่เบิกไว้
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-purple-600 shrink-0">4.3</span>
                <div>
                  <strong>การตรวจนับของ:</strong> ตรวจสอบความถูกต้องของรายการ และจำนวนที่ขอเบิกให้เรียบร้อยก่อนรับของ
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-purple-600 shrink-0">4.4</span>
                <div>
                  <strong>การชำระเงินค่าสารเคมี/วัสดุ:</strong> เมื่อสิ้นสุดการทดลอง เจ้าหน้าที่จะคำนวณค่าสารเคมี/วัสดุสิ้นเปลือง เพื่อให้ผู้ใช้บริการไปติดต่อชำระเงินที่งานการเงินคณะฯ
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="font-bold text-purple-600 shrink-0">4.5</span>
                <div>
                  <strong>กรณีนักศึกษาวิชาปัญหาพิเศษ:</strong> ในกรณีนักศึกษาวิชาปัญหาพิเศษ เจ้าหน้าที่จะสรุปยอดค่าใช้จ่ายส่งไปที่งานการเงินคณะฯ เพื่อตัดออกจากงบที่ได้รับ หากมีค่าใช้จ่ายเกินจากงบ นักศึกษาจะต้องชำระเพิ่มเติม
                </div>
              </div>
            </div>

            {/* Post-experiment Cleanup Section */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg text-xs space-y-1.5 text-slate-700 mt-3">
              <div className="font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> ข้อกำหนดเมื่อสิ้นสุดจากการทำงานทดลอง:
              </div>
              <p className="text-[11px] leading-relaxed text-slate-700">
                เมื่อสิ้นสุดจากการทำงานทดลองแล้ว ผู้ขอใช้บริการจะต้อง <strong>คืนกุญแจห้องปฏิบัติการ อุปกรณ์ต่างๆ ที่ขอยืมมา และต้องจัดเก็บหรือกำจัดตัวอย่างการทดลอง อุปกรณ์ต่างๆ ออกจากตู้เย็น ตู้แช่แข็ง และห้องปฏิบัติการให้หมด</strong> พร้อมทั้งทำความสะอาดบริเวณโต๊ะปฏิบัติการ พื้นห้อง เครื่องมือและอุปกรณ์วิทยาศาสตร์ให้เรียบร้อย หากพบว่าผู้ใช้บริการไม่ปฏิบัติตามระเบียบและข้อปฏิบัติ หัวหน้าห้องปฏิบัติการขอใช้สิทธิ์งดการให้บริการแก่ท่านในครั้งต่อไป
              </p>
            </div>
          </div>
        )}

        {/* Action Footer Buttons */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            เมื่อศึกษาและทำความเข้าใจระเบียบเรียบร้อยแล้ว สามารถเริ่มยื่นคำขอออนไลน์ได้ทันที
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onGoToForm02}
              className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              เริ่มยื่นคำขอ VET.LAB 02 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
