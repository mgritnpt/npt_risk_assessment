# 🛡️ IT Risk Assessment & Governance Platform

โปรแกรมประเมินและบริหารจัดการความเสี่ยงด้านเทคโนโลยีสารสนเทศ (IT Risk Assessment System) ออกแบบเฉพาะสำหรับ **บริษัทผลิตและจำหน่ายผลิตภัณฑ์สี (Decorative, Automotive OEM, Industrial Coatings) และให้บริการเคลือบผิวชิ้นงาน (Technical Surface Coating Services)** 

ระบบรองรับการประเมินความเสี่ยงตามโครงสร้างพื้นฐานระบบ **SAP ECC6 ERP บน AWS Cloud**, ระบบเครือข่าย Multi-Plant, และการบริหารจัดการความปลอดภัยด้วย **GLPI**, **HCL BigFix**, **SentinelOne EDR**, และ **Proficio 24/7 Managed SOC** ครอบคลุม **4 มาตรฐานอุตสาหกรรม**:
- 🚗 **IATF 16949:2016** (Automotive Quality Management System)
- 🏭 **ISO 9001:2015** (Quality Management System)
- 🔒 **JAMA / JAPIA Cybersecurity Guidelines v2.0** (Automotive Supply Chain Security)
- 🛡️ **ISO/IEC 27001:2022** (Information Security Management System)

---

## ✨ คุณสมบัติหลักของระบบ (Key Features)

### 1. 📊 Interactive Dashboard & Heatmap Risk Matrix (5x5)
- ตารางเมทริกซ์ 5x5 วิเคราะห์ความเสี่ยงซ้อนความถี่ (Likelihood L1-L5) และผลกระทบ (Impact I1-I5 CIA/Quality)
- แสดงระดับความเสี่ยงตามโค้ดสีสากล (**Critical**, **High**, **Medium**, **Low**)
- ระบบกรองข้อมูลความเสี่ยงแบบค้นหาเร็ว (Search, Department, Risk Category, Status, Heatmap Cell Drill-down)

### 2. 📝 7-Step Comprehensive Risk Register Flow
- **Step 1: Risk Identification Header**: รหัสความเสี่ยง, ประเภทความเสี่ยง, Threat, Vulnerability, Cause, Consequence
- **Step 2: Inherent Risk Assessment**: ประเมินความเสี่ยงตั้งต้นก่อนมีมาตรการควบคุม (Likelihood x Impact)
- **Step 3: Existing Controls Identification**: บันทึกมาตรการควบคุมที่มีอยู่ (Preventive, Detective, Automated, Manual)
- **Step 4: Residual Risk Assessment**: ประเมินความเสี่ยงสุทธิหลังมีมาตรการควบคุม
- **Step 5: Standards & Compliance Mapping**: เชื่อมโยงข้อกำหนดมาตรฐาน IATF 16949, ISO 9001, JAMA/JAPIA, ISO 27001
- **Step 6: Risk Treatment & Action Plan**: แผนจัดการความเสี่ยง, ผู้รับผิดชอบ, งบประมาณ, เปอร์เซ็นต์ความคืบหน้า
- **Step 7: Management Acceptance**: ระบบอนุมัติและยอมรับระดับความเสี่ยงส่วนเกินโดยผู้บริหาร

### 3. ⚙️ Master Data Studio (Full CRUD - เพิ่ม, แก้ไข, ลบ, ดูข้อมูล)
รองรับการจัดการข้อมูลหลักครอบคลุม 10 หมวดหมู่:
- **Likelihood Criteria**: เกณฑ์โอกาสเกิด L1-L5 (คำนิยามและความถี่)
- **Impact Criteria**: เกณฑ์ผลกระทบ I1-I5 (CIA, การเงิน, การปฏิบัติงาน)
- **Risk Categories**: หมวดหมู่ความเสี่ยง (Cloud AWS, Paint Recipe, Automation OT ฯลฯ)
- **Departments & Processes**: แผนกและกระบวนการทำงานในองค์กร
- **Assets, Locations & Business Units**: สินทรัพย์ IT/OT, โรงงาน (HQ, Chonburi, Rayong, Samut Prakan), และสายธุรกิจ
- **Standards & Clauses**: มาตรฐานและข้อกำหนดอุตสาหกรรม
- **Audit Logs History**: บันทึกประวัติการปรับเปลี่ยนข้อมูลในระบบย้อนหลังแบบอัตโนมัติ

