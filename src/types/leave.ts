/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 6 User Roles as per Specification 2.1
export type UserRole = 
  | 'officer'       // 👮 บุคลากร: ยื่นลา ดูประวัติ ดูวันลาคงเหลือ
  | 'supervisor'    // 👮 หัวหน้างาน: ตรวจสอบการลาของผู้ใต้บังคับบัญชา
  | 'inspector'     // 📋 ผู้ตรวจสอบ: ตรวจสอบเอกสารและความถูกต้อง
  | 'approver'      // ✍️ ผู้อนุมัติ: อนุมัติ / ไม่อนุมัติ / ส่งกลับแก้ไข
  | 'admin'         // ⚙️ Admin: จัดการบุคลากร ระบบ และการตั้งค่า
  | 'superintendent'; // ⭐ ผู้กำกับ: ดูภาพรวม อนุมัติ และพิมพ์รายงาน

// 6 Main Departments & Sub-departments as per Specification #21
export type DepartmentCode = 
  | 'superintendent'  // 1. ผกก.
  | 'suppression'     // 2. งานป้องกันปราบปราม
  | 'investigation'   // 3. งานสอบสวน
  | 'inquiry'         // 4. งานสืบสวน
  | 'administration'  // 5. งานอำนวยการ
  | 'traffic';        // 6. งานจราจร

export interface SubDepartment {
  id: string;
  name: string;
  deptCode: DepartmentCode;
}

export const DEPARTMENTS = [
  { code: 'superintendent' as DepartmentCode, name: 'ผู้กำกับการ (ผกก.)' },
  { code: 'suppression' as DepartmentCode, name: 'งานป้องกันปราบปราม' },
  { code: 'investigation' as DepartmentCode, name: 'งานสอบสวน' },
  { code: 'inquiry' as DepartmentCode, name: 'งานสืบสวน' },
  { code: 'administration' as DepartmentCode, name: 'งานอำนวยการ' },
  { code: 'traffic' as DepartmentCode, name: 'งานจราจร' },
];

export const SUB_DEPARTMENTS: SubDepartment[] = [
  // 1. ผกก.
  { id: '1.0', name: 'ผกก.สภ.ศรีสงคราม', deptCode: 'superintendent' },

  // 2. งานป้องกันปราบปราม
  { id: '2.1', name: 'รอง ผกก.ป.', deptCode: 'suppression' },
  { id: '2.2', name: 'สวป.', deptCode: 'suppression' },
  { id: '2.3', name: 'ร้อยเวรป้องกันปราบปราม', deptCode: 'suppression' },
  { id: '2.4', name: 'สายตรวจรถยนต์', deptCode: 'suppression' },
  { id: '2.5', name: 'สายตรวจรถจักรยานยนต์', deptCode: 'suppression' },
  { id: '2.6', name: 'ประจำวัน', deptCode: 'suppression' },
  { id: '2.7', name: 'สิบเวร/ยาม/ประชาสัมพันธ์', deptCode: 'suppression' },
  { id: '2.8', name: 'วิทยุสื่อสาร', deptCode: 'suppression' },
  { id: '2.9', name: 'ธุรการป้องกันปราบปราม', deptCode: 'suppression' },

  // 3. งานสอบสวน
  { id: '3.1', name: 'รอง ผกก.(สอบสวน)', deptCode: 'investigation' },
  { id: '3.2', name: 'สว.(สอบสวน)', deptCode: 'investigation' },
  { id: '3.3', name: 'สว.สอบสวน (หน.คดี)', deptCode: 'investigation' },
  { id: '3.4', name: 'พนักงานสอบสวน', deptCode: 'investigation' },
  { id: '3.5', name: 'ผู้ช่วยพนักงานสอบสวน', deptCode: 'investigation' },
  { id: '3.6', name: 'เสมียนคดี / ธุรการประจำวัน', deptCode: 'investigation' },

  // 4. งานสืบสวน
  { id: '4.1', name: 'รอง ผกก.สส.', deptCode: 'inquiry' },
  { id: '4.2', name: 'สว.สส.', deptCode: 'inquiry' },
  { id: '4.3', name: 'เจ้าหน้าที่ชุดสืบสวน', deptCode: 'inquiry' },

  // 5. งานอำนวยการ
  { id: '5.1', name: 'สว.อก.', deptCode: 'administration' },
  { id: '5.2', name: 'ธุรการกำลังพล/การเงิน', deptCode: 'administration' },
  { id: '5.3', name: 'งานพัสดุและส่งกำลังบำรุง', deptCode: 'administration' },

  // 6. งานจราจร
  { id: '6.1', name: 'สว.จร. / ร้อยเวรจราจร', deptCode: 'traffic' },
  { id: '6.2', name: 'เจ้าหน้าที่จราจร', deptCode: 'traffic' },
];

