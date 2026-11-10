/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  History,
  Search,
  Filter,
  Eye,
  Calendar,
  WifiOff,
  Download,
} from 'lucide-react';
import { LEAVE_TYPES, DEPARTMENTS, LeaveType } from '../types/leave';

interface LeaveHistoryViewProps {
  onSelectLeave: (leaveId: string) => void;
}

export const LeaveHistoryView: React.FC<LeaveHistoryViewProps> = ({ onSelectLeave }) => {
  const { leaveRequests, availableFiscalYears } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredHistory = leaveRequests.filter((lr) => {
    if (selectedType !== 'all' && lr.leaveType !== selectedType) return false;
    if (selectedYear !== 'all' && lr.fiscalYear !== parseInt(selectedYear)) return false;
    if (selectedStatus !== 'all' && lr.status !== selectedStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = lr.userFullName.toLowerCase().includes(q);
      const matchNum = lr.leaveNumber.toLowerCase().includes(q);
      const matchCall = lr.userCallsign.toLowerCase().includes(q);
      const matchRank = lr.userRank.toLowerCase().includes(q);
      const matchDept = lr.userDepartment.toLowerCase().includes(q);
      if (!matchName && !matchNum && !matchCall && !matchRank && !matchDept) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-900 rounded-xl border border-rose-100">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                ประวัติการลาข้าราชการตำรวจ สภ.ศรีสงคราม
              </h2>
              <p className="text-xs text-slate-500">
                ค้นหาย้อนหลังตามชื่อ ยศ หน่วยงาน เลขที่ใบลา และปีงบประมาณ (รองรับการเปิดดูแบบ Offline ผ่าน Service Worker)
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อ, เลขที่ใบลา, นามเรียกขาน..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-rose-800"
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="all">ทุกประเภทการลา</option>
              {(Object.keys(LEAVE_TYPES) as LeaveType[]).map((k) => (
                <option key={k} value={k}>{LEAVE_TYPES[k].title}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="all">ทุกปีงบประมาณ</option>
              {availableFiscalYears.map((yr) => (
                <option key={yr} value={yr}>ปีงบประมาณ {yr}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="pending_approval">รออนุมัติ</option>
              <option value="pending_inspection">รอตรวจเอกสาร</option>
              <option value="rejected">ไม่อนุมัติ</option>
              <option value="cancelled">ยกเลิกแล้ว</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-10 text-center">ลำดับ</th>
                <th className="py-3 px-3">เลขที่ใบลา</th>
                <th className="py-3 px-3">ยศ ชื่อ-สกุล</th>
                <th className="py-3 px-3">ประเภทการลา</th>
                <th className="py-3 px-3">ช่วงวันที่ลา</th>
                <th className="py-3 px-3 text-center">วันทำการ</th>
                <th className="py-3 px-3 text-center">สถานะ</th>
                <th className="py-3 px-3 text-right">เรียกดู</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    ไม่พบประวัติการลาตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item, idx) => {
                  const typeInfo = LEAVE_TYPES[item.leaveType] || LEAVE_TYPES.personal;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {item.leaveNumber}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">
                          {item.userRank} {item.userFullName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.userPosition} · {item.userCallsign}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${typeInfo.badgeBg}`}>
                          <span>{typeInfo.emoji}</span>
                          <span>{typeInfo.title}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        {item.startDate} ถึง {item.endDate}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900 tabular-nums">
                        {item.totalDays}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {item.status === 'approved' && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                            อนุมัติแล้ว
                          </span>
                        )}
                        {item.status === 'pending_approval' && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                            รออนุมัติ
                          </span>
                        )}
                        {item.status === 'pending_inspection' && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                            รอตรวจเอกสาร
                          </span>
                        )}
                        {item.status === 'rejected' && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded">
                            ไม่อนุมัติ
                          </span>
                        )}
                        {item.status === 'cancelled' && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                            ยกเลิกแล้ว
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onSelectLeave(item.id)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
