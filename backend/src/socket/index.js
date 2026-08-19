const { Server } = require('socket.io');
const { verifyAccessToken } = require('../config/jwt');
const config = require('../config');
const logger = require('../utils/logger');
const { ROLES } = require('../constants/roles');

let io = null;

const userSocketMap = new Map();

const joinOwnershipRooms = async (socket) => {
  try {
    // Lazy require to avoid circular dependency issues at module load time.
    // eslint-disable-next-line global-require
    const User = require('../models/User');
    const user = await User.findById(socket.userId).select('restaurant deliveryPartner role');
    if (!user) return;

    if (user.role === ROLES.RESTAURANT && user.restaurant) {
      socket.join(`restaurant:${user.restaurant.toString()}`);
    }

    if (user.role === ROLES.DELIVERY && user.deliveryPartner) {
      socket.join(`delivery:${user.deliveryPartner.toString()}`);
    }
  } catch (error) {
    logger.warn(`Socket ownership room join skipped: ${error.message}`);
  }
};

const initSocket = (httpServer) => {
  const allowedOrigins =
    config.clientUrl === '*'
      ? '*'
      : config.clientUrl.split(',').map((o) => o.trim()).filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins === '*') {
          return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        if (
          config.env !== 'production' &&
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        ) {
          return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication token is missing'));
      }

      const decoded = verifyAccessToken(token);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      return next();
    } catch (error) {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (user: ${socket.userId})`);

    if (socket.userId) {
      if (!userSocketMap.has(socket.userId)) {
        userSocketMap.set(socket.userId, new Set());
      }
      userSocketMap.get(socket.userId).add(socket.id);
      // "user" room: direct, per-account notifications (order updates, alerts, etc.)
      socket.join(`user:${socket.userId}`);
    }

    if (socket.userRole) {
      // "role" room: broadcasts targeted at every user of a given role (e.g. all admins)
      socket.join(`role:${socket.userRole}`);
    }

    // "restaurant"/"delivery" rooms: broadcasts scoped to a specific restaurant or
    // delivery partner profile, regardless of which staff account is connected.
    joinOwnershipRooms(socket);

    socket.on('order:join', (orderId) => {
      // "order" room: live tracking updates for a single order.
      if (orderId) socket.join(`order:${orderId}`);
    });

    socket.on('order:leave', (orderId) => {
      if (orderId) socket.leave(`order:${orderId}`);
    });

    socket.on('delivery:location', (data) => {
      if (data?.orderId && data?.lat !== undefined && data?.lng !== undefined) {
        io.to(`order:${data.orderId}`).emit('delivery:location:update', {
          orderId: data.orderId,
          lat: data.lat,
          lng: data.lng,
        });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      if (socket.userId && userSocketMap.has(socket.userId)) {
        userSocketMap.get(socket.userId).delete(socket.id);
        if (userSocketMap.get(socket.userId).size === 0) {
          userSocketMap.delete(socket.userId);
        }
      }
    });
  });

  logger.info('Socket.io initialized');
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call initSocket(server) first.');
  }
  return io;
};

const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};

const emitToRole = (role, event, payload) => {
  if (!io) return;
  io.to(`role:${role}`).emit(event, payload);
};

const emitToRestaurant = (restaurantId, event, payload) => {
  if (!io || !restaurantId) return;
  io.to(`restaurant:${restaurantId}`).emit(event, payload);
};

const emitToDeliveryPartner = (deliveryPartnerId, event, payload) => {
  if (!io || !deliveryPartnerId) return;
  io.to(`delivery:${deliveryPartnerId}`).emit(event, payload);
};

const emitOrderStatus = (order) => {
  if (!io) return;
  io.to(`order:${order._id}`).emit('order:status', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    updatedAt: new Date(),
  });
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToRole,
  emitToRestaurant,
  emitToDeliveryPartner,
  emitOrderStatus,
};
