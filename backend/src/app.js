const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const swaggerUi = require('swagger-ui-express');

const config = require('./config');
const swaggerSpec = require('../swagger');
const routes = require('./routes');
const { notFoundHandler, convertToApiError, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');
const paymentController = require('./controllers/payment.controller');

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

const allowedOrigins =
  config.clientUrl === '*'
    ? '*'
    : config.clientUrl.split(',').map((o) => o.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Non-browser clients (mobile native, curl) send no Origin header.
      if (!origin || allowedOrigins === '*') {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Expo / Vite often hop ports in local dev — allow any localhost origin there.
      if (
        config.env !== 'production' &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(compression());

// Raw body is required for Razorpay/Stripe webhook signature verification.
// These routes must be registered BEFORE express.json() consumes the body.
app.post(
  `/api/${config.apiVersion}/payments/razorpay/webhook`,
  express.raw({ type: '*/*' }),
  (req, res, next) => {
    req.rawBody = req.body;
    try {
      req.body = JSON.parse(req.body.toString('utf-8'));
    } catch (err) {
      req.body = {};
    }
    next();
  },
  paymentController.razorpayWebhook,
);

app.post(
  `/api/${config.apiVersion}/payments/stripe/webhook`,
  express.raw({ type: '*/*' }),
  (req, res, next) => {
    req.rawBody = req.body;
    next();
  },
  paymentController.stripeWebhook,
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

if (config.env !== 'test') {
  app.use(morgan(config.env === 'production' ? 'combined' : 'dev', { stream: logger.stream }));
}

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy', data: { timestamp: new Date() } });
});

app.use(`/api/${config.apiVersion}`, apiLimiter, routes);

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Food Delivery API Docs',
  }),
);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Food Delivery API is running',
    data: {
      docs: '/api-docs',
      health: '/health',
      apiHealth: `/api/${config.apiVersion}/health`,
    },
  });
});

app.use(notFoundHandler);
app.use(convertToApiError);
app.use(errorHandler);

module.exports = app;
