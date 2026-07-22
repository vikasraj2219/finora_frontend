import axiosInstance from './axiosInstance';

export const listTransactions = (params) => axiosInstance.get('/transactions', { params });
export const createTransaction = (payload) => axiosInstance.post('/transactions', payload);
export const updateTransaction = (id, payload) => axiosInstance.patch(`/transactions/${id}`, payload);
export const deleteTransaction = (id) => axiosInstance.delete(`/transactions/${id}`);