export type LeaveType = 
  | 'vacation'     // ลาพักผ่อน (พ.)
  | 'sick'         // ลาป่วย (ป.)
  | 'personal'     // ลากิจส่วนตัว (ก.)
  | 'maternity'    // ลาคลอด
  | 'paternity'    // ลาเพื่อดูแลบุตรและภรรยาหลังคลอด (ลก.)
  | 'ordination'   // ลาอุปสมบท
  | 'education'    // ลาศึกษาต่อ/อบรม
  | 'official'     // ไปราชการ (ปก.)
  | 'ot'           // เบิก OT (OT)
  | 'assisting';   // ช่วยราชการ (ช่วย)

export interface LeaveTypeInfo {
  type: LeaveType;
  title: string;
  shortCode: string;
  emoji: string;
  badgeBg: string;
  badgeText: string;
  chartColor: string;
  maxDaysPerYear: number;
  countBusinessDaysOnly: boolean;
}

export const LEAVE_TYPES: Record<LeaveType, LeaveTypeInfo> = {
  vacation: {
    type: 'vacation',
    title: 'ลาพักผ่อน',
    shortCode: 'พ',
    emoji: '🏖️',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    badgeText: 'text-amber-700',
    chartColor: '#f59e0b',
    maxDaysPerYear: 10,
    countBusinessDaysOnly: true,
  },
  sick: {
    type: 'sick',
    title: 'ลาป่วย',
    shortCode: 'ป',
    emoji: '🩺',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
    badgeText: 'text-rose-700',
    chartColor: '#ef4444',
    maxDaysPerYear: 60,
    countBusinessDaysOnly: false,
  },
  personal: {
    type: 'personal',
    title: 'ลากิจส่วนตัว',
    shortCode: 'ก',
    emoji: '🧳',
    badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
    badgeText: 'text-sky-700',
    chartColor: '#0ea5e9',
    maxDaysPerYear: 45,
    countBusinessDaysOnly: true,
  },
  maternity: {
    type: 'maternity',
    title: 'ลาคลอดบุตร',
    shortCode: 'คลอด',
    emoji: '👶',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
    badgeText: 'text-purple-700',
    chartColor: '#a855f7',
    maxDaysPerYear: 90,
    countBusinessDaysOnly: false,
  },
  paternity: {
    type: 'paternity',
    title: 'ลาดูแลบุตรและภรรยาหลังคลอด',
    shortCode: 'ลก',
    emoji: '🍼',
    badgeBg: 'bg-teal-100 text-teal-800 border-teal-300',
    badgeText: 'text-teal-700',
    chartColor: '#14b8a6',
    maxDaysPerYear: 15,
    countBusinessDaysOnly: true,
  },
  ordination: {
    type: 'ordination',
    title: 'ลาอุปสมบท',
    shortCode: 'บวช',
    emoji: '🛕',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-300',
    badgeText: 'text-orange-700',
    chartColor: '#f97316',
    maxDaysPerYear: 120,
    countBusinessDaysOnly: false,
  },
  education: {
    type: 'education',
    title: 'ลาศึกษา ฝึกอบรม',
    shortCode: 'ศษ',
    emoji: '🎓',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    badgeText: 'text-indigo-700',
    chartColor: '#6366f1',
    maxDaysPerYear: 30,
    countBusinessDaysOnly: true,
  },
  official: {
    type: 'official',
    title: 'ไปราชการ',
    shortCode: 'ปก',
    emoji: '💼',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    badgeText: 'text-emerald-700',
    chartColor: '#10b981',
    maxDaysPerYear: 365,
    countBusinessDaysOnly: false,
  },
  ot: {
    type: 'ot',
    title: 'เบิก OT',
    shortCode: 'OT',
    emoji: '⏱️',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    badgeText: 'text-blue-700',
    chartColor: '#3b82f6',
    maxDaysPerYear: 365,
    countBusinessDaysOnly: false,
  },
  assisting: {
    type: 'assisting',
    title: 'ช่วยราชการ',
    shortCode: 'ช่วย',
    emoji: '🤝',
    badgeBg: 'bg-zinc-100 text-zinc-800 border-zinc-300',
    badgeText: 'text-zinc-700',
    chartColor: '#71717a',
    maxDaysPerYear: 365,
    countBusinessDaysOnly: false,
  },
};

