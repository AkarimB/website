import { getApiSession } from '../../../shared/database.js';
import { sanitizeQuery } from '../../site/utils/helpers.js';
import { sendAlert } from '../../../shared/alert.js';

async function listPost(type, lang, pageId, searchQuery, res) {
    let session, order = type == 'post' ? `ord ASC` : `date DESC`;
    try {
        const numberPerPage = 11;
        lang = lang || "fr";
        pageId = parseInt(pageId) || 0;
        if (pageId < 0 || pageId > 100000) pageId = 0;
        const querryOffset = pageId * numberPerPage;

        if (lang === "ar" && searchQuery) {
            searchQuery = searchQuery.replace(/[\u0617-\u061A\u064B-\u0652]/g, "");
        }

        const queryPrefix = `SELECT id, title, url, descr, ord FROM post`;
        let query, params;

        if (searchQuery) {
            searchQuery = sanitizeQuery(searchQuery);
            const ftQuery = searchQuery.split(/\s+/).filter(w => w.length > 0).map(w => `${w}*`).join(' ');
            query = `SELECT id, title, url, descr, ord FROM (
                SELECT id, title, url, descr, ord,
                    MATCH(title, tags, descr) AGAINST(? IN BOOLEAN MODE) AS score
                FROM post
                WHERE lang = ? AND pub = 'p'
                AND MATCH(title, tags, descr) AGAINST(? IN BOOLEAN MODE)
                ORDER BY score DESC
                LIMIT ? OFFSET ?
            ) AS ft_results`;
            params = [ftQuery, lang, ftQuery, numberPerPage, querryOffset];
        } else {
            query = `
                ${queryPrefix} WHERE lang = ? AND pub = "p" ORDER BY ${order} LIMIT ? OFFSET ?
            `;
            params = [lang, numberPerPage, querryOffset];
        }

        session = await getApiSession();
        const result = await session.sql(query).bind(...params).execute();
        const posts = result.fetchAll();

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
    } finally {
        if (session) {
            await session.close();
        }
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
    let session;
    try {
        session = await getApiSession();
        const result = await session.sql(
            `SELECT * FROM post WHERE id = ? AND lang = ? AND pub = "p"`
        ).bind(id, lang).execute();
        const post = result.fetchOne();

        if (post) {
            const nextResult = await session.sql(
                `SELECT id, title FROM post WHERE lang = ? AND ord > ? AND pub = "p" ORDER BY ord LIMIT 1`
            ).bind(lang, post[9]).execute();
            const nextPost = nextResult.fetchOne();
            if (nextPost) {
                post.push(nextPost);
            }
            res.json(post);
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
    } finally {
        if (session) {
            await session.close();
        }
    }
}

async function getApi(lang, type, ord, res, q) {
    let session;
    try {
        let query, params;
        if (type === "nmbr") {
            query = `SELECT * FROM mnumbers WHERE lang = ? AND ord = ? AND pub = "p" LIMIT 1`;
            params = [lang, ord];
        } else {
            if (q) {
                query = `SELECT * FROM messages WHERE title LIKE ? AND lang = ? AND type = ? AND pub = "p" LIMIT 1`;
                params = [`%${q}%`, lang, type];
            } else {
                query = `SELECT * FROM messages WHERE lang = ? AND type = ? AND ord = ? AND pub = "p" LIMIT 1`;
                params = [lang, type, ord];
            }
        }

        session = await getApiSession();
        const result = await session.sql(query).bind(...params).execute();
        const data = result.fetchOne();
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
    } finally {
        if (session) {
            await session.close();
        }
    }
}

async function getVersion(lang, type, res) {
    let session;
    try {
        session = await getApiSession();
        const result = await session.sql(
            `SELECT ver FROM messages WHERE lang = ? AND type = ? AND pub = "p" ORDER BY ord`
        ).bind(lang, type).execute();
        const versions = result.fetchAll().map(row => row[0]).join(',');
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
    } finally {
        if (session) {
            await session.close();
        }
    }
}

async function getVersions(lang, type, res) {
    let session;
    try {
        session = await getApiSession();
        const result = await session.sql(
            `SELECT ord, ver FROM messages WHERE lang = ? AND type = ? AND pub = "p" ORDER BY ord`
        ).bind(lang, type).execute();
        const data = result.fetchAll();
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
    } finally {
        if (session) {
            await session.close();
        }
    }
}

export { listPost, getPost, getApi, getVersion, getVersions, getElevation };
