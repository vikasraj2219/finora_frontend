import axiosInstance from './axiosInstance';

export const listTransactions = (params) => axiosInstance.get('/transactions', { params });
export const createTransaction = (payload) => axiosInstance.post('/transactions', payload);
export const updateTransaction = (id, payload) => axiosInstance.patch(`/transactions/${id}`, payload);
export const deleteTransaction = (id) => axiosInstance.delete(`/transactions/${id}`);

export const uploadTransactionReceipt = (id, file) => {
  const formData = new FormData();
  formData.append('receipt', file);
  return axiosInstance.post(`/transactions/${id}/receipt`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const removeTransactionReceipt = (id) => axiosInstance.delete(`/transactions/${id}/receipt`);

export const bulkAllocateTransactions = (payload) => axiosInstance.post('/transactions/bulk-allocate', payload);
export const getAllocationSummary = () => axiosInstance.get('/transactions/allocation-summary');
