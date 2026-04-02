const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const FIRECRAWL_KEY = process.env.FIRECRAWL_API_KEY;

const FACIAL_KEYWORDS = [
    'hydrafacial', 'facial', 'skin analysis', 'acne', 'peel', 'microneedling', 
    'rejuvenation', 'dermatology', 'skin care', 'carbon peel', 'extraction',
    'mesotherapy', 'skin booster', 'dermal fillers', 'botox'
];

async function scrapeClinic(url) {
    console.log(`Scanning: ${url}...`);
    try {
        const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${FIRECRAWL_KEY}`
            },
            body: JSON.stringify({
                url: url,
                pageOptions: { onlyMainContent: true }
            })
        });

        if (!response.ok) {
            console.log(`  [!] Failed to scrape ${url}`);
            return { url, error: 'Failed' };
        }
        const data = await response.json();
        const markdown = (data.data?.markdown || '').toLowerCase();
        
        const foundServices = FACIAL_KEYWORDS.filter(kw => markdown.includes(kw));
        console.log(`  [+] Found ${foundServices.length} relevant keywords.`);
        
        return {
            url,
            isCompatible: foundServices.length > 0,
            services: foundServices.slice(0, 5),
            score: foundServices.length
        };
    } catch (e) {
        console.log(`  [!] Error: ${e.message}`);
        return { url, error: e.message };
    }
}

async function main() {
    if (!fs.existsSync('dubai_leads_dashboard.html')) {
        console.error("Dashboard file not found!");
        return;
    }

    const dashboardData = fs.readFileSync('dubai_leads_dashboard.html', 'utf8');
    const urls = [];
    // More robust regex to find the website URLs from our specific dashboard structure
    const regex = /href="(https?:\/\/[^"]+)" target="_blank" class="btn btn-sm btn-outline-secondary/g;
    let match;
    while ((match = regex.exec(dashboardData)) !== null) {
        urls.push(match[1]);
    }

    // Deduplicate URLs
    const uniqueUrls = [...new Set(urls)];
    const targetUrls = uniqueUrls.slice(0, 15); // Increase to top 15
    
    console.log(`Processing top ${targetUrls.length} unique clinics for compatibility...`);
    
    const results = [];
    for (const url of targetUrls) {
        const res = await scrapeClinic(url);
        results.push(res);
        await new Promise(r => setTimeout(r, 2000)); // Rate limiting safety
    }

    fs.writeFileSync('deep_scan_results.json', JSON.stringify(results, null, 2));
    
    let report = "# Curescan Compatibility Report (Deep Scan)\n\n";
    report += "This report analyzes clinics to find those offering **facial treatments** (the current core focus of Curescan).\n\n";
    report += "| Clinic URL | Status | Top Facial Services Found | Score |\n";
    report += "|------------|--------|--------------------------|-------|\n";
    
    results.forEach(r => {
        if (r.error) {
            report += `| ${r.url} | ⚠️ ERROR | ${r.error} | - |\n`;
        } else {
            const status = r.isCompatible ? "✅ PERFECT MATCH" : "❌ BODY/OTHER ONLY";
            const svcs = r.services && r.services.length ? r.services.join(", ") : "None detected";
            report += `| ${r.url} | ${status} | ${svcs} | ${r.score} |\n`;
        }
    });

    fs.writeFileSync('DEEP_SCAN_REPORT.md', report);
    console.log("\nScan complete. Open DEEP_SCAN_REPORT.md to see results.");
}

main();
