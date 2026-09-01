import 'dotenv/config';

export async function purgeCacheByUrls(urls) {
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
    const ZONE_ID = process.env.ZONE_ID;

    if (!CLOUDFLARE_API_TOKEN || !ZONE_ID) {
        throw new Error('Cloudflare credentials missing in .env');
    }

    const files = Array.isArray(urls) ? urls : [urls];

    const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ files }),
        }
    );

    return await response.json();
}
