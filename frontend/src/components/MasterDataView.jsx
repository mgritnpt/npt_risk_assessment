import React, { useState, useEffect } from 'react';
import {
  Settings, Save, Plus, Trash2, Edit2, Building2, Server, MapPin, Briefcase, FileCheck, Layers, ShieldCheck, History, X
} from 'lucide-react';
import {
  getMasterLikelihoods,
  updateMasterLikelihood,
  deleteMasterLikelihood,
  getMasterImpacts,
  updateMasterImpact,
  deleteMasterImpact,
  getMasterCategories,
  createMasterCategory,
  updateMasterCategory,
  deleteMasterCategory,
  getMasterDepartments,
  createMasterDepartment,
  updateMasterDepartment,
  deleteMasterDepartment,
  getMasterProcesses,
  createMasterProcess,
  updateMasterProcess,
  deleteMasterProcess,
  getMasterAssets,
  createMasterAsset,
  updateMasterAsset,
  deleteMasterAsset,
  getMasterLocations,
  createMasterLocation,
  updateMasterLocation,
  deleteMasterLocation,
  getMasterBUs,
  createMasterBU,
  updateMasterBU,
  deleteMasterBU,
  getMasterStandards,
  createMasterStandard,
  updateMasterStandard,
  deleteMasterStandard,
  getMasterClauses,
  createMasterClause,
  updateMasterClause,
  deleteMasterClause,
  getAuditLogs
} from '../services/api';

