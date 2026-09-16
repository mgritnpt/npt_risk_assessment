import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import RiskRegisterView from './components/RiskRegisterView';
import MasterDataView from './components/MasterDataView';
import CreateRiskModal from './components/CreateRiskModal';
import RiskDetailModal from './components/RiskDetailModal';

import {
  getDashboardSummary,
  getRisks,
  getMasterCategories,
  getMasterDepartments,
  getMasterStandards,
  getMasterAssets,
  getMasterLocations,
  getMasterBUs,
} from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Matrix Filter State
  const [activeMatrixCell, setActiveMatrixCell] = useState(null);

  // App Data State
  const [dashboardData, setDashboardData] = useState(null);
  const [risks, setRisks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [standards, setStandards] = useState([]);
  const [assets, setAssets] = useState([]);
  const [locations, setLocations] = useState([]);
  const [bus, setBUs] = useState([]);

  // Modals State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRiskId, setEditingRiskId] = useState(null);
  const [selectedRiskId, setSelectedRiskId] = useState(null);

  const fetchAllData = async () => {
    try {
      const [dashRes, risksRes, catRes, deptRes, stdRes, assetRes, locRes, buRes] = await Promise.all([
        getDashboardSummary(),
        getRisks(),
        getMasterCategories(),
        getMasterDepartments(),
        getMasterStandards(),
        getMasterAssets(),
        getMasterLocations(),
        getMasterBUs(),
      ]);

      setDashboardData(dashRes);
      setRisks(risksRes);
      setCategories(catRes);
      setDepartments(deptRes);
      setStandards(stdRes);
      setAssets(assetRes);
      setLocations(locRes);
      setBUs(buRes);
    } catch (err) {
      console.error('Error loading application data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Heatmap Matrix Cell Click Handler: Filters risks & switches to Register view
  const handleHeatmapCellClick = (l, i) => {
    if (l === null || i === null) {
      setActiveMatrixCell(null);
    } else {
      setActiveMatrixCell({ l, i });
      setCurrentTab('register');
    }
  };

  const handleOpenCreate = () => {
    setEditingRiskId(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (id) => {
    setEditingRiskId(id);
    setIsCreateOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenCreateModal={handleOpenCreate}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            dashboardData={dashboardData}
            onSelectRisk={(id) => setSelectedRiskId(id)}
            activeMatrixCell={activeMatrixCell}
            onHeatmapCellClick={handleHeatmapCellClick}
          />
        )}

        {currentTab === 'register' && (
          <RiskRegisterView
            risks={risks}
            categories={categories}
            departments={departments}
            activeMatrixCell={activeMatrixCell}
            onClearMatrixFilter={() => setActiveMatrixCell(null)}
            onSelectRisk={(id) => setSelectedRiskId(id)}
            onEditRisk={handleOpenEdit}
            onOpenCreateModal={handleOpenCreate}
            onRefresh={fetchAllData}
          />
        )}

        {currentTab === 'master' && (
          <MasterDataView />
        )}
      </main>

      {/* Modals */}
      <CreateRiskModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingRiskId(null);
        }}
        editingRiskId={editingRiskId}
        categories={categories}
        departments={departments}
        standards={standards}
        assets={assets}
        locations={locations}
        bus={bus}
        onCreated={fetchAllData}
      />

      <RiskDetailModal
        riskId={selectedRiskId}
        onClose={() => setSelectedRiskId(null)}
        onEditRisk={handleOpenEdit}
      />
    </div>
  );
}
