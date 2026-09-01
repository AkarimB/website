import { langList, domain } from '../../../shared/constants.js';

export function getLangUrl(lang) {
    return lang == "fr" ? "/" : `/${lang}/`;
}

export function getSlg(lang) {
    return lang == 'ar' ? 'ar' : 'fr';
}

export function sanitizeArabic(q) {
    if (q && typeof q === 'string') {
        return q.replace(/[\u0617-\u061A\u064B-\u0652]/g, "");
    }
    return q;
}

export function buildPagination(lang, currentPageId, numberPerPage, messagesCount, baseUrl, q) {
    let previousPageLink = "", nextPageLink = "";
    const previousPageId = currentPageId - 1;
    const nextPageId = currentPageId + 1;
    const langUrl = getLangUrl(lang);
    const append = q ? `?q=${q}` : '';

    if (previousPageId === 0) {
        previousPageLink = `<a href="${langUrl}${append}">❮ </a>`;
    } else if (previousPageId > 0) {
        previousPageLink = `<a href="${langUrl}p/${previousPageId}/${append}">❮ </a>`;
    }

    if (messagesCount >= numberPerPage) {
        nextPageLink = `<a href="${langUrl}p/${nextPageId}/${append}"> ❯</a>`;
    }

    return `<div class="lin">${previousPageLink} ${nextPageLink}</div>`;
}

export function redirectToPage(loc, res) {
    res.writeHead(302, { Location: loc });
    res.end();
}

export function isValidLang(lang) {
    return lang && langList.includes(lang);
}

export function sanitizeQuery(q) {
    if (q && typeof q === 'string') {
        return q.replace(/["'()<>+\-@~*%]/gi, ' ');
    }
    return q;
}

export function qsearch(q, tag) {
    const fragments = [];
    const params = [];
    if (q && q.trim() !== "") {
        const qlist = q.split(" ");
        for (const word of qlist) {
            fragments.push(`${tag} LIKE ?`);
            params.push(`%${word}%`);
        }
        return { where: `WHERE ${fragments.join(' AND ')}`, params };
    }
    return { where: "", params: [] };
}

