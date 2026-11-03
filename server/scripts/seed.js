import 'dotenv/config';
import mongoose from 'mongoose';
import Task from '../src/models/Task.js';
import { connectDB } from '../src/config/db.js';
import { seedIfEmpty } from './sampleTasks.js';

try {
  await connectDB(process.env.MONGODB_URI);
  if (process.argv.includes('--reset')) {
    const { deletedCount } = await Task.deleteMany({});
    console.log(`Deleted ${deletedCount} existing tasks`);
  }
  const inserted = await seedIfEmpty();
  console.log(inserted ? `Inserted ${inserted} sample tasks` : 'Tasks already exist, nothing inserted (use --reset)');
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
