# Task Management API

A comprehensive RESTful API for managing tasks and subtasks with user authentication, built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Task Management**: Create, read, update, and delete tasks
- **Subtask Management**: Organize tasks with subtasks and deadlines
- **Status Tracking**: Track task progress (pending, in-progress, completed)
- **Soft Delete**: Preserve data integrity with soft deletion
- **API Documentation**: Interactive Postman documentation
- **Data Validation**: Comprehensive input validation and error handling

## 🗄️ Database Schema

**ER Diagram:** https://drive.google.com/file/d/1Ya3HDapeZpZtuXahCKAXLZwAtXxPC_7y/view?usp=sharing

### Collections Overview

The application uses MongoDB with three main collections:

1. **users** - User accounts and authentication
2. **tasks** - Main tasks with deadlines and status
3. **subtasks** - Subtasks associated with parent tasks

### Collection Details

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  tasks: [ObjectId] (references to tasks),
  is_deleted: Boolean (default: false),
  created_at: Date (default: Date.now),
  updated_at: Date (default: Date.now)
}
```

#### Tasks Collection
```javascript
{
  _id: ObjectId,
  subject: String (required),
  deadline: Date (required),
  status: String (enum: ['pending', 'in-progress', 'completed'], default: 'pending'),
  createdBy: ObjectId (required, references users),
  subtasks: [ObjectId] (references to subtasks),
  is_deleted: Boolean (default: false),
  created_at: Date (default: Date.now),
  updated_at: Date (default: Date.now)
}
```

#### Subtasks Collection
```javascript
{
  _id: ObjectId,
  subject: String (required),
  deadline: Date (required),
  status: String (enum: ['pending', 'in-progress', 'completed'], default: 'pending'),
  taskId: ObjectId (required, references tasks),
  is_deleted: Boolean (default: false),
  created_at: Date (default: Date.now),
  updated_at: Date (default: Date.now)
}
```

### Relationships

- **User → Tasks**: One-to-Many (a user can have multiple tasks)
- **Task → Subtasks**: One-to-Many (a task can have multiple subtasks)
- **User → Subtasks**: Indirect relationship through tasks

## 📚 API Documentation

### Base URL
```
http://localhost:8080
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login user | No |

#### Task Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get all user's tasks | Yes |
| POST | `/api/tasks` | Create a new task | Yes |
| PUT | `/api/tasks/:taskId` | Update a task | Yes |
| DELETE | `/api/tasks/:taskId` | Delete a task | Yes |

#### Subtask Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks/:taskId/subtasks` | Get subtasks for a task | Yes |
| POST | `/api/tasks/:taskId/subtasks` | Create a new subtask | Yes |
| PUT | `/api/tasks/:taskId/subtasks` | Update all subtasks for a task | Yes |

### Interactive API Documentation

Access the interactive Postman documentation at:
```
https://documenter.getpostman.com/view/29703371/2sB3BDLXLt
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URL=mongodb://localhost:27017/task-management
PORT=8080
JWT_SECRET=your-secret-key-here
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/KushagraTTiwari/Task-Management.git
   cd Task-Management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:8080`

## 📁 Project Structure

```
Task-Management/
├── package.json
├── README.md
├── .env
└── src/
    ├── app.js                 # Main application entry point
    ├── config/
    │   ├── config.js          # Environment configuration
    │   ├── db.js              # Database connection
    ├── constant/
    │   └── enum.js            # Application constants
    ├── controllers/
    │   ├── auth.controller.js # Authentication logic
    │   └── task.controller.js # Task and subtask logic
    ├── models/
    │   ├── user.js            # User model
    │   ├── task.js            # Task model
    │   └── subTask.js         # Subtask model
    ├── routes/
    │   ├── auth.routes.js     # Authentication routes
    │   └── task.routes.js     # Task routes
    └── util/
        ├── authUtil.js        # JWT authentication utilities
        └── utilHelper.js      # Password hashing utilities
```

## 📖 Code Documentation

### Key Components

#### 1. Authentication System
- **JWT-based authentication** with secure token generation
- **Password hashing** using bcrypt with salt rounds
- **Middleware protection** for secure endpoints

#### 2. Data Models
- **Mongoose schemas** with proper validation
- **Soft delete functionality** to preserve data integrity
- **Automatic timestamps** for created_at and updated_at
- **Reference relationships** between collections

#### 3. API Controllers
- **Comprehensive error handling** with appropriate HTTP status codes
- **Input validation** for all endpoints
- **Business logic separation** from route definitions

#### 4. Security Features
- **CORS enabled** for cross-origin requests
- **JWT token validation** on protected routes
- **Password hashing** with bcrypt
- **Input sanitization** and validation

### Design Decisions

1. **Soft Delete**: Instead of hard deletion, records are marked as deleted to maintain data integrity and enable potential recovery.

2. **JWT Authentication**: Stateless authentication using JWT tokens for scalability and performance.

3. **MongoDB with Mongoose**: Chosen for flexibility in schema evolution and rich querying capabilities.

4. **Modular Architecture**: Separation of concerns with controllers, routes, models, and utilities in distinct modules.

5. **Comprehensive Validation**: Input validation at multiple levels (controller, model, and utility functions).

## 💡 Usage Examples

### Register a New User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "kushagra",
    "email": "kushagra@example.com",
    "password": "password123"
  }'
```

### Login User
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kushagra@example.com",
    "password": "password123"
  }'
```

### Create a Task
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "subject": "Complete project documentation",
    "deadline": "2024-01-15",
    "status": "pending"
  }'
```

### Get All Tasks
```bash
curl -X GET http://localhost:8080/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create a Subtask
```bash
curl -X POST http://localhost:8080/api/tasks/TASK_ID/subtasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "subject": "Research phase",
    "deadline": "2024-01-10",
    "status": "pending"
  }'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Kushagra Tiwari**
- GitHub: [@KushagraTTiwari](https://github.com/KushagraTTiwari)
- Repository: [Task-Management](https://github.com/KushagraTTiwari/Task-Management)
- Deployed Link: [Link](https://task-management-sigma-ochre-57.vercel.app/)

## 🐛 Issues

If you find any bugs or have feature requests, please create an issue in the [GitHub repository](https://github.com/KushagraTTiwari/Task-Management/issues).
