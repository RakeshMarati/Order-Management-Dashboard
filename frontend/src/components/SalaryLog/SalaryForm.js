import React, { useState } from 'react';
import { salariesAPI } from '../../services/api';
import './SalaryLog.css';

const SalaryForm = ({ onSalaryCreated }) => {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    employeeName: '',
    employeeId: '',
    employeeContact: '',
    employeeEmail: '',
    amount: '',
    paymentMethod: 'cash',
    salaryPeriod: '',
    month: currentMonth,
    year: currentYear,
    transactionId: '',
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'employeeContact') {
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
    
    if (!formData.employeeName || !formData.amount || !formData.paymentDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const salaryData = {
        ...formData,
        amount: parseFloat(formData.amount),
        year: parseInt(formData.year) || currentYear
      };
      
      await salariesAPI.createSalary(salaryData);
      
      // Reset form
      setFormData({
        paymentDate: new Date().toISOString().split('T')[0],
        employeeName: '',
        employeeId: '',
        employeeContact: '',
        employeeEmail: '',
        amount: '',
        paymentMethod: 'cash',
        salaryPeriod: '',
        month: currentMonth,
        year: currentYear,
        transactionId: '',
        notes: ''
      });
      
      if (onSalaryCreated) {
        onSalaryCreated();
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create salary record');
    } finally {
      setIsLoading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="salary-form-container">
      <div className="salary-form-card">
        <h3>💼 Record Salary Payment</h3>
        
        <form onSubmit={handleSubmit} className="salary-form">
          <div className="form-section">
            <h4>👤 Employee Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="employeeName">Employee Name *</label>
                <input
                  id="employeeName"
                  type="text"
                  name="employeeName"
                  placeholder="Enter employee name"
                  value={formData.employeeName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="employeeId">Employee ID</label>
                <input
                  id="employeeId"
                  type="text"
                  name="employeeId"
                  placeholder="Enter employee ID"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="employeeContact">Contact Number</label>
                <input
                  id="employeeContact"
                  type="tel"
                  name="employeeContact"
                  placeholder="Enter contact number"
                  value={formData.employeeContact}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="employeeEmail">Email</label>
                <input
                  id="employeeEmail"
                  type="email"
                  name="employeeEmail"
                  placeholder="Enter email"
                  value={formData.employeeEmail}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>💰 Payment Details</h4>
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
                <label htmlFor="amount">Salary Amount (₹) *</label>
                <input
                  id="amount"
                  type="number"
                  name="amount"
                  min="0"
                  step="0.01"
                  placeholder="Enter salary amount"
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
            <h4>📅 Period Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="month">Month</label>
                <select
                  id="month"
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                >
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="year">Year</label>
                <input
                  id="year"
                  type="number"
                  name="year"
                  min="2020"
                  max="2100"
                  value={formData.year}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="salaryPeriod">Salary Period</label>
              <input
                id="salaryPeriod"
                type="text"
                name="salaryPeriod"
                placeholder="e.g., Monthly, Weekly, Bi-weekly"
                value={formData.salaryPeriod}
                onChange={handleInputChange}
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
            {isLoading ? 'Recording Salary...' : '💾 Record Salary'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SalaryForm;

