const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Order taker information
  orderTaker: {
    type: String,
    enum: ['owner', 'employee'],
    required: [true, 'Order taker is required']
  },
  orderTakerName: {
    type: String,
    required: [true, 'Order taker name is required'],
    trim: true
  },

  // Customer information
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  customerContact: {
    type: String,
    required: [true, 'Customer contact is required'],
    trim: true
  },
  customerLocation: {
    type: String,
    required: [true, 'Customer location is required'],
    trim: true
  },

  // Product information
  product: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  
  // Measurements and specifications
  measurements: {
    type: String,
    trim: true
  },
  specifications: {
    type: String,
    trim: true
  },

  // Dates
  orderDate: {
    type: Date,
    default: Date.now
  },
  deliveryDate: {
    type: Date,
    required: [true, 'Delivery date is required']
  },
  actualDeliveryDate: {
    type: Date
  },

  // Pricing
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  advancePayment: {
    type: Number,
    default: 0,
    min: [0, 'Advance payment cannot be negative']
  },

  // Status and tracking
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  // User who created the order
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Additional notes
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Virtual for remaining payment
orderSchema.virtual('remainingPayment').get(function() {
  return this.price - this.advancePayment;
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
