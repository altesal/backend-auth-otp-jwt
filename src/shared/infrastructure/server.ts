import express, { Express } from 'express';
import pinoHttp from 'pino-http';
import { Factory } from './factory';
import { pinoInstance } from './adapters/PinoLogger';
import { Routes } from './routes';

export function createServer(): Express {
  const app = express();
  app.use(express.json());
  app.use(pinoHttp({ logger: pinoInstance }));
  const healthController = Factory.createHealthController();
  app.get(Routes.Health, (request, response) => healthController.check(request, response));
  const authController = Factory.createAuthController();
  app.post(Routes.AuthRegister, (request, response) => authController.register(request, response));
  app.post(Routes.AuthLoginRequestOtp, (request, response) => authController.requestOtp(request, response));
  app.post(Routes.AuthLoginVerifyOtp, (request, response) => authController.verifyOtp(request, response));
  return app;
}
