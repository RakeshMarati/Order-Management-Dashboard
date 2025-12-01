import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OrderForm from '../OrderForm/OrderForm';
import OrderList from '../OrderList/OrderList';
import PaymentForm from '../PaymentLog/PaymentForm';
import PaymentList from '../PaymentLog/PaymentList';
import MaterialPurchaseForm from '../MaterialPurchase/MaterialPurchaseForm';
import MaterialPurchaseList from '../MaterialPurchase/MaterialPurchaseList';
import IncomeForm from '../IncomeLog/IncomeForm';
import IncomeList from '../IncomeLog/IncomeList';
import SalaryForm from '../SalaryLog/SalaryForm';
import SalaryList from '../SalaryLog/SalaryList';
import FinancialReports from '../FinancialReports/FinancialReports';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [refreshKeys, setRefreshKeys] = useState({
    orders: 0,
    payments: 0,
    materials: 0,
    incomes: 0,
    salaries: 0
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRefresh = (tab) => {
    setRefreshKeys(prev => ({
      ...prev,
      [tab]: prev[tab] + 1
    }));
  };

  const tabs = [
    { id: 'orders', label: '📋 Orders', icon: '📋' },
    { id: 'payments', label: '💰 Payments', icon: '💰' },
    { id: 'materials', label: '📦 Materials', icon: '📦' },
    { id: 'incomes', label: '💵 Income', icon: '💵' },
    { id: 'salaries', label: '💼 Salaries', icon: '💼' },
    { id: 'reports', label: '📊 Reports', icon: '📊' }
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Karthikeya Boutique</h1>
          <p>Complete Business Management Dashboard</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>
      
      <main className="dashboard-main">
        {/* Tab Navigation */}
        <div className="tabs-container">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label.replace(/^[^\s]+\s/, '')}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="dashboard-content">
          {activeTab === 'orders' && (
            <>
              <OrderForm onOrderCreated={() => handleRefresh('orders')} />
              <OrderList key={refreshKeys.orders} />
            </>
          )}

          {activeTab === 'payments' && (
            <>
              <PaymentForm onPaymentCreated={() => handleRefresh('payments')} />
              <PaymentList key={refreshKeys.payments} />
            </>
          )}

          {activeTab === 'materials' && (
            <>
              <MaterialPurchaseForm onPurchaseCreated={() => handleRefresh('materials')} />
              <MaterialPurchaseList key={refreshKeys.materials} />
            </>
          )}

          {activeTab === 'incomes' && (
            <>
              <IncomeForm onIncomeCreated={() => handleRefresh('incomes')} />
              <IncomeList key={refreshKeys.incomes} />
            </>
          )}

          {activeTab === 'salaries' && (
            <>
              <SalaryForm onSalaryCreated={() => handleRefresh('salaries')} />
              <SalaryList key={refreshKeys.salaries} />
            </>
          )}

          {activeTab === 'reports' && (
            <FinancialReports />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
