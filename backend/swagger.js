const swaggerJSDoc = require('swagger-jsdoc');
const config = require('./src/config');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Food Delivery API',
      version: '1.0.0',
      description:
        'Production-ready REST API for a food delivery platform supporting customers, restaurants, delivery partners and admins.',
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/${config.apiVersion}`,
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['customer', 'restaurant', 'admin', 'delivery'] },
          },
        },
        Restaurant: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            isOpen: { type: 'boolean' },
            isApproved: { type: 'boolean' },
          },
        },
        Food: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'number' },
            isVeg: { type: 'boolean' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            orderNumber: { type: 'string' },
            status: { type: 'string' },
            total: { type: 'number' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Registration, login, OTP and password management' },
      { name: 'Users', description: 'User profile management' },
      { name: 'Restaurants', description: 'Restaurant CRUD, search and management' },
      { name: 'Foods', description: 'Food catalogue, variants and addons' },
      { name: 'Categories', description: 'Food and restaurant categories' },
      { name: 'Cart', description: 'Shopping cart management' },
      { name: 'Orders', description: 'Order placement, tracking and status updates' },
      { name: 'Addresses', description: 'Customer delivery addresses' },
      { name: 'Wishlist', description: 'Favorite foods' },
      { name: 'Favorites', description: 'Favorite restaurants' },
      { name: 'Coupons', description: 'Discount coupons' },
      { name: 'Reviews', description: 'Restaurant and food reviews and ratings' },
      { name: 'Payments', description: 'Razorpay, Stripe and COD payments' },
      { name: 'Banners', description: 'Home screen banners' },
      { name: 'Offers', description: 'Promotional offers' },
      { name: 'Notifications', description: 'User notifications' },
      { name: 'Delivery', description: 'Delivery partner operations' },
      { name: 'Admin', description: 'Admin dashboard, analytics and CMS' },
      { name: 'Uploads', description: 'File uploads via Cloudinary' },
      { name: 'Settings', description: 'Application settings' },
    ],
  },
  // JSDoc annotations live on route files; no separate OpenAPI YAML required.
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
