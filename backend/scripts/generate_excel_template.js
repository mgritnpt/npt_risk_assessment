const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

/**
 * Script to generate Master_Data_Template.xlsx
 * Provides ready-to-fill sheets for importing Master Data and Risks into SQL Server.
 */
function generateTemplate() {
  const wb = XLSX.utils.book_new();

  // 1. BusinessUnits
  const buData = [
    { BUCode: 'BU-EX-01', BUName: 'Business Unit ตัวอย่าง 1', Description: 'คำอธิบาย BU' },
    { BUCode: 'BU-EX-02', BUName: 'Business Unit ตัวอย่าง 2', Description: 'คำอธิบาย BU 2' },
  ];
  const wsBU = XLSX.utils.json_to_sheet(buData);
  XLSX.utils.book_append_sheet(wb, wsBU, 'BusinessUnits');

  // 2. Departments
  const deptData = [
    { DepartmentCode: 'DEPT-EX-01', DepartmentName: 'แผนกวิจัยนวัตกรรม', BUCode: 'BU-EX-01', ManagerName: 'คุณสมชาย', Description: 'แผนกวิจัย' },
    { DepartmentCode: 'DEPT-EX-02', DepartmentName: 'ฝ่ายประกันคุณภาพสี', BUCode: 'BU-EX-02', ManagerName: 'คุณกัญญา', Description: 'แผนก QA' },
  ];
  const wsDept = XLSX.utils.json_to_sheet(deptData);
  XLSX.utils.book_append_sheet(wb, wsDept, 'Departments');

  // 3. Users
  const userData = [
    { Username: 'user.ex01', FullName: 'สมชาย รักดี', Email: 'somchai@company.com', Role: 'Risk Owner', DepartmentCode: 'DEPT-EX-01' },
    { Username: 'user.ex02', FullName: 'กัญญา สุขใจ', Email: 'kanya@company.com', Role: 'Auditor', DepartmentCode: 'DEPT-EX-02' },
  ];
  const wsUser = XLSX.utils.json_to_sheet(userData);
  XLSX.utils.book_append_sheet(wb, wsUser, 'Users');

  // 4. Locations
  const locData = [
    { LocationCode: 'LOC-EX-01', LocationName: 'โรงงานบางปู', Description: 'ศูนย์การผลิตและทดสอบ' },
    { LocationCode: 'LOC-EX-02', LocationName: 'อาคารสำนักงานใหญ่', Description: 'สำนักงานกลาง' },
  ];
  const wsLoc = XLSX.utils.json_to_sheet(locData);
  XLSX.utils.book_append_sheet(wb, wsLoc, 'Locations');

  // 5. Processes
  const procData = [
    { ProcessCode: 'PROC-EX-01', ProcessName: 'ระบบควบคุมการผสมสีอัตโนมัติ', DepartmentCode: 'DEPT-EX-01', Description: 'กระบวนการผสมสี', IsCritical: 1 },
    { ProcessCode: 'PROC-EX-02', ProcessName: 'ระบบออกใบเสร็จและใบกำกับภาษี', DepartmentCode: 'DEPT-EX-02', Description: 'กระบวนการบัญชี', IsCritical: 0 },
  ];
  const wsProc = XLSX.utils.json_to_sheet(procData);
  XLSX.utils.book_append_sheet(wb, wsProc, 'Processes');

  // 6. Assets
  const assetData = [
    { AssetCode: 'AST-EX-01', AssetName: 'PLC Gateway เครื่องผสมสี 01', AssetType: 'Industrial Controller', DepartmentCode: 'DEPT-EX-01', LocationCode: 'LOC-EX-01', OwnerName: 'สมชาย รักดี', Criticality: 'Critical' },
    { AssetCode: 'AST-EX-02', AssetName: 'Database Server SAP Cloud', AssetType: 'Database Server', DepartmentCode: 'DEPT-EX-02', LocationCode: 'LOC-EX-02', OwnerName: 'กัญญา สุขใจ', Criticality: 'High' },
  ];
  const wsAsset = XLSX.utils.json_to_sheet(assetData);
  XLSX.utils.book_append_sheet(wb, wsAsset, 'Assets');

  // 7. Categories
  const catData = [
    { CategoryCode: 'CAT-EX-01', CategoryName: 'ความเสี่ยงด้านกระบวนการ OT', Description: 'ความเสี่ยงเครื่องจักรและสายการผลิต' },
    { CategoryCode: 'CAT-EX-02', CategoryName: 'ความเสี่ยงด้านความปลอดภัยไซเบอร์', Description: 'ความเสี่ยงระบบสารสนเทศ' },
  ];
  const wsCat = XLSX.utils.json_to_sheet(catData);
  XLSX.utils.book_append_sheet(wb, wsCat, 'Categories');

  // 8. Standards
  const stdData = [
    { StandardCode: 'STD-EX-01', StandardName: 'ISO 27001:2022', Description: 'ระบบบริหารความปลอดภัยสารสนเทศ', ClauseNo: 'A.8.13', ClauseTitle: 'Backup Management', ClauseDescription: 'การสำรองข้อมูลและกู้คืน' },
  ];
  const wsStd = XLSX.utils.json_to_sheet(stdData);
  XLSX.utils.book_append_sheet(wb, wsStd, 'Standards');

  // 9. Risks
  const riskData = [
    {
      RiskNo: 'IT-R-2026-EX1',
      RiskTitle: 'ความเสี่ยงระบบเครื่องผสมสีล่มเนื่องจากสัญญาณ Network ขัดข้อง',
      RiskDescription: 'เครื่องควบคุม PLC ไม่สามารถเชื่อมต่อฐานข้อมูลสั่งผสมสีได้ ทำให้สายการผลิตหยุดชะงัก',
      CategoryCode: 'CAT-EX-01',
      DepartmentCode: 'DEPT-EX-01',
      ProcessCode: 'PROC-EX-01',
      LocationCode: 'LOC-EX-01',
      BUCode: 'BU-EX-01',
      AssetCode: 'AST-EX-01',
      RiskOwnerUsername: 'user.ex01',
      Threat: 'Network Interruption, Cable Damage',
      Vulnerability: 'ไม่มีลิงก์สำรองในจุดผสมสี',
      RiskCause: 'สายไฟเบอร์ขาดจากรถขุดดิน',
      RiskConsequence: 'ผลิตสีส่งลูกค้า OEM ไม่ทันกำหนด',
      ExistingCondition: 'มีสายแลนเส้นเดียว',
      PotentialImpact: 'ค่าปรับส่งสินค้าล่าช้า 200,000 บาท',
      Status: 'Open'
    }
  ];
  const wsRisk = XLSX.utils.json_to_sheet(riskData);
  XLSX.utils.book_append_sheet(wb, wsRisk, 'Risks');

  const outputDir = path.join(__dirname, '../../database');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'Master_Data_Template.xlsx');
  XLSX.writeFile(wb, outputPath);
  console.log(`✅ Master Data Excel template successfully created at:\n   ${outputPath}`);
}

generateTemplate();
