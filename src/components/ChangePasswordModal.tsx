/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Key, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstLogin?: boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  isFirstLogin = false,
}) => {
  const { currentUser, changePassword } = useApp();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 4) {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('รหัสผ่านยืนยันไม่ตรงกัน');
      return;
    }

    changePassword(newPassword);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-[#691118] to-[#8d1822] text-white p-4 text-center">
          <Key className="w-8 h-8 mx-auto text-amber-300 mb-1" />
          <h3 className="font-bold text-sm">
            {isFirstLogin ? 'ตั้งรหัสผ่านใหม่สำหรับการเข้าใช้งานครั้งแรก' : 'เปลี่ยนรหัสผ่านส่วนตัว'}
          </h3>
          <p className="text-[11px] text-amber-200/90 mt-0.5">
            {currentUser?.rank} {currentUser?.firstName} {currentUser?.lastName} ({currentUser?.callsign})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg">
              {errorMsg}
            </div>
          )}

          {success && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              เปลี่ยนรหัสผ่านสำเร็จแล้ว
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">รหัสผ่านใหม่</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านใหม่..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            {/* If first login, Requirement #30 specifies: "เข้าระบบครั้งแรกต้องเปลี่ยนรหัสผ่านหรือไม่เปลี่ยนก็ได้" */}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100 font-medium"
            >
              {isFirstLogin ? 'ข้าม (ใช้รหัสเดิม)' : 'ยกเลิก'}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-rose-900 hover:bg-rose-800 text-white font-bold rounded-lg shadow-xs"
            >
              บันทึกรหัสผ่านใหม่
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
