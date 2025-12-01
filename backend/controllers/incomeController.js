const Income = require('../models/Income');

// Create new income
exports.createIncome = async (req, res) => {
  try {
    const income = await Income.create({
      ...req.body,
      user: req.user.id
    });
    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all income records for the user
exports.getIncomes = async (req, res) => {
  try {
    const { startDate, endDate, incomeType, source } = req.query;
    const query = { user: req.user.id };
    
    if (startDate || endDate) {
      query.incomeDate = {};
      if (startDate) query.incomeDate.$gte = new Date(startDate);
      if (endDate) query.incomeDate.$lte = new Date(endDate);
    }
    
    if (incomeType) {
      query.incomeType = incomeType;
    }
    
    if (source) {
      query.source = { $regex: source, $options: 'i' };
    }
    
    const incomes = await Income.find(query)
      .populate('relatedOrder', 'customerName product price')
      .sort({ incomeDate: -1 });
    
    res.status(200).json(incomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single income
exports.getIncome = async (req, res) => {
  try {
    const income = await Income.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    }).populate('relatedOrder');
    
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    
    res.status(200).json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update income
exports.updateIncome = async (req, res) => {
  try {
    const income = await Income.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    Object.assign(income, req.body);
    await income.save();
    
    res.status(200).json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete income
exports.deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    
    res.status(200).json({ message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get income statistics
exports.getIncomeStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchQuery = { user: req.user.id };
    
    if (startDate || endDate) {
      matchQuery.incomeDate = {};
      if (startDate) matchQuery.incomeDate.$gte = new Date(startDate);
      if (endDate) matchQuery.incomeDate.$lte = new Date(endDate);
    }
    
    const stats = await Income.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$incomeType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalIncomes = await Income.countDocuments(matchQuery);
    const totalAmount = await Income.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      typeBreakdown: stats,
      totalIncomes,
      totalAmount: totalAmount[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

