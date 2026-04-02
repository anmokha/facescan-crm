const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const FIRECRAWL_KEY = process.env.FIRECRAWL_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

const TARGETS = [
    "https://glowdubai.ae/",
    "https://skin111.com/",
    "https://www.novomed.com/",
    "https://sashaaestheticclinic.ae/",
    "https://amwajpolyclinic.com/"
];

async function deepAnalyze(url) {
    console.log(`\n--- Deep Diving: ${url} ---`);
    try {
        const response = await fetch('https://api.firecrawl.dev/v0/crawl', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${FIRECRAWL_KEY}`
            },
            body: JSON.stringify({
                url: url,
                crawlerOptions: { limit: 5 },
                pageOptions: { onlyMainContent: true }
            })
        });

        if (!response.ok) return { url, error: `Firecrawl init failed: ${response.status}` };
        const crawlJob = await response.json();
        const jobId = crawlJob.jobId;

        let status = 'active';
        let crawlData;
        console.log(`  Job ID: ${jobId}. Waiting...`);
        
        for (let i = 0; i < 40; i++) {
            await new Promise(r => setTimeout(r, 5000));
            const check = await fetch(`https://api.firecrawl.dev/v0/crawl/${jobId}`, {
                headers: { 'Authorization': `Bearer ${FIRECRAWL_KEY}` }
            });
            if (!check.ok) continue;
            crawlData = await check.json();
            if (crawlData.status === 'completed' || crawlData.status === 'failed') {
                status = crawlData.status;
                break;
            }
            console.log(`  Status: ${crawlData.status}...`);
        }

        if (status !== 'completed') return { url, error: `Crawl ${status}` };

        const pages = crawlData.data || [];
        const fullContent = pages.map(p => p.markdown).join("\n\n").slice(0, 30000);
        console.log(`  Scanned ${pages.length} pages. Length: ${fullContent.length}`);

        const prompt = `
        Return ONLY a raw JSON object for the clinic: ${url}.
        Extract:
        1. "machines": Array of specific aesthetic devices.
        2. "brands": Array of skin care brands.
        3. "price_info": String about pricing if found.
        4. "sales_hook": A 2-sentence pitch for Curescan SaaS (AI skin checkup) tailored to their specific services.

        Content:
        ${fullContent}
        `;

        const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const aiData = await aiResponse.json();
        if (!aiData.candidates || !aiData.candidates[0]) {
            return { url, error: "Gemini failed", raw: aiData };
        }

        let text = aiData.candidates[0].content.parts[0].text;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(text);
        
        return { url, ...result };

    } catch (e) {
        console.error(`Error for ${url}:`, e.message);
        return { url, error: e.message };
    }
}

async function main() {
    const finalResults = [];
    for (const url of TARGETS) {
        const data = await deepAnalyze(url);
        finalResults.push(data);
        await new Promise(r => setTimeout(r, 2000));
    }

    fs.writeFileSync('ultra_scan_results.json', JSON.stringify(finalResults, null, 2));

    let report = "# Ultra Scan Report: High-Value Intelligence\n\n";
    finalResults.forEach(r => {
        report += `## ${r.url}\n`;
        if (r.error) {
            report += `**Status:** ⚠️ ${r.error}\n\n`;
        } else {
            report += `**Devices:** ${ (r.machines || []).join(", ") || "None mentioned"}\n`;
            report += `**Brands:** ${ (r.brands || []).join(", ") || "None mentioned"}\n`;
            report += `**Pricing:** ${r.price_info || "Not found"}\n`;
            report += `**Targeted Sales Hook:** ${r.sales_hook}\n\n`;
        }
        report += `---\n`;
    });

    fs.writeFileSync('ULTRA_SCAN_REPORT.md', report);
    console.log("\nDone! Check ULTRA_SCAN_REPORT.md");
}

main();
