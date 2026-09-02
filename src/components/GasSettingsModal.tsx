import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  CheckCircle,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Send,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react';
import {
  getGasWebAppUrl,
  setGasWebAppUrl,
  isGasSyncEnabled,
  setGasSyncEnabled,
  testGasConnection,
} from '../utils/gasService';
import { GOOGLE_APPS_SCRIPT_CODE } from '../utils/gasCodeTemplate';

interface GasSettingsModalProps {
  onClose: () => void;
}

export const GasSettingsModal: React.FC<GasSettingsModalProps> = ({ onClose }) => {
  const [webAppUrl, setLocalWebAppUrl] = useState(getGasWebAppUrl());
  const [syncEnabled, setLocalSyncEnabled] = useState(isGasSyncEnabled());
  const [copiedCode, setCopiedCode] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; spreadsheetName?: string; spreadsheetUrl?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'code' | 'instructions'>('settings');

  // Load configuration from server on mount
  useEffect(() => {
    fetch('/api/gas-config')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.url) {
          setLocalWebAppUrl(data.url);
          setGasWebAppUrl(data.url);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = webAppUrl.trim();
    setGasWebAppUrl(cleanUrl);
    setGasSyncEnabled(syncEnabled);

    setIsSaving(true);
    try {
      const res = await fetch('/api/gas-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: data.message || 'บันทึกการตั้งค่า Google Sheets สำเร็จ และระบบจะสำรองข้อมูล Real-time อัตโนมัติทุกครั้ง',
          spreadsheetName: data.data?.spreadsheetName,
          spreadsheetUrl: data.data?.spreadsheetUrl,
        });
      } else {
        setTestResult({
          success: false,
          message: data.message || 'บันทึกลงเครื่องแล้ว แต่เชื่อมต่อไปยัง Google Apps Script ไม่สำเร็จ',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: true,
        message: 'บันทึกการตั้งค่าลงเบราว์เซอร์เรียบร้อยแล้ว (จะซิงค์ Real-time อัตโนมัติ)',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleTestConnection = async () => {
    if (!webAppUrl.trim()) {
      setTestResult({ success: false, message: 'กรุณากรอก Google Apps Script Web App URL ก่อนทดสอบ' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/gas-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webAppUrl.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: data.message,
          spreadsheetName: data.data?.spreadsheetName,
          spreadsheetUrl: data.data?.spreadsheetUrl,
        });
      } else {
        setTestResult({ success: false, message: data.message || 'เชื่อมต่อไม่สำเร็จ' });
      }
    } catch (err: any) {
      const localRes = await testGasConnection(webAppUrl.trim());
      setTestResult(localRes);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/30 flex items-center justify-center border border-emerald-500/30">
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h2 className="font-semibold text-base tracking-tight">
                เชื่อมต่อ Google Sheets & Google Apps Script
              </h2>
              <p className="text-xs text-slate-400">
                ซิงค์ข้อมูลคำขอลง Google Sheets และส่งอีเมลแจ้งเตือนผ่านบัญชีกูเกิลของคณะฯ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'border-indigo-600 text-indigo-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ตั้งค่า URL ปลายทาง
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'code'
                ? 'border-indigo-600 text-indigo-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            โค้ด Google Apps Script (Code.gs)
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'instructions'
                ? 'border-indigo-600 text-indigo-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            วิธีติดตั้งทีละขั้นตอน
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'settings' && (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="p-3.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold">การทำงานแบบ Headless Google Sheets:</span>
                  <p className="text-slate-600 leading-relaxed">
                    เมื่อผู้ใช้งานส่งคำขอ ระบบจะส่งข้อมูลไปบันทึกที่ Google Spreadsheet อัตโนมัติ พร้อมส่งอีเมลแจ้งเตือนถึงผู้เกี่ยวข้องผ่าน Google Apps Script
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Google Apps Script Web App URL:
                </label>
                <input
                  type="url"
                  value={webAppUrl}
                  onChange={(e) => setLocalWebAppUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-2.5 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  id="enableSync"
                  checked={syncEnabled}
                  onChange={(e) => setLocalSyncEnabled(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
                <label htmlFor="enableSync" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  เปิดใช้งานการซิงค์ข้อมูลลง Google Sheets อัตโนมัติ (Auto-Sync)
                </label>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium border flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  {isTesting ? (
                    <div className="w-3.5 h-3.5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                  ทดสอบการเชื่อมต่อ (Ping)
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" /> บันทึกการตั้งค่า
                </button>
              </div>
            </form>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  คัดลอกโค้ดนี้ไปวางใน Google Apps Script (Code.gs):
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> คัดลอกแล้ว!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> คัดลอกโค้ดทั้งหมด
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
                {GOOGLE_APPS_SCRIPT_CODE}
              </pre>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 text-sm mb-0.5">ขั้นตอนการติดตั้ง Google Apps Script (5 นาที)</h4>
                <p className="text-slate-600 text-xs">
                  ช่วยให้คณะสัตวแพทยศาสตร์มีฐานข้อมูล Google Sheets เป็นของตัวเองและส่งอีเมลแจ้งเตือนอัตโนมัติฟรี
                </p>
              </div>

              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li>เปิด <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold underline inline-flex items-center gap-0.5">Google Sheets ใหม่ <ExternalLink className="w-3 h-3" /></a></li>
                <li>ตั้งชื่อไฟล์ว่า <strong>KKU Vet Lab Requests Database</strong></li>
                <li>ไปที่เมนู <strong>ส่วนขยาย (Extensions) &gt; Apps Script</strong></li>
                <li>ลบโค้ดเดิมทั้งหมดออก แล้ววางโค้ดจากแท็บ <strong>"โค้ด Google Apps Script"</strong> ลงไป</li>
                <li>กด <strong>บันทึก (Save)</strong> จากนั้นกดปุ่มสีฟ้า <strong>ทำให้ใช้งานได้ (Deploy) &gt; การปรับใช้รายการใหม่ (New deployment)</strong></li>
                <li>เลือกประเภท <strong>เว็บแอป (Web app)</strong></li>
                <li>ตั้งค่า <strong>ผู้ที่มีสิทธิ์เข้าถึง (Who has access):</strong> เลือก <strong>ทุกคน (Anyone)</strong></li>
                <li>กด <strong>ทำให้ใช้งานได้ (Deploy)</strong> และให้สิทธิ์การเข้าถึง (Authorize access)</li>
                <li>คัดลอก <strong>Web App URL</strong> ที่ได้ มาวางในแท็บ <strong>"ตั้งค่า URL ปลายทาง"</strong> ของระบบนี้</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
