/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Lock,
  User,
  Shield,
  Key,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequirePasswordChange: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onRequirePasswordChange,
}) => {
  const { login, stationConfig, users } = useApp();

  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!credential.trim() || !password.trim()) {
      setErrorMsg('กรุณากรอกนามเรียกขาน/ชื่อผู้ใช้ และรหัสผ่าน');
      return;
    }

    const res = login(credential.trim(), password.trim());
    if (res.success) {
      if (res.requirePasswordChange) {
        onRequirePasswordChange();
      }
      onClose();
    } else {
      setErrorMsg(res.message || 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง');
    }
  };

  const handleQuickLogin = (cred: string, pass: string) => {
    setCredential(cred);
    setPassword(pass);
    const res = login(cred, pass);
    if (res.success) {
      if (res.requirePasswordChange) {
        onRequirePasswordChange();
      }
      onClose();
    } else {
      setErrorMsg(res.message || 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#691118] via-[#7d1720] to-[#580c10] text-white p-5 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          
          <img
            src={stationConfig.logoUrl}
            alt="โลโก้ สภ.ศรีสงคราม"
            className="w-14 h-16 mx-auto object-contain drop-shadow mb-2"
          />
          <h3 className="text-base font-bold">เข้าสู่ระบบบริหารจัดการการลา</h3>
          <p className="text-xs text-amber-200/90 mt-0.5">{stationConfig.stationName}</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              นามเรียกขาน หรือ ชื่อผู้ใช้ (Username)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                placeholder="เช่น SSK503 หรือ ศรีสงคราม 503 หรือ admin"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:outline-rose-800"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              * ข้าราชการตำรวจสามารถใช้นามเรียกขาน เช่น SSK503 เพื่อเข้าสู่ระบบครั้งแรกได้
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่านเริ่มต้นคือนามเรียกขาน"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:outline-rose-800"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-rose-900 to-[#721319] hover:from-rose-950 hover:to-rose-900 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            เข้าสู่ระบบ (Sign In)
          </button>

          {/* Quick Demo Logins for instant testing of roles */}
          <div className="pt-3 border-t border-slate-200">
            <p className="font-bold text-slate-500 mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              กดเพื่อทดสอบสิทธิ์ในระบบ (Quick Demo Login)
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin1234')}
                className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-left cursor-pointer"
              >
                <div className="font-bold">⚙️ Admin (ผู้ดูแลระบบ)</div>
                <div className="text-[10px] text-slate-500">User: admin</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('SSK1', 'SSK1')}
                className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-left cursor-pointer"
              >
                <div className="font-bold">⭐ ผกก. (ผู้กำกับ)</div>
                <div className="text-[10px] text-slate-500">พ.ต.อ. ถวิล (SSK1)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('SSK2', 'SSK2')}
                className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-left cursor-pointer"
              >
                <div className="font-bold">✍️ ผู้อนุมัติ (รอง ผกก.ป.)</div>
                <div className="text-[10px] text-slate-500">พ.ต.ท. สมนึก (SSK2)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('SSK503', 'SSK503')}
                className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-left cursor-pointer"
              >
                <div className="font-bold">👮 บุคลากร (ส.ต.ท. นัฐพงษ์)</div>
                <div className="text-[10px] text-slate-500">ศรีสงคราม 503</div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
