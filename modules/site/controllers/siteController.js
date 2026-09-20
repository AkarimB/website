import i18n from 'i18n';
import { langList } from '../../../shared/constants.js';
import { query } from '../../../shared/database.js';
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

    let messagesCount = 0;

    try {
        const settingsResult = await query(`SELECT title, descr, footer FROM site_settings WHERE lang = $1`, [lang]);
        if (settingsResult.rows[0]) {
            siteTitle = settingsResult.rows[0].title;
            siteDesc = settingsResult.rows[0].descr;
            footer = settingsResult.rows[0].footer;
        }

        let result;
        if (q) {
            q = sanitizeQuery(q);
            result = await query(
                `SELECT id, title, url, descr, ord, rank_score FROM search_posts($1, $2, $3, $4)`,
                [q, lang, numberPerPage, querryOffset]
            );
        } else {
            result = await query(
                `SELECT id, title, url, descr, ord FROM post WHERE lang = $1 AND pub = 'p' ORDER BY ord ASC LIMIT $2 OFFSET $3`,
                [lang, numberPerPage, querryOffset]
            );
        }

        for (const row of result.rows) {
            rows.push(row);
        }

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
            <link type="text/css" rel="stylesheet" href="/audio-player.css?v=1">
            <meta name="description" content="${siteDesc}">
            ${metaGraph}
            <script src="/site.js?v=11" defer></script>
            <script src="/audio-player.js?v=1" defer></script>
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
    const langUrl = getLangUrl(lang);

    i18n.setLocale(lang);
    const submit = i18n.__('submitSearch');

    try {
        const postResult = await query(`SELECT * FROM post WHERE url = $1 AND lang = $2 AND pub = 'p'`, [url, lang]);
        result = postResult.rows[0];

        if (!result) {
            return redirectToPage(langUrl, res);
        }

        shortLink = `<p class='shortlink'>https://www.islam.ms${langUrl}?p=${result.id}</p>`;

        const settingsResult = await query(`SELECT footer FROM site_settings WHERE lang = $1`, [lang]);
        if (settingsResult.rows[0]) {
            footer = settingsResult.rows[0].footer;
        }

        const navResult = await query(
            `SELECT * FROM (SELECT url, title, ord, id FROM post WHERE lang = $1 AND ord < $2 AND pub = 'p' ORDER BY ord DESC LIMIT 1) a UNION ALL SELECT * FROM (SELECT url, title, ord, id FROM post WHERE lang = $1 AND ord > $2 AND pub = 'p' ORDER BY ord LIMIT 1) b`,
            [lang, result.ord]
        );
        rows = navResult.rows;

        if (rows[0]) {
            if (rows[0].ord < result.ord) {
                preT = `<div class="prev"><a href="${rows[0].url}">${rows[0].title}</a></div>`;
            } else {
                nexT = `<div class="next"><a href="${rows[0].url}">${rows[0].title}</a></div>`;
                nextId = rows[0].id;
                nextTitle = rows[0].title;
                loadButton = `<button type="button" onclick="loadPost()" id="loadPost">${nextTitle}</button>`;
            }
        }

        if (rows[1]) {
            nexT = `<div class="next"><a href="${rows[1].url}">${rows[1].title}</a></div>`;
            nextId = rows[1].id;
            nextTitle = rows[1].title;
            loadButton = `<button type="button" onclick="loadPost()" id="loadPost">${nextTitle}</button>`;
        }

        const separators = /[،,;:؛]/;
        if (result.tags) {
            tags = result.tags.split(separators).map(item => item.trim());
            for (const tag of tags) {
                if (tag != " " && tag != "") {
                    tagsBody += `<a href="${langUrl}?q=${tag}">${tag}</a> `;
                }
            }
        }

        const ogUrl = `${langUrl}`;
        const metaGraph = buildMetaGraph({
            siteTitle: result.title,
            siteDesc: result.descr,
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
            <title>${result.title}</title>
            <link type="text/css" rel="stylesheet" href="/style_${slg}.css?v=9">
            <link type="text/css" rel="stylesheet" href="/audio-player.css?v=1">
            <meta name="description" content="${result.descr}">
            ${metaGraph}
            <script src="/site.js?v=11" defer></script>
            <script src="/audio-player.js?v=1" defer></script>
        </head>
        <body>
            ${buildHeader(lang)}
            ${buildSearchForm(langUrl, submit)}
            <div id="content" class="content">
                <h1>${result.title}</h1>
                ${result.content}
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
    }
}

async function getPostById(lang, id, res) {
    const suffix = lang == "fr" ? "/" : `/${lang}/`;
    let url = null;

    if (langList.includes(lang) && id > 0) {
        try {
            const result = await query(
                `SELECT url FROM post WHERE pub = 'p' AND id = $1 AND lang = $2`,
                [id, lang]
            );
            if (result.rows[0]) {
                url = result.rows[0].url;
            }
            const loc = url != null ? encodeURI(suffix + url) : '/';
            redirectToPage(loc, res);
        } catch (err) {
            console.log("error getPostById: " + err.message);
            sendAlert('Site getPostById Error', `${err.message}\nFunction: getPostById\nLang: ${lang}\nID: ${id}`);
            redirectToPage("/", res);
        }
    } else {
        redirectToPage("/", res);
    }
}

export { listPost, getPost, getPostById };
