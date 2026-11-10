/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Ban,
  FileText,
  Calendar,
  Phone,
  MapPin,
  Check,
  ChevronRight,
  Edit2,
} from 'lucide-react';
import { LeaveRequest, LEAVE_TYPES } from '../types/leave';

interface LeaveDetailModalProps {
  leaveId: string | null;
  onClose: () => void;
}

export const LeaveDetailModal: React.FC<LeaveDetailModalProps> = ({ leaveId, onClose }) => {
  const { 
    leaveRequests, 
    stationConfig, 
    updateStationConfig,
    currentUser, 
    approveLeaveRequest, 
    rejectLeaveRequest, 
    cancelLeaveRequest,
    updateLeaveRequest,
    users 
  } = useApp();

  const [activeView, setActiveView] = useState<'detail' | 'official_print'>('detail');

  // Commander name override (Requirement #27: เปลี่ยนชื่อ หรือกรอกชื่อ ผบก.ภ.จว.นครพนม เองได้)
  const [customCommanderName, setCustomCommanderName] = useState(stationConfig.provincialCommanderName);
  const [customCommanderRank, setCustomCommanderRank] = useState(stationConfig.provincialCommanderRank);
  const [isEditingCommander, setIsEditingCommander] = useState(false);

  // Cancellation state (Requirement #19)
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReasonText, setCancelReasonText] = useState('');

  // Rejection state
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [rejectReasonText, setRejectReasonText] = useState('');

  if (!leaveId) return null;
  const leave = leaveRequests.find(lr => lr.id === leaveId);
  if (!leave) return null;

  const requester = users.find(u => u.id === leave.userId);
  const leaveInfo = LEAVE_TYPES[leave.leaveType] || LEAVE_TYPES.vacation;

  const canCancel = currentUser?.role === 'admin' || currentUser?.id === leave.userId;
  const canApprove = 
    currentUser?.role === 'admin' || 
    currentUser?.role === 'superintendent' || 
    currentUser?.role === 'approver';

  const handlePrint = () => {
    window.print();
  };

  const handleSaveCommander = () => {
    updateStationConfig({
      provincialCommanderName: customCommanderName,
      provincialCommanderRank: customCommanderRank,
    });
    setIsEditingCommander(false);
  };

  const handleConfirmCancel = () => {
    if (!cancelReasonText.trim()) return;
    cancelLeaveRequest(leave.id, cancelReasonText.trim());
    setShowCancelPrompt(false);
  };

  const handleConfirmReject = () => {
    if (!rejectReasonText.trim()) return;
    rejectLeaveRequest(leave.id, rejectReasonText.trim());
    setShowRejectPrompt(false);
  };

  // Convert Date to Thai format
  const formatThaiDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Header - Hidden on print */}
        <div className="no-print bg-gradient-to-r from-[#691118] via-[#7d1720] to-[#580c10] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold">รายละเอียดใบลา {leave.leaveNumber}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20">
                  ปีงบประมาณ {leave.fiscalYear}
                </span>
              </div>
              <div className="text-xs text-amber-200/95 mt-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="bg-white/15 px-2 py-0.5 rounded font-bold text-amber-200">ยศ: {leave.userRank}</span>
                  <span className="text-white/60">·</span>
                  <span className="font-extrabold text-white">ชื่อ-นามสกุล: {leave.userFullName}</span>
                </div>
                <div className="text-[11px] text-amber-300/80">
                  {leaveInfo.emoji} {leaveInfo.title} · นามเรียกขาน: {leave.userCallsign}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher: Detail vs Official Printable Document */}
            <div className="bg-black/20 p-0.5 rounded-lg flex items-center text-xs">
              <button
                onClick={() => setActiveView('detail')}
                className={`px-3 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                  activeView === 'detail' ? 'bg-white text-slate-900 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                ดูรายละเอียด
              </button>
              <button
                onClick={() => setActiveView('official_print')}
                className={`px-3 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                  activeView === 'official_print' ? 'bg-white text-slate-900 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                แบบฟอร์มราชการ (พิมพ์)
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              title="พิมพ์เอกสาร"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">พิมพ์</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
          {/* ===================== VIEW 1: INTERACTIVE TIMELINE & DETAIL ===================== */}
          {activeView === 'detail' && (
            <div className="space-y-6">
              {/* Approval Timeline (Requirement #51) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-800" />
                  Timeline ขั้นตอนการอนุมัติใบลา (สภ.ศรีสงคราม)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
                  {/* Step 1: ยื่นคำขอ */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 relative">
                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      1. ยื่นคำขอในระบบ
                    </div>
                    <div className="text-[11px] text-slate-700 mt-1 font-semibold leading-tight space-y-0.5">
                      <div>ยศ: <span className="font-bold text-slate-900">{leave.userRank}</span></div>
                      <div>ชื่อ-สกุล: <span className="font-bold text-slate-900">{leave.userFullName}</span></div>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(leave.submittedAt).toLocaleString('th-TH')}
                    </div>
                  </div>

                  {/* Step 2: ตรวจสอบความถูกต้อง */}
                  <div className={`p-3 rounded-lg border relative ${
                    leave.status !== 'pending_inspection' ? 'bg-white border-slate-200' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      {leave.inspectorDate ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-amber-500" />}
                      2. ตรวจสอบเอกสาร
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      {leave.inspectorName || `${stationConfig.inspectorRank} ${stationConfig.inspectorName}`}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {leave.inspectorDate ? formatThaiDate(leave.inspectorDate) : 'รอตรวจสอบ'}
                    </div>
                  </div>

                  {/* Step 3: ความเห็นผู้บังคับบัญชา */}
                  <div className={`p-3 rounded-lg border relative ${
                    leave.supervisorDate ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      {leave.supervisorDate ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
                      3. ความเห็นหัวหน้างาน
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      {leave.supervisorName || 'หัวหน้างาน/สารวัตร'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {leave.supervisorDate ? formatThaiDate(leave.supervisorDate) : 'ตามขั้นตอน'}
                    </div>
                  </div>

                  {/* Step 4: คำสั่ง ผกก. */}
                  <div className={`p-3 rounded-lg border relative ${
                    leave.status === 'approved' 
                      ? 'bg-emerald-50 border-emerald-300' 
                      : leave.status === 'rejected' 
                      ? 'bg-rose-50 border-rose-300' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      {leave.status === 'approved' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {leave.status === 'rejected' && <XCircle className="w-4 h-4 text-rose-600" />}
                      {leave.status !== 'approved' && leave.status !== 'rejected' && <Clock className="w-4 h-4 text-slate-400" />}
                      <span className={leave.status === 'approved' ? 'text-emerald-800' : leave.status === 'rejected' ? 'text-rose-800' : 'text-slate-800'}>
                        4. คำสั่ง ผกก.
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700 mt-1 font-semibold">
                      {leave.approverName || `${stationConfig.superintendentRank} ${stationConfig.superintendentName}`}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {leave.status === 'approved' ? `อนุญาต (${formatThaiDate(leave.approverDate || '')})` : leave.status === 'rejected' ? 'ไม่อนุมัติ' : 'รอคำสั่ง'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirement #28: Separate Rank and Name display in detail modal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-rose-900 uppercase">
                    ข้อมูลข้าราชการตำรวจผู้ลา (แยกบรรทัดยศและชื่อ-นามสกุล)
                  </div>
                  <div className="border-t border-slate-100 pt-2 space-y-1.5 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-baseline justify-between">
                      <span className="text-slate-500 font-semibold">ยศ (Rank):</span>
                      <span className="font-black text-rose-950 text-base">{leave.userRank}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-baseline justify-between">
                      <span className="text-slate-500 font-semibold">ชื่อ-นามสกุล (Name):</span>
                      <span className="font-extrabold text-slate-900 text-base">{leave.userFullName}</span>
                    </div>
                    <div className="flex items-baseline justify-between px-1">
                      <span className="text-slate-500">ตำแหน่ง:</span>
                      <span className="font-semibold text-slate-700">{leave.userPosition}</span>
                    </div>
                    <div className="flex items-baseline justify-between px-1">
                      <span className="text-slate-500">นามเรียกขาน:</span>
                      <span className="font-mono font-bold text-rose-900">{leave.userCallsign}</span>
                    </div>
                    <div className="flex items-baseline justify-between px-1">
                      <span className="text-slate-500">สังกัด:</span>
                      <span className="text-slate-700">{stationConfig.stationName} บก.ภ.จว.นครพนม ภ.4</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-rose-900 uppercase">รายละเอียดคำขอลา</div>
                  <div className="border-t border-slate-100 pt-2 space-y-1 text-xs">
                    <div className="flex items-baseline justify-between">
                      <span className="text-slate-500">ประเภทการลา:</span>
                      <span className="font-bold text-slate-900">{leaveInfo.emoji} {leaveInfo.title}</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-slate-500">ช่วงวันที่ลา:</span>
                      <span className="font-bold text-slate-900">{formatThaiDate(leave.startDate)} ถึง {formatThaiDate(leave.endDate)}</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-slate-500">จำนวนวันลา:</span>
                      <span className="font-bold text-rose-900 text-sm">{leave.totalDays} วันทำการ</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-slate-500">การติดต่อระหว่างลา:</span>
                      <span className="text-slate-700 truncate max-w-[200px]">{leave.contactAddress}</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-slate-500">เบอร์โทรศัพท์:</span>
                      <span className="font-mono font-semibold text-slate-800">{leave.contactPhone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirement #20 & #29: Manpower slip card */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
                <div className="text-xs font-bold text-amber-950 mb-2">
                  สถิติกำลังพลปฏิบัติหน้าที่ (ตามแบบแนบท้ายใบลา สภ.ศรีสงคราม)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                    <span className="text-slate-500 block text-[11px]">ผู้ลาปฏิบัติหน้าที่</span>
                    <span className="font-bold text-slate-900 text-sm">{leave.dutyDepartmentText || 'งานอำนวยการ'}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                    <span className="text-slate-500 block text-[11px]">มีกำลังปฏิบัติหน้าที่</span>
                    <span className="font-bold text-slate-900 text-sm">{leave.dutyTotalStaff} นาย</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                    <span className="text-slate-500 block text-[11px]">ลา</span>
                    <span className="font-bold text-amber-700 text-sm">{leave.dutyLeaveStaff} นาย</span>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-300">
                    <span className="text-emerald-700 block text-[11px] font-semibold">เหลือกำลังปฏิบัติหน้าที่</span>
                    <span className="font-extrabold text-emerald-900 text-sm">{leave.dutyRemainingStaff} นาย</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Approver / Cancel */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  {/* Requirement #19: ปุ่มยกเลิกคำขอลา */}
                  {leave.status !== 'cancelled' && canCancel && (
                    <button
                      onClick={() => setShowCancelPrompt(true)}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Ban className="w-4 h-4" />
                      ยกเลิกคำขอลา (Cancel Leave)
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {leave.status !== 'approved' && leave.status !== 'cancelled' && canApprove && (
                    <>
                      <button
                        onClick={() => setShowRejectPrompt(true)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        ไม่อนุมัติ
                      </button>
                      <button
                        onClick={() => approveLeaveRequest(leave.id)}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        อนุมัติใบลา
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================== VIEW 2: OFFICIAL GOVERNMENT POLICE FORM (MATCHES ATTACHED PDFS) ===================== */}
          {activeView === 'official_print' && (
            <div className="space-y-4">
              {/* Tool bar to customize superintendent/commander name as requested in #27 */}
              <div className="no-print p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">
                    ⚙️ ปรับแต่งชื่อผู้บังคับบัญชาในใบลา (ข้อกำหนด #27):
                  </span>
                  {isEditingCommander ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customCommanderRank}
                        onChange={(e) => setCustomCommanderRank(e.target.value)}
                        className="w-16 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold"
                        placeholder="ยศ"
                      />
                      <input
                        type="text"
                        value={customCommanderName}
                        onChange={(e) => setCustomCommanderName(e.target.value)}
                        className="w-44 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold"
                        placeholder="ชื่อ-สกุล ผบก."
                      />
                      <button
                        onClick={handleSaveCommander}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold"
                      >
                        บันทึก
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-800">
                      ผบก.ภ.จว.นครพนม: <strong>{stationConfig.provincialCommanderRank} {stationConfig.provincialCommanderName}</strong>
                      <button
                        onClick={() => setIsEditingCommander(true)}
                        className="ml-2 text-rose-800 hover:underline font-semibold"
                      >
                        (แก้ไขชื่อ)
                      </button>
                    </span>
                  )}
                </div>

                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-rose-900 hover:bg-rose-800 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  สั่งพิมพ์แบบฟอร์มนี้ (A4)
                </button>
              </div>

              {/* OFFICIAL PRINTABLE A4 SHEET MATCHING ATTACHED PDF EXACTLY */}
              <div className="print-container bg-white border border-slate-300 p-8 sm:p-12 shadow-sm rounded-xl text-slate-900 font-serif leading-relaxed text-[15px] select-text">
                {/* Title */}
                <div className="text-center font-bold text-xl sm:text-2xl mb-6 tracking-wide">
                  {leave.leaveType === 'vacation' && 'แบบใบลาพักผ่อน'}
                  {(leave.leaveType === 'sick' || leave.leaveType === 'personal' || leave.leaveType === 'maternity') && 'แบบใบลาป่วย ลาคลอด ลากิจส่วนตัว'}
                  {leave.leaveType === 'paternity' && 'แบบใบลาเพื่อดูแลบุตรและภรรยาหลังคลอด'}
                  {leave.leaveType === 'ordination' && 'แบบใบลาอุปสมบท'}
                  {leave.leaveType !== 'vacation' && leave.leaveType !== 'sick' && leave.leaveType !== 'personal' && leave.leaveType !== 'maternity' && leave.leaveType !== 'paternity' && leave.leaveType !== 'ordination' && `แบบใบ${leaveInfo.title}`}
                </div>

                {/* Place and Date Header */}
                <div className="flex justify-end mb-4">
                  <div className="w-72 text-right">
                    <div>เขียนที่ {stationConfig.stationName}</div>
                    <div className="mt-1">
                      วันที่ <span className="border-b border-dotted border-slate-600 px-2 font-bold">{new Date(leave.submittedAt).getDate()}</span> 
                      เดือน <span className="border-b border-dotted border-slate-600 px-2 font-bold">{formatThaiDate(leave.submittedAt).split(' ')[1]}</span> 
                      พ.ศ. <span className="border-b border-dotted border-slate-600 px-2 font-bold">{leave.fiscalYear}</span>
                    </div>
                  </div>
                </div>

                {/* Subject & Recipient Header */}
                <div className="mb-4 space-y-1">
                  <div>
                    เรื่อง <span className="ml-4 font-bold">ขออนุญาต{leaveInfo.title}</span>
                  </div>
                  <div>
                    เรียน <span className="ml-4 font-bold">
                      {leave.leaveType === 'ordination' 
                        ? `ผู้บังคับการตำรวจภูธรจังหวัดนครพนม (${stationConfig.provincialCommanderRank} ${stationConfig.provincialCommanderName})` 
                        : `ผู้กำกับการ${stationConfig.stationName}`}
                    </span>
                  </div>
                </div>

                {/* Body paragraph */}
                <div className="space-y-2 indent-8 text-justify">
                  <p>
                    ข้าพเจ้า <span className="font-bold border-b border-dotted border-slate-600 px-2">{leave.userRank} {leave.userFullName}</span>
                    ตำแหน่ง <span className="font-bold border-b border-dotted border-slate-600 px-2">{leave.userPosition}</span>
                    สังกัด <span className="font-bold border-b border-dotted border-slate-600 px-2">{stationConfig.stationName}</span>
                    กองบังคับการ <span className="font-bold border-b border-dotted border-slate-600 px-2">ตำรวจภูธรจังหวัดนครพนม</span>
                    กองบัญชาการ <span className="font-bold border-b border-dotted border-slate-600 px-2">{stationConfig.region}</span>
                  </p>

                  {/* Vacation Leave Specific Paragraph */}
                  {leave.leaveType === 'vacation' && (
                    <p>
                      มีวันลาพักผ่อนสะสม <span className="font-bold border-b border-dotted border-slate-600 px-2">{requester?.accumulatedVacationDays || 14}</span> วันทำการ 
                      มีสิทธิลาพักผ่อนประจำปีนี้อีก <span className="font-bold border-b border-dotted border-slate-600 px-2">{requester?.currentYearVacationQuota || 10}</span> วันทำการ 
                      รวมเป็น <span className="font-bold border-b border-dotted border-slate-600 px-2">{(requester?.accumulatedVacationDays || 14) + (requester?.currentYearVacationQuota || 10)}</span> วันทำการ 
                      ขอลาพักผ่อนตั้งแต่วันที่ <span className="font-bold border-b border-dotted border-slate-600 px-2">{formatThaiDate(leave.startDate)}</span> 
                      ถึงวันที่ <span className="font-bold border-b border-dotted border-slate-600 px-2">{formatThaiDate(leave.endDate)}</span> 
                      มีกำหนด <span className="font-bold border-b border-dotted border-slate-600 px-2">{leave.totalDays}</span> วัน
                    </p>
                  )}

                  {/* Paternity Leave Specific Paragraph */}
                  {leave.leaveType === 'paternity' && (
                    <p>
                      ภรรยาชื่อ <span className="font-bold border-b border-dotted border-slate-600 px-2">{leave.wifeName || '................................'}</span>
                      คลอดเมื่อ <span className="font-bold border-b border-dotted border-slate-600 px-2">{formatThaiDate(leave.wifeDeliveredDate || '') || '................................'}</span>
                      มีความประสงค์ขอลาเพื่อดูแลบุตรและภรรยาหลังคลอด ตั้งแต่วันที่ <span className="font-bold border-b border-dotted border-slate-600 px-2">{formatThaiDate(leave.startDate)}</span> 
                      ถึงวันที่ <span className="font-bold border-b border-dotted border-slate-600 px-2">{formatThaiDate(leave.endDate)}</span> 
                      มีกำหนด <span className="font-bold border-b border-dotted border-slate-600 px-2">{leave.totalDays}</span> วัน
                    </p>
                  )}

                  {/* Ordination Leave Specific Paragraph */}
                  {leave.leaveType === 'ordination' && (
                    <p>
                      บัดนี้มีศรัทธาจะอุปสมบทในพุทธศาสนา ณ วัด <span className="font-bold border-b border-dotted border-slate-600 px-2">{leave.templeName || '................................'}</span>
                      ตั้งอยู่ ณ <span className="font-bold border-b border-dotted border-slate-600 px-2">{leave.templeLocation || '................................'}</span>
                      และจะจำพรรษา ณ วัด <span className="font-bold border-b border-dotted border-slate-600 px-2">{leave.resideTempleName || '................................'}</span>
                      จึงขอลาอุปสมบท มีกำหนด <span className="font-bold border-b border-dotted border-slate-600 px-2">{leave.totalDays}</span> วัน 
                      ตั้งแต่วันที่ <span className="font-bold border-b border-dotted border-slate-600 px-2">{formatThaiDate(leave.startDate)}</span> 
                      ถึงวันที่ <span className="font-bold border-b border-dotted border-slate-600 px-2">{formatThaiDate(leave.endDate)}</span>
                    </p>
                  )}

                  <p>
                    ในระหว่างลาติดต่อข้าพเจ้าได้ที่ <span className="font-bold border-b border-dotted border-slate-600 px-2">{leave.contactAddress}</span>
                    เบอร์โทรศัพท์ <span className="font-bold border-b border-dotted border-slate-600 px-2">{leave.contactPhone}</span>
                  </p>
                </div>

                {/* Requester Signature */}
                <div className="flex justify-end mt-6">
                  <div className="w-80 text-center space-y-1">
                    <div>ขอแสดงความนับถือ</div>
                    <div className="pt-6 font-bold">(ลงชื่อ) {leave.userRank}....................................................</div>
                    <div className="font-bold">( {leave.userFullName} )</div>
                    <div className="text-sm">ตำแหน่ง {leave.userPosition}</div>
                  </div>
                </div>

                {/* 2 Columns: Statistics & Recommendation / Order */}
                <div className="mt-8 grid grid-cols-2 gap-8 border-t border-slate-300 pt-6">
                  {/* Left Column: Statistics Table & Staffing Box (As in Attached Slip) */}
                  <div className="space-y-4">
                    <div className="font-bold text-sm">สถิติการลาในปีงบประมาณนี้</div>
                    
                    <table className="w-full text-center border-collapse border border-slate-800 text-xs">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-800 p-1">ลามาแล้ว<br/>(วันทำการ)</th>
                          <th className="border border-slate-800 p-1">ลาครั้งนี้<br/>(วันทำการ)</th>
                          <th className="border border-slate-800 p-1">รวมเป็น<br/>(วันทำการ)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-800 p-2 font-bold tabular-nums">
                            {requester?.usedVacationDays || '-'}
                          </td>
                          <td className="border border-slate-800 p-2 font-bold tabular-nums">
                            {leave.totalDays}
                          </td>
                          <td className="border border-slate-800 p-2 font-bold tabular-nums">
                            {(requester?.usedVacationDays || 0) + leave.totalDays}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Manpower slip section matching image attachment */}
                    <div className="pt-2 text-xs leading-relaxed space-y-1">
                      <div>
                        ผู้ลาปฏิบัติหน้าที่ <span className="font-bold border-b border-dotted border-slate-600 px-2">{leave.dutyDepartmentText || 'งานอำนวยการ'}</span>
                      </div>
                      <div>
                        มีกำลังปฏิบัติหน้าที่ <span className="font-bold border-b border-dotted border-slate-600 px-2">{leave.dutyTotalStaff}</span> นาย
                        ลา <span className="font-bold border-b border-dotted border-slate-600 px-2">{leave.dutyLeaveStaff}</span> นาย
                      </div>
                      <div>
                        เหลือกำลังปฏิบัติหน้าที่ <span className="font-bold border-b border-dotted border-slate-600 px-2">{leave.dutyRemainingStaff}</span> นาย
                      </div>

                      <div className="pt-4 text-center space-y-1">
                        <div>เพื่อโปรดพิจารณา</div>
                        <div className="pt-3 font-bold">
                          (ลงชื่อ) {leave.userRank}....................................................
                        </div>
                        <div className="text-xs">
                          ตำแหน่ง {leave.userPosition || 'ผบ.หมู่(ป.)สภ.ศรีสงคราม'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Supervisor's Recommendation & Commander's Order */}
                  <div className="space-y-6 text-xs">
                    {/* Supervisor's View */}
                    <div className="space-y-1">
                      <div className="font-bold text-sm">ความเห็นของผู้บังคับบัญชา</div>
                      <div className="border-b border-dotted border-slate-400 py-1 italic text-slate-700">
                        {leave.supervisorComment || 'เห็นควรอนุญาตให้ลาได้ โดยไม่กระทบต่อภารกิจ'}
                      </div>
                      <div className="pt-4 text-center">
                        <div className="font-bold">(ลงชื่อ) {stationConfig.inspectorRank}....................................................</div>
                        <div className="font-bold text-slate-800">
                          ( {leave.supervisorName?.replace(stationConfig.inspectorRank, '').trim() || stationConfig.inspectorName} )
                        </div>
                        <div>ตำแหน่ง สว.อก.{stationConfig.stationName}</div>
                        <div>วันที่ .......... เดือน .................... พ.ศ. ...........</div>
                      </div>
                    </div>

                    {/* Final Order */}
                    <div className="border-t border-slate-300 pt-3 space-y-1">
                      <div className="font-bold text-sm">คำสั่ง</div>
                      <div className="flex items-center gap-6 pt-1">
                        <span className="flex items-center gap-1.5 font-bold">
                          <span className={`w-3.5 h-3.5 rounded-full border border-slate-800 inline-block ${leave.status === 'approved' ? 'bg-slate-900' : ''}`} />
                          อนุญาต
                        </span>
                        <span className="flex items-center gap-1.5 font-bold">
                          <span className={`w-3.5 h-3.5 rounded-full border border-slate-800 inline-block ${leave.status === 'rejected' ? 'bg-slate-900' : ''}`} />
                          ไม่อนุมัติ
                        </span>
                      </div>

                      <div className="pt-4 text-center">
                        <div className="font-bold">
                          (ลงชื่อ) {leave.leaveType === 'ordination' ? stationConfig.provincialCommanderRank : stationConfig.superintendentRank}....................................................
                        </div>
                        <div className="font-bold text-slate-900">
                          {leave.leaveType === 'ordination' ? (
                            `( ${stationConfig.provincialCommanderName} )`
                          ) : (
                            `( ${stationConfig.superintendentName} )`
                          )}
                        </div>
                        <div>
                          {leave.leaveType === 'ordination' ? (
                            'ผบก.ภ.จว.นครพนม'
                          ) : (
                            `ผกก.${stationConfig.stationName}`
                          )}
                        </div>
                        <div>วันที่ .......... เดือน .................... พ.ศ. ...........</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cancellation Prompt Modal (Requirement #19) */}
        {showCancelPrompt && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl">
              <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                <Ban className="w-4 h-4 text-rose-700" /> ยืนยันยกเลิกคำขอลา
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                คำขอลาเลขที่ {leave.leaveNumber} จะถูกเปลี่ยนสถานะเป็น 'cancelled'
              </p>
              <textarea
                rows={2}
                value={cancelReasonText}
                onChange={(e) => setCancelReasonText(e.target.value)}
                placeholder="ระบุเหตุผลในการขอยกเลิก..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs mb-3"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCancelPrompt(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  ย้อนกลับ
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="px-4 py-1.5 bg-rose-700 text-white rounded text-xs font-bold"
                >
                  ยืนยันยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Prompt Modal */}
        {showRejectPrompt && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl">
              <h4 className="font-bold text-slate-900 text-sm mb-2 text-rose-700 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> ระบุเหตุผลไม่อนุมัติ (ระเบียบบังคับ)
              </h4>
              <textarea
                rows={3}
                value={rejectReasonText}
                onChange={(e) => setRejectReasonText(e.target.value)}
                placeholder="เหตุผลความจำเป็นของราชการ..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs mb-3"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowRejectPrompt(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  ย้อนกลับ
                </button>
                <button
                  onClick={handleConfirmReject}
                  className="px-4 py-1.5 bg-rose-700 text-white rounded text-xs font-bold"
                >
                  ยืนยันไม่อนุมัติ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
