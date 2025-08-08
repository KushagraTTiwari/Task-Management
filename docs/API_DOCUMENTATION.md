# API Documentation

## Overview

The Task Management API provides a comprehensive RESTful interface for managing users, tasks, and subtasks. The API uses JWT authentication for secure access and follows REST conventions.

## Base Information

- **Base URL**: `http://localhost:8080`
- **Content-Type**: `application/json`
- **Authentication**: JWT Bearer Token
- **API Version**: v1.0.0

## Authentication

### JWT Token Format
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Token Structure
```javascript
{
  "userId": "user_object_id",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## API Endpoints

### Authentication Endpoints

#### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Description:** Creates a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Request Validation:**
- `name`: Required string, minimum 1 character
- `email`: Required string, valid email format, must be unique
- `password`: Required string, minimum 6 characters

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (400 Bad Request):**
```json
{
  "message": "name, email and password are required fields."
}
```

**Response (400 Bad Request - User Exists):**
```json
{
  "message": "User already exists"
}
```

#### 2. Login User

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Request Validation:**
- `email`: Required string, valid email format
- `password`: Required string

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (404 Not Found):**
```json
{
  "message": "User does not exists"
}
```

**Response (401 Unauthorized):**
```json
{
  "message": "Invalid credentials"
}
```

### Task Endpoints

#### 1. Get All Tasks

**Endpoint:** `GET /api/tasks`

**Description:** Retrieves all tasks for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- None

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "subject": "Complete project documentation",
    "deadline": "2024-01-15T00:00:00.000Z",
    "status": "pending",
    "createdBy": "507f1f77bcf86cd799439011",
    "subtasks": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "subject": "Research phase",
        "deadline": "2024-01-10T00:00:00.000Z",
        "status": "completed",
        "taskId": "507f1f77bcf86cd799439012"
      }
    ],
    "is_deleted": false,
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z"
  }
]
```

**Response (401 Unauthorized):**
```json
{
  "message": "Unauthorized"
}
```

#### 2. Create Task

**Endpoint:** `POST /api/tasks`

**Description:** Creates a new task for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "subject": "Complete project documentation",
  "deadline": "2024-01-15",
  "status": "pending"
}
```

**Request Validation:**
- `subject`: Required string, minimum 1 character
- `deadline`: Required string, valid date format, must be future date
- `status`: Optional string, must be one of: `pending`, `in-progress`, `completed`

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "subject": "Complete project documentation",
  "deadline": "2024-01-15T00:00:00.000Z",
  "status": "pending",
  "createdBy": "507f1f77bcf86cd799439011",
  "subtasks": [],
  "is_deleted": false,
  "created_at": "2024-01-01T10:00:00.000Z",
  "updated_at": "2024-01-01T10:00:00.000Z"
}
```

**Response (400 Bad Request):**
```json
{
  "message": "subject, deadline, and status are required fields."
}
```

**Response (400 Bad Request - Invalid Date):**
```json
{
  "message": "Deadline must be a future date"
}
```

**Response (400 Bad Request - Invalid Status):**
```json
{
  "message": "status must be one of pending, in-progress or completed.",
  "validStatuses": ["pending", "in-progress", "completed"]
}
```

#### 3. Update Task

**Endpoint:** `PUT /api/tasks/:taskId`

**Description:** Updates an existing task.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Path Parameters:**
- `taskId`: Required string, valid ObjectId

**Request Body:**
```json
{
  "subject": "Updated project documentation",
  "deadline": "2024-01-20",
  "status": "in-progress"
}
```

**Request Validation:**
- All fields are optional
- `deadline`: If provided, must be valid date format and future date
- `status`: If provided, must be one of: `pending`, `in-progress`, `completed`

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "subject": "Updated project documentation",
  "deadline": "2024-01-20T00:00:00.000Z",
  "status": "in-progress",
  "createdBy": "507f1f77bcf86cd799439011",
  "subtasks": [],
  "is_deleted": false,
  "created_at": "2024-01-01T10:00:00.000Z",
  "updated_at": "2024-01-01T11:00:00.000Z"
}
```

**Response (404 Not Found):**
```json
{
  "message": "Task not found"
}
```

#### 4. Delete Task

**Endpoint:** `DELETE /api/tasks/:taskId`

**Description:** Soft deletes a task and all its subtasks.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `taskId`: Required string, valid ObjectId

**Response (200 OK):**
```json
{
  "message": "Task deleted successfully"
}
```

**Response (404 Not Found):**
```json
{
  "message": "Task not found"
}
```

### Subtask Endpoints

#### 1. Get Subtasks

**Endpoint:** `GET /api/tasks/:taskId/subtasks`

**Description:** Retrieves all subtasks for a specific task.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `taskId`: Required string, valid ObjectId

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "subject": "Research phase",
    "deadline": "2024-01-10T00:00:00.000Z",
    "status": "completed",
    "taskId": "507f1f77bcf86cd799439012",
    "is_deleted": false,
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z"
  }
]
```

**Response (404 Not Found):**
```json
{
  "message": "Task not found"
}
```

#### 2. Create Subtask

**Endpoint:** `POST /api/tasks/:taskId/subtasks`

**Description:** Creates a new subtask for a specific task.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Path Parameters:**
- `taskId`: Required string, valid ObjectId

**Request Body:**
```json
{
  "subject": "Research phase",
  "deadline": "2024-01-10",
  "status": "pending"
}
```

