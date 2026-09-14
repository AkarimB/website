import { query } from '../../../shared/database.js';
import { constructQuery } from '../utils/helpers.js';
import { langList } from '../../../shared/constants.js';

export const getPosts = async (req, res) => {
    const { type, lang, currentPageId } = req.params;
    const { q = '', ord } = req.query;

    try {
        const numberPerPage = 11;
        const parsedCurrentPageId = parseInt(currentPageId) || 0;
        const queryOffset = parsedCurrentPageId * numberPerPage;

        const hasOrd = !isNaN(parseInt(ord)) && ord;
        const ordParam = hasOrd ? [parseInt(ord)] : [];

        const sqlQuery = constructQuery(type, lang, q, ord, (numberPerPage + 1), queryOffset);

        const params = type === "post" && langList.includes(lang)
            ? q
                ? [lang, `%${q}%`, ...ordParam, numberPerPage + 1, queryOffset]
                : [lang, ...ordParam, numberPerPage + 1, queryOffset]
            : q
                ? [`%${q}%`, lang, type, ...ordParam, numberPerPage + 1, queryOffset]
                : [lang, type, ...ordParam, numberPerPage + 1, queryOffset];

        const result = await query(sqlQuery, params);
        const postsRaw = result.rows;

        const hasMore = postsRaw.length > numberPerPage;
        const posts = hasMore ? postsRaw.slice(0, numberPerPage) : postsRaw;

        const mappedPosts = posts.map(row => {
            if (type === 'post' && langList.includes(lang)) {
                return {
                    id: row.id,
                    title: row.title,
                    url: row.url,
                    descr: row.descr,
                    ord: row.ord,
                    pub: row.pub
                };
            } else {
                return {
                    id: row.id,
                    title: row.title,
                    audio: row.audio,
                    ord: row.ord,
                    pub: row.pub
                };
            }
        });

        res.json({
            posts: mappedPosts,
            pagination: {
                currentPage: parsedCurrentPageId,
                numberPerPage,
                hasMore
            }
        });

    } catch (err) {
        console.error("getPosts error:", err);
        res.status(500).json({ error: 'Server error' });
    }
};
