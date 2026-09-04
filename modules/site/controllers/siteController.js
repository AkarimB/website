import i18n from 'i18n';
import { langList } from '../../../shared/constants.js';
import { getApiSession } from '../../../shared/database.js';
import { sendAlert } from '../../../shared/alert.js';
import { getLangUrl, getSlg, sanitizeArabic, sanitizeQuery, buildPagination, redirectToPage, qsearch } from '../utils/helpers.js';
import { buildMetaGraph, buildHiddenInputs, buildHeader, buildFooter, buildCarousel, buildPostCard, buildSearchForm } from '../utils/html.js';

async function listPost(lang, currentPageId, q, res) {
    if (!lang || !langList.includes(lang)) {
        return redirectToPage("/", res);
    }

    const rows = [];
    i18n.setLocale(lang);
    const submit = i18n.__('submitSearch');
    const loadMoreText = i18n.__('loadMore');

    let siteTitle = "", siteDesc = "", footer = "";
    const langUrl = getLangUrl(lang);
    const slg = getSlg(lang);

    if (lang === "ar" && q) {
        q = sanitizeArabic(q);
    }

    const numberPerPage = 12;
    currentPageId = parseInt(currentPageId);
    if (isNaN(currentPageId) || currentPageId == null || currentPageId < 0 || currentPageId > 100000) currentPageId = 0;
    const querryOffset = currentPageId * numberPerPage;

    const qSetting = `SELECT title, descr, footer FROM site_settings WHERE lang = ?`;
    const queryPrefix = `SELECT id, title, url, descr, ord FROM post`;

    let sessionMysql;
    let messagesCount = 0;

    try {
        sessionMysql = await getApiSession();

        await new Promise((resolve, reject) => {
            sessionMysql.sql(qSetting).bind(lang).execute(row => {
                if (row) {
                    siteTitle = row[0];
                    siteDesc = row[1];
                    footer = row[2];
                }
            }).then(resolve).catch(reject);
        });

        let query, params;
        if (q) {
            q = sanitizeQuery(q);
            const ftQuery = q.split(/\s+/).filter(w => w.length > 0).map(w => `${w}*`).join(' ');
            query = `SELECT id, title, url, descr, ord,
                MATCH(title, tags, descr) AGAINST(? IN BOOLEAN MODE) AS score
                FROM post
                WHERE lang = ? AND pub = 'p'
                AND MATCH(title, tags, descr) AGAINST(? IN BOOLEAN MODE)
                ORDER BY score DESC
                LIMIT ? OFFSET ?`;
            params = [ftQuery, lang, ftQuery, numberPerPage, querryOffset];
        } else {
            query = `${queryPrefix} WHERE lang = ? AND pub = "p" ORDER BY ord ASC LIMIT ? OFFSET ?`;
            params = [lang, numberPerPage, querryOffset];
        }

        await new Promise((resolve, reject) => {
            sessionMysql.sql(query).bind(...params).execute(row => {
                if (row != null) rows.push(row);
            }).then(resolve).catch(reject);
        });

        messagesCount = rows.length;
        let contentHtml = "";
        let paginationHtml = "";
        let loadButton = "";
        const display = q ? 'style="display: block;"' : "";

        if (messagesCount > 0) {
            for (let i = 0; i < messagesCount; i++) {
                contentHtml += buildPostCard(rows[i], lang, langUrl);
            }
        }

        if (messagesCount >= numberPerPage) {
            loadButton = `<button type="button" onclick="loadMore('normal', false)" id="loadMore">${loadMoreText}</button>`;
        }

        paginationHtml = buildPagination(lang, currentPageId, numberPerPage, messagesCount, langUrl, q);

        let ogUrl = `${langUrl}`;
        if (q) {
            siteTitle = `${q}. ${siteTitle}`;
            siteDesc = `${q}. ${siteDesc}`;
        }

        const metaGraph = buildMetaGraph({ siteTitle, siteDesc, ogUrl, lang });
        const hiddenInputs = buildHiddenInputs({ nextId: currentPageId, lang, transLoadMore: loadMoreText });
        const carouselHtml = buildCarousel(loadMoreText);

        let contentOrder;
        if (q && q.trim() !== '') {
            contentOrder = `${contentHtml}${loadButton}${carouselHtml}`;
        } else {
            contentOrder = `${carouselHtml}${contentHtml}${loadButton}`;
        }

        const html = `<!DOCTYPE html>
        <html lang="${lang}">
        <head>
            <meta charset="utf-8">
            <link rel="icon" type="image/png" href="/favicon.png">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${siteTitle}</title>
            <link type="text/css" rel="stylesheet" href="/style_${slg}.css?v=9">
            <meta name="description" content="${siteDesc}">
            ${metaGraph}
            <script src="/lazy.js?v=1" defer></script>
            <script src="/site.js?v=10" defer></script>
        </head>
        <body>
            ${buildHeader(lang)}
            ${buildSearchForm(langUrl, submit, q)}
            <div id="content" class="content">
                <h1>${siteTitle}</h1>
                <div id="featuredPost" class="featured-post"></div>
                ${contentOrder}
            </div>
            ${paginationHtml}
            ${buildFooter(footer, lang)}
            ${hiddenInputs}
        </body>
        </html>`;

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(html, 'utf-8');

    } catch (err) {
        console.log("listPost error: " + err.message);
        sendAlert('Site listPost Error', `${err.message}\nFunction: listPost\nLang: ${lang}`);
        redirectToPage(langUrl, res);
    } finally {
        if (sessionMysql) { try { await sessionMysql.close(); } catch {} }
    }
}

