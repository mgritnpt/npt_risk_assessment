-- Safe Cleanup before Seeding
IF OBJECT_ID('dbo.Risk_Acceptance', 'U') IS NOT NULL DELETE FROM dbo.Risk_Acceptance;
IF OBJECT_ID('dbo.Risk_Action', 'U') IS NOT NULL DELETE FROM dbo.Risk_Action;
IF OBJECT_ID('dbo.Risk_Standard', 'U') IS NOT NULL DELETE FROM dbo.Risk_Standard;
IF OBJECT_ID('dbo.Risk_Control', 'U') IS NOT NULL DELETE FROM dbo.Risk_Control;
IF OBJECT_ID('dbo.Risk_Assessment', 'U') IS NOT NULL DELETE FROM dbo.Risk_Assessment;
IF OBJECT_ID('dbo.Risk_Register', 'U') IS NOT NULL DELETE FROM dbo.Risk_Register;
IF OBJECT_ID('dbo.RiskAcceptance', 'U') IS NOT NULL DELETE FROM dbo.RiskAcceptance;
IF OBJECT_ID('dbo.RiskTreatmentAction', 'U') IS NOT NULL DELETE FROM dbo.RiskTreatmentAction;
IF OBJECT_ID('dbo.RiskStandardMapping', 'U') IS NOT NULL DELETE FROM dbo.RiskStandardMapping;
IF OBJECT_ID('dbo.RiskControl', 'U') IS NOT NULL DELETE FROM dbo.RiskControl;
IF OBJECT_ID('dbo.ResidualRiskAssessment', 'U') IS NOT NULL DELETE FROM dbo.ResidualRiskAssessment;
IF OBJECT_ID('dbo.InherentRiskAssessment', 'U') IS NOT NULL DELETE FROM dbo.InherentRiskAssessment;
IF OBJECT_ID('dbo.RiskHeader', 'U') IS NOT NULL DELETE FROM dbo.RiskHeader;
IF OBJECT_ID('dbo.Master_Asset', 'U') IS NOT NULL DELETE FROM dbo.Master_Asset;
IF OBJECT_ID('dbo.Master_Process', 'U') IS NOT NULL DELETE FROM dbo.Master_Process;
IF OBJECT_ID('dbo.Master_Department', 'U') IS NOT NULL DELETE FROM dbo.Master_Department;
IF OBJECT_ID('dbo.Master_RiskCategory', 'U') IS NOT NULL DELETE FROM dbo.Master_RiskCategory;
IF OBJECT_ID('dbo.Master_StandardClause', 'U') IS NOT NULL DELETE FROM dbo.Master_StandardClause;
IF OBJECT_ID('dbo.Master_StandardRequirement', 'U') IS NOT NULL DELETE FROM dbo.Master_StandardRequirement;
IF OBJECT_ID('dbo.Master_Standard', 'U') IS NOT NULL DELETE FROM dbo.Master_Standard;
IF OBJECT_ID('dbo.User', 'U') IS NOT NULL DELETE FROM dbo.[User];
GO

-- ============================================================================
-- 1. SEED DEPARTMENTS, PROCESSES, LOCATIONS, BUs
-- ============================================================================
INSERT INTO dbo.Master_BusinessUnit (BUCode, BUName, Description)
VALUES
('BU-AUTO-COAT', N'Automotive & OEM Coatings BU', N'กลุ่มธุรกิจสีพ่นรถยนต์ OEM ป้อนโรงงานประกอบรถยนต์ญี่ปุ่น'),
('BU-IND-PAINT', N'Industrial & Chemical Coatings BU', N'กลุ่มธุรกิจสีอุตสาหกรรม สีทาเครื่องจักร และสารเคมีเคลือบผิว'),
('BU-DECO-PAINT', N'Decorative Paint BU', N'กลุ่มธุรกิจสีทาอาคารและสีตกแต่งทั่วไป'),
('BU-COATING-SERV', N'Surface Coating Service Division', N'กลุ่มธุรกิจบริการพ่นสีและเตรียมผิวชิ้นงานอุตสาหกรรม');

INSERT INTO dbo.Master_Location (LocationCode, LocationName, Description)
VALUES
('LOC-HQ-BKK', N'สำนักงานใหญ่ กรุงเทพฯ (HQ Bangkok)', N'ศูนย์บริหารจัดการและทีม IT หลัก'),
('LOC-PLANT1-CHON', N'โรงงานชลบุรี (Plant 1 Chonburi)', N'โรงงานผลิตสีพ่นรถยนต์ OEM (IATF 16949 / JAMA Requirement)'),
('LOC-PLANT2-RAYONG', N'โรงงานระยอง (Plant 2 Rayong)', N'โรงงานผลิตสีอุตสาหกรรมและสีเคมีภัณฑ์'),
('LOC-PLANT3-SAMUT', N'โรงงานสมุทรปราการ (Plant 3 Samut Prakan)', N'โรงงานผลิตเรซิ่นและผสมสีทาอาคาร'),
('LOC-AWS-SINGAPORE', N'AWS Cloud Datacenter (Singapore Region)', N'ศูนย์ข้อมูลหลักบน Cloud AWS สภาพแวดล้อมระบบ SAP ECC6');

