/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LeaveFormModal } from './components/LeaveFormModal';
import { ApprovalInbox } from './components/ApprovalInbox';
import { LeaveDetailModal } from './components/LeaveDetailModal';
import { LeaveScheduleBoard } from './components/LeaveScheduleBoard';
import { MonthlyRegisterPrint } from './components/MonthlyRegisterPrint';
import { PersonnelManagement } from './components/PersonnelManagement';
import { CalendarView } from './components/CalendarView';
import { ReportsView } from './components/ReportsView';
import { LeaveHistoryView } from './components/LeaveHistoryView';
import { AuditLogView } from './components/AuditLogView';
import { SettingsModal } from './components/SettingsModal';
import { LoginModal } from './components/LoginModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';

const AppContent: React.FC = () => {
  const { currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);
  
  // Modals state
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false);

  // Mobile sidebar state
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row antialiased text-slate-800">
      {/* Sidebar (Responsive desktop sticky, mobile drawer) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'create_leave') {
            setIsLeaveModalOpen(true);
          } else if (tab === 'settings') {
            setIsSettingsModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onSelectLeave={(id) => setSelectedLeaveId(id)}
          onToggleSidebarMobile={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
          isSidebarOpenMobile={isSidebarOpenMobile}
        />

        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'dashboard' && (
              <Dashboard
                onSelectLeave={(id) => setSelectedLeaveId(id)}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenCreateLeave={() => setIsLeaveModalOpen(true)}
              />
            )}

            {activeTab === 'approvals' && (
              <ApprovalInbox
                onSelectLeave={(id) => setSelectedLeaveId(id)}
              />
            )}

            {activeTab === 'personnel' && (
              <PersonnelManagement />
            )}

            {activeTab === 'calendar' && (
              <CalendarView
                onSelectLeave={(id) => setSelectedLeaveId(id)}
              />
            )}

            {activeTab === 'schedule_board' && (
              <LeaveScheduleBoard />
            )}

            {activeTab === 'monthly_register' && (
              <MonthlyRegisterPrint />
            )}

            {activeTab === 'reports' && (
              <ReportsView />
            )}

            {activeTab === 'history' && (
              <LeaveHistoryView
                onSelectLeave={(id) => setSelectedLeaveId(id)}
              />
            )}

            {activeTab === 'audit_logs' && (
              <AuditLogView />
            )}
          </div>
        </main>
      </div>

      {/* Leave Application Modal */}
      <LeaveFormModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSuccess={(newId) => {
          setSelectedLeaveId(newId);
          setActiveTab('dashboard');
        }}
      />

      {/* Leave Detail & Official Print View Modal */}
      <LeaveDetailModal
        leaveId={selectedLeaveId}
        onClose={() => setSelectedLeaveId(null)}
      />

      {/* Settings Modal (Requirement #18, #3, #4, #41, #61) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Login Modal (Requirement #1, #6, #35) */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onRequirePasswordChange={() => setIsPasswordChangeModalOpen(true)}
      />

      {/* Change Password Modal (Requirement #30) */}
      <ChangePasswordModal
        isOpen={isPasswordChangeModalOpen}
        onClose={() => setIsPasswordChangeModalOpen(false)}
        isFirstLogin={currentUser?.isFirstLogin}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
