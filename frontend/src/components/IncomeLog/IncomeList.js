import React, { useEffect, useState, useCallback } from 'react';
import { incomesAPI } from '../../services/api';
import './IncomeLog.css';

const IncomeList = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    incomeType: '',
    source: ''
  });

  const fetchIncomes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.incomeType) params.incomeType = filters.incomeType;
      if (filters.source) params.source = filters.source;
      
      const data = await incomesAPI.getIncomes(params);
      setIncomes(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch incomes');
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate, filters.incomeType, filters.source]);

  const fetchStats = useCallback(async () => {
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      const data = await incomesAPI.getIncomeStats(params);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [filters.startDate, filters.endDate]);

  useEffect(() => {
    fetchIncomes();
    fetchStats();
  }, [fetchIncomes, fetchStats]);

  const handleRefresh = () => {
    fetchIncomes();
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
    fetchIncomes();
    fetchStats();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income record?')) {
      try {
        await incomesAPI.deleteIncome(id);
        fetchIncomes();
        fetchStats();
      } catch (err) {
        setError('Failed to delete income');
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
      <div className="income-list-container">
        <div className="income-list-header">
          <h3>💵 Income Records</h3>
        </div>
        <div className="loading-message">Loading incomes...</div>
      </div>
    );
  }

  return (
    <div className="income-list-container">
      <div className="income-list-header">
        <h3>💵 Income Records</h3>
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
            <label>Income Type</label>
            <select
              name="incomeType"
              value={filters.incomeType}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="order_payment">Order Payment</option>
              <option value="advance_payment">Advance Payment</option>
              <option value="full_payment">Full Payment</option>
              <option value="other_income">Other Income</option>
              <option value="refund">Refund</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Source</label>
            <input
              type="text"
              name="source"
              placeholder="Search source..."
              value={filters.source}
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
            <h4>Total Income Records</h4>
            <p className="stat-number">{stats.totalIncomes}</p>
          </div>
          <div className="stat-card">
            <h4>Total Income</h4>
            <p className="stat-number">{formatCurrency(stats.totalAmount)}</p>
          </div>
          {stats.typeBreakdown.map(stat => (
            <div key={stat._id} className="stat-card">
              <h4>{stat._id.replace('_', ' ').toUpperCase()}</h4>
              <p className="stat-number">{formatCurrency(stat.totalAmount)}</p>
              <small>({stat.count} records)</small>
            </div>
          ))}
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {incomes.length === 0 ? (
        <div className="empty-state">
          <p>No income records found. Record your first income above!</p>
        </div>
      ) : (
        <div className="incomes-table-container">
          <table className="incomes-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Payer</th>
                <th>Payment Method</th>
                <th>Related Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((income) => (
                <tr key={income._id}>
                  <td>{formatDate(income.incomeDate)}</td>
                  <td className="source-cell">{income.source}</td>
                  <td>{income.incomeType.replace('_', ' ').toUpperCase()}</td>
                  <td className="amount-cell">{formatCurrency(income.amount)}</td>
                  <td>
                    {income.payerName ? (
                      <div className="payer-info">
                        <div className="payer-name">{income.payerName}</div>
                        {income.payerContact && (
                          <div className="payer-contact">{income.payerContact}</div>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{income.paymentMethod.replace('_', ' ').toUpperCase()}</td>
                  <td>
                    {income.relatedOrder ? (
                      <span className="order-link">Order #{income.relatedOrder._id?.slice(-6)}</span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <button 
                      onClick={() => handleDelete(income._id)}
                      className="delete-btn"
                      title="Delete Income"
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

export default IncomeList;

