import * as notificationService from '../services/notification.service.js';

export async function getNotifications(req, res, next) {
    try {
        const { page = 1, limit = 20 } = req.query;
        const result = await notificationService.getNotifications(req.user.id, parseInt(page), parseInt(limit));
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
}

export async function markAsRead(req, res, next) {
    try {
        await notificationService.markAsRead(req.params.id, req.user.id);
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        next(error);
    }
}

export async function markAllAsRead(req, res, next) {
    try {
        await notificationService.markAllAsRead(req.user.id);
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
}
