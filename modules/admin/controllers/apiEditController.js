import { getApiSession } from '../../../shared/database.js';
import { langList } from '../../../shared/constants.js';

export const getPostData = async (req, res) => {
    const { type, lang, id } = req.params;
    const validLang = langList.includes(lang) ? lang : 'fr';

    try {
        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }

        let query, params;

        if (type === 'post' && langList.includes(validLang)) {
            query = `SELECT * FROM post WHERE id = ? AND lang = ?`;
            params = [id, validLang];
        } else if (type === 'nmbr') {
            query = `SELECT * FROM mnumbers WHERE id = ? AND lang = ?`;
            params = [id, validLang];
        } else {
            query = `SELECT * FROM messages WHERE id = ? AND lang = ? AND type = ?`;
            params = [id, validLang, type];
        }

        const session = await getApiSession();

        try {
            const result = await session.sql(query).bind(params).execute();
            const row = result.fetchOne();

            if (!row) {
                return res.status(404).json({ error: 'Post not found' });
            }

            let data = {};

            if (type === 'post') {
                data = {
                    id: row[0],
                    title: row[1],
                    descr: row[2],
                    content: row[3],
                    url: row[4],
                    tags: row[5],
                    pub: row[6],
                    ord: row[9]
                };
            } else if (type === 'nmbr') {
                data = {
                    ord: row[0],
                    nb: row[1],
                    nbd: row[2],
                    nbm: row[3],
                    pub: row[4],
                    id: row[6]
                };
            } else {
                data = {
                    id: row[0],
                    title: row[1],
                    content: row[2],
                    url: row[3] ?? '',
                    pub: row[4],
                    ord: row[9]
                };
            }

            res.json(data);
        } finally {
            if (session) await session.close();
        }
    } catch (err) {
        console.error(`getPostData error: ${err.message}`);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getNextOrd = async (req, res) => {
    const { type, lang } = req.params;
    const validLang = langList.includes(lang) ? lang : 'fr';

    try {
        let query, params;

        if (type === 'post' && langList.includes(validLang)) {
            query = `SELECT ord FROM post WHERE pub = "p" AND lang = ? ORDER BY ord DESC LIMIT 1`;
            params = [validLang];
        } else if (type === 'nmbr') {
            query = `SELECT ord FROM mnumbers WHERE lang = ? ORDER BY ord DESC LIMIT 1`;
            params = [validLang];
        } else {
            query = `SELECT ord FROM messages WHERE lang = ? AND type = ? ORDER BY id DESC LIMIT 1`;
            params = [validLang, type];
        }

        const session = await getApiSession();

        try {
            const result = await session.sql(query).bind(params).execute();
            const row = result.fetchOne();
            const ord = row ? row[0] + 1 : 1;
            res.json({ ord });
        } finally {
            if (session) await session.close();
        }
    } catch (err) {
        console.error(`getNextOrd error: ${err.message}`);
        res.status(500).json({ error: 'Server error' });
    }
};
