import React, { useRef, useState } from 'react';
import { X, FileDown, CheckCircle, ShieldCheck, Info, Loader2 } from 'lucide-react';
import { VetLabRequest, SignatureData } from '../types';
import { generateTypedSignatureDataUrl, generateElectronicSignatureDataUrl } from '../utils/signatureHelper';
// @ts-ignore
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

interface PrintableDocumentProps {
  request: VetLabRequest;
  onClose: () => void;
}

const RenderSignatureStamp: React.FC<{
  signature?: SignatureData;
  fallbackName?: string;
  fallbackDate?: string;
  roleLabel?: string;
  isApproved?: boolean;
}> = ({ signature, fallbackName, fallbackDate, roleLabel = 'ผู้ลงนาม', isApproved = true }) => {
  const name = (signature?.name || fallbackName || '').trim();
  const date = signature?.date || fallbackDate || '';
  const hasDrawnUrl = !!signature?.dataUrl && signature.dataUrl.startsWith('data:image');

  if (!isApproved || !hasDrawnUrl || !name || name === '-' || name.startsWith('.')) {
    return (
      <div className="h-14 flex items-center justify-center text-slate-400 text-[11px] italic text-center w-full">
        (ลงชื่อ)....................................................
      </div>
    );
  }

  return (
    <div className="h-14 flex items-center justify-center w-full overflow-hidden">
      <img
        src={signature!.dataUrl}
        alt={name}
        className="h-12 max-h-12 max-w-[210px] object-contain mx-auto block"
      />
    </div>
  );
};

