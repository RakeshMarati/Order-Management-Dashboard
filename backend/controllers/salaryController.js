const Salary = require('../models/Salary');

// Create new salary payment
exports.createSalary = async (req, res) => {
  try {
    const salary = await Salary.create({
      ...req.body,
      user: req.user.id
    });
    res.status(201).json(salary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all salary payments for the user
exports.getSalaries = async (req, res) => {
  try {
    const { startDate, endDate, employeeName, month, year } = req.query;
    const query = { user: req.user.id };
    
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }
    
    if (employeeName) {
      query.employeeName = { $regex: employeeName, $options: 'i' };
    }
    
    if (month) {
      query.month = month;
    }
    
    if (year) {
      query.year = parseInt(year);
    }
    
    const salaries = await Salary.find(query)
      .sort({ paymentDate: -1 });
    
    res.status(200).json(salaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single salary
exports.getSalary = async (req, res) => {
  try {
    const salary = await Salary.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!salary) {
      return res.status(404).json({ message: 'Salary not found' });
    }
    
    res.status(200).json(salary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update salary
exports.updateSalary = async (req, res) => {
  try {
    const salary = await Salary.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!salary) {
      return res.status(404).json({ message: 'Salary not found' });
    }

    Object.assign(salary, req.body);
    await salary.save();
    
    res.status(200).json(salary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete salary
exports.deleteSalary = async (req, res) => {
  try {
    const salary = await Salary.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!salary) {
      return res.status(404).json({ message: 'Salary not found' });
    }
    
    res.status(200).json({ message: 'Salary deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get salary statistics
exports.getSalaryStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchQuery = { user: req.user.id };
    
    if (startDate || endDate) {
      matchQuery.paymentDate = {};
      if (startDate) matchQuery.paymentDate.$gte = new Date(startDate);
      if (endDate) matchQuery.paymentDate.$lte = new Date(endDate);
    }
    
    const stats = await Salary.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$employeeName',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalSalaries = await Salary.countDocuments(matchQuery);
    const totalAmount = await Salary.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      employeeBreakdown: stats,
      totalSalaries,
      totalAmount: totalAmount[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