INSERT INTO dbo.Master_Department (DepartmentCode, DepartmentName, ManagerName)
VALUES
('IT', N'Information Technology (ไอที)', N'สมชาย ใจดี'),
('QA_QC', N'Quality Assurance & QC (ประกันคุณภาพสี)', N'กัญญา รักไทย'),
('PROD_PAINT', N'Paint Manufacturing & Production (ฝ่ายผลิตสี)', N'อนันต์ มั่งคั่ง'),
('SERVICE', N'Technical Coating Service (ฝ่ายบริการเทคนิคพ่นสี)', N'วิชัย บริการ'),
('SCM', N'Supply Chain & Warehouse (คลังสินค้าและจัดส่ง)', N'สมศักดิ์ ขนส่ง'),
('FIN_ACC', N'Finance & Accounting (การเงินและบัญชี)', N'วิภา บัญชี');

INSERT INTO dbo.Master_Process (ProcessCode, ProcessName, DepartmentID, Description)
VALUES
('PROC-SAP', N'SAP ECC6 Cloud ERP Operations', 1, N'ระบบงานหลักสำหรับการวางแผนผลิตสี การขาย จัดซื้อ และบัญชี'),
('PROC-TINT', N'Automated Paint Tinting & Mixing Process', 3, N'กระบวนการผสมสีอัตโนมัติเชื่อมต่อสั่งการจากระบบ IT/OT'),
('PROC-PATCH', N'BigFix Endpoint Patching & EDR Deployment', 1, N'การอัปเดตแพตช์ความปลอดภัยเครื่อง PC/Server ในทุก Plant'),
('PROC-SOC', N'Proficio 24/7 Managed SOC Incident Monitoring', 1, N'การเฝ้าระวังภัยคุกคามไซเบอร์ตลอด 24 ชั่วโมง'),
('PROC-GLPI', N'GLPI IT Asset & Service Desk Operation', 1, N'ระบบบริหารจัดการทรัพย์สิน IT และแจ้งซ่อมบริการ');

INSERT INTO dbo.Master_Asset (AssetCode, AssetName, AssetType, OwnerName, Criticality)
VALUES
('AST-AWS-SAP-APP', N'AWS SAP ECC6 ERP Application Cluster', N'Cloud AWS Server', N'สมชาย ใจดี', N'Critical'),
('AST-AWS-SAP-DB', N'AWS SAP ECC6 Oracle Database Server', N'Cloud AWS Database', N'สมชาย ใจดี', N'Critical'),
('AST-DC-PLANT1', N'Plant 1 Chonburi Local Active Directory Domain Controller', N'Local Windows Server', N'สมชาย ใจดี', N'High'),
('AST-PLC-MIX01', N'Automated Color Tinting Machine PLC Gateway (Plant 1)', N'OT / Industrial Control', N'อนันต์ มั่งคั่ง', N'Critical'),
('AST-SENTINEL-01', N'SentinelOne EDR & Proficio SIEM Gateway Collector', N'Security Appliance', N'สมชาย ใจดี', N'High'),
('AST-BIGFIX-01', N'HCL BigFix Endpoint Patch Management Server', N'Management Server', N'สมชาย ใจดี', N'High');

-- ============================================================================
-- 2. SEED USERS (DEPENDS ON MASTER_DEPARTMENT)
-- ============================================================================
INSERT INTO dbo.[User] (Username, FullName, Email, Role, DepartmentID, CreatedBy)
VALUES 
('admin', N'System Administrator', 'admin@paint-coatings.co.th', 'Admin', NULL, 'SYSTEM'),
('it.mgr', N'สมชาย ใจดี (IT Manager)', 'somchai.j@paint-coatings.co.th', 'Risk Owner', 1, 'SYSTEM'),
('qa.lead', N'กัญญา รักไทย (QA & ISO Auditor)', 'kanya.r@paint-coatings.co.th', 'Auditor', 2, 'SYSTEM'),
('ot.eng', N'อนันต์ มั่งคั่ง (Plant OT & Automation Engineer)', 'anan.m@paint-coatings.co.th', 'User', 3, 'SYSTEM');

-- ============================================================================
-- 3. SEED STANDARDS & CLAUSES
-- ============================================================================
INSERT INTO dbo.Master_Standard (StandardCode, StandardName, Description)
VALUES
('IATF16949', N'IATF 16949:2016 (Automotive QMS)', N'มาตรฐานระบบบริหารจัดการคุณภาพสำหรับอุตสาหกรรมยานยนต์ (Automotive Supply Chain)'),
('ISO9001', N'ISO 9001:2015 (QMS)', N'มาตรฐานระบบบริหารงานคุณภาพกระบวนการผลิตสีและการบริการ (Quality Management System)'),
('JAMA_JAPIA', N'JAMA/JAPIA Cybersecurity v2.0', N'แนวทางความมั่นคงปลอดภัยไซเบอร์ของสมาคมผู้ผลิตยานยนต์ญี่ปุ่น (Japanese OEM Cybersecurity Guidelines)'),
('ISO27001', N'ISO/IEC 27001:2022 (ISMS)', N'มาตรฐานระบบการจัดการความมั่นคงปลอดภัยสารสนเทศสำหรับองค์กร');

