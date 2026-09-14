import { query } from '../../../shared/database.js';
import { langList, domain } from '../../../shared/constants.js';
import { purgeCacheByUrls } from '../utils/cloudflare.js';

export const sendData = async (req, res) => {
    try {
        const { pub, type, lang, ord, id } = req.body;
        let sqlQuery, params;

        if (type === 'nmbr') {
            if (!id || id < 0) {
                sqlQuery = `INSERT INTO mnumbers (ord, nb, nbd, nbm, pub, lang) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
                params = [ord, req.body.nb, req.body.nbd, req.body.nbm, pub, lang];
            } else {
                sqlQuery = `UPDATE mnumbers SET ord = $1, nb = $2, nbd = $3, nbm = $4, pub = $5, lang = $6 WHERE id = $7`;
                params = [ord, req.body.nb, req.body.nbd, req.body.nbm, pub, lang, id];
            }
        } else if (type === 'post' && langList.includes(lang)) {
            if (!id || id < 0) {
                sqlQuery = `INSERT INTO post (ord, title, url, descr, content, tags, pub, lang) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`;
                params = [ord, req.body.title, req.body.url, req.body.descr, req.body.content, req.body.tags, pub, lang];
            } else {
                sqlQuery = `UPDATE post SET ord = $1, title = $2, url = $3, descr = $4, content = $5, tags = $6, pub = $7 WHERE id = $8 AND lang = $9`;
                params = [ord, req.body.title, req.body.url, req.body.descr, req.body.content, req.body.tags, pub, id, lang];
            }
        } else {
            if (!id || id < 0) {
                sqlQuery = `INSERT INTO messages (ord, title, audio, content, pub, lang, type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`;
                params = [ord, req.body.title, req.body.url, req.body.content, pub, lang, type];
            } else {
                sqlQuery = `UPDATE messages SET ord = $1, title = $2, audio = $3, content = $4, pub = $5, lang = $6, type = $7, ver = ver + 1 WHERE id = $8 AND lang = $9`;
                params = [ord, req.body.title, req.body.url, req.body.content, pub, lang, type, id, lang];
            }
        }

        let newId = id;
        if (!id || id < 0) {
            const result = await query(sqlQuery, params);
            newId = result.rows[0].id;
        } else {
            await query(sqlQuery, params);
        }

        console.log("Id from server: ", newId);
        res.status(200).json({ id: newId, msg: "success saving" });

    } catch (error) {
        console.error('Error in sendData:', error);
        res.status(400).json({ error: error.message });
    }
};

export const purgeCache = async (req, res) => {
    try {
        const { type, lang, ord, url } = req.body;
        const langUrl = lang === "fr" ? "/" : "/" + lang + "/";
        const purgeUrls = [];

        if (type === 'post' && url) {
            purgeUrls.push(`${domain}${langUrl}${url}`);
        } else {
            purgeUrls.push(`https://api.islam.ms/${type}/${lang}/${ord}`);
            if (type != 'nmbr') {
                purgeUrls.push(`https://api.islam.ms/${type}/${lang}`);
                purgeUrls.push(`https://api.islam.ms/v/${type}/${lang}`);
            }
        }

        console.log("Purging URLs:", purgeUrls);
        const result = await purgeCacheByUrls(purgeUrls);
        if (result.success) {
            res.json({ msg: "Cache purged successfully" });
        } else {
            res.status(400).json({ error: result.errors[0].message });
        }
    } catch (error) {
        console.error('Error in purgeCache:', error);
        res.status(500).json({ error: error.message });
    }
};
