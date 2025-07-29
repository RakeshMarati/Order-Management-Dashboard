const Order = require('../models/Order');

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
      notes
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
