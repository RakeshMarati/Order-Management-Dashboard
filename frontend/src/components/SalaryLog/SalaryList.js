import React, { useEffect, useState, useCallback } from 'react';
import { salariesAPI } from '../../services/api';
import './SalaryLog.css';

const SalaryList = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeName: '',
    month: '',
    year: ''
  });

  const fetchSalaries = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.employeeName) params.employeeName = filters.employeeName;
      if (filters.month) params.month = filters.month;
      if (filters.year) params.year = filters.year;
      
      const data = await salariesAPI.getSalaries(params);
      setSalaries(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch salaries');
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate, filters.employeeName, filters.month, filters.year]);

  const fetchStats = useCallback(async () => {
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      const data = await salariesAPI.getSalaryStats(params);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [filters.startDate, filters.endDate]);

  useEffect(() => {
    fetchSalaries();
    fetchStats();
  }, [fetchSalaries, fetchStats]);

  const handleRefresh = () => {
    fetchSalaries();
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
    fetchSalaries();
    fetchStats();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this salary record?')) {
      try {
        await salariesAPI.deleteSalary(id);
        fetchSalaries();
        fetchStats();
      } catch (err) {
        setError('Failed to delete salary');
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
      <div className="salary-list-container">
        <div className="salary-list-header">
          <h3>💼 Salary Payments</h3>
        </div>
        <div className="loading-message">Loading salaries...</div>
      </div>
    );
  }

  return (
    <div className="salary-list-container">
      <div className="salary-list-header">
        <h3>💼 Salary Payments</h3>
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
            <label>Employee Name</label>
            <input
              type="text"
              name="employeeName"
              placeholder="Search employee..."
              value={filters.employeeName}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>Month</label>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
            >
              <option value="">All Months</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Year</label>
            <input
              type="number"
              name="year"
              placeholder="Year"
              value={filters.year}
              onChange={handleFilterChange}
              min="2020"
              max="2100"
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
            <h4>Total Salary Payments</h4>
            <p className="stat-number">{stats.totalSalaries}</p>
          </div>
          <div className="stat-card">
            <h4>Total Salary Paid</h4>
            <p className="stat-number">{formatCurrency(stats.totalAmount)}</p>
          </div>
          {stats.employeeBreakdown.map(stat => (
            <div key={stat._id} className="stat-card">
              <h4>{stat._id}</h4>
              <p className="stat-number">{formatCurrency(stat.totalAmount)}</p>
              <small>({stat.count} payments)</small>
            </div>
          ))}
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {salaries.length === 0 ? (
        <div className="empty-state">
          <p>No salary records found. Record your first salary payment above!</p>
        </div>
      ) : (
        <div className="salaries-table-container">
          <table className="salaries-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Amount</th>
                <th>Period</th>
                <th>Payment Method</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map((salary) => (
                <tr key={salary._id}>
                  <td>{formatDate(salary.paymentDate)}</td>
                  <td>
                    <div className="employee-info">
                      <div className="employee-name">{salary.employeeName}</div>
                      {salary.employeeContact && (
                        <div className="employee-contact">{salary.employeeContact}</div>
                      )}
                    </div>
                  </td>
                  <td>{salary.employeeId || '-'}</td>
                  <td className="amount-cell">{formatCurrency(salary.amount)}</td>
                  <td>
                    {salary.month && salary.year ? (
                      <span>{salary.month} {salary.year}</span>
                    ) : (
                      salary.salaryPeriod || '-'
                    )}
                  </td>
                  <td>{salary.paymentMethod.replace('_', ' ').toUpperCase()}</td>
                  <td>
                    <button 
                      onClick={() => handleDelete(salary._id)}
                      className="delete-btn"
                      title="Delete Salary"
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

export default SalaryList;

