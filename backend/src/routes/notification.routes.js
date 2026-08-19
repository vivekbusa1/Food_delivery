const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authenticate);

router.get('/', notificationController.listNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

router.post('/broadcast', authorize(ROLES.ADMIN), notificationController.sendBroadcast);

module.exports = router;
