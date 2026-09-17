/* Disable and drop all foreign key constraints for safe table recreation */
DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) + 
              ' DROP CONSTRAINT ' + QUOTENAME(name) + ';' + CHAR(13)
FROM sys.foreign_keys;
EXEC sp_executesql @sql;
GO

/* ============================================================================
   ENTERPRISE RISK MANAGEMENT DATABASE
   SQL Server 2022
   Version: 1.0
   Purpose:
     - Enterprise-wide Risk Management
     - IT / OT / Cybersecurity / Quality / Business / BCP
     - Configurable Risk Library and Master Data
     - Inherent / Residual Assessment
     - Control / Treatment / Action / Monitoring / Acceptance
   ============================================================================ */

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* ============================================================================
   0. GLOBAL ROW POINTER REGISTRY
   Guarantees RowPointer uniqueness across ALL tables.
   ============================================================================ */
IF OBJECT_ID('dbo.Global_RowPointer','U') IS NOT NULL
    DROP TABLE dbo.Global_RowPointer;
GO

IF OBJECT_ID('dbo.Global_RowPointer', 'U') IS NOT NULL DROP TABLE dbo.[Global_RowPointer];
GO

CREATE TABLE dbo.[Global_RowPointer] (
    RowPointer UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_Global_RowPointer PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),
    TableName SYSNAME NOT NULL,
    RecordID BIGINT NULL,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system'
);
GO

/* ============================================================================
   COMMON NOTE
   RowPointer is globally registered by the application/service layer.
   All business tables retain RowPointer with a UNIQUE constraint.
   ============================================================================ */

/* ============================================================================
   1. ORGANIZATION MASTER
   ============================================================================ */

IF OBJECT_ID('dbo.Master_BusinessUnit', 'U') IS NOT NULL DROP TABLE dbo.[Master_BusinessUnit];
GO

CREATE TABLE dbo.[Master_BusinessUnit] (
    BUID BIGINT IDENTITY(1,1) PRIMARY KEY,
    BUCode NVARCHAR(50) NOT NULL UNIQUE,
    BUName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_BusinessUnit_RowPointer UNIQUE(RowPointer)
);
GO

IF OBJECT_ID('dbo.Master_Department', 'U') IS NOT NULL DROP TABLE dbo.[Master_Department];
GO

CREATE TABLE dbo.[Master_Department] (
    DepartmentID BIGINT IDENTITY(1,1) PRIMARY KEY,
    DepartmentCode NVARCHAR(50) NOT NULL UNIQUE,
    DepartmentName NVARCHAR(200) NOT NULL,
    BUID BIGINT NULL,
    ManagerName NVARCHAR(200) NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_Department_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_Master_Department_BU
        FOREIGN KEY(BUID) REFERENCES dbo.Master_BusinessUnit(BUID)
);
GO

IF OBJECT_ID('dbo.Master_Location', 'U') IS NOT NULL DROP TABLE dbo.[Master_Location];
GO

CREATE TABLE dbo.[Master_Location] (
    LocationID BIGINT IDENTITY(1,1) PRIMARY KEY,
    LocationCode NVARCHAR(50) NOT NULL UNIQUE,
    LocationName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_Location_RowPointer UNIQUE(RowPointer)
);
GO

IF OBJECT_ID('dbo.Master_Process', 'U') IS NOT NULL DROP TABLE dbo.[Master_Process];
GO

CREATE TABLE dbo.[Master_Process] (
    ProcessID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProcessCode NVARCHAR(50) NOT NULL UNIQUE,
    ProcessName NVARCHAR(200) NOT NULL,
    DepartmentID BIGINT NULL,
    Description NVARCHAR(1000) NULL,
    IsCritical BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_Process_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_Master_Process_Department
        FOREIGN KEY(DepartmentID) REFERENCES dbo.Master_Department(DepartmentID)
);
GO

IF OBJECT_ID('dbo.Master_Asset', 'U') IS NOT NULL DROP TABLE dbo.[Master_Asset];
GO

CREATE TABLE dbo.[Master_Asset] (
    AssetID BIGINT IDENTITY(1,1) PRIMARY KEY,
    AssetCode NVARCHAR(100) NOT NULL UNIQUE,
    AssetName NVARCHAR(250) NOT NULL,
    AssetType NVARCHAR(100) NULL,
    AssetClass NVARCHAR(100) NULL,
    OwnerDepartmentID BIGINT NULL,
    LocationID BIGINT NULL,
    CriticalityScore INT NULL,
    OwnerName NVARCHAR(200) NULL,
    Criticality NVARCHAR(50) NULL,
    Category NVARCHAR(100) NULL,
    Description NVARCHAR(1000) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_Asset_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_Master_Asset_Department
        FOREIGN KEY(OwnerDepartmentID) REFERENCES dbo.Master_Department(DepartmentID),
    CONSTRAINT FK_Master_Asset_Location
        FOREIGN KEY(LocationID) REFERENCES dbo.Master_Location(LocationID)
);
GO

/* ============================================================================
   2. RISK CLASSIFICATION MASTER
   ============================================================================ */

IF OBJECT_ID('dbo.Master_RiskDomain', 'U') IS NOT NULL DROP TABLE dbo.[Master_RiskDomain];
GO

CREATE TABLE dbo.[Master_RiskDomain] (
    RiskDomainID BIGINT IDENTITY(1,1) PRIMARY KEY,
    DomainCode NVARCHAR(50) NOT NULL UNIQUE,
    DomainName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_RiskDomain_RowPointer UNIQUE(RowPointer)
);
GO

IF OBJECT_ID('dbo.Master_RiskCategory', 'U') IS NOT NULL DROP TABLE dbo.[Master_RiskCategory];
GO

CREATE TABLE dbo.[Master_RiskCategory] (
    RiskCategoryID BIGINT IDENTITY(1,1) PRIMARY KEY,
    CategoryID AS RiskCategoryID,
    RiskDomainID BIGINT NULL,
    CategoryCode NVARCHAR(50) NOT NULL UNIQUE,
    CategoryName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_RiskCategory_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_Master_RiskCategory_Domain
        FOREIGN KEY(RiskDomainID) REFERENCES dbo.Master_RiskDomain(RiskDomainID)
);
GO

IF OBJECT_ID('dbo.Master_RiskType', 'U') IS NOT NULL DROP TABLE dbo.[Master_RiskType];
GO

CREATE TABLE dbo.[Master_RiskType] (
    RiskTypeID BIGINT IDENTITY(1,1) PRIMARY KEY,
    RiskTypeCode NVARCHAR(50) NOT NULL UNIQUE,
    RiskTypeName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_RiskType_RowPointer UNIQUE(RowPointer)
);
GO

IF OBJECT_ID('dbo.Master_RiskSource', 'U') IS NOT NULL DROP TABLE dbo.[Master_RiskSource];
GO

CREATE TABLE dbo.[Master_RiskSource] (
    RiskSourceID BIGINT IDENTITY(1,1) PRIMARY KEY,
    SourceCode NVARCHAR(50) NOT NULL UNIQUE,
    SourceName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_RiskSource_RowPointer UNIQUE(RowPointer)
);
GO

/* ============================================================================
   3. THREAT / VULNERABILITY / CAUSE / CONSEQUENCE
   ============================================================================ */

IF OBJECT_ID('dbo.Master_Threat', 'U') IS NOT NULL DROP TABLE dbo.[Master_Threat];
GO

CREATE TABLE dbo.[Master_Threat] (
    ThreatID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ThreatCode NVARCHAR(50) NOT NULL UNIQUE,
    ThreatName NVARCHAR(250) NOT NULL,
    ThreatType NVARCHAR(100) NULL,
    Description NVARCHAR(1000) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_Threat_RowPointer UNIQUE(RowPointer)
);
GO

IF OBJECT_ID('dbo.Master_Vulnerability', 'U') IS NOT NULL DROP TABLE dbo.[Master_Vulnerability];
GO

CREATE TABLE dbo.[Master_Vulnerability] (
    VulnerabilityID BIGINT IDENTITY(1,1) PRIMARY KEY,
    VulnerabilityCode NVARCHAR(50) NOT NULL UNIQUE,
    VulnerabilityName NVARCHAR(250) NOT NULL,
    VulnerabilityType NVARCHAR(100) NULL,
    Description NVARCHAR(1000) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_Vulnerability_RowPointer UNIQUE(RowPointer)
);
GO

IF OBJECT_ID('dbo.Master_Consequence', 'U') IS NOT NULL DROP TABLE dbo.[Master_Consequence];
GO

CREATE TABLE dbo.[Master_Consequence] (
    ConsequenceID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ConsequenceCode NVARCHAR(50) NOT NULL UNIQUE,
    ConsequenceName NVARCHAR(250) NOT NULL,
    Description NVARCHAR(1000) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_Consequence_RowPointer UNIQUE(RowPointer)
);
GO

/* ============================================================================
   4. IMPACT / LIKELIHOOD / RISK MATRIX
   ============================================================================ */

