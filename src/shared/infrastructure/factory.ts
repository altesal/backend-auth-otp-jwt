import { MongoClient } from 'mongodb';
import { HealthRepository } from '../../health/domain/repositories/HealthRepository';
import { MongoHealthRepository } from '../../health/infrastructure/adapters/MongoHealthRepository';
import { HealthUseCase } from '../../health/application/HealthUseCase';
import { HealthController } from '../../health/infrastructure/http/HealthController';
import { UserRepository } from '../../auth/domain/repositories/UserRepository';
import { OtpSessionRepository } from '../../auth/domain/repositories/OtpSessionRepository';
import { MongoUserRepository } from '../../auth/infrastructure/adapters/MongoUserRepository';
import { MongoOtpSessionRepository } from '../../auth/infrastructure/adapters/MongoOtpSessionRepository';
import { JsonWebTokenService } from '../../auth/infrastructure/adapters/JsonWebTokenService';
import { ConsoleOtpSender } from '../../auth/infrastructure/adapters/ConsoleOtpSender';
import { RegisterUserUseCase } from '../../auth/application/RegisterUserUseCase';
import { RequestOtpUseCase } from '../../auth/application/RequestOtpUseCase';
import { VerifyOtpUseCase } from '../../auth/application/VerifyOtpUseCase';
import { GetCurrentUserUseCase } from '../../auth/application/GetCurrentUserUseCase';
import { UpdateProfileUseCase } from '../../auth/application/UpdateProfileUseCase';
import { AuthController } from '../../auth/infrastructure/http/AuthController';
import { ProfileController } from '../../auth/infrastructure/http/ProfileController';
import { createAuthMiddleware } from '../../auth/infrastructure/http/AuthMiddleware';
import { OtpSender } from '../../auth/application/ports/OtpSender';
import { TokenGenerator } from '../../auth/application/ports/TokenGenerator';
import { TokenVerifier } from '../../auth/application/ports/TokenVerifier';
import { Logger } from '../application/ports/Logger';
import { createPinoLogger } from './adapters/PinoLogger';

export class Factory {
  private static mongoClient: MongoClient;
  private static healthRepository: HealthRepository;
  private static userRepository: UserRepository;
  private static otpSessionRepository: OtpSessionRepository;
  private static otpSender: OtpSender;
  private static tokenService: JsonWebTokenService;
  private static logger: Logger;

  static getLogger(): Logger {
    if (!this.logger) {
      this.logger = createPinoLogger();
    }
    return this.logger;
  }

  static async connectToMongo(): Promise<void> {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is required');
    }
    this.mongoClient = await MongoClient.connect(mongoUri);
  }

  static async disconnectFromMongo(): Promise<void> {
    await this.mongoClient.close();
  }

  static setMongoClient(client: MongoClient): void {
    this.mongoClient = client;
  }

  private static getHealthRepository(): HealthRepository {
    if (!this.healthRepository) {
      this.healthRepository = new MongoHealthRepository(this.mongoClient.db());
    }
    return this.healthRepository;
  }

  private static getUserRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = new MongoUserRepository(this.mongoClient.db());
    }
    return this.userRepository;
  }

  private static getOtpSessionRepository(): OtpSessionRepository {
    if (!this.otpSessionRepository) {
      this.otpSessionRepository = new MongoOtpSessionRepository(this.mongoClient.db());
    }
    return this.otpSessionRepository;
  }

  private static getOtpSender(): OtpSender {
    if (!this.otpSender) {
      this.otpSender = new ConsoleOtpSender();
    }
    return this.otpSender;
  }

  private static getTokenService(): JsonWebTokenService {
    if (!this.tokenService) {
      this.tokenService = new JsonWebTokenService();
    }
    return this.tokenService;
  }

  private static getTokenGenerator(): TokenGenerator {
    return this.getTokenService();
  }

  private static getTokenVerifier(): TokenVerifier {
    return this.getTokenService();
  }

  static createHealthUseCase(): HealthUseCase {
    return new HealthUseCase(this.getHealthRepository());
  }

  static createHealthController(): HealthController {
    return new HealthController(this.createHealthUseCase(), this.getLogger());
  }

  static createRegisterUserUseCase(): RegisterUserUseCase {
    return new RegisterUserUseCase(this.getUserRepository());
  }

  static createRequestOtpUseCase(): RequestOtpUseCase {
    return new RequestOtpUseCase(this.getUserRepository(), this.getOtpSessionRepository(), this.getOtpSender());
  }

  static createVerifyOtpUseCase(): VerifyOtpUseCase {
    return new VerifyOtpUseCase(this.getOtpSessionRepository(), this.getUserRepository(), this.getTokenGenerator());
  }

  static createAuthController(): AuthController {
    return new AuthController(
      this.createRegisterUserUseCase(),
      this.createRequestOtpUseCase(),
      this.createVerifyOtpUseCase(),
      this.getLogger()
    );
  }

  static createGetCurrentUserUseCase(): GetCurrentUserUseCase {
    return new GetCurrentUserUseCase(this.getUserRepository());
  }

  static createUpdateProfileUseCase(): UpdateProfileUseCase {
    return new UpdateProfileUseCase(this.getUserRepository());
  }

  static createProfileController(): ProfileController {
    return new ProfileController(
      this.createGetCurrentUserUseCase(),
      this.createUpdateProfileUseCase(),
      this.getLogger()
    );
  }

  static createAuthMiddleware() {
    return createAuthMiddleware(this.getTokenVerifier());
  }
}
