// Search microservice — Vector search + reranker (port 8002)
// Loads BGE-M3 + BGE-reranker-base once, serves search queries over HTTP

import express from 'express';
import { QdrantClient } from '@qdrant/js-client-rest';
import { pipeline, AutoTokenizer, AutoModelForSequenceClassification } from '@huggingface/transformers';
import dotenv from 'dotenv';

dotenv.config();

const COLLECTION_NAME = "islam_ms_content";
const qdrant = new QdrantClient({ url: process.env.QDRANT_URL });

let extractor = null;
let tokenizer = null;
let rerankerModel = null;

function getSmartExcerpt(text, query, windowSize = 200) {
    if (!text) return "";
    const lowerText = text.toLowerCase();
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    let matchIdx = -1;
    for (const word of words) {
        const idx = lowerText.indexOf(word);
        if (idx !== -1) { matchIdx = idx; break; }
    }
    if (matchIdx === -1) {
        return text.length > windowSize ? `${text.substring(0, windowSize)}...` : text;
    }
    let start = Math.max(0, matchIdx - Math.floor(windowSize / 3));
    let end = Math.min(text.length, start + windowSize);
    if (end - start < windowSize) start = Math.max(0, end - windowSize);
    let excerpt = text.substring(start, end);
    if (start > 0) excerpt = `...${excerpt}`;
    if (end < text.length) excerpt = `${excerpt}...`;
    return excerpt;
}

async function loadModels() {
    if (!extractor) {
        console.log("Loading BGE-M3 embedding model...");
        extractor = await pipeline('feature-extraction', 'Xenova/bge-m3');
        console.log("Embedding model loaded.");
    }
    if (!tokenizer) {
        console.log("Loading BGE-reranker-base tokenizer...");
        tokenizer = await AutoTokenizer.from_pretrained('Xenova/bge-reranker-base');
    }
    if (!rerankerModel) {
        console.log("Loading BGE-reranker-base model...");
        rerankerModel = await AutoModelForSequenceClassification.from_pretrained('Xenova/bge-reranker-base');
        console.log("Reranker model loaded.");
    }
}

async function searchVectors(queryText, targetLang, offset, limit) {
    const queryOutput = await extractor(queryText, { pooling: 'mean', normalize: true });
    const queryVector = Array.from(queryOutput.data);

    const searchLimit = Math.max(limit * 3, 60);

    const [titleResults, textResults] = await Promise.all([
        qdrant.query(COLLECTION_NAME, {
            query: queryVector,
            using: "title",
            limit: searchLimit,
            filter: { must: [{ key: "lang", match: { value: targetLang } }] },
            with_payload: true
        }).then(r => r.points),
        qdrant.query(COLLECTION_NAME, {
            query: queryVector,
            using: "text",
            limit: searchLimit,
            filter: { must: [{ key: "lang", match: { value: targetLang } }] },
            with_payload: true
        }).then(r => r.points)
    ]);

    const mergedMap = new Map();

    for (const hit of titleResults) {
        mergedMap.set(hit.id, {
            ...hit,
            titleScore: hit.score,
            textScore: 0,
            combinedScore: hit.score * 0.4
        });
    }

    for (const hit of textResults) {
        if (mergedMap.has(hit.id)) {
            const existing = mergedMap.get(hit.id);
            existing.textScore = hit.score;
            existing.combinedScore = existing.titleScore * 0.4 + hit.score * 0.6;
        } else {
            mergedMap.set(hit.id, {
                ...hit,
                titleScore: 0,
                textScore: hit.score,
                combinedScore: hit.score * 0.6
            });
        }
    }

    const mergedResults = Array.from(mergedMap.values());
    mergedResults.sort((a, b) => b.combinedScore - a.combinedScore);

    const rerankedResults = [];

    for (const hit of mergedResults) {
        const documentText = hit.payload.text || "";

        const inputs = tokenizer(queryText, documentText, {
            return_tensors: 'pt',
            truncation: true,
            padding: true
        });
        const outputs = await rerankerModel(inputs);
        const rawLogit = outputs.logits.data[0];

        rerankedResults.push({
            ...hit,
            rerankScore: rawLogit
        });
    }

    rerankedResults.sort((a, b) => b.rerankScore - a.rerankScore);

    const totalResults = rerankedResults.length;
    const paginatedResults = rerankedResults.slice(offset, offset + limit);

    return {
        results: paginatedResults.map(hit => ({
            id: hit.id,
            score: hit.rerankScore,
            payload: {
                ...hit.payload,
                excerpt: getSmartExcerpt(hit.payload.text || "", queryText, 200)
            }
        })),
        total: totalResults,
        offset,
        limit
    };
}

const app = express();
app.disable('x-powered-by');
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', models: extractor !== null });
});

app.post('/search', async (req, res) => {
    try {
        const { q, lang = 'ar', offset = 0, limit = 11 } = req.body;

        if (!q || typeof q !== 'string' || q.trim().length === 0) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const results = await searchVectors(q.trim(), lang, offset, limit);
        res.json(results);
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const port = process.env.SEARCH_PORT || 8002;

loadModels().then(() => {
    app.listen(port, '127.0.0.1', () => {
        console.log(`Search microservice running at http://127.0.0.1:${port}/`);
    });
}).catch(err => {
    console.error("Failed to load models:", err);
    process.exit(1);
});