-- Clauses for IATF 16949
INSERT INTO dbo.Master_StandardClause (StandardID, ClauseNo, ClauseTitle, Description)
VALUES
(1, '6.1', N'Actions to address risks and opportunities', N'การดำเนินการเพื่อจัดการความเสี่ยงและโอกาสที่กระทบต่อคุณภาพผลิตภัณฑ์สีส่งมอบOEM'),
(1, '8.5.1', N'Control of production and service provision', N'การควบคุมการผลิตสีและบริการพ่นสีให้ต่อเนื่องโดยไม่มีระบบ IT/OT หยุดชะงัก'),
(1, '8.5.6', N'Control of changes', N'การควบคุมการเปลี่ยนแปลงระบบ IT/OT ที่มีผลต่อสูตรผสมสีและกระบวนการผลิต');

-- Clauses for ISO 9001
INSERT INTO dbo.Master_StandardClause (StandardID, ClauseNo, ClauseTitle, Description)
VALUES
(2, '6.1', N'Actions to address risks and opportunities', N'การประเมินความเสี่ยงเชิงป้องกันตามแนวคิด Risk-based Thinking สำหรับ QMS'),
(2, '7.1.3', N'Infrastructure', N'การบำรุงรักษาโครงสร้างพื้นฐาน IT, Cloud AWS, Network และระบบในโรงงาน'),
(2, '7.5.3', N'Control of documented information', N'การควบคุมความสมบูรณ์และถูกต้องของเอกสารสูตรสีและมาตรฐานการผลิต');

-- Clauses for JAMA / JAPIA
INSERT INTO dbo.Master_StandardClause (StandardID, ClauseNo, ClauseTitle, Description)
VALUES
(3, '4.1', N'Information Asset Management', N'การจำแนกและปกป้องข้อมูลความลับสูตรสี (Color Recipe) และ Spec ของค่ายรถยนต์'),
(3, '5.2', N'Supply Chain Security', N'การควบคุมความปลอดภัยไซเบอร์ในการเชื่อมต่อกับคู่ค้าและลูกค้า OEM'),
(3, '6.3', N'Incident Response & BCP', N'แผนรองรับสภาวะฉุกเฉินและการกู้คืนระบบ SAP ECC6 บน AWS เมื่อเกิดเหตุไซเบอร์');

-- Clauses for ISO/IEC 27001
INSERT INTO dbo.Master_StandardClause (StandardID, ClauseNo, ClauseTitle, Description)
VALUES
(4, 'A.5.1', N'Policies for Information Security', N'นโยบายความมั่นคงปลอดภัยสารสนเทศครอบคลุมระบบ Cloud AWS และทุกโรงงาน'),
(4, 'A.8.12', N'Data Leakage Prevention', N'การป้องกันข้อมูลสูตรสีและข้อมูลลูกค้าการค้าการรั่วไหลออกนอกองค์กร'),
(4, 'A.8.13', N'Information Backup', N'การสำรองข้อมูล SAP ECC6 และ File Share พร้อมการทดสอบกู้คืนข้อมูลอย่างสม่ำเสมอ');

-- ============================================================================
-- 4. SEED RISK CATEGORIES
-- ============================================================================
INSERT INTO dbo.Master_RiskCategory (CategoryCode, CategoryName, Description)
VALUES
('CLOUD_AWS', N'Cloud AWS & ERP Infrastructure', N'ความเสี่ยงเกี่ยวกับ Cloud AWS, SAP ECC6, ระบบ Network Link ระหว่างนิคมอุตสาหกรรม'),
('CYBER', N'Cybersecurity & Endpoint Risk', N'ภัยคุกคามไซเบอร์ Phishing, Ransomware, EDR SentinelOne, BigFix Patching, Proficio SOC'),
('OT_MIXING', N'Plant OT & Paint Tinting Automation', N'ความเสี่ยงระบบควบคุมเครื่องผสมสีอัตโนมัติ (Automated Tinting PLC Machine & OT Network)'),
('DATA_RECIPE', N'Confidential Paint Recipe & Data Leakage', N'ความเสี่ยงสูตรเคมีสี (Paint Formulation), สีรถยนต์ OEM และข้อมูลความลับลูกค้ารั่วไหล'),
('BACKUP_DR', N'Backup & Business Continuity (BCP/DR)', N'การสำรองข้อมูล SAP ECC6, File Server ในแต่ละ Plant และแผนกู้คืนภัยพิบัติ'),
('COMPLIANCE', N'Compliance & Standards Audit', N'ความเสี่ยงการไม่สอดคล้องกับข้อกำหนด IATF 16949, ISO 9001, JAMA/JAPIA, ISO 27001'),
('SUPPLIER', N'Third Party & Service Provider', N'ความเสี่ยงจากผู้ให้บริการซ่อมบำรุง, Cloud AWS, Managed SOC Proficio และ Vendor');

