import { query } from '../../../shared/database.js';
import { langList } from '../../../shared/constants.js';

export const getPostData = async (req, res) => {
    const { type, lang, id } = req.params;
    const validLang = langList.includes(lang) ? lang : 'fr';

    try {
        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }

        let sqlQuery, params;

        if (type === 'post' && langList.includes(validLang)) {
            sqlQuery = `SELECT * FROM post WHERE id = $1 AND lang = $2`;
            params = [id, validLang];
        } else if (type === 'nmbr') {
            sqlQuery = `SELECT * FROM mnumbers WHERE id = $1 AND lang = $2`;
            params = [id, validLang];
        } else {
            sqlQuery = `SELECT * FROM messages WHERE id = $1 AND lang = $2 AND type = $3`;
            params = [id, validLang, type];
        }

        const result = await query(sqlQuery, params);
        const row = result.rows[0];

        if (!row) {
            return res.status(404).json({ error: 'Post not found' });
        }

        let data = {};

        if (type === 'post') {
            data = {
                id: row.id,
                title: row.title,
                descr: row.descr,
                content: row.content,
                url: row.url,
                tags: row.tags,
                pub: row.pub,
                ord: row.ord
            };
        } else if (type === 'nmbr') {
            data = {
                ord: row.ord,
                nb: row.nb,
                nbd: row.nbd,
                nbm: row.nbm,
                pub: row.pub,
                id: row.id
            };
        } else {
            data = {
                id: row.id,
                title: row.title,
                content: row.content,
                url: row.url ?? '',
                pub: row.pub,
                ord: row.ord
            };
        }

        res.json(data);
    } catch (err) {
        console.error(`getPostData error: ${err.message}`);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getNextOrd = async (req, res) => {
    const { type, lang } = req.params;
    const validLang = langList.includes(lang) ? lang : 'fr';

    try {
        let sqlQuery, params;

        if (type === 'post' && langList.includes(validLang)) {
            sqlQuery = `SELECT ord FROM post WHERE pub = 'p' AND lang = $1 ORDER BY ord DESC LIMIT 1`;
            params = [validLang];
        } else if (type === 'nmbr') {
            sqlQuery = `SELECT ord FROM mnumbers WHERE lang = $1 ORDER BY ord DESC LIMIT 1`;
            params = [validLang];
        } else {
            sqlQuery = `SELECT ord FROM messages WHERE lang = $1 AND type = $2 ORDER BY id DESC LIMIT 1`;
            params = [validLang, type];
        }

        const result = await query(sqlQuery, params);
        const row = result.rows[0];
        const ord = row ? row.ord + 1 : 1;
        res.json({ ord });
    } catch (err) {
        console.error(`getNextOrd error: ${err.message}`);
        res.status(500).json({ error: 'Server error' });
    }
};
