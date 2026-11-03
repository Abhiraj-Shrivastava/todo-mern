import mongoose from 'mongoose';

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const FIELD_LABELS = {
  dueDate: 'Date & time',
  endDate: 'End time',
  title: 'Title',
  description: 'Description',
  priority: 'Priority',
  status: 'Status',
};

function validationDetails(err) {
  const details = {};
  for (const [field, e] of Object.entries(err.errors)) {
    details[field] =
      e.name === 'CastError' ? `${FIELD_LABELS[field] ?? field} is not valid` : e.message;
  }
  return details;
}

export function notFound(req, res) {
  res.status(404).json({ error: { message: `Route not found: ${req.method} ${req.originalUrl}` } });
}

export function errorHandler(err, req, res, next) {
  if (err instanceof mongoose.Error.ValidationError) {
    const details = validationDetails(err);
    return res.status(400).json({ error: { message: Object.values(details)[0], details } });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: { message: `Invalid value for ${err.path}` } });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Request body is not valid JSON' } });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { message: err.message, details: err.details } });
  }

  console.error(err);
  res.status(500).json({ error: { message: 'Something went wrong on the server' } });
}
