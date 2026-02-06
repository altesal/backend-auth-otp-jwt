import request from 'supertest';
import { createServer } from '../../../shared/infrastructure/server';
import { Factory } from '../../../shared/infrastructure/factory';
import { createTestMongo } from '../../../shared/tests/mongoTestHelper';
import { Routes } from '../../../shared/infrastructure/routes';

describe('The Profile API', () => {
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

  const registerAndLogin = async () => {
    await request(server).post(Routes.AuthRegister).send({ email: 'user@domain.com' });
    await request(server).post(Routes.AuthLoginRequestOtp).send({ email: 'user@domain.com' });
    const otpSession = await mongo
      .db()
      .collection('otp_sessions')
      .findOne({ _id: 'user@domain.com' } as never);
    const otp = otpSession?.otp;
    const loginResponse = await request(server).post(Routes.AuthLoginVerifyOtp).send({ email: 'user@domain.com', otp });
    return loginResponse.body.token;
  };

  describe('GET /profile/me', () => {
    it('returns current user profile when authenticated', async () => {
      const token = await registerAndLogin();

      const response = await request(server).get(Routes.ProfileMe).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('user@domain.com');
      expect(response.body.fullName).toBe('');
      expect(response.body.phone).toBe('');
    });

    it('requires authentication', async () => {
      const response = await request(server).get(Routes.ProfileMe);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authorization header required');
    });

    it('rejects invalid token', async () => {
      const response = await request(server).get(Routes.ProfileMe).set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('PATCH /profile/me', () => {
    it('updates user profile', async () => {
      const token = await registerAndLogin();

      const response = await request(server)
        .patch(Routes.ProfileMe)
        .set('Authorization', `Bearer ${token}`)
        .send({ fullName: 'John Doe', phone: '+34612345678' });

      expect(response.status).toBe(200);
      expect(response.body.fullName).toBe('John Doe');
      expect(response.body.phone).toBe('+34612345678');
    });

    it('persists profile changes', async () => {
      const token = await registerAndLogin();
      await request(server)
        .patch(Routes.ProfileMe)
        .set('Authorization', `Bearer ${token}`)
        .send({ fullName: 'John Doe', phone: '+34612345678' });

      const response = await request(server).get(Routes.ProfileMe).set('Authorization', `Bearer ${token}`);

      expect(response.body.fullName).toBe('John Doe');
      expect(response.body.phone).toBe('+34612345678');
    });

    it('validates fullName is not empty', async () => {
      const token = await registerAndLogin();

      const response = await request(server)
        .patch(Routes.ProfileMe)
        .set('Authorization', `Bearer ${token}`)
        .send({ fullName: '', phone: '+34612345678' });

      expect(response.status).toBe(422);
      expect(response.body.error).toBe('Full name cannot be empty');
    });

    it('validates phone format', async () => {
      const token = await registerAndLogin();

      const response = await request(server)
        .patch(Routes.ProfileMe)
        .set('Authorization', `Bearer ${token}`)
        .send({ fullName: 'John Doe', phone: 'invalid-phone' });

      expect(response.status).toBe(422);
      expect(response.body.error).toBe('Invalid phone format');
    });

    it('requires both fullName and phone', async () => {
      const token = await registerAndLogin();

      const response = await request(server)
        .patch(Routes.ProfileMe)
        .set('Authorization', `Bearer ${token}`)
        .send({ fullName: 'John Doe' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('fullName and phone are required');
    });

    it('requires authentication', async () => {
      const response = await request(server)
        .patch(Routes.ProfileMe)
        .send({ fullName: 'John Doe', phone: '+34612345678' });

      expect(response.status).toBe(401);
    });
  });
});