**Request Validation:**
- `subject`: Required string, minimum 1 character
- `deadline`: Required string, valid date format, must be future date
- `status`: Optional string, must be one of: `pending`, `in-progress`, `completed`

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "subject": "Research phase",
  "deadline": "2024-01-10T00:00:00.000Z",
  "status": "pending",
  "taskId": "507f1f77bcf86cd799439012",
  "is_deleted": false,
  "created_at": "2024-01-01T10:00:00.000Z",
  "updated_at": "2024-01-01T10:00:00.000Z"
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Subject and deadline are required fields"
}
```

**Response (404 Not Found):**
```json
{
  "message": "Task not found"
}
```

#### 3. Update Subtasks

**Endpoint:** `PUT /api/tasks/:taskId/subtasks`

**Description:** Replaces all subtasks for a specific task.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Path Parameters:**
- `taskId`: Required string, valid ObjectId

**Request Body:**
```json
{
  "subtasks": [
    {
      "subject": "Research phase",
      "deadline": "2024-01-10",
      "status": "completed"
    },
    {
      "subject": "Write documentation",
      "deadline": "2024-01-15",
      "status": "pending"
    }
  ]
}
```

**Request Validation:**
- `subtasks`: Required array of subtask objects
- Each subtask must have `subject` and `deadline`
- `deadline`: Must be valid date format and future date
- `status`: Optional, must be one of: `pending`, `in-progress`, `completed`

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "subject": "Research phase",
    "deadline": "2024-01-10T00:00:00.000Z",
    "status": "completed",
    "taskId": "507f1f77bcf86cd799439012",
    "is_deleted": false,
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439014",
    "subject": "Write documentation",
    "deadline": "2024-01-15T00:00:00.000Z",
    "status": "pending",
    "taskId": "507f1f77bcf86cd799439012",
    "is_deleted": false,
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z"
  }
]
```

**Response (400 Bad Request):**
```json
{
  "message": "subtasks must be an array"
}
```

**Response (404 Not Found):**
```json
{
  "message": "Task not found"
}
```

## Error Responses

### Common Error Codes

| Status Code | Description | Example Response |
|-------------|-------------|------------------|
| 200 | Success | Data returned |
| 201 | Created | New resource created |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Invalid or missing token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

### Error Response Format
```json
{
  "message": "Error description"
}
```

## Data Models

### User Model
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String",
  "password": "String (hashed)",
  "tasks": ["ObjectId"],
  "is_deleted": "Boolean",
  "created_at": "Date",
  "updated_at": "Date"
}
```

### Task Model
```json
{
  "_id": "ObjectId",
  "subject": "String",
  "deadline": "Date",
  "status": "String (enum)",
  "createdBy": "ObjectId",
  "subtasks": ["ObjectId"],
  "is_deleted": "Boolean",
  "created_at": "Date",
  "updated_at": "Date"
}
```

### Subtask Model
```json
{
  "_id": "ObjectId",
  "subject": "String",
  "deadline": "Date",
  "status": "String (enum)",
  "taskId": "ObjectId",
  "is_deleted": "Boolean",
  "created_at": "Date",
  "updated_at": "Date"
}
```

## Usage Examples

### Complete Workflow Example

#### 1. Register a User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### 2. Login and Get Token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### 3. Create a Task
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

#### 4. Get All Tasks
```bash
curl -X GET http://localhost:8080/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 5. Create Subtasks
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

#### 6. Update Task Status
```bash
curl -X PUT http://localhost:8080/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "in-progress"
  }'
```

## Rate Limiting

Currently, the API does not implement rate limiting. For production use, consider implementing rate limiting to prevent abuse.

## Pagination

Currently, the API does not implement pagination. For large datasets, consider implementing pagination with `limit` and `offset` parameters.

## CORS

The API supports CORS for cross-origin requests. The following origins are allowed:
- `http://localhost:3000` (development)
- `https://yourdomain.com` (production)

## Interactive Documentation

Access the interactive Swagger documentation at:
```
http://localhost:8080/api-docs
```

This provides a user-friendly interface to explore and test all API endpoints.

## SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080';

class TaskManagementAPI {
  constructor(token) {
    this.token = token;
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getTasks() {
    const response = await this.client.get('/api/tasks');
    return response.data;
  }

  async createTask(taskData) {
    const response = await this.client.post('/api/tasks', taskData);
    return response.data;
  }

  async updateTask(taskId, taskData) {
    const response = await this.client.put(`/api/tasks/${taskId}`, taskData);
    return response.data;
  }

  async deleteTask(taskId) {
    const response = await this.client.delete(`/api/tasks/${taskId}`);
    return response.data;
  }
}

// Usage
const api = new TaskManagementAPI('your-jwt-token');
const tasks = await api.getTasks();
```

### Python
```python
import requests

class TaskManagementAPI:
    def __init__(self, token):
        self.base_url = 'http://localhost:8080'
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def get_tasks(self):
        response = requests.get(f'{self.base_url}/api/tasks', headers=self.headers)
        return response.json()
    
    def create_task(self, task_data):
        response = requests.post(f'{self.base_url}/api/tasks', 
                               json=task_data, headers=self.headers)
        return response.json()
    
    def update_task(self, task_id, task_data):
        response = requests.put(f'{self.base_url}/api/tasks/{task_id}', 
                              json=task_data, headers=self.headers)
        return response.json()

# Usage
api = TaskManagementAPI('your-jwt-token')
tasks = api.get_tasks()
```

This comprehensive API documentation provides all the information needed to integrate with the Task Management API effectively.
