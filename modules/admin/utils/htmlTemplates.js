'use strict';
import i18n from 'i18n';

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const loginHtml = (notif, user, pass, csrfToken, lang = 'en') => {
  const t = (phrase) => i18n.__({ phrase, locale: lang });
  const escapedUser = escapeHtml(user);
  const cssLang = (lang === 'ar') ? 'ar' : 'fr';
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <link rel="icon" type="image/png" href="/favicon.png">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t('loginTitle')}</title>
    <link type="text/css" rel="stylesheet" href="/style_${cssLang}.css?v=12">
    <meta name="description" content="${t('loginTitle')}">
    <style>
      .input-container { position: relative; }
      .input-container svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; }
      .input-container input { padding-left: 30px; }
    </style>
  </head>
  <body>
    <div class="login">
      ${notif}
      <form method="POST">
        <input type="hidden" name="_csrf" value="${csrfToken}">
        <div class="input-container">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16" fill="currentColor"><path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/></svg>
          <input type="text" id="username" name="username" value="${escapedUser}" required placeholder="${t('usernamePlaceholder')}">
        </div>
        <div class="input-container">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16" fill="currentColor"><path d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z"/></svg>
          <input type="password" id="password" name="password" required placeholder="${t('passwordPlaceholder')}">
        </div>
        <img src="/idara/captcha" alt="CAPTCHA" />
        <input type="text" name="captcha" required placeholder="${t('captchaPlaceholder')}">
        <button class="saveButton" type="submit">${t('loginButton')}</button>
      </form>
    </div>
  </body>
</html>`;
};

export const registerHtml = (notif, username, password, email, full_name, csrfToken, lang = 'en') => {
  const t = (phrase) => i18n.__({ phrase, locale: lang });
  const escapedUsername = escapeHtml(username);
  const escapedEmail = escapeHtml(email);
  const escapedFullName = escapeHtml(full_name);
  const cssLang = (lang === 'ar') ? 'ar' : 'fr';
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <link rel="icon" type="image/png" href="/favicon.png">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t('registerTitle')}</title>
    <link type="text/css" rel="stylesheet" href="/style_${cssLang}.css?v=1">
    <meta name="description" content="${t('registerTitle')}">
    <script>
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?;:&])[A-Za-z\\d@$!%*?;:&]{8,}$/;
      function validatePassword() {
        const pass = document.getElementById('password').value;
        const message = document.getElementById('passwordMessage');
        if (!regex.test(pass)) {
          message.textContent = '${t('passwordValidationHint')}';
          return false;
        }
        message.textContent = '';
        return true;
      }
      function togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleButton = document.getElementById('togglePassword');
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          toggleButton.textContent = '${t('hidePassword')}';
        } else {
          passwordInput.type = 'password';
          toggleButton.textContent = '${t('showPassword')}';
        }
      }
    </script>
    <style>
      .input-container { position: relative; }
      .input-container i { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; }
      .input-container input { padding-left: 30px; }
    </style>
  </head>
  <body>
    <div class="login">
      ${notif}
      <form method="POST" onsubmit="return validatePassword()">
        <input type="hidden" name="_csrf" value="${csrfToken}">
        <input type="text" id="username" name="username" value="${escapedUsername}" required placeholder="${t('usernamePlaceholder')}">
        <input type="email" id="email" name="email" value="${escapedEmail}" required placeholder="${t('emailPlaceholder')}">
        <input type="text" id="full_name" name="full_name" value="${escapedFullName}" required placeholder="${t('fullNamePlaceholder')}">
        <input type="password" id="password" name="password" required placeholder="${t('passwordPlaceholder')}" oninput="">
        <button type="button" id="togglePassword" onclick="togglePasswordVisibility()">${t('showPassword')}</button>
        <div><img src="/idara/captcha" alt="CAPTCHA" /></div>
        <input type="text" name="captcha" required placeholder="${t('captchaPlaceholder')}">
        <p id="passwordMessage" style="color:red;"></p>
        <button class="saveButton" type="submit">${t('registerButton')}</button>
      </form>
    </div>
  </body>
</html>`;
};

