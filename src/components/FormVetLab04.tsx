import React, { useState, useRef, useEffect } from 'react';
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
import { KKU_DEPARTMENTS } from '../data/presets';
import { DigitalSignaturePad } from './DigitalSignaturePad';
import { getCurrentThaiDateParts } from '../utils/thaiDate';
import { apiSubmitRequest } from '../utils/apiClient';
import { generateTypedSignatureDataUrl } from '../utils/signatureHelper';
import { saveFormDraft, loadFormDraft, clearFormDraft } from '../utils/formDrafts';

interface DraftVetLab04 {
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
  chemicalItems: ChemicalItem04[];
  pickupDate: string;
  pickupTime: string;
  termsAccepted: boolean;
  applicantSignature: SignatureData;
  advisorSignature: SignatureData;
}

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

  // Load existing draft if present
  const initialDraftRef = useRef(loadFormDraft<DraftVetLab04>('VET_LAB_04'));
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

  // Chemicals table - starts with 1 empty row
  const [chemicalItems, setChemicalItems] = useState<ChemicalItem04[]>(() => {
    if (initialDraft?.chemicalItems && initialDraft.chemicalItems.length > 0) return initialDraft.chemicalItems;
    return [
      {
        id: '1',
        no: 1,
        itemName: '',
        quantity: '',
        remarks: '',
      },
    ];
  });

  // Pickup date & time - starts blank
  const [pickupDate, setPickupDate] = useState(() => initialDraft?.pickupDate ?? '');
  const [pickupTime, setPickupTime] = useState(() => initialDraft?.pickupTime ?? '');

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
    const draftPayload: DraftVetLab04 = {
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
      chemicalItems,
      pickupDate,
      pickupTime,
      termsAccepted,
      applicantSignature,
      advisorSignature,
    };

    const timer = setTimeout(() => {
      saveFormDraft('VET_LAB_04', draftPayload);
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
    chemicalItems,
    pickupDate,
    pickupTime,
    termsAccepted,
    applicantSignature,
    advisorSignature,
  ]);

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

  const handleResetDraft = () => {
    if (window.confirm('คุณต้องการล้างข้อมูลที่ร่างไว้ทั้งหมด และเริ่มต้นกรอกใหม่ใช่หรือไม่?')) {
      clearFormDraft('VET_LAB_04');
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
      setChemicalItems([
        {
          id: '1',
          no: 1,
          itemName: '',
          quantity: '',
          remarks: '',
        },
      ]);
      setPickupDate('');
      setPickupTime('');
      setTermsAccepted(false);
      setApplicantSignature({ name: initialApplicantName || '', date: thaiDate.fullStr, dataUrl: '' });
      setAdvisorSignature({ name: '', date: thaiDate.fullStr, dataUrl: '' });
      setLastDraftSavedTime(null);
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
      dataUrl: '',
    });
    setAdvisorSignature({
      name: 'ศ.ดร.วินิจ ฉัตรชัย',
      date: thaiDate.fullStr,
      dataUrl: '',
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

    if (!applicantSignature.dataUrl) {
      setErrorMsg('กรุณาลงลายมือชื่อผู้ขอใช้บริการในช่องลงลายมือชื่อ');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      formType: 'VET_LAB_04' as const,
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
      chemicalItems: validItems,
      pickupDate,
      pickupTime,
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
      clearFormDraft('VET_LAB_04');
      onSubmitSuccess(result.data, result.emailResult);
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
      otherRoleText: (role === 'other' || role === 'external') ? otherRoleText : undefined,
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
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 text-white p-5 sm:p-7 lg:p-8 rounded-2xl sm:rounded-3xl shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider mb-2.5 border border-white/30">
              <FlaskConical className="w-4 h-4 text-purple-200" /> แบบฟอร์ม: VET.LAB 04
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              แบบขอเบิกจ่ายสารเคมีและวัสดุวิทยาศาสตร์
            </h1>
            <p className="text-purple-100 text-sm sm:text-base mt-1.5 leading-relaxed">
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
        <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between text-xs sm:text-sm text-purple-100 gap-2">
          <span>วันที่ยื่นคำขอ: <strong className="text-white font-bold">{thaiDate.fullStr}</strong></span>
          <button
            type="button"
            onClick={handleResetDraft}
            className="text-xs text-purple-200 hover:text-white underline hover:no-underline px-2 py-1 transition-colors cursor-pointer"
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
        {/* Section 1 */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-purple-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50/90 via-purple-50/50 to-indigo-50/40 px-6 sm:px-8 py-4 sm:py-5 border-b border-purple-100 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-purple-950 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-xs sm:text-sm flex items-center justify-center font-bold shadow-xs">1</span>
              ส่วนที่ 1 : สำหรับผู้ขอใช้บริการ (Applicant Information)
            </h2>
            <span className="text-xs sm:text-sm text-purple-700 font-bold bg-purple-100/70 px-3 py-1 rounded-full">* จำเป็นต้องระบุ</span>
          </div>

          <div className="p-5 sm:p-7 lg:p-8 space-y-6">
            {/* Applicant Name & Role */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
              <div className="md:col-span-7 space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  ชื่อ-สกุล ผู้ขอใช้บริการ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="เช่น นางสาวพิชญา สุขุมพันธ์"
                  className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-900 text-sm sm:text-base font-normal outline-none transition-colors"
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
                        ? 'bg-purple-50 border-purple-600 text-purple-900 ring-2 ring-purple-500/20 shadow-xs'
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
                        ? 'bg-purple-50 border-purple-600 text-purple-900 ring-2 ring-purple-500/20 shadow-xs'
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
                        ? 'bg-purple-50 border-purple-600 text-purple-900 ring-2 ring-purple-500/20 shadow-xs'
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
                        ? 'bg-purple-50 border-purple-600 text-purple-900 ring-2 ring-purple-500/20 shadow-xs'
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
              <div className="p-4 sm:p-5 bg-purple-50/70 border border-purple-100 rounded-2xl shadow-2xs">
                <label className="text-xs sm:text-sm font-bold text-purple-950 uppercase tracking-wider block mb-1.5">
                  รหัสนักศึกษา (Student ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="เช่น 665180045-8"
                  className="w-full md:w-1/2 px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-slate-200 text-sm sm:text-base font-normal focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>
            )}

            {/* Conditional input for External */}
            {role === 'external' && (
              <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl shadow-2xs">
                <label className="text-xs sm:text-sm font-bold text-slate-800 block mb-1.5">
                  ระบุหน่วยงาน / บริษัท / สังกัด
                </label>
                <input
                  type="text"
                  value={otherRoleText}
                  onChange={(e) => setOtherRoleText(e.target.value)}
                  placeholder="เช่น ศูนย์ชันสูตรโรคสัตว์, หน่วยงานภายนอก"
                  className="w-full md:w-1/2 px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-slate-200 text-sm sm:text-base font-normal focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
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
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm sm:text-base font-normal focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
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
                    className="w-full mt-2 px-3.5 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-purple-500 outline-none"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-purple-600" />
                  เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="เช่น 086-987-6543"
                  className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-900 text-sm sm:text-base font-normal outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-600" />
                  E-mail (รับผลการอนุมัติ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="เช่น applicant@kku.ac.th"
                  className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-900 text-sm sm:text-base font-normal outline-none"
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
                          ? 'bg-purple-50 border-purple-600 text-purple-950 font-bold ring-2 ring-purple-500/20 shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="workType04"
                        checked={workType === item.id}
                        onChange={() => setWorkType(item.id as WorkType)}
                        className="accent-purple-600 w-4 h-4"
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
                    className="mt-2.5 w-full md:w-1/2 px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-purple-500 outline-none"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  ชื่อโครงงาน/งานวิจัย/กระบวนวิชา <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="เช่น การศึกษาแบคทีเรียดื้อยาในสัตว์..."
                  className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-900 text-sm sm:text-base font-normal outline-none"
                />
              </div>
            </div>

            {/* Chemicals Table */}
            <div className="border-t border-slate-100 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-purple-600" />
                    รายการสารเคมีและวัสดุวิทยาศาสตร์ที่ขอเบิก
                  </h3>
                  <span className="text-xs text-slate-500 mt-0.5 block">
                    เลือกจากรายการสารเคมีสำเร็จรูปหรือพิมพ์ระบุรายการและปริมาณที่ต้องการ
                  </span>
                </div>
                <button
                  type="button"
                  onClick={addChemicalRow}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl border border-purple-200 transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" /> เพิ่มรายการ
                </button>
              </div>

              {/* Mobile Cards (Visible on screens < md) */}
              <div className="block md:hidden space-y-3">
                {chemicalItems.map((item, idx) => (
                  <div key={item.id} className="p-4 bg-purple-50/40 rounded-2xl border border-purple-200/80 space-y-3 relative shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-900 bg-purple-100 px-2.5 py-1 rounded-lg">
                        ลำดับที่ {idx + 1}
                      </span>
                      {chemicalItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChemicalRow(idx)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> ลบรายการ
                        </button>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">ชื่อสารเคมี / วัสดุวิทยาศาสตร์ <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={item.itemName}
                        onChange={(e) => updateChemicalRow(idx, 'itemName', e.target.value)}
                        placeholder="พิมพ์ระบุชื่อสารเคมี / วัสดุวิทยาศาสตร์"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">จำนวน/ปริมาณ <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={item.quantity}
                          onChange={(e) => updateChemicalRow(idx, 'quantity', e.target.value)}
                          placeholder="เช่น 1 ขวด (500 ml)"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">วัตถุประสงค์การใช้</label>
                        <input
                          type="text"
                          value={item.remarks}
                          onChange={(e) => updateChemicalRow(idx, 'remarks', e.target.value)}
                          placeholder="เช่น สกัดดีเอ็นเอ"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table (Visible on md+) */}
              <div className="hidden md:block overflow-x-auto border border-purple-100 rounded-2xl shadow-2xs">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gradient-to-r from-purple-50/80 to-indigo-50/40 text-purple-950 border-b border-purple-100 font-bold text-xs sm:text-sm">
                    <tr>
                      <th className="py-3 px-3 w-16 sm:w-20 text-center whitespace-nowrap">ลำดับ</th>
                      <th className="py-3 px-3.5">ชื่อสารเคมี / วัสดุวิทยาศาสตร์</th>
                      <th className="py-3 px-3.5 w-36">จำนวน/ปริมาณ</th>
                      <th className="py-3 px-3.5 w-1/3">วัตถุประสงค์การใช้</th>
                      <th className="py-3 px-3.5 w-12 text-center">ลบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {chemicalItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                        <td className="py-3 px-3 text-center font-bold text-purple-600 text-sm whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3.5">
                          <input
                            type="text"
                            required
                            value={item.itemName}
                            onChange={(e) => updateChemicalRow(idx, 'itemName', e.target.value)}
                            placeholder="พิมพ์ระบุชื่อสารเคมี / วัสดุวิทยาศาสตร์"
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-normal"
                          />
                        </td>
                        <td className="py-3 px-3.5">
                          <input
                            type="text"
                            value={item.quantity}
                            onChange={(e) => updateChemicalRow(idx, 'quantity', e.target.value)}
                            placeholder="เช่น 1 ขวด (500 ml)"
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                          />
                        </td>
                        <td className="py-3 px-3.5">
                          <input
                            type="text"
                            value={item.remarks}
                            onChange={(e) => updateChemicalRow(idx, 'remarks', e.target.value)}
                            placeholder="เช่น สกัดดีเอ็นเอ"
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                          />
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <button
                            type="button"
                            disabled={chemicalItems.length <= 1}
                            onClick={() => removeChemicalRow(idx)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
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
            <div className="border-t border-slate-100 pt-6">
              <div className="bg-purple-50/40 p-5 rounded-2xl border border-purple-100">
                <h4 className="text-sm sm:text-base font-bold text-purple-950 flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  กำหนดวันและเวลาที่ประสงค์จะมารับสิ่งของ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-800 block">
                      วันที่มารับ: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-normal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-purple-600" />
                      เวลาที่มารับ: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-normal"
                    />
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
                    className="mt-1 h-4 w-4 accent-purple-600 rounded border-amber-300 shrink-0"
                  />
                  <span>
                    <strong>คำรับรอง:</strong> ข้าพเจ้าขอรับรองว่าจะนำสารเคมีและวัสดุที่ได้รับไปใช้เพื่อการศึกษา/วิจัยตามที่ระบุไว้เท่านั้น และยินดีชำระค่าธรรมเนียมตามระเบียบของคณะสัตวแพทยศาสตร์
                  </span>
                </label>
              </div>
            </div>

            {/* Signatures */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                การลงลายมือชื่ออิเล็กทรอนิกส์ (Digital Signatures)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
        <div className="bg-gradient-to-r from-purple-50/70 to-indigo-50/50 rounded-2xl border border-purple-200/80 p-5 sm:p-6 text-xs sm:text-sm text-slate-700 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-purple-950 text-sm sm:text-base">
            <DollarSign className="w-5 h-5 text-purple-600" />
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
            className="w-full sm:w-auto px-7 py-3 text-sm sm:text-base font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
