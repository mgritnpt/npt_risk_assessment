import React, { useState } from 'react';
import { Download, Upload, FileSpreadsheet, X, CheckCircle, AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { exportExcelData, downloadExcelTemplate, importExcelData, resetDatabaseToDefaultApi } from '../services/api';

export default function ExcelImportExportModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSummary(null);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('โปรดเลือกไฟล์ Excel (.xlsx หรือ .xls)');
      return;
    }

    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const res = await importExcelData(file);
      setSummary(res.summary);
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการนำเข้าไฟล์ Excel');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDatabase = async () => {
    if (window.confirm('⚠️ คำเตือน: คุณต้องการรีเซ็ตฐานข้อมูลเป็นค่าเริ่มต้นโรงงานใช่หรือไม่?\n\nข้อมูล Master Data และ Risk Register ที่เคยเพิ่ม/อัปโหลดทั้งหมดจะถูกเคลียร์และแทนที่ด้วยข้อมูลเริ่มต้น')) {
      setResetting(true);
      setError(null);
      setSummary(null);
      try {
        await resetDatabaseToDefaultApi();
        alert('✅ คืนค่าเริ่มต้นระบบสำเร็จแล้ว!');
        if (onImportSuccess) {
          onImportSuccess();
        }
        onClose();
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการรีเซ็ตฐานข้อมูล');
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Excel Import, Export & Reset Data</h2>
              <p className="text-xs text-slate-500">จัดการข้อมูล Master Data และ Risk Register ผ่าน Excel หรือรีเซ็ตคืนค่าเริ่มต้น</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Export & Template Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-indigo-900 mb-1 flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-600" /> Export ข้อมูลปัจจุบัน
              </h3>
              <p className="text-xs text-indigo-700 mb-3">
                ส่งออกข้อมูล Master Data และ Risk ทั้งหมดในระบบเป็นไฟล์ Excel (.xlsx)
              </p>
            </div>
            <button
              onClick={exportExcelData}
              className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-md shadow-sm transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลด Excel ข้อมูลทั้งหมด</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-slate-600" /> ดาวน์โหลด Template แม่แบบ
              </h3>
              <p className="text-xs text-slate-600 mb-3">
                ดาวน์โหลดไฟล์ Excel แม่แบบเปล่าสำหรับกรอกข้อมูลเพิ่มในระบบ
              </p>
            </div>
            <button
              onClick={downloadExcelTemplate}
              className="w-full py-2 px-3 bg-slate-700 hover:bg-slate-800 text-white font-medium text-sm rounded-md shadow-sm transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลด Template (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Section 2: Upload Excel File */}
        <form onSubmit={handleImport} className="space-y-4">
          <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl p-6 text-center transition-colors">
            <Upload className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-700 mb-1">เลือกไฟล์ Excel เพื่อนำเข้า (Import)</h4>
            <p className="text-xs text-slate-500 mb-3">รองรับไฟล์ .xlsx และ .xls ที่มีโครงสร้างตาม Template</p>
            
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
            />
            {file && (
              <p className="mt-2 text-xs font-semibold text-emerald-700">
                📄 เลือกไฟล์แล้ว: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Errors */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Import Summary */}
          {summary && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs">
              <div className="flex items-center gap-2 font-bold mb-2 text-sm text-emerald-800">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>นำเข้าข้อมูลเข้าสู่ระบบเรียบร้อยแล้ว!</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-slate-700 font-medium">
                <div>🏢 Business Units: <span className="font-bold text-emerald-700">{summary.businessUnits}</span></div>
                <div>🏭 Departments: <span className="font-bold text-emerald-700">{summary.departments}</span></div>
                <div>👤 Users: <span className="font-bold text-emerald-700">{summary.users}</span></div>
                <div>📍 Locations: <span className="font-bold text-emerald-700">{summary.locations}</span></div>
                <div>⚙️ Processes: <span className="font-bold text-emerald-700">{summary.processes}</span></div>
                <div>🖥️ Assets: <span className="font-bold text-emerald-700">{summary.assets}</span></div>
                <div>🏷️ Categories: <span className="font-bold text-emerald-700">{summary.categories}</span></div>
                <div>📜 Standards: <span className="font-bold text-emerald-700">{summary.standards}</span></div>
                <div>🚨 Risks: <span className="font-bold text-emerald-700">{summary.risks}</span></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleResetDatabase}
              disabled={resetting || loading}
              className="px-3.5 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-medium text-xs rounded-md transition-colors flex items-center space-x-1.5"
              title="ล้างข้อมูลและตั้งต้นระบบใหม่"
            >
              {resetting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-600" />
                  <span>กำลังคืนค่า...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                  <span>Mode Reset (คืนค่าเริ่มต้น)</span>
                </>
              )}
            </button>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                ปิดหน้าต่าง
              </button>
              <button
                type="submit"
                disabled={loading || !file || resetting}
                className={`px-5 py-2 text-sm font-medium text-white rounded-md shadow-sm transition-colors flex items-center space-x-2 ${
                  loading || !file || resetting ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังนำเข้าข้อมูล...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>เริ่มการนำเข้า Excel</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
