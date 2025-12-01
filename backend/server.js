const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const materialPurchaseRoutes = require('./routes/materialPurchaseRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const cors = require('cors');
require('dotenv').config();

const app = express();
connectDB();

// CORS configuration for production
const corsOptions = {
  origin: true, // Allow all origins for now
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Karthikeya Boutique API is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/material-purchases', materialPurchaseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/salaries', salaryRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
