import pino from 'pino';
import { Logger } from '../../application/ports/Logger';

export const pinoInstance = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development' ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
});

export function createPinoLogger(): Logger {
  return {
    info(message: string): void {
      pinoInstance.info(message);
    },
    error(error: unknown, message: string): void {
      pinoInstance.error(error, message);
    },
  };
}
