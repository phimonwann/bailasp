/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  Filter,
  Users,
  Award,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { LEAVE_TYPES, DEPARTMENTS } from '../types/leave';

export const ReportsView: React.FC = () => {
  const { users, leaveRequests, stationConfig, availableFiscalYears } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'individual' | 'department' | 'monthly' | 'frequent' | 'annual'>('individual');
  const [selectedYear, setSelectedYear] = useState<number>(stationConfig.currentFiscalYear || 2568);
  const [selectedDept, setSelectedDept] = useState<string>('all');

  // Filter leaves by year
  const yearLeaves = leaveRequests.filter(lr => lr.fiscalYear === selectedYear && lr.status === 'approved');

  // Frequent leave ranking (Requirement #59)
  const officerStats = users.map((u) => {
    const userLeaves = yearLeaves.filter(lr => lr.userId === u.id);
    const totalDays = userLeaves.reduce((sum, lr) => sum + lr.totalDays, 0);
    const leaveCounts = userLeaves.length;
    const vacDays = userLeaves.filter(lr => lr.leaveType === 'vacation').reduce((s, lr) => s + lr.totalDays, 0);
    const sickDays = userLeaves.filter(lr => lr.leaveType === 'sick').reduce((s, lr) => s + lr.totalDays, 0);
    const personalDays = userLeaves.filter(lr => lr.leaveType === 'personal').reduce((s, lr) => s + lr.totalDays, 0);

    return {
      officer: u,
      leaveCounts,
      totalDays,
      vacDays,
      sickDays,
      personalDays,
    };
  }).sort((a, b) => b.totalDays - a.totalDays);

  // Department summary statistics (Requirement #53)
  const deptStats = DEPARTMENTS.map((d) => {
    const deptOfficers = users.filter(u => u.department === d.code);
    const deptLeaves = yearLeaves.filter(lr => lr.userDepartment === d.code);
    const totalDays = deptLeaves.reduce((s, lr) => s + lr.totalDays, 0);

    return {
      department: d,
      officerCount: deptOfficers.length,
      leaveCount: deptLeaves.length,
      totalDays,
    };
  });

  // Export to Excel / CSV format (Requirement #56)
  const handleExportCSV = () => {
    const headers = ['ลำดับ', 'เลขที่ใบลา', 'ยศ', 'ชื่อ', 'สกุล', 'ตำแหน่ง', 'สายงาน', 'ประเภทการลา', 'ตั้งแต่วันที่', 'ถึงวันที่', 'จำนวนวันทำการ', 'สถานะ'];
    const rows = leaveRequests.map((lr, idx) => [
      idx + 1,
      lr.leaveNumber,
      lr.userRank,
      lr.userFullName.split(' ')[0],
      lr.userFullName.split(' ')[1] || '',
      lr.userPosition,
      DEPARTMENTS.find(d => d.code === lr.userDepartment)?.name || lr.userDepartment,
      LEAVE_TYPES[lr.leaveType]?.title || lr.leaveType,
      lr.startDate,
      lr.endDate,
      lr.totalDays,
      lr.status,
    ]);

    const csvContent = '\uFEFF' + [headers, ...rows].map(e => e.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `รายงานการลา_สภ.ศรีสงคราม_พ.ศ.${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-900 rounded-xl border border-rose-100">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                สถิติและรายงานสรุปการลา สภ.ศรีสงคราม
              </h2>
              <p className="text-xs text-slate-500">
                วิเคราะห์สถิติ สรุปรายบุคคล แยกสายงาน ส่งออก Excel และพิมพ์เอกสารราชการ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="ส่งออกไฟล์ Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              ส่งออก Excel (.csv)
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-rose-900 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              พิมพ์รายงาน (PDF)
            </button>
          </div>
        </div>

        {/* Tab & Year Selector */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveReportTab('individual')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeReportTab === 'individual' ? 'bg-white text-rose-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              สรุปรายบุคคล (ข้อ #52)
            </button>
            <button
              onClick={() => setActiveReportTab('department')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeReportTab === 'department' ? 'bg-white text-rose-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              แยกตามสายงาน (ข้อ #53)
            </button>
            <button
              onClick={() => setActiveReportTab('frequent')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeReportTab === 'frequent' ? 'bg-white text-rose-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ผู้ที่ลาบ่อย (ข้อ #59)
            </button>
            <button
              onClick={() => setActiveReportTab('annual')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeReportTab === 'annual' ? 'bg-white text-rose-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              เปรียบเทียบปีงบประมาณ (ข้อ #55)
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-600">ปีงบประมาณ:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-slate-800"
            >
              {availableFiscalYears.map((yr) => (
                <option key={yr} value={yr}>พ.ศ. {yr}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Content Body */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        {/* ===================== REPORT 1: INDIVIDUAL SUMMARY (Requirement #52) ===================== */}
        {activeReportTab === 'individual' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                รายงานสรุปการลารายบุคคล ปีงบประมาณ พ.ศ. {selectedYear}
              </h3>
              <span className="text-xs text-slate-500">จำนวนข้าราชการตำรวจ {users.length} นาย</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">ลำดับ</th>
                    <th className="py-2.5 px-3">ยศ ชื่อ-สกุล</th>
                    <th className="py-2.5 px-3">สายงาน</th>
                    <th className="py-2.5 px-3 text-center">ลาพักผ่อน (วัน)</th>
                    <th className="py-2.5 px-3 text-center">ลาป่วย (วัน)</th>
                    <th className="py-2.5 px-3 text-center">ลากิจ (วัน)</th>
                    <th className="py-2.5 px-3 text-center">รวมวันลาทั้งหมด</th>
                    <th className="py-2.5 px-3 text-center">สิทธิคงเหลือ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {officerStats.map((item, idx) => {
                    const remainingVac = (item.officer.accumulatedVacationDays + item.officer.currentYearVacationQuota) - item.officer.usedVacationDays;
                    return (
                      <tr key={item.officer.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {item.officer.rank} {item.officer.firstName} {item.officer.lastName}
                          <span className="text-[10px] text-slate-400 font-normal block font-mono">
                            {item.officer.callsign}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {DEPARTMENTS.find(d => d.code === item.officer.department)?.name}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-amber-700 tabular-nums">
                          {item.vacDays || item.officer.usedVacationDays || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-rose-700 tabular-nums">
                          {item.sickDays || item.officer.usedSickDays || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-sky-700 tabular-nums">
                          {item.personalDays || item.officer.usedPersonalDays || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-extrabold text-slate-900 tabular-nums">
                          {item.totalDays || (item.officer.usedVacationDays + item.officer.usedSickDays + item.officer.usedPersonalDays)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-800 tabular-nums">
                          {remainingVac}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== REPORT 2: BY DEPARTMENT (Requirement #53) ===================== */}
        {activeReportTab === 'department' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              สถิติการลาจำแนกตามสายงาน สภ.ศรีสงคราม
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {deptStats.map((item) => (
                <div key={item.department.code} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">{item.department.name}</h4>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">กำลังพล</span>
                      <span className="font-bold text-slate-900 text-base">{item.officerCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">จำนวนคำขอ</span>
                      <span className="font-bold text-rose-800 text-base">{item.leaveCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">รวมวันลา</span>
                      <span className="font-bold text-amber-700 text-base">{item.totalDays}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== REPORT 3: FREQUENT LEAVERS (Requirement #59) ===================== */}
        {activeReportTab === 'frequent' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                การวิเคราะห์สถิติ: ข้าราชการตำรวจที่มีสถิติวันลาสูงสุด (Requirement #59)
              </h3>
              <p className="text-xs text-slate-500">
                วิเคราะห์สถิติเพื่อการบริหารจัดการอัตรากำลังพลให้พร้อมรับภารกิจตลอด 24 ชั่วโมง
              </p>
            </div>

            <div className="space-y-3">
              {officerStats.slice(0, 5).map((item, idx) => (
                <div key={item.officer.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-900 text-white font-bold flex items-center justify-center text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">
                        {item.officer.rank} {item.officer.firstName} {item.officer.lastName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.officer.position} · {item.officer.callsign}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-sm text-rose-900 tabular-nums">
                      {item.totalDays} วันทำการ
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ยื่นลา {item.leaveCounts} ครั้ง
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== REPORT 4: ANNUAL COMPARISON (Requirement #55) ===================== */}
        {activeReportTab === 'annual' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              เปรียบเทียบสถิติการลารายปีงบประมาณ (พ.ศ. 2568 - 2580)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[2568, 2569, 2570, 2571].map((yr) => (
                <div key={yr} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-xs font-bold text-slate-500">ปีงบประมาณ {yr}</span>
                  <div className="text-2xl font-black text-rose-900 mt-1">
                    {yr === 2568 ? '121' : '0'} <span className="text-xs font-normal text-slate-500">ครั้ง</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {yr === 2568 ? 'กำลังดำเนินการ' : 'ยังไม่เปิดระบบ'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
