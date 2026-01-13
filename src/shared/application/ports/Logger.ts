export interface Logger {
  info(message: string): void;
  error(error: unknown, message: string): void;
}
