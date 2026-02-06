import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import { createServer } from './shared/infrastructure/server';
import { Factory } from './shared/infrastructure/factory';

async function main(): Promise<void> {
  const logger = Factory.getLogger();
  const port = process.env.PORT || 8080;
  try {
    await Factory.connectToMongo();
    logger.info('Connected to MongoDB');
    const server = createServer();
    server.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
    const shutdown = async () => {
      logger.info('Shutting down...');
      await Factory.disconnectFromMongo();
      process.exit(0);
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
}

main();
