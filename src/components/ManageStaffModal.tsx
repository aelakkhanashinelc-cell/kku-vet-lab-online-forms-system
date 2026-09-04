import React, { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Mail, User, Building, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { getFlatPresetStaff, getAllStaffEmails, Scientist } from '../utils/staffData';

interface ManageStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStaffUpdated: () => void;
}

export const ManageStaffModal: React.FC<ManageStaffModalProps> = ({
  isOpen,
  onClose,
  onStaffUpdated,
}) => {
  const [customStaffList, setCustomStaffList] = useState<Scientist[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('นักวิชาการวิทยาศาสตร์');
  const [department, setDepartment] = useState('งานห้องปฏิบัติการ งานวิจัยและบริการวิชาการ');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCustomStaff();
    }
  }, [isOpen]);

  const loadCustomStaff = () => {
    try {
      const stored = localStorage.getItem('vetlab_custom_staff_records');
      if (stored) {
        setCustomStaffList(JSON.parse(stored));
      } else {
        setCustomStaffList([]);
      }
    } catch {
      setCustomStaffList([]);
    }
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFeedback('กรุณากรอกชื่อและอีเมลให้ครบถ้วน');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const newEntry: Scientist = {
      name: name.trim(),
      email: cleanEmail,
      position: position.trim() || 'นักวิชาการวิทยาศาสตร์',
      department: department.trim() || 'งานห้องปฏิบัติการ',
    };

    const existing = customStaffList.filter((s) => s.email.toLowerCase() !== cleanEmail);
    const updated = [...existing, newEntry];

    localStorage.setItem('vetlab_custom_staff_records', JSON.stringify(updated));

    // Also update custom emails array
    const customEmails = updated.map((s) => s.email);
    localStorage.setItem('vetlab_custom_staff_emails', JSON.stringify(customEmails));

    setCustomStaffList(updated);
    setName('');
    setEmail('');
    setFeedback('เพิ่มรายชื่อนักวิทยาศาสตร์สำเร็จ');
    setTimeout(() => setFeedback(null), 3000);
    onStaffUpdated();
  };

  const handleDeleteStaff = (emailToDelete: string) => {
    const updated = customStaffList.filter((s) => s.email.toLowerCase() !== emailToDelete.toLowerCase());
    localStorage.setItem('vetlab_custom_staff_records', JSON.stringify(updated));

    const customEmails = updated.map((s) => s.email);
    localStorage.setItem('vetlab_custom_staff_emails', JSON.stringify(customEmails));

    setCustomStaffList(updated);
    onStaffUpdated();
  };

  if (!isOpen) return null;

  const presetStaff = getFlatPresetStaff();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">จัดการรายชื่อนักวิชาการวิทยาศาสตร์ & ผู้มีสิทธิ์</h2>
              <p className="text-xs text-slate-300">
                เพิ่มชื่อและอีเมลผู้มีสิทธิ์เข้าถึงรายการคำขอ & พิจารณาอนุมัติ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Add Staff Form */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-indigo-600" /> เพิ่มนักวิชาการวิทยาศาสตร์ / เจ้าหน้าที่ใหม่
            </h3>

            <form onSubmit={handleAddStaff} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ชื่อ - นามสกุล *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น นายสมศักดิ์ รักวิทยา"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  อีเมล (@kku.ac.th) *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="เช่น somsak.r@kku.ac.th"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ตำแหน่ง
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="เช่น นักวิชาการวิทยาศาสตร์"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  สังกัด / กลุ่มงาน
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="เช่น งานห้องปฏิบัติการ"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between pt-2">
                {feedback ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-4 h-4" /> {feedback}
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px]">
                    เมื่อเพิ่มแล้ว อีเมลนี้จะสามารถเข้าถึงเมนู "รายการคำขอ & การอนุมัติ" ได้ทันที
                  </span>
                )}

                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer"
                >
                  + บันทึกรายชื่อ
                </button>
              </div>
            </form>
          </div>

          {/* Current Staff List */}
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-3">
              รายชื่อผู้มีสิทธิ์ในระบบปัจจุบัน ({presetStaff.length} ท่าน)
            </h3>

            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {presetStaff.map((staff, idx) => {
                const isCustom = customStaffList.some(
                  (c) => c.email.toLowerCase() === staff.email.toLowerCase()
                );
                return (
                  <div
                    key={idx}
                    className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span>{staff.name}</span>
                        {staff.email === 'lakkch@kku.ac.th' && (
                          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
                            ผู้ดูแลระบบ
                          </span>
                        )}
                        {(staff.email === 'sutvir@kku.ac.th' || staff.email === 'suthidaj@kku.ac.th' || staff.email === 'sutvir@kku.ac.th') && (
                          <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded text-[10px] font-bold">
                            หัวหน้างาน
                          </span>
                        )}
                        {isCustom && (
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                            เพิ่มใหม่
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 font-mono text-[11px]">{staff.email} • {staff.dept}</div>
                    </div>

                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteStaff(staff.email)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="ลบรายชื่อนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
