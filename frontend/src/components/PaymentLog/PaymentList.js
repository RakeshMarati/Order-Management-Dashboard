import React, { useEffect, useState, useCallback } from 'react';
import { paymentsAPI } from '../../services/api';
import './PaymentLog.css';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    customerName: ''
  });

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.customerName) params.customerName = filters.customerName;
      
      const data = await paymentsAPI.getPayments(params);
      setPayments(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate, filters.customerName]);

  const fetchStats = useCallback(async () => {
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      const data = await paymentsAPI.getPaymentStats(params);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [filters.startDate, filters.endDate]);

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [fetchPayments, fetchStats]);

  const handleRefresh = () => {
    fetchPayments();
    fetchStats();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchPayments();
    fetchStats();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      try {
        await paymentsAPI.deletePayment(id);
        fetchPayments();
        fetchStats();
      } catch (err) {
        setError('Failed to delete payment');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="payment-list-container">
        <div className="payment-list-header">
          <h3>💰 Customer Payments</h3>
        </div>
        <div className="loading-message">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="payment-list-container">
      <div className="payment-list-header">
        <h3>💰 Customer Payments</h3>
        <button onClick={handleRefresh} className="refresh-button">
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>Customer Name</label>
            <input
              type="text"
              name="customerName"
              placeholder="Search customer..."
              value={filters.customerName}
              onChange={handleFilterChange}
            />
          </div>
          <button onClick={applyFilters} className="apply-filters-btn">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="stats-container">
          <div className="stat-card">
            <h4>Total Payments</h4>
            <p className="stat-number">{stats.totalPayments}</p>
          </div>
          <div className="stat-card">
            <h4>Total Amount</h4>
            <p className="stat-number">{formatCurrency(stats.totalAmount)}</p>
          </div>
          {stats.methodBreakdown.map(stat => (
            <div key={stat._id} className="stat-card">
              <h4>{stat._id.replace('_', ' ').toUpperCase()}</h4>
              <p className="stat-number">{formatCurrency(stat.totalAmount)}</p>
              <small>({stat.count} payments)</small>
            </div>
          ))}
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {payments.length === 0 ? (
        <div className="empty-state">
          <p>No payments found. Record your first payment above!</p>
        </div>
      ) : (
        <div className="payments-table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Transaction ID</th>
                <th>Related Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td>{formatDate(payment.paymentDate)}</td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{payment.customerName}</div>
                      <div className="customer-contact">{payment.customerContact}</div>
                    </div>
                  </td>
                  <td className="amount-cell">{formatCurrency(payment.amount)}</td>
                  <td>{payment.paymentMethod.replace('_', ' ').toUpperCase()}</td>
                  <td>{payment.transactionId || '-'}</td>
                  <td>
                    {payment.relatedOrder ? (
                      <span className="order-link">Order #{payment.relatedOrder._id?.slice(-6)}</span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <button 
                      onClick={() => handleDelete(payment._id)}
                      className="delete-btn"
                      title="Delete Payment"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentList;

