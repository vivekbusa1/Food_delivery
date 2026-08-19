const http = require('http');
const app = require('./app');
const config = require('./config');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const { initSocket } = require('./socket');
const { initCronJobs } = require('./cron');

let server;

const start = async () => {
  await connectDB();

  server = http.createServer(app);

  initSocket(server);
  initCronJobs();

  server.listen(config.port, () => {
    logger.info(`Server running in ${config.env} mode on port ${config.port}`);
    logger.info(`API base URL: http://localhost:${config.port}/api/${config.apiVersion}`);
    logger.info(`Swagger docs available at http://localhost:${config.port}/api-docs`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`Port ${config.port} is already in use. Stop the other process and retry.`);
      process.exit(1);
    }
    throw error;
  });
};

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(`Unexpected error: ${error.message}`, { stack: error.stack });
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  if (server) {
    server.close(() => {
      logger.info('Server closed due to SIGTERM');
      process.exit(0);
    });
  }
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  if (server) {
    server.close(() => {
      logger.info('Server closed due to SIGINT');
      process.exit(0);
    });
  }
});

start();
