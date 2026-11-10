/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  User,
  LeaveRequest,
  StationConfig,
  AuditLog,
  OfficialHoliday,
  DailyDutyRecord,
  LeaveStatus,
  LeaveType,
  TimeSlot,
  DepartmentCode,
  LEAVE_TYPES,
} from '../types/leave';
import {
  INITIAL_USERS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_STATION_CONFIG,
  OFFICIAL_HOLIDAYS_DEFAULT,
  INITIAL_DAILY_DUTY,
} from '../data/initialData';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  leaveRequestId?: string;
  type: 'leave_submitted' | 'approved' | 'rejected' | 'revision' | 'cancelled' | 'system';
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  leaveRequests: LeaveRequest[];
  stationConfig: StationConfig;
  auditLogs: AuditLog[];
  holidays: OfficialHoliday[];
  dailyDuty: DailyDutyRecord;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  currentFiscalYear: number;
  availableFiscalYears: number[];
  
  // Auth methods
  login: (credential: string, password: string) => { success: boolean; message?: string; requirePasswordChange?: boolean };
  logout: () => void;
  switchUser: (userId: string) => void;
  changePassword: (newPassword: string) => boolean;
  adminResetPassword: (userId: string, newPassword?: string) => string;
  adminUnlockAccount: (userId: string) => void;
  
  // Personnel methods
  addPersonnel: (user: Omit<User, 'id' | 'isFirstLogin' | 'isLocked' | 'failedAttempts'>) => void;
  updatePersonnel: (user: User) => void;
  deletePersonnel: (userId: string) => void;
  
  // Leave methods
  createLeaveRequest: (data: Partial<LeaveRequest>) => { success: boolean; error?: string; leaveRequest?: LeaveRequest };
  updateLeaveRequest: (leaveId: string, data: Partial<LeaveRequest>) => boolean;
  cancelLeaveRequest: (leaveId: string, reason: string) => boolean;
  approveLeaveRequest: (leaveId: string, note?: string) => boolean;
  rejectLeaveRequest: (leaveId: string, reason: string) => boolean;
  returnForRevision: (leaveId: string, note: string) => boolean;
  
  // Station Config & Management
  updateStationConfig: (config: Partial<StationConfig>) => void;
  updateDailyDuty: (data: Partial<DailyDutyRecord>) => void;
  setCurrentFiscalYear: (year: number) => void;
  closeFiscalYear: (year: number) => void;
  
  // Holidays
  addHoliday: (holiday: OfficialHoliday) => void;
  deleteHoliday: (date: string) => void;
  
  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Utilities & Helpers
  calculateLeaveDays: (startDate: string, endDate: string, type: LeaveType, timeSlot: TimeSlot) => number;
  checkDuplicateLeave: (userId: string, startDate: string, endDate: string, excludeLeaveId?: string) => LeaveRequest | null;
  checkStaffingMinimum: (dept: DepartmentCode, date: string) => { isSafe: boolean; onDutyCount: number; leavingCount: number; ratio: number };
  
  // Backup & Restore
  exportBackupData: () => string;
  importBackupData: (jsonString: string) => boolean;
  resetToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'ssk_police_leave_';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial states from LocalStorage or defaults
  const [stationConfig, setStationConfig] = useState<StationConfig>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}config`);
      return saved ? JSON.parse(saved) : INITIAL_STATION_CONFIG;
    } catch {
      return INITIAL_STATION_CONFIG;
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}leaves`);
      return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
    } catch {
      return INITIAL_LEAVE_REQUESTS;
    }
  });

  const [holidays, setHolidays] = useState<OfficialHoliday[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}holidays`);
      return saved ? JSON.parse(saved) : OFFICIAL_HOLIDAYS_DEFAULT;
    } catch {
      return OFFICIAL_HOLIDAYS_DEFAULT;
    }
  });

  const [dailyDuty, setDailyDuty] = useState<DailyDutyRecord>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}duty`);
      return saved ? JSON.parse(saved) : INITIAL_DAILY_DUTY;
    } catch {
      return INITIAL_DAILY_DUTY;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}audit`);
      return saved ? JSON.parse(saved) : [
        {
          id: 'log-1',
          timestamp: new Date().toISOString(),
          userId: 'usr-013',
          userName: 'พ.ต.ท. สมชาย ใจดี (Admin)',
          action: 'login',
          targetType: 'system',
          targetId: 'sys-0',
          details: 'เริ่มต้นระบบบริหารจัดการการลา สภ.ศรีสงคราม',
        }
      ];
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'ใบลาใหม่รอการอนุมัติ',
      message: 'จ.ส.ต. นเรศร์ สุธรรม ยื่นขอลากิจส่วนตัว 2 วัน (สส.0070/2568)',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      leaveRequestId: 'lv-003',
      type: 'leave_submitted',
    },
    {
      id: 'notif-2',
      title: 'ใบลาได้รับการอนุมัติแล้ว',
      message: 'คำขอลาพักผ่อนของ ส.ต.ท. นัฐพงษ์ คุ้มเกรง ได้รับการอนุมัติแล้ว',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true,
      leaveRequestId: 'lv-001',
      type: 'approved',
    },
    {
      id: 'notif-3',
      title: 'แจ้งเตือนวันกลับมาปฏิบัติหน้าที่',
      message: 'ด.ต. ปฐวี พังแดง ครบกำหนดวันลาป่วยในวันที่ 11 พ.ย. 68',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      read: false,
      leaveRequestId: 'lv-002',
      type: 'system',
    },
  ]);

  // Current logged in user (Default to admin or SSK503 for demo ease)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedId = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_user_id`);
      if (savedId) {
        const found = users.find(u => u.id === savedId);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    // Default to admin user so user can see all features immediately
    return users.find(u => u.role === 'admin') || users[0];
  });

  const [currentFiscalYear, setCurrentFiscalYear] = useState<number>(stationConfig.currentFiscalYear || 2568);

  // Available fiscal years from 2568 to 2580 as requested in #4
  const availableFiscalYears = Array.from({ length: 2580 - 2568 + 1 }, (_, i) => 2568 + i);

  // Persist state updates to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}config`, JSON.stringify(stationConfig));
  }, [stationConfig]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}leaves`, JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}holidays`, JSON.stringify(holidays));
  }, [holidays]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}duty`, JSON.stringify(dailyDuty));
  }, [dailyDuty]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}audit`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}current_user_id`, currentUser.id);
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_user_id`);
    }
  }, [currentUser]);

  // Activity session timeout tracker (Requirement #36)
  useEffect(() => {
    let timeoutId: number;
    const timeoutDurationMs = (stationConfig.sessionTimeoutMinutes || 30) * 60 * 1000;

    const resetTimer = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        if (currentUser) {
          logout();
          alert('เซสชันการใช้งานหมดอายุเนื่องจากไม่มีกิจกรรมในระบบเป็นเวลานาน กรุณาเข้าสู่ระบบใหม่อีกครั้งเพื่อความปลอดภัย');
        }
      }, timeoutDurationMs);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      window.clearTimeout(timeoutId);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [currentUser, stationConfig.sessionTimeoutMinutes]);

  // Log audit helper
  const addAuditLog = useCallback((action: AuditLog['action'], targetType: AuditLog['targetType'], targetId: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'sys',
      userName: currentUser ? `${currentUser.rank} ${currentUser.firstName} ${currentUser.lastName}` : 'ผู้ใช้งานระบบ',
      action,
      targetType,
      targetId,
      details,
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 199)]);
  }, [currentUser]);

  // Login handler
  const login = (credential: string, password: string) => {
    const cleanCred = credential.trim().toLowerCase();
    
    // Normalize callsign check (e.g. "ssk503", "ศรีสงคราม 503", "503", "ssk1")
    const targetUser = users.find(u => {
      const uCallsign = u.callsign.toLowerCase();
      const uUsername = u.username.toLowerCase();
      const numOnly = uCallsign.replace(/\D/g, '');
      const inputNum = cleanCred.replace(/\D/g, '');

      return (
        uUsername === cleanCred ||
        uCallsign === cleanCred ||
        (inputNum && numOnly === inputNum && (cleanCred.includes('ssk') || cleanCred.includes('ศรีสงคราม') || cleanCred === numOnly))
      );
    });

    if (!targetUser) {
      return { success: false, message: 'ไม่พบนามเรียกขานหรือชื่อผู้ใช้นี้ในระบบ' };
    }

    if (targetUser.isLocked) {
      return { success: false, message: 'บัญชีนี้ถูกระงับชั่วคราวเนื่องจากใส่รหัสผ่านผิดเกิน 5 ครั้ง กรุณาติดต่อแอดมินเพื่อปลดล็อก' };
    }

    // Check password
    if (targetUser.passwordHash !== password) {
      const attempts = (targetUser.failedAttempts || 0) + 1;
      const isNowLocked = attempts >= 5;

      setUsers(prev => prev.map(u => {
        if (u.id === targetUser.id) {
          return { ...u, failedAttempts: attempts, isLocked: isNowLocked };
        }
        return u;
      }));

      addAuditLog('login', 'personnel', targetUser.id, `เข้าสู่ระบบไม่สำเร็จ (รหัสผ่านไม่ถูกต้อง ครั้งที่ ${attempts})`);

      if (isNowLocked) {
        return { success: false, message: 'รหัสผ่านผิดเกิน 5 ครั้ง บัญชีถูกล็อกชั่วคราวตามระเบียบความปลอดภัย กรุณาติดต่อแอดมิน' };
      }
      return { success: false, message: `รหัสผ่านไม่ถูกต้อง (ครั้งที่ ${attempts}/5)` };
    }

    // Login successful
    const updatedUser = { ...targetUser, failedAttempts: 0 };
    setUsers(prev => prev.map(u => u.id === targetUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    addAuditLog('login', 'personnel', targetUser.id, `เข้าสู่ระบบสำเร็จ โดยนามเรียกขาน ${targetUser.callsign}`);

    return {
      success: true,
      requirePasswordChange: targetUser.isFirstLogin,
    };
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog('logout', 'personnel', currentUser.id, 'ออกจากระบบ');
    }
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      addAuditLog('login', 'personnel', target.id, `สลับสิทธิ์การใช้งานเป็น ${target.rank} ${target.firstName} ${target.lastName} (${target.callsign})`);
    }
  };

  const changePassword = (newPassword: string) => {
    if (!currentUser) return false;
    const updated = {
      ...currentUser,
      passwordHash: newPassword,
      isFirstLogin: false,
    };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    addAuditLog('edit', 'personnel', currentUser.id, 'เปลี่ยนรหัสผ่านส่วนตัว');
    return true;
  };

  const adminResetPassword = (userId: string, newPassword?: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return '';
    const resetPass = newPassword || target.callsign.replace(/\s+/g, '');
    const updated = {
      ...target,
      passwordHash: resetPass,
      isLocked: false,
      failedAttempts: 0,
      isFirstLogin: true,
    };
    setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    if (currentUser?.id === userId) {
      setCurrentUser(updated);
    }
    addAuditLog('password_reset', 'personnel', userId, `แอดมินรีเซ็ตรหัสผ่านของ ${target.rank} ${target.firstName} ${target.lastName} เป็น: ${resetPass}`);
    return resetPass;
  };

  const adminUnlockAccount = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, isLocked: false, failedAttempts: 0 };
      }
      return u;
    }));
    addAuditLog('edit', 'personnel', userId, 'ปลดล็อกบัญชีผู้ใช้งาน');
  };

  // Personnel management
  const addPersonnel = (newUserData: Omit<User, 'id' | 'isFirstLogin' | 'isLocked' | 'failedAttempts'>) => {
    const newId = `usr-${Date.now()}`;
    const newUser: User = {
      ...newUserData,
      id: newId,
      isFirstLogin: true,
      isLocked: false,
      failedAttempts: 0,
    };
    setUsers(prev => [...prev, newUser]);
    addAuditLog('create', 'personnel', newId, `เพิ่มบุคลากรใหม่: ${newUser.rank} ${newUser.firstName} ${newUser.lastName} (${newUser.callsign})`);
  };

  const updatePersonnel = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    addAuditLog('edit', 'personnel', updatedUser.id, `แก้ไขข้อมูลบุคลากร: ${updatedUser.rank} ${updatedUser.firstName} ${updatedUser.lastName}`);
  };

  const deletePersonnel = (userId: string) => {
    const target = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    addAuditLog('delete', 'personnel', userId, `ลบบุคลากร: ${target?.rank || ''} ${target?.firstName || ''} ${target?.lastName || ''}`);
  };

  // Leave calculations
  const calculateLeaveDays = (startDate: string, endDate: string, type: LeaveType, timeSlot: TimeSlot): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) return 0;

    const leaveInfo = LEAVE_TYPES[type];
    let count = 0;
    const curr = new Date(start);

    while (curr <= end) {
      const dayOfWeek = curr.getDay(); // 0 is Sunday, 6 is Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dateStr = curr.toISOString().split('T')[0];
      const isOfficialHoliday = holidays.some(h => h.date === dateStr);

      if (leaveInfo.countBusinessDaysOnly) {
        // Exclude weekends and government holidays
        if (!isWeekend && !isOfficialHoliday) {
          count++;
        }
      } else {
        // Continuous calendar days (like sick leave with medical reason or ordination)
        count++;
      }
      curr.setDate(curr.getDate() + 1);
    }

    if (timeSlot === 'morning' || timeSlot === 'afternoon') {
      return count * 0.5;
    }
    return count;
  };

  const checkDuplicateLeave = (userId: string, startDate: string, endDate: string, excludeLeaveId?: string): LeaveRequest | null => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    const duplicate = leaveRequests.find(lr => {
      if (lr.id === excludeLeaveId) return false;
      if (lr.userId !== userId) return false;
      if (lr.status === 'cancelled' || lr.status === 'rejected') return false;

      const reqStart = new Date(lr.startDate).getTime();
      const reqEnd = new Date(lr.endDate).getTime();

      // Check overlap
      return (start <= reqEnd && end >= reqStart);
    });

    return duplicate || null;
  };

  const checkStaffingMinimum = (dept: DepartmentCode, date: string) => {
    const deptOfficers = users.filter(u => u.department === dept);
    const totalDept = deptOfficers.length || 1;

    // Count officers already on leave on this date
    const onLeave = leaveRequests.filter(lr => {
      if (lr.userDepartment !== dept) return false;
      if (lr.status !== 'approved' && lr.status !== 'pending_approval') return false;
      return date >= lr.startDate && date <= lr.endDate;
    }).length;

    const onDutyCount = Math.max(0, totalDept - onLeave);
    const ratio = onDutyCount / totalDept;
    const isSafe = ratio >= (stationConfig.minimumStaffWarningRatio || 0.65);

    return {
      isSafe,
      onDutyCount,
      leavingCount: onLeave,
      ratio,
    };
  };

  // Generate automated next leave number (Requirement #65: สส.0001/2569)
  const getNextLeaveNumber = (fiscalYear: number) => {
    const yearLeaves = leaveRequests.filter(lr => lr.fiscalYear === fiscalYear);
    const nextSeq = yearLeaves.length + 1;
    return `สส.${String(nextSeq).padStart(4, '0')}/${fiscalYear}`;
  };

  // Create leave request
  const createLeaveRequest = (data: Partial<LeaveRequest>): { success: boolean; error?: string; leaveRequest?: LeaveRequest } => {
    if (stationConfig.isFiscalYearLocked) {
      return { success: false, error: 'ปีงบประมาณนี้ถูกปิดและล็อกการยื่นใบลาแล้ว ไม่สามารถสร้างคำขอใหม่ได้' };
    }

    if (!data.userId || !data.startDate || !data.endDate || !data.leaveType) {
      return { success: false, error: 'กรุณากรอกข้อมูลวันที่และประเภทการลาให้ครบถ้วน' };
    }

    // Check duplicate leave dates
    const dup = checkDuplicateLeave(data.userId, data.startDate, data.endDate);
    if (dup) {
      return {
        success: false,
        error: `พบวันลาซ้ำซ้อนกับเลขที่ใบลา ${dup.leaveNumber} (${dup.startDate} ถึง ${dup.endDate}) กรุณาตรวจสอบหรือยกเลิกใบเดิมก่อน`,
      };
    }

    const requestingUser = users.find(u => u.id === data.userId);
    if (!requestingUser) {
      return { success: false, error: 'ไม่พบข้อมูลผู้ขอลาในระบบ' };
    }

    const fiscalYear = currentFiscalYear;
    const leaveNumber = getNextLeaveNumber(fiscalYear);
    const totalDays = calculateLeaveDays(
      data.startDate,
      data.endDate,
      data.leaveType,
      data.timeSlot || 'full'
    );

    if (totalDays <= 0) {
      return { success: false, error: 'จำนวนวันลาคำนวณได้ 0 วัน (เป็นวันหยุดราชการทั้งหมดหรือช่วงเวลาไม่ถูกต้อง)' };
    }

    // Check quota for vacation
    if (data.leaveType === 'vacation') {
      const remainingQuota = (requestingUser.accumulatedVacationDays + requestingUser.currentYearVacationQuota) - requestingUser.usedVacationDays;
      if (totalDays > remainingQuota) {
        return {
          success: false,
          error: `วันลาพักผ่อนคงเหลือไม่เพียงพอ (มีสิทธิคงเหลือ ${remainingQuota} วัน แต่ขอยื่น ${totalDays} วัน)`,
        };
      }
    }

    const newRequest: LeaveRequest = {
      id: `lv-${Date.now()}`,
      leaveNumber,
      fiscalYear,
      userId: requestingUser.id,
      userRank: requestingUser.rank,
      userFullName: `${requestingUser.firstName} ${requestingUser.lastName}`,
      userPosition: requestingUser.position,
      userDepartment: requestingUser.department,
      userSubDepartmentId: requestingUser.subDepartmentId,
      userCallsign: requestingUser.callsign,
      leaveType: data.leaveType,
      reason: data.reason || 'มีกิจธุระจำเป็น',
      timeSlot: data.timeSlot || 'full',
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays,
      contactAddress: data.contactAddress || requestingUser.address,
      contactPhone: data.contactPhone || requestingUser.phone,
      attachmentName: data.attachmentName,
      attachmentUrl: data.attachmentUrl,
      wifeName: data.wifeName,
      wifeDeliveredDate: data.wifeDeliveredDate,
      templeName: data.templeName,
      templeLocation: data.templeLocation,
      resideTempleName: data.resideTempleName,
      resideTempleLocation: data.resideTempleLocation,
      hasOrdainedBefore: data.hasOrdainedBefore,
      dutyDepartmentText: data.dutyDepartmentText || requestingUser.department,
      dutyTotalStaff: data.dutyTotalStaff ?? 4,
      dutyLeaveStaff: data.dutyLeaveStaff ?? 1,
      dutyRemainingStaff: data.dutyRemainingStaff ?? ((data.dutyTotalStaff ?? 4) - (data.dutyLeaveStaff ?? 1)),
      status: 'pending_inspection', // Step 1: รอตรวจสอบเอกสาร
      submittedAt: new Date().toISOString(),
      isRetroactive: data.isRetroactive,
      retroactiveReason: data.retroactiveReason,
    };

    setLeaveRequests(prev => [newRequest, ...prev]);

    // Send notification to approvers/inspectors
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'มีใบลาใหม่เข้าระบบ',
      message: `${newRequest.userRank} ${newRequest.userFullName} ยื่นขอ${LEAVE_TYPES[newRequest.leaveType].title} ${newRequest.totalDays} วัน (${newRequest.leaveNumber})`,
      timestamp: new Date().toISOString(),
      read: false,
      leaveRequestId: newRequest.id,
      type: 'leave_submitted',
    };
    setNotifications(prev => [newNotif, ...prev]);

    addAuditLog('create', 'leave_request', newRequest.id, `ยื่นขอ${LEAVE_TYPES[newRequest.leaveType].title} เลขที่ ${newRequest.leaveNumber} (${newRequest.startDate} ถึง ${newRequest.endDate})`);

    return { success: true, leaveRequest: newRequest };
  };

  const updateLeaveRequest = (leaveId: string, data: Partial<LeaveRequest>) => {
    setLeaveRequests(prev => prev.map(lr => {
      if (lr.id === leaveId) {
        const updated = { ...lr, ...data };
        addAuditLog('edit', 'leave_request', leaveId, `แก้ไขรายละเอียดใบลาเลขที่ ${lr.leaveNumber}`);
        return updated;
      }
      return lr;
    }));
    return true;
  };

  const cancelLeaveRequest = (leaveId: string, reason: string) => {
    const target = leaveRequests.find(l => l.id === leaveId);
    if (!target) return false;

    setLeaveRequests(prev => prev.map(lr => {
      if (lr.id === leaveId) {
        return {
          ...lr,
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
          cancelledBy: currentUser ? `${currentUser.rank} ${currentUser.firstName} ${currentUser.lastName}` : 'ผู้ใช้งาน',
          cancellationReason: reason,
        };
      }
      return lr;
    }));

    // If was approved, refund user used days
    if (target.status === 'approved') {
      setUsers(prev => prev.map(u => {
        if (u.id === target.userId) {
          if (target.leaveType === 'vacation') {
            return { ...u, usedVacationDays: Math.max(0, u.usedVacationDays - target.totalDays) };
          } else if (target.leaveType === 'sick') {
            return { ...u, usedSickDays: Math.max(0, u.usedSickDays - target.totalDays) };
          } else if (target.leaveType === 'personal') {
            return { ...u, usedPersonalDays: Math.max(0, u.usedPersonalDays - target.totalDays) };
          }
        }
        return u;
      }));
    }

    // Notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'ยกเลิกคำขอลา',
      message: `ใบลาเลขที่ ${target.leaveNumber} ถูกยกเลิกแล้ว: ${reason}`,
      timestamp: new Date().toISOString(),
      read: false,
      leaveRequestId: target.id,
      type: 'cancelled',
    };
    setNotifications(prev => [notif, ...prev]);

    addAuditLog('cancel', 'leave_request', leaveId, `ยกเลิกใบลาเลขที่ ${target.leaveNumber} เหตุผล: ${reason}`);
    return true;
  };

  const approveLeaveRequest = (leaveId: string, note?: string) => {
    const target = leaveRequests.find(l => l.id === leaveId);
    if (!target) return false;

    // Prevent duplicate approval
    if (target.status === 'approved') return false;

    const approverName = currentUser 
      ? `${currentUser.rank} ${currentUser.firstName} ${currentUser.lastName}`
      : `${stationConfig.superintendentRank} ${stationConfig.superintendentName}`;

    const approverPosition = currentUser?.position || `ผกก.${stationConfig.stationName}`;

    setLeaveRequests(prev => prev.map(lr => {
      if (lr.id === leaveId) {
        return {
          ...lr,
          status: 'approved',
          approverDecision: 'approved',
          approverReason: note || 'อนุมัติเรียบร้อยตามระเบียบ',
          approverName,
          approverPosition,
          approverDate: new Date().toISOString().split('T')[0],
        };
      }
      return lr;
    }));

    // Deduct user leave balance
    setUsers(prev => prev.map(u => {
      if (u.id === target.userId) {
        if (target.leaveType === 'vacation') {
          return { ...u, usedVacationDays: u.usedVacationDays + target.totalDays };
        } else if (target.leaveType === 'sick') {
          return { ...u, usedSickDays: u.usedSickDays + target.totalDays };
        } else if (target.leaveType === 'personal') {
          return { ...u, usedPersonalDays: u.usedPersonalDays + target.totalDays };
        }
      }
      return u;
    }));

    // Notification to requester
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'ใบลาได้รับการอนุมัติแล้ว 🎉',
      message: `ใบลาเลขที่ ${target.leaveNumber} (${LEAVE_TYPES[target.leaveType].title} ${target.totalDays} วัน) ได้รับการอนุมัติแล้ว`,
      timestamp: new Date().toISOString(),
      read: false,
      leaveRequestId: target.id,
      type: 'approved',
    };
    setNotifications(prev => [notif, ...prev]);

    addAuditLog('approve', 'leave_request', leaveId, `อนุมัติใบลาเลขที่ ${target.leaveNumber} โดย ${approverName}`);
    return true;
  };

  const rejectLeaveRequest = (leaveId: string, reason: string) => {
    const target = leaveRequests.find(l => l.id === leaveId);
    if (!target) return false;

    const approverName = currentUser 
      ? `${currentUser.rank} ${currentUser.firstName} ${currentUser.lastName}`
      : `${stationConfig.superintendentRank} ${stationConfig.superintendentName}`;

    setLeaveRequests(prev => prev.map(lr => {
      if (lr.id === leaveId) {
        return {
          ...lr,
          status: 'rejected',
          approverDecision: 'rejected',
          approverReason: reason,
          approverName,
          approverPosition: currentUser?.position || 'ผกก.สภ.ศรีสงคราม',
          approverDate: new Date().toISOString().split('T')[0],
        };
      }
      return lr;
    }));

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'ใบลาไม่อนุมัติ',
      message: `ใบลาเลขที่ ${target.leaveNumber} ไม่ได้รับการอนุมัติ: ${reason}`,
      timestamp: new Date().toISOString(),
      read: false,
      leaveRequestId: target.id,
      type: 'rejected',
    };
    setNotifications(prev => [notif, ...prev]);

    addAuditLog('reject', 'leave_request', leaveId, `ไม่อนุมัติใบลาเลขที่ ${target.leaveNumber} เหตุผล: ${reason}`);
    return true;
  };

  const returnForRevision = (leaveId: string, note: string) => {
    const target = leaveRequests.find(l => l.id === leaveId);
    if (!target) return false;

    setLeaveRequests(prev => prev.map(lr => {
      if (lr.id === leaveId) {
        return {
          ...lr,
          status: 'revision',
          inspectorComment: note,
          inspectorName: currentUser ? `${currentUser.rank} ${currentUser.firstName} ${currentUser.lastName}` : 'ผู้ตรวจสอบ',
          inspectorDate: new Date().toISOString().split('T')[0],
        };
      }
      return lr;
    }));

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'ใบลาถูกส่งกลับให้แก้ไข',
      message: `ใบลาเลขที่ ${target.leaveNumber} ต้องแก้ไขข้อมูล: ${note}`,
      timestamp: new Date().toISOString(),
      read: false,
      leaveRequestId: target.id,
      type: 'revision',
    };
    setNotifications(prev => [notif, ...prev]);

    addAuditLog('edit', 'leave_request', leaveId, `ส่งกลับใบลา ${target.leaveNumber} ให้แก้ไข: ${note}`);
    return true;
  };

  // Station Config & Daily Duty
  const updateStationConfig = (configUpdate: Partial<StationConfig>) => {
    setStationConfig(prev => {
      const updated = { ...prev, ...configUpdate };
      return updated;
    });
    addAuditLog('config_update', 'station_config', 'cfg', 'แก้ไขการตั้งค่าสถานีตำรวจ / ผู้บังคับบัญชา / เบอร์โทรศัพท์');
  };

  const updateDailyDuty = (data: Partial<DailyDutyRecord>) => {
    setDailyDuty(prev => {
      const duty = data.dutyStaff ?? prev.dutyStaff;
      const leave = data.leaveStaff ?? prev.leaveStaff;
      const remaining = Math.max(0, duty - leave);

      const updated: DailyDutyRecord = {
        ...prev,
        ...data,
        dutyStaff: duty,
        leaveStaff: leave,
        remainingStaff: remaining,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser ? `${currentUser.rank} ${currentUser.firstName} ${currentUser.lastName}` : prev.updatedBy,
      };
      return updated;
    });
    addAuditLog('edit', 'system', 'daily-duty', 'บันทึกยอดกำลังพลปฏิบัติหน้าที่และกำลังพลคงเหลือประจำวัน');
  };

  const closeFiscalYear = (year: number) => {
    setStationConfig(prev => ({ ...prev, isFiscalYearLocked: true }));
    addAuditLog('config_update', 'station_config', `year-${year}`, `ดำเนินการปิดสรุปบัญชีวันลาปีงบประมาณ ${year} และล็อกข้อมูล`);
  };

  // Holidays
  const addHoliday = (holiday: OfficialHoliday) => {
    setHolidays(prev => [...prev.filter(h => h.date !== holiday.date), holiday]);
    addAuditLog('create', 'system', holiday.date, `เพิ่มวันหยุดราชการ: ${holiday.name} (${holiday.date})`);
  };

  const deleteHoliday = (date: string) => {
    setHolidays(prev => prev.filter(h => h.date !== date));
    addAuditLog('delete', 'system', date, `ลบวันหยุดราชการวันที่ ${date}`);
  };

  // Notification helpers
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  // Backup & Restore
  const exportBackupData = (): string => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      stationConfig,
      users,
      leaveRequests,
      holidays,
      dailyDuty,
      auditLogs,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importBackupData = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.stationConfig || !data.users || !data.leaveRequests) {
        throw new Error('โครงสร้างไฟล์สำรองข้อมูลไม่ถูกต้อง');
      }
      setStationConfig(data.stationConfig);
      setUsers(data.users);
      setLeaveRequests(data.leaveRequests);
      if (data.holidays) setHolidays(data.holidays);
      if (data.dailyDuty) setDailyDuty(data.dailyDuty);
      if (data.auditLogs) setAuditLogs(data.auditLogs);

      addAuditLog('create', 'system', 'restore', 'กู้คืนข้อมูลระบบจากไฟล์สำรองข้อมูลเรียบร้อย');
      return true;
    } catch (e) {
      console.error('Backup restore failed', e);
      return false;
    }
  };

  const resetToDefault = () => {
    localStorage.clear();
    setStationConfig(INITIAL_STATION_CONFIG);
    setUsers(INITIAL_USERS);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
    setHolidays(OFFICIAL_HOLIDAYS_DEFAULT);
    setDailyDuty(INITIAL_DAILY_DUTY);
    setCurrentUser(INITIAL_USERS[0]);
    addAuditLog('edit', 'system', 'reset', 'รีเซ็ตข้อมูลทั้งหมดกลับสู่ค่าเริ่มต้น');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        leaveRequests,
        stationConfig,
        auditLogs,
        holidays,
        dailyDuty,
        notifications,
        unreadNotificationCount,
        currentFiscalYear,
        availableFiscalYears,
        login,
        logout,
        switchUser,
        changePassword,
        adminResetPassword,
        adminUnlockAccount,
        addPersonnel,
        updatePersonnel,
        deletePersonnel,
        createLeaveRequest,
        updateLeaveRequest,
        cancelLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,
        returnForRevision,
        updateStationConfig,
        updateDailyDuty,
        setCurrentFiscalYear,
        closeFiscalYear,
        addHoliday,
        deleteHoliday,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        calculateLeaveDays,
        checkDuplicateLeave,
        checkStaffingMinimum,
        exportBackupData,
        importBackupData,
        resetToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