### 4. 📈 Risk Assessment Excel Exporter (`.xlsx`)
- ส่งออกรายงานการประเมินความเสี่ยงจัดรูปแบบสวยงามแบบ Multi-Sheet 
  - `Risk_Register`: รายการประเมินความเสี่ยงฉบับสมบูรณ์
  - `Executive_Summary`: สรุปสถิติความเสี่ยงแยกตามความรุนแรง
  - `Risk_Criteria`: ตารางเกณฑ์อ้างอิง Likelihood & Impact

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios, XLSX
- **Backend**: Node.js, Express.js, `mssql` (SQL Server Driver), Helmet, CORS, Morgan
- **Database**: Microsoft SQL Server 2022 (Database Name: `IT_Apps`)
- **Containerization**: Docker, Docker Compose, Nginx (Alpine)

---

## 🚀 การติดตั้งและใช้งานผ่าน Portainer (Portainer Stack Deployment)

ระบบถูกออกแบบมาให้รองรับการ Deploy ผ่าน **Portainer** ได้ง่ายดายภายใน 1-Click โดยอัตโนมัติ:

1. เปิดหน้า **Portainer Web UI**
2. ไปที่เมนู **Stacks** ➔ คลิกปุ่ม **+ Add stack**
3. เลือก Build Method เป็น **Repository**
4. กรอกข้อมูลดังนี้:
   - **Name**: `npt-risk-assessment`
   - **Repository URL**: `https://github.com/mgritnpt/npt_risk_assessment`
   - **Repository reference**: `refs/heads/main`
   - **Compose path**: `docker-compose.yml`
5. คลิก **Deploy the stack**

> ℹ️ **หมายเหตุ**: เมื่อเริ่มรัน Stack ครั้งแรก Backend จะทำการสร้าง Database `IT_Apps`, ตารางทั้งหมด และลงข้อมูลเริ่มต้น (Seed Data) สำหรับอุตสาหกรรมสีและมาตรฐานทั้ง 4 ให้อัตโนมัติทันที

---

## 🐳 การติดตั้งผ่าน Docker Compose บนเครื่อง Local

```bash
# 1. Clone repository
git clone https://github.com/mgritnpt/npt_risk_assessment.git
cd npt_risk_assessment

# 2. รันบริการทั้งหมดด้วย Docker Compose
docker-compose up -d --build
```

เข้าใช้งานผ่านเว็บเบราว์เซอร์:
- 🟢 **Frontend Web UI**: [http://localhost:3000](http://localhost:3000)
- 🟢 **Backend API Service**: [http://localhost:5001](http://localhost:5001)

---

## 💻 การติดตั้งสำหรับนักพัฒนา (Local Development Setup)

### 1. Database Setup (MS SQL Server)
- นำไฟล์ SQL สคริปต์ในโฟลเดอร์ `database/` ไปรันเรียงตามลำดับ:
  1. `database/001_create_database.sql`
  2. `database/002_create_tables.sql`
  3. `database/003_seed_data.sql`

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
*Backend รันบนพอร์ต `5001`*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend รันบนพอร์ต `3000`*

---

## 📡 สรุป API Endpoints หลัก (API Reference)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/health` | ตรวจสอบสถานะการทำงานของระบบ |
| **GET** | `/api/dashboard/summary` | สรุปข้อมูล Dashboard & Heatmap Matrix |
| **GET** | `/api/risks` | ดึงรายการความเสี่ยงทั้งหมด (รองรับ Query filters) |
| **POST** | `/api/risks` | เพิ่มรายการประเมินความเสี่ยงใหม่ |
| **PUT** | `/api/risks/:id` | แก้ไขรายการประเมินความเสี่ยง |
| **DELETE** | `/api/risks/:id` | ลบรายการประเมินความเสี่ยง (Soft-delete) |
| **GET** | `/api/master/categories` | ดึงรายการ Risk Categories |
| **POST/PUT/DELETE**| `/api/master/:type/:id` | จัดการข้อมูล Master Data ทั้ง 10 หมวดหมู่ |
| **GET** | `/api/master/audit-logs` | ดึงประวัติ Audit Logs |

---

## 📄 License & Organization

พัฒนาสำหรับใช้ในองค์กร **Nippon Paint Group / Paint & Coatings Industry IT Risk Assessment System**