-- ============================================================================
-- 6. SEED EVALUATION CRITERIA WITH DETAILED THAI DEFINITIONS
-- ============================================================================
INSERT INTO dbo.Master_LikelihoodCriteria (LikelihoodScore, LevelName, LevelNameTH, Definition, FrequencyDescription)
VALUES
(1, 'Rare', N'แทบไม่เคยเกิดขึ้น (1)', N'มีโอกาสเกิดน้อยมาก หรือเกิดเฉพาะในกรณีแวดล้อมที่ผิดปกติอย่างยิ่ง', N'น้อยกว่า 1 ครั้งในรอบ 5 ปี'),
(2, 'Unlikely', N'เกิดขึ้นน้อย (2)', N'อาจเกิดขึ้นได้ในบางกรณี แต่ไม่มีสัญญาณบ่งชี้ว่าเกิดบ่อย', N'เกิด 1 ครั้งในรอบ 1 ถึง 5 ปี'),
(3, 'Possible', N'อาจเกิดขึ้นได้ (3)', N'มีโอกาสเกิดขึ้นได้ตามสภาวะการทำงานปกติ', N'เกิดขึ้นประมาณ 1 ครั้งต่อปี'),
(4, 'Likely', N'เกิดขึ้นบ่อย (4)', N'มีความเป็นไปได้สูงที่จะเกิดขึ้นในสภาวะการทำงานส่วนใหญ่', N'เกิดขึ้น 1 ครั้งในรอบ 1 ถึง 3 เดือน'),
(5, 'Almost Certain', N'เกิดขึ้นแน่นอน (5)', N'คาดว่าจะเกิดขึ้นเป็นประจำอย่างแน่นอน หรือเกิดขึ้นเป็นประจำสม่ำเสมอ', N'เกิดขึ้นหลายครั้งต่อเดือน หรือสัปดาห์');

INSERT INTO dbo.Master_ImpactCriteria (ImpactScore, ImpactCategory, LevelName, LevelNameTH, Definition, FinancialThreshold, OperationalImpact)
VALUES
-- Overall / Business Impact
(1, 'Overall', 'Negligible', N'น้อยมาก (1)', N'ส่งผลกระทบเล็กน้อยต่อการทำงานประจำวัน ไม่มีผลต่อสายการผลิตสีหรือการส่งมอบ', N'< 50,000 บาท', N'ระบบหยุดชะงัก < 15 นาที'),
(2, 'Overall', 'Minor', N'น้อย (2)', N'เกิดความล่าช้าเล็กน้อย สามารถแก้ไขได้ในระดับแผนก ไม่กระทบลูกค้า OEM', N'50,000 - 200,000 บาท', N'ระบบหยุดชะงัก 15 นาที - 2 ชม.'),
(3, 'Overall', 'Moderate', N'ปานกลาง (3)', N'กระทบต่อการวางแผนผลิตสีบน SAP ECC6 หรือระบบผสมสีในโรงงานหยุดชะงักชั่วคราว', N'200,000 - 1,000,000 บาท', N'ระบบหยุดชะงัก 2 ชม. - 8 ชม.'),
(4, 'Overall', 'Major', N'สูง (4)', N'โรงงานผลิตสีหยุดทำงาน ส่งผลให้ส่งมอบสีพ่นรถยนต์ OEM ไม่ทันกำหนด เสียค่าปรับส่งมอบล่าช้า', N'1,000,000 - 5,000,000 บาท', N'ระบบหยุดชะงัก 8 ชม. - 24 ชม.'),
(5, 'Overall', 'Catastrophic', N'สูงมาก/วิกฤต (5)', N'ไลน์ประกอบรถยนต์ของลูกค้า OEM หยุดผลิต (Customer Line Stop), สูตรผสมสีความลับรั่วไหล หรือโดน Ransomware สั่งหยุดทั้งบริษัท', N'> 5,000,000 บาท', N'ระบบหยุดชะงัก > 24 ชั่วโมง'),

-- Confidentiality Impact
(1, 'Confidentiality', 'Low', N'ข้อมูลทั่วไปรั่วไหล (1)', N'ข้อมูลสาธารณะหรือข้อมูลประชาสัมพันธ์รั่วไหล', NULL, NULL),
(2, 'Confidentiality', 'Minor', N'ข้อมูลภายในรั่วไหล (2)', N'บันทึกข้อความภายในหรือคู่มือการทำงานรั่วไหล', NULL, NULL),
(3, 'Confidentiality', 'Moderate', N'ข้อมูลราคา/Supplier รั่วไหล (3)', N'ข้อมูลส่วนบุคคลพนักงาน ข้อมูลราคาซื้อขายวัตถุดิบเคมีรั่วไหล', NULL, NULL),
(4, 'Confidentiality', 'High', N'สูตรสีสินค้ามาตรฐานรั่วไหล (4)', N'สูตรผสมเคมีสีทาอาคารและสีอุตสาหกรรมรั่วไหลไปยังคู่แข่ง', NULL, NULL),
(5, 'Confidentiality', 'Critical', N'สูตรสี OEM รถยนต์ความลับรั่วไหล (5)', N'สูตรสีพ่นรถยนต์ความลับ (Automotive Paint Recipe) หรือข้อมูล NDA ค่ายรถยนต์รั่วไหล', NULL, NULL),

