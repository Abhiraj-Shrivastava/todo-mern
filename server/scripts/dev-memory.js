// Runs the API against a temporary in-memory MongoDB, so no database install is needed.
// Data is lost when the process stops. The first run downloads a MongoDB binary (~100 MB).
// Set SEED=false to start with an empty database.
import { MongoMemoryServer } from 'mongodb-memory-server-core';

console.log('Starting in-memory MongoDB (first run downloads the binary, please wait)...');
const mongo = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongo.getUri('todo');

await import('../src/server.js');

if (process.env.SEED !== 'false') {
  const { seedIfEmpty } = await import('./sampleTasks.js');
  const inserted = await seedIfEmpty();
  if (inserted) console.log(`Seeded ${inserted} sample tasks`);
}
console.log('Using in-memory MongoDB: data resets when you stop the server.');

async function shutdown() {
  await mongo.stop();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
