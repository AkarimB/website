import express from 'express';
import { getLoginPage, postLogin, logout, postRegister, getRegisterPage } from '../controllers/authController.js';
import csrf from 'csrf';
import svgCaptcha from 'svg-captcha';

const router = express.Router();
const tokens = csrf();

const csrfProtection = (req, res, next) => {
    if (!req.session.csrfSecret) {
        req.session.csrfSecret = tokens.secretSync();
    }
    req.csrfToken = () => tokens.create(req.session.csrfSecret);
    if (req.method === 'POST') {
        const token = req.body._csrf;
        if (!tokens.verify(req.session.csrfSecret, token)) {
            return res.status(403).send('Invalid CSRF Token');
        }
    }
    next();
};

router.get('/captcha', (req, res) => {
    const captcha = svgCaptcha.create();
    req.session.captcha = captcha.text;
    res.type('svg');
    res.status(200).send(captcha.data);
});

router.get('/login', csrfProtection, getLoginPage);
router.post('/login', csrfProtection, async (req, res, next) => {
    try {
        await postLogin(req, res);
    } catch (error) {
        next(error);
    }
});
router.get('/register', csrfProtection, getRegisterPage);
router.post('/register', csrfProtection, async (req, res, next) => {
    try {
        await postRegister(req, res);
    } catch (error) {
        next(error);
    }
});
router.get('/logout', logout);

export default router;
