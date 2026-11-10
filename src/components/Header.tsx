/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  Clock, 
  Calendar as CalendarIcon, 
  LogOut, 
  Settings, 
  UserCheck, 
  Menu, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  User as UserIcon,
  Phone
} from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenLogin: () => void;
  onSelectLeave: (leaveId: string) => void;
  onToggleSidebarMobile: () => void;
  isSidebarOpenMobile: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenLogin,
  onSelectLeave,
  onToggleSidebarMobile,
  isSidebarOpenMobile,
}) => {
  const { 
    currentUser, 
    logout, 
    users, 
    switchUser, 
    stationConfig, 
    notifications, 
    unreadNotificationCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = useApp();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Live real-time clock updating every second (Requirement #10)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatThaiDate = (date: Date) => {
    const dayNames = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    const monthNames = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear() + 543;
    const time = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return {
      dateStr: `${day} ${month} ${year}`,
      dayStr: dayNames[date.getDay()],
      timeStr: `${time} น.`,
    };
  };

  const thaiTime = formatThaiDate(currentTime);

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'superintendent': return 'ผู้กำกับ';
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'approver': return 'ผู้อนุมัติ';
      case 'inspector': return 'ผู้ตรวจสอบ';
      case 'supervisor': return 'หัวหน้างาน';
      case 'officer': return 'บุคลากร';
      default: return 'ผู้ใช้ทั่วไป';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner with station branding & real-time badge */}
      <div className="bg-gradient-to-r from-[#691118] via-[#7d1720] to-[#580c10] text-white px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebarMobile}
            className="md:hidden p-1.5 rounded-lg bg-black/20 text-white hover:bg-black/30 transition-colors"
            title="เปิดเมนู"
          >
            {isSidebarOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-2">
            <img 
              src={stationConfig.logoUrl} 
              alt="ตราสัญลักษณ์ สภ.ศรีสงคราม" 
              className="w-8 h-9 object-contain drop-shadow"
            />
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-wide leading-tight">
                ระบบบริหารจัดการการลา {stationConfig.stationName}
              </h1>
              <p className="text-xs text-amber-200/90 hidden sm:block">
                โปร่งใส ทันสมัย บริการด้วยใจ · {stationConfig.province} ({stationConfig.region})
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Clock Badge (Requirement #10) */}
        <div className="flex items-center gap-2 bg-black/25 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10 text-xs sm:text-sm">
          <CalendarIcon className="w-4 h-4 text-amber-300" />
          <span className="font-semibold">{thaiTime.dateStr}</span>
          <span className="text-amber-300/80">|</span>
          <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="font-mono font-bold tracking-wider text-amber-100">{thaiTime.timeStr}</span>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="px-4 py-2 sm:px-6 flex items-center justify-between gap-4">
        {/* Station Contact info display */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-rose-800" />
            <span>โทร: <strong className="text-slate-800 font-semibold">{stationConfig.stationPhone}</strong></span>
          </span>
          <span className="text-slate-300">|</span>
          <span>ปีงบประมาณ: <strong className="text-rose-900 font-bold">{stationConfig.currentFiscalYear}</strong></span>
          <span className="text-slate-300">|</span>
          <span>ผกก.: <strong className="text-slate-800 font-semibold">{stationConfig.superintendentRank} {stationConfig.superintendentName}</strong></span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Notification Bell (Requirement #17: คลิกดูการแจ้งเตือนได้) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-lg text-slate-600 hover:text-rose-900 hover:bg-rose-50 transition-colors cursor-pointer"
              title="การแจ้งเตือน"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full animate-bounce">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-rose-800" />
                    <span className="font-bold text-sm text-slate-800">การแจ้งเตือนระบบ</span>
                    {unreadNotificationCount > 0 && (
                      <span className="px-1.5 py-0.5 text-xs bg-rose-100 text-rose-800 rounded font-semibold">
                        ใหม่ {unreadNotificationCount}
                      </span>
                    )}
                  </div>
                  {unreadNotificationCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-rose-700 hover:text-rose-900 font-medium cursor-pointer"
                    >
                      อ่านทั้งหมด
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">
                      ไม่มีการแจ้งเตือนในขณะนี้
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.leaveRequestId) {
                            onSelectLeave(n.leaveRequestId);
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-3 text-xs hover:bg-rose-50/50 cursor-pointer transition-colors flex items-start gap-2.5 ${
                          !n.read ? 'bg-amber-50/40 font-semibold' : ''
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {n.type === 'approved' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          {n.type === 'rejected' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
                          {n.type === 'leave_submitted' && <FileText className="w-4 h-4 text-sky-600" />}
                          {n.type === 'cancelled' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                          {n.type === 'system' && <Clock className="w-4 h-4 text-purple-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-800 font-bold leading-snug">{n.title}</p>
                          <p className="text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(n.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                          </p>
                        </div>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 mt-1" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile & fast switch menu */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#721319] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {currentUser.rank}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                    {currentUser.rank} {currentUser.firstName} {currentUser.lastName}
                  </div>
                  <div className="text-[10px] text-rose-800 font-medium">
                    {getRoleLabel(currentUser.role)} · {currentUser.callsign}
                  </div>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 divide-y divide-slate-100">
                  <div className="p-3">
                    <p className="text-xs text-slate-400">เข้าใช้งานในชื่อ</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {currentUser.rank} {currentUser.firstName} {currentUser.lastName}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{currentUser.position}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[11px] font-bold rounded">
                        {getRoleLabel(currentUser.role)}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] rounded font-mono">
                        {currentUser.callsign}
                      </span>
                    </div>
                  </div>

                  {/* Switch user shortcut for testing all 6 roles easily */}
                  <div className="py-2">
                    <p className="text-[11px] font-bold text-slate-500 px-3 mb-1.5 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-rose-700" /> สลับผู้ใช้งานทดสอบสิทธิ์
                    </p>
                    <div className="space-y-0.5 max-h-48 overflow-y-auto">
                      {users.slice(0, 6).map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setShowUserMenu(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            u.id === currentUser.id ? 'bg-rose-50 text-rose-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="truncate">{u.rank} {u.firstName} ({u.callsign})</span>
                          <span className="text-[10px] text-slate-500 shrink-0">{getRoleLabel(u.role)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenSettings();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 font-medium"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      ตั้งค่าระบบ
                    </button>
                    {/* Logout Button (Requirement #11) */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-bold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-700" />
                      ออกจากระบบ (Logout)
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 bg-[#721319] hover:bg-[#580c10] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <UserIcon className="w-4 h-4" />
              เข้าสู่ระบบ
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
