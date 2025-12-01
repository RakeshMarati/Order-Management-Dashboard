const mongoose = require('mongoose');

const materialPurchaseSchema = new mongoose.Schema({
  // Purchase date
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required'],
    default: Date.now
  },
  
  // Material/item details
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [200, 'Item name cannot exceed 200 characters']
  },
  itemCategory: {
    type: String,
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    trim: true,
    default: 'pieces'
  },
  
  // Supplier information
  supplierName: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
    maxlength: [100, 'Supplier name cannot exceed 100 characters']
  },
  supplierContact: {
    type: String,
    trim: true
  },
  supplierEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  
  // Cost details
  costPerUnit: {
    type: Number,
    required: [true, 'Cost per unit is required'],
    min: [0, 'Cost cannot be negative']
  },
  totalCost: {
    type: Number,
    required: [true, 'Total cost is required'],
    min: [0, 'Total cost cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'upi', 'card', 'cheque', 'credit', 'other'],
    default: 'cash'
  },
  
  // Additional details
  invoiceNumber: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  
  // User who recorded the purchase
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
materialPurchaseSchema.index({ purchaseDate: -1 });
materialPurchaseSchema.index({ supplierName: 1 });
materialPurchaseSchema.index({ user: 1 });

module.exports = mongoose.model('MaterialPurchase', materialPurchaseSchema);