IF OBJECT_ID('dbo.Master_ImpactDimension', 'U') IS NOT NULL DROP TABLE dbo.[Master_ImpactDimension];
GO

CREATE TABLE dbo.[Master_ImpactDimension] (
    ImpactDimensionID BIGINT IDENTITY(1,1) PRIMARY KEY,
    DimensionCode NVARCHAR(50) NOT NULL UNIQUE,
    DimensionName NVARCHAR(200) NOT NULL,
    DimensionGroup NVARCHAR(100) NULL,
    Description NVARCHAR(1000) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_ImpactDimension_RowPointer UNIQUE(RowPointer)
);
GO

IF OBJECT_ID('dbo.Master_ImpactCriteria', 'U') IS NOT NULL DROP TABLE dbo.[Master_ImpactCriteria];
GO

CREATE TABLE dbo.[Master_ImpactCriteria] (
    ImpactCriteriaID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ImpactDimensionID BIGINT NULL,
    ImpactCategory NVARCHAR(100) NULL,
    ImpactID BIGINT NULL,
    ImpactScore INT NOT NULL,
    LevelCode NVARCHAR(50) NULL DEFAULT '',
    LevelName NVARCHAR(100) NOT NULL,
    LevelNameTH NVARCHAR(100) NOT NULL,
    Definition NVARCHAR(2000) NOT NULL,
    FinancialThreshold NVARCHAR(250) NULL,
    TimeThreshold NVARCHAR(250) NULL,
    OperationalImpact NVARCHAR(1000) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_ImpactCriteria_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_Master_ImpactCriteria_Dimension
        FOREIGN KEY(ImpactDimensionID) REFERENCES dbo.Master_ImpactDimension(ImpactDimensionID),
    -- UNIQUE(ImpactDimensionID, ImpactScore)
);
GO

IF OBJECT_ID('dbo.Master_LikelihoodCriteria', 'U') IS NOT NULL DROP TABLE dbo.[Master_LikelihoodCriteria];
GO

CREATE TABLE dbo.[Master_LikelihoodCriteria] (
    LikelihoodCriteriaID BIGINT IDENTITY(1,1) PRIMARY KEY,
    LikelihoodScore INT NOT NULL UNIQUE,
    LevelCode NVARCHAR(50) NULL,
    LevelName NVARCHAR(100) NOT NULL,
    LevelNameTH NVARCHAR(100) NOT NULL,
    Definition NVARCHAR(2000) NOT NULL,
    FrequencyDescription NVARCHAR(1000) NULL,
    ProbabilityDescription NVARCHAR(1000) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_LikelihoodCriteria_RowPointer UNIQUE(RowPointer)
);
GO

IF OBJECT_ID('dbo.Master_RiskLevel', 'U') IS NOT NULL DROP TABLE dbo.[Master_RiskLevel];
GO

CREATE TABLE dbo.[Master_RiskLevel] (
    RiskLevelID BIGINT IDENTITY(1,1) PRIMARY KEY,
    RiskLevelCode NVARCHAR(50) NULL,
    RiskLevelName NVARCHAR(100) NOT NULL,
    RiskLevelNameTH NVARCHAR(100) NOT NULL,
    MinScore INT NOT NULL,
    MaxScore INT NOT NULL,
    Description NVARCHAR(1000) NULL,
    RequiresTreatment BIT NOT NULL DEFAULT 0,
    RequiresAcceptance BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_RiskLevel_RowPointer UNIQUE(RowPointer),
    CONSTRAINT CK_Master_RiskLevel_Score CHECK(MinScore <= MaxScore)
);
GO

IF OBJECT_ID('dbo.Master_RiskMatrix', 'U') IS NOT NULL DROP TABLE dbo.[Master_RiskMatrix];
GO

CREATE TABLE dbo.[Master_RiskMatrix] (
    RiskMatrixID BIGINT IDENTITY(1,1) PRIMARY KEY,
    LikelihoodScore INT NOT NULL,
    ImpactScore INT NOT NULL,
    RiskScore AS (LikelihoodScore * ImpactScore) PERSISTED,
    RiskLevelID BIGINT NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_RiskMatrix_RowPointer UNIQUE(RowPointer),
    CONSTRAINT UQ_Master_RiskMatrix_Cell UNIQUE(LikelihoodScore, ImpactScore),
    CONSTRAINT FK_Master_RiskMatrix_Level
        FOREIGN KEY(RiskLevelID) REFERENCES dbo.Master_RiskLevel(RiskLevelID)
);
GO

/* ============================================================================
   5. CONTROL LIBRARY
   ============================================================================ */

IF OBJECT_ID('dbo.Master_ControlType', 'U') IS NOT NULL DROP TABLE dbo.[Master_ControlType];
GO

CREATE TABLE dbo.[Master_ControlType] (
    ControlTypeID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ControlTypeCode NVARCHAR(50) NOT NULL UNIQUE,
    ControlTypeName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_ControlType_RowPointer UNIQUE(RowPointer)
);
GO

IF OBJECT_ID('dbo.Master_ControlMethod', 'U') IS NOT NULL DROP TABLE dbo.[Master_ControlMethod];
GO

CREATE TABLE dbo.[Master_ControlMethod] (
    ControlMethodID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ControlMethodCode NVARCHAR(50) NOT NULL UNIQUE,
    ControlMethodName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_ControlMethod_RowPointer UNIQUE(RowPointer)
);
GO

IF OBJECT_ID('dbo.Master_ControlFrequency', 'U') IS NOT NULL DROP TABLE dbo.[Master_ControlFrequency];
GO

CREATE TABLE dbo.[Master_ControlFrequency] (
    ControlFrequencyID BIGINT IDENTITY(1,1) PRIMARY KEY,
    FrequencyCode NVARCHAR(50) NOT NULL UNIQUE,
    FrequencyName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_ControlFrequency_RowPointer UNIQUE(RowPointer)
);
GO

IF OBJECT_ID('dbo.Master_ControlEffectiveness', 'U') IS NOT NULL DROP TABLE dbo.[Master_ControlEffectiveness];
GO

CREATE TABLE dbo.[Master_ControlEffectiveness] (
    ControlEffectivenessID BIGINT IDENTITY(1,1) PRIMARY KEY,
    EffectivenessCode NVARCHAR(50) NOT NULL UNIQUE,
    EffectivenessName NVARCHAR(100) NOT NULL,
    EffectivenessScore INT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_ControlEffectiveness_RowPointer UNIQUE(RowPointer)
);
GO

IF OBJECT_ID('dbo.Master_Control', 'U') IS NOT NULL DROP TABLE dbo.[Master_Control];
GO

CREATE TABLE dbo.[Master_Control] (
    ControlID BIGINT IDENTITY(1,1) PRIMARY KEY,
    ControlCode NVARCHAR(50) NOT NULL UNIQUE,
    ControlName NVARCHAR(250) NOT NULL,
    ControlDescription NVARCHAR(2000) NULL,
    ControlTypeID BIGINT NULL,
    ControlMethodID BIGINT NULL,
    DefaultFrequencyID BIGINT NULL,
    DefaultEffectivenessID BIGINT NULL,
    RiskDomainID BIGINT NULL,
    RiskCategoryID BIGINT NULL,
    IsRecommended BIT NOT NULL DEFAULT 1,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_Control_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_Master_Control_Type FOREIGN KEY(ControlTypeID)
        REFERENCES dbo.Master_ControlType(ControlTypeID),
    CONSTRAINT FK_Master_Control_Method FOREIGN KEY(ControlMethodID)
        REFERENCES dbo.Master_ControlMethod(ControlMethodID),
    CONSTRAINT FK_Master_Control_Frequency FOREIGN KEY(DefaultFrequencyID)
        REFERENCES dbo.Master_ControlFrequency(ControlFrequencyID),
    CONSTRAINT FK_Master_Control_Effectiveness FOREIGN KEY(DefaultEffectivenessID)
        REFERENCES dbo.Master_ControlEffectiveness(ControlEffectivenessID),
    CONSTRAINT FK_Master_Control_Domain FOREIGN KEY(RiskDomainID)
        REFERENCES dbo.Master_RiskDomain(RiskDomainID),
    CONSTRAINT FK_Master_Control_Category FOREIGN KEY(RiskCategoryID)
        REFERENCES dbo.Master_RiskCategory(RiskCategoryID)
);
GO

/* ============================================================================
   6. TREATMENT / ACTION / STATUS MASTER
   ============================================================================ */

IF OBJECT_ID('dbo.Master_TreatmentStrategy', 'U') IS NOT NULL DROP TABLE dbo.[Master_TreatmentStrategy];
GO

CREATE TABLE dbo.[Master_TreatmentStrategy] (
    TreatmentStrategyID BIGINT IDENTITY(1,1) PRIMARY KEY,
    StrategyCode NVARCHAR(50) NOT NULL UNIQUE,
    StrategyName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(1000) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_TreatmentStrategy_RowPointer UNIQUE(RowPointer)
);
GO

IF OBJECT_ID('dbo.Master_ActionPriority', 'U') IS NOT NULL DROP TABLE dbo.[Master_ActionPriority];
GO

