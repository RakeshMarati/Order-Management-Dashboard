import axios from 'axios';

// Updated API URL for production deployment - Force rebuild
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://order-management-dashboard.onrender.com/api';

// Debug log to ensure correct URL is used
console.log('API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },
};

// Orders API calls
export const ordersAPI = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  getOrder: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  updateOrder: async (id, orderData) => {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  },
  deleteOrder: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
  getOrderStats: async () => {
    const response = await api.get('/orders/stats');
    return response.data;
  },
};

// Payments API calls
export const paymentsAPI = {
  createPayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },
  getPayments: async (filters = {}) => {
    const response = await api.get('/payments', { params: filters });
    return response.data;
  },
  getPayment: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },
  updatePayment: async (id, paymentData) => {
    const response = await api.put(`/payments/${id}`, paymentData);
    return response.data;
  },
  deletePayment: async (id) => {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  },
  getPaymentStats: async (filters = {}) => {
    const response = await api.get('/payments/stats', { params: filters });
    return response.data;
  },
  getCustomerPaymentSummary: async (customerName, customerContact) => {
    const params = {};
    if (customerName) params.customerName = customerName;
    if (customerContact) params.customerContact = customerContact;
    const response = await api.get('/payments/customer-summary', { params });
    return response.data;
  },
};

// Material Purchases API calls
export const materialPurchasesAPI = {
  createMaterialPurchase: async (purchaseData) => {
    const response = await api.post('/material-purchases', purchaseData);
    return response.data;
  },
  getMaterialPurchases: async (filters = {}) => {
    const response = await api.get('/material-purchases', { params: filters });
    return response.data;
  },
  getMaterialPurchase: async (id) => {
    const response = await api.get(`/material-purchases/${id}`);
    return response.data;
  },
  updateMaterialPurchase: async (id, purchaseData) => {
    const response = await api.put(`/material-purchases/${id}`, purchaseData);
    return response.data;
  },
  deleteMaterialPurchase: async (id) => {
    const response = await api.delete(`/material-purchases/${id}`);
    return response.data;
  },
  getMaterialPurchaseStats: async (filters = {}) => {
    const response = await api.get('/material-purchases/stats', { params: filters });
    return response.data;
  },
};

// Income API calls
export const incomesAPI = {
  createIncome: async (incomeData) => {
    const response = await api.post('/incomes', incomeData);
    return response.data;
  },
  getIncomes: async (filters = {}) => {
    const response = await api.get('/incomes', { params: filters });
    return response.data;
  },
  getIncome: async (id) => {
    const response = await api.get(`/incomes/${id}`);
    return response.data;
  },
  updateIncome: async (id, incomeData) => {
    const response = await api.put(`/incomes/${id}`, incomeData);
    return response.data;
  },
  deleteIncome: async (id) => {
    const response = await api.delete(`/incomes/${id}`);
    return response.data;
  },
  getIncomeStats: async (filters = {}) => {
    const response = await api.get('/incomes/stats', { params: filters });
    return response.data;
  },
};

// Salaries API calls
export const salariesAPI = {
  createSalary: async (salaryData) => {
    const response = await api.post('/salaries', salaryData);
    return response.data;
  },
  getSalaries: async (filters = {}) => {
    const response = await api.get('/salaries', { params: filters });
    return response.data;
  },
  getSalary: async (id) => {
    const response = await api.get(`/salaries/${id}`);
    return response.data;
  },
  updateSalary: async (id, salaryData) => {
    const response = await api.put(`/salaries/${id}`, salaryData);
    return response.data;
  },
  deleteSalary: async (id) => {
    const response = await api.delete(`/salaries/${id}`);
    return response.data;
  },
  getSalaryStats: async (filters = {}) => {
    const response = await api.get('/salaries/stats', { params: filters });
    return response.data;
  },
};

export default api;