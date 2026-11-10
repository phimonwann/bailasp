/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Settings,
  Phone,
  Building,
  UserCheck,
  Calendar,
  Lock,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Shield,
} from 'lucide-react';
import { OfficialHoliday } from '../types/leave';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    stationConfig,
    updateStationConfig,
    availableFiscalYears,
    holidays,
    addHoliday,
    deleteHoliday,
    exportBackupData,
    importBackupData,
    resetToDefault,
    closeFiscalYear,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'holidays' | 'backup' | 'fiscal'>('general');

  // Form state for Station Config (Requirement #18: phone input saved to StationConfig)
  const [stationName, setStationName] = useState(stationConfig.stationName);
  const [stationPhone, setStationPhone] = useState(stationConfig.stationPhone); // Requirement #18
  const [stationAddress, setStationAddress] = useState(stationConfig.stationAddress);
  const [province, setProvince] = useState(stationConfig.province);
  const [region, setRegion] = useState(stationConfig.region);
  const [superintendentName, setSuperintendentName] = useState(stationConfig.superintendentName);
  const [superintendentRank, setSuperintendentRank] = useState(stationConfig.superintendentRank);
  const [provincialCommanderName, setProvincialCommanderName] = useState(stationConfig.provincialCommanderName);
  const [provincialCommanderRank, setProvincialCommanderRank] = useState(stationConfig.provincialCommanderRank);
  const [inspectorName, setInspectorName] = useState(stationConfig.inspectorName);
  const [inspectorRank, setInspectorRank] = useState(stationConfig.inspectorRank);
  const [currentFiscalYear, setCurrentFiscalYear] = useState(stationConfig.currentFiscalYear);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(stationConfig.sessionTimeoutMinutes);

  // New Holiday Form State
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [backupRestoreMsg, setBackupRestoreMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateStationConfig({
      stationName,
      stationPhone, // Requirement #18 saved into StationConfig
      stationAddress,
      province,
      region,
      superintendentName,
      superintendentRank,
      provincialCommanderName,
      provincialCommanderRank,
      inspectorName,
      inspectorRank,
      currentFiscalYear,
      sessionTimeoutMinutes,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayDate || !newHolidayName) return;
    addHoliday({
      date: newHolidayDate,
      name: newHolidayName,
      isCustom: true,
    });
    setNewHolidayDate('');
    setNewHolidayName('');
  };

  const handleExportBackup = () => {
    const jsonStr = exportBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_ssk_police_leave_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupData(content);
      if (success) {
        setBackupRestoreMsg('กู้คืนฐานข้อมูลจากไฟล์สำรองสำเร็จแล้ว');
      } else {
        setBackupRestoreMsg('เกิดข้อผิดพลาดในการกู้คืนไฟล์');
      }
      setTimeout(() => setBackupRestoreMsg(null), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#691118] via-[#7d1720] to-[#580c10] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-base font-bold">ตั้งค่าระบบ สภ.ศรีสงคราม</h2>
              <p className="text-xs text-amber-200/90">
                ข้อมูลสถานี ผู้บังคับบัญชา เบอร์โทรศัพท์ วันหยุดราชการ และการสำรองข้อมูล
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 px-5 pt-2 bg-slate-50 gap-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'general'
                ? 'border-rose-900 text-rose-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ข้อมูลสถานี & ผู้บังคับบัญชา
          </button>
          <button
            onClick={() => setActiveTab('holidays')}
            className={`py-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'holidays'
                ? 'border-rose-900 text-rose-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            กำหนดวันหยุดราชการ ({holidays.length})
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'backup'
                ? 'border-rose-900 text-rose-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            สำรอง & กู้คืนข้อมูล
          </button>
          <button
            onClick={() => setActiveTab('fiscal')}
            className={`py-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'fiscal'
                ? 'border-rose-900 text-rose-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ปิดปีงบประมาณ
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              บันทึกการตั้งค่าเรียบร้อย
            </div>
          )}

          {backupRestoreMsg && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 font-bold rounded-xl">
              {backupRestoreMsg}
            </div>
          )}

          {/* ===================== TAB 1: GENERAL ===================== */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่อสถานีตำรวจ</label>
                  <input
                    type="text"
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                  />
                </div>

                {/* Requirement #18: ช่อง input สำหรับแก้ไขเบอร์โทรศัพท์สถานีตำรวจ และบันทึกลง StationConfig */}
                <div>
                  <label className="block font-bold text-rose-950 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-rose-800" />
                    เบอร์โทรศัพท์สถานีตำรวจ (Requirement #18)
                  </label>
                  <input
                    type="text"
                    value={stationPhone}
                    onChange={(e) => setStationPhone(e.target.value)}
                    placeholder="เช่น 042-571211"
                    className="w-full bg-rose-50/50 border border-rose-300 rounded-lg p-2 font-bold font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ที่ตั้งสถานีตำรวจ</label>
                <input
                  type="text"
                  value={stationAddress}
                  onChange={(e) => setStationAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">จังหวัด</label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">กองบัญชาการ</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Requirement #3 & #27: แก้ไขชื่อ ผกก. และ ผบก.ภ.จว.นครพนม */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 text-xs">
                  รายนามผู้บังคับบัญชาผู้มีอำนาจลงนามคำสั่งลา (Requirement #3 & #27)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">ยศ ผกก.</label>
                    <input
                      type="text"
                      value={superintendentRank}
                      onChange={(e) => setSuperintendentRank(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">ชื่อ-สกุล ผกก.สภ.ศรีสงคราม</label>
                    <input
                      type="text"
                      value={superintendentName}
                      onChange={(e) => setSuperintendentName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">ยศ ผบก.</label>
                    <input
                      type="text"
                      value={provincialCommanderRank}
                      onChange={(e) => setProvincialCommanderRank(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ชื่อ-สกุล ผบก.ภ.จว.นครพนม (สำหรับใบลาอุปสมบท/คำสั่งพิเศษ)
                    </label>
                    <input
                      type="text"
                      value={provincialCommanderName}
                      onChange={(e) => setProvincialCommanderName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">ยศ ผู้ตรวจ</label>
                    <input
                      type="text"
                      value={inspectorRank}
                      onChange={(e) => setInspectorRank(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">ชื่อ-สกุล สว.อก. (ผู้ตรวจเอกสาร)</label>
                    <input
                      type="text"
                      value={inspectorName}
                      onChange={(e) => setInspectorName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Requirement #4: ปีงบประมาณรองรับถึงปี 2580 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ปีงบประมาณปัจจุบัน (รองรับถึง พ.ศ. 2580 ตามข้อกำหนด #4)
                  </label>
                  <select
                    value={currentFiscalYear}
                    onChange={(e) => setCurrentFiscalYear(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  >
                    {availableFiscalYears.map((yr) => (
                      <option key={yr} value={yr}>ปีงบประมาณ {yr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ระบบจัดการเซสชัน (ออกจากระบบอัตโนมัติเมื่อไม่ใช้งาน)
                  </label>
                  <select
                    value={sessionTimeoutMinutes}
                    onChange={(e) => setSessionTimeoutMinutes(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                  >
                    <option value={15}>15 นาที</option>
                    <option value={30}>30 นาที (แนะนำ)</option>
                    <option value={60}>60 นาที</option>
                    <option value={120}>2 ชั่วโมง</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-900 hover:bg-rose-800 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  บันทึกการตั้งค่าทั่วไป
                </button>
              </div>
            </form>
          )}

          {/* ===================== TAB 2: HOLIDAYS ===================== */}
          {activeTab === 'holidays' && (
            <div className="space-y-4">
              <form onSubmit={handleAddHoliday} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">วันที่วันหยุด</label>
                  <input
                    type="date"
                    required
                    value={newHolidayDate}
                    onChange={(e) => setNewHolidayDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                  />
                </div>
                <div className="flex-2 min-w-[200px]">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">ชื่อวันหยุด / วันหยุดพิเศษ</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น วันหยุดราชการเป็นกรณีพิเศษ"
                    value={newHolidayName}
                    onChange={(e) => setNewHolidayName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-1.5"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-900 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> เพิ่มวันหยุด
                </button>
              </form>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {holidays.map((h) => (
                  <div key={h.date} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <span className="font-mono font-bold text-rose-900 text-xs mr-3">{h.date}</span>
                      <span className="text-slate-800 font-medium">{h.name}</span>
                    </div>
                    <button
                      onClick={() => deleteHoliday(h.date)}
                      className="text-slate-400 hover:text-rose-700 p-1"
                      title="ลบวันหยุด"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB 3: BACKUP & RESTORE ===================== */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-rose-800" />
                  สำรองข้อมูลระบบ (Backup Database)
                </h4>
                <p className="text-xs text-slate-500">
                  ดาวน์โหลดข้อมูลบุคลากร คำขอลา สถิติ และการตั้งค่าทั้งหมดเป็นไฟล์ JSON เพื่อความปลอดภัย
                </p>
                <button
                  onClick={handleExportBackup}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> ดาวน์โหลดไฟล์สำรองข้อมูล (.json)
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-700" />
                  กู้คืนข้อมูล (Restore Database)
                </h4>
                <p className="text-xs text-slate-500">
                  นำเข้าไฟล์สำรองข้อมูล JSON เพื่อกู้คืนสถานะข้อมูลในระบบ
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="text-xs text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
                />
              </div>

              <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2">
                <h4 className="font-bold text-rose-900 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-rose-700" />
                  รีเซ็ตข้อมูลสู่ค่าเริ่มต้น (Factory Reset)
                </h4>
                <p className="text-xs text-rose-700">
                  ล้างข้อมูลที่แก้ไขในเบราว์เซอร์และคืนค่าข้าราชการตำรวจและใบลาตามต้นฉบับ สภ.ศรีสงคราม
                </p>
                <button
                  onClick={() => {
                    if (window.confirm('ยืนยันการคืนค่าข้อมูลเริ่มต้นของ สภ.ศรีสงคราม?')) {
                      resetToDefault();
                      alert('รีเซ็ตข้อมูลเรียบร้อยแล้ว');
                    }
                  }}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold cursor-pointer"
                >
                  รีเซ็ตกลับสู่ค่าเริ่มต้น
                </button>
              </div>
            </div>
          )}

          {/* ===================== TAB 4: CLOSE FISCAL YEAR ===================== */}
          {activeTab === 'fiscal' && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
              <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-800" />
                ระบบปิดปีงบประมาณและล็อกข้อมูล (Requirement #72)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                การปิดปีงบประมาณจะทำการสรุปวันลาสะสมคงเหลือของข้าราชการตำรวจทุกคน ล็อกการยื่นใบลา และล็อกไม่ให้แก้ไขข้อมูลย้อนหลังโดยไม่มีสิทธิ์แอดมินสูงสุด
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    if (window.confirm(`ยืนยันการปิดปีงบประมาณ ${currentFiscalYear} และล็อกข้อมูล?`)) {
                      closeFiscalYear(currentFiscalYear);
                      alert(`ปิดปีงบประมาณ ${currentFiscalYear} เรียบร้อยแล้ว`);
                    }
                  }}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-4 h-4" /> ดำเนินการปิดปีงบประมาณ {currentFiscalYear}
                </button>
                {stationConfig.isFiscalYearLocked && (
                  <span className="text-xs font-bold text-amber-900 bg-amber-200/60 px-2.5 py-1 rounded">
                    สถานะ: ปิดปีงบประมาณและล็อกแล้ว
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
