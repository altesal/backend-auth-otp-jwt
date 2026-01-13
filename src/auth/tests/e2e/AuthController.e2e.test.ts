import request from 'supertest';
import { createServer } from '../../../shared/infrastructure/server';
import { Factory } from '../../../shared/infrastructure/factory';
import { createTestMongo } from '../../../shared/tests/mongoTestHelper';
import { Routes } from '../../../shared/infrastructure/routes';

describe('The Auth API', () => {
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

  describe('User Registration', () => {
    it('registers a new user with valid email', async () => {
      const response = await request(server).post(Routes.AuthRegister).send({ email: 'user@domain.com' });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.email).toBe('user@domain.com');
    });

    it('does not allow duplicate email registration', async () => {
      await request(server).post(Routes.AuthRegister).send({ email: 'user@domain.com' });

      const response = await request(server).post(Routes.AuthRegister).send({ email: 'user@domain.com' });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email already registered');
    });

    it('does not allow invalid email format', async () => {
      const response = await request(server).post(Routes.AuthRegister).send({ email: 'invalid-email' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email format');
    });
  });

  describe('OTP Request', () => {
    it('sends OTP for registered user', async () => {
      await request(server).post(Routes.AuthRegister).send({ email: 'user@domain.com' });

      const response = await request(server).post(Routes.AuthLoginRequestOtp).send({ email: 'user@domain.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('OTP sent');
    });

    it('does not allow OTP request for unregistered user', async () => {
      const response = await request(server).post(Routes.AuthLoginRequestOtp).send({ email: 'unknown@domain.com' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('OTP Verification', () => {
    it('does not allow verification without active session', async () => {
      await request(server).post(Routes.AuthRegister).send({ email: 'user@domain.com' });

      const response = await request(server)
        .post(Routes.AuthLoginVerifyOtp)
        .send({ email: 'user@domain.com', otp: '123456' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('No OTP session found');
    });

    it('does not allow verification with incorrect OTP', async () => {
      await request(server).post(Routes.AuthRegister).send({ email: 'user@domain.com' });
      await request(server).post(Routes.AuthLoginRequestOtp).send({ email: 'user@domain.com' });

      const response = await request(server)
        .post(Routes.AuthLoginVerifyOtp)
        .send({ email: 'user@domain.com', otp: '000000' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid OTP');
    });
  });

  describe('Complete Login Flow', () => {
    it('authenticates user after registration and OTP verification', async () => {
      await request(server).post(Routes.AuthRegister).send({ email: 'user@domain.com' });
      await request(server).post(Routes.AuthLoginRequestOtp).send({ email: 'user@domain.com' });
      const otpSession = await mongo
        .db()
        .collection('otp_sessions')
        .findOne({ _id: 'user@domain.com' } as never);
      const otp = otpSession?.otp;

      const response = await request(server).post(Routes.AuthLoginVerifyOtp).send({ email: 'user@domain.com', otp });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });
  });
});