CREATE TABLE dbo.[Master_ActionPriority] (
    ActionPriorityID BIGINT IDENTITY(1,1) PRIMARY KEY,
    PriorityCode NVARCHAR(50) NOT NULL UNIQUE,
    PriorityName NVARCHAR(100) NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_ActionPriority_RowPointer UNIQUE(RowPointer)
);
GO

IF OBJECT_ID('dbo.Master_ActionStatus', 'U') IS NOT NULL DROP TABLE dbo.[Master_ActionStatus];
GO

CREATE TABLE dbo.[Master_ActionStatus] (
    ActionStatusID BIGINT IDENTITY(1,1) PRIMARY KEY,
    StatusCode NVARCHAR(50) NOT NULL UNIQUE,
    StatusName NVARCHAR(100) NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    IsFinal BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_ActionStatus_RowPointer UNIQUE(RowPointer)
);
GO

IF OBJECT_ID('dbo.Master_RiskStatus', 'U') IS NOT NULL DROP TABLE dbo.[Master_RiskStatus];
GO

CREATE TABLE dbo.[Master_RiskStatus] (
    RiskStatusID BIGINT IDENTITY(1,1) PRIMARY KEY,
    StatusCode NVARCHAR(50) NOT NULL UNIQUE,
    StatusName NVARCHAR(100) NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    IsFinal BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_RiskStatus_RowPointer UNIQUE(RowPointer)
);
GO

/* ============================================================================
   7. STANDARDS
   ============================================================================ */

IF OBJECT_ID('dbo.Master_Standard', 'U') IS NOT NULL DROP TABLE dbo.[Master_Standard];
GO

CREATE TABLE dbo.[Master_Standard] (
    StandardID BIGINT IDENTITY(1,1) PRIMARY KEY,
    StandardCode NVARCHAR(50) NOT NULL UNIQUE,
    StandardName NVARCHAR(250) NOT NULL,
    VersionName NVARCHAR(100) NULL,
    Description NVARCHAR(2000) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_Standard_RowPointer UNIQUE(RowPointer)
);
GO

IF OBJECT_ID('dbo.Master_StandardRequirement', 'U') IS NOT NULL DROP TABLE dbo.[Master_StandardRequirement];
GO

CREATE TABLE dbo.[Master_StandardRequirement] (
    RequirementID BIGINT IDENTITY(1,1) PRIMARY KEY,
    StandardID BIGINT NOT NULL,
    ParentRequirementID BIGINT NULL,
    RequirementCode NVARCHAR(100) NOT NULL,
    RequirementTitle NVARCHAR(500) NOT NULL,
    RequirementDescription NVARCHAR(3000) NULL,
    RequirementType NVARCHAR(100) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_StandardRequirement_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_Master_StandardRequirement_Standard
        FOREIGN KEY(StandardID) REFERENCES dbo.Master_Standard(StandardID),
    CONSTRAINT FK_Master_StandardRequirement_Parent
        FOREIGN KEY(ParentRequirementID) REFERENCES dbo.Master_StandardRequirement(RequirementID),
    CONSTRAINT UQ_Master_StandardRequirement_Code
        UNIQUE(StandardID, RequirementCode)
);
GO

/* ============================================================================
   8. RISK TEMPLATE LIBRARY
   ============================================================================ */

IF OBJECT_ID('dbo.Master_RiskTemplate', 'U') IS NOT NULL DROP TABLE dbo.[Master_RiskTemplate];
GO

CREATE TABLE dbo.[Master_RiskTemplate] (
    RiskTemplateID BIGINT IDENTITY(1,1) PRIMARY KEY,
    TemplateCode NVARCHAR(50) NOT NULL UNIQUE,
    TemplateName NVARCHAR(300) NOT NULL,
    RiskDomainID BIGINT NULL,
    RiskCategoryID BIGINT NULL,
    RiskTypeID BIGINT NULL,
    RiskSourceID BIGINT NULL,
    RiskStatement NVARCHAR(2000) NULL,
    Description NVARCHAR(3000) NULL,
    DefaultRiskLevelID BIGINT NULL,
    VersionNo INT NOT NULL DEFAULT 1,
    IsApproved BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT UQ_Master_RiskTemplate_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_Master_RiskTemplate_Domain FOREIGN KEY(RiskDomainID)
        REFERENCES dbo.Master_RiskDomain(RiskDomainID),
    CONSTRAINT FK_Master_RiskTemplate_Category FOREIGN KEY(RiskCategoryID)
        REFERENCES dbo.Master_RiskCategory(RiskCategoryID),
    CONSTRAINT FK_Master_RiskTemplate_Type FOREIGN KEY(RiskTypeID)
        REFERENCES dbo.Master_RiskType(RiskTypeID),
    CONSTRAINT FK_Master_RiskTemplate_Source FOREIGN KEY(RiskSourceID)
        REFERENCES dbo.Master_RiskSource(RiskSourceID),
    CONSTRAINT FK_Master_RiskTemplate_Level FOREIGN KEY(DefaultRiskLevelID)
        REFERENCES dbo.Master_RiskLevel(RiskLevelID)
);
GO

IF OBJECT_ID('dbo.Master_RiskTemplate_Threat', 'U') IS NOT NULL DROP TABLE dbo.[Master_RiskTemplate_Threat];
GO

CREATE TABLE dbo.[Master_RiskTemplate_Threat] (
    RiskTemplateID BIGINT NOT NULL,
    ThreatID BIGINT NOT NULL,
    IsPrimary BIT NOT NULL DEFAULT 0,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT PK_Master_RiskTemplate_Threat PRIMARY KEY(RiskTemplateID, ThreatID),
    CONSTRAINT UQ_Master_RiskTemplate_Threat_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_RTT_Template FOREIGN KEY(RiskTemplateID)
        REFERENCES dbo.Master_RiskTemplate(RiskTemplateID) ON DELETE CASCADE,
    CONSTRAINT FK_RTT_Threat FOREIGN KEY(ThreatID)
        REFERENCES dbo.Master_Threat(ThreatID)
);
GO

IF OBJECT_ID('dbo.Master_RiskTemplate_Vulnerability', 'U') IS NOT NULL DROP TABLE dbo.[Master_RiskTemplate_Vulnerability];
GO

CREATE TABLE dbo.[Master_RiskTemplate_Vulnerability] (
    RiskTemplateID BIGINT NOT NULL,
    VulnerabilityID BIGINT NOT NULL,
    IsPrimary BIT NOT NULL DEFAULT 0,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT PK_Master_RiskTemplate_Vulnerability PRIMARY KEY(RiskTemplateID, VulnerabilityID),
    CONSTRAINT UQ_Master_RiskTemplate_Vulnerability_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_RTV_Template FOREIGN KEY(RiskTemplateID)
        REFERENCES dbo.Master_RiskTemplate(RiskTemplateID) ON DELETE CASCADE,
    CONSTRAINT FK_RTV_Vulnerability FOREIGN KEY(VulnerabilityID)
        REFERENCES dbo.Master_Vulnerability(VulnerabilityID)
);
GO

IF OBJECT_ID('dbo.Master_RiskTemplate_Impact', 'U') IS NOT NULL DROP TABLE dbo.[Master_RiskTemplate_Impact];
GO

CREATE TABLE dbo.[Master_RiskTemplate_Impact] (
    RiskTemplateID BIGINT NOT NULL,
    ImpactDimensionID BIGINT NOT NULL DEFAULT 0,
    ImpactCategory NVARCHAR(100) NULL,
    ImpactID BIGINT NULL,
    DefaultImpactScore INT NULL,
    IsPrimary BIT NOT NULL DEFAULT 0,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT PK_Master_RiskTemplate_Impact PRIMARY KEY(RiskTemplateID, ImpactDimensionID),
    CONSTRAINT UQ_Master_RiskTemplate_Impact_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_RTI_Template FOREIGN KEY(RiskTemplateID)
        REFERENCES dbo.Master_RiskTemplate(RiskTemplateID) ON DELETE CASCADE,
    CONSTRAINT FK_RTI_Dimension FOREIGN KEY(ImpactDimensionID)
        REFERENCES dbo.Master_ImpactDimension(ImpactDimensionID)
);
GO

IF OBJECT_ID('dbo.Master_RiskTemplate_Control', 'U') IS NOT NULL DROP TABLE dbo.[Master_RiskTemplate_Control];
GO

CREATE TABLE dbo.[Master_RiskTemplate_Control] (
    RiskTemplateID BIGINT NOT NULL,
    ControlID BIGINT NOT NULL,
    IsRecommended BIT NOT NULL DEFAULT 1,
    IsMandatory BIT NOT NULL DEFAULT 0,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT PK_Master_RiskTemplate_Control PRIMARY KEY(RiskTemplateID, ControlID),
    CONSTRAINT UQ_Master_RiskTemplate_Control_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_RTC_Template FOREIGN KEY(RiskTemplateID)
        REFERENCES dbo.Master_RiskTemplate(RiskTemplateID) ON DELETE CASCADE,
    CONSTRAINT FK_RTC_Control FOREIGN KEY(ControlID)
        REFERENCES dbo.Master_Control(ControlID)
);
GO

