# Smart NGO Donation Platform

A full-stack web application that connects donors with NGOs to facilitate smooth donation management. The platform enables donors to list items for donation, NGOs to manage and view available donations, and real-time communication between donors and NGOs through an integrated chat system.

## 🌟 Features

### Core Features
- **User Authentication**: Secure login/registration with role-based access (Donor, NGO, Admin)
- **Donation Management**: Post, view, and manage donations with detailed item descriptions
- **Real-time Chat**: WebSocket-powered messaging between donors and NGOs
- **Geographic Mapping**: Interactive map to visualize donation locations using Leaflet
- **Role-Based Dashboards**: Customized dashboards for donors, NGOs, and administrators
- **Analytics Dashboard**: Track donation statistics and platform insights
- **Admin Control Panel**: Manage users, donations, and platform content
- **Image Upload**: Cloudinary integration for image management
- **Email Notifications**: Automated email alerts for important events
- **User Profiles**: Detailed user profiles with contact information and history

### Donation Features
- Item categorization (Clothes, Books, Electronics, etc.)
- Condition tracking (New, Used - Good, Used - Fair)
- Status management (Pending, Accepted, Collected)
- Pickup time scheduling and slot availability
- Multiple image uploads per donation
- Location-based filtering and search

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (v5.2.1)
- **Database**: MongoDB with Mongoose ODM (v9.2.0)
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: Socket.io (v4.8.3)
- **File Upload**: Multer + Cloudinary
- **Security**: bcryptjs for password hashing
- **CORS**: Enabled for cross-origin requests
- **Development**: Nodemon

### Frontend
- **Framework**: React (v19.2.0)
- **Build Tool**: Vite (v7.2.4)
- **Routing**: React Router DOM (v7.13.0)
- **Styling**: Tailwind CSS (v4.1.18)
- **HTTP Client**: Axios (v1.13.5)
- **Real-time**: Socket.io-client (v4.8.3)
- **Maps**: Leaflet + React-Leaflet (v5.0.0)
- **Notifications**: React-Toastify (v11.0.5)
- **Linting**: ESLint

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local or cloud instance like MongoDB Atlas)
- **Git**

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd smart-ngo-donation-platform
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/smart-ngo-donation OR your MongoDB Atlas URI

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Email Configuration (for sending notifications)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@smartngo.com

# Cloudinary Configuration (for image uploads)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory with the following variables:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 🏃 Running the Project

### Start Backend Server
```bash
cd backend
npm run dev        # Development mode with nodemon
# or
npm start          # Production mode
```

The backend server will run on `http://localhost:5000`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
smart-ngo-donation-platform/
├── backend/                      # Express.js server
│   ├── config/                   # Configuration files
│   │   ├── db.js                # MongoDB connection
│   │   └── cloudinary.js         # Cloudinary setup
│   ├── controllers/              # Request handlers
│   │   ├── authController.js     # Authentication logic
│   │   ├── donationController.js # Donation CRUD operations
│   │   ├── chatController.js     # Chat functionality
│   │   ├── ngoController.js      # NGO-specific operations
│   │   ├── donorController.js    # Donor-specific operations
│   │   ├── adminController.js    # Admin operations
│   │   └── analyticsController.js# Analytics data
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js              # User model
│   │   ├── Donation.js          # Donation model
│   │   ├── Conversation.js      # Chat conversations
│   │   ├── Message.js           # Chat messages
│   │   └── Notification.js      # Notifications
│   ├── routes/                   # API endpoints
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── donationRoutes.js     # Donation endpoints
│   │   ├── chatRoutes.js         # Chat endpoints
│   │   ├── ngoRoutes.js          # NGO endpoints
│   │   ├── donorRoutes.js        # Donor endpoints
│   │   ├── adminRoutes.js        # Admin endpoints
│   │   └── analyticsRoutes.js    # Analytics endpoints
│   ├── middlewares/              # Custom middleware
│   │   ├── authMiddleware.js     # JWT verification
│   │   ├── roleMiddleware.js     # Role-based access
│   │   ├── uploadMiddleware.js   # File upload handling
│   │   └── errorMiddleware.js    # Error handling
│   ├── socket/                   # WebSocket handlers
│   │   └── socket.js             # Socket.io events
│   ├── utils/                    # Utility functions
│   │   ├── generateToken.js      # JWT token generation
│   │   └── sendEmail.js          # Email sending
│   ├── uploads/                  # Local file uploads
│   ├── server.js                 # Main server file
│   └── package.json              # Backend dependencies
│
└── frontend/                     # React + Vite application
    ├── src/
    │   ├── components/           # Reusable components
    │   │   ├── Navbar.jsx        # Navigation bar
    │   │   ├── DonationMap.jsx   # Map visualization
    │   │   ├── PrivateRoute.jsx  # Protected routes
    │   │   ├── StatsDashboard.jsx# Statistics widget
    │   │   ├── chat/             # Chat components
    │   │   ├── admin/            # Admin components
    │   │   ├── donor/            # Donor components
    │   │   ├── ngo/              # NGO components
    │   │   └── common/           # Shared components
    │   ├── context/              # React Context
    │   │   ├── AuthContext.jsx   # Authentication state
    │   │   └── ChatContext.jsx   # Chat state
    │   ├── pages/                # Page components
    │   │   ├── Home.jsx          # Landing page
    │   │   ├── Login.jsx         # Login page
    │   │   ├── Register.jsx      # Registration page
    │   │   ├── Dashboard.jsx     # User dashboard
    │   │   ├── Profile.jsx       # User profile
    │   │   ├── Chat.jsx          # Chat page
    │   │   └── Donate.jsx        # Donation page
    │   ├── App.jsx               # Main app component
    │   ├── main.jsx              # Entry point
    │   └── index.css             # Global styles
    ├── public/                   # Static assets
    │   └── images/               # Image directories
    ├── package.json              # Frontend dependencies
    ├── vite.config.js            # Vite configuration
    └── eslint.config.js          # ESLint configuration
