# Contributing to FluidJobs.ai

Thank you for your interest in contributing to FluidJobs.ai! This document provides guidelines and information for contributors.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/FluidJobs.ai.git
   cd FluidJobs.ai
   ```
3. **Set up the development environment** following [SETUP.md](SETUP.md)
4. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📋 Development Guidelines

### Code Style
- **Frontend**: Follow React/TypeScript best practices
- **Backend**: Use consistent Node.js/Express patterns
- **Formatting**: Use Prettier for code formatting
- **Linting**: Ensure ESLint passes without errors

### Commit Messages
Use conventional commit format:
```
type(scope): description

Examples:
feat(auth): add Google OAuth integration
fix(api): resolve candidate search pagination
docs(readme): update installation instructions
```

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

## 🧪 Testing

- Write tests for new features
- Ensure existing tests pass
- Test both frontend and backend changes
- Verify database migrations work correctly

## 📝 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**
4. **Update the README.md** if necessary
5. **Submit the pull request** with:
   - Clear description of changes
   - Screenshots for UI changes
   - Testing instructions

## 🐛 Bug Reports

When reporting bugs, please include:
- **Environment details** (OS, Node.js version, browser)
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Screenshots or error logs** if applicable

## 💡 Feature Requests

For new features:
- **Check existing issues** to avoid duplicates
- **Describe the use case** and benefits
- **Provide mockups or examples** if applicable
- **Consider implementation complexity**

## 🔧 Development Setup

### Prerequisites
- Node.js v16+
- PostgreSQL v12+
- Git

### Environment Variables
Copy `.env.example` files and configure:
- Database connection
- Google OAuth credentials
- JWT secrets

### Database Setup
```bash
# Run database migrations
cd backend
npm run migrate

# Seed test data (optional)
npm run seed
```

## 📚 Code Structure

### Frontend (`FluidJobs.ai/`)
```
src/
├── components/     # Reusable UI components
├── pages/         # Route components
├── contexts/      # React contexts
├── services/      # API calls
├── utils/         # Helper functions
└── types.ts       # TypeScript definitions
```

### Backend (`backend/`)
```
├── routes/        # Express routes
├── controllers/   # Business logic
├── middleware/    # Custom middleware
├── config/        # Configuration
├── utils/         # Helper functions
└── server.js      # Entry point
```

## 🚫 What Not to Include

- Sensitive credentials or API keys
- Large binary files
- Generated files (build artifacts)
- Personal configuration files
- Test data with real user information

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Code Review**: All PRs require review before merging

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributor graphs

Thank you for contributing to FluidJobs.ai! 🎉