IF OBJECT_ID('dbo.Master_RiskTemplate_Standard', 'U') IS NOT NULL DROP TABLE dbo.[Master_RiskTemplate_Standard];
GO

CREATE TABLE dbo.[Master_RiskTemplate_Standard] (
    RiskTemplateID BIGINT NOT NULL,
    StandardID BIGINT NOT NULL,
    RequirementID BIGINT NOT NULL DEFAULT 0,
    IsApplicable BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT PK_Master_RiskTemplate_Standard PRIMARY KEY(RiskTemplateID, StandardID, RequirementID),
    CONSTRAINT UQ_Master_RiskTemplate_Standard_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_RTS_Template FOREIGN KEY(RiskTemplateID)
        REFERENCES dbo.Master_RiskTemplate(RiskTemplateID) ON DELETE CASCADE,
    CONSTRAINT FK_RTS_Standard FOREIGN KEY(StandardID)
        REFERENCES dbo.Master_Standard(StandardID),
    CONSTRAINT FK_RTS_Requirement FOREIGN KEY(RequirementID)
        REFERENCES dbo.Master_StandardRequirement(RequirementID)
);
GO

IF OBJECT_ID('dbo.Master_RiskTemplate_Department', 'U') IS NOT NULL DROP TABLE dbo.[Master_RiskTemplate_Department];
GO

CREATE TABLE dbo.[Master_RiskTemplate_Department] (
    RiskTemplateID BIGINT NOT NULL,
    DepartmentID BIGINT NOT NULL,
    IsRecommended BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT PK_Master_RiskTemplate_Department PRIMARY KEY(RiskTemplateID, DepartmentID),
    CONSTRAINT UQ_Master_RiskTemplate_Department_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_RTD_Template FOREIGN KEY(RiskTemplateID)
        REFERENCES dbo.Master_RiskTemplate(RiskTemplateID) ON DELETE CASCADE,
    CONSTRAINT FK_RTD_Department FOREIGN KEY(DepartmentID)
        REFERENCES dbo.Master_Department(DepartmentID)
);
GO

/* ============================================================================
   9. DEPARTMENT / STANDARD MAPPING
   ============================================================================ */

IF OBJECT_ID('dbo.Master_Department_Standard', 'U') IS NOT NULL DROP TABLE dbo.[Master_Department_Standard];
GO

CREATE TABLE dbo.[Master_Department_Standard] (
    DepartmentID BIGINT NOT NULL,
    StandardID BIGINT NOT NULL,
    IsMandatory BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT PK_Master_Department_Standard PRIMARY KEY(DepartmentID, StandardID),
    CONSTRAINT UQ_Master_Department_Standard_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_MDS_Department FOREIGN KEY(DepartmentID)
        REFERENCES dbo.Master_Department(DepartmentID),
    CONSTRAINT FK_MDS_Standard FOREIGN KEY(StandardID)
        REFERENCES dbo.Master_Standard(StandardID)
);
GO

/* ============================================================================
   10. RISK REGISTER
   ============================================================================ */

IF OBJECT_ID('dbo.Risk_Register', 'U') IS NOT NULL DROP TABLE dbo.[Risk_Register];
GO

CREATE TABLE dbo.[Risk_Register] (
    RiskID BIGINT IDENTITY(1,1) PRIMARY KEY,
    RiskNo NVARCHAR(50) NOT NULL UNIQUE,
    RiskTitle NVARCHAR(500) NOT NULL,
    RiskDescription NVARCHAR(MAX) NULL,

    RiskDomainID BIGINT NULL,
    RiskCategoryID BIGINT NULL,
    RiskTypeID BIGINT NULL,
    RiskSourceID BIGINT NULL,

    BUID BIGINT NULL,
    DepartmentID BIGINT NULL,
    ProcessID BIGINT NULL,
    LocationID BIGINT NULL,
    AssetID BIGINT NULL,

    RiskTemplateID BIGINT NULL,

    RiskOwnerID BIGINT NULL,
    AssessorID BIGINT NULL,

    ExistingCondition NVARCHAR(3000) NULL,
    RiskStatement NVARCHAR(3000) NULL,
    RiskCause NVARCHAR(3000) NULL,
    RiskConsequence NVARCHAR(3000) NULL,

    RiskStatusID BIGINT NULL,

    AssessmentDate DATE NOT NULL DEFAULT GETDATE(),
    NextReviewDate DATE NULL,

    IsActive BIT NOT NULL DEFAULT 1,

    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),

    CONSTRAINT UQ_Risk_Register_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_Risk_Register_Domain FOREIGN KEY(RiskDomainID)
        REFERENCES dbo.Master_RiskDomain(RiskDomainID),
    CONSTRAINT FK_Risk_Register_Category FOREIGN KEY(RiskCategoryID)
        REFERENCES dbo.Master_RiskCategory(RiskCategoryID),
    CONSTRAINT FK_Risk_Register_Type FOREIGN KEY(RiskTypeID)
        REFERENCES dbo.Master_RiskType(RiskTypeID),
    CONSTRAINT FK_Risk_Register_Source FOREIGN KEY(RiskSourceID)
        REFERENCES dbo.Master_RiskSource(RiskSourceID),
    CONSTRAINT FK_Risk_Register_BU FOREIGN KEY(BUID)
        REFERENCES dbo.Master_BusinessUnit(BUID),
    CONSTRAINT FK_Risk_Register_Department FOREIGN KEY(DepartmentID)
        REFERENCES dbo.Master_Department(DepartmentID),
    CONSTRAINT FK_Risk_Register_Process FOREIGN KEY(ProcessID)
        REFERENCES dbo.Master_Process(ProcessID),
    CONSTRAINT FK_Risk_Register_Location FOREIGN KEY(LocationID)
        REFERENCES dbo.Master_Location(LocationID),
    CONSTRAINT FK_Risk_Register_Asset FOREIGN KEY(AssetID)
        REFERENCES dbo.Master_Asset(AssetID),
    CONSTRAINT FK_Risk_Register_Template FOREIGN KEY(RiskTemplateID)
        REFERENCES dbo.Master_RiskTemplate(RiskTemplateID),
    CONSTRAINT FK_Risk_Register_Status FOREIGN KEY(RiskStatusID)
        REFERENCES dbo.Master_RiskStatus(RiskStatusID)
);
GO

/* ============================================================================
   11. RISK IDENTIFICATION MAPPING
   ============================================================================ */

IF OBJECT_ID('dbo.Risk_Threat', 'U') IS NOT NULL DROP TABLE dbo.[Risk_Threat];
GO

CREATE TABLE dbo.[Risk_Threat] (
    RiskID BIGINT NOT NULL,
    ThreatID BIGINT NOT NULL,
    IsPrimary BIT NOT NULL DEFAULT 0,
    Description NVARCHAR(1000) NULL,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT PK_Risk_Threat PRIMARY KEY(RiskID, ThreatID),
    CONSTRAINT UQ_Risk_Threat_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_Risk_Threat_Risk FOREIGN KEY(RiskID)
        REFERENCES dbo.Risk_Register(RiskID) ON DELETE CASCADE,
    CONSTRAINT FK_Risk_Threat_Threat FOREIGN KEY(ThreatID)
        REFERENCES dbo.Master_Threat(ThreatID)
);
GO

IF OBJECT_ID('dbo.Risk_Vulnerability', 'U') IS NOT NULL DROP TABLE dbo.[Risk_Vulnerability];
GO

CREATE TABLE dbo.[Risk_Vulnerability] (
    RiskID BIGINT NOT NULL,
    VulnerabilityID BIGINT NOT NULL,
    IsPrimary BIT NOT NULL DEFAULT 0,
    Description NVARCHAR(1000) NULL,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT PK_Risk_Vulnerability PRIMARY KEY(RiskID, VulnerabilityID),
    CONSTRAINT UQ_Risk_Vulnerability_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_Risk_Vulnerability_Risk FOREIGN KEY(RiskID)
        REFERENCES dbo.Risk_Register(RiskID) ON DELETE CASCADE,
    CONSTRAINT FK_Risk_Vulnerability_Vulnerability FOREIGN KEY(VulnerabilityID)
        REFERENCES dbo.Master_Vulnerability(VulnerabilityID)
);
GO

IF OBJECT_ID('dbo.Risk_Consequence', 'U') IS NOT NULL DROP TABLE dbo.[Risk_Consequence];
GO

CREATE TABLE dbo.[Risk_Consequence] (
    RiskID BIGINT NOT NULL,
    ConsequenceID BIGINT NOT NULL,
    Description NVARCHAR(1000) NULL,
    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CONSTRAINT PK_Risk_Consequence PRIMARY KEY(RiskID, ConsequenceID),
    CONSTRAINT UQ_Risk_Consequence_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_Risk_Consequence_Risk FOREIGN KEY(RiskID)
        REFERENCES dbo.Risk_Register(RiskID) ON DELETE CASCADE,
    CONSTRAINT FK_Risk_Consequence_Consequence FOREIGN KEY(ConsequenceID)
        REFERENCES dbo.Master_Consequence(ConsequenceID)
);
GO

