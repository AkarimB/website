import express from 'express';
const router = express.Router();
import { langList } from '../../../shared/constants.js';
import { listPost, getPost, getPostById } from '../controllers/siteController.js';

router.get('/', async (req, res) => {
    const { p, q } = req.query;
    if (p && !isNaN(p)) {
        await getPostById('fr', parseInt(p), res);
    } else {
        await listPost('fr', 0, q || '', res);
    }
});

router.get('/p/:pageId', async (req, res) => {
    const { pageId } = req.params;
    const { q } = req.query;
    await listPost('fr', parseInt(pageId), q || '', res);
});

router.get('/:lang/p/:pageId', async (req, res) => {
    const { lang, pageId } = req.params;
    const { q } = req.query;
    await listPost(lang, parseInt(pageId), q || '', res);
});

router.get('/:lang/:slug', async (req, res) => {
    const { lang, slug } = req.params;
    await getPost(lang, slug, res);
});

router.get('/:lang', async (req, res) => {
    const { lang } = req.params;
    const { p, q } = req.query;
    if (langList.includes(lang)) {
        if (q) {
            await listPost(lang, 0, q, res);
        } else if (p && !isNaN(p)) {
            await getPostById(lang, parseInt(p), res);
        } else {
            await listPost(lang, 0, '', res);
        }
    } else {
        await getPost('fr', lang, res);
    }
});

export default router;
