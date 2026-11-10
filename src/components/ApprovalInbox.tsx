/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Ban,
  Eye,
  Filter,
  UserCheck,
  AlertCircle,
  Clock,
  Shield,
  FileText,
  Search,
} from 'lucide-react';
import { LeaveRequest, LEAVE_TYPES, LeaveStatus } from '../types/leave';

interface ApprovalInboxProps {
  onSelectLeave: (leaveId: string) => void;
}

export const ApprovalInbox: React.FC<ApprovalInboxProps> = ({ onSelectLeave }) => {
  const { 
    currentUser, 
    leaveRequests, 
    approveLeaveRequest, 
    rejectLeaveRequest, 
    returnForRevision, 
    cancelLeaveRequest,
    stationConfig,
    users 
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Rejection modal state (Requirement #49: บังคับกรอกเหตุผลเมื่อไม่อนุมัติ)
  const [rejectingLeaveId, setRejectingLeaveId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Revision modal state
  const [revisingLeaveId, setRevisingLeaveId] = useState<string | null>(null);
  const [revisionNote, setRevisionNote] = useState<string>('');

  // Cancellation modal state (Requirement #19: ปุ่มยกเลิกคำขอลา)
  const [cancellingLeaveId, setCancellingLeaveId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('');

  // Delegation acting approver toggle (Requirement #50)
  const [isDelegatedMode, setIsDelegatedMode] = useState(false);

  // Filter requests based on status and search query
  const filteredRequests = leaveRequests.filter((lr) => {
    // Status filter
    if (statusFilter === 'pending') {
      if (lr.status !== 'pending_approval' && lr.status !== 'pending_inspection' && lr.status !== 'revision') {
        return false;
      }
    } else if (statusFilter === 'approved' && lr.status !== 'approved') {
      return false;
    } else if (statusFilter === 'rejected' && lr.status !== 'rejected') {
      return false;
    } else if (statusFilter === 'cancelled' && lr.status !== 'cancelled') {
      return false;
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = lr.userFullName.toLowerCase().includes(q);
      const matchCallsign = lr.userCallsign.toLowerCase().includes(q);
      const matchNum = lr.leaveNumber.toLowerCase().includes(q);
      const matchRank = lr.userRank.toLowerCase().includes(q);
      if (!matchName && !matchCallsign && !matchNum && !matchRank) return false;
    }

    return true;
  });

  const handleApprove = (leaveId: string) => {
    approveLeaveRequest(leaveId, 'อนุมัติเรียบร้อยตามระเบียบ');
  };

  const confirmReject = () => {
    if (!rejectionReason.trim()) {
      setRejectError('กรุณากรอกเหตุผลที่ไม่อนุมัติการลา (ระเบียบบังคับ)');
      return;
    }
    if (rejectingLeaveId) {
      rejectLeaveRequest(rejectingLeaveId, rejectionReason.trim());
      setRejectingLeaveId(null);
      setRejectionReason('');
      setRejectError(null);
    }
  };

  const confirmRevision = () => {
    if (!revisionNote.trim()) return;
    if (revisingLeaveId) {
      returnForRevision(revisingLeaveId, revisionNote.trim());
      setRevisingLeaveId(null);
      setRevisionNote('');
    }
  };

  const confirmCancel = () => {
    if (!cancellationReason.trim()) return;
    if (cancellingLeaveId) {
      cancelLeaveRequest(cancellingLeaveId, cancellationReason.trim());
      setCancellingLeaveId(null);
      setCancellationReason('');
    }
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'approved':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-xs font-bold">✓ อนุมัติแล้ว</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded text-xs font-bold">✕ ไม่อนุมัติ</span>;
      case 'pending_approval':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded text-xs font-bold">⏳ รออนุมัติ</span>;
      case 'pending_inspection':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded text-xs font-bold">📋 รอตรวจเอกสาร</span>;
      case 'revision':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 border border-purple-300 rounded text-xs font-bold">⚠️ ส่งกลับแก้ไข</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-300 rounded text-xs font-bold">ยกเลิกแล้ว</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-900 rounded-xl border border-rose-100">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                กล่องงานอนุมัติการลา (Approval Inbox)
              </h2>
              <p className="text-xs text-slate-500">
                ตรวจสอบคำขอลา ตรวจเอกสารประกอบ และลงนามคำสั่งตามสายบังคับบัญชา
              </p>
            </div>
          </div>

          {/* Delegation Toggle (Requirement #50) */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={isDelegatedMode}
                onChange={(e) => setIsDelegatedMode(e.target.checked)}
                className="rounded text-rose-800 focus:ring-rose-800"
              />
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-rose-800" />
                ปฏิบัติราชการแทน ผกก.
              </span>
            </label>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-white text-rose-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รออนุมัติ / ตรวจสอบ
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'approved'
                  ? 'bg-white text-emerald-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              อนุมัติแล้ว
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'rejected'
                  ? 'bg-white text-rose-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ไม่อนุมัติ
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'cancelled'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ยกเลิก
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อ, เลขที่ใบลา, นามเรียกขาน..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-rose-800"
            />
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <Inbox className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
            <p className="text-sm font-semibold">ไม่มีรายการคำขอลาในสถานะนี้</p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const leaveInfo = LEAVE_TYPES[req.leaveType] || LEAVE_TYPES.vacation;
            const canCancel = currentUser?.role === 'admin' || currentUser?.id === req.userId;
            const canApprove = 
              currentUser?.role === 'admin' || 
              currentUser?.role === 'superintendent' || 
              currentUser?.role === 'approver' ||
              isDelegatedMode;

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left side: Officer & Leave Info */}
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#721319] text-white flex flex-col items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                    <span>{req.userRank}</span>
                    <span className="text-[10px] opacity-80">{req.userCallsign.replace('ศรีสงคราม', 'SSK')}</span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {req.leaveNumber}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {req.userRank} {req.userFullName}
                      </h4>
                      <span className="text-xs text-slate-500">({req.userPosition})</span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-bold text-slate-800">
                        <span>{leaveInfo.emoji}</span>
                        <span>{leaveInfo.title}</span>
                      </span>
                      <span>·</span>
                      <span className="text-slate-700">
                        วันที่: <strong>{req.startDate}</strong> ถึง <strong>{req.endDate}</strong>
                      </span>
                      <span>·</span>
                      <span className="font-bold text-rose-900">
                        {req.totalDays} วันทำการ
                      </span>
                    </div>

                    {/* Manpower on duty callout summary */}
                    <div className="mt-1.5 text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                      <span>กำลังปฏิบัติหน้าที่ {req.dutyTotalStaff} นาย</span>
                      <span>·</span>
                      <span>ลา {req.dutyLeaveStaff} นาย</span>
                      <span>·</span>
                      <span className="text-emerald-700 font-bold">เหลือกำลังปฏิบัติหน้าที่ {req.dutyRemainingStaff} นาย</span>
                    </div>

                    {req.reason && (
                      <p className="mt-1 text-xs text-slate-500 italic">
                        “{req.reason}”
                      </p>
                    )}

                    {req.attachmentName && (
                      <div className="mt-1 text-[11px] text-sky-700 flex items-center gap-1 font-semibold">
                        <FileText className="w-3.5 h-3.5" />
                        <span>เอกสารแนบ: {req.attachmentName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: Actions & Status */}
                <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <div className="mr-2">
                    {getStatusBadge(req.status)}
                  </div>

                  {/* View Details Modal */}
                  <button
                    onClick={() => onSelectLeave(req.id)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    title="ดูรายละเอียดใบลาและพิมพ์"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">ดูใบลา</span>
                  </button>

                  {/* Approval Actions (for Approver/Superintendent/Admin) */}
                  {req.status !== 'approved' && req.status !== 'cancelled' && canApprove && (
                    <>
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        อนุมัติ
                      </button>

                      <button
                        onClick={() => {
                          setRejectingLeaveId(req.id);
                          setRejectionReason('');
                          setRejectError(null);
                        }}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        ไม่อนุมัติ
                      </button>

                      <button
                        onClick={() => {
                          setRevisingLeaveId(req.id);
                          setRevisionNote('');
                        }}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        title="ส่งกลับแก้ไข"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        ส่งกลับ
                      </button>
                    </>
                  )}

                  {/* Requirement #19: ปุ่มยกเลิกคำขอลา สำหรับเจ้าของหรือแอดมิน */}
                  {req.status !== 'cancelled' && canCancel && (
                    <button
                      onClick={() => {
                        setCancellingLeaveId(req.id);
                        setCancellationReason('');
                      }}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      title="ยกเลิกคำขอลา"
                    >
                      <Ban className="w-3.5 h-3.5 text-rose-700" />
                      ยกเลิกคำขอลา
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Mandatory Rejection Reason Modal (Requirement #49) */}
      {rejectingLeaveId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-base mb-2">
              <XCircle className="w-5 h-5" />
              <span>ระบุเหตุผลที่ไม่อนุมัติการลา (ระเบียบบังคับ)</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              ตามระเบียบราชการ การไม่อนุมัติใบลาจำเป็นต้องบันทึกเหตุผลความจำเป็นของทางราชการหรือข้อขัดข้อง
            </p>

            {rejectError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs mb-3">
                {rejectError}
              </div>
            )}

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="เช่น ติดภารกิจถวายความปลอดภัย, กำลังพลในผลัดไม่เพียงพอต่อการรักษาความสงบ, อยู่ระหว่างการสอบสวนข้อเท็จจริง"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-rose-800 mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectingLeaveId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
              >
                ยืนยันไม่อนุมัติ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {revisingLeaveId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              ระบุข้อความแจ้งให้ผู้ยื่นลาแก้ไข
            </h3>
            <textarea
              rows={3}
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              placeholder="เช่น กรุณาแนบใบรับรองแพทย์เพิ่มเติม, แก้ไขช่วงวันที่ให้ตรงกับเวรปฏิบัติหน้าที่"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-rose-800 mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRevisingLeaveId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmRevision}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
              >
                ส่งกลับแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal (Requirement #19) */}
      {cancellingLeaveId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-2">
              <Ban className="w-5 h-5 text-rose-700" />
              <span>ยืนยันยกเลิกคำขอลา</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              เมื่อยกเลิกคำขอลา สถานะจะเปลี่ยนเป็น 'cancelled' ในฐานข้อมูล และคืนสิทธิวันลา (หากอนุมัติไปแล้ว)
            </p>
            <textarea
              rows={2}
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="ระบุเหตุผลในการขอยกเลิกคำขอลา..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-rose-800 mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setCancellingLeaveId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
              >
                ยืนยันยกเลิกลา
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
