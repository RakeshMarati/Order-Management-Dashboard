const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cors = require('cors');
require('dotenv').config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Karthikeya Boutique API is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
