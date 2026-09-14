import { chromium } from 'playwright';

const BASE = 'https://server.islam.ms';
const browser = await chromium.launch({ headless: true });
const results = [];

function log(test, status, detail = '') {
    const icon = status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${test}${detail ? ' — ' + detail : ''}`);
    results.push({ test, status, detail });
}

async function countResults(page, url) {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    if (resp.status() !== 200) return { count: 0, status: resp.status() };
    const cards = await page.$$eval('.extra', els => els.length);
    return { count: cards, status: resp.status() };
}

const page = await browser.newPage();

// 1. Exact match search
{
    const r = await countResults(page, `${BASE}/fr?q=islam`);
    log('Exact match "islam"', r.count > 0 ? 'PASS' : 'FAIL', `${r.count} results`);
}

// 2. Fuzzy search: typo "aprendre" → should find "apprendre"
{
    const r = await countResults(page, `${BASE}/fr?q=aprendre`);
    log('Fuzzy "aprendre" → "apprendre"', r.count > 0 ? 'PASS' : 'FAIL', `${r.count} results`);
}

// 3. Fuzzy search: missing letter "prier" → should find "prière"
{
    const r = await countResults(page, `${BASE}/fr?q=prier`);
    log('Fuzzy "prier" → "prière"', r.count > 0 ? 'PASS' : 'FAIL', `${r.count} results`);
}

// 4. Fuzzy search: extra letter "prophete" (no accent) → should find "prophète"
{
    const r = await countResults(page, `${BASE}/fr?q=prophete`);
    log('Fuzzy "prophete" → "prophète"', r.count > 0 ? 'PASS' : 'FAIL', `${r.count} results`);
}

// 5. Fuzzy search: swapped letters "croyence" → should find "croyance"
{
    const r = await countResults(page, `${BASE}/fr?q=croyence`);
    log('Fuzzy "croyence" → "croyance"', r.count > 0 ? 'PASS' : 'FAIL', `${r.count} results`);
}

// 6. Exact multi-word search
{
    const r = await countResults(page, `${BASE}/fr?q=Dieu+existe`);
    log('Multi-word "Dieu existe"', r.count > 0 ? 'PASS' : 'FAIL', `${r.count} results`);
}

// 7. Arabic search
{
    const r = await countResults(page, `${BASE}/ar?q=صلاة`);
    log('Arabic search "صلاة"', r.count > 0 ? 'PASS' : 'FAIL', `${r.count} results`);
}

// 8. Arabic fuzzy: "صلاه" (no diacritics) → "صلاة"
{
    const r = await countResults(page, `${BASE}/ar?q=صلاه`);
    log('Arabic fuzzy "صلاه" → "صلاة"', r.count > 0 ? 'PASS' : 'FAIL', `${r.count} results`);
}

// 9. English search
{
    const r = await countResults(page, `${BASE}/en?q=prayer`);
    log('English search "prayer"', r.count > 0 ? 'PASS' : 'FAIL', `${r.count} results`);
}

// 10. English fuzzy: "prayr" → "prayer"
{
    const r = await countResults(page, `${BASE}/en?q=prayr`);
    log('English fuzzy "prayr" → "prayer"', r.count > 0 ? 'PASS' : 'FAIL', `${r.count} results`);
}

// 11. Search results have titles (not undefined)
{
    await page.goto(`${BASE}/fr?q=islam`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const titles = await page.$$eval('.extra h2 a', els => els.map(e => e.textContent.trim()).slice(0, 3));
    const allValid = titles.every(t => t.length > 0 && !t.includes('undefined'));
    log('Search results have valid titles', allValid ? 'PASS' : 'FAIL', titles.join(' | '));
}

// 12. Search results have descriptions
{
    const descrs = await page.$$eval('.extra p:first-of-type', els => els.map(e => e.textContent.trim()).slice(0, 3));
    const allValid = descrs.every(d => d.length > 0 && !d.includes('undefined'));
    log('Search results have valid descriptions', allValid ? 'PASS' : 'FAIL', `${descrs.length} checked`);
}

// 13. Search results have valid links
{
    const links = await page.$$eval('.extra h2 a', els => els.map(e => e.getAttribute('href')).slice(0, 3));
    const allValid = links.every(l => l && l.length > 1 && !l.includes('undefined'));
    log('Search results have valid links', allValid ? 'PASS' : 'FAIL', links.join(' | '));
}

// 14. Search pagination works
{
    const r = await countResults(page, `${BASE}/fr/p/1?q=islam`);
    log('Search pagination page 1', r.count > 0 ? 'PASS' : 'FAIL', `${r.count} results`);
}

// 15. Nonsense query returns few results (trigram may catch loose matches)
{
    const r = await countResults(page, `${BASE}/fr?q=xyznonexistent`);
    log('Nonsense query has few results', r.count <= 3 ? 'PASS' : 'FAIL', `${r.count} results`);
}

// Summary
const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
console.log(`\n=== SEARCH TESTS: ${passed} passed, ${failed} failed ===`);

await browser.close();
process.exit(failed > 0 ? 1 : 0);
