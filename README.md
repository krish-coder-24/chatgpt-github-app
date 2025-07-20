# 🏥 VitalAI - Your Personal Medical Professional

VitalAI is an advanced AI-powered medical consultation platform inspired by Baymax from Big Hero 6. It provides caring, professional medical guidance through an intuitive web interface with real-time AI conversations.

![VitalAI](https://img.shields.io/badge/VitalAI-Medical%20AI%20Platform-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)

## ✨ Features

### 🤖 AI-Powered Medical Consultations
- **Baymax-Inspired AI**: Caring, compassionate medical companion
- **Real-time Chat**: Instant responses to medical queries
- **Intelligent Analysis**: Symptom assessment and health guidance
- **24/7 Availability**: Get medical support anytime, anywhere

### 🏥 Health Management
- **Medical History**: Track consultations and health trends
- **Vital Signs Monitoring**: Record and monitor health metrics
- **Symptom Tracking**: Detailed symptom logging and analysis
- **Emergency Detection**: Smart urgency level assessment

### 🔒 Security & Privacy
- **Data Encryption**: Bank-level security for health data
- **HIPAA Compliance Ready**: Privacy-focused architecture
- **Secure Authentication**: JWT-based user authentication
- **Role-based Access**: Patient, doctor, and admin roles

### 💻 Modern Interface
- **Material-UI Design**: Beautiful, responsive interface
- **Real-time Updates**: Socket.IO for live consultations
- **Mobile Friendly**: Works perfectly on all devices
- **Smooth Animations**: Framer Motion for engaging UX

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 5+
- Git

### Installation

1. **Clone the Repository**
```bash
git clone <repository-url>
cd vitalai-platform
```

2. **Install Dependencies**
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

3. **Environment Setup**
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

4. **Start MongoDB**
```bash
# Using MongoDB service
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

5. **Run the Application**
```bash
# Development mode (backend + frontend)
npm run dev

# Or run separately:
# Backend only
npm start

# Frontend only (in client directory)
cd client && npm start
```

6. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/vitalai

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# OpenAI (Optional - for AI features)
OPENAI_API_KEY=your-openai-api-key

# Client URL
CLIENT_URL=http://localhost:3000
```

### Optional Features

#### OpenAI Integration
To enable advanced AI features, add your OpenAI API key:
1. Get an API key from [OpenAI](https://platform.openai.com/)
2. Add it to your `.env` file as `OPENAI_API_KEY`
3. Restart the server

Without OpenAI, VitalAI will still work with fallback responses.

## 📁 Project Structure

```
vitalai-platform/
├── server/                 # Backend (Node.js/Express)
│   ├── app.js             # Main server file
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication & validation
│   └── ...
├── client/                # Frontend (React)
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── ...
│   ├── public/
│   └── package.json
├── package.json           # Backend dependencies
├── .env.example          # Environment template
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### AI Consultations
- `POST /api/ai/consultation/start` - Start new consultation
- `POST /api/ai/consultation/:id/message` - Send message
- `GET /api/ai/consultations` - Get user consultations
- `PUT /api/ai/consultation/:id/end` - End consultation

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Medical Data
- `GET /api/medical/history` - Get medical history
- `GET /api/medical/consultation/:id` - Get consultation details

## 🎨 UI Components

### Key Features
- **Landing Page**: Beautiful introduction with features
- **Authentication**: Login/Register with validation
- **Dashboard**: Overview of health status and quick actions
- **Consultation**: Real-time chat with VitalAI
- **History**: Past consultations and health trends
- **Profile**: User and medical information management

### Design System
- **Colors**: Blue primary (#2196f3), caring and professional
- **Typography**: Inter font family for readability
- **Layout**: Material-UI components with custom styling
- **Animations**: Smooth transitions with Framer Motion

## 🧠 AI Capabilities

VitalAI is designed to be:

1. **Caring & Compassionate**: Like Baymax, always warm and empathetic
2. **Professional**: Evidence-based medical information
3. **Safe**: Always encourages professional medical care when needed
4. **Educational**: Explains medical concepts clearly
5. **Responsive**: Quick, intelligent responses to health queries

### Safety Features
- Emergency keyword detection
- Urgency level assessment
- Professional referral recommendations
- Clear limitations disclosure

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Express-validator for API endpoints
- **CORS Protection**: Configured for secure cross-origin requests
- **Helmet.js**: Security headers and protection
- **Rate Limiting**: (Recommended for production)

## 📱 Mobile Support

VitalAI is fully responsive and works great on:
- 📱 Mobile phones (iOS/Android)
- 💻 Tablets
- 🖥️ Desktop computers
- 🌐 All modern browsers

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use production MongoDB instance
3. Set secure JWT secret
4. Configure HTTPS
5. Set up proper logging

### Recommended Stack
- **Frontend**: Vercel, Netlify, or AWS S3
- **Backend**: Heroku, AWS EC2, or DigitalOcean
- **Database**: MongoDB Atlas
- **CDN**: CloudFlare for static assets

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

Need help? 

- 📧 Email: support@vitalai.com
- 🐛 Issues: GitHub Issues
- 📖 Documentation: [Wiki](../../wiki)

## ⚠️ Important Medical Disclaimer

**VitalAI is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read or received from VitalAI.**

---

**Made with ❤️ by the VitalAI Team**

*Inspired by Baymax from Big Hero 6 - "I am VitalAI, your personal healthcare companion."*

