import Task, { STATUSES } from '../models/Task.js';
import { HttpError } from '../middleware/errorHandler.js';

const EDITABLE_FIELDS = ['title', 'description', 'dueDate', 'endDate', 'priority', 'status'];
const MAX_SEARCH_WORDS = 8;

function pickEditable(body = {}) {
  const fields = {};
  for (const key of EDITABLE_FIELDS) {
    if (Object.hasOwn(body, key)) fields[key] = body[key];
  }
  for (const key of ['endDate', 'priority']) {
    if (key in fields && (fields[key] === null || fields[key] === '')) fields[key] = undefined;
  }
  if ('description' in fields && fields.description == null) fields.description = '';
  return fields;
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseDateParam(value, name) {
  const date = typeof value === 'string' ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    throw new HttpError(400, `Query parameter "${name}" must be a valid ISO date`);
  }
  return date;
}

function isValidTimeZone(tz) {
  if (typeof tz !== 'string' || !/^[A-Za-z][A-Za-z0-9_+\-/]*$/.test(tz)) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

async function findTaskOr404(id) {
  const task = await Task.findById(id);
  if (!task) throw new HttpError(404, 'Task not found');
  return task;
}

export async function listTasks(req, res) {
  const { search, from, to, status } = req.query;
  const filter = {};

  if (typeof search === 'string' && search.trim()) {
    const words = search.trim().split(/\s+/).slice(0, MAX_SEARCH_WORDS);
    filter.$and = words.map((word) => {
      const pattern = new RegExp(escapeRegex(word), 'i');
      return { $or: [{ title: pattern }, { description: pattern }] };
    });
  }

  if (from || to) {
    filter.dueDate = {};
    if (from) filter.dueDate.$gte = parseDateParam(from, 'from');
    if (to) filter.dueDate.$lt = parseDateParam(to, 'to');
  }

  if (status !== undefined) {
    if (!STATUSES.includes(status)) {
      throw new HttpError(400, `Query parameter "status" must be one of: ${STATUSES.join(', ')}`);
    }
    filter.status = status;
  }

  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 500, 1), 1000);
  const tasks = await Task.find(filter).sort({ dueDate: 1, createdAt: 1 }).limit(limit);
  res.json({ data: tasks });
}

export async function weeklySummary(req, res) {
  const tz = req.query.tz ?? 'UTC';
  if (!isValidTimeZone(tz)) throw new HttpError(400, 'Query parameter "tz" must be a valid IANA time zone');

  const weeks = await Task.aggregate([
    {
      $group: {
        _id: {
          $dateTrunc: { date: '$dueDate', unit: 'week', startOfWeek: 'monday', timezone: tz },
        },
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        weekStart: '$_id',
        weekEnd: { $dateAdd: { startDate: '$_id', unit: 'week', amount: 1, timezone: tz } },
        total: 1,
        completed: 1,
        open: { $subtract: ['$total', '$completed'] },
      },
    },
  ]);

  res.json({ data: weeks });
}

export async function getTask(req, res) {
  res.json({ data: await findTaskOr404(req.params.id) });
}

export async function createTask(req, res) {
  const task = await Task.create(pickEditable(req.body));
  res.status(201).json({ data: task });
}

export async function updateTask(req, res) {
  const fields = pickEditable(req.body);
  if (Object.keys(fields).length === 0) {
    throw new HttpError(400, `Nothing to update. Editable fields: ${EDITABLE_FIELDS.join(', ')}`);
  }
  const task = await findTaskOr404(req.params.id);
  task.set(fields);
  await task.save();
  res.json({ data: task });
}

export async function deleteTask(req, res) {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) throw new HttpError(404, 'Task not found');
  res.status(204).end();
}
