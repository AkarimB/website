import i18n from 'i18n';
import { langList } from '../../../shared/constants.js';

export const getLangSettings = (lang, q) => {
  const langUrl = (lang === "fr") ? "/" : `/${lang}/`;
  const slg = lang === 'ar' ? 'ar' : 'fr';

  let submit = '', addText = '';

  submit = i18n.__({ phrase: 'submitSearch', locale: lang });
  addText = i18n.__({ phrase: 'addText', locale: lang });

  if (lang === "ar" && q) {
    q = q.replace(/[\u0617-\u061A\u064B-\u0652]/g, "");
  }

  return { langUrl, slg, submit, addText, q };
};

export const constructQuery = (type, lang, q, ord, numberPerPage, queryOffset) => {
    const hasOrd = !isNaN(parseInt(ord)) && ord;
    const orderClause = hasOrd ? 'ord ASC' : 'date DESC';

    if (q) {
      if (type === "post" && langList.includes(lang)) {
        let base = `SELECT id, title, url, descr, ord, pub FROM post WHERE lang = $1 AND (title ILIKE $2 OR descr ILIKE $2 OR tags ILIKE $2)`;
        let paramsOrder = hasOrd ? ` AND ord >= $3` : '';
        let limitOffset = hasOrd ? ` ORDER BY ${orderClause} LIMIT $4 OFFSET $5` : ` ORDER BY ${orderClause} LIMIT $3 OFFSET $4`;
        return `${base}${paramsOrder}${limitOffset}`;
      } else if (type === "nmbr") {
        let base = `SELECT id, ord, nb, nbd, nbm, pub FROM mnumbers WHERE lang = $1 AND (nb ILIKE $2 OR nbd ILIKE $2 OR nbm ILIKE $2)`;
        let paramsOrder = hasOrd ? ` AND ord >= $3` : '';
        let limitOffset = hasOrd ? ` ORDER BY ${orderClause} LIMIT $4 OFFSET $5` : ` ORDER BY ${orderClause} LIMIT $3 OFFSET $4`;
        return `${base}${paramsOrder}${limitOffset}`;
      } else {
        let base = `SELECT id, title, audio, ord, pub FROM messages WHERE title ILIKE $1 AND lang = $2 AND type = $3`;
        let paramsOrder = hasOrd ? ` AND ord >= $4` : '';
        let limitOffset = hasOrd ? ` ORDER BY ${orderClause} LIMIT $5 OFFSET $6` : ` ORDER BY ${orderClause} LIMIT $4 OFFSET $5`;
        return `${base}${paramsOrder}${limitOffset}`;
      }
    } else {
      if (type === "post" && langList.includes(lang)) {
        let base = `SELECT id, title, url, descr, ord, pub FROM post WHERE lang = $1`;
        let paramsOrder = hasOrd ? ` AND ord >= $2` : '';
        let limitOffset = hasOrd ? ` ORDER BY ${orderClause} LIMIT $3 OFFSET $4` : ` ORDER BY ${orderClause} LIMIT $2 OFFSET $3`;
        return `${base}${paramsOrder}${limitOffset}`;
      } else if (type === "nmbr") {
        let base = `SELECT id, ord, nb, nbd, nbm, pub FROM mnumbers WHERE lang = $1`;
        let paramsOrder = hasOrd ? ` AND ord >= $2` : '';
        let limitOffset = hasOrd ? ` ORDER BY ${orderClause} LIMIT $3 OFFSET $4` : ` ORDER BY ${orderClause} LIMIT $2 OFFSET $3`;
        return `${base}${paramsOrder}${limitOffset}`;
      } else {
        let base = `SELECT id, title, audio, ord, pub FROM messages WHERE lang = $1 AND type = $2`;
        let paramsOrder = hasOrd ? ` AND ord >= $3` : '';
        let limitOffset = hasOrd ? ` ORDER BY ${orderClause} LIMIT $4 OFFSET $5` : ` ORDER BY ${orderClause} LIMIT $3 OFFSET $4`;
        return `${base}${paramsOrder}${limitOffset}`;
      }
    }
};