-- Integrity Impact
(1, 'Integrity', 'Low', N'คลาดเคลื่อนเล็กน้อย (1)', N'ตัวอักษรพิมพ์ผิดในรายงานภายในที่ไม่สำคัญ', NULL, NULL),
(2, 'Integrity', 'Minor', N'แก้ไขได้ทันที (2)', N'ข้อมูลยอดสต็อกสีคลาดเคลื่อนเล็กน้อย ตรวจพบและปรับปรุงได้ทันที', NULL, NULL),
(3, 'Integrity', 'Moderate', N'กระทบรายงานสต็อกเคมี (3)', N'ข้อมูลสัดส่วนวัตถุดิบเคมีบน SAP ผิดพลาด ต้องทำการตรวจนับใหม่', NULL, NULL),
(4, 'Integrity', 'High', N'สูตรผลิตสีถูกแก้ไข (4)', N'สัดส่วนการผสมสีบนระบบพ่นสีอัตโนมัติถูกแก้ไข ทำให้สีเพี้ยนไม่ได้มาตรฐาน', NULL, NULL),
(5, 'Integrity', 'Critical', N'ข้อมูล QC ถูกปลอมแปลง (5)', N'ผลการทดสอบคุณภาพสี (COA / Quality Spec) ถูกแก้ไข ผลิตภัณฑ์สีที่ไม่ได้มาตรฐานหลุดไปถึงโรงงานค่ายรถยนต์', NULL, NULL),

-- Availability Impact
(1, 'Availability', 'Low', N'หยุดชะงัก < 15 นาที (1)', N'ระบบ lag ชั่วคราว ระบบกลับมาทำงานอัตโนมัติ', NULL, NULL),
(2, 'Availability', 'Minor', N'หยุดชะงัก 15 นาที - 2 ชม. (2)', N'ระบบ GLPI หรือ File Share ประจำ Plant ล่มชั่วคราว', NULL, NULL),
(3, 'Availability', 'Moderate', N'หยุดชะงัก 2 ชม. - 8 ชม. (3)', N'Network Link เชื่อมต่อ Cloud AWS ล่ม ทำให้ SAP ECC6 ใช้งานไม่ได้ระหว่างวัน', NULL, NULL),
(4, 'Availability', 'High', N'หยุดชะงัก 8 ชม. - 24 ชม. (4)', N'SAP ECC6 หรือระบบสั่งผสมสีอัตโนมัติล่มตลอดทั้งกะการผลิต', NULL, NULL),
(5, 'Availability', 'Critical', N'หยุดชะงัก > 24 ชม. (5)', N'ระบบ Cloud AWS สื่อสารไม่ได้ หรือถูก Ransomware ล็อกไฟล์ระบบหลักทั้งบริษัทเกิน 1 วัน', NULL, NULL),

-- Quality Impact (IATF 16949 / ISO 9001)
(1, 'Quality', 'Low', N'ไม่มีผลต่อคุณภาพสี (1)', N'ไม่มีผลต่อคุณภาพผลิตภัณฑ์สีหรือขั้นตอนการบริการพ่นสี', NULL, NULL),
(2, 'Quality', 'Minor', N'ต้องตรวจสอบเฉดสีซ้ำ (2)', N'ต้องทำการสุ่มตรวจเฉดสีเพิ่มขึ้นในห้องแล็บ QC', NULL, NULL),
(3, 'Quality', 'Moderate', N'เสี่ยงต่อการ Rework สี (3)', N'ต้องนำสีกลับมาแก้ไขผสมใหม่ (Internal Rework) ในโรงงาน', NULL, NULL),
(4, 'Quality', 'High', N'ลูกค้าแจ้ง Customer Claim (4)', N'สีที่พ่นให้ลูกค้าเกิดการลอกร่อน ลูกค้าแจ้งเคลมคุณภาพ', NULL, NULL),
(5, 'Quality', 'Critical', N'Customer OEM Line Stop (5)', N'เกิดความบกพร่องในชั้นสีพ่นรถยนต์ ทำให้โรงงานประกอบรถยนต์ต้องหยุดไลน์ผลิต', NULL, NULL);

-- ============================================================================
-- 7. SEED REALISTIC RISKS FOR PAINT & COATINGS MANUFACTURING & SERVICES
-- ============================================================================

-- RISK #1: SAP ECC6 AWS Cloud Connection Outage via VPN Link
INSERT INTO dbo.RiskHeader (
    RiskNo, RiskTitle, RiskDescription, AssessmentDate, ReviewDate, AssessmentType, RiskType,
    CategoryID, DepartmentID, ProcessID, LocationID, BUID, AssetID, RiskOwnerID, AssessorID, ApproverID,
    Threat, Vulnerability, RiskCause, RiskConsequence, ExistingCondition, PotentialImpact, Status
) VALUES (
    'IT-R-2026-001', 
    N'SAP ECC6 Cloud AWS Connection Failure via Site-to-Site Network Link', 
    N'เหตุการณ์ลิงก์เครือข่ายเชื่อมต่อระหว่างโรงงานผลิตสี (Plant 1, 2, 3) กับ Cloud AWS Singapore เกิดการขัดข้อง ทำให้ไม่สามารถใช้งาน SAP ECC6 ได้',
    GETDATE(), DATEADD(month, 6, GETDATE()), 'Initial', 'IT Risk',
    1, 1, 1, 2, 1, 1, 2, 2, 1,
    N'Main ISP Fiber Cut, Cloud Gateway Timeout, Router Failure',
    N'การใช้สัญญา ISP หลักเส้นเดียวในบาง Plant และไม่มีระบบ SD-WAN Failover แบบอัตโนมัติ',
    N'สายไฟเบอร์ออปติกของ ISP ขาดเนื่องจากการขุดถนน และอุปกรณ์ Router ที่โรงงานเกิดความร้อนสูง',
    N'ไม่สามารถเปิด Order ผลิตสีบน SAP ECC6 ได้, ไม่สามารถพิมพ์เอกสาร Delivery Order (DO) สำหรับจัดส่งสีให้ค่ายรถยนต์ได้',
    N'มีลิงก์ Backup 4G แต่ Bandwidth ไม่เพียงพอสำหรับผู้ใช้งานทุกโรงงานพร้อมกัน',
    N'การจัดส่งสีพ่นรถยนต์ล่าช้าเกินกำหนด เกิดค่าปรับ Line Stop จากค่ายรถยนต์ OEM',
    'Open'
);

