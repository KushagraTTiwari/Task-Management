# Database Schema Documentation

## Overview

The Task Management API uses MongoDB as the primary database with three main collections: `users`, `tasks`, and `subtasks`. The schema is designed to support user authentication, task management, and hierarchical task organization with subtasks.

## Database Collections

**ER Diagram:** https://drive.google.com/file/d/1Ya3HDapeZpZtuXahCKAXLZwAtXxPC_7y/view?usp=sharing

### 1. Users Collection

**Collection Name:** `users`

**Purpose:** Stores user account information and authentication data.

**Schema Definition:**
```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated unique identifier
  name: String,                     // User's full name (required)
  email: String,                    // User's email address (required, unique)
  password: String,                 // Hashed password (required)
  tasks: [ObjectId],               // Array of task references (optional)
  is_deleted: Boolean,             // Soft delete flag (default: false)
  created_at: Date,                // Record creation timestamp (default: Date.now)
  updated_at: Date                 // Record last update timestamp (default: Date.now)
}
```

**Field Details:**
- **name**: Required string field for user's display name
- **email**: Required string field, must be unique across all users
- **password**: Required string field, stored as bcrypt hash
- **tasks**: Optional array of ObjectId references to tasks created by this user
- **is_deleted**: Boolean flag for soft deletion (default: false)
- **created_at**: Automatic timestamp when record is created
- **updated_at**: Automatic timestamp when record is last modified

**Indexes:**
- `email` (unique index)
- `is_deleted` (for efficient soft delete queries)

### 2. Tasks Collection

**Collection Name:** `tasks`

**Purpose:** Stores main tasks with deadlines, status, and associated subtasks.

**Schema Definition:**
```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated unique identifier
  subject: String,                  // Task title/description (required)
  deadline: Date,                   // Task due date (required)
  status: String,                   // Task status enum (default: 'pending')
  createdBy: ObjectId,             // Reference to user who created the task (required)
  subtasks: [ObjectId],            // Array of subtask references (optional)
  is_deleted: Boolean,             // Soft delete flag (default: false)
  created_at: Date,                // Record creation timestamp (default: Date.now)
  updated_at: Date                 // Record last update timestamp (default: Date.now)
}
```

**Field Details:**
- **subject**: Required string field for task title or description
- **deadline**: Required Date field for task due date (must be future date)
- **status**: String enum with values: `'pending'`, `'in-progress'`, `'completed'` (default: `'pending'`)
- **createdBy**: Required ObjectId reference to the user who created the task
- **subtasks**: Optional array of ObjectId references to subtasks
- **is_deleted**: Boolean flag for soft deletion (default: false)
- **created_at**: Automatic timestamp when record is created
- **updated_at**: Automatic timestamp when record is last modified

**Indexes:**
- `createdBy` (for efficient user-specific queries)
- `is_deleted` (for efficient soft delete queries)
- `status` (for status-based filtering)
- `deadline` (for date-based sorting and filtering)

### 3. Subtasks Collection

**Collection Name:** `subtasks`

**Purpose:** Stores subtasks associated with parent tasks.

**Schema Definition:**
```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated unique identifier
  subject: String,                  // Subtask title/description (required)
  deadline: Date,                   // Subtask due date (required)
  status: String,                   // Subtask status enum (default: 'pending')
  taskId: ObjectId,                // Reference to parent task (required)
  is_deleted: Boolean,             // Soft delete flag (default: false)
  created_at: Date,                // Record creation timestamp (default: Date.now)
  updated_at: Date                 // Record last update timestamp (default: Date.now)
}
```

**Field Details:**
- **subject**: Required string field for subtask title or description
- **deadline**: Required Date field for subtask due date (must be future date)
- **status**: String enum with values: `'pending'`, `'in-progress'`, `'completed'` (default: `'pending'`)
- **taskId**: Required ObjectId reference to the parent task
- **is_deleted**: Boolean flag for soft deletion (default: false)
- **created_at**: Automatic timestamp when record is created
- **updated_at**: Automatic timestamp when record is last modified

**Indexes:**
- `taskId` (for efficient parent task queries)
- `is_deleted` (for efficient soft delete queries)
- `status` (for status-based filtering)
- `deadline` (for date-based sorting and filtering)

## Relationships

### 1. User → Tasks (One-to-Many)
- **Relationship Type**: One-to-Many
- **Description**: A user can create multiple tasks
- **Implementation**: 
  - Tasks collection has `createdBy` field referencing user's `_id`
  - Users collection has `tasks` array containing task `_id` references