/* ============================================================================
   12. RISK ASSESSMENT
   ============================================================================ */

IF OBJECT_ID('dbo.Risk_Assessment', 'U') IS NOT NULL DROP TABLE dbo.[Risk_Assessment];
GO

CREATE TABLE dbo.[Risk_Assessment] (
    AssessmentID BIGINT IDENTITY(1,1) PRIMARY KEY,
    RiskID BIGINT NOT NULL,
    AssessmentType NVARCHAR(50) NOT NULL,
    AssessmentVersion INT NOT NULL DEFAULT 1,

    LikelihoodScore INT NOT NULL,
    ImpactScore INT NOT NULL,
    RiskScore AS (LikelihoodScore * ImpactScore) PERSISTED,

    RiskLevelID BIGINT NULL,

    AssessmentDate DATE NOT NULL DEFAULT GETDATE(),
    AssessorID BIGINT NULL,

    AssessmentComment NVARCHAR(3000) NULL,
    IsCurrent BIT NOT NULL DEFAULT 1,

    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),

    CONSTRAINT UQ_Risk_Assessment_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_Risk_Assessment_Risk FOREIGN KEY(RiskID)
        REFERENCES dbo.Risk_Register(RiskID) ON DELETE CASCADE,
    CONSTRAINT FK_Risk_Assessment_Level FOREIGN KEY(RiskLevelID)
        REFERENCES dbo.Master_RiskLevel(RiskLevelID)
);
GO

IF OBJECT_ID('dbo.Risk_Assessment_Impact', 'U') IS NOT NULL DROP TABLE dbo.[Risk_Assessment_Impact];
GO

CREATE TABLE dbo.[Risk_Assessment_Impact] (
    AssessmentID BIGINT NOT NULL,
    ImpactDimensionID BIGINT NOT NULL DEFAULT 0,
    ImpactCategory NVARCHAR(100) NULL,
    ImpactID BIGINT NULL,
    ImpactScore INT NOT NULL,
    ImpactComment NVARCHAR(2000) NULL,

    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),

    CONSTRAINT PK_Risk_Assessment_Impact
        PRIMARY KEY(AssessmentID, ImpactDimensionID),
    CONSTRAINT UQ_Risk_Assessment_Impact_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_RAI_Assessment FOREIGN KEY(AssessmentID)
        REFERENCES dbo.Risk_Assessment(AssessmentID) ON DELETE CASCADE,
    CONSTRAINT FK_RAI_Dimension FOREIGN KEY(ImpactDimensionID)
        REFERENCES dbo.Master_ImpactDimension(ImpactDimensionID)
);
GO

/* ============================================================================
   13. RISK / CONTROL
   ============================================================================ */

IF OBJECT_ID('dbo.Risk_Control', 'U') IS NOT NULL DROP TABLE dbo.[Risk_Control];
GO

CREATE TABLE dbo.[Risk_Control] (
    RiskControlID BIGINT IDENTITY(1,1) PRIMARY KEY,
    RiskID BIGINT NOT NULL,
    ControlID BIGINT NOT NULL,

    ControlNameOverride NVARCHAR(250) NULL,
    ControlDescription NVARCHAR(3000) NULL,

    ControlOwner NVARCHAR(200) NULL,
    FrequencyID BIGINT NULL,
    EffectivenessID BIGINT NULL,

    ImplementationStatus NVARCHAR(100) NOT NULL DEFAULT 'Implemented',
    LastTestDate DATE NULL,
    NextTestDate DATE NULL,

    ControlEvidence NVARCHAR(3000) NULL,
    EvidenceLocation NVARCHAR(2000) NULL,
    TestResult NVARCHAR(2000) NULL,

    IsKeyControl BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,

    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),

    CONSTRAINT UQ_Risk_Control_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_Risk_Control_Risk FOREIGN KEY(RiskID)
        REFERENCES dbo.Risk_Register(RiskID) ON DELETE CASCADE,
    CONSTRAINT FK_Risk_Control_Control FOREIGN KEY(ControlID)
        REFERENCES dbo.Master_Control(ControlID),
    CONSTRAINT FK_Risk_Control_Frequency FOREIGN KEY(FrequencyID)
        REFERENCES dbo.Master_ControlFrequency(ControlFrequencyID),
    CONSTRAINT FK_Risk_Control_Effectiveness FOREIGN KEY(EffectivenessID)
        REFERENCES dbo.Master_ControlEffectiveness(ControlEffectivenessID)
);
GO

/* ============================================================================
   14. STANDARDS / COMPLIANCE MAPPING
   ============================================================================ */

IF OBJECT_ID('dbo.Risk_Standard', 'U') IS NOT NULL DROP TABLE dbo.[Risk_Standard];
GO

CREATE TABLE dbo.[Risk_Standard] (
    RiskStandardID BIGINT IDENTITY(1,1) PRIMARY KEY,
    RiskID BIGINT NOT NULL,
    StandardID BIGINT NOT NULL,
    RequirementID BIGINT NOT NULL DEFAULT 0,

    ComplianceStatus NVARCHAR(100) NOT NULL DEFAULT 'Applicable',
    ComplianceGap NVARCHAR(3000) NULL,
    EvidenceReference NVARCHAR(3000) NULL,
    ComplianceComment NVARCHAR(3000) NULL,

    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),

    CONSTRAINT UQ_Risk_Standard_RowPointer UNIQUE(RowPointer),
    CONSTRAINT UQ_Risk_Standard_Map UNIQUE(RiskID, StandardID, RequirementID),
    CONSTRAINT FK_Risk_Standard_Risk FOREIGN KEY(RiskID)
        REFERENCES dbo.Risk_Register(RiskID) ON DELETE CASCADE,
    CONSTRAINT FK_Risk_Standard_Standard FOREIGN KEY(StandardID)
        REFERENCES dbo.Master_Standard(StandardID),
    CONSTRAINT FK_Risk_Standard_Requirement FOREIGN KEY(RequirementID)
        REFERENCES dbo.Master_StandardRequirement(RequirementID)
);
GO

/* ============================================================================
   15. TREATMENT
   ============================================================================ */

IF OBJECT_ID('dbo.Risk_Treatment', 'U') IS NOT NULL DROP TABLE dbo.[Risk_Treatment];
GO

CREATE TABLE dbo.[Risk_Treatment] (
    TreatmentID BIGINT IDENTITY(1,1) PRIMARY KEY,
    RiskID BIGINT NOT NULL,
    TreatmentStrategyID BIGINT NOT NULL,

    TreatmentObjective NVARCHAR(2000) NULL,
    TreatmentDescription NVARCHAR(3000) NOT NULL,

    TargetRiskLevelID BIGINT NULL,
    TargetDate DATE NULL,

    TreatmentOwner NVARCHAR(200) NULL,
    Budget DECIMAL(18,2) NULL,
    ResourceRequirement NVARCHAR(2000) NULL,

    Status NVARCHAR(100) NOT NULL DEFAULT 'Planned',

    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),

    CONSTRAINT UQ_Risk_Treatment_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_Risk_Treatment_Risk FOREIGN KEY(RiskID)
        REFERENCES dbo.Risk_Register(RiskID) ON DELETE CASCADE,
    CONSTRAINT FK_Risk_Treatment_Strategy FOREIGN KEY(TreatmentStrategyID)
        REFERENCES dbo.Master_TreatmentStrategy(TreatmentStrategyID),
    CONSTRAINT FK_Risk_Treatment_Level FOREIGN KEY(TargetRiskLevelID)
        REFERENCES dbo.Master_RiskLevel(RiskLevelID)
);
GO

/* ============================================================================
   16. ACTION PLAN
   ============================================================================ */

IF OBJECT_ID('dbo.Risk_Action', 'U') IS NOT NULL DROP TABLE dbo.[Risk_Action];
GO

CREATE TABLE dbo.[Risk_Action] (
    ActionID BIGINT IDENTITY(1,1) PRIMARY KEY,
    RiskID BIGINT NOT NULL,
    TreatmentID BIGINT NULL,

    ActionNo NVARCHAR(50) NULL,
    ActionTitle NVARCHAR(500) NOT NULL,
    ActionDescription NVARCHAR(3000) NULL,

    ActionOwner NVARCHAR(200) NULL,
    PriorityID BIGINT NULL,

    StartDate DATE NULL,
    TargetDate DATE NULL,
    CompletionDate DATE NULL,

    ProgressPercent INT NOT NULL DEFAULT 0,
    StatusID BIGINT NULL,

    ExpectedResult NVARCHAR(2000) NULL,
    VerificationMethod NVARCHAR(2000) NULL,
    VerificationDate DATE NULL,
    VerifiedBy NVARCHAR(200) NULL,

    IsActive BIT NOT NULL DEFAULT 1,

    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),

    CONSTRAINT UQ_Risk_Action_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_Risk_Action_Risk FOREIGN KEY(RiskID)
        REFERENCES dbo.Risk_Register(RiskID) ON DELETE CASCADE,
    CONSTRAINT FK_Risk_Action_Treatment FOREIGN KEY(TreatmentID)
        REFERENCES dbo.Risk_Treatment(TreatmentID),
    CONSTRAINT FK_Risk_Action_Priority FOREIGN KEY(PriorityID)
        REFERENCES dbo.Master_ActionPriority(ActionPriorityID),
    CONSTRAINT FK_Risk_Action_Status FOREIGN KEY(StatusID)
        REFERENCES dbo.Master_ActionStatus(ActionStatusID),
    CONSTRAINT CK_Risk_Action_Progress
        CHECK(ProgressPercent BETWEEN 0 AND 100)
);
GO

