import React, { useState, useEffect } from 'react';
import {
  Building2,
  Wrench,
  FlaskConical,
  FileText,
  Search,
  Mail,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  X,
  Sparkles,
  ChevronRight,
  User,
  Info,
  Clock,
  Printer,
  Calendar,
  ExternalLink,
  ShieldAlert,
  LogOut,
  Crown,
  Microscope,
  Menu,
  Phone,
  Layers,
  ArrowRight,
  HelpCircle,
  LayoutDashboard,
  Workflow,
} from 'lucide-react';
import { FormType, VetLabRequest } from './types';
import { FormVetLab02 } from './components/FormVetLab02';
import { FormVetLab03 } from './components/FormVetLab03';
import { FormVetLab04 } from './components/FormVetLab04';
import { RegulationsView } from './components/RegulationsView';
import { DashboardView } from './components/DashboardView';
import { MyRequestsView } from './components/MyRequestsView';
import { PrintableDocument } from './components/PrintableDocument';
import { SuccessModal } from './components/SuccessModal';
import { QuickTrackModal } from './components/QuickTrackModal';
import { AdminReviewModal } from './components/AdminReviewModal';
import { EmailOutboxModal } from './components/EmailOutboxModal';
import { GasSettingsModal } from './components/GasSettingsModal';
import { LoginView } from './components/LoginView';
import { isGasConfigured } from './utils/gasService';
import { apiGetRequestById } from './utils/apiClient';
import {
  getUserRoleInfo,
  getStoredAuthUser,
  clearAuthUser,
  AuthUser,
} from './utils/staffData';

