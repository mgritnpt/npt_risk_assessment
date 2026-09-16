import React from 'react';
import HeatmapMatrix from './HeatmapMatrix';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  FileCheck2,
  ShieldCheck,
  TrendingUp,
  Layers
} from 'lucide-react';

export default function DashboardView({ dashboardData, onSelectRisk, activeMatrixCell, onHeatmapCellClick }) {
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
        กำลังโหลดข้อมูล Dashboard...
      </div>
    );
  }

  const { stats, heatmapGrid, standards = [], ciaMetrics = {}, departmentBreakdown = [], topRisks = [], overdueActions = [] } = dashboardData;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Executive Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Risks</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalRisks}</h3>
            <p className="text-xs text-slate-400 mt-1">Open: {stats.openCount} | Closed: {stats.closedCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-red-200 bg-gradient-to-br from-red-50/50 to-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Critical Risks</p>
            <h3 className="text-3xl font-extrabold text-red-700 mt-1">{stats.criticalCount}</h3>
            <p className="text-xs text-red-500 mt-1">Requiring Executive Action</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50/50 to-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">High Risks</p>
            <h3 className="text-3xl font-extrabold text-orange-700 mt-1">{stats.highCount}</h3>
            <p className="text-xs text-orange-500 mt-1">Require Priority Treatment</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Overdue Actions</p>
            <h3 className="text-3xl font-extrabold text-amber-700 mt-1">{stats.overdueActionsCount}</h3>
            <p className="text-xs text-amber-500 mt-1">Past Target Completion Date</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. 5x5 Heatmap Matrix */}
      <HeatmapMatrix
        heatmapGrid={heatmapGrid}
        activeCell={activeMatrixCell}
        onCellClick={onHeatmapCellClick}
      />

      {/* 3. Middle Section: CIA Triad & Standard Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CIA Triad & Quality Impact Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            CIA Triad & Quality Impact Breakdown (Avg Score 1-5)
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Confidentiality Impact (C)</span>
                <span className="text-indigo-600">{(ciaMetrics.avgConfidentiality || 0).toFixed(1)} / 5.0</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${((ciaMetrics.avgConfidentiality || 0) / 5) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Integrity Impact (I)</span>
                <span className="text-blue-600">{(ciaMetrics.avgIntegrity || 0).toFixed(1)} / 5.0</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${((ciaMetrics.avgIntegrity || 0) / 5) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Availability Impact (A)</span>
                <span className="text-cyan-600">{(ciaMetrics.avgAvailability || 0).toFixed(1)} / 5.0</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-cyan-600 h-2.5 rounded-full" style={{ width: `${((ciaMetrics.avgAvailability || 0) / 5) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Quality & Production Impact (IATF 16949)</span>
                <span className="text-emerald-600">{(ciaMetrics.avgQuality || 0).toFixed(1)} / 5.0</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: `${((ciaMetrics.avgQuality || 0) / 5) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Standard Compliance Coverage */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <FileCheck2 className="w-5 h-5 text-indigo-600" />
            Standard Compliance Mapping Coverage
          </h3>
          <div className="space-y-4">
            {standards.map((std) => {
              const count = std.mappedRisksCount || 0;
              const total = stats.totalRisks || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={std.StandardCode}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-800">{std.StandardName}</span>
                    <span className="text-slate-600">{count} Risks ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-slate-800 h-2.5 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Top Critical Open Risks & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Critical Risks Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              Top Open Critical & High Risks
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Risk ID</th>
                  <th className="py-2.5 px-3">Risk Title</th>
                  <th className="py-2.5 px-3">Dept</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Level</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topRisks.length > 0 ? (
                  topRisks.map((risk) => (
                    <tr key={risk.RiskID} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{risk.RiskNo}</td>
                      <td className="py-3 px-3 font-medium text-slate-800">{risk.RiskTitle}</td>
                      <td className="py-3 px-3">{risk.DepartmentName}</td>
                      <td className="py-3 px-3 font-bold">{risk.RiskScore} pts</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          risk.RiskLevel === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {risk.RiskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onSelectRisk(risk.RiskID)}
                          className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2.5 py-1 rounded font-semibold"
                        >
                          View Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-slate-400">No open critical risks found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Risks by Department
          </h3>
          <div className="space-y-3">
            {departmentBreakdown.map((dept) => (
              <div key={dept.DepartmentCode} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-800">{dept.DepartmentName}</p>
                  <p className="text-[10px] text-slate-500">High/Critical: {dept.highCriticalCount}</p>
                </div>
                <span className="bg-indigo-600 text-white font-bold text-xs px-2.5 py-1 rounded-full">
                  {dept.totalRisks}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
