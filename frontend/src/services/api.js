import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to translate HTTP error status codes (502, 503, 504, etc.) into clear Thai error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let friendlyMessage = '';
    if (!error.response) {
      friendlyMessage = 'ไม่สามารถเชื่อมต่อระบบหลังบ้านได้ (Network Error / Offline)\nกรุณาตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่ หรือตรวจสอบการเชื่อมต่อเครือข่ายของคุณ';
    } else {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 502) {
        friendlyMessage = 'เซิร์ฟเวอร์หลังบ้านกำลังเริ่มต้นระบบ หรือกำลัง Re-deploy ชั่วคราว (HTTP 502 Bad Gateway)\nกรุณารอประมาณ 5-10 วินาที แล้วลองกดบันทึกใหม่อีกครั้ง';
      } else if (status === 503) {
        friendlyMessage = 'ระบบไม่พร้อมให้บริการชั่วคราว (HTTP 503 Service Unavailable)\nกรุณาลองใหม่อีกครั้งในอีกสักครู่';
      } else if (status === 504) {
        friendlyMessage = 'การเชื่อมต่อหมดเวลา (HTTP 504 Gateway Timeout)\nกรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง';
      } else if (status === 404) {
        friendlyMessage = typeof data === 'object' && data?.message ? data.message : 'ไม่พบข้อมูลที่ต้องการในระบบ (HTTP 404 Not Found)';
      } else if (status === 400) {
        const msg = typeof data === 'object' ? (data?.message || data?.error) : null;
        friendlyMessage = msg || 'ข้อมูลที่ส่งมาไม่ถูกต้อง (HTTP 400 Bad Request)';
      } else {
        let mainMsg = typeof data === 'object' ? (data?.message || data?.error) : null;
        if (!mainMsg) mainMsg = error.message || `เกิดข้อผิดพลาดในการรับส่งข้อมูล (HTTP ${status})`;
        const detailsMsg = (typeof data === 'object' && data?.details) ? `\nรายละเอียด: ${data.details}` : '';
        friendlyMessage = `${mainMsg}${detailsMsg}`;
      }
    }

    error.friendlyMessage = friendlyMessage;
    return Promise.reject(error);
  }
);

export const getDashboardSummary = async () => {
  const response = await api.get('/dashboard/summary');
  return response.data;
};

export const getRisks = async (params = {}) => {
  const response = await api.get('/risks', { params });
  return response.data;
};

export const getRiskById = async (id) => {
  const response = await api.get(`/risks/${id}`);
  return response.data;
};

export const createRisk = async (data) => {
  const response = await api.post('/risks', data);
  return response.data;
};

export const updateRisk = async (id, data) => {
  const response = await api.put(`/risks/${id}`, data);
  return response.data;
};

export const deleteRisk = async (id) => {
  const response = await api.delete(`/risks/${id}`);
  return response.data;
};

// Master Data APIs
export const getMasterStandards = async () => {
  const response = await api.get('/master/standards');
  return response.data;
};

export const createMasterStandard = async (data) => {
  const response = await api.post('/master/standards', data);
  return response.data;
};

export const updateMasterStandard = async (id, data) => {
  const response = await api.put(`/master/standards/${id}`, data);
  return response.data;
};

export const deleteMasterStandard = async (id) => {
  const response = await api.delete(`/master/standards/${id}`);
  return response.data;
};

export const getMasterClauses = async () => {
  const response = await api.get('/master/clauses');
  return response.data;
};

export const createMasterClause = async (data) => {
  const response = await api.post('/master/clauses', data);
  return response.data;
};

export const updateMasterClause = async (id, data) => {
  const response = await api.put(`/master/clauses/${id}`, data);
  return response.data;
};

export const deleteMasterClause = async (id) => {
  const response = await api.delete(`/master/clauses/${id}`);
  return response.data;
};

export const getMasterLikelihoods = async () => {
  const response = await api.get('/master/likelihoods');
  return response.data;
};

export const updateMasterLikelihood = async (id, data) => {
  const response = await api.put(`/master/likelihoods/${id}`, data);
  return response.data;
};

