import express from 'express';
import { listPost, getPostEdit, newPost } from '../controllers/postController.js';
import { typeList } from '../../../shared/constants.js';

const router = express.Router();

router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
});

router.get('/list/:type/:lang{/:currentPageId}', async (req, res, next) => {
    const { type } = req.params;
    if (typeList.includes(type)) {
        try {
            await listPost(req, res);
        } catch (error) {
            next(error);
        }
    } else {
        res.status(404).send('Not found');
    }
});

router.get('/add/:type/:lang', async (req, res, next) => {
    const { type } = req.params;
    if (typeList.includes(type)) {
        return newPost(req, res).catch(next);
    }
    res.status(404).send('Type not supported');
});

router.get('/edit/:type/:lang/:id', async (req, res, next) => {
    const { type, id } = req.params;
    if (typeList.includes(type) && !isNaN(id)) {
        return getPostEdit(req, res).catch(next);
    }
    res.status(404).send('Invalid ID or Type');
});

export default router;
