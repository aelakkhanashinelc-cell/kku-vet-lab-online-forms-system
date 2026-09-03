import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
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
  CheckCircle2,
} from 'lucide-react';
import { VetLabRequest, LabItem02, ApplicantRole, WorkType, TimeSlot, SignatureData } from '../types';
import { PRESET_LABS_02, KKU_DEPARTMENTS } from '../data/presets';
import { DigitalSignaturePad } from './DigitalSignaturePad';
import { getCurrentThaiDateParts, calculateDaysBetween } from '../utils/thaiDate';
import { apiSubmitRequest } from '../utils/apiClient';
import { generateTypedSignatureDataUrl } from '../utils/signatureHelper';
import { saveFormDraft, loadFormDraft, clearFormDraft } from '../utils/formDrafts';

interface DraftVetLab02 {
  applicantName: string;
  role: ApplicantRole;
  studentId: string;
  otherRoleText: string;
  department: string;
  customDepartment: string;
  phone: string;
  email: string;
  workType: WorkType;
  workTypeOtherText: string;
  projectTitle: string;
  labItems: LabItem02[];
  timeSlot: TimeSlot;
  startDate: string;
  endDate: string;
  durationDays: number;
  termsAccepted: boolean;
  applicantSignature: SignatureData;
  advisorSignature: SignatureData;
}

interface FormVetLab02Props {
  onSubmitSuccess: (request: VetLabRequest, emailResult: any) => void;
  onPreviewPrint: (request: VetLabRequest) => void;
  initialApplicantName?: string;
  initialEmail?: string;
  initialPhone?: string;
  initialDepartment?: string;
  initialStudentId?: string;
}

