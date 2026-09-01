import { getApiSession } from '../../../shared/database.js';
import { langList, domain } from '../../../shared/constants.js';
import { purgeCacheByUrls } from '../utils/cloudflare.js';

export const sendData = async (req, res) => {
    let session;
    try {
        const { pub, type, lang, ord, id } = req.body;
        let query, queryId;

        if (type === 'nmbr') {
            if (!id || id < 0) {
                query = `INSERT INTO mnumbers (ord, nb, nbd, nbm, pub, lang) VALUES (?, ?, ?, ?, ?, ?)`;
                queryId = `SELECT id FROM mnumbers WHERE lang = ? AND ord = ?`;
            } else {
                query = `UPDATE mnumbers SET ord = ?, nb = ?, nbd = ?, nbm = ?, pub = ?, lang = ? WHERE id = ?`;
            }
        } else if (type === 'post' && langList.includes(lang)) {
            if (!id || id < 0) {
                query = `INSERT INTO post (ord, title, url, descr, content, tags, pub, lang) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                queryId = `SELECT id FROM post WHERE url = ? AND lang = ?`;
            } else {
                query = `UPDATE post SET ord = ?, title = ?, url = ?, descr = ?, content = ?, tags = ?, pub = ? WHERE id = ? AND lang = ?`;
            }
        } else {
            if (!id || id < 0) {
                query = `INSERT INTO messages (ord, title, audio, content, pub, lang, type) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                queryId = `SELECT id FROM messages WHERE lang = ? AND type = ? AND ord = ?`;
            } else {
                query = `UPDATE messages SET ord = ?, title = ?, audio = ?, content = ?, pub = ?, lang = ?, type = ?, ver = ver + 1 WHERE id = ? AND lang = ?`;
            }
        }

        session = await getApiSession();

        let newId = id;
        if (!id || id < 0) {
            await session.sql(query).bind(
                type === 'nmbr' ? [ord, req.body.nb, req.body.nbd, req.body.nbm, pub, lang] :
                    type === 'post' ? [ord, req.body.title, req.body.url, req.body.descr, req.body.content, req.body.tags, pub, lang] :
                        [ord, req.body.title, req.body.url, req.body.content, pub, lang, type]
            ).execute();

            const result = await session.sql(queryId).bind(
                type === 'nmbr' ? [lang, ord] :
                    type === 'post' ? [req.body.url, lang] :
                        [lang, type, ord]
            ).execute();

            const row = result.fetchOne();
            newId = row[0];
        } else {
            await session.sql(query).bind(
                type === 'nmbr' ? [ord, req.body.nb, req.body.nbd, req.body.nbm, pub, lang, id] :
                    type === 'post' ? [ord, req.body.title, req.body.url, req.body.descr, req.body.content, req.body.tags, pub, id, lang] :
                        [ord, req.body.title, req.body.url, req.body.content, pub, lang, type, id, lang]
            ).execute();
        }

        console.log("Id from server: ", newId);
        res.status(200).json({ id: newId, msg: "success saving" });

    } catch (error) {
        console.error('Error in sendData:', error);
        res.status(400).json({ error: error.message });
    } finally {
        if (session) {
            await session.close();
        }
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
