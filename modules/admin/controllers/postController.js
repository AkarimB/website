import { listPostHtml, postHtml, nmbrHtml, hiddenInputHtml } from '../utils/htmlTemplates.js';
import { getLangSettings } from '../utils/helpers.js';
import { langList } from '../../../shared/constants.js';

export const listPost = async (req, res) => {
  const { type, lang } = req.params;
  const { q = '' } = req.query;

  try {
    const {submit, addText } = getLangSettings(lang, q);
    const infoM = `<div class='info'><a target='_blank' href="/idara/admin/posts/add/${type}/${lang}">${addText}</a></div>`;
    let siteTitle = 'islam.ms';
    let siteDesc = 'islam.ms';
    if (q) {
      siteTitle = `${q}. ${siteTitle}`;
      siteDesc = `${q}. ${siteDesc}`;
    }
    const display = 'style="display: block;"';
    const action = `/idara/admin/posts/list/${type}/${lang}/`;
    const menu = '';
    const footer = '';
    const html = listPostHtml(lang, siteTitle, siteDesc, menu, display, action, q, submit, infoM, '', '', footer);
    res.status(200).type('html').send(html);
  } catch (err) {
    console.error("listPost error:", err);
    res.redirect('/idara/admin/logged');
  }
};

export const newPost = async (req, res) => {
  const { type, lang } = req.params;
  const validLang = langList.includes(lang) ? lang : 'fr';
  let html = '', addText = '';
  try {
    addText = res.__({ phrase: 'addText', locale: validLang });
    const infoAdd = `<p><a target='_blank' href="/idara/admin/posts/add/${type}/${validLang}">${addText}</a></p>`;
    const hiddenInput = hiddenInputHtml('', type, validLang);
    const link = `<p id="link"></p>`;
    if (type === 'nmbr') {
      html = nmbrHtml(link, hiddenInput, '', '', '', '', '', validLang);
    } else {
      html = postHtml(infoAdd, type, link, hiddenInput, '', '', '', '', '', '', '', validLang);
    }
    res.status(200).type('html').send(html);
  } catch (err) {
    console.error(`newPost error: ${err.message}`);
    res.redirect('/idara/admin/logged');
  }
};

export const getPostEdit = async (req, res) => {
  const { type, lang, id } = req.params;
  const validLang = langList.includes(lang) ? lang : 'fr';
  let html = '', addText = '';
  try {
    if (!id || isNaN(id)) {
      return res.redirect(`/idara/admin/posts/list/${type}/${validLang}/`);
    }
    addText = res.__({ phrase: 'addText', locale: validLang });
    const infoAdd = `<p><a target='_blank' href="/idara/admin/posts/add/${type}/${validLang}">${addText}</a></p>`;
    const hiddenInput = hiddenInputHtml(id, type, validLang);
    const link = `<p id="link"></p>`;
    if (type === 'nmbr') {
      html = nmbrHtml(link, hiddenInput, '', '', '', '', '', validLang);
    } else {
      html = postHtml(infoAdd, type, link, hiddenInput, '', '', '', '', '', '', '', validLang);
    }
    res.status(200).type('html').send(html);
  } catch (err) {
    console.error(`getPostEdit error: ${err.message}`);
    res.redirect('/idara/admin/logged');
  }
};
