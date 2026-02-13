import express from 'express';
import { createList, getUserLists, getList, updateList, deleteList, addItem, removeItem, reorderItems } from '../controllers/list.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

// POST /api/lists — create list (protected)
router.post('/',
    requireAuth,
    validate({
        body: {
            title: { required: true, type: 'string', minLength: 1, maxLength: 100 },
            description: { required: false, type: 'string', maxLength: 500 },
            type: { required: false, type: 'string', enum: ['CUSTOM', 'FAVORITES', 'RECOMMENDATIONS', 'YEAR_END'] },
            isPublic: { required: false, type: 'boolean' },
        },
    }),
    createList
);

// GET /api/lists/user/:userId — get user's lists
router.get('/user/:userId', getUserLists);

// GET /api/lists/:id — get list detail
router.get('/:id', getList);

// PUT /api/lists/:id — update list (protected)
router.put('/:id',
    requireAuth,
    validate({
        body: {
            title: { required: false, type: 'string', minLength: 1, maxLength: 100 },
            description: { required: false, type: 'string', maxLength: 500 },
            type: { required: false, type: 'string', enum: ['CUSTOM', 'FAVORITES', 'RECOMMENDATIONS', 'YEAR_END'] },
            isPublic: { required: false, type: 'boolean' },
        },
    }),
    updateList
);

// DELETE /api/lists/:id — delete list (protected)
router.delete('/:id', requireAuth, deleteList);

// POST /api/lists/:id/items — add item (protected)
router.post('/:id/items',
    requireAuth,
    validate({
        body: {
            gameId: { required: true, type: 'string' },
            note: { required: false, type: 'string', maxLength: 300 },
        },
    }),
    addItem
);

// DELETE /api/lists/:id/items/:gameId — remove item (protected)
router.delete('/:id/items/:gameId', requireAuth, removeItem);

// PUT /api/lists/:id/items/reorder — reorder items (protected)
router.put('/:id/items/reorder',
    requireAuth,
    validate({
        body: {
            items: { required: true, type: 'array' },
        },
    }),
    reorderItems
);

export default router;
