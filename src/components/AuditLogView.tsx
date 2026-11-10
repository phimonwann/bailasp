/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  FileText,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  Ban,
  Key,
} from 'lucide-react';
import { AuditLog } from '../types/leave';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = log.userName.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      if (!matchName && !matchDetails && !matchAction) return false;
    }
    return true;
  });

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'create':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">สร้าง/ยื่น</span>;
      case 'edit':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">แก้ไข</span>;
      case 'delete':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">ลบ</span>;
      case 'approve':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">อนุมัติ</span>;
      case 'reject':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">ไม่อนุมัติ</span>;
      case 'cancel':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">ยกเลิก</span>;
      case 'login':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">เข้าสู่ระบบ</span>;
      case 'logout':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">ออกจากระบบ</span>;
      case 'password_reset':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">รีเซ็ตรหัสผ่าน</span>;
      case 'config_update':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">ตั้งค่าระบบ</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{action}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-900 rounded-xl border border-rose-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                ประวัติการใช้งานระบบ (Audit Logs - Requirement #34)
              </h2>
              <p className="text-xs text-slate-500">
                บันทึกประวัติการกระทำทั้งหมด: ใครเพิ่ม แก้ไข ลบ อนุมัติ หรือยกเลิกข้อมูล เพื่อความโปร่งใสและตรวจสอบได้
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อผู้ดำเนินการ, รายละเอียดการกระทำ..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-rose-800"
            />
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="all">ทุกประเภทการกระทำ</option>
              <option value="approve">อนุมัติ (Approve)</option>
              <option value="reject">ไม่อนุมัติ (Reject)</option>
              <option value="create">สร้าง/ยื่นใบลา (Create)</option>
              <option value="cancel">ยกเลิก (Cancel)</option>
              <option value="edit">แก้ไข (Edit)</option>
              <option value="delete">ลบข้อมูล (Delete)</option>
              <option value="login">เข้าสู่ระบบ (Login)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-10 text-center">ลำดับ</th>
                <th className="py-3 px-3 w-36">วัน-เวลา</th>
                <th className="py-3 px-3">ผู้ดำเนินการ</th>
                <th className="py-3 px-3 w-28 text-center">การกระทำ</th>
                <th className="py-3 px-3">รายละเอียดการบันทึก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log, idx) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('th-TH')}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {log.userName}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
