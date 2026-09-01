// Admin server — Express backend for site administration (port 8020)
// Sessions via Redis, auth with bcrypt/CAPTCHA/CSRF, multi-lang i18n

import express from 'express';
import session from 'express-session';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
import i18n from 'i18n';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { langList, domain } from '../shared/constants.js';
import { getLogged } from '../modules/admin/controllers/authController.js';
import { sendAlert } from '../shared/alert.js';
import authRoutes from '../modules/admin/routes/auth.js';
import uploadRoutes from '../modules/admin/routes/upload.js';
import dataRoutes from '../modules/admin/routes/data.js';
import postRoutes from '../modules/admin/routes/post.js';
import apiEditRoutes from '../modules/admin/routes/api.js';

// ESM __dirname polyfill
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 8020;

dotenv.config();

if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is required in .env');
}

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

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', 1);
app.use(i18n.init);

// Redis client for session store
const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
    },
    password: process.env.REDIS_PASSWORD,
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
    },
}));

// Public auth routes (login, logout, register)
app.use('/idara', authRoutes);

// Protected admin routes
const adminRouter = express.Router();

adminRouter.use((req, res, next) => {
    if (!req.session || !req.session.user) {
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        return res.redirect('/idara/login');
    }
    next();
});

adminRouter.get('/logged', getLogged);
adminRouter.use('/upload', uploadRoutes);
adminRouter.use('/data', dataRoutes);
adminRouter.use('/posts', postRoutes);
adminRouter.use('/api', apiEditRoutes);

app.use('/idara/admin', adminRouter);

// Legacy redirects
app.get('/idara-login', (req, res) => {
    res.redirect('/idara/logged');
});

app.get('/idara-logged', (req, res) => {
    res.redirect('/idara/logged');
});

app.use('/idarat', (req, res) => {
    res.redirect(301, req.originalUrl.replace('/idarat', '/idara'));
});

app.use((req, res) => {
    res.redirect(domain);
});

app.use((err, req, res, next) => {
    console.error('Unhandled Admin error:', err);
    sendAlert('Admin Unhandled Error', `${err.message}\n${err.stack}`);
    res.status(500).json({ error: 'Internal Server Error' });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    sendAlert('Admin Uncaught Exception', `${err.message}\n${err.stack}`);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    sendAlert('Admin Unhandled Rejection', String(reason));
});

redisClient.connect()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running on: http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to Redis, server not started:', err);
        sendAlert('Admin Redis Connection Failed', err.message);
    });
