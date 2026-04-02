const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function test() {
    const key = process.env.FIRECRAWL_API_KEY;
    if (!key) {
        console.error("Error: FIRECRAWL_API_KEY is not set in .env.local");
        process.exit(1);
    }

    const testUrl = "https://glowdubai.ae/";
    console.log(`Testing Firecrawl with ${testUrl}...`);

    try {
        const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
                url: testUrl,
                pageOptions: { onlyMainContent: true }
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('Firecrawl Error:', err);
            return;
        }

        const data = await response.json();
        const markdown = data.data?.markdown || '';
        console.log(`Success! Scraped ${markdown.length} characters.`);
        console.log("Preview:", markdown.slice(0, 500));
        
        // Save to temp file for analysis
        fs.writeFileSync('firecrawl_test_output.md', markdown);
    } catch (e) {
        console.error('Exception:', e);
    }
}

test();
