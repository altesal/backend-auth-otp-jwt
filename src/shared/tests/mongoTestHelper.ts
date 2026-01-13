import { MongoClient, Db } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

export async function createTestMongo() {
  const server = await MongoMemoryServer.create();
  const client = await MongoClient.connect(server.getUri());

  return {
    db(): Db {
      return client.db();
    },
    client(): MongoClient {
      return client;
    },
    async clean(): Promise<void> {
      await client.db().dropDatabase();
    },
    async stop(): Promise<void> {
      await client.close();
      await server.stop();
    },
  };
}
