import dotenv from 'dotenv';

dotenv.config();

const SEARCH_URL = process.env.SEARCH_URL || 'http://127.0.0.1:8002';

function getSmartExcerpt(text, query, windowSize = 200) {
    if (!text) return "N/A";

    let cleanText = text
        .replace(/^Title:\s*.*?\s*Description:\s*/i, '')
        .trim();

    const lowerText = cleanText.toLowerCase();
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    let matchIdx = -1;

    for (const word of words) {
        const idx = lowerText.indexOf(word);
        if (idx !== -1) {
            matchIdx = idx;
            break;
        }
    }

    if (matchIdx === -1) {
        return cleanText.length > windowSize ? `${cleanText.substring(0, windowSize)}...` : cleanText;
    }

    let start = Math.max(0, matchIdx - Math.floor(windowSize / 3));
    let end = Math.min(cleanText.length, start + windowSize);

    if (end - start < windowSize) {
        start = Math.max(0, end - windowSize);
    }

    let excerpt = cleanText.substring(start, end);

    if (start > 0) excerpt = `...${excerpt}`;
    if (end < cleanText.length) excerpt = `${excerpt}...`;

    return excerpt;
}

async function search(queryText, targetLang = 'ar', finalLimit = 11, offset = 0) {
    console.log(`\n🔍 Query: "${queryText}" [Lang: ${targetLang}] Offset: ${offset} Limit: ${finalLimit}`);
    console.log(`⏳ Calling search microservice at ${SEARCH_URL}...`);

    const response = await fetch(`${SEARCH_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: queryText, lang: targetLang, offset, limit: finalLimit })
    });

    if (!response.ok) {
        const error = await response.text();
        console.error(`❌ Search failed: ${response.status} ${error}`);
        process.exit(1);
    }

    const data = await response.json();
    const { results, total } = data;

    console.log(`\n✨ Results ${offset + 1}-${offset + results.length} of ${total} (Reranker-Optimized):`);
    results.forEach((hit, index) => {
        const targetedExcerpt = getSmartExcerpt(hit.payload.text || "", queryText, 400);

        console.log(`\n[${offset + index + 1}] Relevancy: ${hit.score.toFixed(4)}`);
        console.log(`📄 Source Article: ${hit.payload.title || 'N/A'}`);
        console.log(`🌐 Language: ${hit.payload.lang || 'N/A'}`);
        console.log(`🎯 Context Match: "${targetedExcerpt}"`);
        console.log(`--------------------------------------------------`);
    });

    return data;
}

const args = process.argv.slice(2);
const query = args[0] || "الصلاة";
const lang = args[1] || "ar";
const limit = parseInt(args[2]) || 11;
const offset = parseInt(args[3]) || 0;

search(query, lang, limit, offset);