export type LeaveStatus = 
  | 'pending_inspection'  // รอตรวจสอบเอกสาร
  | 'pending_approval'    // รออนุมัติ
  | 'approved'            // อนุมัติแล้ว
  | 'rejected'            // ไม่อนุมัติ
  | 'revision'            // ส่งกลับแก้ไข
  | 'cancelled';          // ยกเลิกคำขอ

export type TimeSlot = 'full' | 'morning' | 'afternoon';

export interface User {
  id: string;
  badgeNumber: string;        // เลขบัตร/เลขประจำตัว
  callsign: string;           // นามเรียกขาน เช่น ศรีสงคราม 503 หรือ SSK503
  username: string;           // รหัสผู้ใช้เข้าสู่ระบบ (เริ่มต้นคือนามเรียกขาน)
  passwordHash: string;       // รหัสผ่าน (สามารถดูได้โดยแอดมินตามข้อ 7)
  rank: string;               // ยศ เช่น ส.ต.ท., พ.ต.อ., ร.ต.อ.
  firstName: string;          // ชื่อ
  lastName: string;           // สกุล
  position: string;           // ตำแหน่ง เช่น ผบ.หมู่งานป้องกันปราบปราม
  department: DepartmentCode; // สายงานหลัก
  subDepartmentId: string;    // สายงานย่อย
  role: UserRole;             // สิทธิ์การใช้งาน 6 ระดับ
  phone: string;              // เบอร์โทรศัพท์
  address: string;            // ที่อยู่ติดต่อ
  accumulatedVacationDays: number; // วันลาพักผ่อนสะสม
  currentYearVacationQuota: number; // สิทธิลาพักผ่อนปีนี้
  usedVacationDays: number;
  usedSickDays: number;
  usedPersonalDays: number;
  isFirstLogin: boolean;      // บังคับเปลี่ยนรหัสผ่านครั้งแรก
  isLocked: boolean;          // ล็อกบัญชีเมื่อรหัสผิดหลายครั้ง
  failedAttempts: number;     // จำนวนครั้งที่กรอกผิด
  avatarUrl?: string;
}

export interface LeaveRequest {
  id: string;
  leaveNumber: string;        // เช่น สส.0068/2569
  fiscalYear: number;         // เช่น 2569
  userId: string;
  userRank: string;
  userFullName: string;
  userPosition: string;
  userDepartment: DepartmentCode;
  userSubDepartmentId: string;
  userCallsign: string;
  
  leaveType: LeaveType;
  reason: string;
  timeSlot: TimeSlot;         // เต็มวัน, ครึ่งวันเช้า, ครึ่งวันบ่าย
  startDate: string;          // YYYY-MM-DD
  endDate: string;            // YYYY-MM-DD
  totalDays: number;
  
  // Last leave record
  lastLeaveStartDate?: string;
  lastLeaveEndDate?: string;
  lastLeaveDays?: number;
  
