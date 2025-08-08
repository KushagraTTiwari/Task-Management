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
