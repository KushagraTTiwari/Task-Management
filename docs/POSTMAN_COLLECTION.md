# Postman Collection Documentation

## Overview

This document provides a comprehensive Postman collection for testing the Task Management API. The collection includes all endpoints with proper authentication, request examples, and testing scenarios.

## Collection Setup

### Environment Variables

Create a Postman environment with the following variables:

| Variable Name | Initial Value | Current Value | Description |
|---------------|---------------|---------------|-------------|
| `base_url` | `http://localhost:8080` | `http://localhost:8080` | API base URL |
| `jwt_token` | `` | `` | JWT authentication token |
| `user_id` | `` | `` | User ID for testing |
| `task_id` | `` | `` | Task ID for testing |
| `subtask_id` | `` | `` | Subtask ID for testing |

### Collection Structure

```
Task Management API
├── Authentication
│   ├── Register User
│   └── Login User
├── Tasks
│   ├── Get All Tasks
│   ├── Create Task
│   ├── Update Task
│   └── Delete Task
└── Subtasks
    ├── Get Subtasks
    ├── Create Subtask
    └── Update Subtasks
```

## Authentication Endpoints

### 1. Register User

**Request Details:**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/auth/register`
- **Headers**: 
  - `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response Handling:**
```javascript
// Tests tab
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has required fields", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('_id');
    pm.expect(response).to.have.property('name');
    pm.expect(response).to.have.property('email');
    pm.expect(response).to.have.property('token');
});

pm.test("Token is not empty", function () {
    const response = pm.response.json();
    pm.expect(response.token).to.not.be.empty;
});

// Set environment variables
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("jwt_token", response.token);
    pm.environment.set("user_id", response._id);
}
```

**Error Scenarios:**
- **400 Bad Request**: Missing required fields
- **400 Bad Request**: User already exists

### 2. Login User

**Request Details:**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/auth/login`
- **Headers**: 
  - `Content-Type: application/json`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response Handling:**
```javascript
// Tests tab
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has required fields", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('_id');
    pm.expect(response).to.have.property('name');
    pm.expect(response).to.have.property('email');
    pm.expect(response).to.have.property('token');
});

// Set environment variables
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("jwt_token", response.token);
    pm.environment.set("user_id", response._id);
}
```

**Error Scenarios:**
- **404 Not Found**: User does not exist
- **401 Unauthorized**: Invalid credentials

## Task Endpoints

### 1. Get All Tasks

**Request Details:**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/tasks`
- **Headers**: 
  - `Authorization: Bearer {{jwt_token}}`

**Response Handling:**
```javascript
// Tests tab
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is an array", function () {
    const response = pm.response.json();
    pm.expect(response).to.be.an('array');
});

pm.test("Tasks have required fields", function () {
    const response = pm.response.json();
    if (response.length > 0) {
        const task = response[0];
        pm.expect(task).to.have.property('_id');
        pm.expect(task).to.have.property('subject');
        pm.expect(task).to.have.property('deadline');
        pm.expect(task).to.have.property('status');
        pm.expect(task).to.have.property('createdBy');
    }
});

// Set task_id for testing if tasks exist
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.length > 0) {
        pm.environment.set("task_id", response[0]._id);
    }
}
```

**Error Scenarios:**
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Invalid token format

### 2. Create Task

**Request Details:**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/tasks`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{jwt_token}}`

**Request Body:**
```json
{
  "subject": "Complete project documentation",
  "deadline": "2024-01-15",
  "status": "pending"
}
```

**Response Handling:**
```javascript
// Tests tab
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Task created successfully", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('_id');
    pm.expect(response.subject).to.eql("Complete project documentation");
    pm.expect(response.status).to.eql("pending");
    pm.expect(response.createdBy).to.eql(pm.environment.get("user_id"));
});

// Set task_id for further testing
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("task_id", response._id);
}
```

**Error Scenarios:**
- **400 Bad Request**: Missing required fields
- **400 Bad Request**: Invalid deadline (past date)
- **400 Bad Request**: Invalid status
- **401 Unauthorized**: Invalid or missing token

### 3. Update Task

**Request Details:**
- **Method**: `PUT`
- **URL**: `{{base_url}}/api/tasks/{{task_id}}`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{jwt_token}}`

**Request Body:**
```json
{
  "subject": "Updated project documentation",
  "deadline": "2024-01-20",
  "status": "in-progress"
}
```

**Response Handling:**
```javascript
// Tests tab
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Task updated successfully", function () {
    const response = pm.response.json();
    pm.expect(response.subject).to.eql("Updated project documentation");
    pm.expect(response.status).to.eql("in-progress");
    pm.expect(response._id).to.eql(pm.environment.get("task_id"));
});
```

**Error Scenarios:**
- **400 Bad Request**: Invalid deadline or status
- **404 Not Found**: Task not found
- **401 Unauthorized**: Invalid or missing token

### 4. Delete Task

**Request Details:**
- **Method**: `DELETE`
- **URL**: `{{base_url}}/api/tasks/{{task_id}}`
- **Headers**: 
  - `Authorization: Bearer {{jwt_token}}`

**Response Handling:**
```javascript
// Tests tab
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Task deleted successfully", function () {
    const response = pm.response.json();
    pm.expect(response.message).to.eql("Task deleted successfully");
});
```

**Error Scenarios:**
- **404 Not Found**: Task not found
- **401 Unauthorized**: Invalid or missing token

## Subtask Endpoints

### 1. Get Subtasks

**Request Details:**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/tasks/{{task_id}}/subtasks`
- **Headers**: 
  - `Authorization: Bearer {{jwt_token}}`

