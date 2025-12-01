import React, { useState } from 'react';
import { materialPurchasesAPI } from '../../services/api';
import './MaterialPurchase.css';

const MaterialPurchaseForm = ({ onPurchaseCreated }) => {
  const [formData, setFormData] = useState({
    purchaseDate: new Date().toISOString().split('T')[0],
    itemName: '',
    itemCategory: '',
    quantity: '',
    unit: 'pieces',
    supplierName: '',
    supplierContact: '',
    supplierEmail: '',
    costPerUnit: '',
    totalCost: '',
    paymentMethod: 'cash',
    invoiceNumber: '',
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'supplierContact') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else if (name === 'quantity' || name === 'costPerUnit' || name === 'totalCost') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      // Auto-calculate total cost
      if (name === 'quantity' || name === 'costPerUnit') {
        const qty = name === 'quantity' ? parseFloat(value) || 0 : parseFloat(formData.quantity) || 0;
        const cost = name === 'costPerUnit' ? parseFloat(value) || 0 : parseFloat(formData.costPerUnit) || 0;
        setFormData(prev => ({
          ...prev,
          totalCost: (qty * cost).toFixed(2)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.itemName || !formData.supplierName || !formData.quantity || !formData.costPerUnit || !formData.purchaseDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const purchaseData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        costPerUnit: parseFloat(formData.costPerUnit),
        totalCost: parseFloat(formData.totalCost) || parseFloat(formData.quantity) * parseFloat(formData.costPerUnit)
      };
      
      await materialPurchasesAPI.createMaterialPurchase(purchaseData);
      
      // Reset form
      setFormData({
        purchaseDate: new Date().toISOString().split('T')[0],
        itemName: '',
        itemCategory: '',
        quantity: '',
        unit: 'pieces',
        supplierName: '',
        supplierContact: '',
        supplierEmail: '',
        costPerUnit: '',
        totalCost: '',
        paymentMethod: 'cash',
        invoiceNumber: '',
        notes: ''
      });
      
      if (onPurchaseCreated) {
        onPurchaseCreated();
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create material purchase');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="material-purchase-form-container">
      <div className="material-purchase-form-card">
        <h3>📦 Record Material Purchase</h3>
        
        <form onSubmit={handleSubmit} className="material-purchase-form">
          <div className="form-section">
            <h4>📅 Purchase Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="purchaseDate">Purchase Date *</label>
                <input
                  id="purchaseDate"
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="invoiceNumber">Invoice Number</label>
                <input
                  id="invoiceNumber"
                  type="text"
                  name="invoiceNumber"
                  placeholder="Enter invoice number"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>🛍️ Item Details</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="itemName">Item Name *</label>
                <input
                  id="itemName"
                  type="text"
                  name="itemName"
                  placeholder="e.g., Silk Fabric, Thread, Buttons"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="itemCategory">Category</label>
                <input
                  id="itemCategory"
                  type="text"
                  name="itemCategory"
                  placeholder="e.g., Fabric, Accessories, Tools"
                  value={formData.itemCategory}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="quantity">Quantity *</label>
                <input
                  id="quantity"
                  type="number"
                  name="quantity"
                  min="0"
                  step="0.01"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="unit">Unit</label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                >
                  <option value="pieces">Pieces</option>
                  <option value="meters">Meters</option>
                  <option value="kg">Kilograms</option>
                  <option value="grams">Grams</option>
                  <option value="liters">Liters</option>
                  <option value="boxes">Boxes</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>🏪 Supplier Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="supplierName">Supplier Name *</label>
                <input
                  id="supplierName"
                  type="text"
                  name="supplierName"
                  placeholder="Enter supplier name"
                  value={formData.supplierName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="supplierContact">Contact Number</label>
                <input
                  id="supplierContact"
                  type="tel"
                  name="supplierContact"
                  placeholder="Enter supplier contact"
                  value={formData.supplierContact}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="supplierEmail">Email</label>
              <input
                id="supplierEmail"
                type="email"
                name="supplierEmail"
                placeholder="Enter supplier email"
                value={formData.supplierEmail}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-section">
            <h4>💰 Cost Details</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="costPerUnit">Cost Per Unit (₹) *</label>
                <input
                  id="costPerUnit"
                  type="number"
                  name="costPerUnit"
                  min="0"
                  step="0.01"
                  placeholder="Enter cost per unit"
                  value={formData.costPerUnit}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="totalCost">Total Cost (₹) *</label>
                <input
                  id="totalCost"
                  type="number"
                  name="totalCost"
                  min="0"
                  step="0.01"
                  placeholder="Auto-calculated"
                  value={formData.totalCost}
                  onChange={handleInputChange}
                  required
                  readOnly
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="cheque">Cheque</option>
                <option value="credit">Credit</option>
                <option value="other">Other</option>
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
            {isLoading ? 'Recording Purchase...' : '💾 Record Purchase'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MaterialPurchaseForm;

