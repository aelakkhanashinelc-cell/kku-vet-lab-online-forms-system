export interface Scientist {
  name: string;
  email: string;
  position?: string;
  department?: string;
}

// 1. ผู้ดูแลระบบ (Super Admin)
export const SUPER_ADMIN_EMAILS = [
  'lakkch@kku.ac.th', // นางสาวลักขณา ฉันทะกลาง
];

// 2. หัวหน้าห้องปฏิบัติการ (Head of Lab)
export const HEAD_OF_LAB_EMAILS = [
  'sutvir@kku.ac.th', // นางสุธิดา จันทร์ลุน (ตามที่ระบุในคำขอ)
  'suthidaj@kku.ac.th', // นางสุธิดา จันทร์ลุน (KKU Mail)
  'lakkch@kku.ac.th', // ผู้ดูแลระบบมีสิทธิ์กำกับดูแล
];

// 3. รายชื่อนักวิชาการวิทยาศาสตร์และบุคลากรห้องปฏิบัติการ แยกตามสาขาวิชา (ตามเอกสารทางการ)
export const STAFF_BY_DEPARTMENT: Record<string, Scientist[]> = {
  'สาขาวิชาสุขภาพหนึ่งเดียวและศาสตร์วินิจฉัย': [
    {
      name: 'นางสุธิดา จันทร์ลุน',
      email: 'sutvir@kku.ac.th',
      position: 'หัวหน้างานห้องปฏิบัติการ งานวิจัยและบริการวิชาการ / นักวิชาการวิทยาศาสตร์ ชำนาญการพิเศษ',
      department: 'สาขาวิชาสุขภาพหนึ่งเดียวและศาสตร์วินิจฉัย',
    },
    {
      name: 'นายชัยพร สร้อยคำ',
      email: 'schaiya@kku.ac.th',
      position: 'นักวิชาการวิทยาศาสตร์',
      department: 'สาขาวิชาสุขภาพหนึ่งเดียวและศาสตร์วินิจฉัย',
    },
    {
      name: 'นางปรียาภรณ์ สุระชน',
      email: 'presan@kku.ac.th',
      position: 'นักวิชาการวิทยาศาสตร์',
      department: 'สาขาวิชาสุขภาพหนึ่งเดียวและศาสตร์วินิจฉัย',
    },
    {
      name: 'นายประพันธ์ แก่นจำปา',
      email: 'prapanka@kku.ac.th',
      position: 'นักวิชาการวิทยาศาสตร์',
      department: 'สาขาวิชาสุขภาพหนึ่งเดียวและศาสตร์วินิจฉัย',
    },
    {
      name: 'นางสาวลักขณา ฉันทะกลาง',
      email: 'lakkch@kku.ac.th',
      position: 'ผู้ดูแลระบบ / นักวิชาการวิทยาศาสตร์',
      department: 'สาขาวิชาสุขภาพหนึ่งเดียวและศาสตร์วินิจฉัย',
    },
  ],
  'สาขาวิชาเวชศาสตร์คลินิกสัตว์บริโภค': [
    {
      name: 'นางสาวมนัสนันท์ บริสุทธิ์เพ็ชร',
      email: 'prabor@kku.ac.th',
      position: 'นักวิชาการวิทยาศาสตร์',
      department: 'สาขาวิชาเวชศาสตร์คลินิกสัตว์บริโภค',
    },
    {
      name: 'นางสาวกิ่งกาญจน์ สาระชู',
      email: 'kinsar@kku.ac.th',
      position: 'นักวิชาการวิทยาศาสตร์',
      department: 'สาขาวิชาเวชศาสตร์คลินิกสัตว์บริโภค',
    },
  ],
  'สาขาวิชาเวชศาสตร์คลินิกสัตว์เลี้ยง': [
    {
      name: 'นางสาวกิ่งกาญจน์ สาระชู',
      email: 'kinsar@kku.ac.th',
      position: 'นักวิชาการวิทยาศาสตร์',
      department: 'สาขาวิชาเวชศาสตร์คลินิกสัตว์เลี้ยง',
    },
    {
      name: 'นางสาวมนัสนันท์ บริสุทธิ์เพ็ชร',
      email: 'prabor@kku.ac.th',
      position: 'นักวิชาการวิทยาศาสตร์',
      department: 'สาขาวิชาเวชศาสตร์คลินิกสัตว์เลี้ยง',
    },
    {
      name: 'นางอรุณี ฤทธิภานันท์',
      email: 'arubut@kku.ac.th',
      position: 'นักวิชาการวิทยาศาสตร์',
      department: 'สาขาวิชาเวชศาสตร์คลินิกสัตว์เลี้ยง',
    },
    {
      name: 'นายพิทักษ์พงษ์ มณีรัตนรุ่งโรจน์',
      email: 'pitman@kku.ac.th',
      position: 'นักวิชาการวิทยาศาสตร์',
      department: 'สาขาวิชาเวชศาสตร์คลินิกสัตว์เลี้ยง',
    },
  ],
  'สาขาวิชาเวชศาสตร์โครงสร้างและหัตถการทางคลินิกสัตวแพทย์': [
    {
      name: 'นางพิณชอ กรมรัตนาพร',
      email: 'rvarun@kku.ac.th',
      position: 'นักวิชาการวิทยาศาสตร์',
      department: 'สาขาวิชาเวชศาสตร์โครงสร้างและหัตถการทางคลินิกสัตวแพทย์',
    },
    {
      name: 'นางสาวณัฐนรี กันทะสอน',
      email: 'natnka@kku.ac.th',
      position: 'นักวิชาการวิทยาศาสตร์',
      department: 'สาขาวิชาเวชศาสตร์โครงสร้างและหัตถการทางคลินิกสัตวแพทย์',
    },
    {
      name: 'นางพรรณชมพู ม่วงลาย',
      email: 'chomue@kku.ac.th',
      position: 'นักวิชาการวิทยาศาสตร์',
      department: 'สาขาวิชาเวชศาสตร์โครงสร้างและหัตถการทางคลินิกสัตวแพทย์',
    },
    {
      name: 'นายวีรยุทธ ชัยมณี',
      email: 'weeray@kku.ac.th',
      position: 'นักวิชาการวิทยาศาสตร์',
      department: 'สาขาวิชาเวชศาสตร์โครงสร้างและหัตถการทางคลินิกสัตวแพทย์',
    },
  ],
  'ห้องปฏิบัติการชันสูตรโรคทางปศุสัตว์': [
    {
      name: 'นางสาวพิมลภรณ์ เสียงล้ำ',
      email: 'phimsia@kku.ac.th',
      position: 'นักวิชาการวิทยาศาสตร์',
      department: 'ห้องปฏิบัติการชันสูตรโรคทางปศุสัตว์',
    },
    {
      name: 'นางสาวดวงดาว ขันบุตรศรี',
      email: 'duankh@kku.ac.th',
      position: 'นักวิชาการวิทยาศาสตร์',
      department: 'ห้องปฏิบัติการชันสูตรโรคทางปศุสัตว์',
    },
    {
      name: 'นางสาวจุฬามณี สุริยะภูมิ',
      email: 'julasu@kku.ac.th',
      position: 'นักวิชาการวิทยาศาสตร์',
      department: 'ห้องปฏิบัติการชันสูตรโรคทางปศุสัตว์',
    },
  ],
  'ผู้ประสานงานห้องปฏิบัติการ': [
    {
      name: 'นางรัตนา หลายวิวัฒน์',
      email: 'ratanada@kku.ac.th',
      position: 'ผู้ประสานงานห้องปฏิบัติการ / นักวิชาการวิทยาศาสตร์',
      department: 'ผู้ประสานงานห้องปฏิบัติการ',
    },
  ],
};

