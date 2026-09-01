import { QdrantClient } from '@qdrant/js-client-rest';
import { pipeline } from '@huggingface/transformers';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { getApiSession } from '../shared/database.js';

dotenv.config();

const qdrant = new QdrantClient({ url: process.env.QDRANT_URL });
const COLLECTION_NAME = "islam_ms_content";
const BATCH_SIZE = 100; // Send 100 points at a time to optimize network sockets

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ') 
    .replace(/\s+/g, ' ')      
    .trim();
}

function removeBoilerplateGreetings(text) {
  if (!text) return "";
  const patterns = [
    // Arabic
    /بسم الله الرحمن الرحيم/g,
    /الحمد لله[^.]*?رسول الله/g,
    /صلى الله عليه وسلم/g,
    /عليه[ما]؟ الصلاة والسلام/g,
    /صلَّى اللهُ عليهِ وسلَّم/g,
    /الصلاة والسلام على نبي/g,
    // French
    /La louange est à Dieu[^.]*?Mouḥammad/g,
    /Bismi l-Lâhi r-Raḥmâni r-Raḥîm/g,
    /Louanges à Allāh[^.]*?Mouḥammad/g,
    /La louange est à Allāh[^.]*?Mouḥammad/g,
    // English
    /Praise be to God[^.]*?Muḥammad/g,
    /In the name of God[^.]*?Muḥammad/g,
    /Praise be to Allāh[^.]*?Muḥammad/g,
    // Spanish
    /Alabado sea Dios[^.]*?Muḥammad/g,
    /En el nombre de Dios[^.]*?Muḥammad/g,
    // Portuguese
    /Louado seja Deus[^.]*?Mouḥammad/g,
    /Em nome de Deus[^.]*?Mouḥammad/g
  ];
  let clean = text;
  patterns.forEach(p => { clean = clean.replace(p, " "); });
  return clean.replace(/\s+/g, ' ').trim();
}

function chunkText(text, maxWords = 500, overlapWords = 50) {
  const words = text.split(/\s+/);
  const chunks = [];
  
  if (words.length <= maxWords) return [text];

  let start = 0;
  while (start < words.length) {
    const end = start + maxWords;
    const chunk = words.slice(start, end).join(" ");
    chunks.push(chunk);
    start += (maxWords - overlapWords);
  }
  return chunks;
}

function generateDeterministicUUID(id, lang, chunkIndex) {
  const hash = crypto.createHash('sha256')
    .update(`${id}_${lang}_chunk_${chunkIndex}`)
    .digest('hex');
  
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    hash.substring(12, 16),
    hash.substring(16, 20),
    hash.substring(20, 32)
  ].join('-');
}

async function startSync() {
  let session;
  try {
    console.log("Loading BGE-M3 embedding extractor locally...");
    const extractor = await pipeline('feature-extraction', 'Xenova/bge-m3');

    console.log("Connecting to MySQL via X DevAPI...");
    session = await getApiSession();

    console.log("Checking Qdrant collections...");
    const collections = await qdrant.getCollections();
    const collectionExists = collections.collections.some(c => c.name === COLLECTION_NAME);

    // Drop the old collection if it exists to completely purge old tag/metadata vectors
    if (collectionExists) {
      console.log(`Wiping old collection '${COLLECTION_NAME}' for a clean re-sync...`);
      await qdrant.deleteCollection(COLLECTION_NAME);
    }

    // Initialize a fresh collection with named vectors for title + text
    console.log(`Creating fresh collection '${COLLECTION_NAME}' with named vectors...`);
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: {
        "title": { size: 1024, distance: "Cosine" },
        "text":  { size: 1024, distance: "Cosine" }
      }
    });
    console.log("Collection created successfully!");

    console.log("Fetching posts from MySQL table 'post'...");
    const db = session.getSchema();
    const postTable = db.getTable('post');

    const posts = [];
    
    await postTable
      .select(['id', 'title', 'descr', 'content', 'url', 'tags', 'lang', 'ord'])
      .where("pub = 'p'")
      .execute(row => {
        posts.push({
          id: row[0],
          title: row[1],
          descr: row[2],   
          content: row[3], 
          url: row[4],
          tags: row[5],
          lang: row[6],
          ord: row[7]
        });
      });

    console.log(`Found ${posts.length} records to process.`);

    let pointQueue = [];
    let totalProcessedChunks = 0;

    for (const post of posts) {
      const cleanTitle = post.title || "";
      const rawDescr = post.descr || ""; 
      const cleanContent = removeBoilerplateGreetings(stripHtml(post.content || ""));
      const cleanTags = (post.tags || "").replace(/[،,;:؛]/g, ' ').trim();
      
      // Build text content with tags included for better semantic signals
      let baseText = "";
      if (rawDescr && !cleanContent.startsWith(rawDescr.substring(0, 20))) {
         baseText = `${cleanTitle}. ${cleanTags}. ${rawDescr}. ${cleanContent}`;
      } else {
         baseText = `${cleanTitle}. ${cleanTags}. ${cleanContent}`;
      }

      const textChunks = chunkText(baseText, 500, 50);

      for (let i = 0; i < textChunks.length; i++) {
        const chunkSnippet = textChunks[i];

        // Generate title vector
        let titleVector;
        try {
          const titleOutput = await extractor(cleanTitle, { pooling: 'mean', normalize: true });
          titleVector = Array.from(titleOutput.data);
        } catch (extractErr) {
          console.error(`Title embedding error for Post ID ${post.id}:`, extractErr.message);
          continue;
        }

        // Generate text chunk vector
        let textVector;
        try {
          const textOutput = await extractor(chunkSnippet, { pooling: 'mean', normalize: true });
          textVector = Array.from(textOutput.data);
        } catch (extractErr) {
          console.error(`Text embedding error for Post ID ${post.id}:`, extractErr.message);
          continue;
        }

        const pointId = generateDeterministicUUID(post.id, post.lang, i);

        // Queue point up in memory with named vectors
        pointQueue.push({
          id: pointId,
          vector: {
            "title": titleVector,
            "text": textVector
          },
          payload: {
            mysql_id: post.id,
            lang: post.lang,
            url: post.url,
            title: cleanTitle,
            text: chunkSnippet, 
            chunk_id: i,        
            ord: parseFloat(post.ord)
          }
        });

        totalProcessedChunks++;

        // If batch is full, upload and clear the queue
        if (pointQueue.length >= BATCH_SIZE) {
          console.log(`Uploading batch of ${pointQueue.length} points to Qdrant... (Total processed chunks: ${totalProcessedChunks})`);
          await qdrant.upsert(COLLECTION_NAME, {
            wait: true, // We wait here to throttle requests and allow the server to breathe
            points: pointQueue
          });
          pointQueue = []; // Clear queue
        }
      }
    }

    // Upload any remaining points left in the queue at the end
    if (pointQueue.length > 0) {
      console.log(`Uploading final batch of ${pointQueue.length} points to Qdrant...`);
      await qdrant.upsert(COLLECTION_NAME, {
        wait: true,
        points: pointQueue
      });
    }

    console.log(`\n🎉 Sync Successful! ${totalProcessedChunks} chunks safely processed and saved in Qdrant.`);
  } catch (error) {
    console.error("Execution error during Sync:", error);
  } finally {
    if (session) {
      await session.close();
      console.log("MySQL connection closed.");
    }
  }
}

startSync();