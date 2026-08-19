const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
    if (!config.mongoUrl) {
      throw new Error('MONGODB_URL is not defined in the environment');
    }

    const conn = await mongoose.connect(config.mongoUrl, {
      autoIndex: config.env !== 'production',
    });

    logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
