const Order = require('../models/Order');
const Payment = require('../models/Payment');

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const {
      orderTaker,
      orderTakerName,
      customerName,
      customerContact,
      customerLocation,
      product,
      quantity,
      measurements,
      specifications,
      deliveryDate,
      price,
      advancePayment,
      notes,
      paymentMethod
    } = req.body;

    const order = await Order.create({
      orderTaker,
      orderTakerName,
      customerName,
      customerContact,
      customerLocation,
      product,
      quantity,
      measurements,
      specifications,
      deliveryDate: new Date(deliveryDate),
      price,
      advancePayment: advancePayment || 0,
      notes,
      user: req.user.id
    });

    // Automatically create payment record if advance payment is made
    if (advancePayment && advancePayment > 0) {
      try {
        await Payment.create({
          customerName,
          customerContact,
          paymentDate: new Date(),
          amount: advancePayment,
          paymentMethod: paymentMethod || 'cash',
          relatedOrder: order._id,
          notes: `Advance payment for order - ${product}`,
          user: req.user.id
        });
      } catch (paymentError) {
        // Log error but don't fail the order creation
        console.error('Error creating payment record:', paymentError);
      }
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders for the user
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Store old advance payment to calculate difference
    const oldAdvancePayment = order.advancePayment || 0;
    const { paymentMethod } = req.body;

    // Update allowed fields
    const allowedUpdates = [
      'status', 'deliveryDate', 'actualDeliveryDate', 
      'price', 'advancePayment', 'notes', 'measurements', 
      'specifications', 'customerContact', 'customerLocation'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'deliveryDate' || field === 'actualDeliveryDate') {
          order[field] = new Date(req.body[field]);
        } else {
          order[field] = req.body[field];
        }
      }
    });

    await order.save();

    // Create payment record if advance payment increased
    const newAdvancePayment = order.advancePayment || 0;
    const paymentDifference = newAdvancePayment - oldAdvancePayment;

    if (paymentDifference > 0) {
      try {
        await Payment.create({
          customerName: order.customerName,
          customerContact: order.customerContact,
          paymentDate: new Date(),
          amount: paymentDifference,
          paymentMethod: paymentMethod || 'cash',
          relatedOrder: order._id,
          notes: `Payment update for order - ${order.product}${paymentDifference === newAdvancePayment ? ' (Advance payment)' : ' (Additional payment)'}`,
          user: req.user.id
        });
      } catch (paymentError) {
        // Log error but don't fail the order update
        console.error('Error creating payment record:', paymentError);
      }
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order statistics
exports.getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$price' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments({ user: req.user.id });
    const totalValue = await Order.aggregate([
      { $match: { user: req.user.id } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    res.status(200).json({
      statusBreakdown: stats,
      totalOrders,
      totalValue: totalValue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
