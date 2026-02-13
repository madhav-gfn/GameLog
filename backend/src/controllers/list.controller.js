import * as listService from '../services/list.service.js';

export async function createList(req, res, next) {
    try {
        const list = await listService.createList(req.user.id, req.body);
        res.status(201).json({ success: true, data: list });
    } catch (error) {
        next(error);
    }
}

export async function getUserLists(req, res, next) {
    try {
        const { page = 1, limit = 20 } = req.query;
        const requesterId = req.user?.id || null;
        const result = await listService.getUserLists(req.params.userId, requesterId, parseInt(page), parseInt(limit));
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
}

export async function getList(req, res, next) {
    try {
        const requesterId = req.user?.id || null;
        const list = await listService.getListById(req.params.id, requesterId);
        res.json({ success: true, data: list });
    } catch (error) {
        next(error);
    }
}

export async function updateList(req, res, next) {
    try {
        const list = await listService.updateList(req.params.id, req.user.id, req.body);
        res.json({ success: true, data: list });
    } catch (error) {
        next(error);
    }
}

export async function deleteList(req, res, next) {
    try {
        await listService.deleteList(req.params.id, req.user.id);
        res.json({ success: true, message: 'List deleted' });
    } catch (error) {
        next(error);
    }
}

export async function addItem(req, res, next) {
    try {
        const { gameId, note } = req.body;
        const item = await listService.addItemToList(req.params.id, req.user.id, gameId, note);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
}

export async function removeItem(req, res, next) {
    try {
        await listService.removeItemFromList(req.params.id, req.user.id, req.params.gameId);
        res.json({ success: true, message: 'Item removed' });
    } catch (error) {
        next(error);
    }
}

export async function reorderItems(req, res, next) {
    try {
        await listService.reorderItems(req.params.id, req.user.id, req.body.items);
        res.json({ success: true, message: 'Items reordered' });
    } catch (error) {
        next(error);
    }
}