```

## 📊 Database Models

### User Model
```javascript
- name: String (required)
- email: String (required, unique)
- password: String (required, hashed)
- phone: String (required)
- role: String (enum: "donor", "ngo", "admin")
- address: String
- verified: Boolean
- createdAt: Date
```

### Donation Model
```javascript
- user: ObjectId (ref: User)
- name: String (item name)
- description: String
- category: String
- condition: String
- image: String (URL)
- images: [String] (multiple images)
- status: String (enum: "Pending", "Accepted", "Collected")
- location: String
- geometry: GeoJSON
- availableSlots: [String]
- pickupTime: String
- createdAt: Date
```

### Conversation Model
```javascript
- participants: [ObjectId] (users in conversation)
- lastMessage: String
- updatedAt: Date
```

### Message Model
```javascript
- conversation: ObjectId (ref: Conversation)
- sender: ObjectId (ref: User)
- content: String
- createdAt: Date
```

## 🔌 API Endpoints Overview

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Donation Routes
- `GET /api/donations` - Get all donations
- `POST /api/donations` - Create donation
- `GET /api/donations/:id` - Get donation details
- `PUT /api/donations/:id` - Update donation
- `DELETE /api/donations/:id` - Delete donation

### Chat Routes
- `GET /api/chat/conversations` - Get user conversations
- `POST /api/chat/conversations` - Create conversation
- `GET /api/chat/conversations/:id/messages` - Get messages

### NGO Routes
- `GET /api/ngo/available-donations` - Get available donations
- `POST /api/ngo/accept-donation` - Accept donation
- `GET /api/ngo/dashboard` - NGO dashboard data

### Donor Routes
- `GET /api/donor/my-donations` - Get donor's donations
- `GET /api/donor/dashboard` - Donor dashboard data

### Admin Routes
- `GET /api/admin/users` - Get all users
- `GET /api/admin/donations` - Get all donations
- `POST /api/admin/users/:id/verify` - Verify user

### Analytics Routes
- `GET /api/analytics/dashboard` - Get platform analytics

## 💬 Real-time Features (Socket.io)

The application uses Socket.io for real-time communication:
- **Chat Messages**: Real-time message delivery between donors and NGOs
- **Notifications**: Live notifications for important events
- **Status Updates**: Real-time donation status updates

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- CORS enabled for cross-origin requests
- Environment variable protection for sensitive data
- Input validation and sanitization

## 📱 Pages & Routes

| Route | Role | Description |
|-------|------|-------------|
| `/` | Public | Home/Landing page |
| `/register` | Public | User registration |
| `/login` | Public | User login |
| `/dashboard` | Protected | Role-specific dashboard |
| `/chat` | Protected | Real-time chat interface |
| `/profile` | Protected | User profile page |
| `/donate` | Donor | Donation creation page |

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Vercel)
1. Set environment variables in hosting platform
2. Connect MongoDB Atlas for database
3. Deploy using `npm start`

### Frontend Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set `VITE_API_URL` to production backend URL

## 📝 Environment Variables Quick Reference

| Variable | Backend | Frontend | Description |
|----------|---------|----------|-------------|
| PORT | ✅ | | Server port |
| MONGODB_URI | ✅ | | MongoDB connection string |
| JWT_SECRET | ✅ | | JWT signing secret |
| CLOUDINARY_* | ✅ | | Cloudinary credentials |
| SMTP_* | ✅ | | Email service credentials |
| VITE_API_URL | | ✅ | Backend API URL |
| VITE_SOCKET_URL | | ✅ | WebSocket server URL |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Contact: support@smartngo.com
- Documentation: [Wiki](link-to-wiki)

## 🗺️ Roadmap

- [ ] Mobile application (React Native)
- [ ] Payment integration (Stripe/PayPal)
- [ ] Advanced analytics dashboard
- [ ] Email digest notifications
- [ ] Impact measurement features
- [ ] Multi-language support

---

**Last Updated**: April 2026

Made with ❤️ for the community