export const adminHtml = (lang = null) => {
  const currentLang = lang || 'en';
  const t = (phrase) => i18n.__({ phrase, locale: currentLang });
  const floatDirection = (currentLang === 'ar') ? 'left' : 'right';
  const cssLang = (lang === 'ar') ? 'ar' : 'fr';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="icon" type="image/png" href="/favicon.png">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t('adminTitle')}</title>
  <link type="text/css" rel="stylesheet" href="/style_${cssLang}.css?v=1">
  <meta name="description" content="${t('adminTitle')}">
  <script>
    (function() {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      const savedLang = localStorage.getItem('adminLang');
      const currentServerLang = '${currentLang}';
      if (urlLang && urlLang !== savedLang) {
        localStorage.setItem('adminLang', urlLang);
        return;
      }
      if (!urlLang && savedLang && savedLang !== currentServerLang) {
        window.location.href = '/idara/admin/logged?lang=' + savedLang;
      }
    })();
    function changeLang(newLang) {
      localStorage.setItem('adminLang', newLang);
      window.location.href = '/idara/admin/logged?lang=' + newLang;
    }
  </script>
  <style>
    .lang-selector { float: ${floatDirection}; margin: 10px; }
    .lang-selector select { padding: 5px; font-size: 14px; }
    .logout-btn { float: ${floatDirection}; margin: 10px; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; color: var(--text); }
    .logout-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; }
  </style>
</head>
<body>
  <div class="adm">
  <div class="lang-selector">
    <select onchange="changeLang(this.value)" value="${currentLang}">
      <option value="ar" ${currentLang === 'ar' ? 'selected' : ''}>العربية</option>
      <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English</option>
      <option value="es" ${currentLang === 'es' ? 'selected' : ''}>Español</option>
      <option value="fr" ${currentLang === 'fr' ? 'selected' : ''}>Français</option>
      <option value="pt" ${currentLang === 'pt' ? 'selected' : ''}>Português</option>
    </select>
  </div>
  <a href="/idara/logout" class="logout-btn">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    ${t('logout')}
  </a>
    <h1>${t('websiteSection')}</h1>
    <h2>${t('articlesForWeb')}</h2>
    <a target="_blank" href="/idara/admin/posts/add/post/${currentLang}">${t('addPost')}</a>
    <a target="_blank" href="/idara/admin/posts/list/post/${currentLang}/">${t('postsList')}</a>

    <h1>${t('applicationSection')}</h1>
    <h2>${t('messagesForApp')}</h2>
    <a target="_blank" href="/idara/admin/posts/add/dars/${currentLang}">${t('addMessage')}</a>
    <a target="_blank" href="/idara/admin/posts/list/dars/${currentLang}/">${t('messagesList')}</a>
    <h2>${t('invocationsForApp')}</h2>
    <a target="_blank" href="/idara/admin/posts/add/dua/${currentLang}">${t('addInvocations')}</a>
    <a target="_blank" href="/idara/admin/posts/list/dua/${currentLang}/">${t('invocationsList')}</a>
    <h2>${t('datedMessagesForApp')}</h2>
    <a target="_blank" href="/idara/admin/posts/add/date/${currentLang}">${t('addMessage')}</a>
    <a target="_blank" href="/idara/admin/posts/list/date/${currentLang}/">${t('messagesList')}</a>
    <h2>${t('nmbrSection')}</h2>
    <a target="_blank" href="/idara/admin/posts/edit/nmbr/en/3">${t('nmbrEnglish')}</a>
    <a target="_blank" href="/idara/admin/posts/edit/nmbr/fr/2">${t('nmbrFrench')}</a>
    <a target="_blank" href="/idara/admin/posts/edit/nmbr/ar/1">${t('nmbrArabic')}</a>
    <a target="_blank" href="/idara/admin/posts/edit/nmbr/es/4">${t('nmbrSpanish')}</a>
    <a target="_blank" href="/idara/admin/posts/edit/nmbr/pt/5">${t('nmbrPortuguese')}</a>
  </div>
