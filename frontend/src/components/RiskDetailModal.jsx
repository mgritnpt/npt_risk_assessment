import React, { useEffect, useState } from 'react';
import { X, ShieldAlert, FileText, CheckCircle2, Clock, ShieldCheck, Building2, Layers, Edit3 } from 'lucide-react';
import { getRiskById } from '../services/api';

export default function RiskDetailModal({ riskId, onClose, onEditRisk }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (riskId) {
      setLoading(true);
      getRiskById(riskId)
        .then((res) => {
          setDetail(res);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching risk detail:', err);
          setLoading(false);
        });
    }
  }, [riskId]);

  if (!riskId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full flex flex-col max-h-[90vh] my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Risk Traceability Detail View {detail?.header?.RiskNo && `(${detail.header.RiskNo})`}
              </h2>
              <p className="text-xs text-slate-500">
                วิเคราะห์ Traceability ตั้งแต่ Risk → Cause → Control → Standard → Action → Residual → Acceptance
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading || !detail ? (
            <div className="flex justify-center items-center py-16 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
              กำลังโหลดข้อมูล Traceability...
            </div>
          ) : (
            <>
              {/* 1. Risk Header Card */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                    {detail.header.RiskNo}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      Status: <strong className="text-slate-800">{detail.header.Status}</strong>
                    </span>
                    <button
                      onClick={() => {
                        onClose();
                        onEditRisk(detail.header.RiskID);
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Assessment
                    </button>
                  </div>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{detail.header.RiskTitle}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{detail.header.RiskDescription}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                    <span className="font-semibold text-slate-800">{detail.header.CategoryName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                    <span className="font-semibold text-slate-800">{detail.header.DepartmentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Asset</span>
                    <span className="font-semibold text-slate-800">{detail.header.AssetName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Owner</span>
                    <span className="font-semibold text-slate-800">{detail.header.RiskOwnerName || '-'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-200">
                  <div>
                    <span className="text-red-600 block font-bold">Threat & Vulnerability:</span>
                    <p className="text-slate-700 mt-0.5">{detail.header.Threat || '-'} / {detail.header.Vulnerability || '-'}</p>
                  </div>
                  <div>
                    <span className="text-indigo-600 block font-bold">Cause & Consequence:</span>
                    <p className="text-slate-700 mt-0.5">{detail.header.RiskCause || '-'} → {detail.header.RiskConsequence || '-'}</p>
                  </div>
                </div>
              </div>

              {/* 2. Inherent vs Residual Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Inherent Assessment */}
                <div className="bg-red-50/50 p-4 rounded-xl border border-red-200">
                  <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2">
                    Inherent Risk (ก่อนมาตรการควบคุม)
                  </h4>
                  {detail.inherentAssessment ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">Likelihood: <strong>L{detail.inherentAssessment.Likelihood}</strong> × Impact: <strong>I{detail.inherentAssessment.Impact}</strong></span>
                        <span className="text-lg font-extrabold text-red-700">{detail.inherentAssessment.RiskScore} pts</span>
                      </div>
                      <p className="text-xs font-bold text-red-600 mt-1">Level: {detail.inherentAssessment.RiskLevel}</p>
                      <div className="mt-3 grid grid-cols-4 gap-2 text-[10px] text-center">
                        <div className="bg-white p-1 rounded border">C: {detail.inherentAssessment.ConfidentialityImpact || '-'}</div>
                        <div className="bg-white p-1 rounded border">I: {detail.inherentAssessment.IntegrityImpact || '-'}</div>
                        <div className="bg-white p-1 rounded border">A: {detail.inherentAssessment.AvailabilityImpact || '-'}</div>
                        <div className="bg-white p-1 rounded border">Q: {detail.inherentAssessment.QualityImpact || '-'}</div>
                      </div>
                    </div>
                  ) : <span className="text-xs text-slate-400">ไม่มีข้อมูล</span>}
                </div>

                {/* Residual Assessment */}
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                    Residual Risk (ความเสี่ยงคงเหลือหลังควบคุม)
                  </h4>
                  {detail.residualAssessment ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">Likelihood: <strong>L{detail.residualAssessment.Likelihood}</strong> × Impact: <strong>I{detail.residualAssessment.Impact}</strong></span>
                        <span className="text-lg font-extrabold text-emerald-700">{detail.residualAssessment.RiskScore} pts</span>
                      </div>
                      <p className="text-xs font-bold text-emerald-600 mt-1">Level: {detail.residualAssessment.RiskLevel}</p>
                    </div>
                  ) : <span className="text-xs text-slate-400">ยังไม่ได้ประเมิน Residual Risk</span>}
                </div>
              </div>

              {/* 3. Existing Controls */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Existing Controls & Safeguards ({detail.controls.length})
                </h4>
                {detail.controls.length > 0 ? (
                  <div className="space-y-2">
                    {detail.controls.map((ctrl) => (
                      <div key={ctrl.ControlID} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{ctrl.ControlName}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Owner: {ctrl.ControlOwner || '-'} | Type: {ctrl.ControlType}</p>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {ctrl.ControlEffectiveness}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-slate-400">ยังไม่มีมาตรการควบคุมบันทึกไว้</p>}
              </div>

              {/* 4. Standards Mapped */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Multi-Standard Compliance Mapping ({detail.standards.length})
                </h4>
                {detail.standards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {detail.standards.map((std) => (
                      <div key={std.MappingID} className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                        <p className="font-bold text-indigo-900">{std.StandardName} ({std.StandardCode})</p>
                        <p className="text-[11px] text-indigo-700 mt-0.5">Clause: {std.ClauseNo || '-'} {std.ClauseTitle || ''}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-slate-400">ยังไม่ได้เชื่อมโยงข้อกำหนดมาตรฐาน</p>}
              </div>

              {/* 5. Treatment Actions */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Risk Treatment & Action Items ({detail.actions.length})
                </h4>
                {detail.actions.length > 0 ? (
                  <div className="space-y-2 text-xs">
                    {detail.actions.map((act) => (
                      <div key={act.ActionID} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{act.TreatmentAction}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Owner: {act.ActionOwner} | Target: {act.TargetDate ? act.TargetDate.split('T')[0] : '-'} | Budget: {act.RequiredBudget} THB</p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {act.Status} ({act.ProgressPercent}%)
                        </span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-slate-400">ยังไม่มีแผนการแก้ไขบันทึกไว้</p>}
              </div>

              {/* 6. Acceptance */}
              {detail.acceptance && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <p className="font-bold">Risk Acceptance Record:</p>
                  <p className="mt-1">Accepted By: <strong>{detail.acceptance.AcceptedBy || '-'}</strong> | Date: {detail.acceptance.AcceptanceDate ? detail.acceptance.AcceptanceDate.split('T')[0] : '-'}</p>
                  <p className="mt-0.5 text-slate-600">Reason: {detail.acceptance.AcceptanceReason || '-'}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-between items-center">
          {detail?.header?.RiskID && (
            <button
              onClick={() => {
                onClose();
                onEditRisk(detail.header.RiskID);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" /> Edit Risk Assessment
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold ml-auto"
          >
            Close Traceability View
          </button>
        </div>
      </div>
    </div>
  );
}
