import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  Trash2,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Send,
  Sparkles,
  Info,
  DollarSign,
} from 'lucide-react';
import { VetLabRequest, ChemicalItem04, ApplicantRole, WorkType, SignatureData } from '../types';
import { PRESET_CHEMICALS_04, KKU_DEPARTMENTS } from '../data/presets';
import { DigitalSignaturePad } from './DigitalSignaturePad';
import { getCurrentThaiDateParts } from '../utils/thaiDate';
import { isGasConfigured, isGasSyncEnabled, submitToGoogleAppsScript } from '../utils/gasService';
import { generateElectronicSignatureDataUrl } from '../utils/signatureHelper';

interface FormVetLab04Props {
  onSubmitSuccess: (request: VetLabRequest, emailResult: any) => void;
  onPreviewPrint: (request: VetLabRequest) => void;
  initialApplicantName?: string;
  initialEmail?: string;
  initialPhone?: string;
  initialDepartment?: string;
  initialStudentId?: string;
}

export const FormVetLab04: React.FC<FormVetLab04Props> = ({
  onSubmitSuccess,
  onPreviewPrint,
  initialApplicantName = '',
  initialEmail = '',
  initialPhone = '',
  initialDepartment = '',
  initialStudentId = '',
}) => {
  const thaiDate = getCurrentThaiDateParts();

  // Part 1 States
  const [applicantName, setApplicantName] = useState(initialApplicantName);
  const [role, setRole] = useState<ApplicantRole>(initialStudentId ? 'student' : 'student');
  const [studentId, setStudentId] = useState(initialStudentId);
  const [otherRoleText, setOtherRoleText] = useState('');
  const [department, setDepartment] = useState(
    initialDepartment && KKU_DEPARTMENTS.includes(initialDepartment) ? initialDepartment : 'กลุ่มวิชาพยาธิชีววิทยา (Pathobiology)'
  );
  const [customDepartment, setCustomDepartment] = useState(
    initialDepartment && !KKU_DEPARTMENTS.includes(initialDepartment) ? initialDepartment : ''
  );
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState(initialEmail);
  const [workType, setWorkType] = useState<WorkType>('research');
  const [workTypeOtherText, setWorkTypeOtherText] = useState('');
  const [projectTitle, setProjectTitle] = useState('');

  // Sync with prop updates if user switches account
  React.useEffect(() => {
    if (initialApplicantName) setApplicantName(initialApplicantName);
    if (initialEmail) setEmail(initialEmail);
    if (initialPhone) setPhone(initialPhone);
    if (initialStudentId) {
      setStudentId(initialStudentId);
      setRole('student');
    }
    if (initialDepartment) {
      if (KKU_DEPARTMENTS.includes(initialDepartment)) {
        setDepartment(initialDepartment);
      } else {
        setDepartment('อื่นๆ (โปรดระบุ)');
        setCustomDepartment(initialDepartment);
      }
    }
  }, [initialApplicantName, initialEmail, initialPhone, initialDepartment, initialStudentId]);

  // Chemicals table
  const [chemicalItems, setChemicalItems] = useState<ChemicalItem04[]>([
    {
      id: '1',
      no: 1,
      itemName: PRESET_CHEMICALS_04[0].name,
      quantity: PRESET_CHEMICALS_04[0].defaultQty,
      remarks: PRESET_CHEMICALS_04[0].defaultRemarks,
    },
    {
      id: '2',
      no: 2,
      itemName: PRESET_CHEMICALS_04[7].name,
      quantity: PRESET_CHEMICALS_04[7].defaultQty,
      remarks: PRESET_CHEMICALS_04[7].defaultRemarks,
    },
  ]);

  // Pickup date & time
  const [pickupDate, setPickupDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [pickupTime, setPickupTime] = useState('10:00');

  // Acknowledgement & Signatures
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [applicantSignature, setApplicantSignature] = useState<SignatureData>({
    name: initialApplicantName,
    date: thaiDate.fullStr,
  });
  const [advisorSignature, setAdvisorSignature] = useState<SignatureData>({
    name: '',
    date: thaiDate.fullStr,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addChemicalRow = () => {
    setChemicalItems((prev) => [
      ...prev,
      { id: String(Date.now()), no: prev.length + 1, itemName: '', quantity: '1 ขวด', remarks: '' },
    ]);
  };

  const removeChemicalRow = (index: number) => {
    if (chemicalItems.length <= 1) return;
    const updated = chemicalItems.filter((_, i) => i !== index).map((item, i) => ({ ...item, no: i + 1 }));
    setChemicalItems(updated);
  };

  const updateChemicalRow = (index: number, field: keyof ChemicalItem04, value: string) => {
    setChemicalItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSelectPreset = (index: number, selectedName: string) => {
    const found = PRESET_CHEMICALS_04.find((c) => c.name === selectedName);
    if (found) {
      setChemicalItems((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          itemName: selectedName,
          quantity: found.defaultQty,
          remarks: found.defaultRemarks,
        };
        return copy;
      });
    }
  };

  const handleFillDemo = () => {
    setApplicantName('นางสาวพิชญา สุขุมพันธ์');
    setRole('student');
    setStudentId('665180045-8');
    setDepartment('กลุ่มวิชาพยาธิชีววิทยา (Pathobiology)');
    setPhone('086-987-6543');
    setEmail('pichaya.s@kkumail.com');
    setWorkType('research');
    setProjectTitle('การศึกษาแบคทีเรียดื้อยาในสุนัขและแมว');
    setChemicalItems([
      { id: '1', no: 1, itemName: 'Ethanol 95% AR Grade', quantity: '2 ขวด', remarks: 'ใช้ทำความสะอาดและสกัดสาร' },
      { id: '2', no: 2, itemName: 'Agarose Gel Electrophoresis Grade', quantity: '50 g', remarks: 'ใช้ทำเจลตรวจแยก DNA' },
      { id: '3', no: 3, itemName: 'Pipette Tips 10-200 µL (Yellow) พร้อมกล่อง Autoclave', quantity: '2 กล่อง', remarks: 'งานดูดจ่ายสาร' },
      { id: '4', no: 4, itemName: 'Microcentrifuge Tubes 1.5 mL (DNase/RNase Free)', quantity: '1 ถุง (500 หลอด)', remarks: 'เก็บตัวอย่าง PCR' },
    ]);
    setPickupDate(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
    setPickupTime('13:30');
    setApplicantSignature({
      name: 'นางสาวพิชญา สุขุมพันธ์',
      date: thaiDate.fullStr,
    });
    setAdvisorSignature({
      name: 'ผศ.ดร.ลักขณา ฉัตรทอง',
      date: thaiDate.fullStr,
    });
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!applicantName.trim()) {
      setErrorMsg('กรุณาระบุชื่อ-สกุล ผู้ขอใช้บริการ');
      return;
    }
    if (role === 'student' && !studentId.trim()) {
      setErrorMsg('กรุณาระบุรหัสนักศึกษา');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('กรุณาระบุเบอร์โทรศัพท์ติดต่อ');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('กรุณาระบุอีเมลที่ถูกต้อง');
      return;
    }
    if (!projectTitle.trim()) {
      setErrorMsg('กรุณาระบุชื่อโครงงาน/งานวิจัย');
      return;
    }

    const validItems = chemicalItems.filter((i) => i.itemName.trim() !== '');
    if (validItems.length === 0) {
      setErrorMsg('กรุณาระบุรายการสารเคมีหรือวัสดุวิทยาศาสตร์ที่ต้องการเบิกอย่างน้อย 1 รายการ');
      return;
    }
    if (!termsAccepted) {
      setErrorMsg('กรุณายินยอมปฏิบัติตามระเบียบการเบิกจ่ายสารเคมีและชำระค่าธรรมเนียมตามจริง');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      formType: 'VET_LAB_04' as const,
      submissionDateTh: thaiDate.fullStr,
      applicantName,
      role,
      studentId: role === 'student' ? studentId : undefined,
      otherRoleText: role === 'other' ? otherRoleText : undefined,
      department: department === 'อื่นๆ (ระบุ)' ? customDepartment : department,
      phone,
      email,
      workType,
      workTypeOtherText: workType === 'other' ? workTypeOtherText : undefined,
      projectTitle,
      chemicalItems: validItems,
      pickupDate,
      pickupTime,
      termsAccepted,
      applicantSignature: {
        name: applicantSignature.name || applicantName,
        date: applicantSignature.date || thaiDate.fullStr,
        dataUrl:
          applicantSignature.dataUrl ||
          generateElectronicSignatureDataUrl(
            applicantSignature.name || applicantName,
            'ผู้ขอใช้บริการ',
            applicantSignature.date || thaiDate.fullStr
          ),
      },
      advisorSignature: {
        name: advisorSignature.name || '-',
        date: advisorSignature.date || thaiDate.fullStr,
        dataUrl:
          advisorSignature.dataUrl ||
          (advisorSignature.name && advisorSignature.name !== '-' && !advisorSignature.name.startsWith('.')
            ? generateElectronicSignatureDataUrl(
                advisorSignature.name,
                'อาจารย์ที่ปรึกษา',
                advisorSignature.date || thaiDate.fullStr
              )
            : undefined),
      },
    };

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'เกิดข้อผิดพลาดในการส่งคำขอ');
      }

      // Sync to Google Apps Script if configured
      if (isGasConfigured() && isGasSyncEnabled()) {
        try {
          await submitToGoogleAppsScript(json.data || payload);
        } catch (gasErr) {
          console.warn('Google Apps Script submission warning:', gasErr);
        }
      }

      onSubmitSuccess(json.data, json.emailResult);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'ส่งคำขอไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    const validItems = chemicalItems.filter((i) => i.itemName.trim() !== '');
    const tempRequest: VetLabRequest = {
      id: 'temp-preview-04',
      trackingNo: 'VL04-DRAFT',
      formType: 'VET_LAB_04',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submissionDateTh: thaiDate.fullStr,
      applicantName: applicantName || 'ผู้ยื่นคำขอทดสอบ',
      role,
      studentId,
      department: department === 'อื่นๆ (ระบุ)' ? customDepartment : department,
      phone,
      email,
      workType,
      projectTitle: projectTitle || 'โครงงานวิจัยตัวอย่าง',
      chemicalItems: validItems.length > 0 ? validItems : [{ id: '1', no: 1, itemName: 'สารเคมีตัวอย่าง', quantity: '1', remarks: '' }],
      pickupDate,
      pickupTime,
      termsAccepted,
      applicantSignature: {
        ...applicantSignature,
        name: applicantSignature.name || applicantName,
      },
      advisorSignature,
    };
    onPreviewPrint(tempRequest);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 text-white p-6 sm:p-7 rounded-2xl shadow-md relative overflow-hidden mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider mb-2 border border-white/30">
              <FlaskConical className="w-3.5 h-3.5 text-purple-200" /> แบบฟอร์ม: VET.LAB 04
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              แบบขอเบิกจ่ายสารเคมีและวัสดุวิทยาศาสตร์
            </h1>
            <p className="text-purple-100 text-xs sm:text-sm mt-1">
              งานห้องปฏิบัติการ งานวิจัยและบริการวิชาการ คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น
            </p>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer backdrop-blur-xs active:scale-95"
            title="กรอกข้อมูลตัวอย่างสำหรับการทดสอบระบบ"
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> กรอกตัวอย่าง
          </button>
        </div>
        <div className="mt-5 pt-3.5 border-t border-white/20 flex flex-wrap items-center justify-between text-xs text-purple-100">
          <span>วันที่ยื่นคำขอ: <strong className="text-white font-bold">{thaiDate.fullStr}</strong></span>
          <span className="text-purple-100 font-semibold flex items-center gap-1.5 text-xs bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            ระบบบันทึกคำขอและคำนวณสรุปค่าใช้จ่ายเบิกจ่าย
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 shadow-xs">
          <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">โปรดตรวจสอบ:</strong> {errorMsg}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1 */}
        <div className="bg-white rounded-2xl shadow-xs border border-purple-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50/90 via-purple-50/50 to-indigo-50/40 px-6 py-4 border-b border-purple-100 flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-purple-950 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-xs flex items-center justify-center font-bold shadow-xs">1</span>
              ส่วนที่ 1 : สำหรับผู้ขอใช้บริการ (Applicant Information)
            </h2>
            <span className="text-xs text-purple-600 font-medium bg-purple-100/60 px-2.5 py-0.5 rounded-full">* จำเป็นต้องระบุ</span>
          </div>

          <div className="p-6 space-y-6">
            {/* Applicant Name & Role */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-7 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  ชื่อ-สกุล ผู้ขอใช้บริการ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="เช่น นางสาวพิชญา สุขุมพันธ์"
                  className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-800 text-xs sm:text-sm font-normal outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-5 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  สถานภาพ <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('faculty_staff')}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                      role === 'faculty_staff'
                        ? 'bg-purple-50 border-purple-600 text-purple-900 ring-2 ring-purple-500/20 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    อาจารย์/บุคลากร
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                      role === 'student'
                        ? 'bg-purple-50 border-purple-600 text-purple-900 ring-2 ring-purple-500/20 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    นักศึกษา
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('other')}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                      role === 'other'
                        ? 'bg-purple-50 border-purple-600 text-purple-900 ring-2 ring-purple-500/20 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    บุคคลภายนอก
                  </button>
                </div>
              </div>
            </div>

            {/* Student ID / Other */}
            {role === 'student' && (
              <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-xl shadow-2xs">
                <label className="text-xs font-bold text-purple-950 uppercase tracking-wider block mb-1">
                  รหัสนักศึกษา (Student ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="เช่น 665180045-8"
                  className="w-full md:w-1/2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs sm:text-sm font-normal focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>
            )}

            {role === 'other' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  ระบุหน่วยงาน/สถานภาพ
                </label>
                <input
                  type="text"
                  value={otherRoleText}
                  onChange={(e) => setOtherRoleText(e.target.value)}
                  placeholder="เช่น หน่วยงานภายนอก"
                  className="w-full md:w-1/2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs sm:text-sm font-normal focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>
            )}

            {/* Department, Phone, Email */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  สังกัด/ภาควิชา <span className="text-red-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-normal focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                >
                  {KKU_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                  <option value="อื่นๆ (ระบุ)">อื่นๆ (ระบุ)</option>
                </select>
                {department === 'อื่นๆ (ระบุ)' && (
                  <input
                    type="text"
                    value={customDepartment}
                    onChange={(e) => setCustomDepartment(e.target.value)}
                    placeholder="พิมพ์ชื่อสังกัด/หน่วยงาน"
                    className="w-full mt-2 px-3 py-2 text-xs border border-slate-200 rounded-md bg-white focus:ring-1 focus:ring-purple-500 outline-none"
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-purple-600" />
                  เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="เช่น 086-987-6543"
                  className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-800 text-xs sm:text-sm font-normal outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-600" />
                  E-mail (รับผลการอนุมัติ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="เช่น applicant@kku.ac.th"
                  className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-800 text-xs sm:text-sm font-normal outline-none"
                />
              </div>
            </div>

            {/* Work Type & Project Title */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  ประเภทงานที่ขอใช้บริการ <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'teaching', label: 'การเรียนการสอน' },
                    { id: 'research', label: 'งานวิจัย' },
                    { id: 'special_problem', label: 'ปัญหาพิเศษ' },
                    { id: 'other', label: 'อื่นๆ' },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        workType === item.id
                          ? 'bg-purple-50 border-purple-600 text-purple-950 font-bold ring-2 ring-purple-500/20 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="workType04"
                        checked={workType === item.id}
                        onChange={() => setWorkType(item.id as WorkType)}
                        className="accent-purple-600"
                      />
                      <span className="text-xs sm:text-sm">{item.label}</span>
                    </label>
                  ))}
                </div>
                {workType === 'other' && (
                  <input
                    type="text"
                    value={workTypeOtherText}
                    onChange={(e) => setWorkTypeOtherText(e.target.value)}
                    placeholder="ระบุประเภทงานอื่นๆ"
                    className="mt-2 w-full md:w-1/2 px-3 py-2 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-purple-500 outline-none"
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  ชื่อโครงงาน/งานวิจัย/กระบวนวิชา <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="เช่น การศึกษาแบคทีเรียดื้อยาในสัตว์..."
                  className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-800 text-xs sm:text-sm font-normal outline-none"
                />
              </div>
            </div>

            {/* Chemicals Table */}
            <div className="border-t border-slate-100 pt-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-purple-600" />
                    รายการสารเคมีและวัสดุวิทยาศาสตร์ที่ขอเบิก
                  </h3>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    เลือกจากรายการสารเคมีสำเร็จรูปหรือพิมพ์ระบุรายการและปริมาณที่ต้องการ
                  </span>
                </div>
                <button
                  type="button"
                  onClick={addChemicalRow}
                  className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3.5 py-1.5 rounded-xl border border-purple-200 transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" /> เพิ่มรายการ
                </button>
              </div>

              <div className="overflow-x-auto border border-purple-100 rounded-xl shadow-2xs">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gradient-to-r from-purple-50/80 to-indigo-50/40 text-purple-950 border-b border-purple-100 font-bold text-xs">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">ลำดับ</th>
                      <th className="py-2.5 px-3">ชื่อสารเคมี / วัสดุวิทยาศาสตร์</th>
                      <th className="py-2.5 px-3 w-32">จำนวน/ปริมาณ</th>
                      <th className="py-2.5 px-3 w-1/3">วัตถุประสงค์การใช้</th>
                      <th className="py-2.5 px-3 w-10 text-center">ลบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {chemicalItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                        <td className="py-2.5 px-3 text-center font-bold text-purple-600 text-xs">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            required
                            value={item.itemName}
                            onChange={(e) => updateChemicalRow(idx, 'itemName', e.target.value)}
                            onBlur={(e) => handleSelectPreset(idx, e.target.value)}
                            placeholder="พิมพ์หรือเลือกรายการสารเคมี"
                            list={`preset-chem-${idx}`}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-normal"
                          />
                          <datalist id={`preset-chem-${idx}`}>
                            {PRESET_CHEMICALS_04.map((c) => (
                              <option key={c.name} value={c.name}>
                                {c.defaultQty} - {c.defaultRemarks}
                              </option>
                            ))}
                          </datalist>
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={item.quantity}
                            onChange={(e) => updateChemicalRow(idx, 'quantity', e.target.value)}
                            placeholder="เช่น 1 ขวด (500 ml)"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={item.remarks}
                            onChange={(e) => updateChemicalRow(idx, 'remarks', e.target.value)}
                            placeholder="เช่น สกัดดีเอ็นเอ"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            disabled={chemicalItems.length <= 1}
                            onClick={() => removeChemicalRow(idx)}
                            className={`p-1 rounded-lg transition-colors cursor-pointer ${
                              chemicalItems.length <= 1
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-red-500 hover:bg-red-50'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pickup Schedule */}
            <div className="border-t border-slate-100 pt-5">
              <div className="bg-purple-50/40 p-4 rounded-xl border border-purple-100">
                <h4 className="text-xs sm:text-sm font-bold text-purple-950 flex items-center gap-1.5 mb-2.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  กำหนดวันและเวลาที่ประสงค์จะมารับสิ่งของ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      วันที่มารับ: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs sm:text-sm bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-normal"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      เวลาที่มารับ: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs sm:text-sm bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-normal"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Consent */}
            <div className="border-t border-slate-100 pt-5">
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs sm:text-sm leading-relaxed shadow-2xs">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-purple-600 rounded border-amber-300"
                  />
                  <span>
                    <strong>คำรับรอง:</strong> ข้าพเจ้าขอรับรองว่าจะนำสารเคมีและวัสดุที่ได้รับไปใช้เพื่อการศึกษา/วิจัยตามที่ระบุไว้เท่านั้น และยินดีชำระค่าธรรมเนียมตามระเบียบของคณะสัตวแพทยศาสตร์
                  </span>
                </label>
              </div>
            </div>

            {/* Signatures */}
            <div className="border-t border-slate-100 pt-5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                การลงลายมือชื่ออิเล็กทรอนิกส์ (Digital Signatures)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DigitalSignaturePad
                  label="ลายมือชื่อผู้ขอเบิกจ่าย"
                  subLabel="(Applicant Signature)"
                  required
                  value={applicantSignature}
                  onChange={setApplicantSignature}
                />
                <DigitalSignaturePad
                  label="ลายมือชื่ออาจารย์ที่ปรึกษา / ผู้รับผิดชอบ"
                  subLabel="(Advisor / Responsible Person Signature)"
                  value={advisorSignature}
                  onChange={setAdvisorSignature}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 & 3 Notice */}
        <div className="bg-gradient-to-r from-purple-50/60 to-indigo-50/40 rounded-xl border border-purple-200/80 p-5 text-xs text-slate-700 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-purple-900">
            <DollarSign className="w-4 h-4 text-purple-600" />
            ส่วนที่ 2 (หัวหน้าห้องปฏิบัติการ นางสุธิดา จันทร์ลุน อนุมัติ) และ ส่วนที่ 3 (เจ้าหน้าที่บันทึกการจ่ายของและสรุปค่าใช้จ่าย)
          </div>
          <p>
            • เจ้าหน้าที่จะจัดเตรียมสารเคมี/วัสดุตามรายการ และบันทึกสรุปค่าใช้จ่าย (รายการที่ 1-5) พร้อมส่งสำเนาสรุปให้ท่าน
          </p>
          <p className="text-purple-700 font-bold">
            * ระบบจะส่งการแจ้งเตือนทางอีเมลไปยัง <strong>{email || 'อีเมลผู้ขอ'}</strong> เมื่อพร้อมจ่ายของ
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={handlePreview}
            className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <FileText className="w-4 h-4 text-slate-500" /> ดูตัวอย่างเอกสาร (Print Preview)
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                กำลังบันทึกและส่งแจ้งเตือน...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> ส่งคำขอเบิกจ่าย (SUBMIT)
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
