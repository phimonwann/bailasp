/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, BookOpen, Download, Calendar, Filter } from 'lucide-react';
import { LEAVE_TYPES, DEPARTMENTS } from '../types/leave';

export const MonthlyRegisterPrint: React.FC = () => {
  const { leaveRequests, stationConfig, availableFiscalYears } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(stationConfig.currentFiscalYear || 2568);
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const gregorianYear = selectedYear - 543;
  const monthPadded = String(selectedMonth + 1).padStart(2, '0');

  // Filter leaves that occur in this month
  const monthlyLeaves = leaveRequests.filter((lr) => {
    if (selectedDept !== 'all' && lr.userDepartment !== selectedDept) {
      return false;
    }
    // Check if start date or end date matches selected year/month
    const startMatches = lr.startDate.startsWith(`${gregorianYear}-${monthPadded}`);
    const endMatches = lr.endDate.startsWith(`${gregorianYear}-${monthPadded}`);
    return (startMatches || endMatches || lr.fiscalYear === selectedYear);
  });

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
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                ทะเบียนคุมการลารายเดือน (Monthly Leave Register)
              </h2>
              <p className="text-xs text-slate-500">
                จัดทำและพิมพ์เอกสารราชการเสนอผู้กำกับการสถานีตำรวจภูธรศรีสงคราม เพื่อลงนามและเก็บเป็นหลักฐาน
              </p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            พิมพ์ทะเบียนคุมเสนอ ผกก. (A4)
          </button>
        </div>

        {/* Filter bar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="all">ทุกสายงาน</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Official Printable Register Document */}
      <div className="print-container bg-white border border-slate-300 p-8 sm:p-12 shadow-sm rounded-2xl text-slate-900 font-serif leading-relaxed select-text">
        {/* Document Header */}
        <div className="text-center space-y-1 mb-6 border-b border-slate-800 pb-4">
          <div className="text-xl sm:text-2xl font-bold tracking-wide">
            ทะเบียนคุมการลาข้าราชการตำรวจ {stationConfig.stationName}
          </div>
          <div className="text-sm font-bold text-slate-700">
            ประจำเดือน {thaiMonths[selectedMonth]} ปีงบประมาณ พ.ศ. {selectedYear}
          </div>
          <div className="text-xs text-slate-500">
            {stationConfig.province} กองบังคับการตำรวจภูธรจังหวัดนครพนม {stationConfig.region}
          </div>
        </div>

        {/* Proposals statement */}
        <div className="mb-4 text-xs font-semibold text-slate-700">
          เรียน ผู้กำกับการ{stationConfig.stationName}
          <div className="indent-6 font-normal mt-0.5">
            ตามระเบียบสำนักนายกรัฐมนตรีว่าด้วยการลาของข้าราชการ พ.ศ. ๒๕๕๕ ขอรายงานสรุปทะเบียนคุมการลาของข้าราชการตำรวจในสังกัด ดังมีรายละเอียดปรากฏตามตารางด้านล่างนี้:
          </div>
        </div>

        {/* Register Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse border border-slate-800 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold">
                <th className="border border-slate-800 p-2 w-10">ลำดับ</th>
                <th className="border border-slate-800 p-2 w-24">เลขที่ใบลา</th>
                <th className="border border-slate-800 p-2 text-left">ยศ ชื่อ-สกุล</th>
                <th className="border border-slate-800 p-2 text-left">ตำแหน่ง</th>
                <th className="border border-slate-800 p-2">ประเภทการลา</th>
                <th className="border border-slate-800 p-2">ช่วงวันที่ลา</th>
                <th className="border border-slate-800 p-2 w-16">วันลา (วัน)</th>
                <th className="border border-slate-800 p-2 w-20">คำสั่ง</th>
                <th className="border border-slate-800 p-2 w-28">ผู้อนุมัติ</th>
              </tr>
            </thead>
            <tbody>
              {monthlyLeaves.length === 0 ? (
                <tr>
                  <td colSpan={9} className="border border-slate-800 p-4 text-center text-slate-400">
                    ไม่มีรายการการลาในเดือนที่เลือก
                  </td>
                </tr>
              ) : (
                monthlyLeaves.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="border border-slate-800 p-1.5 font-bold">{idx + 1}</td>
                    <td className="border border-slate-800 p-1.5 font-mono">{item.leaveNumber}</td>
                    <td className="border border-slate-800 p-1.5 text-left font-bold">
                      {item.userRank} {item.userFullName}
                    </td>
                    <td className="border border-slate-800 p-1.5 text-left text-[11px]">
                      {item.userPosition}
                    </td>
                    <td className="border border-slate-800 p-1.5">
                      {LEAVE_TYPES[item.leaveType]?.title}
                    </td>
                    <td className="border border-slate-800 p-1.5 text-[11px] whitespace-nowrap">
                      {item.startDate} ถึง {item.endDate}
                    </td>
                    <td className="border border-slate-800 p-1.5 font-bold tabular-nums">
                      {item.totalDays}
                    </td>
                    <td className="border border-slate-800 p-1.5 font-semibold">
                      {item.status === 'approved' ? 'อนุญาต' : item.status === 'rejected' ? 'ไม่อนุมัติ' : item.status === 'cancelled' ? 'ยกเลิก' : 'รอคำสั่ง'}
                    </td>
                    <td className="border border-slate-800 p-1.5 text-[11px]">
                      {item.approverName || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary counts */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs flex flex-wrap items-center justify-between gap-4">
          <div className="font-bold">
            สรุปยอดรวม: จำนวน {monthlyLeaves.length} คำขอ
          </div>
          <div className="flex items-center gap-4 text-slate-700">
            <span>ลาพักผ่อน: <strong>{monthlyLeaves.filter(l => l.leaveType === 'vacation').length}</strong> ครั้ง</span>
            <span>ลาป่วย: <strong>{monthlyLeaves.filter(l => l.leaveType === 'sick').length}</strong> ครั้ง</span>
            <span>ลากิจส่วนตัว: <strong>{monthlyLeaves.filter(l => l.leaveType === 'personal').length}</strong> ครั้ง</span>
            <span>อื่น ๆ: <strong>{monthlyLeaves.filter(l => l.leaveType !== 'vacation' && l.leaveType !== 'sick' && l.leaveType !== 'personal').length}</strong> ครั้ง</span>
          </div>
        </div>

        {/* Formal Signatures for Superintendent Proposal */}
        <div className="mt-10 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-1">
            <div>ผู้จัดทำ / ผู้ตรวจทะเบียนคุม</div>
            <div className="pt-8 font-bold">(ลงชื่อ) {stationConfig.inspectorRank}....................................................</div>
            <div className="font-bold text-slate-800">
              ( {stationConfig.inspectorName} )
            </div>
            <div>สารวัตรอำนวยการ{stationConfig.stationName}</div>
            <div>วันที่ .......... เดือน .................... พ.ศ. ...........</div>
          </div>

          <div className="space-y-1">
            <div>ทราบ / ตรวจรับรองความถูกต้อง</div>
            <div className="pt-8 font-bold">(ลงชื่อ) {stationConfig.superintendentRank}....................................................</div>
            <div className="font-bold text-slate-900">
              ( {stationConfig.superintendentName} )
            </div>
            <div>ผู้กำกับการ{stationConfig.stationName}</div>
            <div>วันที่ .......... เดือน .................... พ.ศ. ...........</div>
          </div>
        </div>
      </div>
    </div>
  );
};
