import express from 'express';
import { getUpload, handleUpload } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/', getUpload, handleUpload);

export default router;
