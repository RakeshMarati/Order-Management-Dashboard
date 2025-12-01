const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  // Income date
  incomeDate: {
    type: Date,
    required: [true, 'Income date is required'],
    default: Date.now
  },
  
  // Income source
  source: {
    type: String,
    required: [true, 'Income source is required'],
    trim: true,
    maxlength: [200, 'Source cannot exceed 200 characters']
  },
  incomeType: {
    type: String,
    enum: ['order_payment', 'advance_payment', 'full_payment', 'other_income', 'refund', 'other'],
    required: [true, 'Income type is required']
  },
  
  // Amount
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  
  // Payer/client information (optional)
  payerName: {
    type: String,
    trim: true,
    maxlength: [100, 'Payer name cannot exceed 100 characters']
  },
  payerContact: {
    type: String,
    trim: true
  },
  
  // Payment method
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'upi', 'card', 'cheque', 'other'],
    required: [true, 'Payment method is required']
  },
  
  // Related order (optional)
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  
  // Additional details
  transactionId: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  
  // User who recorded the income
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
incomeSchema.index({ incomeDate: -1 });
incomeSchema.index({ incomeType: 1 });
incomeSchema.index({ user: 1 });

module.exports = mongoose.model('Income', incomeSchema);

