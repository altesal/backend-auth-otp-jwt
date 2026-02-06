import express, { Express } from 'express';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { Factory } from './factory';
import { pinoInstance } from './adapters/PinoLogger';
import { Routes } from './routes';
import { AuthenticatedRequest } from '../../auth/infrastructure/http/AuthMiddleware';

export function createServer(): Express {
  const app = express();
  app.use(express.json());
  const swaggerDocument = YAML.load(path.join(__dirname, '../../../docs/openapi.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use(pinoHttp({ logger: pinoInstance }));
  const healthController = Factory.createHealthController();
  app.get(Routes.Health, (request, response) => healthController.check(request, response));
  const authController = Factory.createAuthController();
  app.post(Routes.AuthRegister, (request, response) => authController.register(request, response));
  app.post(Routes.AuthLoginRequestOtp, (request, response) => authController.requestOtp(request, response));
  app.post(Routes.AuthLoginVerifyOtp, (request, response) => authController.verifyOtp(request, response));
  const authMiddleware = Factory.createAuthMiddleware();
  const profileController = Factory.createProfileController();
  app.get(Routes.ProfileMe, authMiddleware, (request, response) =>
    profileController.me(request as AuthenticatedRequest, response)
  );
  app.patch(Routes.ProfileMe, authMiddleware, (request, response) =>
    profileController.updateMe(request as AuthenticatedRequest, response)
  );
  return app;
}
