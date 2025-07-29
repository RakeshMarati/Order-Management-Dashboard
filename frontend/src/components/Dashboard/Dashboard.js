import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OrderForm from '../OrderForm/OrderForm';
import OrderList from '../OrderList/OrderList';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleOrderCreated = () => {
    // Force refresh of order list
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Karthikeya Boutique</h1>
          <p>Order Management Dashboard</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>
      
      <main className="dashboard-main">
        <div className="dashboard-content">
          <OrderForm onOrderCreated={handleOrderCreated} />
          <OrderList key={refreshKey} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
