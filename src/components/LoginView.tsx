import React, { useState } from 'react';
import {
  FlaskConical,
  User,
  Mail,
  ArrowRight,
  Info,
  Lock,
  Sparkles,
  Crown,
  ShieldCheck,
  Microscope,
} from 'lucide-react';
import { getUserRoleInfo, saveAuthUser, AuthUser } from '../utils/staffData';
import { logLoginToGoogleAppsScript } from '../utils/gasService';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
  initialMessage?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, initialMessage }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('กรุณาระบุชื่อ-สกุลของผู้เข้าใช้งาน');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('กรุณาระบุอีเมลที่ถูกต้อง (เช่น yourname@kku.ac.th)');
      return;
    }

    const roleInfo = getUserRoleInfo(email.trim());

    const authUser: AuthUser = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: 'คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น',
      role: roleInfo.role,
      roleTitle: roleInfo.roleTitle,
      isStaff: roleInfo.isStaff,
      loggedInAt: new Date().toISOString(),
    };

    saveAuthUser(authUser);

    // Record login event in Google Sheets (Sheet: เข้าสู่ระบบ) via server and client
    fetch('/api/auth/login-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: authUser,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '-',
      }),
    }).catch(() => {});

    logLoginToGoogleAppsScript(authUser).catch(() => {});

    onLoginSuccess(authUser);
  };


  return (
    <div className="min-h-screen cosmic-space-bg text-slate-800 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Cosmic Stars Layer */}
      <div className="absolute inset-0 cosmic-stars opacity-85 pointer-events-none animate-twinkle" />

      {/* Cosmic Light Nebula Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-300/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-cyan-300/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-indigo-300/25 rounded-full blur-3xl pointer-events-none" />

      {/* Google 4-Color Accent Header Bar at top */}
      <div className="fixed top-0 left-0 right-0 h-1 flex z-50 shadow-[0_0_12px_rgba(66,133,244,0.3)]">
        <div className="w-1/4 bg-[#4285f4]"></div>
        <div className="w-1/4 bg-[#ea4335]"></div>
        <div className="w-1/4 bg-[#fbbc04]"></div>
        <div className="w-1/4 bg-[#34a853]"></div>
      </div>

      <div className="max-w-[490px] mx-auto w-full relative z-10">
        {/* Main Cosmic Light Glass Sign-In Box */}
        <div className="bg-white/90 backdrop-blur-2xl border border-indigo-100/90 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(99,102,241,0.12)] relative overflow-hidden">
          {/* Subtle Top Inner Glow */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-60 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header Brand */}
          <div className="text-left mb-6">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.35)]">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-950 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
                    KKU Vet Lab
                  </span>
                  <span className="text-sm sm:text-base font-bold text-indigo-600">
                    Online Forms System
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-normal mt-0.5">
                  ระบบบริการและจัดการแบบฟอร์มห้องปฏิบัติการ คณะสัตวแพทยศาสตร์ มข.
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>ลงชื่อเข้าใช้</span>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </h1>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              เข้าสู่ระบบบริการห้องปฏิบัติการและเครื่องมือวิทยาศาสตร์ คณะสัตวแพทยศาสตร์ มหาวิทยาลัยขอนแก่น
            </p>
          </div>

          {initialMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-orange-50 border border-orange-200 text-orange-800 text-xs flex items-start gap-2.5 shadow-2xs">
              <Info className="w-4 h-4 shrink-0 text-orange-600 mt-0.5" />
              <div>
                <strong className="block font-semibold">การเข้าสู่ระบบเพื่อดำเนินการ:</strong>
                <span>{initialMessage}</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <Info className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ชื่อ - สกุล <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี หรือ ดร.สมศักดิ์"
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                อีเมล (KKU Mail หรือ Google Account) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="เช่น yourname@kku.ac.th"
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
              {email.trim().includes('@') && (() => {
                const info = getUserRoleInfo(email.trim());
                if (info.role === 'admin') {
                  return (
                    <div className="mt-2 p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center gap-2 animate-in fade-in">
                      <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>สถานะ: <strong>ผู้ดูแลระบบ (Super Admin)</strong></span>
                    </div>
                  );
                }
                if (info.role === 'head') {
                  return (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 animate-in fade-in">
                      <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>สถานะ: <strong>หัวหน้าห้องปฏิบัติการ (Head of Lab)</strong></span>
                    </div>
                  );
                }
                if (info.role === 'scientist') {
                  return (
                    <div className="mt-2 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2 animate-in fade-in">
                      <Microscope className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>สถานะ: <strong>นักวิชาการวิทยาศาสตร์ ({info.userName})</strong></span>
                    </div>
                  );
                }
                return (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
                    <User className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>สถานะ: <strong>ผู้ขอรับบริการทั่วไป (บุคคลทั่วไป / นักศึกษา)</strong></span>
                  </div>
                );
              })()}
            </div>

            {/* Cosmic Primary Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(79,70,229,0.35)] transition-all cursor-pointer hover:scale-[1.01] active:scale-95"
              >
                <span>ถัดไป</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>



          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-500" />
            <span>เชื่อมต่อกับระบบ Google Workspace คณะสัตวแพทยศาสตร์ มข.</span>
          </div>
        </div>

        {/* Bottom copyright & Developer Credit */}
        <div className="text-center text-xs text-slate-500 mt-6 space-y-1">
          <div>© 2026 Faculty of Veterinary Medicine, Khon Kaen University</div>
          <div className="text-slate-600 font-medium">
            ผู้พัฒนาระบบ: <strong className="text-slate-800">นางสาวลักขณา ฉันทะกลาง</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
