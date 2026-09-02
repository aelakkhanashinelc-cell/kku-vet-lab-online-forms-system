import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw, Check, Type, Upload, Trash2 } from 'lucide-react';
import { SignatureData } from '../types';
import { generateTypedSignatureDataUrl } from '../utils/signatureHelper';

interface DigitalSignaturePadProps {
  label: string;
  subLabel?: string;
  value?: SignatureData;
  onChange: (data: SignatureData) => void;
  required?: boolean;
  disabled?: boolean;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  label,
  subLabel,
  value,
  onChange,
  required = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = useState(value?.name || '');
  const [dateStr, setDateStr] = useState(
    value?.date ||
      new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(!!value?.dataUrl);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (value?.name) setTypedName(value.name);
    if (value?.date) setDateStr(value.date);
    if (value?.dataUrl) setHasDrawn(true);
  }, [value]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#4338ca'; // Indigo stroke
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const generateTypedSignatureDataUrl = (name: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 140);
    ctx.font = 'italic bold 32px "Brush Script MT", cursive, sans-serif';
    ctx.fillStyle = '#312e81';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name || 'Signature', 200, 70);
    return canvas.toDataURL('image/png');
  };

  const handleApply = () => {
    let finalDataUrl = value?.dataUrl || '';
    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (canvas && hasDrawn) {
        finalDataUrl = canvas.toDataURL('image/png');
      } else if (typedName.trim()) {
        finalDataUrl = generateTypedSignatureDataUrl(typedName);
      }
    } else if (mode === 'type') {
      finalDataUrl = typedName.trim() ? generateTypedSignatureDataUrl(typedName) : '';
    }

    onChange({
      dataUrl: finalDataUrl,
      name: typedName,
      date: dateStr,
    });
    setIsOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        onChange({
          dataUrl,
          name: typedName,
          date: dateStr,
        });
        setHasDrawn(true);
        setIsOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearSignature = () => {
    onChange({
      dataUrl: '',
      name: '',
      date: dateStr,
    });
    setHasDrawn(false);
  };

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div>
          <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <PenTool className="w-3.5 h-3.5 text-indigo-600" />
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
          {subLabel && <p className="text-[11px] text-slate-500 mt-0.5">{subLabel}</p>}
        </div>
        {!disabled && (value?.dataUrl || value?.name) ? (
          <button
            type="button"
            onClick={handleClearSignature}
            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium px-2 py-0.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" /> ลบลายมือชื่อ
          </button>
        ) : null}
      </div>

      {/* Signature Preview Card */}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
          }
        }}
        className={`border border-dashed rounded-lg p-3 bg-white text-center transition-colors min-h-[84px] flex flex-col items-center justify-center group ${
          disabled
            ? 'opacity-80 cursor-not-allowed border-slate-200'
            : 'cursor-pointer border-slate-300 hover:border-indigo-500'
        }`}
      >
        {value?.dataUrl ? (
          <div className="w-full flex flex-col items-center">
            <img
              src={value.dataUrl}
              alt="Signature"
              className="h-12 object-contain max-w-[220px]"
            />
            <div className="mt-1 text-[11px] text-slate-600 border-t border-slate-100 pt-1 w-full flex justify-between px-2 font-normal">
              <span>ชื่อ: {value.name || '-'}</span>
              <span>วันที่: {value.date || '-'}</span>
            </div>
          </div>
        ) : value?.name ? (
          <div className="text-center">
            <div className="text-base font-serif italic text-indigo-950 font-semibold">{value.name}</div>
            <div className="text-xs text-slate-500 mt-0.5 font-normal">วันที่: {value.date || '-'}</div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-slate-400 group-hover:text-indigo-600 transition-colors">
            <PenTool className="w-5 h-5 mb-1 opacity-70" />
            <span className="text-xs font-medium">
              {disabled ? 'ยังไม่มีการลงนาม' : 'คลิกเพื่อลงลายมือชื่อดิจิทัล'}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        <div>
          <label className="text-[11px] text-slate-500 font-medium block mb-0.5">
            ชื่อ-สกุล (ตัวบรรจง):
          </label>
          <input
            type="text"
            disabled={disabled}
            value={typedName}
            onChange={(e) => {
              setTypedName(e.target.value);
              onChange({ ...(value || { name: '', date: '' }), name: e.target.value });
            }}
            placeholder="พิมพ์ชื่อ-สกุล"
            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-normal disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="text-[11px] text-slate-500 font-medium block mb-0.5">
            วันที่ลงนาม:
          </label>
          <input
            type="text"
            disabled={disabled}
            value={dateStr}
            onChange={(e) => {
              setDateStr(e.target.value);
              onChange({ ...(value || { name: '', date: '' }), date: e.target.value });
            }}
            placeholder="เช่น 24 ส.ค. 2569"
            className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-normal disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Signature Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm flex items-center gap-2 tracking-tight">
                  <PenTool className="w-3.5 h-3.5 text-indigo-400" />
                  ลงลายมือชื่อดิจิทัล (Digital Signature)
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">{label}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white text-lg leading-none p-1 rounded-md hover:bg-slate-800 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Mode selection */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs">
              <button
                type="button"
                onClick={() => setMode('draw')}
                className={`flex-1 py-2.5 font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  mode === 'draw'
                    ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" /> วาดลายเซ็น
              </button>
              <button
                type="button"
                onClick={() => setMode('type')}
                className={`flex-1 py-2.5 font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  mode === 'type'
                    ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Type className="w-3.5 h-3.5" /> พิมพ์ชื่อ
              </button>
              <button
                type="button"
                onClick={() => setMode('upload')}
                className={`flex-1 py-2.5 font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  mode === 'upload'
                    ? 'bg-white text-indigo-700 border-b-2 border-indigo-600 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> อัปโหลดภาพ
              </button>
            </div>

            <div className="p-5">
              {mode === 'draw' && (
                <div>
                  <div className="relative border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                    <canvas
                      ref={canvasRef}
                      width={390}
                      height={160}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-[160px] touch-none cursor-crosshair"
                    />
                    {!hasDrawn && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs font-normal">
                        เซ็นลายมือชื่อที่นี่ (Draw here)
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                    <span>ใช้เมาส์หรือนิ้วสัมผัสวาดลายเซ็น</span>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-slate-600 hover:text-indigo-700 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> ล้างหน้ากระดาษ
                    </button>
                  </div>
                </div>
              )}

              {mode === 'type' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">พิมพ์ชื่อ-นามสกุล:</label>
                    <input
                      type="text"
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                      placeholder="เช่น นายรักเรียน เพียรศึกษา"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <span className="text-[11px] text-slate-400 font-normal block mb-1.5">ตัวอย่างลายเซ็นแบบตัวพิมพ์:</span>
                    <div className="text-xl font-serif italic text-indigo-950 font-semibold tracking-wide">
                      {typedName || 'ตัวอย่างลายมือชื่อ'}
                    </div>
                  </div>
                </div>
              )}

              {mode === 'upload' && (
                <div className="text-center py-5 border border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <Upload className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 mb-2.5">เลือกไฟล์รูปภาพลายเซ็น (PNG, JPG ขนาดไม่เกิน 5MB)</p>
                  <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-2 px-3.5 rounded-md shadow-2xs inline-flex items-center gap-1.5 transition-colors">
                    <span>เลือกไฟล์รูปภาพ</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              <div className="mt-3.5 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    ชื่อ-สกุล ตัวบรรจง:
                  </label>
                  <input
                    type="text"
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="พิมพ์ชื่อ-สกุล"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-normal focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    วันที่:
                  </label>
                  <input
                    type="text"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-normal focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> นำลายเซ็นไปใช้
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
