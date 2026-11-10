/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  FilePlus,
  Calendar,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Clock,
  ShieldAlert,
  User,
  Phone,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { LeaveType, TimeSlot, LEAVE_TYPES } from '../types/leave';

interface LeaveFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (leaveId: string) => void;
}

export const LeaveFormModal: React.FC<LeaveFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { 
    currentUser, 
    users, 
    createLeaveRequest, 
    calculateLeaveDays, 
    checkDuplicateLeave, 
    checkStaffingMinimum,
    stationConfig,
    dailyDuty 
  } = useApp();

  // If admin, allows selecting for which officer to file leave
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser?.id || '');
  const targetUser = users.find(u => u.id === selectedUserId) || currentUser || users[0];

  const [leaveType, setLeaveType] = useState<LeaveType>('vacation');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('full');
  
  // Date selection
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>(tomorrowStr);
  const [endDate, setEndDate] = useState<string>(tomorrowStr);

  const [reason, setReason] = useState<string>('');
  const [contactAddress, setContactAddress] = useState<string>(targetUser?.address || '');
  const [contactPhone, setContactPhone] = useState<string>(targetUser?.phone || '');
  
  // Duty fields (Requirement #20 & #29)
  const [dutyDepartmentText, setDutyDepartmentText] = useState<string>('งานอำนวยการ');
  const [dutyTotalStaff, setDutyTotalStaff] = useState<number>(4);
  const [dutyLeaveStaff, setDutyLeaveStaff] = useState<number>(1);
  const dutyRemainingStaff = Math.max(0, dutyTotalStaff - dutyLeaveStaff);

  // Form-specific inputs
  const [wifeName, setWifeName] = useState<string>('');
  const [wifeDeliveredDate, setWifeDeliveredDate] = useState<string>('');
  const [templeName, setTempleName] = useState<string>('');
  const [templeLocation, setTempleLocation] = useState<string>('');
  const [resideTempleName, setResideTempleName] = useState<string>('');
  const [resideTempleLocation, setResideTempleLocation] = useState<string>('');
  const [hasOrdainedBefore, setHasOrdainedBefore] = useState<boolean>(false);

  // Retroactive leave (Requirement #71)
  const [isRetroactive, setIsRetroactive] = useState<boolean>(false);
  const [retroactiveReason, setRetroactiveReason] = useState<string>('');

  // Attachment (Requirement #44)
  const [attachmentName, setAttachmentName] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Update contact information when target user changes
  useEffect(() => {
    if (targetUser) {
      setContactAddress(targetUser.address);
      setContactPhone(targetUser.phone);
      if (targetUser.department === 'suppression') {
        setDutyDepartmentText('งานป้องกันปราบปราม');
        setDutyTotalStaff(18);
      } else if (targetUser.department === 'traffic') {
        setDutyDepartmentText('งานจราจร');
        setDutyTotalStaff(7);
      } else if (targetUser.department === 'investigation') {
        setDutyDepartmentText('งานสอบสวน');
        setDutyTotalStaff(8);
      } else if (targetUser.department === 'inquiry') {
        setDutyDepartmentText('งานสืบสวน');
        setDutyTotalStaff(11);
      } else {
        setDutyDepartmentText('งานอำนวยการ');
        setDutyTotalStaff(4);
      }
    }
  }, [targetUser]);

  // Calculate leave days automatically (Requirement #67)
  const calculatedDays = calculateLeaveDays(startDate, endDate, leaveType, timeSlot);

  // Quota analysis (Requirement #37)
  const totalVacationQuota = (targetUser?.accumulatedVacationDays || 0) + (targetUser?.currentYearVacationQuota || 0);
  const remainingVacationQuota = totalVacationQuota - (targetUser?.usedVacationDays || 0);

  // Duplicate leave check (Requirement #38)
  const duplicateLeave = targetUser ? checkDuplicateLeave(targetUser.id, startDate, endDate) : null;

  // Minimum staffing safety check (Requirement #39)
  const staffingStatus = targetUser ? checkStaffingMinimum(targetUser.department, startDate) : { isSafe: true, ratio: 1 };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!startDate || !endDate) {
      setErrorMessage('กรุณาระบุวันที่เริ่มต้นและสิ้นสุดการลา');
      return;
    }

    if (calculatedDays <= 0) {
      setErrorMessage('จำนวนวันลาคำนวณได้ 0 วัน โปรดเลือกช่วงวันทำการ');
      return;
    }

    if (leaveType === 'vacation' && calculatedDays > remainingVacationQuota) {
      setErrorMessage(`วันลาพักผ่อนสะสมคงเหลือไม่เพียงพอ (มีสิทธิ ${remainingVacationQuota} วัน แต่ขอยื่น ${calculatedDays} วัน)`);
      return;
    }

    if (duplicateLeave) {
      setErrorMessage(`พบวันลาซ้ำซ้อนกับเลขที่ใบลา ${duplicateLeave.leaveNumber} (${duplicateLeave.startDate} ถึง ${duplicateLeave.endDate})`);
      return;
    }

    if (isRetroactive && !retroactiveReason.trim()) {
      setErrorMessage('การยื่นลาย้อนหลังจำเป็นต้องระบุเหตุผลความจำเป็นเร่งด่วน');
      return;
    }

    const res = createLeaveRequest({
      userId: targetUser.id,
      leaveType,
      timeSlot,
      startDate,
      endDate,
      reason: reason.trim() || `ขออนุญาต${LEAVE_TYPES[leaveType].title}`,
      contactAddress,
      contactPhone,
      dutyDepartmentText,
      dutyTotalStaff,
      dutyLeaveStaff,
      dutyRemainingStaff,
      wifeName,
      wifeDeliveredDate,
      templeName,
      templeLocation,
      resideTempleName,
      resideTempleLocation,
      hasOrdainedBefore,
      attachmentName,
      isRetroactive,
      retroactiveReason,
    });

    if (res.success && res.leaveRequest) {
      onSuccess(res.leaveRequest.id);
      onClose();
    } else {
      setErrorMessage(res.error || 'เกิดข้อผิดพลาดในการบันทึกคำขอลา');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#691118] via-[#7d1720] to-[#580c10] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <FilePlus className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">ยื่นใบลาออนไลน์ สภ.ศรีสงคราม</h2>
              <p className="text-xs text-amber-200/90">
                ระบบคำนวณวันลาและกำลังพลอัตโนมัติตามระเบียบตำรวจ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2 animate-shake">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <strong>ไม่สามารถส่งคำขอได้:</strong> {errorMessage}
              </div>
            </div>
          )}

          {/* User selector (if admin/supervisor) */}
          {(currentUser?.role === 'admin' || currentUser?.role === 'superintendent') && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ยื่นคำขอในนามข้าราชการตำรวจ (สำหรับแอดมิน/ธุรการ)
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.rank} {u.firstName} {u.lastName} ({u.callsign}) - {u.position}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Officer Identity Card with Separation of Rank and Name as per Requirement #28 */}
          <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold text-rose-900 uppercase tracking-wide">
                ข้อมูลผู้ขอลา (แยกบรรทัดยศและชื่อ-สกุล ตามข้อกำหนด 28)
              </div>
              {/* Requirement #28: Separate Rank and Name */}
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold text-xs min-w-[70px]">ยศ:</span>
                  <span className="text-slate-900 font-extrabold text-xs bg-white px-2 py-0.5 rounded border border-rose-200 shadow-2xs">{targetUser.rank}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold text-xs min-w-[70px]">ชื่อ-นามสกุล:</span>
                  <span className="text-slate-900 font-black text-sm bg-white px-2 py-0.5 rounded border border-rose-200 shadow-2xs">{targetUser.firstName} {targetUser.lastName}</span>
                </div>
              </div>
              <div className="text-xs text-slate-600 mt-1">
                ตำแหน่ง: {targetUser.position} · นามเรียกขาน: <strong className="font-mono text-rose-900">{targetUser.callsign}</strong>
              </div>
            </div>

            {/* Quota overview */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-right">
              <div className="text-slate-500">สิทธิลาพักผ่อนคงเหลือ</div>
              <div className="text-lg font-extrabold text-amber-600 tabular-nums">
                {remainingVacationQuota} <span className="text-xs font-normal text-slate-600">วันทำการ</span>
              </div>
              <div className="text-[10px] text-slate-400">
                (สะสม {targetUser.accumulatedVacationDays} + ปีนี้ {targetUser.currentYearVacationQuota} - ใช้ไป {targetUser.usedVacationDays})
              </div>
            </div>
          </div>

          {/* Leave Type Selector with Emojis as per Requirement #26 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              เลือกประเภทการลา (ตามระเบียบข้าราชการตำรวจ)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(LEAVE_TYPES) as LeaveType[]).map((typeKey) => {
                const info = LEAVE_TYPES[typeKey];
                const isSelected = leaveType === typeKey;
                return (
                  <button
                    key={typeKey}
                    type="button"
                    onClick={() => setLeaveType(typeKey)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'border-rose-800 bg-rose-900 text-white shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <span className="text-base">{info.emoji}</span>
                    <span className="truncate">{info.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ตั้งแต่วันที่
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (e.target.value > endDate) setEndDate(e.target.value);
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-rose-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ถึงวันที่
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-rose-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ช่วงเวลา (Requirement #73)
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value as TimeSlot)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-rose-800"
              >
                <option value="full">เต็มวัน (1.0 วัน)</option>
                <option value="morning">ครึ่งวันเช้า (0.5 วัน)</option>
                <option value="afternoon">ครึ่งวันบ่าย (0.5 วัน)</option>
              </select>
            </div>

            {/* Calculated Days Summary Pill */}
            <div className="sm:col-span-3 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs">
              <span className="text-slate-600">
                รวมกำหนดวันลา: <strong className="text-base text-rose-900 tabular-nums">{calculatedDays}</strong> วันทำการ 
                <span className="text-slate-400 ml-1">
                  ({LEAVE_TYPES[leaveType].countBusinessDaysOnly ? 'หักเสาร์-อาทิตย์และวันหยุดราชการแล้ว' : 'นับวันต่อเนื่อง'})
                </span>
              </span>

              {/* Duplicate or staffing warnings */}
              {duplicateLeave && (
                <span className="text-rose-600 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> ซ้ำซ้อนกับใบลา {duplicateLeave.leaveNumber}
                </span>
              )}

              {!staffingStatus.isSafe && (
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> แจ้งเตือน: กำลังพลในสายงานเหลือน้อยกว่า 65%
                </span>
              )}
            </div>
          </div>

          {/* Form-specific Fields based on Leave Type */}
          {leaveType === 'paternity' && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-3">
              <div className="text-xs font-bold text-teal-900">
                ข้อมูลสำหรับการลาเพื่อดูแลบุตรและภรรยาหลังคลอด (ตามแบบ สภ.ศรีสงคราม)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-700 font-semibold mb-1">ภรรยาชื่อ</label>
                  <input
                    type="text"
                    value={wifeName}
                    onChange={(e) => setWifeName(e.target.value)}
                    placeholder="ชื่อ-สกุล ภรรยา"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 font-semibold mb-1">คลอดเมื่อวันที่</label>
                  <input
                    type="date"
                    value={wifeDeliveredDate}
                    onChange={(e) => setWifeDeliveredDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {leaveType === 'ordination' && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3">
              <div className="text-xs font-bold text-orange-900">
                ข้อมูลสำหรับการลาอุปสมบท (เสนอ ผู้บังคับการตำรวจภูธรจังหวัดนครพนม)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-700 font-semibold mb-1">ณ วัด</label>
                  <input
                    type="text"
                    value={templeName}
                    onChange={(e) => setTempleName(e.target.value)}
                    placeholder="ชื่อวัดที่จะอุปสมบท"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 font-semibold mb-1">ตั้งอยู่ ณ</label>
                  <input
                    type="text"
                    value={templeLocation}
                    onChange={(e) => setTempleLocation(e.target.value)}
                    placeholder="ตำบล อำเภอ จังหวัด"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 font-semibold mb-1">และจะจำพรรษา ณ วัด</label>
                  <input
                    type="text"
                    value={resideTempleName}
                    onChange={(e) => setResideTempleName(e.target.value)}
                    placeholder="ชื่อวัดที่จะจำพรรษา"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-700 font-semibold mb-1">ประวัติการอุปสมบท</label>
                  <div className="flex items-center gap-4 pt-1.5">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700">
                      <input
                        type="radio"
                        checked={!hasOrdainedBefore}
                        onChange={() => setHasOrdainedBefore(false)}
                      />
                      ไม่เคยอุปสมบท
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700">
                      <input
                        type="radio"
                        checked={hasOrdainedBefore}
                        onChange={() => setHasOrdainedBefore(true)}
                      />
                      เคยอุปสมบท
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              เหตุผลความจำเป็นในการลา
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ระบุเหตุผลความจำเป็น เช่น พักผ่อนประจำปี, มีธุระจำเป็นจัดการมรดก, มีอาการป่วยไข้หวัด"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-rose-800"
            />
          </div>

          {/* Staffing calculation box as per attached slip (Requirement #20 & #29) */}
          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <span>📋</span> ผู้ลาปฏิบัติหน้าที่และคำนวณกำลังพล (ตามแบบแนบท้ายใบลา)
              </span>
              <span className="text-[11px] text-amber-800 font-semibold">
                คำนวณกำลังพลคงเหลืออัตโนมัติ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-700 font-semibold mb-1">
                  ผู้ลาปฏิบัติหน้าที่
                </label>
                <input
                  type="text"
                  value={dutyDepartmentText}
                  onChange={(e) => setDutyDepartmentText(e.target.value)}
                  placeholder="เช่น งานอำนวยการ"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 font-semibold mb-1">
                  มีกำลังปฏิบัติหน้าที่
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={dutyTotalStaff}
                    onChange={(e) => setDutyTotalStaff(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs text-slate-400">นาย</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 font-semibold mb-1">
                  ลา
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={dutyLeaveStaff}
                    onChange={(e) => setDutyLeaveStaff(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-700"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs text-slate-400">นาย</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-emerald-800 font-bold mb-1">
                  เหลือกำลังปฏิบัติหน้าที่
                </label>
                <div className="w-full bg-emerald-100/70 border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs font-black text-emerald-900 flex items-center justify-between">
                  <span>{dutyRemainingStaff}</span>
                  <span className="text-[10px] text-emerald-700">นาย</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact address & phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-800" /> ในระหว่างลาติดต่อข้าพเจ้าได้ที่
              </label>
              <input
                type="text"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                placeholder="ที่อยู่ เบอร์ห้อง หรือตำบล อำเภอ"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-rose-800" /> หมายเลขโทรศัพท์
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="เช่น 061-313-7089"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono"
              />
            </div>
          </div>

          {/* Attachment upload (Requirement #44) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-rose-800" /> แนบเอกสารประกอบ (ใบรับรองแพทย์ / สำเนาสูติบัตร / เอกสารราชการ)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                id="leave-file-input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAttachmentName(file.name);
                  }
                }}
                className="text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-rose-100 file:text-rose-800 hover:file:bg-rose-200 cursor-pointer"
              />
              {attachmentName && (
                <span className="text-xs text-emerald-700 font-semibold">
                  แนบแล้ว: {attachmentName}
                </span>
              )}
            </div>
          </div>

          {/* Retroactive Leave Toggle (Requirement #71) */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={isRetroactive}
                onChange={(e) => setIsRetroactive(e.target.checked)}
                className="rounded text-rose-800 focus:ring-rose-800"
              />
              ยื่นคำขอลาย้อนหลัง (กรณีฉุกเฉิน/จำเป็นเร่งด่วนตามระเบียบ)
            </label>
            {isRetroactive && (
              <div className="mt-2 pl-5">
                <input
                  type="text"
                  value={retroactiveReason}
                  onChange={(e) => setRetroactiveReason(e.target.value)}
                  placeholder="ระบุเหตุผลความจำเป็นเร่งด่วนที่ไม่สามารถยื่นล่วงหน้าได้"
                  className="w-full bg-amber-50 border border-amber-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                />
              </div>
            )}
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-[#691118] to-[#8d1822] hover:from-[#580c10] hover:to-[#721319] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              บันทึกและส่งใบลา
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