- **Query Example**: `tasks.find({ createdBy: userId, is_deleted: false })`

### 2. Task → Subtasks (One-to-Many)
- **Relationship Type**: One-to-Many
- **Description**: A task can have multiple subtasks
- **Implementation**:
  - Subtasks collection has `taskId` field referencing task's `_id`
  - Tasks collection has `subtasks` array containing subtask `_id` references
- **Query Example**: `subtasks.find({ taskId: taskId, is_deleted: false })`

### 3. User → Subtasks (Indirect Relationship)
- **Relationship Type**: Indirect One-to-Many through Tasks
- **Description**: A user can have subtasks through their tasks
- **Implementation**: No direct reference, accessed through task relationship
- **Query Example**: `subtasks.find({ taskId: { $in: userTaskIds }, is_deleted: false })`

## Data Integrity Constraints

### 1. Referential Integrity
- **Task → User**: When a user is deleted, their tasks are soft-deleted
- **Subtask → Task**: When a task is deleted, its subtasks are soft-deleted
- **Validation**: All ObjectId references must point to existing documents

### 2. Business Rules
- **Deadline Validation**: All deadlines must be future dates
- **Status Validation**: Status must be one of the defined enum values
- **Soft Delete**: All deletions are soft deletes to preserve data integrity
- **Unique Constraints**: Email addresses must be unique across all users

### 3. Cascade Operations
- **Task Deletion**: When a task is soft-deleted, all its subtasks are also soft-deleted
- **User Deletion**: When a user is soft-deleted, all their tasks and subtasks are soft-deleted

## Query Patterns

### 1. User Authentication Queries
```javascript
// Find user by email for login
users.findOne({ email: email, is_deleted: false })

// Create new user
users.create({ name, email, password: hashedPassword })
```

### 2. Task Management Queries
```javascript
// Get all tasks for a user
tasks.find({ createdBy: userId, is_deleted: false }).populate('subtasks')

// Create new task
tasks.create({ subject, deadline, status, createdBy: userId })

// Update task
tasks.findOneAndUpdate({ _id: taskId, createdBy: userId, is_deleted: false }, updateData)
```

### 3. Subtask Management Queries
```javascript
// Get all subtasks for a task
subtasks.find({ taskId: taskId, is_deleted: false })

// Create new subtask
subtasks.create({ subject, deadline, status, taskId })

// Update subtasks for a task
subtasks.updateMany({ taskId: taskId, is_deleted: false }, { is_deleted: true })
```

## Performance Considerations

### 1. Indexing Strategy
- **Primary Indexes**: `_id` (automatic)
- **Secondary Indexes**: `email`, `createdBy`, `taskId`, `status`, `deadline`
- **Compound Indexes**: Consider `{ createdBy: 1, is_deleted: 1 }` for user queries

### 2. Query Optimization
- **Pagination**: Implement skip/limit for large result sets
- **Projection**: Select only required fields to reduce data transfer
- **Aggregation**: Use MongoDB aggregation pipeline for complex queries

### 3. Data Growth Considerations
- **Archive Strategy**: Implement data archiving for old completed tasks
- **Partitioning**: Consider time-based partitioning for large datasets
- **Monitoring**: Track collection sizes and query performance

## Security Considerations

### 1. Data Protection
- **Password Hashing**: All passwords are hashed using bcrypt
- **Input Validation**: All inputs are validated at multiple levels
- **SQL Injection Prevention**: Using Mongoose ODM prevents injection attacks

### 2. Access Control
- **User Isolation**: Users can only access their own tasks and subtasks
- **JWT Authentication**: Stateless authentication with secure tokens
- **Soft Delete**: Prevents accidental data loss

## Migration and Versioning

### 1. Schema Evolution
- **Backward Compatibility**: Schema changes maintain backward compatibility
- **Migration Scripts**: Database migrations for schema updates
- **Version Control**: Schema versions tracked in application

### 2. Data Migration
- **Bulk Operations**: Efficient bulk updates for schema changes
- **Validation**: Data validation during migration process
- **Rollback**: Ability to rollback schema changes if needed

## Monitoring and Maintenance

### 1. Database Monitoring
- **Collection Sizes**: Monitor growth of collections
- **Query Performance**: Track slow queries and optimize
- **Index Usage**: Monitor index effectiveness

### 2. Maintenance Tasks
- **Index Maintenance**: Regular index optimization
- **Data Cleanup**: Archive old soft-deleted records
- **Backup Strategy**: Regular database backups

This schema design provides a robust foundation for the Task Management API with proper relationships, data integrity, and performance considerations.
