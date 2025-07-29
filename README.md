# Karthikeya Boutique - Order Management System

A modern, full-stack order management system built with the MERN stack (MongoDB, Express.js, React, Node.js) for boutique businesses.

## Features

- 🔐 **Secure Authentication** - JWT-based login system
- 📦 **Order Management** - Create and view orders
- 🎨 **Modern UI** - Clean, responsive design
- 🔒 **Protected Routes** - Secure dashboard access
- 📱 **Mobile Responsive** - Works on all devices
- ⚡ **Real-time Updates** - Instant order list refresh

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Karthikeya-Botique
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**

   Create a `.env` file in the backend directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/karthikeya-boutique
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   NODE_ENV=development
   ```

5. **Seed Database**
   ```bash
   cd backend
   npm run seed
   ```

6. **Start the Application**

   **Backend:**
   ```bash
   cd backend
   npm run dev
   ```

   **Frontend:**
   ```bash
   cd frontend
   npm start
   ```

7. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Demo Credentials

- **Email:** admin@boutique.com
- **Password:** password123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Orders
- `GET /api/orders` - Get user orders (protected)
- `POST /api/orders` - Create new order (protected)

## Project Structure

```
Karthikeya-Botique/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── orderController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Order.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── orderRoutes.js
│   ├── scripts/
│   │   └── seedUser.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard/
    │   │   ├── Login/
    │   │   ├── OrderForm/
    │   │   ├── OrderList/
    │   │   └── ProtectedRoute/
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── services/
    │   │   └── api.js
    │   └── App.js
    └── package.json
```

## Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start    # Starts React development server
```

## Production Deployment

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Setup Production Environment**
   - Set `NODE_ENV=production`
   - Use strong JWT secret
   - Configure MongoDB Atlas or production database
   - Set up proper CORS origins

3. **Deploy Backend**
   - Deploy to Heroku, Vercel, or your preferred platform
   - Set environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@karthikeyaboutique.com or create an issue in the repository.