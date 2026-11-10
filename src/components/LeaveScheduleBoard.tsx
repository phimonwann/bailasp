/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Printer,
  Calendar,
  Filter,
  Download,
  Users,
  Search,
  Grid3X3,
} from 'lucide-react';
import { DEPARTMENTS, DepartmentCode, LEAVE_TYPES } from '../types/leave';

export const LeaveScheduleBoard: React.FC = () => {
  const { users, leaveRequests, stationConfig, availableFiscalYears } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<number>(9); // 0 = Jan, 9 = Oct
  const [selectedYear, setSelectedYear] = useState<number>(2568);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  // Number of days in selected month (accounting for leap year)
  const gregorianYear = selectedYear - 543;
  const daysInMonth = new Date(gregorianYear, selectedMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Filter officers
  const filteredUsers = users.filter((u) => {
    if (departmentFilter !== 'all' && u.department !== departmentFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.rank.toLowerCase().includes(q) ||
        u.callsign.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Helper to find if officer is on leave on day X of selected month
  const getLeaveOnDay = (userId: string, day: number) => {
    const monthPadded = String(selectedMonth + 1).padStart(2, '0');
    const dayPadded = String(day).padStart(2, '0');
    const targetDateStr = `${gregorianYear}-${monthPadded}-${dayPadded}`;

    const match = leaveRequests.find((lr) => {
      if (lr.userId !== userId) return false;
      if (lr.status !== 'approved' && lr.status !== 'pending_approval') return false;
      return targetDateStr >= lr.startDate && targetDateStr <= lr.endDate;
    });

    if (!match) return null;
    return match;
  };

  const getCellCode = (type: string) => {
    switch (type) {
      case 'vacation': return { code: 'พ', bg: 'bg-amber-300 text-amber-950 font-bold', note: 'ลาพักผ่อน-พ.' };
      case 'personal': return { code: 'ก', bg: 'bg-indigo-200 text-indigo-950 font-bold', note: 'ลากิจ-ก.' };
      case 'sick': return { code: 'ป', bg: 'bg-rose-300 text-rose-950 font-bold', note: 'ลาป่วย-ป.' };
      case 'paternity': return { code: 'ลก', bg: 'bg-teal-200 text-teal-950 font-bold', note: 'ลาเลี้ยงลูก-ลก.' };
      case 'official': return { code: 'ปก', bg: 'bg-emerald-300 text-emerald-950 font-bold', note: 'ไปราชการ-ปก.' };
      case 'ot': return { code: 'OT', bg: 'bg-blue-300 text-blue-950 font-bold', note: 'เบิก OT-OT' };
      case 'assisting': return { code: 'ช่วย', bg: 'bg-slate-300 text-slate-900 font-bold', note: 'ช่วยราชการ' };
      default: return { code: 'ล', bg: 'bg-purple-200 text-purple-900 font-bold', note: 'ลา' };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-900 rounded-xl border border-rose-100">
              <Grid3X3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                แผงการลาข้าราชการตำรวจ {stationConfig.stationName}
              </h2>
              <p className="text-xs text-slate-500">
                ตารางคุมวันลา 31 วัน แสดงสัญลักษณ์รหัสการลาตามแบบทางการ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              พิมพ์แผงการลา (A4 แนวนอน)
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">เลือกเดือน</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              {thaiMonths.map((m, idx) => (
                <option key={idx} value={idx}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">เลือกปีงบประมาณ</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              {availableFiscalYears.map((yr) => (
                <option key={yr} value={yr}>พ.ศ. {yr}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">สายงาน</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="all">ทุกสายงาน ({users.length} นาย)</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ค้นหาตำรวจ</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ชื่อ, สกุล, ยศ..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-bold text-slate-700">รหัสสัญลักษณ์:</span>
          <span className="flex items-center gap-1.5"><span className="w-5 h-5 bg-amber-300 text-amber-950 font-bold rounded flex items-center justify-center text-[10px]">พ</span> ลาพักผ่อน</span>
          <span className="flex items-center gap-1.5"><span className="w-5 h-5 bg-indigo-200 text-indigo-950 font-bold rounded flex items-center justify-center text-[10px]">ก</span> ลากิจส่วนตัว</span>
          <span className="flex items-center gap-1.5"><span className="w-5 h-5 bg-rose-300 text-rose-950 font-bold rounded flex items-center justify-center text-[10px]">ป</span> ลาป่วย</span>
          <span className="flex items-center gap-1.5"><span className="w-5 h-5 bg-teal-200 text-teal-950 font-bold rounded flex items-center justify-center text-[10px]">ลก</span> ลาเลี้ยงลูก</span>
          <span className="flex items-center gap-1.5"><span className="w-5 h-5 bg-emerald-300 text-emerald-950 font-bold rounded flex items-center justify-center text-[10px]">ปก</span> ไปราชการ</span>
          <span className="flex items-center gap-1.5"><span className="w-5 h-5 bg-blue-300 text-blue-950 font-bold rounded flex items-center justify-center text-[10px]">OT</span> เบิก OT</span>
          <span className="flex items-center gap-1.5"><span className="w-5 h-5 bg-slate-300 text-slate-900 font-bold rounded flex items-center justify-center text-[10px]">ช่วย</span> ช่วยราชการ</span>
        </div>
      </div>

      {/* Roster Leave Schedule Table (Matching PDF Attachment) */}
      <div className="bg-white rounded-2xl border border-slate-300 p-4 sm:p-6 shadow-sm overflow-x-auto print:border-none print:p-0 print:shadow-none">
        {/* Title Header on Print */}
        <div className="text-center mb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            แผงการลาข้าราชการตำรวจ {stationConfig.stationName}
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
            ประจำเดือน {thaiMonths[selectedMonth]} {selectedYear}
          </p>
        </div>

        <table className="w-full text-center border-collapse border border-slate-400 text-[11px] leading-tight select-text">
          <thead>
            <tr className="bg-slate-100 text-slate-800">
              <th className="border border-slate-400 py-2 px-1 w-8 font-bold">ลำดับ</th>
              <th className="border border-slate-400 py-2 px-1 w-12 font-bold">ยศ</th>
              <th className="border border-slate-400 py-2 px-2 w-24 font-bold text-left">ชื่อ</th>
              <th className="border border-slate-400 py-2 px-2 w-24 font-bold text-left">สกุล</th>
              {daysArray.map((d) => (
                <th key={d} className="border border-slate-400 py-1.5 px-0.5 min-w-[20px] font-bold">
                  {d}
                </th>
              ))}
              <th className="border border-slate-400 py-2 px-2 min-w-[80px] font-bold">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((officer, idx) => {
              // Gather notes from leaves in this month
              const officerNotes: string[] = [];

              return (
                <tr key={officer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="border border-slate-400 py-1.5 px-1 font-bold text-slate-600">{idx + 1}</td>
                  <td className="border border-slate-400 py-1.5 px-1 font-bold text-slate-800">{officer.rank}</td>
                  <td className="border border-slate-400 py-1.5 px-2 text-left font-bold text-slate-900 truncate max-w-[100px]">
                    {officer.firstName}
                  </td>
                  <td className="border border-slate-400 py-1.5 px-2 text-left text-slate-700 truncate max-w-[100px]">
                    {officer.lastName}
                  </td>

                  {/* 1-31 Day Cells */}
                  {daysArray.map((dayNum) => {
                    const leaveOnDay = getLeaveOnDay(officer.id, dayNum);
                    if (leaveOnDay) {
                      const cell = getCellCode(leaveOnDay.leaveType);
                      if (!officerNotes.includes(cell.note)) officerNotes.push(cell.note);
                      return (
                        <td 
                          key={dayNum} 
                          className={`border border-slate-400 p-0 text-center text-[10px] ${cell.bg}`}
                          title={`${officer.rank} ${officer.firstName}: ${LEAVE_TYPES[leaveOnDay.leaveType]?.title} (${leaveOnDay.leaveNumber})`}
                        >
                          {cell.code}
                        </td>
                      );
                    }
                    return (
                      <td key={dayNum} className="border border-slate-400 p-0 bg-white"></td>
                    );
                  })}

                  <td className="border border-slate-400 py-1 px-1 text-[10px] text-slate-600 text-left">
                    {officerNotes.join(', ')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer print signatures */}
        <div className="mt-8 grid grid-cols-2 gap-8 text-center text-xs print:block">
          <div>
            <div>ผู้รวบรวม / ผู้ตรวจสอบ</div>
            <div className="pt-6 font-bold">( {stationConfig.inspectorRank} {stationConfig.inspectorName} )</div>
            <div className="text-[11px] text-slate-600">ตำแหน่ง สว.อก.{stationConfig.stationName}</div>
          </div>
          <div>
            <div>ทราบ / ตรวจแล้ว</div>
            <div className="pt-6 font-bold">( {stationConfig.superintendentRank} {stationConfig.superintendentName} )</div>
            <div className="text-[11px] text-slate-600">ผกก.{stationConfig.stationName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
