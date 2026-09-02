export type FormType = 'VET_LAB_01' | 'VET_LAB_02' | 'VET_LAB_03' | 'VET_LAB_04';

export type ApplicantRole = 'faculty_staff' | 'student' | 'external' | 'other';

export type WorkType = 'teaching' | 'research' | 'special_problem' | 'other';

export type TimeSlot = 'official_hours' | 'after_hours' | 'both';

export type RequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'dispensed'
  | 'approved_by_head';

export interface SignatureData {
  dataUrl?: string;
  name: string;
  date: string;
}

export interface LabItem02 {
  id: string;
  no: number;
  labName: string;
  remarks: string;
}

export interface EquipmentItem03 {
  id: string;
  no: number;
  itemName: string;
  quantity: string;
  remarksLab: string;
  isFieldEquipment?: boolean;
}

export interface ChemicalItem04 {
  id: string;
  no: number;
  itemName: string;
  quantity: string;
  remarks: string;
}

export interface EmailLog {
  id: string;
  sentAt: string;
  to: string;
  subject: string;
  type?: 'submission_receipt' | 'admin_notification' | 'approval_update' | 'custom';
  status: 'sent' | 'simulated' | 'failed';
  htmlBody: string;
  trackingNo?: string;
  error?: string;
  mode?: 'smtp' | 'simulated' | 'gas';
}

export interface VetLabRequest {
  id: string;
  trackingNo: string;
  formType: FormType;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  submissionDateTh: string; // e.g. "24 สิงหาคม 2569"

  // Part 1: Applicant Information
  applicantName: string;
  role: ApplicantRole;
  studentId?: string;
  otherRoleText?: string;
  department: string;
  phone: string;
  email: string;
  workType: WorkType;
  workTypeOtherText?: string;
  projectTitle: string;

  // Form-specific Part 1 details
  // VET.LAB 02
  labItems?: LabItem02[];
  timeSlot?: TimeSlot;
  durationDays?: number;
  startDate?: string;
  endDate?: string;

  // VET.LAB 03
  equipmentItems?: EquipmentItem03[];
  equipmentType?: 'lab_based' | 'field_based' | 'both';

  // VET.LAB 04
  chemicalItems?: ChemicalItem04[];
  pickupDate?: string;
  pickupTime?: string;

  // Acknowledgement & Signatures
  termsAccepted: boolean;
  applicantSignature: SignatureData;
  advisorSignature: SignatureData;

  // Part 2: Head of Lab (หัวหน้างานห้องปฏิบัติการ งานวิจัยและบริการวิชาการ)
  part2?: {
    approvalStatus: 'approved' | 'rejected' | 'forwarded' | 'pending';
    comment?: string;
    rejectionReason?: string;
    forwardTo?: string;
    signature: SignatureData;
    reviewedAt?: string;
    assignedStaffName?: string;
    assignedStaffEmail?: string;
    assignedStaffDepartment?: string;
    assignedStaffComment?: string;
  };

  // Part 3: Scientist in charge (นักวิชาการวิทยาศาสตร์ผู้รับผิดชอบ)
  part3?: {
    // For VET.LAB 02
    approvalStatus?: 'approved' | 'rejected' | 'other' | 'pending';
    comment?: string;
    rejectionReason?: string;
    otherText?: string;
    signature?: SignatureData;

    // For VET.LAB 03 (Equipment condition checks)
    beforeConditionCheck?: string;
    beforeCheckApplicantSignature?: SignatureData;
    afterConditionCheck?: string;
    afterCheckOfficerSignature?: SignatureData;

    // For VET.LAB 04 (Chemical dispensing & expenses)
    isDispensed?: boolean;
    dispenserSignature?: SignatureData;
    isReceived?: boolean;
    receiverSignature?: SignatureData;
    expenses?: number[]; // [cost1, cost2, cost3, cost4, cost5]
    totalExpense?: number;
    reviewedAt?: string;
  };

  emailLogs?: EmailLog[];
}

export interface FormSubmissionPayload
  extends Omit<VetLabRequest, 'id' | 'trackingNo' | 'status' | 'createdAt' | 'updatedAt'> {
  id?: string;
}
