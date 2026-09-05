// Site server — Public-facing Express server (port 8000)
// Serves blog posts with i18n, pagination, and SEO metadata

import express from 'express';
import dotenv from 'dotenv';
import i18n from 'i18n';
import path from 'path';
import { fileURLToPath } from 'url';
import { langList } from '../shared/constants.js';
import siteRoutes from '../modules/site/routes/site.js';
import { sendAlert } from '../shared/alert.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hostname = '127.0.0.1';
const port = 8000;

const app = express();
app.disable('x-powered-by');

app.use(express.static(path.join(__dirname, '..', 'public')));

i18n.configure({
    locales: langList,
    directory: path.join(__dirname, '..', 'locales'),
    defaultLocale: 'en',
    objectNotation: true,
    register: global,
});

app.use('/', siteRoutes);

app.use((err, req, res, next) => {
    if (err instanceof URIError) {
        return res.status(400).send('Bad Request');
    }
    console.error('Unhandled Site error:', err);
    sendAlert('Site Unhandled Error', `${err.message}\n${err.stack}`);
    res.status(500).send('Internal Server Error');
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    sendAlert('Site Uncaught Exception', `${err.message}\n${err.stack}`);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    sendAlert('Site Unhandled Rejection', String(reason));
});

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

export default app;
