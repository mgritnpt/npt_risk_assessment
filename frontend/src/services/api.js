import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const deleteMasterBU = async (id) => {
  const response = await api.delete(`/master/bus/${id}`);
  return response.data;
};

export const getAuditLogs = async () => {
  const response = await api.get('/master/audit-logs');
  return response.data;
};

export default api;
