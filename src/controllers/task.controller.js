import Task from '../models/task.js';
import SubTask from '../models/subTask.js';
import { COMPLETED, IN_PROGRESS, PENDING } from '../constant/enum.js';


const validStatuses = [PENDING, IN_PROGRESS, COMPLETED];

const isValidFutureDate = (dateString) => {
  const inputDate = new Date(dateString);
  const currentDate = new Date();
  return inputDate > currentDate;
};

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         subject:
 *           type: string
 *         deadline:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [pending, in-progress, completed]
 *         createdBy:
 *           type: string
 *         is_deleted:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     SubTask:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         taskId:
 *           type: string
 *         is_deleted:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all non-deleted tasks with their non-deleted subtasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
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

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - deadline
 *               - status
 *             properties:
 *               subject:
 *                 type: string
 *                 example: Complete project documentation
 *               deadline:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-15
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *                 example: pending
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request - Invalid data
 */
export const createTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(400).json({ message: 'unauthorised - userId is a required field.' });
    }

    const { subject, deadline, status } = req.body;

    if (!subject || !deadline || !status) {
      return res.status(400).json({ message: 'subject, deadline, and status are required fields.' });
    }

    if (!isValidFutureDate(deadline)) {
      return res.status(400).json({ message: 'Deadline must be a future date' });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'status must be one of pending, in-progress or completed.',
        validStatuses: validStatuses
      });
    }

    const task = new Task({
      subject,
      deadline: new Date(deadline),
      status,
      createdBy: userId,
    });

    await task.save();

    return res.status(201).json(task);
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @swagger
 * /api/tasks/{taskId}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: The task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *                 example: Updated project documentation
 *               deadline:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-20
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *                 example: in-progress
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */
export const updateTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(400).json({ message: 'unauthorised - userId is a required field.' });
    }

    const { taskId } = req.params;
    const { subject, deadline, status } = req.body;

    if (deadline && !isValidFutureDate(deadline)) {
      return res.status(400).json({ message: 'Deadline must be a future date' });
    }

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'status must be one of pending, in-progress, completed',
        validStatuses: validStatuses
      });
    }

    const updateFields = {
      subject,
      status,
      updated_at: new Date()
    };

    if (deadline) {
      updateFields.deadline = new Date(deadline);
    }

    const task = await Task.findOneAndUpdate({
      _id: taskId,
      createdBy: userId,
      is_deleted: false
    }, updateFields, { new: true });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json(task);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @swagger
 * /api/tasks/{taskId}:
 *   delete:
 *     summary: Soft delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */
export const deleteTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(400).json({ message: 'unauthorised - userId is a required field.' });
    }

    const { taskId } = req.params;

    const task = await Task.findOneAndUpdate({
      _id: taskId,
      createdBy: userId,
      is_deleted: false
    }, {
      $set: {
        is_deleted: true,
        updated_at: new Date()
      }
    }, { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Soft delete associated subtasks
    await SubTask.updateMany({
      taskId,
      is_deleted: false
    }, {
      $set: {
        is_deleted: true,
        updated_at: new Date()
      }
    });

    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @swagger
 * /api/tasks/{taskId}/subtasks:
 *   get:
 *     summary: Get all non-deleted subtasks for a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: The task ID
 *     responses:
 *       200:
 *         description: List of subtasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SubTask'
 *       404:
 *         description: Task not found
 */
export const getSubtasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(400).json({ message: 'unauthorised - userId is a required field.' });
    }

    const { taskId } = req.params;

    const task = await Task.findOne({
      _id: taskId,
      createdBy: userId,
      is_deleted: false
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const subtasks = await SubTask.find({
      taskId,
      is_deleted: false
    });

    return res.status(200).json(subtasks);
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @swagger
 * /api/tasks/{taskId}/subtasks:
 *   post:
 *     summary: Create a new subtask for a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: The task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - deadline
 *             properties:
 *               subject:
 *                 type: string
 *                 example: Research phase
 *               deadline:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-20
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *                 example: pending
 *     responses:
 *       201:
 *         description: Subtask created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubTask'
 *       400:
 *         description: Bad request - Invalid data
 *       404:
 *         description: Task not found
 */
export const createSubTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(400).json({ message: 'Unauthorized - userId is required' });
    }

    const { taskId } = req.params;
    const { subject, deadline, status = PENDING } = req.body;

    if (!subject || !deadline) {
      return res.status(400).json({ 
        message: 'Subject and deadline are required fields' 
      });
    }

    if (!isValidFutureDate(deadline)) {
      return res.status(400).json({ message: 'Deadline must be a future date' });
    }

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'status must be one of pending, in-progress, completed',
        validStatuses: validStatuses
      });
    }

    const parentTask = await Task.findOne({
      _id: taskId,
      createdBy: userId,
      is_deleted: false
    });

    if (!parentTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const subTask = new SubTask({
      subject,
      deadline: new Date(deadline),
      status,
      taskId
    });

    await subTask.save();

    await Task.findByIdAndUpdate(
      taskId,
      { $push: { subtasks: subTask._id } },
      { new: true }
    );

    return res.status(201).json(subTask);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @swagger
 * /api/tasks/{taskId}/subtasks:
 *   put:
 *     summary: Update subtasks for a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: The task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subtasks
 *             properties:
 *               subtasks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - subject
 *                     - deadline
 *                   properties:
 *                     subject:
 *                       type: string
 *                       example: Research phase
 *                     deadline:
 *                       type: string
 *                       format: date
 *                       example: 2024-01-20
 *                     status:
 *                       type: string
 *                       enum: [pending, in-progress, completed]
 *                       example: pending
 *     responses:
 *       200:
 *         description: Subtasks updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SubTask'
 *       400:
 *         description: Bad request - Invalid data
 *       404:
 *         description: Task not found
 */
export const updateSubtasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { taskId } = req.params;
    const { subtasks } = req.body;

    const task = await Task.findOne({
      _id: taskId,
      createdBy: userId,
      is_deleted: false
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!Array.isArray(subtasks)) {
      return res.status(400).json({ message: 'subtasks must be an array' });
    }

    for (const subtask of subtasks) {
      if (!subtask.subject || !subtask.deadline) {
        return res.status(400).json({
          message: 'subject and deadline are required fields for subtask.'
        });
      }

      if (!isValidFutureDate(subtask.deadline)) {
        return res.status(400).json({ message: 'Deadline must be a future date' });
      }

      if (subtask.status && !validStatuses.includes(subtask.status)) {
        return res.status(400).json({
          message: 'status must be one of pending, in-progress, completed',
          validStatuses: validStatuses
        });
      }
    }

    await SubTask.updateMany({
      taskId,
      is_deleted: false
    }, {
      $set: {
        is_deleted: true,
        updated_at: new Date()
      }
    });

    const newSubtasks = [];
    for (const subtaskData of subtasks) {
      const newSubtask = new SubTask({
        subject: subtaskData.subject,
        deadline: new Date(subtaskData.deadline),
        status: subtaskData.status || PENDING,
        taskId
      });

      await newSubtask.save();
      newSubtasks.push(newSubtask);
    }

    await Task.findByIdAndUpdate(
      taskId,
      {
        subtasks: newSubtasks.map(s => s._id),
        updated_at: new Date()
      }
    );

    return res.status(200).json(newSubtasks);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};