async function getPost(lang, url, res) {
    if (!lang || !langList.includes(lang)) {
        return redirectToPage("/", res);
    }

    let footer, nextId, nextTitle, loadButton = "";
    const slg = getSlg(lang);
    let result = null;
    let tagsBody = "", shortLink = "", preT = "", nexT = "";
    let tags = [], rows = [];
    let sessionMysql;
    const langUrl = getLangUrl(lang);

    i18n.setLocale(lang);
    const submit = i18n.__('submitSearch');

    const qSetting = `SELECT footer FROM site_settings WHERE lang = ?`;
    const query = `SELECT * FROM post WHERE url = ? AND lang = ? AND pub = "p"`;

    try {
        sessionMysql = await getApiSession();

        await new Promise((resolve, reject) => {
            sessionMysql.sql(query).bind(url, lang).execute(row => {
                if (row) result = row;
            }).then(resolve).catch(reject);
        });

        if (!result) {
            return redirectToPage(langUrl, res);
        }

        shortLink = `<p class='shortlink'>https://www.islam.ms${langUrl}?p=${result[0]}</p>`;

        await new Promise((resolve, reject) => {
            sessionMysql.sql(qSetting).bind(lang).execute(row => {
                if (row) {
                    footer = row[0];
                }
            }).then(resolve).catch(reject);
        });

        await new Promise((resolve, reject) => {
            const queryLimit = `SELECT * FROM (SELECT url, title, ord, id FROM post WHERE lang = ? AND ord < ? AND pub = "p" ORDER BY ord DESC LIMIT 1) a UNION ALL SELECT * FROM (SELECT url, title, ord, id FROM post WHERE lang = ? AND ord > ? AND pub = "p" ORDER BY ord LIMIT 1) b`;
            sessionMysql.sql(queryLimit).bind(lang, result[9], lang, result[9]).execute(rowLimit => {
                if (rowLimit) rows.push(rowLimit);
            }).then(resolve).catch(reject);
        });

        if (rows[0]) {
            if (rows[0][2] < result[9]) {
                preT = `<div class="prev"><a href="${rows[0][0]}">${rows[0][1]}</a></div>`;
            } else {
                nexT = `<div class="next"><a href="${rows[0][0]}">${rows[0][1]}</a></div>`;
                nextId = rows[0][3];
                nextTitle = rows[0][1];
                loadButton = `<button type="button" onclick="loadPost()" id="loadPost">${nextTitle}</button>`;
            }
        }

        if (rows[1]) {
            nexT = `<div class="next"><a href="${rows[1][0]}">${rows[1][1]}</a></div>`;
            nextId = rows[1][3];
            nextTitle = rows[1][1];
            loadButton = `<button type="button" onclick="loadPost()" id="loadPost">${nextTitle}</button>`;
        }

        const separators = /[،,;:؛]/;
        if (result[5]) {
            tags = result[5].split(separators).map(item => item.trim());
            for (const tag of tags) {
                if (tag != " " && tag != "") {
                    tagsBody += `<a href="${langUrl}?q=${tag}">${tag}</a> `;
                }
            }
        }

        const ogUrl = `${langUrl}`;
        const metaGraph = buildMetaGraph({
            siteTitle: result[1],
            siteDesc: result[2],
            ogUrl,
            lang,
            type: 'article',
            tags
        });
        const hiddenInputs = buildHiddenInputs({ nextId, lang, transLoadMore: '' });

        const html = `<!DOCTYPE html>
        <html lang="${lang}">
        <head>
            <meta charset="utf-8">
            <link rel="icon" type="image/png" href="/favicon.png">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${result[1]}</title>
            <link type="text/css" rel="stylesheet" href="/style_${slg}.css?v=9">
            <meta name="description" content="${result[2]}">
            ${metaGraph}
            <script src="/lazy.js?v=1" defer></script>
            <script src="/site.js?v=10" defer></script>
        </head>
        <body>
            ${buildHeader(lang)}
            ${buildSearchForm(langUrl, submit)}
            <div id="content" class="content">
                <h1>${result[1]}</h1>
                ${result[3]}
                ${shortLink}
                ${loadButton}
                ${hiddenInputs}
            </div>
            <div class="relat">${preT}${nexT}</div>
            <div class="tags">${tagsBody}</div>
            ${buildFooter(footer, lang)}
        </body>
        </html>`;

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(html, 'utf-8');

    } catch (err) {
        console.log("error getPost: " + err.message);
        sendAlert('Site getPost Error', `${err.message}\nFunction: getPost\nLang: ${lang}\nURL: ${url}`);
        redirectToPage(langUrl, res);
    } finally {
        if (sessionMysql) { try { await sessionMysql.close(); } catch {} }
    }
}

async function getPostById(lang, id, res) {
    const suffix = lang == "fr" ? "/" : `/${lang}/`;
    let url = null;
    let sessionMysql;

    if (langList.includes(lang) && id > 0) {
        try {
            sessionMysql = await getApiSession();
            await new Promise((resolve, reject) => {
                sessionMysql.sql(
                    `SELECT url FROM post WHERE pub = "p" AND id = ? AND lang = ?`
                ).bind(id, lang).execute(row => {
                    if (row != null) url = row[0];
                }).then(resolve).catch(reject);
            });
            const loc = url != null ? encodeURI(suffix + url) : '/';
            redirectToPage(loc, res);
        } catch (err) {
            console.log("error getPostById: " + err.message);
            sendAlert('Site getPostById Error', `${err.message}\nFunction: getPostById\nLang: ${lang}\nID: ${id}`);
            redirectToPage("/", res);
        } finally {
            if (sessionMysql) { try { await sessionMysql.close(); } catch {} }
        }
    } else {
        redirectToPage("/", res);
    }
}

export { listPost, getPost, getPostById };
