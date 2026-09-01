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
    const orderClause = hasOrd ? `ord ASC` : `date DESC`;

    const queryPrefix = `SELECT id, title, url, descr, ord, pub FROM post`;
    const queryPrefix2 = `SELECT id, title, audio, ord, pub FROM messages`;

    if (q) {
      if (type === "post" && langList.includes(lang)) {
        let base = `${queryPrefix} WHERE lang = ? AND title LIKE ?`;
        let paramsOrder = hasOrd ? ` AND ord >= ?` : ``;
        return `${base}${paramsOrder} ORDER by ${orderClause} LIMIT ? OFFSET ?`;
      } else if (type === "nmbr") {
        let base = `SELECT id, ord, nb, nbd, nbm, pub FROM mnumbers WHERE lang = ? AND (nb LIKE ? OR nbd LIKE ? OR nbm LIKE ?)`;
        let paramsOrder = hasOrd ? ` AND ord >= ?` : ``;
        return `${base}${paramsOrder} ORDER by ${orderClause} LIMIT ? OFFSET ?`;
      } else {
        let base = `${queryPrefix2} WHERE title LIKE ? AND lang = ? AND type = ?`;
        let paramsOrder = hasOrd ? ` AND ord >= ?` : ``;
        return `${base}${paramsOrder} ORDER by ${orderClause} LIMIT ? OFFSET ?`;
      }
    } else {
      if (type === "post" && langList.includes(lang)) {
        let base = `${queryPrefix} WHERE lang = ?`;
        let paramsOrder = hasOrd ? ` AND ord >= ?` : ``;
        return `${base}${paramsOrder} ORDER by ${orderClause} LIMIT ? OFFSET ?`;
      } else if (type === "nmbr") {
        let base = `SELECT id, ord, nb, nbd, nbm, pub FROM mnumbers WHERE lang = ?`;
        let paramsOrder = hasOrd ? ` AND ord >= ?` : ``;
        return `${base}${paramsOrder} ORDER by ${orderClause} LIMIT ? OFFSET ?`;
      } else {
        return `${queryPrefix2} WHERE lang = ? AND type = ? ORDER by ${orderClause} LIMIT ? OFFSET ?`;
      }
    }
};

