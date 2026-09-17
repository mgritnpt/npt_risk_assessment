import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle, ShieldAlert } from 'lucide-react';
import { createRisk, updateRisk, getRiskById } from '../services/api';

export default function CreateRiskModal({
  isOpen,
  onClose,
  editingRiskId = null,
  categories = [],
  departments = [],
  standards = [],
  assets = [],
  locations = [],
  bus = [],
  onCreated
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);

  // Form State for 7 Steps
  const [formData, setFormData] = useState({
    // Step 1: Identification
    RiskNo: '',
    RiskTitle: '',
    RiskDescription: '',
    CategoryID: '',
    DepartmentID: '',
    ProcessID: '',
    LocationID: '',
    BUID: '',
    AssetID: '',
    Threat: '',
    Vulnerability: '',
    RiskCause: '',
    RiskConsequence: '',
    ExistingCondition: '',
    PotentialImpact: '',
    Status: 'Open',

    // Step 2: Inherent Assessment
    InherentLikelihood: 3,
    InherentImpact: 3,
    ConfidentialityImpact: 3,
    IntegrityImpact: 3,
    AvailabilityImpact: 3,
    QualityImpact: 3,
    FinancialImpact: 3,

    // Step 3: Existing Controls
    ControlName: '',
    ControlDescription: '',
    ControlType: 'Preventive',
    ManualOrAutomated: 'Automated',
    ControlOwner: '',
    ControlEffectiveness: 'Effective',
    ControlEvidence: '',

    // Step 4: Standard Mapping
    selectedStandards: [], // Array of StandardIDs

    // Step 5: Treatment Action
    TreatmentStrategy: 'Reduce',
    TreatmentAction: '',
    ActionOwner: '',
    TargetDate: '',
    Priority: 'Medium',
    RequiredBudget: 0,

    // Step 6: Residual Assessment
    ResidualLikelihood: 2,
    ResidualImpact: 2,

    // Step 7: Risk Acceptance
    IsAcceptanceRequired: false,
    AcceptedBy: '',
    AcceptanceDate: new Date().toISOString().split('T')[0],
    AcceptanceReason: ''
  });

  // Pre-fill data if editing existing risk
  useEffect(() => {
    if (isOpen && editingRiskId) {
      setLoadingInitial(true);
      getRiskById(editingRiskId)
        .then((data) => {
          const h = data.header || {};
          const inh = data.inherentAssessment || {};
          const res = data.residualAssessment || {};
          const ctrl = (data.controls && data.controls[0]) || {};
          const stds = (data.standards || []).map((s) => s.StandardID);
          const act = (data.actions && data.actions[0]) || {};
          const acc = data.acceptance || {};

          setFormData({
            RiskNo: h.RiskNo || '',
            RiskTitle: h.RiskTitle || '',
            RiskDescription: h.RiskDescription || '',
            CategoryID: h.CategoryID || '',
            DepartmentID: h.DepartmentID || '',
            ProcessID: h.ProcessID || '',
            LocationID: h.LocationID || '',
            BUID: h.BUID || '',
            AssetID: h.AssetID || '',
            RiskOwnerID: h.RiskOwnerID || '',
            AssessorID: h.AssessorID || '',
            ApproverID: h.ApproverID || '',
            Threat: h.Threat || '',
            Vulnerability: h.Vulnerability || '',
            RiskCause: h.RiskCause || '',
            RiskConsequence: h.RiskConsequence || '',
            ExistingCondition: h.ExistingCondition || '',
            PotentialImpact: h.PotentialImpact || '',
            Status: h.Status || 'Open',

            InherentLikelihood: inh.Likelihood || 3,
            InherentImpact: inh.Impact || 3,
            ConfidentialityImpact: inh.ConfidentialityImpact || 3,
            IntegrityImpact: inh.IntegrityImpact || 3,
            AvailabilityImpact: inh.AvailabilityImpact || 3,
            QualityImpact: inh.QualityImpact || 3,
            FinancialImpact: inh.FinancialImpact || 3,

            ControlName: ctrl.ControlName || '',
            ControlDescription: ctrl.ControlDescription || '',
            ControlType: ctrl.ControlType || 'Preventive',
            ManualOrAutomated: ctrl.ManualOrAutomated || 'Automated',
            ControlOwner: ctrl.ControlOwner || '',
            ControlEffectiveness: ctrl.ControlEffectiveness || 'Effective',
            ControlEvidence: ctrl.ControlEvidence || '',

            selectedStandards: stds,

            TreatmentStrategy: act.TreatmentStrategy || 'Reduce',
            TreatmentAction: act.TreatmentAction || '',
            ActionOwner: act.ActionOwner || '',
            TargetDate: act.TargetDate ? act.TargetDate.split('T')[0] : '',
            Priority: act.Priority || 'Medium',
            RequiredBudget: act.RequiredBudget || 0,

            ResidualLikelihood: res.Likelihood || 2,
            ResidualImpact: res.Impact || 2,

            IsAcceptanceRequired: acc.IsRequired || false,
            AcceptedBy: acc.AcceptedBy || '',
            AcceptanceDate: acc.AcceptanceDate ? acc.AcceptanceDate.split('T')[0] : new Date().toISOString().split('T')[0],
            AcceptanceReason: acc.AcceptanceReason || ''
          });

          setLoadingInitial(false);
        })
        .catch((err) => {
          console.error('Error fetching risk for editing:', err);
          setLoadingInitial(false);
        });
    } else if (isOpen && !editingRiskId) {
      // Reset form for new risk
      setFormData({
        RiskNo: '', RiskTitle: '', RiskDescription: '', CategoryID: '', DepartmentID: '', ProcessID: '', LocationID: '', BUID: '', AssetID: '',
        Threat: '', Vulnerability: '', RiskCause: '', RiskConsequence: '', ExistingCondition: '', PotentialImpact: '', Status: 'Open',
        InherentLikelihood: 3, InherentImpact: 3, ConfidentialityImpact: 3, IntegrityImpact: 3, AvailabilityImpact: 3, QualityImpact: 3, FinancialImpact: 3,
        ControlName: '', ControlDescription: '', ControlType: 'Preventive', ManualOrAutomated: 'Automated', ControlOwner: '', ControlEffectiveness: 'Effective', ControlEvidence: '',
        selectedStandards: [],
        TreatmentStrategy: 'Reduce', TreatmentAction: '', ActionOwner: '', TargetDate: '', Priority: 'Medium', RequiredBudget: 0,
        ResidualLikelihood: 2, ResidualImpact: 2,
        IsAcceptanceRequired: false, AcceptedBy: '', AcceptanceDate: new Date().toISOString().split('T')[0], AcceptanceReason: ''
      });
      setCurrentStep(1);
    }
  }, [isOpen, editingRiskId]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStandardToggle = (stdId) => {
    setFormData((prev) => {
      const exists = prev.selectedStandards.includes(stdId);
      if (exists) {
        return { ...prev, selectedStandards: prev.selectedStandards.filter((id) => id !== stdId) };
      } else {
        return { ...prev, selectedStandards: [...prev.selectedStandards, stdId] };
      }
    });
  };

  // Score & Level Calculator
  const calcScore = (l, i) => l * i;
  const calcLevel = (score) => {
    if (score >= 15) return { name: 'Critical', color: 'bg-red-500 text-white' };
    if (score >= 10) return { name: 'High', color: 'bg-orange-500 text-white' };
    if (score >= 5) return { name: 'Medium', color: 'bg-amber-500 text-white' };
    return { name: 'Low', color: 'bg-emerald-500 text-white' };
  };

  const inherentScore = calcScore(formData.InherentLikelihood, formData.InherentImpact);
  const inherentLevel = calcLevel(inherentScore);

  const residualScore = calcScore(formData.ResidualLikelihood, formData.ResidualImpact);
  const residualLevel = calcLevel(residualScore);

  const handleSubmit = async () => {
    if (!formData.RiskTitle || !formData.CategoryID || !formData.DepartmentID) {
      alert('กรุณากรอกข้อมูลสำคัญ (ชื่อความเสี่ยง, Category, Department) ให้ครบถ้วน');
      setCurrentStep(1);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        header: {
          RiskNo: formData.RiskNo || undefined,
          RiskTitle: formData.RiskTitle,
          RiskDescription: formData.RiskDescription,
          CategoryID: parseInt(formData.CategoryID, 10),
          DepartmentID: parseInt(formData.DepartmentID, 10),
          ProcessID: formData.ProcessID ? parseInt(formData.ProcessID, 10) : null,
          LocationID: formData.LocationID ? parseInt(formData.LocationID, 10) : null,
          BUID: formData.BUID ? parseInt(formData.BUID, 10) : null,
          AssetID: formData.AssetID ? parseInt(formData.AssetID, 10) : null,
          RiskOwnerID: formData.RiskOwnerID ? parseInt(formData.RiskOwnerID, 10) : null,
          AssessorID: formData.AssessorID ? parseInt(formData.AssessorID, 10) : null,
          ApproverID: formData.ApproverID ? parseInt(formData.ApproverID, 10) : null,
          Threat: formData.Threat,
          Vulnerability: formData.Vulnerability,
          RiskCause: formData.RiskCause,
          RiskConsequence: formData.RiskConsequence,
          ExistingCondition: formData.ExistingCondition,
          PotentialImpact: formData.PotentialImpact,
          Status: formData.Status || 'Open'
        },
        inherentAssessment: {
          Likelihood: formData.InherentLikelihood,
          Impact: formData.InherentImpact,
          ConfidentialityImpact: formData.ConfidentialityImpact,
          IntegrityImpact: formData.IntegrityImpact,
          AvailabilityImpact: formData.AvailabilityImpact,
          QualityImpact: formData.QualityImpact,
          FinancialImpact: formData.FinancialImpact
        },
        residualAssessment: {
          Likelihood: formData.ResidualLikelihood,
          Impact: formData.ResidualImpact
        },
        controls: formData.ControlName ? [{
          ControlName: formData.ControlName,
          ControlDescription: formData.ControlDescription,
          ControlType: formData.ControlType,
          ManualOrAutomated: formData.ManualOrAutomated,
          ControlOwner: formData.ControlOwner,
          ControlEffectiveness: formData.ControlEffectiveness,
          ControlEvidence: formData.ControlEvidence
        }] : [],
        standards: formData.selectedStandards.map((stdId) => ({ StandardID: stdId })),
        actions: formData.TreatmentAction ? [{
          TreatmentStrategy: formData.TreatmentStrategy,
          TreatmentAction: formData.TreatmentAction,
          ActionOwner: formData.ActionOwner,
          TargetDate: formData.TargetDate || null,
          Priority: formData.Priority,
          RequiredBudget: parseFloat(formData.RequiredBudget || 0),
          Status: 'Open'
        }] : [],
        acceptance: {
          IsRequired: formData.IsAcceptanceRequired,
          AcceptedBy: formData.AcceptedBy,
          AcceptanceDate: formData.AcceptanceDate,
          AcceptanceReason: formData.AcceptanceReason
        }
      };

      if (editingRiskId) {
        await updateRisk(editingRiskId, payload);
      } else {
        await createRisk(payload);
      }

      setSubmitting(false);
      onCreated();
      onClose();
    } catch (err) {
      setSubmitting(false);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      const serverDetails = err.response?.data?.details ? `\n\n[Details]: ${err.response.data.details}` : '';
      alert(`เกิดข้อผิดพลาดในการบันทึกข้อมูล:\n${serverMsg}${serverDetails}`);
    }
  };

  const steps = [
    { num: 1, title: '01. Identification', desc: 'ระบุองค์กร & Threat' },
    { num: 2, title: '02. Assessment', desc: 'Likelihood x Impact (CIA)' },
    { num: 3, title: '03. Existing Controls', desc: 'มาตรการที่มีอยู่เดิม' },
    { num: 4, title: '04. Standards Mapping', desc: 'เชื่อม ISO/IATF/JAMA' },
    { num: 5, title: '05. Treatment Action', desc: 'แผนจัดการความเสี่ยง' },
    { num: 6, title: '06. Residual Risk', desc: 'ประเมินความเสี่ยงคงเหลือ' },
    { num: 7, title: '07. Risk Acceptance', desc: 'การลงนามยอมรับความเสี่ยง' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full flex flex-col max-h-[90vh] my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              {editingRiskId ? `Edit Risk Assessment (${formData.RiskNo || `#${editingRiskId}`})` : 'New Risk Assessment Wizard (7-Step Guided Process)'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              แบบประเมินและแก้ไขความเสี่ยง Enterprise IT & Manufacturing (IATF 16949, ISO 9001, JAMA/JAPIA, ISO 27001)
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px]">
            {steps.map((s) => (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  currentStep === s.num
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : currentStep > s.num
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                <span>{s.num}.</span>
                <span>{s.title.split('.')[1]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step Content Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loadingInitial ? (
            <div className="flex justify-center items-center py-16 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
              กำลังโหลดข้อมูลความเสี่ยงสำหรับแก้ไข...
            </div>
          ) : (
            <>
              {/* STEP 1: IDENTIFICATION */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-indigo-600 border-b pb-2">
                    Step 01: Risk Identification & Context
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อความเสี่ยง (Risk Title) *</label>
                      <input
                        type="text"
                        required
                        placeholder="เช่น Primary ERP SAP Database Server Hardware Failure"
                        value={formData.RiskTitle}
                        onChange={(e) => handleChange('RiskTitle', e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">รหัสความเสี่ยง (Risk ID)</label>
                      <input
                        type="text"
                        placeholder="เช่น IT-R-2026-003"
                        value={formData.RiskNo}
                        onChange={(e) => handleChange('RiskNo', e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">หมวดหมู่ความเสี่ยง (Risk Category) *</label>
                      <select
                        value={formData.CategoryID}
                        onChange={(e) => handleChange('CategoryID', e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                      >
                        <option value="">-- เลือก Category --</option>
                        {categories.map((c) => (
                          <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">หน่วยงานที่รับผิดชอบ (Department) *</label>
                      <select
                        value={formData.DepartmentID}
                        onChange={(e) => handleChange('DepartmentID', e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                      >
                        <option value="">-- เลือก Department --</option>
                        {departments.map((d) => (
                          <option key={d.DepartmentID} value={d.DepartmentID}>{d.DepartmentName}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ทรัพย์สิน IT (Asset / System)</label>
                      <select
                        value={formData.AssetID}
                        onChange={(e) => handleChange('AssetID', e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                      >
                        <option value="">-- เลือก Asset --</option>
                        {assets.map((a) => (
                          <option key={a.AssetID} value={a.AssetID}>{a.AssetName} ({a.AssetCode})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">สถานะความเสี่ยง (Status)</label>
                      <select
                        value={formData.Status}
                        onChange={(e) => handleChange('Status', e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800"
                      >
                        <option value="Open">Open (เปิดประเมิน)</option>
                        <option value="In Progress">In Progress (กำลังดำเนินการแก้ไข)</option>
                        <option value="Closed">Closed (ปิดความเสี่ยงเรียบร้อย)</option>
                        <option value="Accepted">Accepted (ยอมรับความเสี่ยงแล้ว)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ภัยคุกคาม (Threat)</label>
                    <input
                      type="text"
                      placeholder="เช่น Hardware Component Ageing, Power Surge"
                      value={formData.Threat}
                      onChange={(e) => handleChange('Threat', e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">จุดอ่อน (Vulnerability)</label>
                    <input
                      type="text"
                      placeholder="เช่น Single Point of Failure (SPOF), Server age > 5 years without warranty"
                      value={formData.Vulnerability}
                      onChange={(e) => handleChange('Vulnerability', e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">สาเหตุความเสี่ยง (Risk Cause)</label>
                      <textarea
                        rows={2}
                        placeholder="ระบุสาเหตุเชิงลึก..."
                        value={formData.RiskCause}
                        onChange={(e) => handleChange('RiskCause', e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ผลกระทบที่อาจเกิดขึ้น (Risk Consequence)</label>
                      <textarea
                        rows={2}
                        placeholder="ระบุผลกระทบต่อกระบวนการผลิต/การส่งมอบให้ลูกค้า..."
                        value={formData.RiskConsequence}
                        onChange={(e) => handleChange('RiskConsequence', e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: INHERENT ASSESSMENT */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-indigo-600 border-b pb-2">
                    Step 02: Inherent Risk Assessment (ก่อนมีมาตรการควบคุม)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Likelihood (1 - 5)</label>
                      <select
                        value={formData.InherentLikelihood}
                        onChange={(e) => handleChange('InherentLikelihood', parseInt(e.target.value, 10))}
                        className="w-full text-sm font-bold p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                      >
                        <option value={1}>L1: Rare (แทบไม่เคยเกิด)</option>
                        <option value={2}>L2: Unlikely (เกิดขึ้นน้อย)</option>
                        <option value={3}>L3: Possible (อาจเกิดได้)</option>
                        <option value={4}>L4: Likely (เกิดขึ้นบ่อย)</option>
                        <option value={5}>L5: Almost Certain (เกิดแน่นอน)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Overall Impact (1 - 5)</label>
                      <select
                        value={formData.InherentImpact}
                        onChange={(e) => handleChange('InherentImpact', parseInt(e.target.value, 10))}
                        className="w-full text-sm font-bold p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                      >
                        <option value={1}>I1: Negligible (น้อยมาก)</option>
                        <option value={2}>I2: Minor (น้อย)</option>
                        <option value={3}>I3: Moderate (ปานกลาง)</option>
                        <option value={4}>I4: Major (สูง)</option>
                        <option value={5}>I5: Catastrophic (วิกฤต/สูงมาก)</option>
                      </select>
                    </div>

                    <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Inherent Risk Score</p>
                      <p className="text-2xl font-extrabold text-slate-900 my-0.5">{inherentScore} pts</p>
                      <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase ${inherentLevel.color}`}>
                        {inherentLevel.name}
                      </span>
                    </div>
                  </div>

                  {/* Specific Impact Dimensions (CIA + Quality) */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div className="bg-slate-50 p-3 rounded-lg border">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Confidentiality (C)</label>
                      <select
                        value={formData.ConfidentialityImpact}
                        onChange={(e) => handleChange('ConfidentialityImpact', parseInt(e.target.value, 10))}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded"
                      >
                        {[1, 2, 3, 4, 5].map((val) => (
                          <option key={val} value={val}>Level {val}</option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Integrity (I)</label>
                      <select
                        value={formData.IntegrityImpact}
                        onChange={(e) => handleChange('IntegrityImpact', parseInt(e.target.value, 10))}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded"
                      >
                        {[1, 2, 3, 4, 5].map((val) => (
                          <option key={val} value={val}>Level {val}</option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Availability (A)</label>
                      <select
                        value={formData.AvailabilityImpact}
                        onChange={(e) => handleChange('AvailabilityImpact', parseInt(e.target.value, 10))}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded"
                      >
                        {[1, 2, 3, 4, 5].map((val) => (
                          <option key={val} value={val}>Level {val}</option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Quality / IATF Impact</label>
                      <select
                        value={formData.QualityImpact}
                        onChange={(e) => handleChange('QualityImpact', parseInt(e.target.value, 10))}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded"
                      >
                        {[1, 2, 3, 4, 5].map((val) => (
                          <option key={val} value={val}>Level {val}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: EXISTING CONTROLS */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-indigo-600 border-b pb-2">
                    Step 03: Existing Controls & Safeguards
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อมาตรการควบคุมที่มีอยู่เดิม (Control Name)</label>
                      <input
                        type="text"
                        placeholder="เช่น Nightly SAP Database Backup & Anti-Virus Execution"
                        value={formData.ControlName}
                        onChange={(e) => handleChange('ControlName', e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ประเภทการควบคุม (Control Type)</label>
                      <select
                        value={formData.ControlType}
                        onChange={(e) => handleChange('ControlType', e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                      >
                        <option value="Preventive">Preventive (ป้องกัน)</option>
                        <option value="Detective">Detective (ตรวจจับ)</option>
                        <option value="Corrective">Corrective (แก้ไข)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ประสิทธิผลของมาตรการ (Effectiveness)</label>
                      <select
                        value={formData.ControlEffectiveness}
                        onChange={(e) => handleChange('ControlEffectiveness', e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                      >
                        <option value="Effective">Effective (มีประสิทธิผลสมบูรณ์)</option>
                        <option value="Partially Effective">Partially Effective (มีประสิทธิผลบางส่วน)</option>
                        <option value="Ineffective">Ineffective (ไม่มีประสิทธิผล)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">หลักฐานการควบคุม (Control Evidence)</label>
                      <input
                        type="text"
                        placeholder="เช่น Daily Backup Execution Log Report"
                        value={formData.ControlEvidence}
                        onChange={(e) => handleChange('ControlEvidence', e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: STANDARD MAPPING */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-indigo-600 border-b pb-2">
                    Step 04: Multi-Standard Compliance Mapping
                  </h3>
                  <p className="text-xs text-slate-500">
                    เลือกมาตรฐานที่ความเสี่ยงนี้มีความเกี่ยวข้อง (สามารถเลือกได้หลายมาตรฐานเพื่อใช้ชุดข้อมูลเดียวกันตอบการ Audit)
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {standards.map((std) => {
                      const isChecked = formData.selectedStandards.includes(std.StandardID);
                      return (
                        <div
                          key={std.StandardID}
                          onClick={() => handleStandardToggle(std.StandardID)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                            isChecked ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{std.StandardName}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{std.Description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 5: TREATMENT ACTION */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-indigo-600 border-b pb-2">
                    Step 05: Risk Treatment & Action Plan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">กลยุทธ์จัดการความเสี่ยง (Treatment Strategy)</label>
                      <select
                        value={formData.TreatmentStrategy}
                        onChange={(e) => handleChange('TreatmentStrategy', e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                      >
                        <option value="Reduce">Reduce / Mitigate (ลดความเสี่ยง)</option>
                        <option value="Avoid">Avoid (หลีกเลี่ยง)</option>
                        <option value="Transfer">Transfer (ถ่ายโอนความเสี่ยง/ประกัน)</option>
                        <option value="Accept">Accept (ยอมรับความเสี่ยง)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ความสำคัญ (Priority)</label>
                      <select
                        value={formData.Priority}
                        onChange={(e) => handleChange('Priority', e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                      >
                        <option value="Urgent">Urgent (ด่วนที่สุด)</option>
                        <option value="High">High (สูง)</option>
                        <option value="Medium">Medium (ปานกลาง)</option>
                        <option value="Low">Low (ต่ำ)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">รายละเอียดแผนการแก้ไข (Action Item Plan)</label>
                    <textarea
                      rows={3}
                      placeholder="เช่น จัดซื้อเครื่อง Server ใหม่ พร้อมติดตั้ง High Availability Replication"
                      value={formData.TreatmentAction}
                      onChange={(e) => handleChange('TreatmentAction', e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ผู้รับผิดชอบ (Action Owner)</label>
                      <input
                        type="text"
                        placeholder="เช่น Somchai Jaidee (IT Manager)"
                        value={formData.ActionOwner}
                        onChange={(e) => handleChange('ActionOwner', e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">กำหนดเสร็จ (Target Date)</label>
                      <input
                        type="date"
                        value={formData.TargetDate}
                        onChange={(e) => handleChange('TargetDate', e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">งบประมาณที่ต้องใช้ (Required Budget THB)</label>
                      <input
                        type="number"
                        value={formData.RequiredBudget}
                        onChange={(e) => handleChange('RequiredBudget', e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: RESIDUAL RISK */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-indigo-600 border-b pb-2">
                    Step 06: Residual Risk Assessment (ประเมินความเสี่ยงคงเหลือหลังมีแผน)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Residual Likelihood (1 - 5)</label>
                      <select
                        value={formData.ResidualLikelihood}
                        onChange={(e) => handleChange('ResidualLikelihood', parseInt(e.target.value, 10))}
                        className="w-full text-sm font-bold p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                      >
                        <option value={1}>L1: Rare</option>
                        <option value={2}>L2: Unlikely</option>
                        <option value={3}>L3: Possible</option>
                        <option value={4}>L4: Likely</option>
                        <option value={5}>L5: Almost Certain</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Residual Impact (1 - 5)</label>
                      <select
                        value={formData.ResidualImpact}
                        onChange={(e) => handleChange('ResidualImpact', parseInt(e.target.value, 10))}
                        className="w-full text-sm font-bold p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                      >
                        <option value={1}>I1: Negligible</option>
                        <option value={2}>I2: Minor</option>
                        <option value={3}>I3: Moderate</option>
                        <option value={4}>I4: Major</option>
                        <option value={5}>I5: Catastrophic</option>
                      </select>
                    </div>

                    <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Residual Risk Score</p>
                      <p className="text-2xl font-extrabold text-slate-900 my-0.5">{residualScore} pts</p>
                      <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase ${residualLevel.color}`}>
                        {residualLevel.name}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: RISK ACCEPTANCE */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-indigo-600 border-b pb-2">
                    Step 07: Risk Acceptance & Approval Sign-off
                  </h3>

                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                    <input
                      type="checkbox"
                      id="acceptanceReq"
                      checked={formData.IsAcceptanceRequired}
                      onChange={(e) => handleChange('IsAcceptanceRequired', e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <label htmlFor="acceptanceReq" className="font-bold cursor-pointer">
                      ต้องได้รับการยอมรับความเสี่ยง (Risk Acceptance Required by Executive / Owner)
                    </label>
                  </div>

                  {formData.IsAcceptanceRequired && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">ผู้อนุมัติยอมรับความเสี่ยง (Accepted By)</label>
                        <input
                          type="text"
                          placeholder="เช่น System Administrator / Managing Director"
                          value={formData.AcceptedBy}
                          onChange={(e) => handleChange('AcceptedBy', e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">วันที่ยอมรับ (Acceptance Date)</label>
                        <input
                          type="date"
                          value={formData.AcceptanceDate}
                          onChange={(e) => handleChange('AcceptanceDate', e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">เหตุผลในการยอมรับความเสี่ยง (Acceptance Reason)</label>
                        <textarea
                          rows={2}
                          placeholder="เช่น ยอมรับความเสี่ยงชั่วคราวในระหว่างดำเนินการจัดซื้อ..."
                          value={formData.AcceptanceReason}
                          onChange={(e) => handleChange('AcceptanceReason', e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex items-center justify-between">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1 || loadingInitial}
            className="px-4 py-2 text-xs font-bold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-30 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-3">
            {currentStep < 7 ? (
              <button
                onClick={() => setCurrentStep((prev) => Math.min(7, prev + 1))}
                disabled={loadingInitial}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm flex items-center gap-1 disabled:opacity-30"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || loadingInitial}
                className="px-6 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md flex items-center gap-1.5 disabled:opacity-30"
              >
                <CheckCircle className="w-4 h-4" /> {editingRiskId ? 'Save Changes' : 'Save Complete Risk Assessment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
