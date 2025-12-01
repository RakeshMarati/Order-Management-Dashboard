const Payment = require('../models/Payment');
const Order = require('../models/Order');

// Create new payment
exports.createPayment = async (req, res) => {
  try {
    const payment = await Payment.create({
      ...req.body,
      user: req.user.id
    });
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all payments for the user
exports.getPayments = async (req, res) => {
  try {
    const { startDate, endDate, customerName } = req.query;
    const query = { user: req.user.id };
    
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }
    
    if (customerName) {
      query.customerName = { $regex: customerName, $options: 'i' };
    }
    
    const payments = await Payment.find(query)
      .populate('relatedOrder', 'customerName product price')
      .sort({ paymentDate: -1 });
    
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single payment
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    }).populate('relatedOrder');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update payment
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    Object.assign(payment, req.body);
    await payment.save();
    
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payment statistics
exports.getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchQuery = { user: req.user.id };
    
    if (startDate || endDate) {
      matchQuery.paymentDate = {};
      if (startDate) matchQuery.paymentDate.$gte = new Date(startDate);
      if (endDate) matchQuery.paymentDate.$lte = new Date(endDate);
    }
    
    const stats = await Payment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalPayments = await Payment.countDocuments(matchQuery);
    const totalAmount = await Payment.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      methodBreakdown: stats,
      totalPayments,
      totalAmount: totalAmount[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get customer payment summary (pending amounts, total orders, etc.)
exports.getCustomerPaymentSummary = async (req, res) => {
  try {
    const { customerName, customerContact } = req.query;
    
    if (!customerName && !customerContact) {
      return res.status(400).json({ message: 'Customer name or contact is required' });
    }

    const query = { user: req.user.id };
    if (customerName) {
      query.customerName = { $regex: customerName, $options: 'i' };
    }
    if (customerContact) {
      query.customerContact = customerContact;
    }

    // Get all orders for this customer
    const orders = await Order.find(query);

    // Get all payments for this customer
    const paymentQuery = { user: req.user.id };
    if (customerName) {
      paymentQuery.customerName = { $regex: customerName, $options: 'i' };
    }
    if (customerContact) {
      paymentQuery.customerContact = customerContact;
    }
    const payments = await Payment.find(paymentQuery);

    // Calculate totals
    const totalOrderValue = orders.reduce((sum, order) => sum + (order.price || 0), 0);
    const totalAdvancePaid = orders.reduce((sum, order) => sum + (order.advancePayment || 0), 0);
    const totalPaymentsReceived = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalPaid = totalPaymentsReceived; // All payments including advances
    const pendingAmount = totalOrderValue - totalPaid;

    // Get pending orders (not fully paid)
    const pendingOrders = orders.filter(order => {
      const orderPayments = payments.filter(p => 
        p.relatedOrder && p.relatedOrder.toString() === order._id.toString()
      );
      const paidForOrder = orderPayments.reduce((sum, p) => sum + p.amount, 0);
      return paidForOrder < order.price;
    }).map(order => {
      const orderPayments = payments.filter(p => 
        p.relatedOrder && p.relatedOrder.toString() === order._id.toString()
      );
      const paidForOrder = orderPayments.reduce((sum, p) => sum + p.amount, 0);
      return {
        orderId: order._id,
        product: order.product,
        orderDate: order.orderDate,
        deliveryDate: order.deliveryDate,
        status: order.status,
        totalPrice: order.price,
        paidAmount: paidForOrder,
        pendingAmount: order.price - paidForOrder
      };
    });

    res.status(200).json({
      customerName: orders[0]?.customerName || customerName,
      customerContact: orders[0]?.customerContact || customerContact,
      customerLocation: orders[0]?.customerLocation,
      totalOrders: orders.length,
      totalOrderValue,
      totalPaid,
      pendingAmount,
      pendingOrders,
      paymentHistory: payments.map(p => ({
        paymentId: p._id,
        amount: p.amount,
        paymentDate: p.paymentDate,
        paymentMethod: p.paymentMethod,
        relatedOrder: p.relatedOrder,
        notes: p.notes
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