export const PrintableDocument: React.FC<PrintableDocumentProps> = ({ request, onClose }) => {
  const printContentRef = useRef<HTMLDivElement | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const getFormCode = () => {
    switch (request.formType) {
      case 'VET_LAB_01':
        return 'VET.LAB 01';
      case 'VET_LAB_02':
        return 'VET.LAB 02';
      case 'VET_LAB_03':
        return 'VET.LAB 03';
      case 'VET_LAB_04':
        return 'VET.LAB 04';
      default:
        return 'VET.LAB';
    }
  };

  const getFormTitle = () => {
    switch (request.formType) {
      case 'VET_LAB_01':
        return 'แบบรับทราบระเบียบการใช้ห้องปฏิบัติการ';
      case 'VET_LAB_02':
        return 'แบบขอใช้ห้องปฏิบัติการ';
      case 'VET_LAB_03':
        return 'แบบขอใช้เครื่องมือวิทยาศาสตร์';
      case 'VET_LAB_04':
        return 'แบบขอเบิกจ่ายสารเคมีและวัสดุวิทยาศาสตร์';
      default:
        return 'แบบฟอร์มขอรับบริการห้องปฏิบัติการ';
    }
  };

  // Direct PDF Generation & Download with strict 1-page A4 scaling (Device & Screen independent)
  const handleSavePdf = async () => {
    if (!printContentRef.current || isGeneratingPdf) return;
    try {
      setIsGeneratingPdf(true);
      const formCode = getFormCode().replace(/\s+/g, '_');
      const cleanTrackingNo = request.trackingNo || 'FORM';
      const filename = `แบบฟอร์ม_${cleanTrackingNo}_${formCode}.pdf`;

      // Render at fixed standard A4 width (794px = 210mm @ 96DPI) regardless of mobile viewport
      const canvas = await html2canvas(printContentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
        windowHeight: 1440,
        onclone: (clonedDoc: Document) => {
          const el = clonedDoc.getElementById('printable-document-content');
          if (el) {
            el.style.width = '794px';
            el.style.minWidth = '794px';
            el.style.maxWidth = '794px';
            el.style.padding = '32px';
            el.style.boxSizing = 'border-box';
            el.style.position = 'static';
            el.style.transform = 'none';
            el.style.margin = '0 auto';
            el.style.backgroundColor = '#ffffff';
            el.style.color = '#000000';
          }
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const canvasRatio = canvasHeight / canvasWidth;

      // Fit strictly within 1 A4 Page with exact margins
      let renderWidth = pdfWidth;
      let renderHeight = pdfWidth * canvasRatio;

      if (renderHeight > pdfHeight) {
        renderHeight = pdfHeight;
        renderWidth = pdfHeight / canvasRatio;
      }

      const xOffset = Math.max(0, (pdfWidth - renderWidth) / 2);
      const yOffset = Math.max(0, (pdfHeight - renderHeight) / 2);

      // Single-page precise render
      pdf.addImage(imgData, 'JPEG', xOffset, yOffset, renderWidth, renderHeight, undefined, 'FAST');

      pdf.save(filename);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3500);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const isHeadRejected = request.part2?.approvalStatus === 'rejected';

  return (
    <div
      id="printable-document-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto"
    >
      {/* Top Action Bar (hidden on print) */}
      <div className="fixed top-3 right-3 sm:top-5 sm:right-5 z-50 flex items-center gap-2 print:hidden bg-slate-900/95 text-white p-2 rounded-2xl shadow-2xl border border-indigo-500/40 backdrop-blur-md">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 text-xs text-slate-300 font-medium border-r border-slate-700/80">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>เอกสารขนาดมาตรฐาน A4 (210 × 297 มม.)</span>
        </div>

        <button
          type="button"
          onClick={handleSavePdf}
          disabled={isGeneratingPdf}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-700 disabled:to-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer active:scale-95"
          title="ดาวน์โหลดเอกสารเป็นไฟล์ PDF ขนาด 1 หน้า A4 มาตรฐาน"
        >
          {isGeneratingPdf ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
              <span>กำลังสร้าง PDF...</span>
            </>
          ) : pdfSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              <span>ดาวน์โหลด PDF สำเร็จ</span>
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4 text-cyan-200" />
              <span>ดาวน์โหลด PDF (A4)</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer ml-1"
          title="ปิดหน้าต่างตัวอย่างเอกสาร"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Horizontal Scrollable Wrapper for Mobile Preview & Precise Fixed A4 Container */}
      <div className="w-full min-h-full flex justify-start lg:justify-center overflow-x-auto py-12 sm:py-6">
        {/* A4 Paper Container - Fixed standard A4 width (794px / 210mm x 297mm) */}
        <div
          id="printable-document-content"
          ref={printContentRef}
          className="printable-page-container bg-white text-black p-8 shadow-2xl rounded-xs font-serif text-[12px] leading-snug my-auto mx-auto shrink-0"
          style={{
            width: '794px',
            minWidth: '794px',
            maxWidth: '794px',
            minHeight: '1123px',
            boxSizing: 'border-box',
            fontFamily: "'Sarabun', 'TH Sarabun New', 'Cordia New', sans-serif",
          }}
        >
        {/* Document Header */}
        <div className="relative border-b-2 border-black pb-2.5 mb-3">
          <div className="absolute top-0 right-0 text-right">
            <span className="font-bold text-xs sm:text-sm tracking-wider border border-black px-2 py-0.5 rounded-xs">
              {getFormCode()}
            </span>
          </div>
          <div className="text-center pt-1">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-black">{getFormTitle()}</h1>
            <h2 className="text-xs sm:text-sm font-semibold text-slate-900">งานห้องปฏิบัติการ งานวิจัยและบริการวิชาการ</h2>
            <h3 className="text-xs font-semibold text-slate-800">คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น</h3>
          </div>
          <div className="flex justify-between items-end mt-2 text-[11px]">
            <div className="font-bold text-xs underline decoration-1 underline-offset-2">
              สำหรับผู้ขอรับบริการ (ส่วนที่ 1)
            </div>
            <div className="text-right space-y-0.5">
              <div>เลขที่ติดตาม: <span className="font-mono font-bold text-blue-900">{request.trackingNo || '................................'}</span></div>
              <div>วันที่ยื่น: <span className="font-semibold">{request.submissionDateTh}</span></div>
            </div>
          </div>
        </div>

        {/* Part 1 Content */}
        <div className="space-y-2">
          {/* Line 1: Name & Role */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <span><strong>ชื่อ-สกุล:</strong> <span className="border-b border-dotted border-black px-2 pb-0.5 font-medium">{request.applicantName || '...................................................'}</span></span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className={`w-3 h-3 rounded-full border border-black inline-flex items-center justify-center text-[9px] ${request.role === 'faculty_staff' ? 'bg-black text-white font-bold' : ''}`}>
                  {request.role === 'faculty_staff' ? '✓' : ''}
                </span>
                อาจารย์/บุคลากร
              </span>
              <span className="flex items-center gap-1">
                <span className={`w-3 h-3 rounded-full border border-black inline-flex items-center justify-center text-[9px] ${request.role === 'student' ? 'bg-black text-white font-bold' : ''}`}>
                  {request.role === 'student' ? '✓' : ''}
                </span>
                นักศึกษา {request.studentId && <span className="border-b border-dotted border-black px-1 font-mono font-semibold">รหัส {request.studentId}</span>}
              </span>
              <span className="flex items-center gap-1">
                <span className={`w-3 h-3 rounded-full border border-black inline-flex items-center justify-center text-[9px] ${request.role === 'external' ? 'bg-black text-white font-bold' : ''}`}>
                  {request.role === 'external' ? '✓' : ''}
                </span>
                บุคคลภายนอก {request.role === 'external' && request.otherRoleText && <span className="border-b border-dotted border-black px-1">({request.otherRoleText})</span>}
              </span>
              <span className="flex items-center gap-1">
                <span className={`w-3 h-3 rounded-full border border-black inline-flex items-center justify-center text-[9px] ${request.role === 'other' ? 'bg-black text-white font-bold' : ''}`}>
                  {request.role === 'other' ? '✓' : ''}
                </span>
                อื่นๆ {request.role === 'other' && request.otherRoleText && <span className="border-b border-dotted border-black px-1 font-medium">{request.otherRoleText}</span>}
              </span>
            </div>
          </div>

          {/* Line 2: Department, Phone, Email */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <span><strong>สังกัด/สาขาวิชา:</strong> <span className="border-b border-dotted border-black px-1.5 font-medium">{request.department || '...................................................'}</span></span>
            <span><strong>โทรศัพท์:</strong> <span className="border-b border-dotted border-black px-1.5 font-mono">{request.phone || '......................'}</span></span>
            <span><strong>E-mail:</strong> <span className="border-b border-dotted border-black px-1.5 font-mono">{request.email || '......................................'}</span></span>
          </div>

          {/* Line 3: Work Type */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px]">
            <strong>ประเภทงาน:</strong>
            <span className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded-full border border-black inline-flex items-center justify-center text-[9px] ${request.workType === 'teaching' ? 'bg-black text-white font-bold' : ''}`}>
                {request.workType === 'teaching' ? '✓' : ''}
              </span>
              การเรียนการสอน
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded-full border border-black inline-flex items-center justify-center text-[9px] ${request.workType === 'research' ? 'bg-black text-white font-bold' : ''}`}>
                {request.workType === 'research' ? '✓' : ''}
              </span>
              งานวิจัย
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded-full border border-black inline-flex items-center justify-center text-[9px] ${request.workType === 'special_problem' ? 'bg-black text-white font-bold' : ''}`}>
                {request.workType === 'special_problem' ? '✓' : ''}
              </span>
              ปัญหาพิเศษ
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded-full border border-black inline-flex items-center justify-center text-[9px] ${request.workType === 'other' ? 'bg-black text-white font-bold' : ''}`}>
                {request.workType === 'other' ? '✓' : ''}
              </span>
              อื่นๆ {request.workTypeOtherText ? `(${request.workTypeOtherText})` : ''}
            </span>
          </div>

          {/* Line 4: Project Title */}
          <div>
            <strong>ชื่อโครงงาน/งานวิจัย/กระบวนวิชา:</strong> <span className="border-b border-dotted border-black px-1 font-medium">{request.projectTitle || '................................................................................................................................................'}</span>
          </div>

          {/* Form specific Section 1 Body */}
          {request.formType === 'VET_LAB_02' && (
            <div className="space-y-1.5 pt-0.5">
              <div className="font-bold text-[11.5px]">
                รายการห้องปฏิบัติการที่ขอใช้ <span className="font-normal text-slate-700">(ระบุชื่อห้องและกิจกรรมที่ทำ)</span>
              </div>
              <table className="w-full border-collapse border border-black text-[11px]">
                <thead>
                  <tr className="bg-slate-100/70">
                    <th className="border border-black p-0.5 w-10 text-center">ลำดับ</th>
                    <th className="border border-black p-0.5 text-center">ชื่อห้องปฏิบัติการ</th>
                    <th className="border border-black p-0.5 w-2/5 text-center">หมายเหตุ / กิจกรรมที่ทำ</th>
                  </tr>
                </thead>
                <tbody>
                  {(request.labItems && request.labItems.length > 0 ? request.labItems.slice(0, 3) : [1, 2, 3]).map((item: any, idx) => (
                    <tr key={idx} className="h-6">
                      <td className="border border-black p-0.5 text-center font-mono">{idx + 1}</td>
                      <td className="border border-black p-0.5 px-2">{typeof item === 'object' ? item.labName : ''}</td>
                      <td className="border border-black p-0.5 px-2">{typeof item === 'object' ? item.remarks : ''}</td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - (request.labItems?.length || 0)) }).map((_, i) => (
                    <tr key={`empty-${i}`} className="h-6">
                      <td className="border border-black p-0.5 text-center font-mono">{(request.labItems?.length || 0) + i + 1}</td>
                      <td className="border border-black p-0.5"></td>
                      <td className="border border-black p-0.5"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] pt-0.5">
                <strong>ช่วงเวลา:</strong>
                <span className="flex items-center gap-1">
                  <span className={`w-3 h-3 rounded-full border border-black inline-flex items-center justify-center ${request.timeSlot === 'official_hours' ? 'bg-black text-white font-bold' : ''}`}>
                    {request.timeSlot === 'official_hours' ? '✓' : ''}
                  </span>
                  ในเวลาราชการ
                </span>
                <span className="flex items-center gap-1">
                  <span className={`w-3 h-3 rounded-full border border-black inline-flex items-center justify-center ${request.timeSlot === 'after_hours' ? 'bg-black text-white font-bold' : ''}`}>
                    {request.timeSlot === 'after_hours' ? '✓' : ''}
                  </span>
                  นอกเวลาราชการ
                </span>
                <span>จำนวน <span className="border-b border-dotted border-black px-1 font-bold">{request.durationDays || '.....'}</span> วัน</span>
                <span>ตั้งแต่วันที่ <span className="border-b border-dotted border-black px-1">{request.startDate || '....................'}</span></span>
                <span>ถึงวันที่ <span className="border-b border-dotted border-black px-1">{request.endDate || '....................'}</span></span>
              </div>
            </div>
          )}

          {request.formType === 'VET_LAB_03' && (
            <div className="space-y-1.5 pt-0.5">
              <div className="font-bold text-[11.5px]">
                รายการเครื่องมือวิทยาศาสตร์ที่ขอใช้
              </div>
              <table className="w-full border-collapse border border-black text-[11px]">
                <thead>
                  <tr className="bg-slate-100/70">
                    <th className="border border-black p-0.5 w-10 text-center">ลำดับ</th>
                    <th className="border border-black p-0.5 text-center">ชื่อเครื่องมือวิทยาศาสตร์</th>
                    <th className="border border-black p-0.5 w-20 text-center">จำนวน</th>
                    <th className="border border-black p-0.5 w-2/5 text-center">ห้องปฏิบัติการที่ตั้ง (ถ้าทราบ)</th>
                  </tr>
                </thead>
                <tbody>
                  {(request.equipmentItems && request.equipmentItems.length > 0 ? request.equipmentItems.slice(0, 3) : [1, 2, 3]).map((item: any, idx) => (
                    <tr key={idx} className="h-6">
                      <td className="border border-black p-0.5 text-center font-mono">{idx + 1}</td>
                      <td className="border border-black p-0.5 px-2">{typeof item === 'object' ? item.itemName : ''}</td>
                      <td className="border border-black p-0.5 text-center">{typeof item === 'object' ? item.quantity : ''}</td>
                      <td className="border border-black p-0.5 px-2">{typeof item === 'object' ? item.remarksLab : ''}</td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - (request.equipmentItems?.length || 0)) }).map((_, i) => (
                    <tr key={`empty-eq-${i}`} className="h-6">
                      <td className="border border-black p-0.5 text-center font-mono">{(request.equipmentItems?.length || 0) + i + 1}</td>
                      <td className="border border-black p-0.5"></td>
                      <td className="border border-black p-0.5"></td>
                      <td className="border border-black p-0.5"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]">
                <strong>ช่วงเวลา:</strong>
                <span className="flex items-center gap-1">
                  <span className={`w-3 h-3 rounded-full border border-black inline-flex items-center justify-center ${request.timeSlot === 'official_hours' ? 'bg-black text-white font-bold' : ''}`}>
                    {request.timeSlot === 'official_hours' ? '✓' : ''}
                  </span>
                  ในเวลาราชการ
                </span>
                <span className="flex items-center gap-1">
                  <span className={`w-3 h-3 rounded-full border border-black inline-flex items-center justify-center ${request.timeSlot === 'after_hours' ? 'bg-black text-white font-bold' : ''}`}>
                    {request.timeSlot === 'after_hours' ? '✓' : ''}
                  </span>
                  นอกเวลาราชการ
                </span>
                <span>จำนวน <span className="border-b border-dotted border-black px-1 font-bold">{request.durationDays || '.....'}</span> วัน</span>
                <span>ตั้งแต่วันที่ <span className="border-b border-dotted border-black px-1">{request.startDate || '....................'}</span></span>
                <span>ถึงวันที่ <span className="border-b border-dotted border-black px-1">{request.endDate || '....................'}</span></span>
              </div>
            </div>
          )}

          {request.formType === 'VET_LAB_04' && (
            <div className="space-y-1.5 pt-0.5">
              <div className="font-bold text-[11.5px]">
                รายการสารเคมีและวัสดุวิทยาศาสตร์ที่ขอเบิก
              </div>
              <table className="w-full border-collapse border border-black text-[11px]">
                <thead>
                  <tr className="bg-slate-100/70">
                    <th className="border border-black p-0.5 w-10 text-center">ลำดับ</th>
                    <th className="border border-black p-0.5 text-center">ชื่อสารเคมี / วัสดุ</th>
                    <th className="border border-black p-0.5 w-24 text-center">จำนวน/ปริมาณ</th>
                    <th className="border border-black p-0.5 w-2/5 text-center">วัตถุประสงค์การใช้</th>
                  </tr>
                </thead>
                <tbody>
                  {(request.chemicalItems && request.chemicalItems.length > 0 ? request.chemicalItems.slice(0, 3) : [1, 2, 3]).map((item: any, idx) => (
                    <tr key={idx} className="h-6">
                      <td className="border border-black p-0.5 text-center font-mono">{idx + 1}</td>
                      <td className="border border-black p-0.5 px-2">{typeof item === 'object' ? item.itemName : ''}</td>
                      <td className="border border-black p-0.5 text-center">{typeof item === 'object' ? item.quantity : ''}</td>
                      <td className="border border-black p-0.5 px-2">{typeof item === 'object' ? item.remarks : ''}</td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - (request.chemicalItems?.length || 0)) }).map((_, i) => (
                    <tr key={`empty-chem-${i}`} className="h-6">
                      <td className="border border-black p-0.5 text-center font-mono">{(request.chemicalItems?.length || 0) + i + 1}</td>
                      <td className="border border-black p-0.5"></td>
                      <td className="border border-black p-0.5"></td>
                      <td className="border border-black p-0.5"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-[11px]">
                กำหนดวันที่มารับ: <span className="border-b border-dotted border-black px-2 font-medium">{request.pickupDate || '........................'}</span>
                เวลา: <span className="border-b border-dotted border-black px-2 font-medium">{request.pickupTime || '................'}</span> น.
              </div>
            </div>
          )}

          {/* Legal / Consent Statement */}
          <div className="text-[10.5px] leading-tight pt-0.5 text-justify text-slate-800">
            {request.formType === 'VET_LAB_04'
              ? 'ข้าพเจ้าขอรับรองว่าจะนำสารเคมีและวัสดุดังกล่าวไปใช้เพื่อการศึกษา/วิจัยเท่านั้น และยินดีชดใช้ค่าเสียหายหากเกิดข้อผิดพลาด'
              : 'ข้าพเจ้าได้รับทราบระเบียบการใช้ห้องปฏิบัติการ (VET.LAB 01) และยินยอมปฏิบัติตามทุกประการ หากเกิดความเสียหายใดๆ ข้าพเจ้ายินยอมรับผิดชอบ'}
          </div>

          {/* Signatures Part 1 */}
          <div className="grid grid-cols-2 gap-4 pt-1 border-t border-slate-200">
            <div className="text-center space-y-0.5">
              <RenderSignatureStamp
                signature={request.applicantSignature}
                fallbackName={request.applicantSignature?.name || request.applicantName}
                fallbackDate={request.applicantSignature?.date || request.submissionDateTh}
                roleLabel="ผู้ขอใช้บริการ"
                isApproved={true}
              />
              <div className="text-[11px]">( {request.applicantSignature?.name || request.applicantName || '....................................................'} )</div>
              <div className="text-[10.5px]">วันที่ {request.applicantSignature?.date || request.submissionDateTh || '........./........./.........'}</div>
              <div className="font-bold text-[11px]">ผู้ขอใช้บริการ</div>
            </div>

            <div className="text-center space-y-0.5">
              <RenderSignatureStamp
                signature={request.advisorSignature}
                fallbackName={request.advisorSignature?.name}
                fallbackDate={request.advisorSignature?.date || request.submissionDateTh}
                roleLabel="อาจารย์ที่ปรึกษา / ผู้รับผิดชอบ"
                isApproved={Boolean(request.advisorSignature?.name && request.advisorSignature.name !== '-' && !request.advisorSignature.name.startsWith('.'))}
              />
              <div className="text-[11px]">( {request.advisorSignature?.name || '....................................................'} )</div>
              <div className="text-[10.5px]">วันที่ {request.advisorSignature?.date || request.submissionDateTh || '........./........./.........'}</div>
              <div className="font-bold text-[11px]">อาจารย์ที่ปรึกษา / ผู้รับผิดชอบ</div>
            </div>
          </div>
        </div>

        {/* Part 2: Head of Lab */}
        <div className="border border-black mt-2.5 p-2 rounded-none bg-slate-50/40">
          <div className="font-bold text-[11.5px] mb-0.5">
            ส่วนที่ 2 : ความเห็นของประธานกรรมการงานห้องปฏิบัติการ งานวิจัยและบริการวิชาการ
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex flex-wrap items-center gap-4 pl-1">
              <strong>คำสั่ง:</strong>
              <span className="flex items-center gap-1">
                <span className={`w-3 h-3 rounded-full border border-black inline-flex items-center justify-center text-[9px] ${request.part2?.approvalStatus === 'approved' ? 'bg-black text-white font-bold' : ''}`}>
                  {request.part2?.approvalStatus === 'approved' ? '✓' : ''}
                </span>
                อนุมัติ
              </span>
              <span className="flex items-center gap-1">
                <span className={`w-3 h-3 rounded-full border border-black inline-flex items-center justify-center text-[9px] ${request.part2?.approvalStatus === 'rejected' ? 'bg-black text-white font-bold' : ''}`}>
                  {request.part2?.approvalStatus === 'rejected' ? '✓' : ''}
                </span>
                ไม่อนุมัติ
              </span>
            </div>

            {/* ความเห็น / เหตุผล / ข้อสั่งการของหัวหน้าห้องปฏิบัติการ */}
            <div className="pl-1 text-[10.5px]">
              {request.part2?.approvalStatus === 'rejected' ? (
                <div className="text-red-900">
                  <strong>เหตุผลที่ไม่อนุมัติ:</strong> {request.part2?.rejectionReason || request.part2?.comment || '-'}
                </div>
              ) : (
                <div className="text-slate-900">
                  <strong>ความเห็น / ข้อสั่งการ:</strong> {request.part2?.comment || (request.part2?.approvalStatus === 'approved' ? 'เห็นควรอนุมัติให้ใช้ห้องปฏิบัติการ/เครื่องมือตามที่ร้องขอ' : '....................................................................................................................................')}
                </div>
              )}
            </div>

            {/* มอบหมายนักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ */}
            {request.part2?.assignedStaffName && (
              <div className="pl-1 text-slate-800 text-[10.5px]">
                <strong>มอบหมายนักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ:</strong> {request.part2.assignedStaffName} {request.part2.assignedStaffDepartment ? `(${request.part2.assignedStaffDepartment})` : ''}
                {request.part2.assignedStaffComment && (
                  <span className="ml-1 text-slate-700">
                    - คำสั่งการมอบหมาย: {request.part2.assignedStaffComment}
                  </span>
                )}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <div className="text-center w-56 space-y-0.5">
                <RenderSignatureStamp
                  signature={request.part2?.signature}
                  fallbackName={request.part2?.signature?.name || 'นางสุธิดา จันทร์ลุน'}
                  fallbackDate={request.part2?.signature?.date || (request.part2?.reviewedAt ? new Date(request.part2.reviewedAt).toLocaleDateString('th-TH') : undefined)}
                  roleLabel="หัวหน้าห้องปฏิบัติการ"
                  isApproved={request.part2?.approvalStatus === 'approved' || request.status === 'approved_by_head' || request.status === 'completed'}
                />
                <div className="text-[10.5px]">( {request.part2?.signature?.name || 'นางสุธิดา จันทร์ลุน'} )</div>
                <div className="text-[10px] leading-tight">
                  <div className="text-[9.5px] font-normal text-slate-800">(นักวิชาการวิทยาศาสตร์ ชำนาญการพิเศษ)</div>
                  <div className="font-semibold text-[10px]">หัวหน้าห้องปฏิบัติการ</div>
                </div>
                <div className="text-[10px]">วันที่ {request.part2?.signature?.date || (request.part2?.reviewedAt ? new Date(request.part2.reviewedAt).toLocaleDateString('th-TH') : '........./........./.........')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Part 3: Form-specific Lab Officer (Hidden if Head of Lab rejected) */}
        {!isHeadRejected && (
          <div className="border border-black mt-2 p-2 rounded-none bg-slate-50/40">
            {request.formType === 'VET_LAB_02' && (
              <div>
                <div className="font-bold text-[11.5px] mb-0.5">
                  ส่วนที่ 3 : สำหรับนักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex flex-wrap items-center gap-4 pl-1">
                    <strong>การตรวจสอบความพร้อม:</strong>
                    <span className="flex items-center gap-1">
                      <span className={`w-3 h-3 rounded-full border border-black inline-flex items-center justify-center text-[9px] ${request.part3?.approvalStatus === 'approved' ? 'bg-black text-white font-bold' : ''}`}>
                        {request.part3?.approvalStatus === 'approved' ? '✓' : ''}
                      </span>
                      เรียบร้อยพร้อมใช้งาน
                    </span>
                    <span className="flex items-center gap-1">
                      <span className={`w-3 h-3 rounded-full border border-black inline-flex items-center justify-center text-[9px] ${request.part3?.approvalStatus === 'rejected' ? 'bg-black text-white font-bold' : ''}`}>
                        {request.part3?.approvalStatus === 'rejected' ? '✓' : ''}
                      </span>
                      ไม่พร้อมใช้งาน
                    </span>
                  </div>

                  {/* ความเห็น / เหตุผลของนักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ */}
                  <div className="pl-1 text-[10.5px]">
                    {request.part3?.approvalStatus === 'rejected' ? (
                      <div className="text-red-900">
                        <strong>เหตุผลที่ไม่พร้อมใช้งาน:</strong> {request.part3?.rejectionReason || request.part3?.comment || '-'}
                      </div>
                    ) : (
                      <div className="text-slate-900">
                        <strong>ความเห็น / ข้อแนะนำ:</strong> {request.part3?.comment || (request.part3?.approvalStatus === 'approved' ? 'ตรวจสอบความพร้อมของห้องปฏิบัติการและอุปกรณ์เรียบร้อย พร้อมเปิดให้เข้าใช้งาน' : '....................................................................................................................................')}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-1">
                    <div className="text-center w-56 space-y-0.5">
                      <RenderSignatureStamp
                        signature={request.part3?.signature}
                        fallbackName={request.part3?.signature?.name || request.part2?.assignedStaffName || 'นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ'}
                        fallbackDate={request.part3?.signature?.date || (request.part3?.reviewedAt ? new Date(request.part3.reviewedAt).toLocaleDateString('th-TH') : undefined)}
                        roleLabel="นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ"
                        isApproved={request.part3?.approvalStatus === 'approved' || request.status === 'completed'}
                      />
                      <div className="text-[10.5px]">( {request.part3?.signature?.name || request.part2?.assignedStaffName || '....................................................'} )</div>
                      <div className="font-semibold text-[10px]">นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ</div>
                      <div className="text-[10px]">วันที่ {request.part3?.signature?.date || (request.part3?.reviewedAt ? new Date(request.part3.reviewedAt).toLocaleDateString('th-TH') : '........./........./.........')}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {request.formType === 'VET_LAB_03' && (
              <div>
                <div className="font-bold text-[11.5px] mb-0.5">
                  ส่วนที่ 3 : สำหรับนักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ
                </div>
                {/* แสดงความเห็น/เหตุผล ถ้ามี */}
                {(request.part3?.comment || request.part3?.rejectionReason) && (
                  <div className="pl-1 text-[10.5px] mb-1">
                    {request.part3?.rejectionReason ? (
                      <div className="text-red-900">
                        <strong>เหตุผลที่ไม่พร้อมใช้งาน:</strong> {request.part3.rejectionReason}
                      </div>
                    ) : (
                      <div className="text-slate-900">
                        <strong>ความเห็น / บันทึกเพิ่มเติม:</strong> {request.part3.comment}
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 text-[10.5px]">
                  <div className="border-r border-black pr-2 space-y-0.5">
                    <div className="font-semibold">สภาพเครื่องมือก่อนใช้งาน (นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ)</div>
                    <div className="h-5 border-b border-dotted border-black text-slate-700">
                      {request.part3?.beforeConditionCheck || '................................................................................'}
                    </div>
                    <div className="text-center pt-1 space-y-0.5">
                      <RenderSignatureStamp
                        signature={request.part3?.signature}
                        fallbackName={request.part3?.signature?.name || request.part2?.assignedStaffName || 'นักวิชาการวิทยาศาสตร์ผู้ส่งมอบ'}
                        fallbackDate={request.part3?.signature?.date || request.submissionDateTh}
                        roleLabel="นักวิชาการวิทยาศาสตร์ผู้ส่งมอบ"
                        isApproved={request.part3?.approvalStatus === 'approved' || request.status === 'completed'}
                      />
                      <div className="text-[10.5px]">( {request.part3?.signature?.name || request.part2?.assignedStaffName || '..........................................'} ) ผู้ส่งมอบ</div>
                      <div className="text-[10px]">วันที่ {request.part3?.signature?.date || '........./........./.........'}</div>
                    </div>
                  </div>
                  <div className="pl-2 space-y-0.5">
                    <div className="font-semibold">สภาพเครื่องมือหลังใช้งาน (นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ)</div>
                    <div className="h-5 border-b border-dotted border-black text-slate-700">
                      {request.part3?.afterConditionCheck || '................................................................................'}
                    </div>
                    <div className="text-center pt-1 space-y-0.5">
                      <RenderSignatureStamp
                        signature={request.part3?.signature}
                        fallbackName={request.part3?.signature?.name || request.part2?.assignedStaffName || 'นักวิชาการวิทยาศาสตร์ผู้รับคืน'}
                        fallbackDate={request.part3?.signature?.date || request.submissionDateTh}
                        roleLabel="นักวิชาการวิทยาศาสตร์ผู้รับคืน"
                        isApproved={request.status === 'completed'}
                      />
                      <div className="text-[10.5px]">( {request.part3?.signature?.name || request.part2?.assignedStaffName || '..........................................'} ) ผู้รับคืน</div>
                      <div className="text-[10px]">วันที่ {request.part3?.signature?.date || '........./........./.........'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {request.formType === 'VET_LAB_04' && (
              <div>
                <div className="font-bold text-[11.5px] mb-0.5">
                  ส่วนที่ 3 : สำหรับนักวิชาการวิทยาศาสตร์ผู้รับผิดชอบและสรุปค่าใช้จ่าย
                </div>
                {/* แสดงความเห็น/เหตุผล ถ้ามี */}
                {(request.part3?.comment || request.part3?.rejectionReason) && (
                  <div className="pl-1 text-[10.5px] mb-1">
                    {request.part3?.rejectionReason ? (
                      <div className="text-red-900">
                        <strong>เหตุผลที่ไม่พร้อมจ่าย/ไม่อนุมัติ:</strong> {request.part3.rejectionReason}
                      </div>
                    ) : (
                      <div className="text-slate-900">
                        <strong>ความเห็น / บันทึกเพิ่มเติม:</strong> {request.part3.comment}
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 text-[10.5px]">
                  <div className="border-r border-black pr-2 space-y-1">
                    <div className="font-semibold flex items-center gap-1">
                      <span className={`w-3 h-3 rounded-full border border-black inline-flex items-center justify-center text-[9px] ${request.part3?.isDispensed ? 'bg-black text-white font-bold' : ''}`}>
                        {request.part3?.isDispensed ? '✓' : ''}
                      </span>
                      จ่ายสารเคมี/วัสดุเรียบร้อย
                    </div>
                    <div className="text-center space-y-0.5 pt-1">
                      <RenderSignatureStamp
                        signature={request.part3?.signature}
                        fallbackName={request.part3?.signature?.name || request.part2?.assignedStaffName || 'นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ'}
                        fallbackDate={request.part3?.signature?.date || request.submissionDateTh}
                        roleLabel="นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ"
                        isApproved={request.part3?.isDispensed || request.part3?.approvalStatus === 'approved' || request.status === 'completed' || request.status === 'dispensed'}
                      />
                      <div className="text-[10.5px]">( {request.part3?.signature?.name || request.part2?.assignedStaffName || '......................................'} )</div>
                      <div className="font-semibold text-[9.5px]">นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ (ผู้จ่ายของ)</div>
                    </div>
                  </div>
                  <div className="border-r border-black pr-2 space-y-1">
                    <div className="font-semibold flex items-center gap-1">
                      <span className={`w-3 h-3 rounded-full border border-black inline-flex items-center justify-center text-[9px] ${request.part3?.isReceived ? 'bg-black text-white font-bold' : ''}`}>
                        {request.part3?.isReceived ? '✓' : ''}
                      </span>
                      ได้รับของครบถ้วนแล้ว
                    </div>
                    <div className="text-center space-y-0.5 pt-1">
                      <RenderSignatureStamp
                        signature={request.applicantSignature}
                        fallbackName={request.applicantSignature?.name || request.applicantName}
                        fallbackDate={request.applicantSignature?.date || request.submissionDateTh}
                        roleLabel="ผู้รับของ"
                        isApproved={request.part3?.isReceived || request.status === 'completed' || request.status === 'dispensed'}
                      />
                      <div className="text-[10.5px]">( {request.applicantSignature?.name || request.applicantName || '......................................'} )</div>
                      <div className="font-semibold text-[10px]">ผู้รับของ</div>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-semibold">สรุปค่าใช้จ่าย</div>
                    <table className="w-full text-[10px] border border-black">
                      <tbody>
                        <tr>
                          <td className="p-0.5 px-1 border-b border-black">รวมทั้งสิ้น</td>
                          <td className="p-0.5 px-1 text-right font-mono font-bold border-b border-black">{request.part3?.totalExpense || '0'} บ.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Verification Footer Stamp */}
        <div className="mt-2 pt-1 border-t border-slate-200 text-[9.5px] text-slate-500 flex justify-between items-center print:text-black">
          <div>เอกสารอิเล็กทรอนิกส์ คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น (KKU Vet Lab Online Forms System)</div>
          <div className="flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Tracking: {request.trackingNo || 'ONLINE-SYSTEM'}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

