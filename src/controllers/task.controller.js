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