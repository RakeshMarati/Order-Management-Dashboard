import React, { useEffect, useState, useCallback } from 'react';
import { materialPurchasesAPI } from '../../services/api';
import './MaterialPurchase.css';

const MaterialPurchaseList = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    supplierName: '',
    itemName: ''
  });

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.supplierName) params.supplierName = filters.supplierName;
      if (filters.itemName) params.itemName = filters.itemName;
      
      const data = await materialPurchasesAPI.getMaterialPurchases(params);
      setPurchases(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch purchases');
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate, filters.supplierName, filters.itemName]);

  const fetchStats = useCallback(async () => {
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      const data = await materialPurchasesAPI.getMaterialPurchaseStats(params);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [filters.startDate, filters.endDate]);

  useEffect(() => {
    fetchPurchases();
    fetchStats();
  }, [fetchPurchases, fetchStats]);

  const handleRefresh = () => {
    fetchPurchases();
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
    fetchPurchases();
    fetchStats();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase record?')) {
      try {
        await materialPurchasesAPI.deleteMaterialPurchase(id);
        fetchPurchases();
        fetchStats();
      } catch (err) {
        setError('Failed to delete purchase');
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
      <div className="material-purchase-list-container">
        <div className="material-purchase-list-header">
          <h3>📦 Material Purchases</h3>
        </div>
        <div className="loading-message">Loading purchases...</div>
      </div>
    );
  }

  return (
    <div className="material-purchase-list-container">
      <div className="material-purchase-list-header">
        <h3>📦 Material Purchases</h3>
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
            <label>Supplier Name</label>
            <input
              type="text"
              name="supplierName"
              placeholder="Search supplier..."
              value={filters.supplierName}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>Item Name</label>
            <input
              type="text"
              name="itemName"
              placeholder="Search item..."
              value={filters.itemName}
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
            <h4>Total Purchases</h4>
            <p className="stat-number">{stats.totalPurchases}</p>
          </div>
          <div className="stat-card">
            <h4>Total Cost</h4>
            <p className="stat-number">{formatCurrency(stats.totalCost)}</p>
          </div>
          {stats.supplierBreakdown.map(stat => (
            <div key={stat._id} className="stat-card">
              <h4>{stat._id}</h4>
              <p className="stat-number">{formatCurrency(stat.totalCost)}</p>
              <small>({stat.count} purchases)</small>
            </div>
          ))}
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {purchases.length === 0 ? (
        <div className="empty-state">
          <p>No purchases found. Record your first purchase above!</p>
        </div>
      ) : (
        <div className="purchases-table-container">
          <table className="purchases-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>Supplier</th>
                <th>Cost/Unit</th>
                <th>Total Cost</th>
                <th>Payment Method</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase._id}>
                  <td>{formatDate(purchase.purchaseDate)}</td>
                  <td>
                    <div className="item-info">
                      <div className="item-name">{purchase.itemName}</div>
                      {purchase.itemCategory && (
                        <div className="item-category">{purchase.itemCategory}</div>
                      )}
                    </div>
                  </td>
                  <td>{purchase.quantity} {purchase.unit}</td>
                  <td>
                    <div className="supplier-info">
                      <div className="supplier-name">{purchase.supplierName}</div>
                      {purchase.supplierContact && (
                        <div className="supplier-contact">{purchase.supplierContact}</div>
                      )}
                    </div>
                  </td>
                  <td>{formatCurrency(purchase.costPerUnit)}</td>
                  <td className="amount-cell">{formatCurrency(purchase.totalCost)}</td>
                  <td>{purchase.paymentMethod.replace('_', ' ').toUpperCase()}</td>
                  <td>
                    <button 
                      onClick={() => handleDelete(purchase._id)}
                      className="delete-btn"
                      title="Delete Purchase"
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

export default MaterialPurchaseList;

