import React, { useState, useEffect } from 'react';
import { incomesAPI, ordersAPI } from '../../services/api';
import './IncomeLog.css';

const IncomeForm = ({ onIncomeCreated }) => {
  const [formData, setFormData] = useState({
    incomeDate: new Date().toISOString().split('T')[0],
    source: '',
    incomeType: 'order_payment',
    amount: '',
    payerName: '',
    payerContact: '',
    paymentMethod: 'cash',
    relatedOrder: '',
    transactionId: '',
    description: '',
    notes: ''
  });

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ordersAPI.getOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
    };
    fetchOrders();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'payerContact') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.source || !formData.amount || !formData.incomeDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const incomeData = {
        ...formData,
        amount: parseFloat(formData.amount),
        relatedOrder: formData.relatedOrder || null
      };
      
      await incomesAPI.createIncome(incomeData);
      
      // Reset form
      setFormData({
        incomeDate: new Date().toISOString().split('T')[0],
        source: '',
        incomeType: 'order_payment',
        amount: '',
        payerName: '',
        payerContact: '',
        paymentMethod: 'cash',
        relatedOrder: '',
        transactionId: '',
        description: '',
        notes: ''
      });
      
      if (onIncomeCreated) {
        onIncomeCreated();
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create income record');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="income-form-container">
      <div className="income-form-card">
        <h3>💵 Record Income</h3>
        
        <form onSubmit={handleSubmit} className="income-form">
          <div className="form-section">
            <h4>📅 Income Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="incomeDate">Income Date *</label>
                <input
                  id="incomeDate"
                  type="date"
                  name="incomeDate"
                  value={formData.incomeDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="incomeType">Income Type *</label>
                <select
                  id="incomeType"
                  name="incomeType"
                  value={formData.incomeType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="order_payment">Order Payment</option>
                  <option value="advance_payment">Advance Payment</option>
                  <option value="full_payment">Full Payment</option>
                  <option value="other_income">Other Income</option>
                  <option value="refund">Refund</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>💰 Amount Details</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="source">Income Source *</label>
                <input
                  id="source"
                  type="text"
                  name="source"
                  placeholder="e.g., Customer Payment, Service Fee"
                  value={formData.source}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="amount">Amount (₹) *</label>
                <input
                  id="amount"
                  type="number"
                  name="amount"
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method *</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="cheque">Cheque</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="transactionId">Transaction ID</label>
                <input
                  id="transactionId"
                  type="text"
                  name="transactionId"
                  placeholder="Enter transaction ID"
                  value={formData.transactionId}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>👤 Payer Information (Optional)</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="payerName">Payer Name</label>
                <input
                  id="payerName"
                  type="text"
                  name="payerName"
                  placeholder="Enter payer name"
                  value={formData.payerName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="payerContact">Contact Number</label>
                <input
                  id="payerContact"
                  type="tel"
                  name="payerContact"
                  placeholder="Enter contact number"
                  value={formData.payerContact}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>📦 Related Order (Optional)</h4>
            <div className="form-group">
              <label htmlFor="relatedOrder">Link to Order</label>
              <select
                id="relatedOrder"
                name="relatedOrder"
                value={formData.relatedOrder}
                onChange={handleInputChange}
              >
                <option value="">Select an order (optional)</option>
                {orders.map(order => (
                  <option key={order._id} value={order._id}>
                    {order.customerName} - {order.product} (₹{order.price})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section">
            <h4>📝 Additional Information</h4>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                placeholder="Enter description"
                value={formData.description}
                onChange={handleInputChange}
                rows="2"
              />
            </div>
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Any additional notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Recording Income...' : '💾 Record Income'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IncomeForm;

