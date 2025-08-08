# Setup Guide

## Prerequisites

Before setting up the Task Management API, ensure you have the following installed:

### Required Software
- **Node.js** (v14 or higher)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
- **npm** (comes with Node.js)
  - Verify installation: `npm --version`
- **MongoDB** (local or cloud instance)
  - Local installation: https://docs.mongodb.com/manual/installation/
  - Cloud option: MongoDB Atlas (free tier available)

### Optional Tools
- **Git** (for version control)
- **Postman** (for API testing)
- **VS Code** (recommended editor)

## Installation Steps

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/KushagraTTiwari/Task-Management.git

# Navigate to project directory
cd Task-Management
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy example environment file
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database Configuration
MONGO_URL=mongodb://localhost:27017/task-management

# Server Configuration
PORT=8080

# JWT Configuration
JWT_SECRET=your-secret-key-here
```

### 4. Database Setup

#### Option A: Local MongoDB

1. **Install MongoDB** (if not already installed):
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb

   # macOS (using Homebrew)
   brew install mongodb-community

   # Windows
   # Download from https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB service**:
   ```bash
   # Ubuntu/Debian
   sudo systemctl start mongodb

   # macOS
   brew services start mongodb-community

   # Windows
   # MongoDB runs as a service after installation
   ```

3. **Verify MongoDB is running**:
   ```bash
   mongo --version
   # or
   mongosh --version
   ```

#### Option B: MongoDB Atlas (Cloud)

1. **Create MongoDB Atlas account**:
   - Go to https://www.mongodb.com/atlas
   - Sign up for free account

2. **Create a cluster**:
   - Choose free tier (M0)
   - Select your preferred region
   - Click "Create Cluster"

3. **Set up database access**:
   - Go to "Database Access"
   - Create a new database user
   - Set username and password

4. **Set up network access**:
   - Go to "Network Access"
   - Add IP address (or 0.0.0.0/0 for all IPs)

5. **Get connection string**:
   - Go to "Clusters"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

6. **Update .env file**:
   ```env
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/task-management
   ```

### 5. Start the Application

#### Development Mode
```bash
# Start with nodemon (auto-restart on file changes)
npm run dev
```

#### Production Mode
```bash
# Start the application
npm start
```

### 6. Verify Installation

1. **Check server status**:
   ```bash
   # Server should be running on http://localhost:8080
   curl http://localhost:8080/api-docs
   ```

2. **Access Swagger documentation**:
   - Open browser and go to: `http://localhost:8080/api-docs`
   - You should see the interactive API documentation

## Testing the Setup

### 1. Using cURL

#### Register a User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Login User
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Create a Task (with JWT token)
```bash
# Replace YOUR_JWT_TOKEN with the token from login response
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "subject": "Test task",
    "deadline": "2024-01-15",
    "status": "pending"
  }'
```

### 2. Using Postman

1. **Import the Postman collection** (see `docs/POSTMAN_COLLECTION.md`)
2. **Set up environment variables**
3. **Run the authentication flow**
4. **Test all endpoints**

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**
- Ensure MongoDB is running
- Check if MongoDB is installed correctly
- Verify the connection string in `.env`

#### 2. Port Already in Use
```
Error: listen EADDRINUSE :::8080
```

**Solutions:**
- Change the port in `.env` file
- Kill the process using port 8080
- Use a different port

#### 3. Module Not Found Errors
```
Error: Cannot find module 'express'
```

**Solutions:**
- Run `npm install` to install dependencies
- Check if `node_modules` folder exists
- Delete `node_modules` and `package-lock.json`, then run `npm install`

#### 4. JWT Token Issues
```
Error: Unauthorized
```

**Solutions:**
- Check if JWT_SECRET is set in `.env`
- Ensure token is being sent in Authorization header
- Verify token format: `Bearer <token>`

### Debug Mode

Enable debug logging by setting the NODE_ENV:

```bash
# Set environment variable
export NODE_ENV=development

# Start the application
npm run dev
```

### Database Debugging

#### Check MongoDB Connection
```bash
# Connect to MongoDB shell
mongo
# or
mongosh

# List databases
show dbs

# Use task-management database
use task-management

# List collections
show collections

# Check users collection
db.users.find()
```

## Production Deployment

### 1. Environment Variables

For production, use strong, unique values:

```env
# Production Environment
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/task-management
PORT=8080
JWT_SECRET=your-very-strong-secret-key-here
NODE_ENV=production
```

### 2. Security Considerations

- **JWT Secret**: Use a strong, random secret (32+ characters)
- **Database**: Use MongoDB Atlas or secure MongoDB instance
- **HTTPS**: Use SSL/TLS in production
- **Rate Limiting**: Implement rate limiting for API endpoints
- **CORS**: Configure CORS for your domain only

### 3. Process Management

Use PM2 for process management:

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/app.js --name "task-management-api"

# Monitor application
pm2 status
pm2 logs

# Restart application
pm2 restart task-management-api
```

### 4. Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
```

Build and run:

```bash
# Build image
docker build -t task-management-api .

# Run container
docker run -p 8080:8080 --env-file .env task-management-api
```

## Development Workflow

### 1. Code Structure
```
Task-Management/
├── src/
│   ├── app.js              # Main application
│   ├── config/             # Configuration files
│   ├── controllers/        # Business logic
│   ├── models/            # Database models
│   ├── routes/            # Route definitions
│   └── util/              # Utility functions
├── docs/                  # Documentation
├── package.json           # Dependencies
└── .env                   # Environment variables
```

### 2. Adding New Features

1. **Create model** (if needed) in `src/models/`
2. **Add controller** in `src/controllers/`
3. **Define routes** in `src/routes/`
4. **Update documentation** in `docs/`
5. **Add tests** (recommended)

### 3. Code Style

- Use ES6+ features
- Follow consistent naming conventions
- Add JSDoc comments for API documentation
- Handle errors properly
- Validate input data

## Monitoring and Logging

### 1. Application Logs

The application logs to console by default. For production, consider:

- **Winston**: Structured logging
- **Morgan**: HTTP request logging
- **Sentry**: Error tracking

### 2. Health Checks

Add a health check endpoint:

```javascript
// In app.js
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});
```

### 3. Performance Monitoring

- **Response time monitoring**
- **Database query optimization**
- **Memory usage tracking**
- **Error rate monitoring**

## Support and Resources

### Documentation
- **API Documentation**: `http://localhost:8080/api-docs`
- **Database Schema**: `docs/DATABASE_SCHEMA.md`
- **Code Documentation**: `docs/CODE_DOCUMENTATION.md`
- **Postman Collection**: `docs/POSTMAN_COLLECTION.md`

### Useful Commands

```bash
# Development
npm run dev          # Start with nodemon
npm start           # Start production server

# Database
mongo               # Connect to MongoDB shell
mongosh             # Connect to MongoDB shell (newer version)

# Testing
curl                # Test API endpoints
newman              # Run Postman collection tests
```

### Getting Help

1. **Check the logs** for error messages
2. **Verify environment variables** are set correctly
3. **Test database connection** manually
4. **Check API documentation** for endpoint details
5. **Review troubleshooting section** above

This setup guide provides everything needed to get the Task Management API running locally and in production.
