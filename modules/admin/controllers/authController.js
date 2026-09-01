import bcrypt from 'bcrypt';
import i18n from 'i18n';
import { getApiSession } from '../../../shared/database.js';
import { sendAlert } from '../../../shared/alert.js';
import { loginHtml, adminHtml, registerHtml } from '../utils/htmlTemplates.js';

const t = (req, phrase) => {
  const lang = req.session?.adminLang || req.query?.lang || 'en';
  return i18n.__({ phrase, locale: lang });
};

export const getLoginPage = (req, res) => {
  const lang = req.session?.adminLang || req.query?.lang || 'en';
  const notif = '';
  const user = '';
  const pass = '';
  const csrfToken = req.csrfToken();
  res.send(loginHtml(notif, user, pass, csrfToken, lang));
};

export const getRegisterPage = (req, res) => {
  const lang = req.session?.adminLang || req.query?.lang || 'en';
  const notif = '';
  const username = '';
  const password = '';
  const email = '';
  const full_name = '';
  const csrfToken = req.csrfToken();
  res.send(registerHtml(notif, username, password, email, full_name, csrfToken, lang));
};

export const getLogged = (req, res) => {
  const lang = req.query.lang || req.session?.adminLang || 'en';
  req.session.adminLang = lang;
  res.send(adminHtml(lang));
};

export const postRegister = async (req, res) => {
  let session;
  try {
    const { username, email, full_name, password, captcha } = req.body;
    const lang = req.session?.adminLang || req.query?.lang || 'en';

    if (!req.session.captcha || req.session.captcha !== captcha) {
      const notif = `<p class="error">${t(req, 'captchaError')}</p>`;
      const csrfToken = req.csrfToken();
      return res.send(registerHtml(notif, username, password, email, full_name, csrfToken, lang));
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?;:&])[A-Za-z\d@$!%*?;:&]{8,}$/;
    if (!passwordRegex.test(password)) {
      const notif = `<p class="error">${t(req, 'passwordValidationHint')}</p>`;
      const csrfToken = req.csrfToken();
      return res.send(registerHtml(notif, username, password, email, full_name, csrfToken, lang));
    }

    session = await getApiSession();
    const schema = session.getDefaultSchema();
    const usersCollection = schema.getTable('users');

    const existingUser = await usersCollection
      .select(['id'])
      .where('username = :username OR email = :email')
      .bind('username', username)
      .bind('email', email)
      .execute();

    const existingUserRow = await existingUser.fetchOne();
    if (existingUserRow) {
      const notif = `<p class="error">${t(req, 'userExistsError')}</p>`;
      const csrfToken = req.csrfToken();
      return res.send(registerHtml(notif, username, password, email, full_name, csrfToken, lang));
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await usersCollection.insert('username', 'password_hash', 'email', 'full_name', 'role')
      .values(username, passwordHash, email, full_name, 'user')
      .execute();

    res.redirect('/idara/login?lang=' + lang);

  } catch (error) {
    console.error('Error in postRegister:', error);
    sendAlert('Admin postRegister Error', `${error.message}\nFunction: postRegister`);
    const lang = req.session?.adminLang || req.query?.lang || 'en';
    const notif = `<p class="error">${t(req, 'registerError')}</p>`;
    const csrfToken = req.csrfToken();
    res.send(registerHtml(notif, '', '', '', '', csrfToken, lang));
  } finally {
    if (session) await session.close();
  }
};

export const postLogin = async (req, res) => {
  let session;
  try {
    const { username, password, captcha } = req.body;
    const lang = req.session?.adminLang || req.query?.lang || 'en';

    if (!req.session.captcha || req.session.captcha !== captcha) {
      const notif = `<p class="error">${t(req, 'captchaError')}</p>`;
      const csrfToken = req.csrfToken();
      return res.send(loginHtml(notif, username, '', csrfToken, lang));
    }

    session = await getApiSession();
    const schema = session.getDefaultSchema();
    const usersCollection = schema.getTable('users');

    const result = await usersCollection
      .select(['id', 'username', 'password_hash', 'role'])
      .where('username = :username')
      .bind('username', username)
      .execute();

    const userRow = await result.fetchOne();

    if (!userRow) {
      const notif = `<p class="error">${t(req, 'userNotExist')}</p>`;
      const csrfToken = req.csrfToken();
      return res.send(loginHtml(notif, username, '', csrfToken, lang));
    }

    const isValidPassword = await bcrypt.compare(password, userRow[2]);

    if (!isValidPassword) {
      const notif = `<p class="error">${t(req, 'invalidPassword')}</p>`;
      const csrfToken = req.csrfToken();
      return res.send(loginHtml(notif, username, '', csrfToken, lang));
    }

    const userRole = userRow[3];
    if (userRole !== 'admin' && userRole !== 'moderator') {
      const notif = `<p class="error">${t(req, 'userNotAllowed')}</p>`;
      const csrfToken = req.csrfToken();
      return res.send(loginHtml(notif, username, '', csrfToken, lang));
    }

    req.session.user = {
      id: userRow[0],
      username: userRow[1],
      role: userRole
    };

    req.session.save((err) => {
        if (err) {
            console.error("Session save error:", err);
            return res.redirect('/idara/login');
        }
        res.redirect('/idara/admin/logged?lang=' + lang);
    });

  } catch (error) {
    console.error('Error in postLogin:', error);
    sendAlert('Admin postLogin Error', `${error.message}\nFunction: postLogin`);
    const lang = req.session?.adminLang || req.query?.lang || 'en';
    const notif = `<p class="error">${t(req, 'loginError')}</p>`;
    const csrfToken = req.csrfToken();
    res.send(loginHtml(notif, '', '', csrfToken, lang));
  } finally {
    if (session) await session.close();
  }
};

export const logout = (req, res) => {
  const lang = req.session?.adminLang || 'en';
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: i18n.__({ phrase: 'logoutError', locale: lang }) });
    }
    res.redirect('/idara/login');
  });
};