export const ADDITIONAL_STAFF_EMAILS: string[] = [];

// Helper to get all registered staff emails
export const getAllStaffEmails = (): string[] => {
  const emails = new Set<string>();

  SUPER_ADMIN_EMAILS.forEach((e) => emails.add(e.trim().toLowerCase()));
  HEAD_OF_LAB_EMAILS.forEach((e) => emails.add(e.trim().toLowerCase()));

  Object.values(STAFF_BY_DEPARTMENT).forEach((list) => {
    list.forEach((staff) => {
      emails.add(staff.email.trim().toLowerCase());
    });
  });

  ADDITIONAL_STAFF_EMAILS.forEach((email) => {
    emails.add(email.trim().toLowerCase());
  });

  // Support locally stored custom staff emails
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('vetlab_custom_staff_emails');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((e: string) => emails.add(e.trim().toLowerCase()));
        }
      }
    } catch {}
  }

  return Array.from(emails);
};

// Check if email belongs to Super Admin
export const isSuperAdmin = (email?: string): boolean => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return SUPER_ADMIN_EMAILS.includes(clean);
};

// Check if email belongs to Head of Lab
export const isHeadOfLab = (email?: string): boolean => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return HEAD_OF_LAB_EMAILS.includes(clean);
};

// Check if email belongs to any authorized staff member (Admin, Head, Scientist)
export const isStaffUser = (email?: string): boolean => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  const all = getAllStaffEmails();
  return all.includes(clean);
};