/* ============================================================================
   17. MONITORING / REVIEW
   ============================================================================ */

IF OBJECT_ID('dbo.Risk_Monitoring', 'U') IS NOT NULL DROP TABLE dbo.[Risk_Monitoring];
GO

CREATE TABLE dbo.[Risk_Monitoring] (
    MonitoringID BIGINT IDENTITY(1,1) PRIMARY KEY,
    RiskID BIGINT NOT NULL,

    MonitoringDate DATE NOT NULL DEFAULT GETDATE(),
    MonitoringType NVARCHAR(100) NULL,

    CurrentRiskLevelID BIGINT NULL,
    ControlEffectivenessID BIGINT NULL,

    KPI NVARCHAR(500) NULL,
    KPIValue NVARCHAR(500) NULL,
    Threshold NVARCHAR(500) NULL,

    Observation NVARCHAR(3000) NULL,
    Finding NVARCHAR(3000) NULL,
    RequiredAction NVARCHAR(3000) NULL,

    NextMonitoringDate DATE NULL,
    MonitorBy NVARCHAR(200) NULL,

    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),

    CONSTRAINT UQ_Risk_Monitoring_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_Risk_Monitoring_Risk FOREIGN KEY(RiskID)
        REFERENCES dbo.Risk_Register(RiskID) ON DELETE CASCADE,
    CONSTRAINT FK_Risk_Monitoring_Level FOREIGN KEY(CurrentRiskLevelID)
        REFERENCES dbo.Master_RiskLevel(RiskLevelID),
    CONSTRAINT FK_Risk_Monitoring_Effectiveness FOREIGN KEY(ControlEffectivenessID)
        REFERENCES dbo.Master_ControlEffectiveness(ControlEffectivenessID)
);
GO

/* ============================================================================
   18. RISK ACCEPTANCE
   ============================================================================ */

IF OBJECT_ID('dbo.Risk_Acceptance', 'U') IS NOT NULL DROP TABLE dbo.[Risk_Acceptance];
GO

CREATE TABLE dbo.[Risk_Acceptance] (
    AcceptanceID BIGINT IDENTITY(1,1) PRIMARY KEY,
    RiskID BIGINT NOT NULL,

    AcceptanceStatus NVARCHAR(100) NOT NULL DEFAULT 'Pending',
    AcceptedBy NVARCHAR(200) NULL,
    AcceptanceDate DATE NULL,

    AcceptanceReason NVARCHAR(3000) NULL,
    CompensatingControl NVARCHAR(3000) NULL,

    ExpiryDate DATE NULL,
    ReviewDate DATE NULL,

    ApprovalComment NVARCHAR(3000) NULL,

    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),

    CONSTRAINT UQ_Risk_Acceptance_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_Risk_Acceptance_Risk FOREIGN KEY(RiskID)
        REFERENCES dbo.Risk_Register(RiskID) ON DELETE CASCADE
);
GO

/* ============================================================================
   19. REVIEW / CLOSURE
   ============================================================================ */

IF OBJECT_ID('dbo.Risk_Review', 'U') IS NOT NULL DROP TABLE dbo.[Risk_Review];
GO

CREATE TABLE dbo.[Risk_Review] (
    ReviewID BIGINT IDENTITY(1,1) PRIMARY KEY,
    RiskID BIGINT NOT NULL,
    ReviewDate DATE NOT NULL DEFAULT GETDATE(),
    ReviewType NVARCHAR(100) NULL,
    ReviewResult NVARCHAR(3000) NULL,
    Decision NVARCHAR(200) NULL,
    NextReviewDate DATE NULL,
    ReviewedBy NVARCHAR(200) NULL,

    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),

    CONSTRAINT UQ_Risk_Review_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_Risk_Review_Risk FOREIGN KEY(RiskID)
        REFERENCES dbo.Risk_Register(RiskID) ON DELETE CASCADE
);
GO

IF OBJECT_ID('dbo.Risk_Closure', 'U') IS NOT NULL DROP TABLE dbo.[Risk_Closure];
GO

CREATE TABLE dbo.[Risk_Closure] (
    ClosureID BIGINT IDENTITY(1,1) PRIMARY KEY,
    RiskID BIGINT NOT NULL UNIQUE,

    ClosureDate DATE NOT NULL DEFAULT GETDATE(),
    ClosureReason NVARCHAR(3000) NOT NULL,
    ClosureResult NVARCHAR(3000) NULL,
    ClosedBy NVARCHAR(200) NULL,

    VerificationCompleted BIT NOT NULL DEFAULT 0,
    VerificationDate DATE NULL,
    VerifiedBy NVARCHAR(200) NULL,

    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',
    RowPointer UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),

    CONSTRAINT UQ_Risk_Closure_RowPointer UNIQUE(RowPointer),
    CONSTRAINT FK_Risk_Closure_Risk FOREIGN KEY(RiskID)
        REFERENCES dbo.Risk_Register(RiskID)
);
GO

/* ============================================================================
   20. AUDIT LOG
   ============================================================================ */

IF OBJECT_ID('dbo.Audit_Log', 'U') IS NOT NULL DROP TABLE dbo.[Audit_Log];
GO

CREATE TABLE dbo.[Audit_Log] (
    AuditLogID BIGINT IDENTITY(1,1) PRIMARY KEY,
    TableName SYSNAME NOT NULL,
    RecordID BIGINT NULL,
    RowPointer UNIQUEIDENTIFIER NULL,

    ActionType NVARCHAR(50) NOT NULL,
    FieldName NVARCHAR(200) NULL,
    OldValue NVARCHAR(MAX) NULL,
    NewValue NVARCHAR(MAX) NULL,

    UserName NVARCHAR(200) NULL,
    IPAddress NVARCHAR(100) NULL,

    CreateDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NOT NULL DEFAULT 'system',

    CONSTRAINT FK_Audit_Log_RowPointer
        FOREIGN KEY(RowPointer) REFERENCES dbo.Global_RowPointer(RowPointer)
);
GO

/* ============================================================================
   21. INDEXES
   ============================================================================ */

CREATE INDEX IX_Risk_Register_Department
ON dbo.Risk_Register(DepartmentID, IsActive);

CREATE INDEX IX_Risk_Register_Status
ON dbo.Risk_Register(RiskStatusID, IsActive);

CREATE INDEX IX_Risk_Register_Category
ON dbo.Risk_Register(RiskCategoryID, IsActive);

CREATE INDEX IX_Risk_Register_NextReview
ON dbo.Risk_Register(NextReviewDate, IsActive);

CREATE INDEX IX_Risk_Assessment_Risk_Current
ON dbo.Risk_Assessment(RiskID, IsCurrent, AssessmentDate DESC);

CREATE INDEX IX_Risk_Control_Risk
ON dbo.Risk_Control(RiskID, IsActive);

CREATE INDEX IX_Risk_Standard_Risk
ON dbo.Risk_Standard(RiskID);

CREATE INDEX IX_Risk_Action_Risk_Status
ON dbo.Risk_Action(RiskID, StatusID);

CREATE INDEX IX_Risk_Action_TargetDate
ON dbo.Risk_Action(TargetDate, StatusID);

CREATE INDEX IX_Risk_Monitoring_Risk_Date
ON dbo.Risk_Monitoring(RiskID, MonitoringDate DESC);

CREATE INDEX IX_Risk_Acceptance_Expiry
ON dbo.Risk_Acceptance(ExpiryDate, AcceptanceStatus);

CREATE INDEX IX_Audit_Log_Table_Record
ON dbo.Audit_Log(TableName, RecordID, CreateDate DESC);
GO

/* ============================================================================
   END
   ============================================================================ */
PRINT 'Enterprise Risk Management database tables created successfully.';
GO


/* ============================================================================
   22. COMPATIBILITY VIEWS FOR API SERVICE INTEROPERABILITY
   ============================================================================ */

