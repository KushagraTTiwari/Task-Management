# Code Documentation

## Overview

The Task Management API is built using Node.js, Express.js, and MongoDB with Mongoose ODM. The codebase follows a modular architecture with clear separation of concerns, comprehensive error handling, and security best practices.

## Architecture Overview

### Technology Stack
- **Runtime**: Node.js (ES6+ modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **API Documentation**: Swagger/OpenAPI
- **CORS**: Cross-origin resource sharing enabled

### Project Structure
```
Task-Management/
├── package.json              # Dependencies and scripts
├── README.md                # Project overview and setup
├── .env                     # Environment variables
└── src/
    ├── app.js               # Application entry point
    ├── config/              # Configuration files
    │   ├── config.js        # Environment variables
    │   ├── db.js            # Database connection
    │   └── swagger.js       # Swagger documentation
    ├── constant/            # Application constants
    │   └── enum.js          # Status enums and constants
    ├── controllers/         # Business logic handlers
    │   ├── auth.controller.js
    │   └── task.controller.js
    ├── models/              # Database models
    │   ├── user.js
    │   ├── task.js
    │   └── subTask.js
    ├── routes/              # Route definitions
    │   ├── auth.routes.js
    │   └── task.routes.js
    └── util/                # Utility functions
        ├── authUtil.js      # JWT authentication
        └── utilHelper.js    # Password hashing
```

## Core Components

### 1. Application Entry Point (`src/app.js`)

**Purpose**: Main application setup and configuration

**Key Features**:
- Express server initialization
- Middleware configuration (CORS, JSON parsing)
- Database connection
- Route registration
- Swagger documentation setup

**Code Structure**:
```javascript
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import connectDB from './config/db.js';
import configVariables from './config/config.js';
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';

// Database connection
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
```

**Design Decisions**:
- **ES6 Modules**: Using import/export for better tree-shaking and modern JavaScript features
- **CORS Enabled**: Allows cross-origin requests for frontend integration
- **Swagger Integration**: Interactive API documentation accessible at `/api-docs`
- **Modular Routes**: Separate route files for different domains (auth, tasks)

### 2. Configuration Management (`src/config/`)

#### Configuration Variables (`config.js`)
**Purpose**: Centralized environment variable management

**Key Features**:
- Environment variable loading with dotenv
- Default values for development
- Type conversion for numeric values

**Code Structure**:
```javascript
import dotenv from "dotenv";
dotenv.config();

const configVariables = {
  mongoURL: process.env.MONGO_URL || "",
  PORT: Number(process.env.PORT) || 8080,
  JWT_SECRET: process.env.JWT_SECRET || "t@a#sK_m@n@g3m3nt",
};
```

**Design Decisions**:
- **Default Values**: Sensible defaults for development environment
- **Type Safety**: Explicit type conversion for numeric values
- **Security**: JWT secret with fallback for development

#### Database Connection (`db.js`)
**Purpose**: MongoDB connection management

**Key Features**:
- Async connection handling
- Error handling with process exit
- Connection status logging

**Code Structure**:
```javascript
import mongoose from 'mongoose';
import configVariables from './config.js';

const connectDB = async () => {
  try {
    await mongoose.connect(configVariables.mongoURL);
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
```

**Design Decisions**:
- **Graceful Failure**: Process exit on connection failure
- **Async/Await**: Modern JavaScript for better error handling
- **Logging**: Clear connection status feedback

#### Swagger Configuration (`swagger.js`)
**Purpose**: API documentation setup

**Key Features**:
- OpenAPI 3.0 specification
- JWT authentication scheme
- Automatic route discovery

**Code Structure**:
```javascript
import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'API for managing users, tasks, and subtasks with authentication',
    },
    servers: [
      {
        url: 'http://localhost:8080/',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['src/routes/*.js', 'src/controllers/*.js'],
};
```

**Design Decisions**:
- **OpenAPI 3.0**: Modern API specification standard
- **JWT Security**: Bearer token authentication scheme
- **Auto-discovery**: Automatic route documentation from JSDoc comments

### 3. Constants and Enums (`src/constant/enum.js`)

**Purpose**: Centralized application constants

**Key Features**:
- Status enums for tasks and subtasks
- Collection name constants
- Reusable string constants

**Code Structure**:
```javascript
export const USER = "user";
export const TASK = "task";
export const SUBTASK = "subTask";
export const COMPLETED = "completed";
export const IN_PROGRESS = "in-progress";
export const PENDING = "pending";
```

**Design Decisions**:
- **Consistency**: Centralized constants prevent typos
- **Maintainability**: Single source of truth for status values
- **Type Safety**: Constants provide better IDE support

### 4. Data Models (`src/models/`)

#### User Model (`user.js`)
**Purpose**: User account and authentication data

**Key Features**:
- Email uniqueness constraint
- Password field for hashed passwords
- Task references array
- Soft delete functionality
- Automatic timestamps

**Code Structure**:
```javascript
import mongoose from "mongoose";
import { TASK } from "../constant/enum.js";

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: TASK
        }
    ],
    is_deleted: {
        type: Boolean,
        default: false,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});
```

**Design Decisions**:
- **Soft Delete**: `is_deleted` flag preserves data integrity
- **References**: Task array maintains user-task relationships
- **Timestamps**: Automatic creation and update tracking
- **Validation**: Required fields and unique constraints

#### Task Model (`task.js`)
**Purpose**: Main task data with status and deadlines

**Key Features**:
- Status enum validation
- User reference (createdBy)
- Subtask references array
- Deadline validation
- Soft delete functionality

**Code Structure**:
```javascript
import mongoose from "mongoose";
import { COMPLETED, IN_PROGRESS, PENDING, SUBTASK, USER } from "../constant/enum.js";

const taskSchema = new Schema({
    subject: {
        type: String,
        required: true,
    },
    deadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: [PENDING, IN_PROGRESS, COMPLETED],
        default: PENDING
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER,
        required: true
    },
    subtasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: SUBTASK,
        }
    ],
    is_deleted: {
        type: Boolean,
        default: false,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});
```

**Design Decisions**:
- **Status Enum**: Predefined status values prevent invalid states
- **User Reference**: `createdBy` maintains ownership
- **Subtask References**: Array maintains task-subtask relationships
- **Default Status**: New tasks start as 'pending'

#### Subtask Model (`subTask.js`)
**Purpose**: Subtask data with parent task reference

**Key Features**:
- Parent task reference
- Status enum validation
- Deadline validation
- Soft delete functionality

**Code Structure**:
```javascript
import mongoose from "mongoose";
import { COMPLETED, IN_PROGRESS, PENDING, TASK } from "../constant/enum.js";

const subTaskSchema = new Schema({
    subject: {
        type: String,
        required: true,
    },
    deadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: [PENDING, IN_PROGRESS, COMPLETED],
        default: PENDING
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: TASK,
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});
```

**Design Decisions**:
- **Parent Reference**: `taskId` maintains subtask-task relationship
- **Consistent Structure**: Same fields as tasks for consistency
- **Validation**: Required fields and enum constraints

### 5. Controllers (`src/controllers/`)

#### Authentication Controller (`auth.controller.js`)
**Purpose**: User registration and login logic

**Key Features**:
- User registration with password hashing
- Login with password verification
- JWT token generation
- Input validation
- Swagger documentation

**Code Structure**:
```javascript
import User from '../models/user.js';
import { generateHashPassword, validHashPassword } from '../util/utilHelper.js';
import { generateToken } from '../util/authUtil.js';

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required fields.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: generateHashPassword(password),
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id, user.email),
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
```

**Design Decisions**:
- **Input Validation**: Comprehensive field validation
- **Password Security**: bcrypt hashing for password storage
- **JWT Tokens**: Stateless authentication
- **Error Handling**: Proper HTTP status codes
- **Swagger Integration**: Embedded API documentation

#### Task Controller (`task.controller.js`)
**Purpose**: Task and subtask management logic

**Key Features**:
- CRUD operations for tasks
- Subtask management
- Input validation
- Business logic validation
- Soft delete functionality
- Comprehensive error handling

**Code Structure**:
```javascript
import Task from '../models/task.js';
import SubTask from '../models/subTask.js';
import { COMPLETED, IN_PROGRESS, PENDING } from '../constant/enum.js';

const validStatuses = [PENDING, IN_PROGRESS, COMPLETED];

const isValidFutureDate = (dateString) => {
  const inputDate = new Date(dateString);
  const currentDate = new Date();
  return inputDate > currentDate;
};

export const getTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(400).json({ message: 'unauthorised - userId is a required field.' });
    }

    const tasks = await Task.find({
      createdBy: userId,
      is_deleted: false
    }).populate({
      path: 'subtasks',
      match: { is_deleted: false },
    }).lean();

    return res.status(200).json(tasks);
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
};
```

**Design Decisions**:
- **User Isolation**: Users can only access their own tasks
- **Soft Delete**: `is_deleted: false` filter in queries
- **Population**: Automatic subtask loading with filtering
- **Validation**: Date and status validation functions
- **Error Handling**: Comprehensive try-catch blocks

### 6. Routes (`src/routes/`)

#### Authentication Routes (`auth.routes.js`)
**Purpose**: Authentication endpoint definitions

**Code Structure**:
```javascript
import express from 'express';
import { loginUser, registerUser } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
```

**Design Decisions**:
- **Modular Routes**: Separate router for authentication
- **Clean URLs**: RESTful endpoint design
- **Controller Separation**: Routes only handle URL mapping

#### Task Routes (`task.routes.js`)
**Purpose**: Task and subtask endpoint definitions

**Code Structure**:
```javascript
import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getSubtasks,
  updateSubtasks,
  createSubTask
} from '../controllers/task.controller.js';
import { authenticateToken } from '../util/authUtil.js';

const router = express.Router();

router.get('/', authenticateToken, getTasks);
router.post('/', authenticateToken, createTask);
router.put('/:taskId', authenticateToken, updateTask);
router.delete('/:taskId', authenticateToken, deleteTask);
router.get('/:taskId/subtasks', authenticateToken, getSubtasks);
router.post('/:taskId/subtasks', authenticateToken, createSubTask);
router.put('/:taskId/subtasks', authenticateToken, updateSubtasks);

export default router;
```

**Design Decisions**:
- **Authentication Middleware**: JWT validation on protected routes
- **RESTful Design**: Standard HTTP methods for CRUD operations
- **Nested Resources**: Subtasks as nested under tasks
- **Parameter Validation**: URL parameters for resource identification

### 7. Utilities (`src/util/`)

#### Authentication Utilities (`authUtil.js`)
**Purpose**: JWT token generation and validation

**Key Features**:
- Token generation with user data
- Token validation middleware
- Error handling for invalid tokens

**Code Structure**:
```javascript
import jwt from "jsonwebtoken";
import configVariables from "../config/config.js";

export function generateToken(userId, email) {
  const payload = { userId, email };
  const secret = configVariables.JWT_SECRET;
  return jwt.sign(payload, secret);
}

export function authenticateToken(req, res, next) {
  let token = req.headers.authorization;
  if (token) {
    token = token.split(" ")[1];
    jwt.verify(token, configVariables.JWT_SECRET, (err, payload) => {
      if (err) {
        res.status(403).json({
          message: "Unauthorized ",
        });
      } else {
        req.user = payload;
        next();
      }
    });
  } else {
    res.status(403).json({
      message: "Unauthorized Accessss",
    });
  }
}
```

**Design Decisions**:
- **Stateless Authentication**: JWT tokens for scalability
- **Middleware Pattern**: Reusable authentication middleware
- **Error Handling**: Proper HTTP status codes for auth failures
- **Payload Structure**: User ID and email in token payload

#### Utility Helpers (`utilHelper.js`)
**Purpose**: Password hashing and validation

**Key Features**:
- Password hashing with bcrypt
- Password verification
- Salt rounds configuration

**Code Structure**:
```javascript
import bcrypt from "bcrypt";

export function generateHashPassword(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}
 
export function validHashPassword(password, user_password) {
  const isPasswordValid = bcrypt.compareSync(password, user_password);
  return isPasswordValid;
}
```

**Design Decisions**:
- **bcrypt Library**: Industry-standard password hashing
- **Salt Rounds**: 8 rounds for security-performance balance
- **Synchronous Functions**: Simple API for password operations
- **Verification**: Secure password comparison

## Security Features

### 1. Authentication & Authorization
- **JWT Tokens**: Stateless authentication with secure tokens
- **Password Hashing**: bcrypt with salt rounds for password security
- **User Isolation**: Users can only access their own data
- **Token Validation**: Middleware validates all protected routes

### 2. Input Validation
- **Field Validation**: Required field checking
- **Data Type Validation**: Proper data type enforcement
- **Business Rule Validation**: Date and status validation
- **SQL Injection Prevention**: Mongoose ODM prevents injection

### 3. Data Protection
- **Soft Delete**: Data integrity preservation
- **Error Handling**: Secure error messages
- **CORS Configuration**: Controlled cross-origin access

## Error Handling Strategy

### 1. HTTP Status Codes
- **200**: Successful operations
- **201**: Resource creation
- **400**: Bad request (validation errors)
- **401**: Unauthorized (invalid credentials)
- **403**: Forbidden (invalid token)
- **404**: Not found (resource doesn't exist)
- **500**: Internal server error

### 2. Error Response Format
```javascript
{
  "message": "Error description"
}
```

### 3. Validation Error Handling
- **Field Validation**: Clear error messages for missing fields
- **Business Rule Validation**: Specific error messages for business logic
- **Database Errors**: Graceful handling of database constraints

## Performance Considerations

### 1. Database Optimization
- **Indexing**: Proper indexes on frequently queried fields
- **Population**: Efficient loading of related data
- **Query Filtering**: Soft delete filtering in queries
- **Lean Queries**: Using `.lean()` for read-only operations

### 2. Memory Management
- **Async/Await**: Non-blocking operations
- **Error Boundaries**: Proper error handling prevents memory leaks
- **Connection Pooling**: Mongoose handles connection pooling

### 3. Scalability
- **Stateless Design**: JWT authentication enables horizontal scaling
- **Modular Architecture**: Easy to add new features
- **Database Agnostic**: Mongoose abstraction allows database changes

## Testing Strategy

### 1. Unit Testing
- **Controller Testing**: Test business logic in isolation
- **Utility Testing**: Test helper functions
- **Model Testing**: Test data validation

### 2. Integration Testing
- **API Testing**: Test complete request-response cycles
- **Database Testing**: Test database operations
- **Authentication Testing**: Test JWT token flow

### 3. Manual Testing
- **Swagger UI**: Interactive API testing
- **Postman Collections**: Predefined test scenarios
- **cURL Examples**: Command-line testing

## Deployment Considerations

### 1. Environment Configuration
- **Environment Variables**: Secure configuration management
- **Database Connection**: Production database configuration
- **JWT Secret**: Secure secret management

### 2. Security Hardening
- **HTTPS**: SSL/TLS encryption
- **Rate Limiting**: API abuse prevention
- **Input Sanitization**: XSS prevention
- **CORS Configuration**: Proper origin restrictions

### 3. Monitoring
- **Logging**: Application and error logging
- **Health Checks**: Application health monitoring
- **Performance Monitoring**: Response time tracking

## Future Enhancements

### 1. Planned Features
- **Pagination**: For large datasets
- **Search Functionality**: Task and subtask search
- **File Attachments**: Task file uploads
- **Email Notifications**: Deadline reminders
- **Real-time Updates**: WebSocket integration

### 2. Technical Improvements
- **Rate Limiting**: API abuse prevention
- **Caching**: Redis integration for performance
- **Logging**: Structured logging with Winston
- **Testing**: Comprehensive test suite
- **CI/CD**: Automated deployment pipeline

This comprehensive code documentation provides developers with a complete understanding of the codebase architecture, design decisions, and implementation details.