</body>
</html>`;
};

export const postHtml = (infoAdd, type, link, hiddenInput, title, descr, content, url, tags, pub, ord, lang = 'en') => {
  const t = (phrase) => i18n.__({ phrase, locale: lang });
  const descrInput = type == "post" ? `<textarea id="descr" name="descr" required="">${descr}</textarea>` : "";
  const tagsInput = type == "post" ? `<textarea id="tags" name="tags" required="">${tags}</textarea>` : "";
  const cssLang = (lang === 'ar') ? 'ar' : 'fr';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="icon" type="image/png" href="/favicon.png">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t('postTitle')}${title}</title>
  <link type="text/css" rel="stylesheet" href="/style_${cssLang}.css?v=1">
  <meta name="description">
  <script src="/editor/ckeditor.js?v=1"></script>
  <script src="/form.js?v=1" defer></script>
</head>
<body>
  <div class="admin">
    <p id="notifMsg1"></p>
    ${link}
    ${infoAdd}
    <form autocomplete="off">
      <input type="number" step="any" value="${ord}" id="ord" name="ord" placeholder="${t('orderPlaceholder')}" required="">
      <input type="text" value="${title}" id="title" name="title" required="" placeholder="${t('titlePlaceholder')}">
      <input type="text" id="url" name="url" value="${url}" required="" placeholder="${t('urlPlaceholder')}">
      ${descrInput}
      <textarea name="content" id="content" required="">${content}</textarea>
      <script>CKEDITOR.replace("content", {contentsCss: "/editor/contents_${cssLang}.css"});</script>
      ${tagsInput}
      <input type="text" value="${pub}" id="pub" name="pub" required="" placeholder="${t('publishPlaceholder')}" maxlength="1">
      ${hiddenInput}
      <button type="button" class="saveButton" id="saveButton" onclick="sendData()">${t('saveButton')}</button>
      <button type="button" class="saveButton" id="purgeButton" onclick="purgeCache()">${t('purgeCache')}</button>
    </form>
    <button type="button" id="displayButton" onclick="displayData()">${t('displaySavedData')}</button>
    <p id="notifMsg"></p>
    <div id="savedData"></div>
    <button type="button" id="clearStorage" onclick="clearStorage()">${t('clearSavedData')}</button>
  </div>
</body>
</html>`;
};

export const nmbrHtml = (link, hiddenInput, ord, nb, nbd, nbm, pub, lang = 'en') => {
  const t = (phrase) => i18n.__({ phrase, locale: lang });
  const cssLang = (lang === 'ar') ? 'ar' : 'fr';
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="icon" type="image/png" href="/favicon.png">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t('nmbrPost')}</title>
  <link type="text/css" rel="stylesheet" href="/style_${cssLang}.css?v=1">
  <meta name="description" content="${t('nmbrPost')}">
  <script src="/form.js?v=1" defer></script>
</head>
<body>
  <div class="admin">
    <p id="notifMsg1"></p>
    ${link}
    <form autocomplete="off">
      <input type="number" id="ord" name="ord" value="${ord}" required="" placeholder="${t('orderPlaceholder')}" readonly>
      <input type="number" id="nb" name="nb" value="${nb}" required="" placeholder="${t('nbPlaceholder')}">
      <input type="number" id="nbd" name="nbd" value="${nbd}" placeholder="${t('nbdPlaceholder')}">
      <input type="text" id="nbm" name="nbm" value="${nbm}" placeholder="${t('nbmPlaceholder')}">
      <input type="text" value="${pub}" id="pub" name="pub" required="" placeholder="${t('publishPlaceholder')}" maxlength="1">
      ${hiddenInput}
      <button type="button" class="saveButton" id="saveButton" onclick="sendData()">${t('saveButton')}</button>
      <button type="button" class="saveButton" id="purgeButton" onclick="purgeCache()">${t('purgeCache')}</button>
    </form>
    <button type="button" id="displayButton" onclick="displayData()">${t('displaySavedData')}</button>
    <p id="notifMsg"></p>
    <div id="savedData"></div>
    <button type="button" id="clearStorage" onclick="clearStorage()">${t('clearSavedData')}</button>
  </div>
</body>
</html>`;
};

export const hiddenInputHtml = (id, type, lang) => {
  return `<input type="text" id="l" name="l" value="${lang}" readonly/> <input type="number" id="i" name="i" value="${id}" readonly/> <input type="text" id="t" name="t" value="${type}" readonly/> <input type="number" id="nmbSave" />`;
};

export const listPostHtml = (lang, siteTitle, siteDesc, menu, display, action, q, submit, infoM, paginationHtml, contentHtml, footer) => {
  const t = (phrase) => i18n.__({ phrase, locale: lang });
  const cssLang = (lang === 'ar') ? 'ar' : 'fr';
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <link rel="icon" type="image/png" href="/favicon.png">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteTitle}</title>
  <link type="text/css" rel="stylesheet" href="/style_${cssLang}.css?v=1">
  <meta name="description" content="${siteDesc}">
  <script src="/list.js?v=1" defer></script>
</head>
<body>
  ${menu}
  <div ${display} id="search">
    <form id="searchForm" method="GET" action="${action}">
      <input type="text" value="${q}" id="qInput" name="q" required="" placeholder="${t('submitSearch')}">
      <button class="subButton" type="submit"></button>
    </form>
  </div>
  ${infoM}
  <div id="paginationTop">${paginationHtml}</div>
  <div class="content">
    <h1>${siteTitle}</h1>
    <div id="postList">${contentHtml}</div>
  </div>
  <div id="paginationBottom">${paginationHtml}</div>
  ${footer}
</body>
</html>`;
};