export function App() {
  // Authentication State
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => getStoredAuthUser());

  // Navigation active tab
  const [activeTab, setActiveTab] = useState<FormType | 'REGULATIONS' | 'DASHBOARD' | 'MY_REQUESTS'>('VET_LAB_02');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [selectedPrintRequest, setSelectedPrintRequest] = useState<VetLabRequest | null>(null);
  const [selectedReviewRequest, setSelectedReviewRequest] = useState<VetLabRequest | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<VetLabRequest | null>(null);
  const [showQuickTrack, setShowQuickTrack] = useState(false);
  const [quickTrackNo, setQuickTrackNo] = useState<string | undefined>(undefined);
  const [showOutbox, setShowOutbox] = useState(false);
  const [showGasSettings, setShowGasSettings] = useState(false);
  const [pendingReviewTarget, setPendingReviewTarget] = useState<string | null>(null);

  const currentUserEmail = authUser?.email || '';
  const currentUserName = authUser?.name || '';
  const roleInfo = getUserRoleInfo(currentUserEmail);
  const isSuperAdmin =
    roleInfo.role === 'admin' ||
    currentUserEmail.trim().toLowerCase() === 'lakkch@kku.ac.th';

  // Adjust active tab if user switches role
  useEffect(() => {
    if (authUser) {
      if (!roleInfo.isStaff && activeTab === 'DASHBOARD') {
        setActiveTab('MY_REQUESTS');
      }
    }
  }, [roleInfo.isStaff, authUser]);

  const handleOpenPrintByTracking = async (trackingNo: string) => {
    try {
      const res = await apiGetRequestById(trackingNo);
      if (res.success && res.data) {
        setSelectedPrintRequest(res.data);
      }
    } catch (e) {
      console.error('Failed to load document for print:', e);
    }
  };

  const handleOpenReviewByTracking = async (trackingNo: string) => {
    try {
      const res = await apiGetRequestById(trackingNo);
      if (res.success && res.data) {
        setSelectedReviewRequest(res.data);
      }
    } catch (e) {
      console.error('Failed to load request for review:', e);
    }
  };

  // Check URL query for direct tracking, reviewing, or printing from email links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const track = params.get('track') || params.get('trackingNo');
    const action = params.get('action');
    const id = params.get('id');
    const target = (track || id || '').trim();

    if (target) {
      if (action === 'review') {
        setPendingReviewTarget(target);
        if (authUser) {
          handleOpenReviewByTracking(target);
        }
      } else if (action === 'print') {
        handleOpenPrintByTracking(target);
      } else {
        setQuickTrackNo(target);
        setShowQuickTrack(true);
      }
    }
  }, [authUser]);

  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    if (pendingReviewTarget) {
      handleOpenReviewByTracking(pendingReviewTarget);
      setPendingReviewTarget(null);
    } else if (user.isStaff) {
      setActiveTab('DASHBOARD');
    } else {
      setActiveTab('VET_LAB_02');
    }
  };

  const handleLogout = () => {
    clearAuthUser();
    setAuthUser(null);
  };

  const handleFormSubmitSuccess = (request: VetLabRequest) => {
    setSubmittedRequest(request);
  };

  // 1. Direct PDF Document View from Email (Available even before login)
  if (selectedPrintRequest) {
    return (
      <PrintableDocument
        request={selectedPrintRequest}
        onClose={() => {
          setSelectedPrintRequest(null);
          const url = new URL(window.location.href);
          url.searchParams.delete('action');
          url.searchParams.delete('id');
          url.searchParams.delete('trackingNo');
          url.searchParams.delete('track');
          window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
        }}
      />
    );
  }

  // 2. If user is not logged in, render the Login Gate
  if (!authUser) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        initialMessage={
          pendingReviewTarget
            ? `โปรดเข้าสู่ระบบเพื่อเข้าพิจารณาคำขอรหัส: ${pendingReviewTarget}`
            : undefined
        }
      />
    );
  }

  return (
    <div className="min-h-screen cosmic-space-bg text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-clip">
      {/* Cosmic Light Stars Background Layer */}
      <div className="fixed inset-0 cosmic-stars opacity-85 pointer-events-none animate-twinkle z-0" />

      {/* Cosmic Nebula Glow Ambient Lights (Light Space Theme) */}
      <div className="fixed -top-40 -left-40 w-[550px] h-[550px] bg-purple-300/25 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-40 w-[550px] h-[550px] bg-cyan-300/25 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed -bottom-40 left-1/4 w-[650px] h-[650px] bg-indigo-300/25 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Google 4-Color Accent Line */}
      <div className="fixed top-0 left-0 right-0 h-1 flex z-50 shadow-[0_0_12px_rgba(66,133,244,0.3)]">
        <div className="w-1/4 bg-[#4285f4]"></div>
        <div className="w-1/4 bg-[#ea4335]"></div>
        <div className="w-1/4 bg-[#fbbc04]"></div>
        <div className="w-1/4 bg-[#34a853]"></div>
      </div>

      {/* Top Navigation Header - Cosmic Light Glass */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-indigo-100/90 shadow-[0_2px_16px_rgba(99,102,241,0.06)] relative">
        <div className="max-w-[1750px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Mobile Menu Button & Brand */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-900 transition-colors cursor-pointer border border-indigo-100"
                title="เปิด/ปิด เมนูนำทาง"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div
                className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group select-none"
                onClick={() => setActiveTab(roleInfo.isStaff ? 'DASHBOARD' : 'VET_LAB_02')}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 text-white flex items-center justify-center shrink-0 group-hover:shadow-[0_0_16px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-all shadow-md">
                  <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-sm sm:text-base font-extrabold tracking-tight bg-gradient-to-r from-indigo-950 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
                      KKU Vet Lab
                    </span>
                    <span className="text-sm font-bold text-indigo-600 tracking-tight hidden min-[420px]:inline">
                      Online Forms
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 hidden md:inline-flex shadow-2xs">
                      FVM KKU
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-normal hidden lg:block">
                    ระบบบริการและจัดการแบบฟอร์มห้องปฏิบัติการ คณะสัตวแพทยศาสตร์ มข.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Quick Track Button */}
              <button
                type="button"
                onClick={() => setShowQuickTrack(true)}
                className="px-3 sm:px-4 py-1.5 rounded-full bg-white/90 hover:bg-indigo-50 text-slate-800 hover:text-indigo-900 border border-indigo-200 hover:border-indigo-400 text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-xs shrink-0"
                title="ค้นหาหรือติดตามคำขอด้วยรหัส Tracking"
              >
                <Search className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="hidden md:inline">ค้นหา / ติดตามคำขอ</span>
                <span className="hidden sm:inline md:hidden">ติดตามคำขอ</span>
              </button>

              {/* Email Outbox & Google Sheets (Visible to Super Admin) */}
              {isSuperAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowOutbox(true)}
                    className="flex px-2.5 sm:px-3 py-1.5 rounded-full bg-white/90 hover:bg-orange-50 text-slate-700 hover:text-orange-900 border border-orange-200/80 hover:border-orange-300 text-xs font-medium items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
                    title="ตั้งค่าและดูประวัติการส่งอีเมลแจ้งเตือน (เฉพาะผู้ดูแลระบบ)"
                  >
                    <Mail className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span className="hidden md:inline">ระบบอีเมล</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowGasSettings(true)}
                    className={`flex px-2.5 sm:px-3.5 py-1.5 rounded-full border text-xs font-medium items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0 ${
                      isGasConfigured()
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100/80 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                        : 'bg-white/90 text-slate-700 border-indigo-200/80 hover:bg-indigo-50'
                    }`}
                    title="เชื่อมต่อ Google Sheets & Apps Script (เฉพาะผู้ดูแลระบบ)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="hidden sm:inline">Google Sheets</span>
                    {isGasConfigured() && <span className="font-bold text-emerald-600">✓</span>}
                  </button>
                </>
              )}

              {/* Account Profile Chip */}
              <div
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-full bg-white/90 border border-indigo-200/80 select-none shadow-xs text-slate-800 shrink-0"
                title={`${authUser.name} (${authUser.email})`}
              >
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs ${
                    roleInfo.role === 'admin'
                      ? 'bg-purple-600'
                      : roleInfo.role === 'head'
                      ? 'bg-amber-600'
                      : roleInfo.role === 'scientist'
                      ? 'bg-blue-600'
                      : 'bg-emerald-600'
                  }`}
                >
                  {roleInfo.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  {roleInfo.role === 'head' && <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  {roleInfo.role === 'scientist' && <Microscope className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  {roleInfo.role === 'applicant' && <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-semibold text-slate-900 max-w-[120px] truncate leading-tight">
                    {authUser.name}
                  </div>
                  <div className="text-[10px] text-indigo-600/90 leading-none font-medium">
                    {roleInfo.role === 'admin'
                      ? 'ผู้ดูแลระบบ'
                      : roleInfo.role === 'head'
                      ? 'หัวหน้าห้องปฏิบัติการ'
                      : roleInfo.role === 'scientist'
                      ? 'นักวิชาการวิทยาศาสตร์'
                      : 'ผู้ขอรับบริการ'}
                  </div>
                </div>
              </div>

              {/* Sign-Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer active:scale-95 shadow-xs shrink-0"
                title="ออกจากระบบ (Sign Out)"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="hidden sm:inline text-xs">ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Layout: Fixed Left Sidebar + Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1750px] mx-auto min-h-[calc(100vh-4rem)] relative z-10">
        {/* Mobile Sidebar Backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Fixed Left Sidebar - Cosmic Light Glass */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 sm:w-80 bg-white/85 backdrop-blur-xl border-r border-indigo-100/90 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-16 lg:self-start lg:h-[calc(100vh-4rem)] lg:overflow-y-auto flex flex-col justify-between shrink-0 shadow-[4px_0_24px_rgba(99,102,241,0.04)] ${
            mobileMenuOpen ? 'translate-x-0 shadow-2xl z-50' : '-translate-x-full'
          }`}
        >
          <div className="p-4 sm:p-5 space-y-6">
            {/* Mobile Header in Drawer */}
            <div className="flex items-center justify-between pb-3 border-b border-indigo-100 lg:hidden">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div className="font-bold text-sm text-slate-900">เมนูนำทาง</div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SECTION 1: Menu Bar */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-900/80 px-2 mb-2.5 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>เมนูหลัก (MAIN MENU)</span>
              </div>

              <nav aria-label="Main Menu" className="space-y-2">
                {/* Menu 1: VET.LAB 01 - Regulations (Warm Amber/Gold) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('REGULATIONS');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                    activeTab === 'REGULATIONS'
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-950 border-amber-300 font-semibold shadow-[0_2px_12px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/40'
                      : 'bg-white/80 hover:bg-amber-50/50 text-slate-700 hover:text-amber-950 border-slate-200/90 hover:border-amber-300'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      activeTab === 'REGULATIONS'
                        ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-[0_2px_8px_rgba(245,158,11,0.35)]'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1 leading-snug">
                    <div className="text-sm font-bold truncate text-slate-900">
                      VET.LAB 01 ระเบียบ & คู่มือ
                    </div>
                    <div className={`text-xs truncate ${activeTab === 'REGULATIONS' ? 'text-amber-800 font-medium' : 'text-slate-500'}`}>
                      ข้อปฏิบัติความปลอดภัย
                    </div>
                  </div>
                </button>

                {/* Menu 2: VET.LAB 02 - Lab Rooms (Royal Blue) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('VET_LAB_02');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                    activeTab === 'VET_LAB_02'
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-950 border-blue-300 font-semibold shadow-[0_2px_12px_rgba(59,130,246,0.15)] ring-1 ring-blue-400/40'
                      : 'bg-white/80 hover:bg-blue-50/50 text-slate-700 hover:text-blue-950 border-slate-200/90 hover:border-blue-300'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      activeTab === 'VET_LAB_02'
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_2px_8px_rgba(59,130,246,0.35)]'
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1 leading-snug">
                    <div className="text-sm font-bold truncate text-slate-900">
                      VET.LAB 02 ขอใช้ห้องแล็บ
                    </div>
                    <div className={`text-xs truncate ${activeTab === 'VET_LAB_02' ? 'text-blue-800 font-medium' : 'text-slate-500'}`}>
                      จองห้องปฏิบัติการ 6 สาขา
                    </div>
                  </div>
                </button>

                {/* Menu 3: VET.LAB 03 - Instruments (Emerald/Teal Green) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('VET_LAB_03');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                    activeTab === 'VET_LAB_03'
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-950 border-emerald-300 font-semibold shadow-[0_2px_12px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400/40'
                      : 'bg-white/80 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-950 border-slate-200/90 hover:border-emerald-300'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      activeTab === 'VET_LAB_03'
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.35)]'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1 leading-snug">
                    <div className="text-sm font-bold truncate text-slate-900">
                      VET.LAB 03 ขอใช้เครื่องมือ
                    </div>
                    <div className={`text-xs truncate ${activeTab === 'VET_LAB_03' ? 'text-emerald-800 font-medium' : 'text-slate-500'}`}>
                      เครื่องมือวิจัย & วิเคราะห์
                    </div>
                  </div>
                </button>

                {/* Menu 4: VET.LAB 04 - Chemicals (Vivid Purple/Violet) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('VET_LAB_04');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                    activeTab === 'VET_LAB_04'
                      ? 'bg-gradient-to-r from-purple-50 to-fuchsia-50 text-purple-950 border-purple-300 font-semibold shadow-[0_2px_12px_rgba(168,85,247,0.15)] ring-1 ring-purple-400/40'
                      : 'bg-white/80 hover:bg-purple-50/50 text-slate-700 hover:text-purple-950 border-slate-200/90 hover:border-purple-300'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      activeTab === 'VET_LAB_04'
                        ? 'bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-[0_2px_8px_rgba(168,85,247,0.35)]'
                        : 'bg-purple-100 text-purple-700 border border-purple-200'
                    }`}
                  >
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1 leading-snug">
                    <div className="text-sm font-bold truncate text-slate-900">
                      VET.LAB 04 ขอเบิกสารเคมี
                    </div>
                    <div className={`text-xs truncate ${activeTab === 'VET_LAB_04' ? 'text-purple-800 font-medium' : 'text-slate-500'}`}>
                      วัสดุสิ้นเปลือง & สาร
                    </div>
                  </div>
                </button>

                {/* Menu 5: Request Management & Status Portal */}
                {roleInfo.isStaff ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('DASHBOARD');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                      activeTab === 'DASHBOARD'
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-950 border-indigo-300 font-semibold shadow-[0_2px_12px_rgba(99,102,241,0.15)] ring-1 ring-indigo-400/40'
                        : 'bg-white/80 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-950 border-slate-200/90 hover:border-indigo-300'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        activeTab === 'DASHBOARD'
                          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-[0_2px_8px_rgba(99,102,241,0.35)]'
                          : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1 leading-snug">
                      <div className="text-sm font-bold truncate flex items-center gap-1.5 text-slate-900">
                        <span>รายการคำขอ & การอนุมัติ</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold tracking-wide shadow-2xs">Staff</span>
                      </div>
                      <div className={`text-xs truncate ${activeTab === 'DASHBOARD' ? 'text-indigo-800 font-medium' : 'text-slate-500'}`}>
                        พิจารณา & มอบหมาย
                      </div>
                    </div>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('MY_REQUESTS');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                      activeTab === 'MY_REQUESTS'
                        ? 'bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-950 border-cyan-300 font-semibold shadow-[0_2px_12px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/40'
                        : 'bg-white/80 hover:bg-cyan-50/50 text-slate-700 hover:text-cyan-950 border-slate-200/90 hover:border-cyan-300'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        activeTab === 'MY_REQUESTS'
                          ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-[0_2px_8px_rgba(6,182,212,0.35)]'
                          : 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1 leading-snug">
                      <div className="text-sm font-bold truncate text-slate-900">
                        คำขอรับบริการของฉัน
                      </div>
                      <div className={`text-xs truncate ${activeTab === 'MY_REQUESTS' ? 'text-cyan-800 font-medium' : 'text-slate-500'}`}>
                        ติดตามสถานะคำขอ
                      </div>
                    </div>
                  </button>
                )}
              </nav>
            </div>

            {/* SECTION 2: Service Workflow Steps */}
            <div className="pt-4 border-t border-indigo-100/90">
              {/* Highlighted Workflow Header Banner */}
              <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white px-3.5 py-2.5 rounded-2xl shadow-sm mb-3 flex items-center justify-between border border-indigo-400/30 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-cyan-400/20 rounded-full blur-md pointer-events-none"></div>
                <div className="flex items-center gap-2 relative z-10">
                  <div className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-2xs">
                    <Workflow className="w-4 h-4 text-cyan-200" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                      <span>ขั้นตอนการบริการ</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-white/20 text-cyan-200 border border-cyan-400/30 backdrop-blur-xs relative z-10">
                  WORKFLOW
                </span>
              </div>

              <div className="relative pl-3 space-y-3 before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-amber-400 before:via-blue-400 before:to-emerald-400">
                {/* Step 1: ศึกษาระเบียบ (01) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('REGULATIONS');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full group flex items-start gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer relative z-10 border ${
                    activeTab === 'REGULATIONS'
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50/80 border-amber-300 shadow-xs ring-1 ring-amber-400/40'
                      : 'bg-white/70 border-slate-200/70 hover:bg-amber-50/50 hover:border-amber-200'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-transform group-hover:scale-110 ${
                      activeTab === 'REGULATIONS'
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xs'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    1
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs sm:text-sm font-bold ${activeTab === 'REGULATIONS' ? 'text-amber-950' : 'text-slate-900'}`}>
                      ศึกษาระเบียบ (01)
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      ทำความเข้าใจกฎและข้อปฏิบัติ
                    </div>
                  </div>
                </button>

                {/* Step 2: ยื่นแบบฟอร์ม (02-04) */}
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'REGULATIONS' || activeTab === 'DASHBOARD' || activeTab === 'MY_REQUESTS') {
                      setActiveTab('VET_LAB_02');
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full group flex items-start gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer relative z-10 border ${
                    activeTab === 'VET_LAB_02' || activeTab === 'VET_LAB_03' || activeTab === 'VET_LAB_04'
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50/80 border-blue-300 shadow-xs ring-1 ring-blue-400/40'
                      : 'bg-white/70 border-slate-200/70 hover:bg-blue-50/50 hover:border-blue-200'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-transform group-hover:scale-110 ${
                      activeTab === 'VET_LAB_02' || activeTab === 'VET_LAB_03' || activeTab === 'VET_LAB_04'
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xs'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    2
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs sm:text-sm font-bold ${activeTab === 'VET_LAB_02' || activeTab === 'VET_LAB_03' || activeTab === 'VET_LAB_04' ? 'text-blue-950' : 'text-slate-900'}`}>
                      ยื่นแบบฟอร์ม (02-04)
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      กรอกข้อมูล & ลายมือชื่อดิจิทัล
                    </div>
                  </div>
                </button>

                {/* Step 3: รออนุมัติ / ติดตามคำขอ */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab(roleInfo.isStaff ? 'DASHBOARD' : 'MY_REQUESTS');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full group flex items-start gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer relative z-10 border ${
                    activeTab === 'DASHBOARD' || activeTab === 'MY_REQUESTS'
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50/80 border-emerald-300 shadow-xs ring-1 ring-emerald-400/40'
                      : 'bg-white/70 border-slate-200/70 hover:bg-emerald-50/50 hover:border-emerald-200'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-transform group-hover:scale-110 ${
                      activeTab === 'DASHBOARD' || activeTab === 'MY_REQUESTS'
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-xs'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    3
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs sm:text-sm font-bold ${activeTab === 'DASHBOARD' || activeTab === 'MY_REQUESTS' ? 'text-emerald-950' : 'text-slate-900'}`}>
                      {roleInfo.isStaff ? 'พิจารณา & มอบหมาย' : 'ติดตามสถานะคำขอ'}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {roleInfo.isStaff ? 'เจ้าหน้าที่พิจารณาอนุมัติ' : 'ตรวจผลการพิจารณาทางออนไลน์'}
                    </div>
                  </div>
                </button>

                {/* Step 4: เข้ารับบริการ */}
                <div className="w-full flex items-start gap-3 p-2.5 rounded-xl text-left relative z-10 bg-gradient-to-r from-purple-50/70 to-indigo-50/70 border border-purple-200/80">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                    4
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-bold text-purple-950">
                      เข้ารับบริการ
                    </div>
                    <div className="text-xs text-purple-700 mt-0.5">
                      เข้าใช้งานตามวันเวลาที่อนุมัติ
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Footer Help Contact */}
          <div className="p-4 border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 m-3 rounded-2xl text-xs sm:text-sm text-slate-700 space-y-1.5 shadow-xs">
            <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-indigo-600" />
              <span>ติดต่อห้องปฏิบัติการ</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              คณะสัตวแพทยศาสตร์ มข. โทร. 043-009700 ต่อ 45412 (วัน-เวลาราชการ)
            </p>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8">
            {activeTab === 'REGULATIONS' && (
              <RegulationsView
                onGoToForm02={() => setActiveTab('VET_LAB_02')}
                onGoToForm03={() => setActiveTab('VET_LAB_03')}
                onGoToForm04={() => setActiveTab('VET_LAB_04')}
              />
            )}

            {activeTab === 'VET_LAB_02' && (
              <FormVetLab02
                onSubmitSuccess={handleFormSubmitSuccess}
                onPreviewPrint={(req) => setSelectedPrintRequest(req)}
                initialApplicantName={authUser.name}
                initialEmail={authUser.email}
                initialPhone={authUser.phone}
                initialDepartment={authUser.department}
                initialStudentId={authUser.studentId}
              />
            )}

            {activeTab === 'VET_LAB_03' && (
              <FormVetLab03
                onSubmitSuccess={handleFormSubmitSuccess}
                onPreviewPrint={(req) => setSelectedPrintRequest(req)}
                initialApplicantName={authUser.name}
                initialEmail={authUser.email}
                initialPhone={authUser.phone}
                initialDepartment={authUser.department}
                initialStudentId={authUser.studentId}
              />
            )}

            {activeTab === 'VET_LAB_04' && (
              <FormVetLab04
                onSubmitSuccess={handleFormSubmitSuccess}
                onPreviewPrint={(req) => setSelectedPrintRequest(req)}
                initialApplicantName={authUser.name}
                initialEmail={authUser.email}
                initialPhone={authUser.phone}
                initialDepartment={authUser.department}
                initialStudentId={authUser.studentId}
              />
            )}

            {activeTab === 'MY_REQUESTS' && (
              <MyRequestsView
                onSelectRequestForPrint={(req) => setSelectedPrintRequest(req)}
                onNewRequest={(form) => setActiveTab(form)}
                currentUserEmail={currentUserEmail}
              />
            )}

            {activeTab === 'DASHBOARD' && (
              roleInfo.isStaff ? (
                <DashboardView
                  onSelectRequestForReview={(req) => setSelectedReviewRequest(req)}
                  onSelectRequestForPrint={(req) => setSelectedPrintRequest(req)}
                  onOpenOutbox={() => setShowOutbox(true)}
                  onOpenGasSettings={() => setShowGasSettings(true)}
                  currentUserEmail={currentUserEmail}
                />
              ) : (
                <MyRequestsView
                  onSelectRequestForPrint={(req) => setSelectedPrintRequest(req)}
                  onNewRequest={(form) => setActiveTab(form)}
                  currentUserEmail={currentUserEmail}
                />
              )
            )}
          </main>

          {/* Cosmic Light Footer */}
          <footer className="bg-white/90 backdrop-blur-xl border-t border-indigo-100 text-xs text-slate-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    KKU
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-indigo-950">KKU Vet Lab</span>
                      <span className="text-indigo-600">Online Forms System</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      งานห้องปฏิบัติการ งานวิจัยและบริการวิชาการ คณะสัตวแพทยศาสตร์ มข.
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-center md:text-right text-xs text-slate-500">
                  <div>
                    © 2026 Faculty of Veterinary Medicine, Khon Kaen University. All rights reserved.
                  </div>
                  <div className="text-slate-600 font-medium">
                    ผู้พัฒนาระบบ: <strong className="text-slate-800">นางสาวลักขณา ฉันทะกลาง</strong>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
      {/* Modals */}
      {selectedPrintRequest && (
        <PrintableDocument
          request={selectedPrintRequest}
          onClose={() => setSelectedPrintRequest(null)}
        />
      )}

      {selectedReviewRequest && (
        <AdminReviewModal
          request={selectedReviewRequest}
          onClose={() => setSelectedReviewRequest(null)}
          onSaved={() => {
            setSelectedReviewRequest(null);
          }}
          onPrint={(req) => {
            setSelectedReviewRequest(null);
            setSelectedPrintRequest(req);
          }}
          currentUserEmail={currentUserEmail}
        />
      )}

      {submittedRequest && (
        <SuccessModal
          request={submittedRequest}
          onClose={() => setSubmittedRequest(null)}
          onPrint={(req) => {
            setSubmittedRequest(null);
            setSelectedPrintRequest(req);
          }}
          onGoToDashboard={() => {
            setSubmittedRequest(null);
            setActiveTab(roleInfo.isStaff ? 'DASHBOARD' : 'MY_REQUESTS');
          }}
        />
      )}

      {showQuickTrack && (
        <QuickTrackModal
          isOpen={showQuickTrack}
          initialTrackingNo={quickTrackNo}
          onClose={() => {
            setShowQuickTrack(false);
            setQuickTrackNo(undefined);
          }}
          onSelectPrint={(req) => setSelectedPrintRequest(req)}
          onOpenPrint={(tracking) => handleOpenPrintByTracking(tracking)}
          onOpenReview={(tracking) => handleOpenReviewByTracking(tracking)}
        />
      )}

      {showOutbox && isSuperAdmin && (
        <EmailOutboxModal
          isOpen={showOutbox}
          onClose={() => setShowOutbox(false)}
          onOpenReview={(tracking) => handleOpenReviewByTracking(tracking)}
          onOpenPrint={(tracking) => handleOpenPrintByTracking(tracking)}
        />
      )}

      {showGasSettings && isSuperAdmin && (
        <GasSettingsModal
          isOpen={showGasSettings}
          onClose={() => setShowGasSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
