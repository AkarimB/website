import express from 'express';
import { sendData, purgeCache } from '../controllers/dataController.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        await sendData(req, res);
    } catch (error) {
        console.error('Error submitting data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/purge', async (req, res) => {
    try {
        await purgeCache(req, res);
    } catch (error) {
        console.error('Error in cache purge:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
