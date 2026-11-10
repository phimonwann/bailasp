/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  FilePlus,
  Inbox,
  Users,
  Calendar,
  Grid3X3,
  BookOpen,
  BarChart3,
  History,
  ShieldCheck,
  Settings,
  Download,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export type ActiveTab = 
  | 'dashboard'
  | 'create_leave'
  | 'approvals'
  | 'personnel'
  | 'calendar'
  | 'schedule_board'
  | 'monthly_register'
  | 'reports'
  | 'history'
  | 'audit_logs'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { leaveRequests, stationConfig, currentUser } = useApp();
  const { isInstallable, install } = usePWAInstall();

  // Count pending approvals for current user role
  const pendingApprovalsCount = leaveRequests.filter(lr => 
    lr.status === 'pending_approval' || lr.status === 'pending_inspection'
  ).length;

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'create_leave' as ActiveTab,
      label: 'ยื่นใบลาออนไลน์',
      icon: FilePlus,
      badge: null,
    },
    {
      id: 'approvals' as ActiveTab,
      label: 'อนุมัติการลา',
      icon: Inbox,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'personnel' as ActiveTab,
      label: 'ข้อมูลบุคลากร',
      icon: Users,
      badge: null,
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'ปฏิทินการลา',
      icon: Calendar,
      badge: null,
    },
    {
      id: 'schedule_board' as ActiveTab,
      label: 'แผงการลาประจำเดือน',
      icon: Grid3X3,
      badge: null,
    },
    {
      id: 'monthly_register' as ActiveTab,
      label: 'ทะเบียนคุมการลา',
      icon: BookOpen,
      badge: null,
    },
    {
      id: 'reports' as ActiveTab,
      label: 'สถิติและรายงาน',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'history' as ActiveTab,
      label: 'ประวัติการลา',
      icon: History,
      badge: null,
    },
    {
      id: 'audit_logs' as ActiveTab,
      label: 'ประวัติการใช้งาน',
      icon: ShieldCheck,
      badge: null,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'ตั้งค่าระบบ',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar container with Maroon & Gold theme matching the mockup */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-20 h-screen w-64 bg-gradient-to-b from-[#5c0d12] via-[#6f1218] to-[#45070a] text-white flex flex-col justify-between border-r border-[#8d2028] shadow-2xl transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & Logo Area */}
        <div className="p-5 border-b border-white/10 flex flex-col items-center text-center">
          <div className="relative group mb-3">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full blur-xs opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <img
              src={stationConfig.logoUrl}
              alt="ตราโลโก้ตำรวจ สภ.ศรีสงคราม"
              className="relative w-16 h-18 object-contain drop-shadow-md rounded-md"
            />
          </div>
          <h2 className="text-base font-bold text-white tracking-wide">
            {stationConfig.stationName}
          </h2>
          <p className="text-[11px] font-medium text-amber-300/90 tracking-wider uppercase mt-0.5">
            {stationConfig.stationNameEn}
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 shadow-md font-bold'
                    : 'text-amber-100/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-amber-300'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-bold shadow-xs ${
                      item.badgeColor || 'bg-amber-400 text-slate-900'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section: PWA Install & Police Motto */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          {/* PWA Install Button if available */}
          {isInstallable && (
            <button
              onClick={install}
              className="w-full mb-3 flex items-center justify-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              ติดตั้งแอปลงโทรศัพท์ (PWA)
            </button>
          )}

          <div className="text-center px-2 py-1">
            <p className="text-xs italic text-amber-200/90 font-medium">
              “รับใช้ประชาชน ด้วยใจ จริงใจ และภักดี”
            </p>
            <p className="text-[10px] text-amber-300/60 mt-1">
              ปีงบประมาณ {stationConfig.currentFiscalYear} · สภ.ศรีสงคราม
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