INSERT INTO dbo.RiskAssessment (
    RiskID, AssessmentType, Likelihood, Impact, 
    ConfidentialityImpact, IntegrityImpact, AvailabilityImpact, QualityImpact, FinancialImpact,
    RiskScore, RiskLevel, AssessorID
) VALUES (
    1, 'INHERENT', 4, 5, 2, 3, 5, 4, 5, 20, 'Critical', 2
);

INSERT INTO dbo.RiskControl (
    RiskID, ControlName, ControlDescription, ControlType, ManualOrAutomated, ControlOwner, Frequency, ControlEvidence, ControlEffectiveness
) VALUES (
    1, N'Secondary Backup Internet Link (4G/5G Router)', N'มีระบบสำรอง 4G Router สำหรับเชื่อมต่อ AWS ในกรณีสาย Fiber หลักขาด', 'Preventive', 'Automated', N'สมชาย ใจดี', 'Real-time', N'Router Failover Status Log', 'Partially Effective'
);

INSERT INTO dbo.RiskStandardMapping (RiskID, StandardID, ClauseID, ControlReference, ComplianceGap, Status) VALUES
(1, 1, 2, N'IATF 8.5.1 Control of Production', N'ขาดระบบ SD-WAN Auto Failover ที่มี Bandwidth สูงพอสำหรับ SAP', 'Needs Improvement'),
(1, 2, 2, N'ISO 9001 7.1.3 Infrastructure', N'ระบบเครือข่ายสำรองระหว่าง Plant กับ AWS มีข้อจำกัดเรื่องความเร็ว', 'Needs Improvement'),
(1, 4, 3, N'ISO 27001 A.8.13 Backup & Resilience', N'มีแผน BCP แต่ยังไม่ได้ทดสอบจำลองเหตุการณ์สาย Fiber ขาดพร้อมกันทุก Plant', 'Compliant');

INSERT INTO dbo.RiskTreatmentAction (
    RiskID, TreatmentStrategy, TreatmentAction, ActionOwner, TargetDate, Priority, RequiredBudget, ProgressPercent, Status
) VALUES (
    1, 'Reduce', N'ติดตั้งระบบ Fortinet SD-WAN Dual ISP (Fiber + Microwave Link) สำหรับทุกโรงงานเพื่อเชื่อมต่อ AWS แบบ High Availability', N'สมชาย ใจดี', DATEADD(month, 2, GETDATE()), 'Urgent', 350000.00, 25, 'In Progress'
);

INSERT INTO dbo.RiskAssessment (
    RiskID, AssessmentType, Likelihood, Impact, 
    ConfidentialityImpact, IntegrityImpact, AvailabilityImpact, QualityImpact, FinancialImpact,
    RiskScore, RiskLevel, AssessorID
) VALUES (
    1, 'RESIDUAL', 2, 3, 1, 2, 2, 2, 2, 6, 'Medium', 2
);

INSERT INTO dbo.RiskAcceptance (
    RiskID, IsRequired, AcceptedBy, AcceptanceDate, AcceptanceReason, ReviewFrequency
) VALUES (
    1, 1, N'สมชาย ใจดี (IT Manager)', GETDATE(), N'ยอมรับความเสี่ยงชั่วคราวระหว่างรอติดตั้งอุปกรณ์ SD-WAN เพิ่มเติม', 'Quarterly'
);


