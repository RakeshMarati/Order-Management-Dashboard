import React, { useEffect, useState } from 'react';
import { ordersAPI } from '../../services/api';
import './OrderList.css';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await ordersAPI.getOrders();
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await ordersAPI.getOrderStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const handleRefresh = () => {
    fetchOrders();
    fetchStats();
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrder(orderId, { status: newStatus });
      fetchOrders(); // Refresh the list
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await ordersAPI.deleteOrder(orderId);
        fetchOrders(); // Refresh the list
      } catch (err) {
        setError('Failed to delete order');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      in_progress: '#2196f3',
      ready: '#4caf50',
      delivered: '#8bc34a',
      cancelled: '#f44336'
    };
    return colors[status] || '#666';
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

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  if (loading) {
    return (
      <div className="order-list-container">
        <div className="order-list-header">
          <h3>📋 Orders Dashboard</h3>
          <button onClick={handleRefresh} className="refresh-button" disabled>
            Refreshing...
          </button>
        </div>
        <div className="loading-message">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="order-list-container">
      <div className="order-list-header">
        <h3>📋 Orders Dashboard</h3>
        <div className="header-actions">
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button onClick={handleRefresh} className="refresh-button">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-container">
          <div className="stat-card">
            <h4>Total Orders</h4>
            <p className="stat-number">{stats.totalOrders}</p>
          </div>
          <div className="stat-card">
            <h4>Total Value</h4>
            <p className="stat-number">{formatCurrency(stats.totalValue)}</p>
          </div>
          {stats.statusBreakdown.map(stat => (
            <div key={stat._id} className="stat-card">
              <h4>{stat._id.replace('_', ' ').toUpperCase()}</h4>
              <p className="stat-number">{stat.count}</p>
            </div>
          ))}
        </div>
      )}
      
      {error && <p className="error-message">{error}</p>}
      
      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <p>No orders found. Create your first order above!</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Order Date</th>
                <th>Delivery Date</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} className="order-row">
                  <td className="order-id">#{order._id.slice(-6)}</td>
                  <td className="customer-info">
                    <div className="customer-name">{order.customerName}</div>
                    <div className="customer-contact">{order.customerContact}</div>
                  </td>
                  <td className="product-info">
                    <div className="product-name">{order.product}</div>
                    <div className="product-details">
                      Qty: {order.quantity} | {order.orderTakerName}
                    </div>
                  </td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td className="delivery-date">
                    {formatDate(order.deliveryDate)}
                    {order.actualDeliveryDate && (
                      <div className="actual-delivery">
                        Delivered: {formatDate(order.actualDeliveryDate)}
                      </div>
                    )}
                  </td>
                  <td className="price-info">
                    <div className="total-price">{formatCurrency(order.price)}</div>
                    {order.advancePayment > 0 && (
                      <div className="advance-payment">
                        Advance: {formatCurrency(order.advancePayment)}
                      </div>
                    )}
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className="status-select"
                      style={{ borderColor: getStatusColor(order.status) }}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="actions">
                    <button 
                      onClick={() => handleDeleteOrder(order._id)}
                      className="delete-btn"
                      title="Delete Order"
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

export default OrderList;
