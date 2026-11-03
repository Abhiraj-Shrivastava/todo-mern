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
