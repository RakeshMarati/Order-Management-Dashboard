import React, { useState, useCallback } from 'react';
import { paymentsAPI } from '../../services/api';
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

  const [customerSummary, setCustomerSummary] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Search for customer when name or contact is entered
  const searchCustomer = useCallback(async (name, contact, currentFormData) => {
    if ((!name || name.length < 2) && (!contact || contact.length !== 10)) {
      setCustomerSummary(null);
      return;
    }

    if (contact && contact.length === 10) {
      try {
        setIsSearching(true);
        const summary = await paymentsAPI.getCustomerPaymentSummary(name || '', contact);
        setCustomerSummary(summary);
        
        // Auto-fill customer details if found
        if (summary.customerName && !currentFormData.customerName) {
          setFormData(prev => ({ ...prev, customerName: summary.customerName }));
        }
      } catch (err) {
        // Customer not found is okay, just clear summary
        setCustomerSummary(null);
      } finally {
        setIsSearching(false);
      }
    } else if (name && name.length >= 2) {
      try {
        setIsSearching(true);
        const summary = await paymentsAPI.getCustomerPaymentSummary(name, '');
        setCustomerSummary(summary);
        
        // Auto-fill customer details if found
        if (summary.customerContact && !currentFormData.customerContact) {
          setFormData(prev => ({ ...prev, customerContact: summary.customerContact }));
        }
      } catch (err) {
        setCustomerSummary(null);
      } finally {
        setIsSearching(false);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'customerContact') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
      
      // Search when contact reaches 10 digits
      if (numericValue.length === 10) {
        searchCustomer(formData.customerName, numericValue, { ...formData, customerContact: numericValue });
      } else {
        setCustomerSummary(null);
      }
    } else if (name === 'customerName') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Search when name has at least 2 characters
      if (value.length >= 2) {
        searchCustomer(value, formData.customerContact, { ...formData, customerName: value });
      } else if (value.length === 0) {
        setCustomerSummary(null);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleOrderSelect = (orderId) => {
    if (orderId && customerSummary) {
      const order = customerSummary.pendingOrders.find(o => o.orderId === orderId);
      if (order) {
        setFormData(prev => ({
          ...prev,
          relatedOrder: orderId,
          amount: order.pendingAmount > 0 ? order.pendingAmount.toString() : prev.amount,
          notes: `Payment for order - ${order.product}${prev.notes ? ` | ${prev.notes}` : ''}`
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerContact || !formData.amount || !formData.paymentDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.customerContact.length !== 10) {
      setError('Contact number must be exactly 10 digits');
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
      setCustomerSummary(null);
      
      if (onPaymentCreated) {
        onPaymentCreated();
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create payment');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
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
                  maxLength="10"
                  required
                />
                {formData.customerContact && formData.customerContact.length !== 10 && formData.customerContact.length > 0 && (
                  <small className="validation-error">Contact number must be exactly 10 digits</small>
                )}
                {isSearching && (
                  <small style={{ color: '#667eea', display: 'block', marginTop: '4px' }}>Searching...</small>
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

            {/* Customer Summary Card */}
            {customerSummary && (
              <div className="customer-summary-card">
                <h5>📋 Customer Payment Summary</h5>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Total Orders:</span>
                    <span className="summary-value">{customerSummary.totalOrders}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Total Order Value:</span>
                    <span className="summary-value">{formatCurrency(customerSummary.totalOrderValue)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Total Paid:</span>
                    <span className="summary-value success">{formatCurrency(customerSummary.totalPaid)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Pending Amount:</span>
                    <span className={`summary-value ${customerSummary.pendingAmount > 0 ? 'warning' : 'success'}`}>
                      {formatCurrency(customerSummary.pendingAmount)}
                    </span>
                  </div>
                </div>

                {customerSummary.pendingOrders && customerSummary.pendingOrders.length > 0 && (
                  <div className="pending-orders-section">
                    <h6>📦 Pending Orders</h6>
                    {customerSummary.pendingOrders.map(order => (
                      <div key={order.orderId} className="pending-order-item">
                        <div className="order-info">
                          <strong>{order.product}</strong>
                          <span className="order-status">{order.status}</span>
                        </div>
                        <div className="order-amounts">
                          <span>Total: {formatCurrency(order.totalPrice)}</span>
                          <span>Paid: {formatCurrency(order.paidAmount)}</span>
                          <span className="pending-amount">Pending: {formatCurrency(order.pendingAmount)}</span>
                        </div>
                        <button
                          type="button"
                          className="select-order-btn"
                          onClick={() => handleOrderSelect(order.orderId)}
                        >
                          Select This Order
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {customerSummary.paymentHistory && customerSummary.paymentHistory.length > 0 && (
                  <div className="payment-history-section">
                    <h6>💰 Payment History</h6>
                    <div className="payment-history-list">
                      {customerSummary.paymentHistory.slice(0, 5).map(payment => (
                        <div key={payment.paymentId} className="payment-history-item">
                          <span>{formatCurrency(payment.amount)}</span>
                          <span>{new Date(payment.paymentDate).toLocaleDateString('en-IN')}</span>
                          <span>{payment.paymentMethod.replace('_', ' ').toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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
                {customerSummary && customerSummary.pendingAmount > 0 && (
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Pending: {formatCurrency(customerSummary.pendingAmount)}
                  </small>
                )}
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
            {formData.relatedOrder && (
              <div className="form-group">
                <label>Linked Order</label>
                <div className="linked-order-info">
                  {customerSummary?.pendingOrders.find(o => o.orderId === formData.relatedOrder)?.product || 'Order selected'}
                </div>
              </div>
            )}
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
