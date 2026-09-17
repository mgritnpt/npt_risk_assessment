const { connectDB, sql } = require('../config/db');

const getDashboardSummary = async (req, res) => {
  try {
    const pool = await connectDB();

    // 1. Overall Summary Stats
    const statsQuery = `
      SELECT 
        COUNT(*) AS totalRisks,
        SUM(CASE WHEN ia.RiskLevel = 'Critical' THEN 1 ELSE 0 END) AS criticalCount,
        SUM(CASE WHEN ia.RiskLevel = 'High' THEN 1 ELSE 0 END) AS highCount,
        SUM(CASE WHEN ia.RiskLevel = 'Medium' THEN 1 ELSE 0 END) AS mediumCount,
        SUM(CASE WHEN ia.RiskLevel = 'Low' THEN 1 ELSE 0 END) AS lowCount,
        SUM(CASE WHEN r.Status = 'Open' THEN 1 ELSE 0 END) AS openCount,
        SUM(CASE WHEN r.Status = 'In Progress' THEN 1 ELSE 0 END) AS inProgressCount,
        SUM(CASE WHEN r.Status = 'Closed' THEN 1 ELSE 0 END) AS closedCount,
        SUM(CASE WHEN r.Status = 'Accepted' THEN 1 ELSE 0 END) AS acceptedCount
      FROM dbo.RiskHeader r WITH (NOLOCK)
      LEFT JOIN dbo.RiskAssessment ia WITH (NOLOCK) ON r.RiskID = ia.RiskID AND ia.AssessmentType = 'INHERENT'
      WHERE r.IsActive = 1;
    `;
    const statsResult = await pool.request().query(statsQuery);
    const stats = statsResult.recordset[0] || {};

    // 2. 5x5 Heatmap Matrix Grid (Likelihood 1..5 x Impact 1..5)
    const matrixQuery = `
      SELECT 
        ia.Likelihood, 
        ia.Impact, 
        COUNT(r.RiskID) AS count
      FROM dbo.RiskHeader r WITH (NOLOCK)
      JOIN dbo.RiskAssessment ia WITH (NOLOCK) ON r.RiskID = ia.RiskID AND ia.AssessmentType = 'INHERENT'
      WHERE r.IsActive = 1
      GROUP BY ia.Likelihood, ia.Impact;
    `;
    const matrixResult = await pool.request().query(matrixQuery);

    // Format 5x5 matrix into 2D array or structured map
    const heatmapGrid = {};
    for (let l = 1; l <= 5; l++) {
      for (let i = 1; i <= 5; i++) {
        heatmapGrid[`${l}_${i}`] = 0;
      }
    }
    matrixResult.recordset.forEach(row => {
      heatmapGrid[`${row.Likelihood}_${row.Impact}`] = row.count;
    });

    // 3. Standard Coverage
    const standardsQuery = `
      SELECT 
        s.StandardCode, s.StandardName,
        COUNT(DISTINCT rsm.RiskID) AS mappedRisksCount
      FROM dbo.Master_Standard s WITH (NOLOCK)
      LEFT JOIN dbo.RiskStandardMapping rsm WITH (NOLOCK) ON s.StandardID = rsm.StandardID
      LEFT JOIN dbo.RiskHeader r WITH (NOLOCK) ON rsm.RiskID = r.RiskID AND r.IsActive = 1
      GROUP BY s.StandardID, s.StandardCode, s.StandardName;
    `;
    const standardsResult = await pool.request().query(standardsQuery);

    // 4. CIA & Quality Distribution
    const ciaQuery = `
      SELECT 
        AVG(CAST(ISNULL(ia.ConfidentialityImpact, 1) AS FLOAT)) AS avgConfidentiality,
        AVG(CAST(ISNULL(ia.IntegrityImpact, 1) AS FLOAT)) AS avgIntegrity,
        AVG(CAST(ISNULL(ia.AvailabilityImpact, 1) AS FLOAT)) AS avgAvailability,
        AVG(CAST(ISNULL(ia.QualityImpact, 1) AS FLOAT)) AS avgQuality,
        AVG(CAST(ISNULL(ia.FinancialImpact, 1) AS FLOAT)) AS avgFinancial
      FROM dbo.RiskHeader r WITH (NOLOCK)
      JOIN dbo.RiskAssessment ia WITH (NOLOCK) ON r.RiskID = ia.RiskID AND ia.AssessmentType = 'INHERENT'
      WHERE r.IsActive = 1;
    `;
    const ciaResult = await pool.request().query(ciaQuery);

    // 5. Department Breakdown
    const deptQuery = `
      SELECT 
        d.DepartmentCode, d.DepartmentName,
        COUNT(r.RiskID) AS totalRisks,
        SUM(CASE WHEN ia.RiskLevel IN ('Critical', 'High') THEN 1 ELSE 0 END) AS highCriticalCount
      FROM dbo.Master_Department d WITH (NOLOCK)
      LEFT JOIN dbo.RiskHeader r WITH (NOLOCK) ON d.DepartmentID = r.DepartmentID AND r.IsActive = 1
      LEFT JOIN dbo.RiskAssessment ia WITH (NOLOCK) ON r.RiskID = ia.RiskID AND ia.AssessmentType = 'INHERENT'
      GROUP BY d.DepartmentID, d.DepartmentCode, d.DepartmentName;
    `;
    const deptResult = await pool.request().query(deptQuery);

    // 6. Top Critical Open Risks
    const topRisksQuery = `
      SELECT TOP 5
        r.RiskID, r.RiskNo, r.RiskTitle, r.Status,
        d.DepartmentName, c.CategoryName,
        ia.Likelihood, ia.Impact, ia.RiskScore, ia.RiskLevel
      FROM dbo.RiskHeader r WITH (NOLOCK)
      LEFT JOIN dbo.Master_Department d WITH (NOLOCK) ON r.DepartmentID = d.DepartmentID
      LEFT JOIN dbo.Master_RiskCategory c WITH (NOLOCK) ON r.CategoryID = c.CategoryID
      LEFT JOIN dbo.RiskAssessment ia WITH (NOLOCK) ON r.RiskID = ia.RiskID AND ia.AssessmentType = 'INHERENT'
      WHERE r.IsActive = 1 AND r.Status IN ('Open', 'In Progress')
      ORDER BY ia.RiskScore DESC, r.RiskID DESC;
    `;
    const topRisksResult = await pool.request().query(topRisksQuery);

    // 7. Overdue Actions
    const overdueQuery = `
      SELECT 
        rta.ActionID, rta.TreatmentAction, rta.ActionOwner, rta.TargetDate, rta.Priority, rta.ProgressPercent,
        r.RiskNo, r.RiskTitle
      FROM dbo.RiskTreatmentAction rta WITH (NOLOCK)
      JOIN dbo.RiskHeader r WITH (NOLOCK) ON rta.RiskID = r.RiskID AND r.IsActive = 1
      WHERE rta.Status <> 'Completed' AND rta.TargetDate < GETDATE();
    `;
    const overdueResult = await pool.request().query(overdueQuery);

    res.json({
      stats: {
        totalRisks: stats.totalRisks || 0,
        criticalCount: stats.criticalCount || 0,
        highCount: stats.highCount || 0,
        mediumCount: stats.mediumCount || 0,
        lowCount: stats.lowCount || 0,
        openCount: stats.openCount || 0,
        inProgressCount: stats.inProgressCount || 0,
        closedCount: stats.closedCount || 0,
        acceptedCount: stats.acceptedCount || 0,
        overdueActionsCount: overdueResult.recordset.length
      },
      heatmapGrid,
      standards: standardsResult.recordset,
      ciaMetrics: ciaResult.recordset[0] || {},
      departmentBreakdown: deptResult.recordset,
      topRisks: topRisksResult.recordset,
      overdueActions: overdueResult.recordset
    });

  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ message: 'Error fetching dashboard summary', error: error.message });
  }
};

module.exports = {
  getDashboardSummary,
};
