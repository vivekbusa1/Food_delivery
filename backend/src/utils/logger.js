const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config');

const logsDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    return `[${ts}] ${level}: ${stack || message}`;
  }),
);

const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
    }),
  ],
  exitOnError: false,
});

if (config.env !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    }),
  );
} else {
  logger.add(
    new winston.transports.Console({
      format: combine(timestamp(), json()),
    }),
  );
}

logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;
