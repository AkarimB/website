import { adminHtml } from '../utils/htmlTemplates.js';

export const getLogged = (req, res) => {
  const html = adminHtml();
  res.status(200).type('html').send(html);
};