IF OBJECT_ID('dbo.RiskHeader', 'V') IS NOT NULL DROP VIEW dbo.RiskHeader;
IF OBJECT_ID('dbo.RiskHeader', 'U') IS NULL
BEGIN
    EXEC('
    CREATE VIEW dbo.RiskHeader AS
    SELECT 
        RiskID,
        RiskNo,
        RiskTitle,
        RiskDescription,
        AssessmentDate,
        NextReviewDate AS ReviewDate,
        ''Initial'' AS AssessmentType,
        ''IT Risk'' AS RiskType,
        RiskCategoryID AS CategoryID,
        DepartmentID,
        ProcessID,
        LocationID,
        BUID,
        AssetID,
        OwnerID AS RiskOwnerID,
        OwnerID AS AssessorID,
        OwnerID AS ApproverID,
        ThreatDescription AS Threat,
        VulnerabilityDescription AS Vulnerability,
        RootCause AS RiskCause,
        ConsequenceDescription AS RiskConsequence,
        ExistingCondition,
        PotentialImpact,
        CASE WHEN IsActive = 1 THEN ''Open'' ELSE ''Closed'' END AS Status,
        IsActive,
        CreateDate,
        CreatedBy,
        UpdatedDate,
        UpdatedBy
    FROM dbo.Risk_Register;
    ');
END
GO

IF OBJECT_ID('dbo.TR_RiskHeader_InsteadOfInsert', 'TR') IS NOT NULL DROP TRIGGER dbo.TR_RiskHeader_InsteadOfInsert;
GO
CREATE TRIGGER dbo.TR_RiskHeader_InsteadOfInsert
ON dbo.RiskHeader
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Risk_Register (
        RiskNo, RiskTitle, RiskDescription, AssessmentDate, NextReviewDate,
        RiskCategoryID, DepartmentID, ProcessID, LocationID, BUID, AssetID, OwnerID,
        ThreatDescription, VulnerabilityDescription, RootCause, ConsequenceDescription,
        ExistingCondition, PotentialImpact, IsActive, CreateDate, CreatedBy, UpdatedDate, UpdatedBy
    )
    SELECT 
        i.RiskNo, i.RiskTitle, i.RiskDescription, ISNULL(i.AssessmentDate, GETDATE()), i.ReviewDate,
        ISNULL(i.CategoryID, 1), ISNULL(i.DepartmentID, 1), i.ProcessID, i.LocationID, i.BUID, i.AssetID, ISNULL(i.RiskOwnerID, ISNULL(i.AssessorID, 1)),
        i.Threat, i.Vulnerability, i.RiskCause, i.RiskConsequence,
        i.ExistingCondition, i.PotentialImpact, 
        CASE WHEN i.Status = 'Closed' OR i.IsActive = 0 THEN 0 ELSE 1 END,
        GETDATE(), ISNULL(i.CreatedBy, 'system'), GETDATE(), ISNULL(i.UpdatedBy, 'system')
    FROM inserted i;
END;
GO

IF OBJECT_ID('dbo.TR_RiskHeader_InsteadOfUpdate', 'TR') IS NOT NULL DROP TRIGGER dbo.TR_RiskHeader_InsteadOfUpdate;
GO
CREATE TRIGGER dbo.TR_RiskHeader_InsteadOfUpdate
ON dbo.RiskHeader
INSTEAD OF UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE r
    SET 
        r.RiskNo = ISNULL(i.RiskNo, r.RiskNo),
        r.RiskTitle = ISNULL(i.RiskTitle, r.RiskTitle),
        r.RiskDescription = ISNULL(i.RiskDescription, r.RiskDescription),
        r.AssessmentDate = ISNULL(i.AssessmentDate, r.AssessmentDate),
        r.NextReviewDate = ISNULL(i.ReviewDate, r.NextReviewDate),
        r.RiskCategoryID = ISNULL(i.CategoryID, r.RiskCategoryID),
        r.DepartmentID = ISNULL(i.DepartmentID, r.DepartmentID),
        r.ProcessID = ISNULL(i.ProcessID, r.ProcessID),
        r.LocationID = ISNULL(i.LocationID, r.LocationID),
        r.BUID = ISNULL(i.BUID, r.BUID),
        r.AssetID = ISNULL(i.AssetID, r.AssetID),
        r.OwnerID = ISNULL(i.RiskOwnerID, ISNULL(i.AssessorID, r.OwnerID)),
        r.ThreatDescription = ISNULL(i.Threat, r.ThreatDescription),
        r.VulnerabilityDescription = ISNULL(i.Vulnerability, r.VulnerabilityDescription),
        r.RootCause = ISNULL(i.RiskCause, r.RootCause),
        r.ConsequenceDescription = ISNULL(i.RiskConsequence, r.ConsequenceDescription),
        r.ExistingCondition = ISNULL(i.ExistingCondition, r.ExistingCondition),
        r.PotentialImpact = ISNULL(i.PotentialImpact, r.PotentialImpact),
        r.IsActive = CASE WHEN i.Status = 'Closed' OR i.IsActive = 0 THEN 0 ELSE 1 END,
        r.UpdatedDate = GETDATE()
    FROM dbo.Risk_Register r
    JOIN inserted i ON r.RiskID = i.RiskID;
END;
GO

IF OBJECT_ID('dbo.RiskAssessment', 'V') IS NOT NULL DROP VIEW dbo.RiskAssessment;
IF OBJECT_ID('dbo.RiskAssessment', 'U') IS NULL
BEGIN
    EXEC('
    CREATE VIEW dbo.RiskAssessment AS
    SELECT 
        AssessmentID, RiskID, AssessmentType, LikelihoodScore AS Likelihood, ImpactScore AS Impact,
        ConfidentialityImpact, IntegrityImpact, AvailabilityImpact, QualityImpact, FinancialImpact,
        RiskScore, RiskLevel, AssessorID, AssessmentDate, Comments, IsActive, CreateDate, CreatedBy, UpdatedDate, UpdatedBy
    FROM dbo.Risk_Assessment;
    ');
END
GO

IF OBJECT_ID('dbo.TR_RiskAssessment_InsteadOfInsert', 'TR') IS NOT NULL DROP TRIGGER dbo.TR_RiskAssessment_InsteadOfInsert;
GO
CREATE TRIGGER dbo.TR_RiskAssessment_InsteadOfInsert
ON dbo.RiskAssessment
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Risk_Assessment (
        RiskID, AssessmentType, LikelihoodScore, ImpactScore,
        ConfidentialityImpact, IntegrityImpact, AvailabilityImpact, QualityImpact, FinancialImpact,
        RiskLevel, AssessorID, Comments, IsActive, CreateDate, CreatedBy, UpdatedDate, UpdatedBy
    )
    SELECT 
        i.RiskID, ISNULL(i.AssessmentType, 'INHERENT'), ISNULL(i.Likelihood, 1), ISNULL(i.Impact, 1),
        i.ConfidentialityImpact, i.IntegrityImpact, i.AvailabilityImpact, i.QualityImpact, i.FinancialImpact,
        i.RiskLevel, ISNULL(i.AssessorID, 1), i.Comments, 1, GETDATE(), 'system', GETDATE(), 'system'
    FROM inserted i;
END;
GO

IF OBJECT_ID('dbo.RiskControl', 'V') IS NOT NULL DROP VIEW dbo.RiskControl;
IF OBJECT_ID('dbo.RiskControl', 'U') IS NULL
BEGIN
    EXEC('
    CREATE VIEW dbo.RiskControl AS
    SELECT 
        ControlID, RiskID, ControlCode, ControlName, ControlDescription, ControlType,
        ManualOrAutomated, ControlOwner, Frequency, ControlEvidence, ControlEffectiveness,
        IsActive, CreateDate, CreatedBy, UpdatedDate, UpdatedBy
    FROM dbo.Risk_Control;
    ');
END
GO

IF OBJECT_ID('dbo.TR_RiskControl_InsteadOfInsert', 'TR') IS NOT NULL DROP TRIGGER dbo.TR_RiskControl_InsteadOfInsert;
GO
CREATE TRIGGER dbo.TR_RiskControl_InsteadOfInsert
ON dbo.RiskControl
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Risk_Control (
        RiskID, ControlCode, ControlName, ControlDescription, ControlType,
        ManualOrAutomated, ControlOwner, Frequency, ControlEvidence, ControlEffectiveness,
        IsActive, CreateDate, CreatedBy, UpdatedDate, UpdatedBy
    )
    SELECT 
        i.RiskID, ISNULL(i.ControlCode, 'CTL-01'), i.ControlName, i.ControlDescription, i.ControlType,
        i.ManualOrAutomated, i.ControlOwner, i.Frequency, i.ControlEvidence, i.ControlEffectiveness,
        1, GETDATE(), 'system', GETDATE(), 'system'
    FROM inserted i;
END;
GO

IF OBJECT_ID('dbo.RiskStandardMapping', 'V') IS NOT NULL DROP VIEW dbo.RiskStandardMapping;
IF OBJECT_ID('dbo.RiskStandardMapping', 'U') IS NULL
BEGIN
    EXEC('
    CREATE VIEW dbo.RiskStandardMapping AS
    SELECT 
        MappingID, RiskID, StandardID, ClauseID, ControlReference, ComplianceGap, Status,
        IsActive, CreateDate, CreatedBy, UpdatedDate, UpdatedBy
    FROM dbo.Risk_Standard;
    ');
END
GO

IF OBJECT_ID('dbo.TR_RiskStandardMapping_InsteadOfInsert', 'TR') IS NOT NULL DROP TRIGGER dbo.TR_RiskStandardMapping_InsteadOfInsert;
GO
CREATE TRIGGER dbo.TR_RiskStandardMapping_InsteadOfInsert
ON dbo.RiskStandardMapping
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Risk_Standard (
        RiskID, StandardID, ClauseID, ControlReference, ComplianceGap, Status,
        IsActive, CreateDate, CreatedBy, UpdatedDate, UpdatedBy
    )
    SELECT 
        i.RiskID, i.StandardID, i.ClauseID, i.ControlReference, i.ComplianceGap, ISNULL(i.Status, 'Compliant'),
        1, GETDATE(), 'system', GETDATE(), 'system'
    FROM inserted i;
END;
GO

IF OBJECT_ID('dbo.RiskTreatmentAction', 'V') IS NOT NULL DROP VIEW dbo.RiskTreatmentAction;
IF OBJECT_ID('dbo.RiskTreatmentAction', 'U') IS NULL
BEGIN
    EXEC('
    CREATE VIEW dbo.RiskTreatmentAction AS
    SELECT 
        ActionID, RiskID, TreatmentStrategy, TreatmentAction, ActionOwner, TargetDate,
        Priority, RequiredBudget, ProgressPercent, Status, IsActive, CreateDate, CreatedBy, UpdatedDate, UpdatedBy
    FROM dbo.Risk_Action;
    ');
END
GO

IF OBJECT_ID('dbo.TR_RiskTreatmentAction_InsteadOfInsert', 'TR') IS NOT NULL DROP TRIGGER dbo.TR_RiskTreatmentAction_InsteadOfInsert;
GO
CREATE TRIGGER dbo.TR_RiskTreatmentAction_InsteadOfInsert
ON dbo.RiskTreatmentAction
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Risk_Action (
        RiskID, TreatmentStrategy, TreatmentAction, ActionOwner, TargetDate, Priority,
        RequiredBudget, ProgressPercent, Status, IsActive, CreateDate, CreatedBy, UpdatedDate, UpdatedBy
    )
    SELECT 
        i.RiskID, i.TreatmentStrategy, i.TreatmentAction, i.ActionOwner, i.TargetDate, ISNULL(i.Priority, 'Medium'),
        ISNULL(i.RequiredBudget, 0), ISNULL(i.ProgressPercent, 0), ISNULL(i.Status, 'In Progress'),
        1, GETDATE(), 'system', GETDATE(), 'system'
    FROM inserted i;
END;
GO

IF OBJECT_ID('dbo.RiskAcceptance', 'V') IS NOT NULL DROP VIEW dbo.RiskAcceptance;
IF OBJECT_ID('dbo.RiskAcceptance', 'U') IS NULL
BEGIN
    EXEC('
    CREATE VIEW dbo.RiskAcceptance AS
    SELECT 
        AcceptanceID, RiskID, IsRequired, AcceptedBy, AcceptanceDate, AcceptanceReason, ReviewFrequency,
        IsActive, CreateDate, CreatedBy, UpdatedDate, UpdatedBy
    FROM dbo.Risk_Acceptance;
    ');
END
GO

IF OBJECT_ID('dbo.TR_RiskAcceptance_InsteadOfInsert', 'TR') IS NOT NULL DROP TRIGGER dbo.TR_RiskAcceptance_InsteadOfInsert;
GO
CREATE TRIGGER dbo.TR_RiskAcceptance_InsteadOfInsert
ON dbo.RiskAcceptance
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Risk_Acceptance (
        RiskID, IsRequired, AcceptedBy, AcceptanceDate, AcceptanceReason, ReviewFrequency,
        IsActive, CreateDate, CreatedBy, UpdatedDate, UpdatedBy
    )
    SELECT 
        i.RiskID, ISNULL(i.IsRequired, 1), i.AcceptedBy, ISNULL(i.AcceptanceDate, GETDATE()), i.AcceptanceReason, ISNULL(i.ReviewFrequency, 'Annual'),
        1, GETDATE(), 'system', GETDATE(), 'system'
    FROM inserted i;
END;
GO

IF OBJECT_ID('dbo.AuditLog', 'V') IS NOT NULL DROP VIEW dbo.AuditLog;
IF OBJECT_ID('dbo.AuditLog', 'U') IS NULL
BEGIN
    EXEC('
    CREATE VIEW dbo.AuditLog AS
    SELECT 
        AuditLogID AS LogID,
        UserName AS UserID,
        ActionType AS Action,
        TableName,
        RecordID,
        OldValue,
        NewValue,
        CreateDate
    FROM dbo.Audit_Log;
    ');
END
GO

IF OBJECT_ID('dbo.TR_AuditLog_InsteadOfInsert', 'TR') IS NOT NULL DROP TRIGGER dbo.TR_AuditLog_InsteadOfInsert;
GO
CREATE TRIGGER dbo.TR_AuditLog_InsteadOfInsert
ON dbo.AuditLog
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Audit_Log (
        UserName, ActionType, TableName, RecordID, OldValue, NewValue, CreateDate
    )
    SELECT 
        ISNULL(i.UserID, 'system'), ISNULL(i.Action, 'LOG'), ISNULL(i.TableName, 'System'),
        i.RecordID, i.OldValue, i.NewValue, GETDATE()
    FROM inserted i;
END;
GO

IF OBJECT_ID('dbo.TR_RiskHeader_InsteadOfDelete', 'TR') IS NOT NULL DROP TRIGGER dbo.TR_RiskHeader_InsteadOfDelete;
GO
CREATE TRIGGER dbo.TR_RiskHeader_InsteadOfDelete
ON dbo.RiskHeader
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.Risk_Register WHERE RiskID IN (SELECT RiskID FROM deleted);
END;
GO

/* ============================================================================
   23. MASTER STANDARD CLAUSE COMPATIBILITY VIEW & TRIGGERS
   ============================================================================ */

IF OBJECT_ID('dbo.Master_StandardClause', 'V') IS NOT NULL DROP VIEW dbo.Master_StandardClause;
IF OBJECT_ID('dbo.Master_StandardClause', 'U') IS NULL
BEGIN
    EXEC('
    CREATE VIEW dbo.Master_StandardClause AS
    SELECT 
        RequirementID AS ClauseID,
        StandardID,
        RequirementCode AS ClauseNo,
        RequirementTitle AS ClauseTitle,
        RequirementDescription AS Description,
        IsActive,
        CreateDate,
        CreatedBy,
        UpdatedDate,
        UpdatedBy
    FROM dbo.Master_StandardRequirement;
    ');
END
GO

IF OBJECT_ID('dbo.TR_Master_StandardClause_InsteadOfInsert', 'TR') IS NOT NULL DROP TRIGGER dbo.TR_Master_StandardClause_InsteadOfInsert;
GO
CREATE TRIGGER dbo.TR_Master_StandardClause_InsteadOfInsert
ON dbo.Master_StandardClause
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Master_StandardRequirement (
        StandardID, ParentRequirementID, RequirementCode, RequirementTitle, RequirementDescription, RequirementType, IsActive, CreateDate, CreatedBy, UpdatedDate, UpdatedBy
    )
    SELECT 
        i.StandardID, NULL, i.ClauseNo, i.ClauseTitle, i.Description, 'Clause', ISNULL(i.IsActive, 1), GETDATE(), ISNULL(i.CreatedBy, 'system'), GETDATE(), ISNULL(i.UpdatedBy, 'system')
    FROM inserted i;
END;
GO

IF OBJECT_ID('dbo.TR_Master_StandardClause_InsteadOfUpdate', 'TR') IS NOT NULL DROP TRIGGER dbo.TR_Master_StandardClause_InsteadOfUpdate;
GO
CREATE TRIGGER dbo.TR_Master_StandardClause_InsteadOfUpdate
ON dbo.Master_StandardClause
INSTEAD OF UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE r
    SET 
        r.StandardID = ISNULL(i.StandardID, r.StandardID),
        r.RequirementCode = ISNULL(i.ClauseNo, r.RequirementCode),
        r.RequirementTitle = ISNULL(i.ClauseTitle, r.RequirementTitle),
        r.RequirementDescription = ISNULL(i.Description, r.RequirementDescription),
        r.IsActive = ISNULL(i.IsActive, r.IsActive),
        r.UpdatedDate = GETDATE(),
        r.UpdatedBy = ISNULL(i.UpdatedBy, 'system')
    FROM dbo.Master_StandardRequirement r
    JOIN inserted i ON r.RequirementID = i.ClauseID;
END;
GO

IF OBJECT_ID('dbo.TR_Master_StandardClause_InsteadOfDelete', 'TR') IS NOT NULL DROP TRIGGER dbo.TR_Master_StandardClause_InsteadOfDelete;
GO
CREATE TRIGGER dbo.TR_Master_StandardClause_InsteadOfDelete
ON dbo.Master_StandardClause
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.Master_StandardRequirement WHERE RequirementID IN (SELECT ClauseID FROM deleted);
END;
GO
