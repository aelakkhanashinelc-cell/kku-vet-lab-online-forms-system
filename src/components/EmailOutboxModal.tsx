import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertCircle,
  Settings,
  KeyRound,
  ShieldCheck,
  ExternalLink,
  Info,
  Server,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { EmailLog } from '../types';

interface EmailOutboxModalProps {
  onClose: () => void;
  onOpenReview?: (trackingNo: string) => void;
  onOpenPrint?: (trackingNo: string) => void;
  isOpen?: boolean;
}

interface SmtpConfigState {
  configured: boolean;
  host: string;
  port: number;
  user: string;
  hasPass: boolean;
  secure: boolean;
  adminEmail: string;
  senderName: string;
}

export const EmailOutboxModal: React.FC<EmailOutboxModalProps> = ({
  onClose,
  onOpenReview,
  onOpenPrint,
}) => {
  const [activeTab, setActiveTab] = useState<'outbox' | 'settings'>('outbox');
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Test Email form
  const [testEmailInput, setTestEmailInput] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // SMTP Settings form
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfigState>({
    configured: false,
    host: 'smtp.gmail.com',
    port: 465,
    user: '',
    hasPass: false,
    secure: true,
    adminEmail: 'sutvir@kku.ac.th',
    senderName: 'งานห้องปฏิบัติการฯ คณะสัตวแพทยศาสตร์ มข.',
  });
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState<number>(465);
  const [smtpSecure, setSmtpSecure] = useState(true);
  const [smtpAdminEmail, setSmtpAdminEmail] = useState('sutvir@kku.ac.th');
  const [smtpSenderName, setSmtpSenderName] = useState('งานห้องปฏิบัติการฯ คณะสัตวแพทยศาสตร์ มข.');
  const [showPass, setShowPass] = useState(false);
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [smtpNotice, setSmtpNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch emails and SMTP config
  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/emails');
      const json = await res.json();
      if (json.success) {
        setEmails(json.data);
        if (json.data.length > 0 && !selectedEmail) {
          setSelectedEmail(json.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSmtpConfig = async () => {
    try {
      const res = await fetch('/api/smtp-config');
      const json = await res.json();
      if (json.success) {
        setSmtpConfig(json);
        setSmtpUser(json.user || '');
        setSmtpHost(json.host || 'smtp.gmail.com');
        setSmtpPort(json.port || 465);
        setSmtpSecure(json.secure ?? true);
        setSmtpAdminEmail(json.adminEmail || 'suthidaj@kku.ac.th');
        setSmtpSenderName(json.senderName || 'งานห้องปฏิบัติการฯ คณะสัตวแพทยศาสตร์ มข.');
        if (!testEmailInput && json.user) {
          setTestEmailInput(json.user);
        }
      }
    } catch (err) {
      console.error('Failed to load SMTP config', err);
    }
  };

  useEffect(() => {
    fetchEmails();
    fetchSmtpConfig();
  }, []);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = testEmailInput.trim() || smtpUser;
    if (!target) {
      setStatusNotice({ type: 'error', message: 'กรุณากรอกอีเมลปลายทางที่จะทดสอบส่ง' });
      return;
    }
    setIsSendingTest(true);
    setStatusNotice(null);
    try {
      const res = await fetch('/api/emails/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail: target }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusNotice({ type: 'success', message: json.message || 'ส่งอีเมลทดสอบเรียบร้อยแล้ว!' });
        fetchEmails();
      } else {
        setStatusNotice({ type: 'error', message: json.message || 'ส่งอีเมลไม่สำเร็จ' });
        fetchEmails();
      }
    } catch (err: any) {
      setStatusNotice({ type: 'error', message: 'เกิดข้อผิดพลาด: ' + err.message });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpUser.trim()) {
      setSmtpNotice({ type: 'error', message: 'กรุณาระบุอีเมลผู้ส่ง (เช่น user@kku.ac.th หรือ user@gmail.com)' });
      return;
    }
    if (!smtpPass.trim() && !smtpConfig.hasPass) {
      setSmtpNotice({ type: 'error', message: 'กรุณากรอกรหัสผ่านแอป 16 หลัก (Google App Password)' });
      return;
    }

    setIsSavingSmtp(true);
    setSmtpNotice(null);

    try {
      const res = await fetch('/api/smtp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: smtpUser.trim(),
          pass: smtpPass.trim() || undefined,
          host: smtpHost.trim(),
          port: Number(smtpPort),
          secure: smtpSecure,
          adminEmail: smtpAdminEmail.trim(),
          senderName: smtpSenderName.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSmtpNotice({ type: 'success', message: json.message });
        await fetchSmtpConfig();
        setSmtpPass('');
      } else {
        setSmtpNotice({ type: 'error', message: json.message || 'การตรวจสอบสิทธิ์ไม่สำเร็จ' });
      }
    } catch (err: any) {
      setSmtpNotice({ type: 'error', message: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้: ' + err.message });
    } finally {
      setIsSavingSmtp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full h-[88vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
              <Mail className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="font-semibold text-base flex items-center gap-2 tracking-tight text-white">
                ระบบจัดการอีเมลและการแจ้งเตือน (Email Notification Center)
              </h2>
              <p className="text-xs text-slate-400">
                ส่งอีเมลแจ้งเตือนจริงถึงผู้ยื่นคำขอ อาจารย์ที่ปรึกษา และหัวหน้าห้องปฏิบัติการ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {smtpConfig.configured ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                SMTP พร้อมส่งจริง ({smtpConfig.user})
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-amber-950/80 text-amber-300 border border-amber-500/40 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                โหมดจำลอง (ยังไม่ตั้งค่า SMTP)
              </span>
            )}
            <button
              onClick={() => {
                fetchEmails();
                fetchSmtpConfig();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('outbox')}
            className={`pb-2.5 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'outbox'
                ? 'border-orange-600 text-orange-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            ประวัติการส่งอีเมล (Outbox Logs)
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-200 text-[10px] text-slate-700 font-bold">
              {emails.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2.5 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'border-orange-600 text-orange-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            ตั้งค่าอีเมลส่งจริง (SMTP / Gmail)
            {!smtpConfig.configured && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* TAB 1: Outbox List & Preview */}
        {activeTab === 'outbox' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Quick Test Send Bar */}
            <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <form onSubmit={handleSendTest} className="flex items-center gap-2 w-full sm:w-auto">
                <span className="font-semibold text-slate-700 whitespace-nowrap">ทดสอบส่งอีเมลจริง:</span>
                <input
                  type="email"
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  placeholder={smtpConfig.user || 'ใส่อีเมลของคุณเพื่อทดสอบ เช่น xxx@kku.ac.th'}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none w-64 font-normal"
                />
                <button
                  type="submit"
                  disabled={isSendingTest}
                  className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSendingTest ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  {isSendingTest ? 'กำลังส่ง...' : 'ทดสอบส่ง'}
                </button>
              </form>

              {statusNotice && (
                <div
                  className={`text-xs px-3 py-1 rounded-md border font-medium flex items-center gap-1.5 ${
                    statusNotice.type === 'success'
                      ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                      : 'text-red-800 bg-red-50 border-red-200'
                  }`}
                >
                  {statusNotice.type === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  )}
                  <span>{statusNotice.message}</span>
                </div>
              )}

              {!smtpConfig.configured && !statusNotice && (
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className="text-amber-700 hover:text-amber-800 underline font-medium flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  ยังไม่ตั้งค่าส่งจริง คลิกที่นี่เพื่อเชื่อมต่อบัญชีอีเมล
                </button>
              )}
            </div>

            {/* 2-Column Split: List on Left, Preview on Right */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* List Sidebar */}
              <div className="w-full md:w-5/12 border-r border-slate-200 overflow-y-auto bg-slate-50/50 divide-y divide-slate-100">
                {isLoading ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    กำลังโหลดประวัติอีเมล...
                  </div>
                ) : emails.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    ยังไม่มีประวัติการส่งอีเมล
                  </div>
                ) : (
                  emails.map((mail) => (
                    <div
                      key={mail.id}
                      onClick={() => setSelectedEmail(mail)}
                      className={`p-3.5 cursor-pointer transition-colors ${
                        selectedEmail?.id === mail.id
                          ? 'bg-orange-50/80 border-l-4 border-orange-600 shadow-2xs'
                          : 'hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-800 truncate max-w-[200px]">
                          {mail.to}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(mail.sentAt).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 line-clamp-1 mb-1">
                        {mail.subject}
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-slate-500">{mail.trackingNo || 'SYSTEM'}</span>
                        {mail.status === 'sent' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ส่งจริงสำเร็จ (SMTP)
                          </span>
                        ) : mail.status === 'failed' ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-700 font-medium border border-red-200"
                            title={mail.error || 'ส่งไม่สำเร็จ'}
                          >
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            ส่งไม่สำเร็จ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium border border-amber-200">
                            <Info className="w-3 h-3 text-amber-600" />
                            จำลองการส่ง
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Email Preview on Right */}
              <div className="w-full md:w-7/12 flex-1 flex flex-col overflow-hidden bg-white">
                {selectedEmail ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Email Info Bar */}
                    <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 text-xs space-y-1.5">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-slate-500">ส่งถึง (To):</span>{' '}
                          <strong className="text-slate-900">{selectedEmail.to}</strong>
                        </div>
                        <div className="text-slate-500 font-mono text-[11px]">
                          {new Date(selectedEmail.sentAt).toLocaleString('th-TH')}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500">หัวเรื่อง (Subject):</span>{' '}
                        <span className="font-semibold text-slate-900">{selectedEmail.subject}</span>
                      </div>

                      {/* Error Banner if failed */}
                      {selectedEmail.status === 'failed' && selectedEmail.error && (
                        <div className="bg-red-50 text-red-800 p-2 rounded border border-red-200 text-[11px] flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <strong>สาเหตุที่ส่งไม่สำเร็จ:</strong> {selectedEmail.error}
                          </div>
                        </div>
                      )}

                      {/* Attachment & Action Row */}
                      <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                          <span>สถานะ:</span>
                          <span className="font-semibold">
                            {selectedEmail.status === 'sent'
                              ? 'ส่งจริงสำเร็จผ่าน Mail Server'
                              : selectedEmail.status === 'failed'
                              ? 'เกิดข้อผิดพลาดในการส่ง'
                              : 'บันทึกในระบบ (ยังไม่เปิดโหมดส่งจริง)'}
                          </span>
                        </div>

                        {selectedEmail.trackingNo && (
                          <div className="flex items-center gap-1.5">
                            {onOpenReview && (
                              <button
                                type="button"
                                onClick={() => {
                                  onOpenReview(selectedEmail.trackingNo!);
                                  onClose();
                                }}
                                className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium text-xs flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                              >
                                เปิดพิจารณาคำขอ
                              </button>
                            )}
                            {onOpenPrint && (
                              <button
                                type="button"
                                onClick={() => {
                                  onOpenPrint(selectedEmail.trackingNo!);
                                  onClose();
                                }}
                                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md font-medium text-xs flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                              >
                                ดูเอกสารฉบับพิมพ์
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rendered HTML */}
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
                      <div className="bg-white rounded-lg shadow-2xs border border-slate-200 overflow-hidden">
                        <iframe
                          srcDoc={selectedEmail.htmlBody}
                          title="Email HTML Preview"
                          className="w-full min-h-[500px] border-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                    เลือกอีเมลจากรายการด้านซ้ายเพื่อดูตัวอย่างเนื้อหา
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SMTP / Gmail Settings */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Status Header Box */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  smtpConfig.configured
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}
              >
                {smtpConfig.configured ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  <div className="font-semibold text-sm">
                    {smtpConfig.configured
                      ? 'ระบบเปิดใช้งานส่งอีเมลจริงเรียบร้อยแล้ว'
                      : 'ระบบยังทำงานในโหมดจำลอง (ยังไม่ได้เชื่อมต่อบัญชีส่งอีเมลจริง)'}
                  </div>
                  <p className="mt-1 leading-relaxed">
                    {smtpConfig.configured
                      ? `อีเมลผู้ส่งปัจจุบันคือ ${smtpConfig.user} ทุกครั้งที่มีการยื่นคำขอหรือพิจารณาอนุมัติ ระบบจะส่งอีเมลแจ้งเตือนไปยังผู้เกี่ยวข้องจริงทันที`
                      : 'กรุณากรอกอีเมลและ App Password ด้านล่างเพื่อให้ระบบสามารถส่งข้อความแจ้งเตือนหาอาจารย์และผู้ยื่นคำขอได้จริง'}
                  </p>
                </div>
              </div>

              {/* Settings Form */}
              <form onSubmit={handleSaveSmtp} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Server className="w-4 h-4 text-orange-600" />
                  <h3 className="text-sm font-semibold text-slate-800">
                    ข้อมูลบัญชีส่งออกอีเมล (SMTP Credentials)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Sender Email */}
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      อีเมลผู้ส่ง (Gmail หรือ @kku.ac.th) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="เช่น yourname@kku.ac.th หรือ user@gmail.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-xs"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      ระบบจะใช้อีเมลนี้เป็นตัวแทนในการส่งออกข้อความแจ้งเตือนทั้งหมด
                    </p>
                  </div>

                  {/* App Password */}
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>รหัสผ่านสำหรับแอป (Google App Password 16 หลัก) <span className="text-red-500">*</span></span>
                      {smtpConfig.hasPass && (
                        <span className="text-[11px] text-emerald-600 font-normal">
                          ✓ มีรหัสผ่านเดิมบันทึกอยู่แล้ว (เว้นว่างได้หากไม่ต้องการเปลี่ยน)
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={smtpPass}
                        onChange={(e) => setSmtpPass(e.target.value)}
                        placeholder={smtpConfig.hasPass ? '•••••••••••••••• (พิมพ์ใหม่เพื่อเปลี่ยน)' : 'เช่น abcd efgh ijkl mnop'}
                        className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                      <Info className="w-3 h-3 shrink-0" />
                      <strong>ข้อสำคัญ:</strong> ไม่ใช่รหัสผ่านล็อกอิน Gmail ปกติ ต้องเป็น <strong>รหัสผ่านสำหรับแอป 16 หลัก</strong> เท่านั้น (ดูวิธีสร้างด้านล่าง)
                    </p>
                  </div>

                  {/* Sender Name */}
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      ชื่อผู้ส่งที่แสดงในกล่องข้อความ (Sender Display Name)
                    </label>
                    <input
                      type="text"
                      value={smtpSenderName}
                      onChange={(e) => setSmtpSenderName(e.target.value)}
                      placeholder="งานห้องปฏิบัติการฯ คณะสัตวแพทยศาสตร์ มข."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-xs"
                    />
                  </div>

                  {/* Admin Email */}
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      อีเมลหัวหน้างานสำหรับรับแจ้งคำขอใหม่ (Admin / Head of Lab)
                    </label>
                    <input
                      type="email"
                      value={smtpAdminEmail}
                      onChange={(e) => setSmtpAdminEmail(e.target.value)}
                      placeholder="suthidaj@kku.ac.th"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-xs"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      เมื่อผู้ขอส่งแบบฟอร์มใหม่ ระบบจะส่งอีเมลแจ้งเตือนพร้อมปุ่มเปิดพิจารณาไปยังอีเมลนี้ทันที
                    </p>
                  </div>

                  {/* SMTP Host */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">SMTP Server</label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-xs font-mono"
                    />
                  </div>

                  {/* SMTP Port */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Port</label>
                    <select
                      value={smtpPort}
                      onChange={(e) => {
                        const p = Number(e.target.value);
                        setSmtpPort(p);
                        setSmtpSecure(p === 465);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-xs"
                    >
                      <option value={465}>465 (SSL / แนะนำสำหรับ Gmail)</option>
                      <option value={587}>587 (TLS / STARTTLS)</option>
                    </select>
                  </div>
                </div>

                {/* Feedback Notice */}
                {smtpNotice && (
                  <div
                    className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                      smtpNotice.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}
                  >
                    {smtpNotice.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>{smtpNotice.message}</div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="submit"
                    disabled={isSavingSmtp}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingSmtp ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {isSavingSmtp ? 'กำลังทดสอบเชื่อมต่อกับ Mail Server...' : 'บันทึกและทดสอบการเชื่อมต่อ'}
                  </button>
                </div>
              </form>

              {/* Guide Card: How to get Google App Password */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-orange-600" />
                    วิธีสร้างรหัสผ่านสำหรับแอป (Google App Password 16 หลัก)
                  </h4>
                  <a
                    href="https://myaccount.google.com/security"
                    target="_blank"
                    rel="noreferrer"
                    className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 underline"
                  >
                    ไปที่ Google Account
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-2 text-slate-600 leading-relaxed">
                  <p>
                    เนื่องจากบัญชี Google และอีเมลมหาวิทยาลัย (@kku.ac.th) มีระบบความปลอดภัยสูง จึงไม่อนุญาตให้ใช้รหัสผ่านล็อกอินตามปกติส่งอีเมลได้ ให้ทำตาม 4 ขั้นตอนนี้เพื่อรับรหัสผ่าน 16 หลัก:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
                    <li>
                      เข้าสู่ระบบ Google แล้วไปที่เมนู <strong>ความปลอดภัย (Security)</strong> หรือเปิด{' '}
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noreferrer"
                        className="text-orange-600 underline font-medium"
                      >
                        myaccount.google.com/apppasswords
                      </a>
                    </li>
                    <li>
                      ตรวจสอบว่าได้เปิด <strong>"การยืนยันแบบ 2 ขั้นตอน (2-Step Verification)"</strong> ไว้เรียบร้อยแล้ว
                    </li>
                    <li>
                      ในช่องค้นหาหรือด้านล่าง ให้เลือก <strong>"รหัสผ่านสำหรับแอป" (App Passwords)</strong>
                    </li>
                    <li>
                      ตั้งชื่อแอป เช่น <code>KKU Vet Lab</code> แล้วกด <strong>"สร้าง" (Create)</strong>
                    </li>
                    <li>
                      คัดลอกรหัสผ่าน 16 ตัวอักษรสีเหลือง (เช่น <code>abcd efgh ijkl mnop</code>) มาวางในช่อง <strong>รหัสผ่านสำหรับแอป</strong> ด้านบนแล้วกดบันทึก
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
