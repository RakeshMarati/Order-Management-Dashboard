const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  // Payment date
  paymentDate: {
    type: Date,
    required: [true, 'Payment date is required'],
    default: Date.now
  },
  
  // Employee information
  employeeName: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true,
    maxlength: [100, 'Employee name cannot exceed 100 characters']
  },
  employeeId: {
    type: String,
    trim: true
  },
  employeeContact: {
    type: String,
    trim: true
  },
  employeeEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  
  // Salary details
  amount: {
    type: Number,
    required: [true, 'Salary amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'upi', 'cheque', 'other'],
    required: [true, 'Payment method is required']
  },
  
  // Period information
  salaryPeriod: {
    type: String,
    trim: true,
    maxlength: [50, 'Period cannot exceed 50 characters']
  },
  month: {
    type: String,
    trim: true
  },
  year: {
    type: Number
  },
  
  // Additional details
  transactionId: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  
  // User who recorded the salary payment
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
salarySchema.index({ paymentDate: -1 });
salarySchema.index({ employeeName: 1 });
salarySchema.index({ user: 1 });
salarySchema.index({ month: 1, year: 1 });

module.exports = mongoose.model('Salary', salarySchema);