-- RISK #2: Automotive OEM Paint Recipe Data Leakage
INSERT INTO dbo.RiskHeader (
    RiskNo, RiskTitle, RiskDescription, AssessmentDate, ReviewDate, AssessmentType, RiskType,
    CategoryID, DepartmentID, ProcessID, LocationID, BUID, AssetID, RiskOwnerID, AssessorID, ApproverID,
    Threat, Vulnerability, RiskCause, RiskConsequence, ExistingCondition, PotentialImpact, Status
) VALUES (
    'IT-R-2026-002', 
    N'Unauthorized Access & Data Leakage of Confidential Automotive Paint Recipes', 
    N'สูตรเคมีและสัดส่วนการผสมสีพ่นรถยนต์ความลับ (Automotive Color Recipe & OEM NDA Spec) รั่วไหลออกนอกองค์กรทางอีเมลหรือ Thumb Drive',
    GETDATE(), DATEADD(month, 6, GETDATE()), 'Initial', 'IT Risk',
    4, 2, 2, 2, 1, 2, 3, 3, 1,
    N'Insider Threat, Social Engineering, Unauthorized File Export',
    N'การไม่ได้เปิดใช้งานระบบ Data Loss Prevention (DLP) บนเครื่องวิจัยและพัฒนาสี (R&D)',
    N'พนักงานเสียบ USB Drive คัดลอกไฟล์สูตรผสมสี หรือส่งไฟล์ออกทางอีเมลส่วนตัว',
    N'ค่ายรถยนต์ยกเลิกสัญญาการจัดซื้อสีพ่นรถยนต์ เสียชื่อเสียงองค์กรอย่างรุนแรง และถูกฟ้องร้องละเมิดข้อตกลง NDA',
    N'มีนโยบายปิดล็อกพอร์ต USB บางเครื่อง แต่นโยบาย DLP บน E-mail และ Cloud Drive ยังไม่ครอบคลุม',
    N'สูญเสียรายได้จากกลุ่มธุรกิจสีพ่นรถยนต์ OEM และถูกปรับตามสัญญา NDA',
    'Open'
);

INSERT INTO dbo.RiskAssessment (
    RiskID, AssessmentType, Likelihood, Impact, 
    ConfidentialityImpact, IntegrityImpact, AvailabilityImpact, QualityImpact, FinancialImpact,
    RiskScore, RiskLevel, AssessorID
) VALUES (
    2, 'INHERENT', 3, 5, 5, 4, 2, 4, 5, 15, 'Critical', 3
);

INSERT INTO dbo.RiskControl (
    RiskID, ControlName, ControlDescription, ControlType, ManualOrAutomated, ControlOwner, Frequency, ControlEvidence, ControlEffectiveness
) VALUES (
    2, N'SentinelOne EDR & USB Device Control Policy', N'เปิดใช้งานฟังก์ชันจำกัดการใช้งาน USB Drive บนเครื่อง R&D ผ่าน SentinelOne', 'Preventive', 'Automated', N'สมชาย ใจดี', 'Real-time', N'SentinelOne Policy Console Report', 'Partially Effective'
);

INSERT INTO dbo.RiskStandardMapping (RiskID, StandardID, ClauseID, ControlReference, ComplianceGap, Status) VALUES
(2, 3, 1, N'JAMA/JAPIA 4.1 Asset Management', N'ต้องมีระบบควบคุมและจำแนกชั้นความลับข้อมูลสูตรสี (Data Classification)', 'Needs Improvement'),
(2, 4, 2, N'ISO 27001 A.8.12 Data Leakage Prevention', N'ยังไม่มีระบบ DLP ตรวจจับการส่งไฟล์สูตรสีออกทางอีเมลภายนอก', 'Non-Compliant');

INSERT INTO dbo.RiskTreatmentAction (
    RiskID, TreatmentStrategy, TreatmentAction, ActionOwner, TargetDate, Priority, RequiredBudget, ProgressPercent, Status
) VALUES (
    2, 'Reduce', N'ติดตั้งระบบ Microsoft Purview Information Protection (DLP) สำหรับเข้ารหัสเอกสารสูตรสีและบล็อกการส่งออกนอกองค์กร', N'สมชาย ใจดี', DATEADD(month, 3, GETDATE()), 'High', 220000.00, 40, 'In Progress'
);

INSERT INTO dbo.RiskAssessment (
    RiskID, AssessmentType, Likelihood, Impact, 
    ConfidentialityImpact, IntegrityImpact, AvailabilityImpact, QualityImpact, FinancialImpact,
    RiskScore, RiskLevel, AssessorID
) VALUES (
    2, 'RESIDUAL', 1, 3, 2, 2, 1, 2, 2, 3, 'Low', 3
);

INSERT INTO dbo.RiskAcceptance (
    RiskID, IsRequired, AcceptedBy, AcceptanceDate, AcceptanceReason, ReviewFrequency
) VALUES (
    2, 0, N'กัญญา รักไทย (QA Manager)', GETDATE(), N'การควบคุมจะสมบูรณ์หลังจากติดตั้ง Microsoft Purview DLP แล้วเสร็จ', 'Annual'
);