export const FormVetLab02: React.FC<FormVetLab02Props> = ({
  onSubmitSuccess,
  onPreviewPrint,
  initialApplicantName = '',
  initialEmail = '',
  initialPhone = '',
  initialDepartment = '',
  initialStudentId = '',
}) => {
  const thaiDate = getCurrentThaiDateParts();

  // Load existing draft if present
  const initialDraftRef = useRef(loadFormDraft<DraftVetLab02>('VET_LAB_02'));
  const initialDraft = initialDraftRef.current?.data;

  // Part 1 States - Only applicantName and email from login, all other fields start blank
  const [applicantName, setApplicantName] = useState(() => initialDraft?.applicantName ?? initialApplicantName);
  const [role, setRole] = useState<ApplicantRole>(() => initialDraft?.role ?? ('' as any));
  const [studentId, setStudentId] = useState(() => initialDraft?.studentId ?? '');
  const [otherRoleText, setOtherRoleText] = useState(() => initialDraft?.otherRoleText ?? '');
  const [department, setDepartment] = useState(() => initialDraft?.department ?? '');
  const [customDepartment, setCustomDepartment] = useState(() => initialDraft?.customDepartment ?? '');
  const [phone, setPhone] = useState(() => initialDraft?.phone ?? '');
  const [email, setEmail] = useState(() => initialDraft?.email ?? initialEmail);
  const [workType, setWorkType] = useState<WorkType>(() => initialDraft?.workType ?? ('' as any));
  const [workTypeOtherText, setWorkTypeOtherText] = useState(() => initialDraft?.workTypeOtherText ?? '');
  const [projectTitle, setProjectTitle] = useState(() => initialDraft?.projectTitle ?? '');

  // Lab items table - starts with 1 empty row
  const [labItems, setLabItems] = useState<LabItem02[]>(() => {
    if (initialDraft?.labItems && initialDraft.labItems.length > 0) return initialDraft.labItems;
    return [{ id: '1', no: 1, labName: '', remarks: '' }];
  });

  // Duration & schedule - starts blank
  const [timeSlot, setTimeSlot] = useState<TimeSlot>(() => initialDraft?.timeSlot ?? ('' as any));
  const [startDate, setStartDate] = useState(() => initialDraft?.startDate ?? '');
  const [endDate, setEndDate] = useState(() => initialDraft?.endDate ?? '');
  const [durationDays, setDurationDays] = useState<number>(() => initialDraft?.durationDays ?? 0);

  // Acknowledgement & Signatures
  const [termsAccepted, setTermsAccepted] = useState(() => initialDraft?.termsAccepted ?? false);
  const [applicantSignature, setApplicantSignature] = useState<SignatureData>(() => initialDraft?.applicantSignature ?? {
    name: initialApplicantName || '',
    date: thaiDate.fullStr,
    dataUrl: '',
  });
  const [advisorSignature, setAdvisorSignature] = useState<SignatureData>(() => initialDraft?.advisorSignature ?? {
    name: '',
    date: thaiDate.fullStr,
    dataUrl: '',
  });

  const [lastDraftSavedTime, setLastDraftSavedTime] = useState<string | null>(() => {
    if (initialDraftRef.current?.savedAt) {
      return new Date(initialDraftRef.current.savedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    }
    return null;
  });

  // Auto-sync applicantName into applicantSignature.name if user hasn't typed a different name
  const prevApplicantNameRef = useRef(applicantName);
  useEffect(() => {
    if (!applicantSignature.name || applicantSignature.name === prevApplicantNameRef.current) {
      setApplicantSignature((prev) => ({ ...prev, name: applicantName }));
    }
    prevApplicantNameRef.current = applicantName;
  }, [applicantName]);

  // Auto-save draft on changes (debounced)
  useEffect(() => {
    const draftPayload: DraftVetLab02 = {
      applicantName,
      role,
      studentId,
      otherRoleText,
      department,
      customDepartment,
      phone,
      email,
      workType,
      workTypeOtherText,
      projectTitle,
      labItems,
      timeSlot,
      startDate,
      endDate,
      durationDays,
      termsAccepted,
      applicantSignature,
      advisorSignature,
    };

    const timer = setTimeout(() => {
      saveFormDraft('VET_LAB_02', draftPayload);
      const now = new Date();
      setLastDraftSavedTime(now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
    }, 400);

    return () => clearTimeout(timer);
  }, [
    applicantName,
    role,
    studentId,
    otherRoleText,
    department,
    customDepartment,
    phone,
    email,
    workType,
    workTypeOtherText,
    projectTitle,
    labItems,
    timeSlot,
    startDate,
    endDate,
    durationDays,
    termsAccepted,
    applicantSignature,
    advisorSignature,
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Recalculate duration when dates change
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStartDate(val);
    const days = calculateDaysBetween(val, endDate);
    setDurationDays(days);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEndDate(val);
    const days = calculateDaysBetween(startDate, val);
    setDurationDays(days);
  };

  const addLabRow = () => {
    setLabItems((prev) => [
      ...prev,
      { id: String(Date.now()), no: prev.length + 1, labName: '', remarks: '' },
    ]);
  };

  const removeLabRow = (index: number) => {
    if (labItems.length <= 1) return;
    const updated = labItems.filter((_, i) => i !== index).map((item, i) => ({ ...item, no: i + 1 }));
    setLabItems(updated);
  };

  const updateLabRow = (index: number, field: keyof LabItem02, value: string) => {
    setLabItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleResetDraft = () => {
    if (window.confirm('คุณต้องการล้างข้อมูลที่ร่างไว้ทั้งหมด และเริ่มต้นกรอกใหม่ใช่หรือไม่?')) {
      clearFormDraft('VET_LAB_02');
      setApplicantName(initialApplicantName);
      setRole('' as any);
      setStudentId('');
      setOtherRoleText('');
      setDepartment('');
      setCustomDepartment('');
      setPhone('');
      setEmail(initialEmail);
      setWorkType('' as any);
      setWorkTypeOtherText('');
      setProjectTitle('');
      setLabItems([{ id: '1', no: 1, labName: '', remarks: '' }]);
      setTimeSlot('' as any);
      setStartDate('');
      setEndDate('');
      setDurationDays(0);
      setTermsAccepted(false);
      setApplicantSignature({ name: initialApplicantName || '', date: thaiDate.fullStr, dataUrl: '' });
      setAdvisorSignature({ name: '', date: thaiDate.fullStr, dataUrl: '' });
      setLastDraftSavedTime(null);
    }
  };

  const handleFillDemo = () => {
    setApplicantName('ผศ.ดร.สมชาย เจริญสุข');
    setRole('faculty_staff');
    setDepartment('กลุ่มวิชาพยาธิชีววิทยา (Pathobiology)');
    setPhone('081-456-7890');
    setEmail('somchai.c@kku.ac.th');
    setWorkType('research');
    setProjectTitle('การศึกษาการแสดงออกของยีนต้านการอักเสบในสุนัข');
    setLabItems([
      { id: '1', no: 1, labName: 'ห้องปฏิบัติการพยาธิวิทยาคลินิก (Clinical Pathology Lab)', remarks: 'เตรียมสไลด์ตัวอย่าง H&E' },
      { id: '2', no: 2, labName: 'ห้องปฏิบัติการชีววิทยาระดับโมเลกุล (Molecular Biology Lab)', remarks: 'ตรวจวิเคราะห์ RT-PCR' },
    ]);
    setTimeSlot('official_hours');
    setApplicantSignature({
      name: 'ผศ.ดร.สมชาย เจริญสุข',
      date: thaiDate.fullStr,
      dataUrl: '',
    });
    setAdvisorSignature({
      name: 'รศ.ดร.ประสิทธิ์ วงศ์วิชา',
      date: thaiDate.fullStr,
      dataUrl: '',
    });
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!applicantName.trim()) {
      setErrorMsg('กรุณาระบุชื่อ-สกุล ผู้ขอใช้บริการ');
      return;
    }
    if (role === 'student' && !studentId.trim()) {
      setErrorMsg('กรุณาระบุรหัสนักศึกษา');
      return;
    }
    if (role === 'other' && !otherRoleText.trim()) {
      setErrorMsg('กรุณาระบุสถานภาพ');
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
      setErrorMsg('กรุณาระบุชื่อโครงงาน/งานวิจัย/กระบวนวิชา');
      return;
    }

    const validLabItems = labItems.filter((i) => i.labName.trim() !== '');
    if (validLabItems.length === 0) {
      setErrorMsg('กรุณาระบุห้องปฏิบัติการที่ต้องการขอใช้อย่างน้อย 1 ห้อง');
      return;
    }

    if (durationDays > 31) {
      setErrorMsg('ระยะเวลาการขอใช้ต้องไม่เกิน 1 เดือน (31 วัน) ตามระเบียบข้อ 2.4');
      return;
    }

    if (!termsAccepted) {
      setErrorMsg('กรุณายอมรับระเบียบข้อบังคับการใช้ห้องปฏิบัติการ');
      return;
    }

    if (!applicantSignature.dataUrl) {
      setErrorMsg('กรุณาลงลายมือชื่อผู้ขอใช้บริการในช่องลงลายมือชื่อ');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      formType: 'VET_LAB_02' as const,
      submissionDateTh: thaiDate.fullStr,
      applicantName,
      role,
      studentId: role === 'student' ? studentId : undefined,
      otherRoleText: (role === 'other' || role === 'external') ? otherRoleText : undefined,
      department: department === 'อื่นๆ (ระบุ)' ? customDepartment : department,
      phone,
      email,
      workType,
      workTypeOtherText: workType === 'other' ? workTypeOtherText : undefined,
      projectTitle,
      labItems: validLabItems,
      timeSlot,
      durationDays,
      startDate,
      endDate,
      termsAccepted,
      applicantSignature: {
        name: applicantSignature.name || applicantName,
        date: applicantSignature.date || thaiDate.fullStr,
        dataUrl: applicantSignature.dataUrl || '',
      },
      advisorSignature: {
        name: advisorSignature.name || '-',
        date: advisorSignature.date || thaiDate.fullStr,
        dataUrl: advisorSignature.dataUrl || undefined,
      },
    };

    try {
      const result = await apiSubmitRequest(payload);
      clearFormDraft('VET_LAB_02');
      onSubmitSuccess(result.data, result.emailResult);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'ส่งคำขอไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    const validLabItems = labItems.filter((i) => i.labName.trim() !== '');
    const tempRequest: VetLabRequest = {
      id: 'temp-preview',
      trackingNo: 'VL02-DRAFT',
      formType: 'VET_LAB_02',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submissionDateTh: thaiDate.fullStr,
      applicantName: applicantName || 'ผู้ยื่นคำขอทดสอบ',
      role,
      studentId,
      otherRoleText: (role === 'other' || role === 'external') ? otherRoleText : undefined,
      department: department === 'อื่นๆ (ระบุ)' ? customDepartment : department,
      phone,
      email,
      workType,
      projectTitle: projectTitle || 'โครงงานวิจัยตัวอย่าง',
      labItems: validLabItems.length > 0 ? validLabItems : [{ id: '1', no: 1, labName: 'ห้องปฏิบัติการตัวอย่าง', remarks: '' }],
      timeSlot,
      durationDays,
      startDate,
      endDate,
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
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Form Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-5 sm:p-7 lg:p-8 rounded-2xl sm:rounded-3xl shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider mb-2.5 border border-white/30">
              <Building2 className="w-4 h-4 text-blue-200" /> แบบฟอร์ม: VET.LAB 02
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              แบบขอใช้ห้องปฏิบัติการ คณะสัตวแพทยศาสตร์
            </h1>
            <p className="text-blue-100 text-sm sm:text-base mt-1.5 leading-relaxed">
              งานห้องปฏิบัติการ งานวิจัยและบริการวิชาการ คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น
            </p>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer backdrop-blur-xs active:scale-95"
            title="กรอกข้อมูลตัวอย่างสำหรับการทดสอบระบบ"
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> กรอกตัวอย่าง
          </button>
        </div>
        <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between text-xs sm:text-sm text-blue-100 gap-2">
          <span>วันที่ยื่นคำขอ: <strong className="text-white font-bold">{thaiDate.fullStr}</strong></span>
          <button
            type="button"
            onClick={handleResetDraft}
            className="text-xs text-blue-200 hover:text-white underline hover:no-underline px-2 py-1 transition-colors cursor-pointer"
            title="ล้างข้อมูลที่กรอกค้างไว้และเริ่มใหม่"
          >
            ล้างข้อมูลร่าง
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 sm:p-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 shadow-xs">
          <Info className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">โปรดตรวจสอบ:</strong> {errorMsg}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
        {/* Section 1: Applicant Information */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50/90 via-blue-50/50 to-indigo-50/40 px-6 sm:px-8 py-4 sm:py-5 border-b border-blue-100 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-blue-950 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs sm:text-sm flex items-center justify-center font-bold shadow-xs">1</span>
              ส่วนที่ 1 : สำหรับผู้ขอใช้บริการ (Applicant Information)
            </h2>
            <span className="text-xs sm:text-sm text-blue-700 font-bold bg-blue-100/70 px-3 py-1 rounded-full">* จำเป็นต้องระบุ</span>
          </div>

          <div className="p-5 sm:p-7 lg:p-8 space-y-6">
            {/* Applicant Name & Role */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
              <div className="md:col-span-7 space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  ชื่อ-สกุล ผู้ขอใช้บริการ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="เช่น ผศ.ดร.สมชาย เจริญสุข หรือ นายรักเรียน เพียรศึกษา"
                  className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-sm sm:text-base font-normal outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-5 space-y-2">
                <label className="text-sm font-semibold text-slate-800 block">
                  สถานภาพ <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('faculty_staff')}
                    className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold border text-center transition-all cursor-pointer ${
                      role === 'faculty_staff'
                        ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    อาจารย์/บุคลากร
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold border text-center transition-all cursor-pointer ${
                      role === 'student'
                        ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    นักศึกษา
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('external')}
                    className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold border text-center transition-all cursor-pointer ${
                      role === 'external'
                        ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    บุคคลภายนอก
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('other')}
                    className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold border text-center transition-all cursor-pointer ${
                      role === 'other'
                        ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    อื่นๆ
                  </button>
                </div>
              </div>
            </div>

            {/* Conditional input for Student ID */}
            {role === 'student' && (
              <div className="p-4 sm:p-5 bg-blue-50/70 border border-blue-100 rounded-2xl shadow-2xs">
                <label className="text-xs sm:text-sm font-bold text-blue-950 uppercase tracking-wider block mb-1.5">
                  รหัสนักศึกษา (Student ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="เช่น 653180123-4"
                  className="w-full md:w-1/2 px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-slate-200 text-sm sm:text-base font-normal focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            )}

            {/* Conditional input for External */}
            {role === 'external' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ระบุหน่วยงาน / บริษัท / สังกัด
                </label>
                <input
                  type="text"
                  value={otherRoleText}
                  onChange={(e) => setOtherRoleText(e.target.value)}
                  placeholder="เช่น บริษัท ไบโอเทค จำกัด, หน่วยงานภายนอก"
                  className="w-full md:w-1/2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs sm:text-sm font-normal focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            )}

            {/* Conditional input for Other */}
            {role === 'other' && (
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl shadow-2xs">
                <label className="text-xs font-bold text-amber-950 block mb-1">
                  ระบุสถานภาพ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={otherRoleText}
                  onChange={(e) => setOtherRoleText(e.target.value)}
                  placeholder="เช่น นักวิจัย, ผู้ช่วยวิจัย, แพทย์ประจำบ้าน, นักเรียนแลกเปลี่ยน"
                  className="w-full md:w-1/2 px-3 py-2 bg-white rounded-lg border border-amber-300 text-xs sm:text-sm font-normal focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>
            )}

            {/* Department, Phone, Email */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 block">
                  สังกัด/ภาควิชา <span className="text-red-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm sm:text-base font-normal focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="">-- กรุณาเลือกสังกัด/สาขาวิชา --</option>
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
                    className="w-full mt-2 px-3.5 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="เช่น 081-234-5678"
                  className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-sm sm:text-base font-normal outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  E-mail (รับผลการอนุมัติ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="เช่น user@kku.ac.th"
                  className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-sm sm:text-base font-normal outline-none"
                />
              </div>
            </div>

            {/* Work Type & Project Title */}
            <div className="border-t border-slate-100 pt-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-800 block mb-2.5">
                  ประเภทงานที่ขอใช้บริการ <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'teaching', label: 'การเรียนการสอน' },
                    { id: 'research', label: 'งานวิจัย' },
                    { id: 'special_problem', label: 'ปัญหาพิเศษ' },
                    { id: 'other', label: 'อื่นๆ' },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        workType === item.id
                          ? 'bg-blue-50 border-blue-600 text-blue-950 font-bold ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="workType02"
                        checked={workType === item.id}
                        onChange={() => setWorkType(item.id as WorkType)}
                        className="accent-blue-600 w-4 h-4"
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
                    className="mt-2.5 w-full md:w-1/2 px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  ชื่อโครงงาน/งานวิจัย/กระบวนวิชา <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="เช่น วิชา 715 421 หรือ โครงการศึกษาผลของสารสกัดสมุนไพร..."
                  className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-sm sm:text-base font-normal outline-none"
                />
              </div>
            </div>

            {/* Laboratory Table */}
            <div className="border-t border-slate-100 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    รายการห้องปฏิบัติการที่ขอใช้
                  </h3>
                  <span className="text-xs text-slate-500 mt-0.5 inline-block">
                    * สามารถเลือกจากรายการสำเร็จรูปหรือพิมพ์ระบุได้อิสระ
                  </span>
                </div>
                <button
                  type="button"
                  onClick={addLabRow}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl border border-blue-200 transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" /> เพิ่มห้องปฏิบัติการ
                </button>
              </div>

              {/* Mobile Cards (Visible on screens < md) */}
              <div className="block md:hidden space-y-3">
                {labItems.map((item, idx) => (
                  <div key={item.id} className="p-4 bg-blue-50/40 rounded-2xl border border-blue-200/80 space-y-3 relative shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 bg-blue-100 px-2.5 py-1 rounded-lg">
                        ลำดับที่ {idx + 1}
                      </span>
                      {labItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLabRow(idx)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> ลบรายการ
                        </button>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">ชื่อห้องปฏิบัติการ <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={item.labName}
                        onChange={(e) => updateLabRow(idx, 'labName', e.target.value)}
                        placeholder="เลือกหรือพิมพ์ชื่อห้องปฏิบัติการ"
                        list={`preset-labs-m-${idx}`}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                      <datalist id={`preset-labs-m-${idx}`}>
                        {PRESET_LABS_02.map((p) => (
                          <option key={p} value={p} />
                        ))}
                      </datalist>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">หมายเหตุ / กิจกรรมที่ทำ</label>
                      <input
                        type="text"
                        value={item.remarks}
                        onChange={(e) => updateLabRow(idx, 'remarks', e.target.value)}
                        placeholder="เช่น ย้อมสีเซลล์, สกัด DNA"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table (Visible on md+) */}
              <div className="hidden md:block overflow-x-auto border border-blue-100 rounded-2xl shadow-2xs">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gradient-to-r from-blue-50/80 to-indigo-50/40 text-blue-950 border-b border-blue-100 font-bold text-xs sm:text-sm">
                    <tr>
                      <th className="py-3 px-3 w-16 sm:w-20 text-center whitespace-nowrap">ลำดับ</th>
                      <th className="py-3 px-3.5">ชื่อห้องปฏิบัติการ</th>
                      <th className="py-3 px-3.5 w-1/3">หมายเหตุ/กิจกรรมที่ทำ</th>
                      <th className="py-3 px-3.5 w-12 text-center">ลบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {labItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-3 px-3 text-center font-bold text-blue-600 text-sm whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="space-y-1">
                            <input
                              type="text"
                              required
                              value={item.labName}
                              onChange={(e) => updateLabRow(idx, 'labName', e.target.value)}
                              placeholder="เลือกหรือพิมพ์ชื่อห้องปฏิบัติการ"
                              list={`preset-labs-${idx}`}
                              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                            <datalist id={`preset-labs-${idx}`}>
                              {PRESET_LABS_02.map((p) => (
                                <option key={p} value={p} />
                              ))}
                            </datalist>
                          </div>
                        </td>
                        <td className="py-3 px-3.5">
                          <input
                            type="text"
                            value={item.remarks}
                            onChange={(e) => updateLabRow(idx, 'remarks', e.target.value)}
                            placeholder="เช่น ย้อมสีเซลล์, สกัด DNA"
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                          />
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <button
                            type="button"
                            disabled={labItems.length <= 1}
                            onClick={() => removeLabRow(idx)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              labItems.length <= 1
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

            {/* Time Slot & Duration Schedule */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-2 sm:col-span-1">
                  <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    ช่วงเวลาที่ขอใช้ <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2.5">
                    <label className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                      <input
                        type="radio"
                        name="timeSlot02"
                        value="official_hours"
                        checked={timeSlot === 'official_hours'}
                        onChange={() => setTimeSlot('official_hours')}
                        className="accent-blue-600 w-4 h-4"
                      />
                      <span className="font-normal">ในเวลาราชการ (08.30 - 16.30 น.)</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 cursor-pointer p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                      <input
                        type="radio"
                        name="timeSlot02"
                        value="after_hours"
                        checked={timeSlot === 'after_hours'}
                        onChange={() => setTimeSlot('after_hours')}
                        className="accent-blue-600 w-4 h-4"
                      />
                      <span className="font-normal">นอกเวลาราชการ/วันหยุด</span>
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/40 p-5 rounded-2xl border border-blue-100">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      ตั้งแต่วันที่
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={handleStartDateChange}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-normal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      ถึงวันที่
                    </label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={handleEndDateChange}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-normal"
                    />
                  </div>

                  <div className="sm:col-span-2 text-xs sm:text-sm text-slate-700 flex items-center justify-between pt-3 border-t border-blue-100">
                    <span>
                      รวมระยะเวลา: <strong className="text-blue-700 text-base font-bold">{durationDays}</strong> วัน
                    </span>
                    {durationDays > 31 ? (
                      <span className="text-red-600 font-bold px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200">เกินกำหนด 1 เดือน</span>
                    ) : (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">อยู่ในเกณฑ์ระเบียบ</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Consent */}
            <div className="border-t border-slate-100 pt-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-sm sm:text-base leading-relaxed shadow-2xs">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-blue-600 rounded border-amber-300 shrink-0"
                  />
                  <span>
                    <strong>คำรับรอง:</strong> ข้าพเจ้าได้รับทราบและยินยอมปฏิบัติตามระเบียบการใช้ห้องปฏิบัติการ (VET.LAB 01) ทุกประการ โดยจะรักษาความสะอาด ความปลอดภัย และชดใช้ค่าเสียหายหากเกิดการชำรุดเสียหายจากการใช้งาน
                  </span>
                </label>
              </div>
            </div>

            {/* Digital Signatures */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                การลงลายมือชื่ออิเล็กทรอนิกส์ (Digital Signatures)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <DigitalSignaturePad
                  label="ลายมือชื่อผู้ขอใช้บริการ"
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

        {/* Informative Preview of Section 2 & 3 */}
        <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/50 rounded-2xl border border-blue-200/80 p-5 sm:p-6 text-xs sm:text-sm text-slate-700 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-blue-950 text-sm sm:text-base">
            <Info className="w-5 h-5 text-blue-600" />
            ขั้นตอนการพิจารณาต่อไป (ส่วนที่ 2 และ 3)
          </div>
          <p>
            • <strong>ส่วนที่ 2:</strong> การพิจารณาของหัวหน้าห้องปฏิบัติการ (<strong>นางสุธิดา จันทร์ลุน</strong> - ระบบจะส่งอีเมลแจ้งเตือนพร้อมลิงก์พิจารณาโดยอัตโนมัติ)
          </p>
          <p>
            • <strong>ส่วนที่ 3:</strong> นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบตรวจสอบความเรียบร้อยและความพร้อม
          </p>
          <p className="text-blue-700 font-bold">
            * ผลการพิจารณาจะถูกส่งกลับไปยังอีเมล <strong>{email || 'ที่ท่านระบุ'}</strong> ทันทีที่มีการบันทึก
          </p>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handlePreview}
            className="w-full sm:w-auto px-5 py-3 text-sm sm:text-base font-semibold rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <FileText className="w-4 h-4 text-slate-500" /> ดูตัวอย่างเอกสาร (Print Preview)
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-7 py-3 text-sm sm:text-base font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                กำลังบันทึกและส่งแจ้งเตือน...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> ส่งคำขอใช้บริการ (SUBMIT)
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