export const deleteMasterLikelihood = async (id) => {
  const response = await api.delete(`/master/likelihoods/${id}`);
  return response.data;
};

export const getMasterImpacts = async () => {
  const response = await api.get('/master/impacts');
  return response.data;
};

export const updateMasterImpact = async (id, data) => {
  const response = await api.put(`/master/impacts/${id}`, data);
  return response.data;
};

export const deleteMasterImpact = async (id) => {
  const response = await api.delete(`/master/impacts/${id}`);
  return response.data;
};

export const getMasterCategories = async () => {
  const response = await api.get('/master/categories');
  return response.data;
};

export const createMasterCategory = async (data) => {
  const response = await api.post('/master/categories', data);
  return response.data;
};

export const updateMasterCategory = async (id, data) => {
  const response = await api.put(`/master/categories/${id}`, data);
  return response.data;
};

export const deleteMasterCategory = async (id) => {
  const response = await api.delete(`/master/categories/${id}`);
  return response.data;
};

export const getMasterDepartments = async () => {
  const response = await api.get('/master/departments');
  return response.data;
};

export const createMasterDepartment = async (data) => {
  const response = await api.post('/master/departments', data);
  return response.data;
};

export const updateMasterDepartment = async (id, data) => {
  const response = await api.put(`/master/departments/${id}`, data);
  return response.data;
};

export const deleteMasterDepartment = async (id) => {
  const response = await api.delete(`/master/departments/${id}`);
  return response.data;
};

export const getMasterProcesses = async () => {
  const response = await api.get('/master/processes');
  return response.data;
};

export const createMasterProcess = async (data) => {
  const response = await api.post('/master/processes', data);
  return response.data;
};

export const updateMasterProcess = async (id, data) => {
  const response = await api.put(`/master/processes/${id}`, data);
  return response.data;
};

export const deleteMasterProcess = async (id) => {
  const response = await api.delete(`/master/processes/${id}`);
  return response.data;
};

export const getMasterAssets = async () => {
  const response = await api.get('/master/assets');
  return response.data;
};

export const createMasterAsset = async (data) => {
  const response = await api.post('/master/assets', data);
  return response.data;
};

export const updateMasterAsset = async (id, data) => {
  const response = await api.put(`/master/assets/${id}`, data);
  return response.data;
};

export const deleteMasterAsset = async (id) => {
  const response = await api.delete(`/master/assets/${id}`);
  return response.data;
};

export const getMasterLocations = async () => {
  const response = await api.get('/master/locations');
  return response.data;
};

export const createMasterLocation = async (data) => {
  const response = await api.post('/master/locations', data);
  return response.data;
};

export const updateMasterLocation = async (id, data) => {
  const response = await api.put(`/master/locations/${id}`, data);
  return response.data;
};

export const deleteMasterLocation = async (id) => {
  const response = await api.delete(`/master/locations/${id}`);
  return response.data;
};

export const getMasterBUs = async () => {
  const response = await api.get('/master/bus');
  return response.data;
};

export const createMasterBU = async (data) => {
  const response = await api.post('/master/bus', data);
  return response.data;
};

export const updateMasterBU = async (id, data) => {
  const response = await api.put(`/master/bus/${id}`, data);
  return response.data;
};

export const deleteMasterBU = async (id) => {
  const response = await api.delete(`/master/bus/${id}`);
  return response.data;
};

export const getAuditLogs = async () => {
  const response = await api.get('/master/audit-logs');
  return response.data;
};

// Excel Operations
export const exportExcelData = () => {
  window.open('/api/master/excel-export', '_blank');
};

export const downloadExcelTemplate = () => {
  window.open('/api/master/excel-template', '_blank');
};

export const importExcelData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const fileBase64 = e.target.result;
        const response = await api.post('/master/excel-import', { fileBase64 });
        resolve(response.data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const resetDatabaseToDefaultApi = async () => {
  const response = await api.post('/master/reset-default');
  return response.data;
};

export default api;