-- RISK #3: Ransomware Outbreak at Plant 2 Rayong via Unpatched Active Directory Domain Controller
INSERT INTO dbo.RiskHeader (
    RiskNo, RiskTitle, RiskDescription, AssessmentDate, ReviewDate, AssessmentType, RiskType,
    CategoryID, DepartmentID, ProcessID, LocationID, BUID, AssetID, RiskOwnerID, AssessorID, ApproverID,
    Threat, Vulnerability, RiskCause, RiskConsequence, ExistingCondition, PotentialImpact, Status
) VALUES (
    'IT-R-2026-003', 
    N'Ransomware Attack & Lateral Movement via Unpatched Local Domain Controller at Plant 2', 
    N'การแพร่ระบาดของมัลแวร์ Ransomware จากการถูกโจมตีช่องโหว่บน Active Directory Domain Controller ที่โรงงานระยอง ทำให้เครื่องคอมพิวเตอร์และ File Share ในโรงงานถูกล็อกไฟล์',
    GETDATE(), DATEADD(month, 6, GETDATE()), 'Initial', 'IT Risk',
    2, 1, 3, 3, 2, 3, 2, 3, 1,
    N'Ransomware Attack, Zero-day Exploit, Phishing',
    N'การอัปเดตแพตช์ Windows Server ล่าช้าบนระบบ HCL BigFix และการเปิดสิทธิ์ Shared Folder แบบกว้างเกินไป',
    N'ผู้ใช้งานหลงเชื่อเปิดไฟล์แนบ Phishing ประกอบกับเครื่อง Server ไม่ได้ลงแพตช์ความปลอดภัยล่าสุด',
    N'ไฟล์แบบแปลนการผสมสีอุตสาหกรรมใน File Share ถูกล็อกรหัส ไม่สามารถดึงข้อมูลสีมาผสมตามออเดอร์ได้',
    N'มี SentinelOne EDR ติดตั้งอยู่ทุกเครื่อง และมี Proficio 24/7 SOC เฝ้าระวัง',
    N'โรงงานระยองต้องหยุดการผลิตสีอุตสาหกรรม 1-2 วันเพื่อทำการกู้คืนข้อมูลจากระบบสำรอง',
    'Open'
);

INSERT INTO dbo.RiskAssessment (
    RiskID, AssessmentType, Likelihood, Impact, 
    ConfidentialityImpact, IntegrityImpact, AvailabilityImpact, QualityImpact, FinancialImpact,
    RiskScore, RiskLevel, AssessorID
) VALUES (
    3, 'INHERENT', 3, 4, 3, 4, 4, 3, 4, 12, 'High', 3
);

INSERT INTO dbo.RiskControl (
    RiskID, ControlName, ControlDescription, ControlType, ManualOrAutomated, ControlOwner, Frequency, ControlEvidence, ControlEffectiveness
) VALUES (
    3, N'HCL BigFix Automated Patching & SentinelOne EDR', N'ระบบกระจายแพตช์อัตโนมัติ BigFix และเอเจนต์ EDR ตรวจจับมัลแวร์เรียลไทม์', 'Preventive', 'Automated', N'สมชาย ใจดี', 'Weekly', N'BigFix Compliance & SentinelOne Dashboard', 'Effective'
);

INSERT INTO dbo.RiskStandardMapping (RiskID, StandardID, ClauseID, ControlReference, ComplianceGap, Status) VALUES
(3, 3, 3, N'JAMA/JAPIA 6.3 Incident Response & BCP', N'ระบบเฝ้าระวัง Proficio SOC แจ้งเตือนได้ทันที ต้องปรับปรุงเวลาในการกู้คืนไฟล์', 'Compliant'),
(3, 4, 1, N'ISO 27001 A.5.1 Security Policies', N'ต้องทบทวนสิทธิ์การเข้าถึง Shared Folder ตามหลัก Least Privilege', 'Needs Improvement');

INSERT INTO dbo.RiskTreatmentAction (
    RiskID, TreatmentStrategy, TreatmentAction, ActionOwner, TargetDate, Priority, RequiredBudget, ProgressPercent, Status
) VALUES (
    3, 'Reduce', N'ปรับปรุงการจัดสรรสิทธิ์ Active Directory Shared Folder ตามหลัก Least Privilege และกำหนดรอบ Patching บน BigFix เป็นทุกสัปดาห์', N'สมชาย ใจดี', DATEADD(month, 1, GETDATE()), 'Medium', 50000.00, 70, 'In Progress'
);

INSERT INTO dbo.RiskAssessment (
    RiskID, AssessmentType, Likelihood, Impact, 
    ConfidentialityImpact, IntegrityImpact, AvailabilityImpact, QualityImpact, FinancialImpact,
    RiskScore, RiskLevel, AssessorID
) VALUES (
    3, 'RESIDUAL', 1, 2, 1, 2, 2, 1, 2, 2, 'Low', 3
);

INSERT INTO dbo.RiskAcceptance (
    RiskID, IsRequired, AcceptedBy, AcceptanceDate, AcceptanceReason, ReviewFrequency
) VALUES (
    3, 0, N'สมชาย ใจดี (IT Manager)', GETDATE(), N'ความเสี่ยงอยู่ในระดับยอมรับได้หลังปรับสิทธิ์ AD และ Patching', 'Annual'
);

-- Audit Log Entries
INSERT INTO dbo.AuditLog (UserID, Action, TableName, RecordID, OldValue, NewValue)
VALUES
('SYSTEM', 'CREATE', 'RiskHeader', 'IT-R-2026-001', NULL, N'สร้างความเสี่ยง SAP ECC6 AWS Cloud Connection Outage'),
('SYSTEM', 'CREATE', 'RiskHeader', 'IT-R-2026-002', NULL, N'สร้างความเสี่ยง Automotive OEM Paint Recipe Data Leakage'),
('SYSTEM', 'CREATE', 'RiskHeader', 'IT-R-2026-003', NULL, N'สร้างความเสี่ยง Ransomware Outbreak at Plant 2 Rayong');

GO
