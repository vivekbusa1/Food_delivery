const Notification = require('../models/Notification');
const logger = require('../utils/logger');

let socketModule = null;
const getSocketModule = () => {
  if (!socketModule) {
    // Lazy require to avoid circular dependency between socket and services.
    // eslint-disable-next-line global-require
    socketModule = require('../socket');
  }
  return socketModule;
};

const createNotification = async ({ userId = null, role = null, title, message, type = 'system', data = {} }) => {
  const notification = await Notification.create({
    user: userId,
    role,
    title,
    message,
    type,
    data,
  });

  try {
    const { emitToUser, emitToRole } = getSocketModule();
    if (userId) {
      emitToUser(userId.toString(), 'notification:new', notification);
    } else if (role) {
      emitToRole(role, 'notification:new', notification);
    }
  } catch (error) {
    logger.warn(`Socket emit skipped for notification: ${error.message}`);
  }

  return notification;
};

const notifyOrderStatusChange = async (order) => {
  const title = 'Order Update';
  const message = `Your order ${order.orderNumber} is now ${order.status.replace(/_/g, ' ')}`;

  await createNotification({
    userId: order.user,
    title,
    message,
    type: 'order',
    data: { orderId: order._id, status: order.status },
  });

  try {
    const { emitOrderStatus } = getSocketModule();
    emitOrderStatus(order);
  } catch (error) {
    logger.warn(`Socket emit skipped for order status: ${error.message}`);
  }
};

const notifyNewOrder = async (order, restaurantOwnerId) => {
  await createNotification({
    userId: restaurantOwnerId,
    title: 'New Order Received',
    message: `You have received a new order ${order.orderNumber}`,
    type: 'order',
    data: { orderId: order._id },
  });

  try {
    const { emitToRestaurant } = getSocketModule();
    emitToRestaurant(order.restaurant.toString(), 'order:new', {
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    logger.warn(`Socket emit skipped for new order: ${error.message}`);
  }
};

const notifyDeliveryPartnerAssigned = async (order, deliveryPartnerUserId, deliveryPartnerId) => {
  await createNotification({
    userId: deliveryPartnerUserId,
    title: 'New Delivery Assigned',
    message: `You have been assigned order ${order.orderNumber}`,
    type: 'delivery',
    data: { orderId: order._id },
  });

  try {
    const { emitToDeliveryPartner } = getSocketModule();
    emitToDeliveryPartner(deliveryPartnerId?.toString(), 'delivery:assigned', {
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    logger.warn(`Socket emit skipped for delivery assignment: ${error.message}`);
  }
};

module.exports = {
  createNotification,
  notifyOrderStatusChange,
  notifyNewOrder,
  notifyDeliveryPartnerAssigned,
};
