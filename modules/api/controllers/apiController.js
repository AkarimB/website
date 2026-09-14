import { query } from '../../../shared/database.js';
import { sanitizeQuery } from '../../site/utils/helpers.js';
import { sendAlert } from '../../../shared/alert.js';

async function listPost(type, lang, pageId, searchQuery, res) {
    try {
        const numberPerPage = 11;
        lang = lang || "fr";
        pageId = parseInt(pageId) || 0;
        if (pageId < 0 || pageId > 100000) pageId = 0;
        const querryOffset = pageId * numberPerPage;
        const order = type == 'post' ? 'ord ASC' : 'date DESC';

        if (lang === "ar" && searchQuery) {
            searchQuery = searchQuery.replace(/[\u0617-\u061A\u064B-\u0652]/g, "");
        }

        let result;

        if (searchQuery) {
            searchQuery = sanitizeQuery(searchQuery);
            result = await query(
                `SELECT id, title, url, descr, ord FROM search_posts($1, $2, $3, $4)`,
                [searchQuery, lang, numberPerPage, querryOffset]
            );
        } else {
            result = await query(
                `SELECT id, title, url, descr, ord FROM post WHERE lang = $1 AND pub = 'p' ORDER BY ${order} LIMIT $2 OFFSET $3`,
                [lang, numberPerPage, querryOffset]
            );
        }

        const posts = result.rows;

        if (posts.length > 0) {
            res.json(posts);
        } else {
            res.status(404).json({
                error: 'Not Found',
                message: 'No posts found matching the criteria.'
            });
        }
    } catch (err) {
        console.error("listPost error:", err);
        sendAlert('API listPost Error', `${err.message}\nFunction: listPost\nType: ${type}\nLang: ${lang}`);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'An error occurred while fetching posts'
        });
    }
}

async function getElevation(lat, lng, res) {
    const apiKey = 'AIzaSyD6Lg9Dy3UpCjx0YiRATy07CxGnrFEKF8o';
    const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${lat},${lng}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch elevation data' });
    }
}

async function getPost(lang, id, res) {
    try {
        const result = await query(
            `SELECT * FROM post WHERE id = $1 AND lang = $2 AND pub = 'p'`,
            [id, lang]
        );
        const post = result.rows[0];

        if (post) {
            const nextResult = await query(
                `SELECT id, title FROM post WHERE lang = $1 AND ord > $2 AND pub = 'p' ORDER BY ord LIMIT 1`,
                [lang, post.ord]
            );
            const nextPost = nextResult.rows[0];
            const postData = [post.id, post.title, post.descr, post.content, post.url, post.tags, post.pub, post.date, post.lang, post.ord];
            if (nextPost) {
                postData.push([nextPost.id, nextPost.title]);
            }
            res.json(postData);
        } else {
            res.status(404).json({
                error: 'Not Found',
                message: 'The requested post could not be found.'
            });
        }
    } catch (err) {
        console.error("getPost error:", err);
        sendAlert('API getPost Error', `${err.message}\nFunction: getPost\nLang: ${lang}\nID: ${id}`);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'An error occurred while fetching the post'
        });
    }
}

async function getApi(lang, type, ord, res, q) {
    try {
        let result;

        if (type === "nmbr") {
            result = await query(
                `SELECT * FROM mnumbers WHERE lang = $1 AND ord = $2 AND pub = 'p' LIMIT 1`,
                [lang, ord]
            );
        } else {
            if (q) {
                result = await query(
                    `SELECT * FROM messages WHERE title LIKE $1 AND lang = $2 AND type = $3 AND pub = 'p' LIMIT 1`,
                    [`%${q}%`, lang, type]
                );
            } else {
                result = await query(
                    `SELECT * FROM messages WHERE lang = $1 AND type = $2 AND ord = $3 AND pub = 'p' LIMIT 1`,
                    [lang, type, ord]
                );
            }
        }

        const data = result.rows[0];
        if (data) {
            res.json(data);
        } else {
            res.status(404).json({
                error: 'Not Found',
                message: 'The requested resource could not be found.'
            });
        }
    } catch (err) {
        console.error("getApi error:", err);
        sendAlert('API getApi Error', `${err.message}\nFunction: getApi\nLang: ${lang}\nType: ${type}\nOrd: ${ord}`);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'An error occurred while fetching the data'
        });
    }
}

async function getVersion(lang, type, res) {
    try {
        const result = await query(
            `SELECT ver FROM messages WHERE lang = $1 AND type = $2 AND pub = 'p' ORDER BY ord`,
            [lang, type]
        );
        const versions = result.rows.map(row => row.ver).join(',');
        if (versions) {
            res.json(versions);
        } else {
            res.status(404).json({
                error: 'Not Found',
                message: 'No versions found for the specified language and type.'
            });
        }
    } catch (err) {
        console.error("getVersion error:", err);
        sendAlert('API getVersion Error', `${err.message}\nFunction: getVersion\nLang: ${lang}\nType: ${type}`);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'An error occurred while fetching versions'
        });
    }
}

async function getVersions(lang, type, res) {
    try {
        const result = await query(
            `SELECT ord, ver FROM messages WHERE lang = $1 AND type = $2 AND pub = 'p' ORDER BY ord`,
            [lang, type]
        );
        const data = result.rows;
        if (data.length > 0) {
            res.json(data);
        } else {
            res.status(404).json({
                error: 'Not Found',
                message: 'No records found for the specified language and type.'
            });
        }
    } catch (err) {
        console.error("getVersions error:", err);
        sendAlert('API getVersions Error', `${err.message}\nFunction: getVersions\nLang: ${lang}\nType: ${type}`);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'An error occurred while fetching versions'
        });
    }
}

export { listPost, getPost, getApi, getVersion, getVersions, getElevation };