export default function MasterDataView() {
  const [activeTab, setActiveTab] = useState('likelihood');

  // Master Data States
  const [likelihoods, setLikelihoods] = useState([]);
  const [impacts, setImpacts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [assets, setAssets] = useState([]);
  const [locations, setLocations] = useState([]);
  const [bus, setBUs] = useState([]);
  const [standards, setStandards] = useState([]);
  const [clauses, setClauses] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Editing state for Likelihood & Impact
  const [editingL, setEditingL] = useState(null);
  const [editingI, setEditingI] = useState(null);

  // New Item States
  const [newCat, setNewCat] = useState({ CategoryCode: '', CategoryName: '', Description: '' });
  const [newDept, setNewDept] = useState({ DepartmentCode: '', DepartmentName: '', ManagerName: '' });
  const [newProc, setNewProc] = useState({ ProcessCode: '', ProcessName: '', DepartmentID: '' });
  const [newAsset, setNewAsset] = useState({ AssetCode: '', AssetName: '', Category: 'Infrastructure', OwnerName: '' });
  const [newLoc, setNewLoc] = useState({ LocationCode: '', LocationName: '', Description: '' });
  const [newBU, setNewBU] = useState({ BUCode: '', BUName: '', Description: '' });
  const [newStd, setNewStd] = useState({ StandardCode: '', StandardName: '', Description: '' });
  const [newClause, setNewClause] = useState({ StandardID: '', ClauseNo: '', ClauseTitle: '', Description: '' });

  const loadAllMaster = async () => {
    try {
      const [lRes, iRes, cRes, dRes, pRes, aRes, locRes, buRes, sRes, clRes, logRes] = await Promise.all([
        getMasterLikelihoods(),
        getMasterImpacts(),
        getMasterCategories(),
        getMasterDepartments(),
        getMasterProcesses(),
        getMasterAssets(),
        getMasterLocations(),
        getMasterBUs(),
        getMasterStandards(),
        getMasterClauses(),
        getAuditLogs()
      ]);

      setLikelihoods(lRes || []);
      setImpacts(iRes || []);
      setCategories(cRes || []);
      setDepartments(dRes || []);
      setProcesses(pRes || []);
      setAssets(aRes || []);
      setLocations(locRes || []);
      setBUs(buRes || []);
      setStandards(sRes || []);
      setClauses(clRes || []);
      setAuditLogs(logRes || []);
    } catch (err) {
      console.error('Error loading master data:', err);
    }
  };

  useEffect(() => {
    loadAllMaster();
  }, []);

  // Likelihood Handlers
  const handleSaveLikelihood = async (item) => {
    try {
      const id = item.LikelihoodCriteriaID || item.LikelihoodID;
      if (!id) {
        alert('ไม่พบ ID สำหรับบันทึก Likelihood');
        return;
      }
      await updateMasterLikelihood(id, item);
      alert('บันทึกเกณฑ์ Likelihood สำเร็จ!');
      setEditingL(null);
      loadAllMaster();
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  // Impact Handlers
  const handleSaveImpact = async (item) => {
    try {
      const id = item.ImpactCriteriaID || item.ImpactID;
      if (!id) {
        alert('ไม่พบ ID สำหรับบันทึก Impact');
        return;
      }
      await updateMasterImpact(id, item);
      alert('บันทึกเกณฑ์ Impact สำเร็จ!');
      setEditingI(null);
      loadAllMaster();
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  // Category Handlers
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCat.CategoryCode || !newCat.CategoryName) {
      alert('กรุณากรอก Code และ Name ให้ครบถ้วน');
      return;
    }
    try {
      await createMasterCategory(newCat);
      setNewCat({ CategoryCode: '', CategoryName: '', Description: '' });
      loadAllMaster();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการสร้าง Category: ' + err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!id) {
      alert('ไม่พบ ID สำหรับลบ Category');
      return;
    }
    if (!window.confirm('คุณต้องการลบ Category นี้ใช่หรือไม่?')) return;
    try {
      await deleteMasterCategory(id);
      loadAllMaster();
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  // Department Handlers
  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!newDept.DepartmentCode || !newDept.DepartmentName) {
      alert('กรุณากรอก Department Code และ Name');
      return;
    }
    try {
      await createMasterDepartment(newDept);
      setNewDept({ DepartmentCode: '', DepartmentName: '', ManagerName: '' });
      loadAllMaster();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการสร้าง Department: ' + err.message);
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!id) {
      alert('ไม่พบ ID สำหรับลบ Department');
      return;
    }
    if (!window.confirm('คุณต้องการลบ Department นี้ใช่หรือไม่?')) return;
    try {
      await deleteMasterDepartment(id);
      loadAllMaster();
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  // Process Handlers
  const handleCreateProcess = async (e) => {
    e.preventDefault();
    if (!newProc.ProcessCode || !newProc.ProcessName) {
      alert('กรุณากรอก Process Code และ Name');
      return;
    }
    try {
      await createMasterProcess({
        ...newProc,
        DepartmentID: newProc.DepartmentID ? parseInt(newProc.DepartmentID, 10) : null
      });
      setNewProc({ ProcessCode: '', ProcessName: '', DepartmentID: '' });
      loadAllMaster();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการสร้าง Process: ' + err.message);
    }
  };

  const handleDeleteProcess = async (id) => {
    if (!id) {
      alert('ไม่พบ ID สำหรับลบ Process');
      return;
    }
    if (!window.confirm('คุณต้องการลบ Process นี้ใช่หรือไม่?')) return;
    try {
      await deleteMasterProcess(id);
      loadAllMaster();
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  // Asset Handlers
  const handleCreateAsset = async (e) => {
    e.preventDefault();
    if (!newAsset.AssetCode || !newAsset.AssetName) {
      alert('กรุณากรอก Asset Code และ Name');
      return;
    }
    try {
      await createMasterAsset(newAsset);
      setNewAsset({ AssetCode: '', AssetName: '', Category: 'Infrastructure', OwnerName: '' });
      loadAllMaster();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการสร้าง Asset: ' + err.message);
    }
  };

  const handleDeleteAsset = async (id) => {
    if (!id) {
      alert('ไม่พบ ID สำหรับลบ Asset');
      return;
    }
    if (!window.confirm('คุณต้องการลบ Asset นี้ใช่หรือไม่?')) return;
    try {
      await deleteMasterAsset(id);
      loadAllMaster();
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  // Location Handlers
  const handleCreateLocation = async (e) => {
    e.preventDefault();
    if (!newLoc.LocationCode || !newLoc.LocationName) {
      alert('กรุณากรอก Location Code และ Name');
      return;
    }
    try {
      await createMasterLocation(newLoc);
      setNewLoc({ LocationCode: '', LocationName: '', Description: '' });
      loadAllMaster();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการสร้าง Location: ' + err.message);
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!id) {
      alert('ไม่พบ ID สำหรับลบ Location');
      return;
    }
    if (!window.confirm('คุณต้องการลบ Location นี้ใช่หรือไม่?')) return;
    try {
      await deleteMasterLocation(id);
      loadAllMaster();
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  // Business Unit Handlers
  const handleCreateBU = async (e) => {
    e.preventDefault();
    if (!newBU.BUCode || !newBU.BUName) {
      alert('กรุณากรอก BU Code และ Name');
      return;
    }
    try {
      await createMasterBU(newBU);
      setNewBU({ BUCode: '', BUName: '', Description: '' });
      loadAllMaster();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการสร้าง Business Unit: ' + err.message);
    }
  };

  const handleDeleteBU = async (id) => {
    if (!id) {
      alert('ไม่พบ ID สำหรับลบ Business Unit');
      return;
    }
    if (!window.confirm('คุณต้องการลบ Business Unit นี้ใช่หรือไม่?')) return;
    try {
      await deleteMasterBU(id);
      loadAllMaster();
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  // Standard Handlers
  const handleCreateStandard = async (e) => {
    e.preventDefault();
    if (!newStd.StandardCode || !newStd.StandardName) {
      alert('กรุณากรอก Standard Code และ Name');
      return;
    }
    try {
      await createMasterStandard(newStd);
      setNewStd({ StandardCode: '', StandardName: '', Description: '' });
      loadAllMaster();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการสร้าง Standard: ' + err.message);
    }
  };

  const handleDeleteStandard = async (id) => {
    if (!id) {
      alert('ไม่พบ ID สำหรับลบ Standard');
      return;
    }
    if (!window.confirm('คุณต้องการลบ Standard นี้ใช่หรือไม่?')) return;
    try {
      await deleteMasterStandard(id);
      loadAllMaster();
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  // Clause Handlers
  const handleCreateClause = async (e) => {
    e.preventDefault();
    if (!newClause.StandardID || !newClause.ClauseNo || !newClause.ClauseTitle) {
      alert('กรุณากรอก Standard, Clause No และ Clause Title');
      return;
    }
    try {
      await createMasterClause({
        ...newClause,
        StandardID: parseInt(newClause.StandardID, 10)
      });
      setNewClause({ StandardID: '', ClauseNo: '', ClauseTitle: '', Description: '' });
      loadAllMaster();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการสร้าง Clause: ' + err.message);
    }
  };

  const handleDeleteClause = async (id) => {
    if (!id) {
      alert('ไม่พบ ID สำหรับลบ Clause');
      return;
    }
    if (!window.confirm('คุณต้องการลบ Clause นี้ใช่หรือไม่?')) return;
    try {
      await deleteMasterClause(id);
      loadAllMaster();
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Studio Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            Master Data & Evaluation Criteria Studio
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ปรับแต่งเกณฑ์ Likelihood (L1-L5), Impact (I1-I5 CIA/Quality), Categories, Organizations, Standards และดู Audit Logs
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm flex flex-wrap gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('likelihood')}
          aria-current={activeTab === 'likelihood' ? 'page' : undefined}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'likelihood' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Likelihood Criteria (L1-L5)
        </button>
        <button
          onClick={() => setActiveTab('impact')}
          aria-current={activeTab === 'impact' ? 'page' : undefined}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'impact' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Impact Criteria (I1-I5 CIA)
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          aria-current={activeTab === 'categories' ? 'page' : undefined}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'categories' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Risk Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('org')}
          aria-current={activeTab === 'org' ? 'page' : undefined}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'org' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Depts & Processes ({departments.length}/{processes.length})
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          aria-current={activeTab === 'assets' ? 'page' : undefined}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'assets' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Assets, Locations & BUs ({assets.length}/{locations.length}/{bus.length})
        </button>
        <button
          onClick={() => setActiveTab('standards')}
          aria-current={activeTab === 'standards' ? 'page' : undefined}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'standards' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Standards & Clauses ({standards.length}/{clauses.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          aria-current={activeTab === 'audit' ? 'page' : undefined}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'audit' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* TAB CONTENT 1: LIKELIHOOD CRITERIA */}
      {activeTab === 'likelihood' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase">Likelihood Evaluation Criteria (L1 to L5)</h3>
          <div className="space-y-4">
            {likelihoods.map((item) => {
              const itemId = item.LikelihoodCriteriaID || item.LikelihoodID;
              const isEditing = editingL && (editingL.LikelihoodCriteriaID || editingL.LikelihoodID) === itemId;
              return (
                <div key={itemId} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm">
                        L{item.LikelihoodScore}
                      </span>
                      <span className="font-bold text-sm text-slate-900">{item.LevelName} ({item.LevelNameTH})</span>
                    </div>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveLikelihood(editingL)}
                          className="bg-emerald-600 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1 hover:bg-emerald-700"
                        >
                          <Save className="w-3.5 h-3.5" /> Save Changes
                        </button>
                        <button
                          onClick={() => setEditingL(null)}
                          className="bg-slate-300 text-slate-700 px-2 py-1 rounded text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingL(item)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1 rounded text-xs font-bold flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit Criteria
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 pt-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500">Definition (คำนิยาม)</label>
                        <input
                          type="text"
                          value={editingL.Definition || ''}
                          onChange={(e) => setEditingL({ ...editingL, Definition: e.target.value })}
                          className="w-full text-xs p-2 border rounded bg-white"
                          placeholder="Definition..."
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500">Frequency (ความถี่การเกิด)</label>
                        <input
                          type="text"
                          value={editingL.FrequencyDescription || ''}
                          onChange={(e) => setEditingL({ ...editingL, FrequencyDescription: e.target.value })}
                          className="w-full text-xs p-2 border rounded bg-white"
                          placeholder="Frequency..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600 space-y-1">
                      <p><strong>Definition:</strong> {item.Definition}</p>
                      <p className="text-slate-500"><strong>Frequency:</strong> {item.FrequencyDescription}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: IMPACT CRITERIA */}
      {activeTab === 'impact' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase">Impact Evaluation Criteria (I1 to I5 CIA & Overall)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Level Name</th>
                  <th className="py-2.5 px-3">Definition</th>
                  <th className="py-2.5 px-3">Financial / Operational Impact</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {impacts.map((item) => {
                  const itemId = item.ImpactCriteriaID || item.ImpactID;
                  const isEditing = editingI && (editingI.ImpactCriteriaID || editingI.ImpactID) === itemId;
                  return (
                    <tr key={itemId} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-indigo-700">{item.ImpactCategory}</td>
                      <td className="py-3 px-3 font-mono font-bold">I{item.ImpactScore}</td>
                      <td className="py-3 px-3 font-medium text-slate-900">{item.LevelName} ({item.LevelNameTH})</td>
                      <td className="py-3 px-3 max-w-xs">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingI.Definition || ''}
                            onChange={(e) => setEditingI({ ...editingI, Definition: e.target.value })}
                            className="w-full text-xs p-1 border rounded"
                          />
                        ) : (
                          item.Definition
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500 max-w-xs">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingI.FinancialThreshold || editingI.OperationalImpact || ''}
                            onChange={(e) => setEditingI({ ...editingI, FinancialThreshold: e.target.value, OperationalImpact: e.target.value })}
                            className="w-full text-xs p-1 border rounded"
                          />
                        ) : (
                          item.FinancialThreshold || item.OperationalImpact || '-'
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleSaveImpact(editingI)}
                              className="bg-emerald-600 text-white px-2 py-1 rounded text-[11px] font-bold"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingI(null)}
                              className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingI(item)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded text-[11px] font-bold"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase">Risk Categories List</h3>
          </div>

          {/* Form to add new Category */}
          <form onSubmit={handleCreateCategory} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Code *</label>
              <input
                type="text"
                required
                placeholder="เช่น CLOUD"
                value={newCat.CategoryCode}
                onChange={(e) => setNewCat({ ...newCat, CategoryCode: e.target.value })}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded"
              />
            </div>
            <div className="flex-2 min-w-[200px]">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Category Name *</label>
              <input
                type="text"
                required
                placeholder="เช่น Cloud & SaaS Security"
                value={newCat.CategoryName}
                onChange={(e) => setNewCat({ ...newCat, CategoryName: e.target.value })}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded"
              />
            </div>
            <div className="flex-3 min-w-[250px]">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Description</label>
              <input
                type="text"
                placeholder="คำอธิบาย..."
                value={newCat.Description}
                onChange={(e) => setNewCat({ ...newCat, Description: e.target.value })}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((c) => {
              const catId = c.CategoryID || c.RiskCategoryID;
              return (
                <div key={catId} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {c.CategoryCode}
                    </span>
                    <p className="font-bold text-slate-900 text-xs mt-1.5">{c.CategoryName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{c.Description || '-'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(catId)}
                    className="text-slate-400 hover:text-red-600 p-1"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: DEPARTMENTS & PROCESSES */}
      {activeTab === 'org' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DEPARTMENTS SECTION */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase">Departments ({departments.length})</h3>

            <form onSubmit={handleCreateDepartment} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Dept Code (เช่น IT)"
                  value={newDept.DepartmentCode}
                  onChange={(e) => setNewDept({ ...newDept, DepartmentCode: e.target.value })}
                  className="text-xs p-2 bg-white border rounded"
                />
                <input
                  type="text"
                  required
                  placeholder="Dept Name (เช่น Information Tech)"
                  value={newDept.DepartmentName}
                  onChange={(e) => setNewDept({ ...newDept, DepartmentName: e.target.value })}
                  className="text-xs p-2 bg-white border rounded"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Manager Name"
                  value={newDept.ManagerName}
                  onChange={(e) => setNewDept({ ...newDept, ManagerName: e.target.value })}
                  className="text-xs p-2 bg-white border rounded flex-1"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {departments.map((d) => (
                <div key={d.DepartmentID} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{d.DepartmentName} ({d.DepartmentCode})</p>
                    <p className="text-[11px] text-slate-500">Manager: {d.ManagerName || '-'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteDepartment(d.DepartmentID)}
                    className="text-slate-400 hover:text-red-600 p-1"
                    title="Delete Department"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* PROCESSES SECTION */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase">Processes ({processes.length})</h3>

            <form onSubmit={handleCreateProcess} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Proc Code (เช่น PROC-IT-01)"
                  value={newProc.ProcessCode}
                  onChange={(e) => setNewProc({ ...newProc, ProcessCode: e.target.value })}
                  className="text-xs p-2 bg-white border rounded"
                />
                <input
                  type="text"
                  required
                  placeholder="Proc Name (เช่น Backup & Restore)"
                  value={newProc.ProcessName}
                  onChange={(e) => setNewProc({ ...newProc, ProcessName: e.target.value })}
                  className="text-xs p-2 bg-white border rounded"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={newProc.DepartmentID}
                  onChange={(e) => setNewProc({ ...newProc, DepartmentID: e.target.value })}
                  className="text-xs p-2 bg-white border rounded flex-1"
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((d) => (
                    <option key={d.DepartmentID} value={d.DepartmentID}>
                      {d.DepartmentName} ({d.DepartmentCode})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {processes.map((p) => (
                <div key={p.ProcessID} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{p.ProcessName} ({p.ProcessCode})</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Dept: {p.DepartmentName || '-'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteProcess(p.ProcessID)}
                    className="text-slate-400 hover:text-red-600 p-1"
                    title="Delete Process"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: ASSETS, LOCATIONS, BUs */}
      {activeTab === 'assets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ASSETS SECTION */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase">Assets ({assets.length})</h3>

            <form onSubmit={handleCreateAsset} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <input
                type="text"
                required
                placeholder="Asset Code (เช่น AST-SAP-01)"
                value={newAsset.AssetCode}
                onChange={(e) => setNewAsset({ ...newAsset, AssetCode: e.target.value })}
                className="w-full text-xs p-2 bg-white border rounded"
              />
              <input
                type="text"
                required
                placeholder="Asset Name (เช่น SAP Production App)"
                value={newAsset.AssetName}
                onChange={(e) => setNewAsset({ ...newAsset, AssetName: e.target.value })}
                className="w-full text-xs p-2 bg-white border rounded"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Owner Name"
                  value={newAsset.OwnerName}
                  onChange={(e) => setNewAsset({ ...newAsset, OwnerName: e.target.value })}
                  className="text-xs p-2 bg-white border rounded flex-1"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </form>

            <div className="space-y-2 text-xs">
              {assets.map((a) => (
                <div key={a.AssetID} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{a.AssetName}</p>
                    <p className="text-[10px] text-slate-500">Code: {a.AssetCode} | Owner: {a.OwnerName || '-'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAsset(a.AssetID)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* LOCATIONS SECTION */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase">Locations ({locations.length})</h3>

            <form onSubmit={handleCreateLocation} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <input
                type="text"
                required
                placeholder="Location Code (เช่น BKK-HQ)"
                value={newLoc.LocationCode}
                onChange={(e) => setNewLoc({ ...newLoc, LocationCode: e.target.value })}
                className="w-full text-xs p-2 bg-white border rounded"
              />
              <input
                type="text"
                required
                placeholder="Location Name (เช่น สำนักงานใหญ่)"
                value={newLoc.LocationName}
                onChange={(e) => setNewLoc({ ...newLoc, LocationName: e.target.value })}
                className="w-full text-xs p-2 bg-white border rounded"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Description"
                  value={newLoc.Description}
                  onChange={(e) => setNewLoc({ ...newLoc, Description: e.target.value })}
                  className="text-xs p-2 bg-white border rounded flex-1"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </form>

            <div className="space-y-2 text-xs">
              {locations.map((loc) => (
                <div key={loc.LocationID} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{loc.LocationName} ({loc.LocationCode})</p>
                    <p className="text-[10px] text-slate-500">{loc.Description || '-'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteLocation(loc.LocationID)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* BUSINESS UNITS SECTION */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase">Business Units ({bus.length})</h3>

            <form onSubmit={handleCreateBU} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <input
                type="text"
                required
                placeholder="BU Code (เช่น AUTO)"
                value={newBU.BUCode}
                onChange={(e) => setNewBU({ ...newBU, BUCode: e.target.value })}
                className="w-full text-xs p-2 bg-white border rounded"
              />
              <input
                type="text"
                required
                placeholder="BU Name (เช่น Automotive Coatings)"
                value={newBU.BUName}
                onChange={(e) => setNewBU({ ...newBU, BUName: e.target.value })}
                className="w-full text-xs p-2 bg-white border rounded"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Description"
                  value={newBU.Description}
                  onChange={(e) => setNewBU({ ...newBU, Description: e.target.value })}
                  className="text-xs p-2 bg-white border rounded flex-1"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </form>

            <div className="space-y-2 text-xs">
              {bus.map((b) => (
                <div key={b.BUID} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{b.BUName} ({b.BUCode})</p>
                    <p className="text-[10px] text-slate-500">{b.Description || '-'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteBU(b.BUID)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: STANDARDS & CLAUSES */}
      {activeTab === 'standards' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase">Standards & Clauses Framework</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ADD STANDARD FORM */}
            <form onSubmit={handleCreateStandard} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase">Add New Standard</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Code (เช่น ISO-27001)"
                  value={newStd.StandardCode}
                  onChange={(e) => setNewStd({ ...newStd, StandardCode: e.target.value })}
                  className="text-xs p-2 bg-white border rounded"
                />
                <input
                  type="text"
                  required
                  placeholder="Standard Name"
                  value={newStd.StandardName}
                  onChange={(e) => setNewStd({ ...newStd, StandardName: e.target.value })}
                  className="text-xs p-2 bg-white border rounded"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Description"
                  value={newStd.Description}
                  onChange={(e) => setNewStd({ ...newStd, Description: e.target.value })}
                  className="text-xs p-2 bg-white border rounded flex-1"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Standard
                </button>
              </div>
            </form>

            {/* ADD CLAUSE FORM */}
            <form onSubmit={handleCreateClause} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase">Add New Standard Clause</h4>
              <div className="grid grid-cols-3 gap-2">
                <select
                  required
                  value={newClause.StandardID}
                  onChange={(e) => setNewClause({ ...newClause, StandardID: e.target.value })}
                  className="text-xs p-2 bg-white border rounded"
                >
                  <option value="">-- Standard --</option>
                  {standards.map((s) => (
                    <option key={s.StandardID} value={s.StandardID}>
                      {s.StandardCode}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  placeholder="Clause No (เช่น A.5.1)"
                  value={newClause.ClauseNo}
                  onChange={(e) => setNewClause({ ...newClause, ClauseNo: e.target.value })}
                  className="text-xs p-2 bg-white border rounded"
                />
                <input
                  type="text"
                  required
                  placeholder="Clause Title"
                  value={newClause.ClauseTitle}
                  onChange={(e) => setNewClause({ ...newClause, ClauseTitle: e.target.value })}
                  className="text-xs p-2 bg-white border rounded"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Clause Description"
                  value={newClause.Description}
                  onChange={(e) => setNewClause({ ...newClause, Description: e.target.value })}
                  className="text-xs p-2 bg-white border rounded flex-1"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Clause
                </button>
              </div>
            </form>
          </div>

          {/* STANDARDS & CLAUSES LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {standards.map((s) => {
              const sClauses = clauses.filter((c) => c.StandardID === s.StandardID);
              return (
                <div key={s.StandardID} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-indigo-600 text-white px-2 py-0.5 rounded">
                        {s.StandardCode}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{s.StandardName}</h4>
                    </div>
                    <button
                      onClick={() => handleDeleteStandard(s.StandardID)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Delete Standard"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">{s.Description}</p>

                  <div className="pt-2 space-y-1">
                    <p className="text-[11px] font-bold text-slate-700">Clauses ({sClauses.length}):</p>
                    {sClauses.map((c) => (
                      <div key={c.ClauseID} className="p-2 bg-white rounded border text-xs flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-indigo-700 mr-2">{c.ClauseNo}</span>
                          <span className="font-medium text-slate-800">{c.ClauseTitle}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteClause(c.ClauseID)}
                          className="text-slate-300 hover:text-red-600 p-0.5"
                          title="Delete Clause"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 7: AUDIT LOGS HISTORY */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase">System Audit Log History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Log ID</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Table</th>
                  <th className="py-2.5 px-3">Record ID</th>
                  <th className="py-2.5 px-3">New Value Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.LogID} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">#{log.LogID}</td>
                    <td className="py-2.5 px-3 text-slate-500">{log.CreateDate ? log.CreateDate.replace('T', ' ').substring(0, 19) : '-'}</td>
                    <td className="py-2.5 px-3 text-indigo-600 font-bold">{log.UserID}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.Action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                        log.Action === 'UPDATE' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.Action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{log.TableName}</td>
                    <td className="py-2.5 px-3">{log.RecordID}</td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-slate-500">{log.NewValue || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
