import React, { useState } from 'react';
import { ordersAPI } from '../../services/api';
import './OrderForm.css';

const OrderForm = ({ onOrderCreated }) => {
  const [formData, setFormData] = useState({
    orderTaker: 'owner',
    orderTakerName: '',
    customerName: '',
    customerContact: '',
    customerLocation: '',
    product: '',
    quantity: 1,
    measurements: '',
    specifications: '',
    deliveryDate: '',
    price: '',
    advancePayment: '',
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for contact number - only allow digits
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
    
    // Enhanced validation
    if (!formData.customerName || !formData.customerContact || !formData.product || !formData.deliveryDate || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    // Contact number validation - minimum 10 digits
    if (formData.customerContact.length < 10) {
      setError('Contact number must be at least 10 digits');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      await ordersAPI.createOrder(formData);
      
      // Reset form
      setFormData({
        orderTaker: 'owner',
        orderTakerName: '',
        customerName: '',
        customerContact: '',
        customerLocation: '',
        product: '',
        quantity: 1,
        measurements: '',
        specifications: '',
        deliveryDate: '',
        price: '',
        advancePayment: '',
        notes: ''
      });
      
      // Notify parent component to refresh orders
      if (onOrderCreated) {
        onOrderCreated();
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="order-form-container">
      <div className="order-form-card">
        <h3>📝 New Boutique Order</h3>
        
        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-section">
            <h4>👤 Order Taker Details</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="orderTaker">Order Taker Type *</label>
                <select
                  id="orderTaker"
                  name="orderTaker"
                  value={formData.orderTaker}
                  onChange={handleInputChange}
                  required
                >
                  <option value="owner">Owner</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="orderTakerName">Order Taker Name *</label>
                <input
                  id="orderTakerName"
                  type="text"
                  name="orderTakerName"
                  placeholder="Enter order taker name"
                  value={formData.orderTakerName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>👥 Customer Information</h4>
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
              <label htmlFor="customerLocation">Location/Address *</label>
              <input
                id="customerLocation"
                type="text"
                name="customerLocation"
                placeholder="Enter customer location"
                value={formData.customerLocation}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h4>👗 Product Details</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="product">Product/Design Description *</label>
                <input
                  id="product"
                  type="text"
                  name="product"
                  placeholder="e.g., Silk Saree with Embroidery"
                  value={formData.product}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="quantity">Quantity *</label>
                <input
                  id="quantity"
                  type="number"
                  name="quantity"
                  min="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="measurements">Measurements</label>
                <textarea
                  id="measurements"
                  name="measurements"
                  placeholder="Enter measurements (chest, waist, length, etc.)"
                  value={formData.measurements}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="specifications">Special Specifications</label>
                <textarea
                  id="specifications"
                  name="specifications"
                  placeholder="Enter any special requirements"
                  value={formData.specifications}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>💰 Pricing & Payment</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Total Price (₹) *</label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  placeholder="Enter total price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="advancePayment">Advance Payment (₹)</label>
                <input
                  id="advancePayment"
                  type="number"
                  name="advancePayment"
                  min="0"
                  step="0.01"
                  placeholder="Enter advance payment"
                  value={formData.advancePayment}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>📅 Delivery Information</h4>
            <div className="form-group">
              <label htmlFor="deliveryDate">Expected Delivery Date *</label>
              <input
                id="deliveryDate"
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h4>📝 Additional Notes</h4>
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Any additional notes or instructions"
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
            {isLoading ? 'Creating Order...' : '✨ Create Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
