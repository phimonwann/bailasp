/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  Eye,
} from 'lucide-react';
import { DEPARTMENTS, DepartmentCode, LEAVE_TYPES } from '../types/leave';

interface CalendarViewProps {
  onSelectLeave: (leaveId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onSelectLeave }) => {
  const { leaveRequests, holidays, stationConfig, availableFiscalYears } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Days array with leading empty slots for day-of-week alignment
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const getLeavesForDate = (day: number) => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const targetDate = `${year}-${monthStr}-${dayStr}`;

    return leaveRequests.filter((lr) => {
      if (selectedDept !== 'all' && lr.userDepartment !== selectedDept) return false;
      if (lr.status === 'cancelled' || lr.status === 'rejected') return false;
      return targetDate >= lr.startDate && targetDate <= lr.endDate;
    });
  };

  const getHolidayForDate = (day: number) => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const targetDate = `${year}-${monthStr}-${dayStr}`;
    return holidays.find(h => h.date === targetDate);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-900 rounded-xl border border-rose-100">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                ปฏิทินวันลาและวันหยุดราชการ สภ.ศรีสงคราม
              </h2>
              <p className="text-xs text-slate-500">
                แสดงภาพรวมการลาประจำเดือน แยกตามสายงานและไฮไลต์วันหยุดราชการ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Dept Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="all">ทุกสายงาน</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>

            {/* Month Nav */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={prevMonth}
                className="p-1 rounded-lg hover:bg-white text-slate-700 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-bold text-xs text-slate-800 px-3 min-w-[130px] text-center">
                {thaiMonths[month]} {year + 543}
              </span>
              <button
                onClick={nextMonth}
                className="p-1 rounded-lg hover:bg-white text-slate-700 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200 text-center font-bold text-xs py-2.5 bg-slate-50 text-slate-700">
          <div className="text-rose-600">อาทิตย์</div>
          <div>จันทร์</div>
          <div>อังคาร</div>
          <div>พุธ</div>
          <div>พฤหัสบดี</div>
          <div>ศุกร์</div>
          <div className="text-rose-600">เสาร์</div>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[500px]">
          {calendarCells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="bg-slate-50/40 p-2 min-h-[90px]" />;
            }

            const dayLeaves = getLeavesForDate(day);
            const holiday = getHolidayForDate(day);
            const isWeekend = (idx % 7 === 0) || (idx % 7 === 6);
            const isToday = 
              new Date().getDate() === day &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            return (
              <div
                key={`day-${day}`}
                className={`p-2 min-h-[100px] flex flex-col justify-between transition-colors ${
                  isWeekend ? 'bg-rose-50/20' : 'bg-white'
                } ${isToday ? 'ring-2 ring-rose-800 ring-inset' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday 
                          ? 'bg-rose-900 text-white shadow-xs' 
                          : isWeekend || holiday 
                          ? 'text-rose-600 font-extrabold' 
                          : 'text-slate-800'
                      }`}
                    >
                      {day}
                    </span>

                    {dayLeaves.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-full">
                        {dayLeaves.length}
                      </span>
                    )}
                  </div>

                  {/* Holiday note */}
                  {holiday && (
                    <div className="mt-1 text-[10px] bg-rose-100 text-rose-800 p-1 rounded font-bold leading-tight">
                      {holiday.name}
                    </div>
                  )}

                  {/* Leaves in this date */}
                  <div className="mt-1 space-y-1">
                    {dayLeaves.slice(0, 3).map((lr) => {
                      const typeInfo = LEAVE_TYPES[lr.leaveType];
                      return (
                        <div
                          key={lr.id}
                          onClick={() => onSelectLeave(lr.id)}
                          className={`text-[10px] p-1 rounded font-semibold truncate cursor-pointer transition-transform hover:scale-[1.02] border ${typeInfo.badgeBg}`}
                          title={`${lr.userRank} ${lr.userFullName}: ${typeInfo.title}`}
                        >
                          <span className="mr-0.5">{typeInfo.emoji}</span>
                          <span>{lr.userRank} {lr.userFullName.split(' ')[0]}</span>
                        </div>
                      );
                    })}
                    {dayLeaves.length > 3 && (
                      <div className="text-[9px] text-slate-400 font-bold pl-1">
                        + อีก {dayLeaves.length - 3} นาย
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
