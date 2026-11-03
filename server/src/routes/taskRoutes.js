import { Router } from 'express';
import mongoose from 'mongoose';
import {
  listTasks,
  weeklySummary,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = Router();

router.param('id', (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) return next(new HttpError(400, 'Invalid task id'));
  next();
});

router.get('/', listTasks);
router.post('/', createTask);
router.get('/weeks', weeklySummary);
router.get('/:id', getTask);
router.patch('/:id', updateTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
