const http = require('http');

const app = require('./app');
const config = require('./config');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const { initSocket } = require('./socket');
const { initCronJobs } = require('./cron');

let server;

const start = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Create HTTP server
    server = http.createServer(app);

    // Initialize Socket.IO
    initSocket(server);

    // Initialize cron jobs
    initCronJobs();

    // Start server
    server.listen(config.port, '0.0.0.0', () => {
      logger.info(
        `Server running in ${config.env} mode on port ${config.port}`
      );

      logger.info(
        `API base URL: http://localhost:${config.port}/api/${config.apiVersion}`
      );

      logger.info(
        `Swagger docs available at http://localhost:${config.port}/api-docs`
      );
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(
          `Port ${config.port} is already in use. Stop the other process and retry.`
        );

        process.exit(1);
      }

      logger.error(`Server error: ${error.message}`);
      process.exit(1);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`, {
      stack: error.stack,
    });

    process.exit(1);
  }
};

// Graceful shutdown
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

// Handle unexpected errors
const unexpectedErrorHandler = (error) => {
  logger.error(`Unexpected error: ${error.message}`, {
    stack: error.stack,
  });

  exitHandler();
};

// Process error handlers
process.on('uncaughtException', unexpectedErrorHandler);

process.on('unhandledRejection', unexpectedErrorHandler);

// Render / Docker shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');

  if (server) {
    server.close(() => {
      logger.info('Server closed due to SIGTERM');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Local shutdown
process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');

  if (server) {
    server.close(() => {
      logger.info('Server closed due to SIGINT');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Start application
start();