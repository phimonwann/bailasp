/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  UserPlus,
  Trash2,
  Edit,
  Key,
  Unlock,
  Eye,
  EyeOff,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Phone,
  X,
  Lock,
} from 'lucide-react';
import { User, UserRole, DepartmentCode, DEPARTMENTS, SUB_DEPARTMENTS } from '../types/leave';

export const PersonnelManagement: React.FC = () => {
  const { 
    users, 
    addPersonnel, 
    updatePersonnel, 
    deletePersonnel, 
    adminResetPassword, 
    adminUnlockAccount, 
    currentUser 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  
  // Show/Hide passwords toggle for Admin (Requirement #7)
  const [showPasswords, setShowPasswords] = useState(false);

  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<User>>({
    rank: 'ส.ต.ท.',
    firstName: '',
    lastName: '',
    callsign: 'ศรีสงคราม ',
    username: '',
    passwordHash: '',
    position: 'ผบ.หมู่งานป้องกันปราบปราม',
    department: 'suppression',
    subDepartmentId: '2.4',
    role: 'officer',
    phone: '081-000-0000',
    address: 'สภ.ศรีสงคราม จ.นครพนม',
    accumulatedVacationDays: 10,
    currentYearVacationQuota: 10,
    usedVacationDays: 0,
    usedSickDays: 0,
    usedPersonalDays: 0,
  });

  // Success/Info banner
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Filter officers
  const filteredOfficers = users.filter((u) => {
    if (deptFilter !== 'all' && u.department !== deptFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = `${u.firstName} ${u.lastName}`.toLowerCase().includes(q);
      const matchCall = u.callsign.toLowerCase().includes(q);
      const matchUser = u.username.toLowerCase().includes(q);
      const matchRank = u.rank.toLowerCase().includes(q);
      if (!matchName && !matchCall && !matchUser && !matchRank) return false;
    }
    return true;
  });

  const openAddModal = () => {
    setEditingUserId(null);
    setFormData({
      rank: 'ส.ต.ท.',
      firstName: '',
      lastName: '',
      callsign: 'ศรีสงคราม 50',
      username: 'SSK50',
      passwordHash: 'SSK50',
      position: 'ผบ.หมู่งานป้องกันปราบปราม',
      department: 'suppression',
      subDepartmentId: '2.4',
      role: 'officer',
      phone: '081-000-0000',
      address: 'ต.ศรีสงคราม อ.ศรีสงคราม จ.นครพนม',
      accumulatedVacationDays: 10,
      currentYearVacationQuota: 10,
      usedVacationDays: 0,
      usedSickDays: 0,
      usedPersonalDays: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (officer: User) => {
    setEditingUserId(officer.id);
    setFormData({ ...officer });
    setIsModalOpen(true);
  };

  const handleDelete = (officer: User) => {
    if (officer.id === currentUser?.id) {
      alert('ไม่สามารถลบบัญชีที่กำลังล็อกอินอยู่ได้');
      return;
    }
    if (window.confirm(`ยืนยันการลบข้าราชการตำรวจ ${officer.rank} ${officer.firstName} ${officer.lastName} (${officer.callsign})?`)) {
      deletePersonnel(officer.id);
      setInfoMessage(`ลบข้อมูล ${officer.rank} ${officer.firstName} ${officer.lastName} สำเร็จ`);
      setTimeout(() => setInfoMessage(null), 3000);
    }
  };

  const handleResetPassword = (officer: User) => {
    const newPass = adminResetPassword(officer.id);
    setInfoMessage(`รีเซ็ตรหัสผ่านของ ${officer.rank} ${officer.firstName} สำเร็จ เป็น: ${newPass}`);
    setTimeout(() => setInfoMessage(null), 5000);
  };

  const handleUnlock = (officer: User) => {
    adminUnlockAccount(officer.id);
    setInfoMessage(`ปลดล็อกบัญชีของ ${officer.rank} ${officer.firstName} เรียบร้อยแล้ว`);
    setTimeout(() => setInfoMessage(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.callsign) {
      alert('กรุณากรอกชื่อ สกุล และนามเรียกขานให้ครบถ้วน');
      return;
    }

    // Default username/password to callsign if not specified (Requirement #6)
    const normalizedUsername = formData.username?.trim() || formData.callsign.replace(/\s+/g, '');
    const normalizedPassword = formData.passwordHash?.trim() || normalizedUsername;

    if (editingUserId) {
      const existing = users.find(u => u.id === editingUserId);
      if (existing) {
        updatePersonnel({
          ...existing,
          ...formData as User,
          username: normalizedUsername,
          passwordHash: normalizedPassword,
        });
        setInfoMessage('แก้ไขข้อมูลบุคลากรเรียบร้อย');
      }
    } else {
      addPersonnel({
        badgeNumber: formData.badgeNumber || String(Math.floor(100000 + Math.random() * 900000)),
        callsign: formData.callsign,
        username: normalizedUsername,
        passwordHash: normalizedPassword,
        rank: formData.rank || 'ส.ต.ท.',
        firstName: formData.firstName,
        lastName: formData.lastName,
        position: formData.position || 'ผบ.หมู่',
        department: (formData.department as DepartmentCode) || 'suppression',
        subDepartmentId: formData.subDepartmentId || '2.4',
        role: (formData.role as UserRole) || 'officer',
        phone: formData.phone || '',
        address: formData.address || '',
        accumulatedVacationDays: formData.accumulatedVacationDays || 10,
        currentYearVacationQuota: formData.currentYearVacationQuota || 10,
        usedVacationDays: 0,
        usedSickDays: 0,
        usedPersonalDays: 0,
      });
      setInfoMessage('เพิ่มบุคลากรใหม่เรียบร้อย (ชื่อผู้ใช้และรหัสผ่านเริ่มต้นคือนามเรียกขาน)');
    }

    setIsModalOpen(false);
    setTimeout(() => setInfoMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-900 rounded-xl border border-rose-100">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                ระบบจัดการข้อมูลบุคลากร สภ.ศรีสงคราม
              </h2>
              <p className="text-xs text-slate-500">
                เพิ่ม-ลบ-แก้ไขข้อมูลข้าราชการตำรวจ กำหนดสายงานย่อย และจัดการรหัสผ่านผู้ใช้งาน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Show/Hide password toggle (Requirement #7: แอดมินสามารถดูชื่อผู้ใช้ และรหัสผ่านได้) */}
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                showPasswords
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="แอดมินสามารถดูชื่อผู้ใช้และรหัสผ่านตามข้อกำหนด 7"
            >
              {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPasswords ? 'ซ่อนรหัสผ่าน' : 'แสดงชื่อผู้ใช้/รหัสผ่าน (แอดมิน)'}
            </button>

            {/* Add officer button (Requirement #2) */}
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              + เพิ่มบุคลากร
            </button>
          </div>
        </div>

        {/* Info Banner */}
        {infoMessage && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อ, สกุล, ยศ, นามเรียกขาน (เช่น ศรีสงคราม 503 หรือ SSK503)..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-rose-800"
            />
          </div>

          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="all">ทุกสายงาน ({users.length} นาย)</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Officers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
              <tr>
                <th className="py-3 px-3 w-10 text-center">ลำดับ</th>
                <th className="py-3 px-3">ยศ ชื่อ-สกุล</th>
                <th className="py-3 px-3">นามเรียกขาน</th>
                <th className="py-3 px-3">สายงาน / สายงานย่อย</th>
                <th className="py-3 px-3">ตำแหน่ง</th>
                <th className="py-3 px-3">สิทธิ์</th>
                {showPasswords && (
                  <th className="py-3 px-3 bg-amber-50 text-amber-900">
                    ชื่อผู้ใช้ / รหัสผ่าน (Admin View)
                  </th>
                )}
                <th className="py-3 px-3 text-center">วันลาคงเหลือ</th>
                <th className="py-3 px-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOfficers.map((officer, idx) => {
                const subDept = SUB_DEPARTMENTS.find(s => s.id === officer.subDepartmentId);
                const remainingVac = (officer.accumulatedVacationDays + officer.currentYearVacationQuota) - officer.usedVacationDays;

                return (
                  <tr key={officer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">
                        {officer.rank} {officer.firstName} {officer.lastName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{officer.phone || '-'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-rose-900 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px]">
                        {officer.callsign}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">
                        {DEPARTMENTS.find(d => d.code === officer.department)?.name || officer.department}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {subDept?.name || '-'}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-700">
                      {officer.position}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        officer.role === 'admin' 
                          ? 'bg-rose-100 text-rose-800' 
                          : officer.role === 'superintendent' 
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {officer.role}
                      </span>
                    </td>

                    {/* Admin Credential View (Requirement #7) */}
                    {showPasswords && (
                      <td className="py-3 px-3 bg-amber-50/50">
                        <div className="font-mono text-xs">
                          <span className="text-slate-500">User:</span> <strong className="text-slate-800">{officer.username}</strong>
                        </div>
                        <div className="font-mono text-xs">
                          <span className="text-slate-500">Pass:</span> <strong className="text-amber-800">{officer.passwordHash}</strong>
                        </div>
                      </td>
                    )}

                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-slate-800 tabular-nums">{remainingVac}</span>
                      <span className="text-[10px] text-slate-400 block">วันทำการ</span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Unlock button if locked */}
                        {officer.isLocked && (
                          <button
                            onClick={() => handleUnlock(officer)}
                            className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg"
                            title="ปลดล็อกบัญชี"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Reset password button */}
                        <button
                          onClick={() => handleResetPassword(officer)}
                          className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="รีเซ็ตรหัสผ่านเป็นนามเรียกขาน"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit button */}
                        <button
                          onClick={() => openEditModal(officer)}
                          className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete button (Requirement #2) */}
                        <button
                          onClick={() => handleDelete(officer)}
                          className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="ลบบุคลากร"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Officer Modal with all 6 Divisions and Sub-divisions as per Requirement #21 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-gradient-to-r from-[#691118] to-[#8d1822] text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-300" />
                {editingUserId ? 'แก้ไขข้อมูลข้าราชการตำรวจ' : 'เพิ่มบุคลากรใหม่ สภ.ศรีสงคราม'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Row 1: Rank, First Name, Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ยศ</label>
                  <select
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  >
                    <option value="พ.ต.อ.">พ.ต.อ.</option>
                    <option value="พ.ต.ท.">พ.ต.ท.</option>
                    <option value="พ.ต.ต.">พ.ต.ต.</option>
                    <option value="ร.ต.อ.">ร.ต.อ.</option>
                    <option value="ร.ต.ท.">ร.ต.ท.</option>
                    <option value="ร.ต.ต.">ร.ต.ต.</option>
                    <option value="ด.ต.">ด.ต.</option>
                    <option value="จ.ส.ต.">จ.ส.ต.</option>
                    <option value="ส.ต.อ.">ส.ต.อ.</option>
                    <option value="ส.ต.ท.">ส.ต.ท.</option>
                    <option value="ส.ต.ต.">ส.ต.ต.</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่อ</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">นามสกุล</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  />
                </div>
              </div>

              {/* Row 2: Callsign (Requirement #6), Username, Password */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-rose-50/40 p-3 rounded-xl border border-rose-100">
                <div>
                  <label className="block font-bold text-rose-950 mb-1">
                    นามเรียกขาน (เช่น ศรีสงคราม 503)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.callsign}
                    onChange={(e) => {
                      const call = e.target.value;
                      const userCode = call.replace(/\s+/g, '').replace('ศรีสงคราม', 'SSK');
                      setFormData({ 
                        ...formData, 
                        callsign: call,
                        username: formData.username || userCode,
                        passwordHash: formData.passwordHash || userCode,
                      });
                    }}
                    placeholder="ศรีสงคราม 503"
                    className="w-full bg-white border border-rose-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ชื่อผู้ใช้เข้าระบบ (Username)
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="SSK503"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    รหัสผ่าน (Password)
                  </label>
                  <input
                    type="text"
                    value={formData.passwordHash}
                    onChange={(e) => setFormData({ ...formData, passwordHash: e.target.value })}
                    placeholder="SSK503"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-amber-800"
                  />
                </div>
              </div>

              {/* Row 3: Department & Sub-department (Requirement #21) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    สายงานหลัก (6 สายงานตามข้อกำหนด #21)
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => {
                      const dept = e.target.value as DepartmentCode;
                      const firstSub = SUB_DEPARTMENTS.find(s => s.deptCode === dept);
                      setFormData({
                        ...formData,
                        department: dept,
                        subDepartmentId: firstSub?.id || '',
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    สายงานย่อย (เช่น รอง ผกก.ป., สวป., สิบเวร, ธุรการ ฯลฯ)
                  </label>
                  <select
                    value={formData.subDepartmentId}
                    onChange={(e) => setFormData({ ...formData, subDepartmentId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold"
                  >
                    {SUB_DEPARTMENTS.filter(s => s.deptCode === formData.department).map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Position and System Role (Requirement #32) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ตำแหน่ง</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="เช่น ผบ.หมู่งานป้องกันปราบปราม"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    สิทธิ์การใช้งาน (6 ระดับตามข้อกำหนด 2.1 & 32)
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  >
                    <option value="officer">👮 บุคลากร (ยื่นลา ดูประวัติ)</option>
                    <option value="supervisor">👮 หัวหน้างาน (ตรวจสอบการลา)</option>
                    <option value="inspector">📋 ผู้ตรวจสอบ (ตรวจเอกสาร)</option>
                    <option value="approver">✍️ ผู้อนุมัติ (อนุมัติ/ไม่อนุมัติ)</option>
                    <option value="admin">⚙️ Admin (จัดการบุคลากร/ระบบ)</option>
                    <option value="superintendent">⭐ ผู้กำกับ (ภาพรวม/อนุมัติ/พิมพ์)</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Phone and Vacation Quota */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="081-234-5678"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">วันลาพักผ่อนสะสม (วัน)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.accumulatedVacationDays}
                    onChange={(e) => setFormData({ ...formData, accumulatedVacationDays: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">สิทธิลาพักผ่อนปีนี้ (วัน)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.currentYearVacationQuota}
                    onChange={(e) => setFormData({ ...formData, currentYearVacationQuota: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-900 hover:bg-rose-800 text-white rounded-xl font-bold shadow-xs"
                >
                  บันทึกข้อมูลบุคลากร
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
