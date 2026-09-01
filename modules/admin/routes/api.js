import express from 'express';
import { getPostData, getNextOrd } from '../controllers/apiEditController.js';
import { getPosts } from '../controllers/apiListController.js';
import { typeList } from '../../../shared/constants.js';

const router = express.Router();

router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
});

router.get('/edit/:type/:lang/:id', async (req, res, next) => {
    const { type } = req.params;
    if (typeList.includes(type)) {
        try {
            await getPostData(req, res);
        } catch (error) {
            next(error);
        }
    } else {
        res.status(404).json({ error: 'Type not found' });
    }
});

router.get('/next-ord/:type/:lang', async (req, res, next) => {
    const { type } = req.params;
    if (typeList.includes(type)) {
        try {
            await getNextOrd(req, res);
        } catch (error) {
            next(error);
        }
    } else {
        res.status(404).json({ error: 'Type not found' });
    }
});

router.get('/list/:type/:lang{/:currentPageId}', async (req, res, next) => {
    const { type } = req.params;
    if (typeList.includes(type)) {
        try {
            await getPosts(req, res);
        } catch (error) {
            next(error);
        }
    } else {
        res.status(404).json({ error: 'Type not found' });
    }
});

export default router;
