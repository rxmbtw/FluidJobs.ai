# FluidJobs.ai

A modern, AI-powered job platform built with React and Node.js, featuring advanced candidate management, Google authentication, and intelligent job matching capabilities.

## 🚀 Quick Start

### Automatic Setup (Recommended)
```bash
git clone https://github.com/rxmbtw/FluidJobs.ai.git
cd FluidJobs.ai
start.bat  # Windows users
```

### Manual Setup
See [SETUP.md](SETUP.md) for detailed installation instructions.

## 📁 Project Structure

```
FluidJobs.ai/
├── FluidJobs.ai/          # React Frontend (TypeScript)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   ├── public/
│   └── package.json
├── backend/               # Node.js/Express Backend
│   ├── routes/            # API routes
│   ├── controllers/       # Business logic
│   ├── middleware/        # Custom middleware
│   ├── config/            # Configuration files
│   ├── utils/             # Backend utilities
│   └── server.js
├── SETUP.md              # Detailed setup guide
└── start.bat             # Quick start script
```

## ✨ Features

### Core Functionality
- ✅ **Modern React Frontend** - Built with TypeScript and Tailwind CSS
- ✅ **Node.js/Express Backend** - RESTful API with comprehensive endpoints
- ✅ **Google Authentication** - Secure OAuth2 integration
- ✅ **PostgreSQL Database** - Robust data storage with optimized schema
- ✅ **File Upload System** - Resume and profile image management
- ✅ **Candidate Management** - Complete CRUD operations with search and filtering
- ✅ **Profile Management** - User profiles with skills and experience tracking

### Advanced Features
- 🔄 **AI Integration** - Gemini AI for intelligent candidate matching (In Progress)
- 📊 **Analytics Dashboard** - Comprehensive statistics and insights
- 🔍 **Advanced Search** - Multi-criteria candidate search with pagination
- 📱 **Responsive Design** - Mobile-first approach with modern UI/UX
- 🔐 **Security** - JWT authentication with role-based access control

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **React Context** for state management

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **Passport.js** for authentication
- **Multer** for file uploads
- **JWT** for session management
- **bcrypt** for password hashing

## 🌐 API Endpoints

- `GET /api/candidates` - List candidates with pagination
- `POST /api/candidates` - Create new candidate
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate
- `POST /api/auth/google` - Google OAuth authentication
- `GET /api/profile` - Get user profile
- `POST /api/upload/resume` - Upload resume files

## 🔧 Development

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Git

### Environment Variables
Copy `.env.example` to `.env` in both frontend and backend directories and configure:

```env
# Backend
DATABASE_URL=postgresql://username:password@localhost:5432/fluidjobs
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret

# Frontend
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with tables for:
- Users and authentication
- Candidate profiles and information
- Skills and experience tracking
- File uploads and metadata

## 🚀 Deployment

### Local Development
1. Follow the setup instructions in [SETUP.md](SETUP.md)
2. Access the application at `http://localhost:3000`
3. Backend API available at `http://localhost:8000`

### Production Deployment
- ☁️ Google Cloud Platform integration (Planned)
- 🐳 Docker containerization (Planned)
- 🔄 CI/CD pipeline setup (Planned)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

**FluidJobs.ai** - Revolutionizing recruitment with AI-powered job matching 🚀