**Response Handling:**
```javascript
// Tests tab
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is an array", function () {
    const response = pm.response.json();
    pm.expect(response).to.be.an('array');
});

pm.test("Subtasks have required fields", function () {
    const response = pm.response.json();
    if (response.length > 0) {
        const subtask = response[0];
        pm.expect(subtask).to.have.property('_id');
        pm.expect(subtask).to.have.property('subject');
        pm.expect(subtask).to.have.property('deadline');
        pm.expect(subtask).to.have.property('status');
        pm.expect(subtask).to.have.property('taskId');
    }
});
```

**Error Scenarios:**
- **404 Not Found**: Task not found
- **401 Unauthorized**: Invalid or missing token

### 2. Create Subtask

**Request Details:**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/tasks/{{task_id}}/subtasks`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{jwt_token}}`

**Request Body:**
```json
{
  "subject": "Research phase",
  "deadline": "2024-01-10",
  "status": "pending"
}
```

**Response Handling:**
```javascript
// Tests tab
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Subtask created successfully", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('_id');
    pm.expect(response.subject).to.eql("Research phase");
    pm.expect(response.status).to.eql("pending");
    pm.expect(response.taskId).to.eql(pm.environment.get("task_id"));
});

// Set subtask_id for further testing
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("subtask_id", response._id);
}
```

**Error Scenarios:**
- **400 Bad Request**: Missing required fields
- **400 Bad Request**: Invalid deadline
- **404 Not Found**: Task not found
- **401 Unauthorized**: Invalid or missing token

### 3. Update Subtasks

**Request Details:**
- **Method**: `PUT`
- **URL**: `{{base_url}}/api/tasks/{{task_id}}/subtasks`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{jwt_token}}`

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

**Response Handling:**
```javascript
// Tests tab
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Subtasks updated successfully", function () {
    const response = pm.response.json();
    pm.expect(response).to.be.an('array');
    pm.expect(response).to.have.length(2);
    
    const firstSubtask = response[0];
    pm.expect(firstSubtask.subject).to.eql("Research phase");
    pm.expect(firstSubtask.status).to.eql("completed");
    
    const secondSubtask = response[1];
    pm.expect(secondSubtask.subject).to.eql("Write documentation");
    pm.expect(secondSubtask.status).to.eql("pending");
});
```

**Error Scenarios:**
- **400 Bad Request**: Invalid subtasks array
- **400 Bad Request**: Missing required fields in subtasks
- **404 Not Found**: Task not found
- **401 Unauthorized**: Invalid or missing token

## Complete Testing Workflow

### 1. Setup Environment
1. Create a new Postman environment
2. Set the environment variables listed above
3. Import the collection

### 2. Authentication Flow
1. **Register User**: Create a new user account
2. **Login User**: Authenticate and get JWT token
3. Verify that `jwt_token` and `user_id` are set in environment

### 3. Task Management Flow
1. **Create Task**: Create a new task
2. **Get All Tasks**: Verify task appears in list
3. **Update Task**: Modify task details
4. **Create Subtask**: Add subtask to task
5. **Get Subtasks**: Verify subtask appears
6. **Update Subtasks**: Replace all subtasks
7. **Delete Task**: Remove task (soft delete)

### 4. Error Testing
1. Test with invalid JWT token
2. Test with missing required fields
3. Test with invalid data types
4. Test with non-existent resources

## Pre-request Scripts

### Authentication Setup
```javascript
// Pre-request script for authenticated endpoints
if (!pm.environment.get("jwt_token")) {
    console.log("Warning: No JWT token found. Please login first.");
}
```

### Dynamic Data Generation
```javascript
// Pre-request script for creating unique test data
const timestamp = new Date().getTime();
pm.environment.set("unique_email", `test${timestamp}@example.com`);
pm.environment.set("future_date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
```

## Collection Variables

### Global Variables
```json
{
  "valid_statuses": ["pending", "in-progress", "completed"],
  "test_user_name": "Test User",
  "test_user_password": "password123"
}
```

### Environment Variables
```json
{
  "base_url": "http://localhost:8080",
  "jwt_token": "",
  "user_id": "",
  "task_id": "",
  "subtask_id": ""
}
```

## Testing Scenarios

### 1. Happy Path Testing
- Complete user registration and login
- Create, read, update, delete tasks
- Create and manage subtasks
- Verify all CRUD operations work correctly

### 2. Error Handling Testing
- Test with invalid authentication
- Test with missing required fields
- Test with invalid data formats
- Test with non-existent resources

### 3. Edge Case Testing
- Test with empty arrays
- Test with very long strings
- Test with special characters
- Test with boundary dates

### 4. Performance Testing
- Test with multiple concurrent requests
- Test with large payloads
- Test response times
- Test memory usage

## Automation

### Newman CLI Testing
```bash
# Install Newman
npm install -g newman

# Run collection
newman run Task-Management-API.postman_collection.json \
  --environment localhost.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export results.json
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: API Tests
  run: |
    newman run Task-Management-API.postman_collection.json \
      --environment localhost.postman_environment.json \
      --reporters cli,junit \
      --reporter-junit-export test-results.xml
```

## Best Practices

### 1. Environment Management
- Use separate environments for development, staging, and production
- Never commit sensitive data to version control
- Use environment variables for configuration

### 2. Test Organization
- Group related tests together
- Use descriptive test names
- Include both positive and negative test cases

### 3. Data Management
- Clean up test data after tests
- Use unique identifiers for test data
- Avoid hardcoded values in tests

### 4. Documentation
- Document all test scenarios
- Include setup and teardown instructions
- Maintain up-to-date test documentation

This Postman collection provides comprehensive testing coverage for the Task Management API with proper authentication, error handling, and automated testing capabilities.