  // Specific fields for different forms
  wifeName?: string;          // สำหรับลาดูแลบุตรและภรรยา
  wifeDeliveredDate?: string; // คลอดเมื่อ
  templeName?: string;        // สำหรับลาอุปสมบท ณ วัด
  templeLocation?: string;    // ตั้งอยู่ ณ
  resideTempleName?: string;  // จำพรรษา ณ วัด
  resideTempleLocation?: string; // ตั้งอยู่ ณ
  hasOrdainedBefore?: boolean; // เคย / ไม่เคยบวช
  
  contactAddress: string;
  contactPhone: string;
  attachmentName?: string;
  attachmentUrl?: string;
  
  // Staffing on duty calculation section (as per attached image requirement #20 & #29)
  dutyDepartmentText: string;  // ผู้ลาปฏิบัติหน้าที่...
  dutyTotalStaff: number;     // มีกำลังปฏิบัติหน้าที่ ... นาย
  dutyLeaveStaff: number;     // ลา ... นาย
  dutyRemainingStaff: number;  // เหลือกำลังปฏิบัติหน้าที่ ... นาย
  
  status: LeaveStatus;
  submittedAt: string;        // ISO Timestamp
  
  // Approval steps & timeline
  supervisorComment?: string;
  supervisorName?: string;
  supervisorDate?: string;
  
  inspectorComment?: string;
  inspectorName?: string;
  inspectorDate?: string;
  
  approverDecision?: 'approved' | 'rejected' | 'revision';
  approverReason?: string;
  approverName?: string;
  approverPosition?: string;
  approverDate?: string;
  
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  isRetroactive?: boolean;    // ยื่นย้อนหลัง
  retroactiveReason?: string;
}

export interface StationConfig {
  stationName: string;            // สถานีตำรวจภูธรศรีสงคราม
  stationNameEn: string;          // Si Songkhram Police Station
  stationAddress: string;
  stationPhone: string;           // เบอร์โทรศัพท์สถานีตำรวจ
  province: string;               // จังหวัดนครพนม
  region: string;                 // กองบัญชาการตำรวจภูธรภาค 4
  currentFiscalYear: number;      // 2568, 2569, ... 2580
  
  superintendentName: string;     // ชื่อ ผกก.สภ.ศรีสงคราม (พ.ต.อ. ถวิล คำเกษ)
  superintendentRank: string;     // พ.ต.อ.
  
  provincialCommanderName: string; // ชื่อ ผบก.ภ.จว.นครพนม (พล.ต.ต. อารักษ์ มะสาธานัง)
  provincialCommanderRank: string; // พล.ต.ต.
  
  inspectorName: string;          // ชื่อผู้ตรวจสอบเอกสาร
  inspectorRank: string;
  
  minimumStaffWarningRatio: number; // แจ้งเตือนเมื่อกำลังพลเหลือน้อยกว่า เช่น 70%
  sessionTimeoutMinutes: number;  // จัดการเซสชัน ออกจากระบบอัตโนมัติ
  actingApproverUserId?: string;  // ผู้ได้รับมอบหมายปฏิบัติราชการแทน
  logoUrl: string;
  isFiscalYearLocked: boolean;    // ปิดปีงบประมาณ
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'create' | 'edit' | 'delete' | 'approve' | 'reject' | 'cancel' | 'login' | 'logout' | 'password_reset' | 'config_update';
  targetType: 'leave_request' | 'personnel' | 'station_config' | 'system';
  targetId: string;
  details: string;
}

export interface OfficialHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  isCustom?: boolean;
}

export interface DailyDutyRecord {
  date: string;               // YYYY-MM-DD
  totalPoliceForce: number;   // กำลังพลทั้งหมด (เช่น 128)
  dutyStaff: number;          // กำลังปฏิบัติหน้าที่ (เช่น 122)
  leaveStaff: number;         // ผู้ลา (เช่น 4)
  remainingStaff: number;     // เหลือกำลังปฏิบัติหน้าที่ (118)
  notes?: string;
  updatedAt: string;
  updatedBy: string;
}
