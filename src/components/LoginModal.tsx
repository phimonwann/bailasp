/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Lock,
  User,
  Key,
  AlertTriangle,
  X,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequirePasswordChange: () => void;
  isFullPage?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onRequirePasswordChange,
  isFullPage = false,
}) => {
  const { login, stationConfig } = useApp();

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

  const cardContent = (
    <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#5c0d12] via-[#75151c] to-[#45070a] text-white p-6 text-center relative border-b border-amber-500/30">
        {!isFullPage && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        <div className="relative inline-block mb-3">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full blur-xs opacity-75"></div>
          <img
            src={stationConfig.logoUrl}
            alt="โลโก้ สภ.ศรีสงคราม"
            className="relative w-16 h-18 mx-auto object-contain drop-shadow"
          />
        </div>
        <h3 className="text-lg font-bold tracking-wide">เข้าสู่ระบบบริหารจัดการการลาออนไลน์</h3>
        <p className="text-xs text-amber-200/90 font-medium mt-0.5">
          {stationConfig.stationName} จังหวัดนครพนม
        </p>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
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
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              required
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              placeholder="เช่น SSK503 หรือ ศรีสงคราม 503 หรือ admin"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-rose-800 focus:bg-white transition-colors"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            * ข้าราชการตำรวจเข้าใช้งานครั้งแรกด้วยนามเรียกขาน (เช่น SSK503)
          </p>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            รหัสผ่าน (Password)
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่านเริ่มต้นคือนามเรียกขาน หรือรหัสที่ตั้งไว้"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-rose-800 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-rose-900 to-[#721319] hover:from-rose-950 hover:to-rose-900 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
        >
          <Lock className="w-4 h-4" />
          <span>เข้าสู่ระบบ (Sign In)</span>
        </button>


      </form>
    </div>
  );

  if (isFullPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#45070a] via-[#5c0d12] to-[#250305] flex items-center justify-center p-4 antialiased">
        {cardContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      {cardContent}
    </div>
  );
};
