import React, { useState, useEffect } from 'react';
import { paymentsAPI, ordersAPI } from '../../services/api';
import './PaymentLog.css';

const PaymentForm = ({ onPaymentCreated }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerContact: '',
    customerEmail: '',
    paymentDate: new Date().toISOString().split('T')[0],
    amount: '',
    paymentMethod: 'cash',
    relatedOrder: '',
    transactionId: '',
    notes: ''
  });

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch orders for dropdown
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
    
    if (name === 'customerContact') {
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
    
    if (!formData.customerName || !formData.customerContact || !formData.amount || !formData.paymentDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.customerContact.length < 10) {
      setError('Contact number must be at least 10 digits');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const paymentData = {
        ...formData,
        relatedOrder: formData.relatedOrder || null,
        amount: parseFloat(formData.amount)
      };
      
      await paymentsAPI.createPayment(paymentData);
      
      // Reset form
      setFormData({
        customerName: '',
        customerContact: '',
        customerEmail: '',
        paymentDate: new Date().toISOString().split('T')[0],
        amount: '',
        paymentMethod: 'cash',
        relatedOrder: '',
        transactionId: '',
        notes: ''
      });
      
      if (onPaymentCreated) {
        onPaymentCreated();
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="payment-form-container">
      <div className="payment-form-card">
        <h3>💰 Record Customer Payment</h3>
        
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-section">
            <h4>👤 Customer Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="customerName">Customer Name *</label>
                <input
                  id="customerName"
                  type="text"
                  name="customerName"
                  placeholder="Enter customer name"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="customerContact">Contact Number *</label>
                <input
                  id="customerContact"
                  type="tel"
                  name="customerContact"
                  placeholder="Enter 10-digit contact number"
                  value={formData.customerContact}
                  onChange={handleInputChange}
                  maxLength="15"
                  required
                />
                {formData.customerContact && formData.customerContact.length < 10 && (
                  <small className="validation-error">Contact number must be at least 10 digits</small>
                )}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="customerEmail">Email (Optional)</label>
              <input
                id="customerEmail"
                type="email"
                name="customerEmail"
                placeholder="Enter customer email"
                value={formData.customerEmail}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-section">
            <h4>💵 Payment Details</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="paymentDate">Payment Date *</label>
                <input
                  id="paymentDate"
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
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
                  placeholder="Enter payment amount"
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
                  placeholder="Enter transaction ID (if applicable)"
                  value={formData.transactionId}
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
            <h4>📝 Additional Notes</h4>
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
            {isLoading ? 'Recording Payment...' : '💾 Record Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;

