import mongoose from 'mongoose';

export const PRIORITIES = ['Low', 'Medium', 'High'];
export const STATUSES = ['In Progress', 'Completed'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title must be 120 characters or fewer'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description must be 1000 characters or fewer'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Date & time is required'],
    },
    endDate: {
      type: Date,
      validate: {
        validator(value) {
          return value == null || this.dueDate == null || value > this.dueDate;
        },
        message: 'End time must be after the start time',
      },
    },
    priority: {
      type: String,
      enum: { values: PRIORITIES, message: 'Priority must be Low, Medium or High' },
    },
    status: {
      type: String,
      enum: { values: STATUSES, message: 'Status must be "In Progress" or "Completed"' },
      default: 'In Progress',
    },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  }
);

taskSchema.index({ dueDate: 1 });

export default mongoose.model('Task', taskSchema);
