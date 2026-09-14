import { chromium } from 'playwright';

const BASE = 'https://server.islam.ms';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const results = [];

function log(test, status, detail = '') {
    const icon = status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${test}${detail ? ' — ' + detail : ''}`);
    results.push({ test, status, detail });
}

// 1. Individual post: no literal \n
try {
    await page.goto(`${BASE}/devenir-musulman-se-convertir-islam`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const bodyText = await page.$eval('#content', el => el.innerHTML);
    const hasLiteralNewline = bodyText.includes('\\n');
    log('Post no literal \\n', !hasLiteralNewline ? 'PASS' : 'FAIL');
} catch (e) {
    log('Post no literal \\n', 'FAIL', e.message);
}

// 2. Individual post: has content
try {
    await page.goto(`${BASE}/devenir-musulman-se-convertir-islam`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const hasAudio = await page.$('audio') !== null;
    const hasContent = await page.$$eval('#content p', els => els.length > 3);
    log('Post has content', hasAudio || hasContent ? 'PASS' : 'FAIL');
} catch (e) {
    log('Post has content', 'FAIL', e.message);
}

// 3. Individual post: prev/next navigation
try {
    await page.goto(`${BASE}/devenir-musulman-se-convertir-islam`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const navLinks = await page.$$('.relat a');
    log('Post has prev/next nav', navLinks.length > 0 ? 'PASS' : 'FAIL', `${navLinks.length} links`);
} catch (e) {
    log('Post has prev/next nav', 'FAIL', e.message);
}

// 4. Individual post: tags
try {
    await page.goto(`${BASE}/devenir-musulman-se-convertir-islam`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const tags = await page.$$('.tags a');
    log('Post has tags', tags.length > 0 ? 'PASS' : 'FAIL', `${tags.length} tags`);
} catch (e) {
    log('Post has tags', 'FAIL', e.message);
}

// 5. French homepage: 12 posts
try {
    await page.goto(`${BASE}/fr`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const cards = await page.$$('.extra');
    log('French homepage has 12 posts', cards.length === 12 ? 'PASS' : 'FAIL', `${cards.length} posts`);
} catch (e) {
    log('French homepage has 12 posts', 'FAIL', e.message);
}

// 6. French pagination: page 2 has posts
try {
    await page.goto(`${BASE}/fr/p/2`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const cards = await page.$$('.extra');
    log('French page 2 has posts', cards.length === 12 ? 'PASS' : 'FAIL', `${cards.length} posts`);
} catch (e) {
    log('French page 2 has posts', 'FAIL', e.message);
}

// 7. French pagination: page 10 has posts
try {
    await page.goto(`${BASE}/fr/p/10`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const cards = await page.$$('.extra');
    log('French page 10 has posts', cards.length > 0 ? 'PASS' : 'FAIL', `${cards.length} posts`);
} catch (e) {
    log('French page 10 has posts', 'FAIL', e.message);
}

// 8. French pagination: next/prev links
try {
    await page.goto(`${BASE}/fr/p/5`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const prevLink = await page.$('.lin a[href*="p/4"]');
    const nextLink = await page.$('.lin a[href*="p/6"]');
    log('French page 5 has prev/next', prevLink && nextLink ? 'PASS' : 'FAIL');
} catch (e) {
    log('French page 5 has prev/next', 'FAIL', e.message);
}

// 9. Arabic homepage
try {
    await page.goto(`${BASE}/ar`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const cards = await page.$$('.extra');
    log('Arabic homepage has posts', cards.length > 0 ? 'PASS' : 'FAIL', `${cards.length} posts`);
} catch (e) {
    log('Arabic homepage has posts', 'FAIL', e.message);
}

// 10. English page
try {
    await page.goto(`${BASE}/en`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const cards = await page.$$('.extra');
    log('English homepage has posts', cards.length > 0 ? 'PASS' : 'FAIL', `${cards.length} posts`);
} catch (e) {
    log('English homepage has posts', 'FAIL', e.message);
}

// 11. Footer: no literal \n
try {
    await page.goto(`${BASE}/fr`, { waitUntil: 'load', timeout: 10000 });
    const footerHtml = await page.$eval('.footer', el => el.innerHTML);
    const hasLiteralNewline = footerHtml.includes('\\n');
    log('Footer no literal \\n', !hasLiteralNewline ? 'PASS' : 'FAIL');
} catch (e) {
    log('Footer no literal \\n', 'FAIL', e.message);
}

// 12. Search in multiple languages
try {
    await page.goto(`${BASE}/fr?q=prière`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const frResults = await page.$$('.extra');
    log('French search works', frResults.length > 0 ? 'PASS' : 'FAIL', `${frResults.length} results`);
} catch (e) {
    log('French search works', 'FAIL', e.message);
}

// Summary
const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
console.log(`\n=== SUMMARY: ${passed} passed, ${failed} failed ===`);

await browser.close();
process.exit(failed > 0 ? 1 : 0);
