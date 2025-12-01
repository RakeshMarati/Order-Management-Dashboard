import React, { useEffect, useState, useCallback } from 'react';
import { paymentsAPI, materialPurchasesAPI, incomesAPI, salariesAPI } from '../../services/api';
import './FinancialReports.css';

const FinancialReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalPayments: 0,
    totalMaterialCost: 0,
    totalSalaries: 0,
    netProfit: 0
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  const fetchFinancialSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      // Fetch all stats in parallel
      const [incomeStats, paymentStats, materialStats, salaryStats] = await Promise.all([
        incomesAPI.getIncomeStats(params).catch(() => ({ totalAmount: 0 })),
        paymentsAPI.getPaymentStats(params).catch(() => ({ totalAmount: 0 })),
        materialPurchasesAPI.getMaterialPurchaseStats(params).catch(() => ({ totalCost: 0 })),
        salariesAPI.getSalaryStats(params).catch(() => ({ totalAmount: 0 }))
      ]);

      const totalIncome = incomeStats.totalAmount || 0;
      const totalPayments = paymentStats.totalAmount || 0;
      const totalMaterialCost = materialStats.totalCost || 0;
      const totalSalaries = salaryStats.totalAmount || 0;
      
      // Net profit = Income - (Material Costs + Salaries)
      const netProfit = totalIncome - (totalMaterialCost + totalSalaries);

      setSummary({
        totalIncome,
        totalPayments,
        totalMaterialCost,
        totalSalaries,
        netProfit
      });
    } catch (err) {
      setError('Failed to fetch financial summary');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate]);

  useEffect(() => {
    fetchFinancialSummary();
  }, [fetchFinancialSummary]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchFinancialSummary();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="financial-reports-container">
        <div className="loading-message">Loading financial reports...</div>
      </div>
    );
  }

  return (
    <div className="financial-reports-container">
      <div className="reports-header">
        <h2>📊 Financial Reports & Summary</h2>
        <button onClick={fetchFinancialSummary} className="refresh-button">
          🔄 Refresh
        </button>
      </div>

      {/* Date Filters */}
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
          <button onClick={applyFilters} className="apply-filters-btn">
            Apply Filters
          </button>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      {/* Financial Summary Cards */}
      <div className="financial-summary">
        <div className="summary-card income-card">
          <div className="card-icon">💵</div>
          <div className="card-content">
            <h3>Total Income</h3>
            <p className="card-amount">{formatCurrency(summary.totalIncome)}</p>
            <small>From all income sources</small>
          </div>
        </div>

        <div className="summary-card payment-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Customer Payments</h3>
            <p className="card-amount">{formatCurrency(summary.totalPayments)}</p>
            <small>Payments received from customers</small>
          </div>
        </div>

        <div className="summary-card expense-card">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <h3>Material Costs</h3>
            <p className="card-amount">{formatCurrency(summary.totalMaterialCost)}</p>
            <small>Total material purchases</small>
          </div>
        </div>

        <div className="summary-card salary-card">
          <div className="card-icon">💼</div>
          <div className="card-content">
            <h3>Salaries Paid</h3>
            <p className="card-amount">{formatCurrency(summary.totalSalaries)}</p>
            <small>Total salary payments</small>
          </div>
        </div>
      </div>

      {/* Net Profit Card */}
      <div className={`net-profit-card ${summary.netProfit >= 0 ? 'profit' : 'loss'}`}>
        <div className="profit-icon">{summary.netProfit >= 0 ? '📈' : '📉'}</div>
        <div className="profit-content">
          <h2>Net Profit / Loss</h2>
          <p className={`profit-amount ${summary.netProfit >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(summary.netProfit)}
          </p>
          <small>
            {summary.netProfit >= 0 
              ? 'Great! You are making a profit' 
              : 'You are currently at a loss. Review your expenses.'}
          </small>
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="breakdown-section">
        <h3>Financial Breakdown</h3>
        <div className="breakdown-chart">
          <div className="breakdown-item">
            <span className="breakdown-label">Total Income:</span>
            <span className="breakdown-value income">{formatCurrency(summary.totalIncome)}</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Material Costs:</span>
            <span className="breakdown-value expense">-{formatCurrency(summary.totalMaterialCost)}</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Salaries:</span>
            <span className="breakdown-value expense">-{formatCurrency(summary.totalSalaries)}</span>
          </div>
          <div className="breakdown-divider"></div>
          <div className="breakdown-item total">
            <span className="breakdown-label">Net Profit/Loss:</span>
            <span className={`breakdown-value ${summary.netProfit >= 0 ? 'profit' : 'loss'}`}>
              {formatCurrency(summary.netProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-box">
          <h4>Total Expenses</h4>
          <p>{formatCurrency(summary.totalMaterialCost + summary.totalSalaries)}</p>
        </div>
        <div className="stat-box">
          <h4>Profit Margin</h4>
          <p>
            {summary.totalIncome > 0 
              ? `${((summary.netProfit / summary.totalIncome) * 100).toFixed(2)}%`
              : '0%'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;

