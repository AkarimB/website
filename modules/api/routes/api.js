import express from 'express';
const router = express.Router();
import { listPost, getPost, getApi, getVersion, getVersions, getElevation } from '../controllers/apiController.js';
import { langList, typeList } from '../../../shared/constants.js';

router.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Content-Type", "application/json; charset=utf-8");
    next();
});

router.get('/elevation', async (req, res, next) => {
    const { lat, lng } = req.query;
    try {
        await getElevation(lat, lng, res);
    } catch (error) {
        next(error);
    }
});

router.get('/list/post/:lang{/:pageId}', async (req, res, next) => {
    const { lang, pageId } = req.params;
    const { q, t = 'post' } = req.query;
    try {
        await listPost(t, lang, pageId, q, res);
    } catch (error) {
        next(error);
    }
});

router.get('/:type/:lang/:id', async (req, res, next) => {
    const { type, lang, id } = req.params;
    const { q } = req.query;

    if (typeList.includes(type) && langList.includes(lang)) {
        try {
            if (type === 'post') {
                await getPost(lang, id, res);
            } else {
                await getApi(lang, type, id, res, q);
            }
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

router.get('/v/:type/:lang', async (req, res, next) => {
    const { type, lang } = req.params;
    if (typeList.includes(type) && langList.includes(lang)) {
        try {
            await getVersions(lang, type, res);
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

router.get('/:type/:lang', async (req, res, next) => {
    const { type, lang } = req.params;

    if (typeList.includes(type) && langList.includes(lang) && type !== 'post') {
        try {
            await getVersion(lang, type, res);
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

router.get('/', async (req, res, next) => {
    const { l, t, o, q } = req.query;

    if (langList.includes(l) && typeList.includes(t)) {
        try {
            if (!isNaN(o)) {
                await getApi(l, t, o, res, q);
            } else {
                await getVersion(l, t, res);
            }
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.name || 'Internal Server Error',
        message: err.message || 'An unexpected error occurred'
    });
});

router.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource could not be found.'
    });
});

export default router;
