import request from 'supertest';
import { createServer } from '../../../shared/infrastructure/server';
import { Factory } from '../../../shared/infrastructure/factory';
import { createTestMongo } from '../../../shared/tests/mongoTestHelper';
import { Routes } from '../../../shared/infrastructure/routes';

describe('GET /health', () => {
  let mongo: Awaited<ReturnType<typeof createTestMongo>>;
  let server: ReturnType<typeof createServer>;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-for-e2e-tests';
    mongo = await createTestMongo();
    Factory.setMongoClient(mongo.client());
    server = createServer();
  });

  afterAll(() => mongo.stop());
  beforeEach(() => mongo.clean());

  it('reports the system is healthy', async () => {
    const response = await request(server).get(Routes.Health);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.lastCheckedAt).toBeDefined();
  });

  it('maintains the same health record on every request', async () => {
    const firstResponse = await request(server).get(Routes.Health);
    const secondResponse = await request(server).get(Routes.Health);

    expect(firstResponse.body.id).toBe(secondResponse.body.id);
  });

  it('measures uptime since first request', async () => {
    await request(server).get(Routes.Health);
    await new Promise((resolve) => setTimeout(resolve, 100));
    const secondResponse = await request(server).get(Routes.Health);

    const createdAt = new Date(secondResponse.body.createdAt).getTime();
    const lastCheckedAt = new Date(secondResponse.body.lastCheckedAt).getTime();
    const uptimeMs = lastCheckedAt - createdAt;

    expect(uptimeMs).toBeGreaterThanOrEqual(100);
  });
});