export interface UserRoleInfo {
  role: 'admin' | 'head' | 'scientist' | 'applicant';
  roleTitle: string;
  userName: string;
  isStaff: boolean;
  canApprovePart2: boolean;
  canApprovePart3: boolean;
  canDeleteRequests: boolean;
}

export interface AuthUser {
  name: string;
  email: string;
  department?: string;
  phone?: string;
  studentId?: string;
  role: 'admin' | 'head' | 'scientist' | 'applicant';
  roleTitle: string;
  isStaff: boolean;
  loggedInAt: string;
}

export const getStoredAuthUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('vetlab_auth_user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (user && user.email) {
      const roleInfo = getUserRoleInfo(user.email);
      return {
        ...user,
        role: roleInfo.role,
        roleTitle: roleInfo.roleTitle,
        isStaff: roleInfo.isStaff,
      };
    }
  } catch (e) {
    console.error('Error reading auth user:', e);
  }
  return null;
};

export const saveAuthUser = (user: AuthUser): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('vetlab_auth_user', JSON.stringify(user));
  } catch (e) {
    console.error('Error saving auth user:', e);
  }
};

export const clearAuthUser = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('vetlab_auth_user');
  } catch (e) {
    console.error('Error clearing auth user:', e);
  }
};

export const getUserRoleInfo = (email?: string): UserRoleInfo => {
  if (!email) {
    return {
      role: 'applicant',
      roleTitle: 'ผู้ขอรับบริการ (คนทั่วไป)',
      userName: 'ผู้ขอรับบริการ',
      isStaff: false,
      canApprovePart2: false,
      canApprovePart3: false,
      canDeleteRequests: false,
    };
  }

  const clean = email.trim().toLowerCase();

  if (isSuperAdmin(clean)) {
    return {
      role: 'admin',
      roleTitle: 'ผู้ดูแลระบบ (Super Admin) / นักวิชาการวิทยาศาสตร์',
      userName: 'นางสาวลักขณา ฉันทะกลาง',
      isStaff: true,
      canApprovePart2: true,
      canApprovePart3: true,
      canDeleteRequests: true,
    };
  }

  if (isHeadOfLab(clean)) {
    return {
      role: 'head',
      roleTitle: 'หัวหน้าห้องปฏิบัติการ (นักวิชาการวิทยาศาสตร์ ชำนาญการพิเศษ)',
      userName: 'นางสุธิดา จันทร์ลุน',
      isStaff: true,
      canApprovePart2: true,
      canApprovePart3: true,
      canDeleteRequests: true,
    };
  }

  if (isStaffUser(clean)) {
    // Find name from preset
    const flat = getFlatPresetStaff();
    const found = flat.find((f) => f.email.toLowerCase() === clean);
    return {
      role: 'scientist',
      roleTitle: 'นักวิชาการวิทยาศาสตร์ / ผู้ดูแลห้องปฏิบัติการ',
      userName: found ? found.name : 'นักวิชาการวิทยาศาสตร์',
      isStaff: true,
      canApprovePart2: false,
      canApprovePart3: true,
      canDeleteRequests: false,
    };
  }

  return {
    role: 'applicant',
    roleTitle: 'ผู้ขอรับบริการ (คนทั่วไป / นักศึกษา / นักวิจัย)',
    userName: 'ผู้ขอรับบริการ',
    isStaff: false,
    canApprovePart2: false,
    canApprovePart3: false,
    canDeleteRequests: false,
  };
};

export const getFlatPresetStaff = () => {
  const flatList: { name: string; email: string; dept: string; position?: string }[] = [];
  Object.entries(STAFF_BY_DEPARTMENT).forEach(([dept, list]) => {
    list.forEach((staff) => {
      flatList.push({
        name: staff.name,
        email: staff.email,
        dept: dept,
        position: staff.position,
      });
    });
  });

  // Support locally stored custom staff
  if (typeof window !== 'undefined') {
    try {
      const customStr = localStorage.getItem('vetlab_custom_staff_records');
      if (customStr) {
        const customList = JSON.parse(customStr);
        if (Array.isArray(customList)) {
          customList.forEach((c: any) => {
            if (c.email && !flatList.some((s) => s.email.toLowerCase() === c.email.toLowerCase())) {
              flatList.push({
                name: c.name || c.email,
                email: c.email,
                dept: c.dept || 'ห้องปฏิบัติการ',
                position: c.position || 'นักวิชาการวิทยาศาสตร์',
              });
            }
          });
        }
      }
    } catch {}
  }

  return flatList;
};
