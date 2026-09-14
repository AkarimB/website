// API server — JSON API for site data (port 8010)
// Serves posts, messages, numbers, and other content types

import express from 'express';
import dotenv from 'dotenv';
import routes from '../modules/api/routes/api.js';
import { sendAlert } from '../shared/alert.js';

dotenv.config();

const app = express();
app.disable('x-powered-by');
const port = process.env.API_PORT || 8010;

app.use('/', routes);

app.use((err, req, res, next) => {
    if (err instanceof URIError) {
        return res.status(400).json({ error: 'Bad Request' });
    }
    console.error('Unhandled API error:', err);
    sendAlert('API Unhandled Error', `${err.message}\n${err.stack}`);
    res.status(500).json({ error: 'Internal Server Error' });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    sendAlert('API Uncaught Exception', `${err.message}\n${err.stack}`);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    sendAlert('API Unhandled Rejection', String(reason));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
