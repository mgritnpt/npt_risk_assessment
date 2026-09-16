import * as XLSX from 'xlsx';

export const exportRisksToExcel = (risks = [], dashboardStats = null, filename = 'IT_Risk_Assessment_Report.xlsx') => {
  const wb = XLSX.utils.book_new();

  // 1. RISK REGISTER SHEET DATA
  const registerRows = risks.map((r, idx) => ({
    'No.': idx + 1,
    'Risk ID': r.RiskNo || `IT-R-${r.RiskID}`,
    'Risk Title': r.RiskTitle,
    'Risk Description': r.RiskDescription || '',
    'Category': r.CategoryName || '',
    'Department': r.DepartmentName || '',
    'Process': r.ProcessName || '',
    'Location': r.LocationName || '',
    'Business Unit': r.BUName || '',
    'Asset': r.AssetName || '',
    'Inherent Likelihood (1-5)': r.InherentLikelihood || '-',
    'Inherent Impact (1-5)': r.InherentImpact || '-',
    'Inherent Risk Score': r.InherentScore || '-',
    'Inherent Risk Level': r.InherentLevel || '-',
    'Primary Control': r.PrimaryControlName || '-',
    'Standards Mapped': `${r.StandardMappingCount || 0} Standards`,
    'Residual Likelihood (1-5)': r.ResidualLikelihood || '-',
    'Residual Impact (1-5)': r.ResidualImpact || '-',
    'Residual Risk Score': r.ResidualScore || '-',
    'Residual Risk Level': r.ResidualLevel || '-',
    'Status': r.Status || 'Open',
    'Created Date': r.CreateDate ? r.CreateDate.split('T')[0] : ''
  }));

  const wsRegister = XLSX.utils.json_to_sheet(registerRows);

  // Auto-fit Column Widths for Risk Register Sheet
  const colWidths = [
    { wch: 5 },  // No.
    { wch: 15 }, // Risk ID
    { wch: 40 }, // Risk Title
    { wch: 45 }, // Description
    { wch: 25 }, // Category
    { wch: 25 }, // Dept
    { wch: 25 }, // Process
    { wch: 20 }, // Location
    { wch: 25 }, // BU
    { wch: 25 }, // Asset
    { wch: 12 }, // Inh L
    { wch: 12 }, // Inh I
    { wch: 18 }, // Inh Score
    { wch: 18 }, // Inh Level
    { wch: 30 }, // Control
    { wch: 18 }, // Standards
    { wch: 12 }, // Res L
    { wch: 12 }, // Res I
    { wch: 18 }, // Res Score
    { wch: 18 }, // Res Level
    { wch: 12 }, // Status
    { wch: 14 }  // Date
  ];
  wsRegister['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, wsRegister, 'Risk_Register');

  // 2. EXECUTIVE SUMMARY SHEET
  if (dashboardStats && dashboardStats.stats) {
    const s = dashboardStats.stats;
    const summaryRows = [
      { 'KPI Metric': 'Total Assessed Risks', 'Value': s.totalRisks },
      { 'KPI Metric': 'Critical Risks (Score 15-25)', 'Value': s.criticalCount },
      { 'KPI Metric': 'High Risks (Score 10-14)', 'Value': s.highCount },
      { 'KPI Metric': 'Medium Risks (Score 5-9)', 'Value': s.mediumCount },
      { 'KPI Metric': 'Low Risks (Score 1-4)', 'Value': s.lowCount },
      { 'KPI Metric': 'Open Status', 'Value': s.openCount },
      { 'KPI Metric': 'In Progress Status', 'Value': s.inProgressCount },
      { 'KPI Metric': 'Closed / Mitigated Status', 'Value': s.closedCount },
      { 'KPI Metric': 'Overdue Treatment Actions', 'Value': s.overdueActionsCount },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    wsSummary['!cols'] = [{ wch: 35 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive_Summary');
  }

  // 3. MASTER EVALUATION MATRIX SHEET
  const criteriaRows = [
    { 'Score': 1, 'Likelihood Level': 'L1: Rare (แทบไม่เคยเกิด)', 'Impact Level': 'I1: Negligible (น้อยมาก < 50k THB)' },
    { 'Score': 2, 'Likelihood Level': 'L2: Unlikely (เกิดขึ้นน้อย)', 'Impact Level': 'I2: Minor (น้อย 50k-200k THB)' },
    { 'Score': 3, 'Likelihood Level': 'L3: Possible (อาจเกิดได้)', 'Impact Level': 'I3: Moderate (ปานกลาง 200k-1M THB)' },
    { 'Score': 4, 'Likelihood Level': 'L4: Likely (เกิดขึ้นบ่อย)', 'Impact Level': 'I4: Major (สูง 1M-5M THB)' },
    { 'Score': 5, 'Likelihood Level': 'L5: Almost Certain (เกิดแน่นอน)', 'Impact Level': 'I5: Catastrophic (วิกฤต/สูงมาก > 5M THB)' },
  ];
  const wsCriteria = XLSX.utils.json_to_sheet(criteriaRows);
  wsCriteria['!cols'] = [{ wch: 8 }, { wch: 35 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, wsCriteria, 'Risk_Criteria');

  // Trigger Excel File Download in Browser
  XLSX.writeFile(wb, filename);
};
