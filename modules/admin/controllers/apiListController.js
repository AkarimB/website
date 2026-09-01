import { getApiSession } from '../../../shared/database.js';
import { constructQuery } from '../utils/helpers.js';
import { langList } from '../../../shared/constants.js';

export const getPosts = async (req, res) => {
    const { type, lang, currentPageId } = req.params;
    const { q = '', ord } = req.query;
    let session;

    try {
        session = await getApiSession();

        const numberPerPage = 11;
        const parsedCurrentPageId = parseInt(currentPageId) || 0;
        const queryOffset = parsedCurrentPageId * numberPerPage;

        const query = constructQuery(type, lang, q, ord, (numberPerPage + 1), queryOffset);

        const hasOrd = !isNaN(parseInt(ord)) && ord;
        const ordParam = hasOrd ? [parseInt(ord)] : [];

        const params = type === "post" && langList.includes(lang)
            ? q
                ? [lang, `%${q}%`, ...ordParam, numberPerPage + 1, queryOffset]
                : [lang, ...ordParam, numberPerPage + 1, queryOffset]
            : q
                ? [`%${q}%`, lang, type, ...ordParam, numberPerPage + 1, queryOffset]
                : [lang, type, ...ordParam, numberPerPage + 1, queryOffset];

        const result = await session.sql(query).bind(...params).execute();
        const postsRaw = result.fetchAll();

        const hasMore = postsRaw.length > numberPerPage;
        const posts = hasMore ? postsRaw.slice(0, numberPerPage) : postsRaw;

        const mappedPosts = posts.map(row => {
            if (type === 'post' && langList.includes(lang)) {
                return {
                    id: row[0],
                    title: row[1],
                    url: row[2],
                    descr: row[3],
                    ord: row[4],
                    pub: row[5]
                };
            } else {
                return {
                    id: row[0],
                    title: row[1],
                    audio: row[2],
                    ord: row[3],
                    pub: row[4]
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
    } finally {
        if (session) await session.close();
    }
};
