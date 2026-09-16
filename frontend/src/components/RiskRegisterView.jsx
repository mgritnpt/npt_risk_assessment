import React, { useState } from 'react';
import { Search, Filter, Plus, ShieldCheck, Eye, Edit3, Trash2, RefreshCw, FileSpreadsheet, Download } from 'lucide-react';
import { deleteRisk } from '../services/api';
import { exportRisksToExcel } from '../utils/excelExporter';

export default function RiskRegisterView({
  risks = [],
  categories = [],
  departments = [],
  dashboardData = null,
  activeMatrixCell = null,
  onClearMatrixFilter,
  onSelectRisk,
  onEditRisk,
  onOpenCreateModal,
  onRefresh
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Filtering Logic
  const filteredRisks = risks.filter((r) => {
    const matchesSearch =
      !search ||
      r.RiskNo.toLowerCase().includes(search.toLowerCase()) ||
      r.RiskTitle.toLowerCase().includes(search.toLowerCase()) ||
      (r.CategoryName && r.CategoryName.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = !selectedCategory || String(r.CategoryID) === String(selectedCategory);
    const matchesDept = !selectedDepartment || String(r.DepartmentID) === String(selectedDepartment);
    const matchesStatus = !selectedStatus || r.Status === selectedStatus;

    const matchesMatrix =
      !activeMatrixCell ||
      (r.InherentLikelihood === activeMatrixCell.l && r.InherentImpact === activeMatrixCell.i);

    return matchesSearch && matchesCat && matchesDept && matchesStatus && matchesMatrix;
  });

  const handleDelete = async (id, riskNo) => {
    if (window.confirm(`คุณต้องการลบความเสี่ยงรหัส ${riskNo} ใช่หรือไม่?`)) {
      try {
        await deleteRisk(id);
        onRefresh();
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการลบข้อมูล: ' + err.message);
      }
    }
  };

  const handleExportExcel = () => {
    exportRisksToExcel(filteredRisks, dashboardData, `IT_Risk_Assessment_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหารหัส, ชื่อความเสี่ยง, Category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">-- All Categories --</option>
            {categories.map((c) => (
              <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>
            ))}
          </select>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">-- All Departments --</option>
            {departments.map((d) => (
              <option key={d.DepartmentID} value={d.DepartmentID}>{d.DepartmentName}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">-- All Statuses --</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
            <option value="Accepted">Accepted</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onRefresh}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
            title="Export Styled Risk Assessment Excel"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
          <button
            onClick={onOpenCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            + New Risk Assessment
          </button>
        </div>
      </div>

      {/* Active Matrix Filter Indicator Tag */}
      {activeMatrixCell && (
        <div className="bg-indigo-50 border border-indigo-200 px-4 py-2.5 rounded-lg flex items-center justify-between text-xs text-indigo-900">
          <span>
            📍 กำลังกรองข้อมูลตามพิกัด Heatmap Matrix: <strong>Likelihood {activeMatrixCell.l} × Impact {activeMatrixCell.i}</strong>
          </span>
          <button
            onClick={onClearMatrixFilter}
            className="text-indigo-600 font-bold hover:underline"
          >
            Clear Matrix Filter
          </button>
        </div>
      )}

      {/* Main Datagrid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Risk ID</th>
                <th className="py-3 px-4">Risk Title & Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Inherent Risk</th>
                <th className="py-3 px-4">Primary Control</th>
                <th className="py-3 px-4 text-center">Standards</th>
                <th className="py-3 px-4 text-center">Residual Risk</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRisks.length > 0 ? (
                filteredRisks.map((risk) => (
                  <tr key={risk.RiskID} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {risk.RiskNo}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 text-sm">{risk.RiskTitle}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{risk.RiskDescription}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[11px]">
                        {risk.CategoryName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {risk.DepartmentName}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full font-bold border text-[11px] inline-block ${getLevelBadgeClass(risk.InherentLevel)}`}>
                        {risk.InherentScore} pts ({risk.InherentLevel})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-[150px] truncate text-slate-600">
                      {risk.PrimaryControlName || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      {risk.StandardMappingCount > 0 ? (
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[11px]">
                          {risk.StandardMappingCount} mapped
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {risk.ResidualScore ? (
                        <span className={`px-2 py-0.5 rounded font-semibold border text-[10px] ${getLevelBadgeClass(risk.ResidualLevel)}`}>
                          {risk.ResidualScore} pts ({risk.ResidualLevel})
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        risk.Status === 'Open' ? 'bg-amber-100 text-amber-800' :
                        risk.Status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {risk.Status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectRisk(risk.RiskID)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-1.5 rounded-md font-semibold text-xs flex items-center gap-1"
                          title="View Full Traceability Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button
                          onClick={() => onEditRisk(risk.RiskID)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 p-1.5 rounded-md font-semibold text-xs flex items-center gap-1"
                          title="Edit Risk Assessment"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(risk.RiskID, risk.RiskNo)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50"
                          title="Delete Risk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-12 text-slate-400">
                    ไม่พบรายการความเสี่ยงตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
