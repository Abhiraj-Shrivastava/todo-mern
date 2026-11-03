import mongoose from 'mongoose';

export async function connectDB(uri) {
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Copy .env.example to .env and add your connection string, ' +
        'or run "npm run dev:memory" to use a temporary in-memory database.'
    );
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const { host, name } = mongoose.connection;
  console.log(`MongoDB connected: ${host}/${name}`);
}
