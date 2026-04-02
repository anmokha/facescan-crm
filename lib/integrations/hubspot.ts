export interface HubSpotSettings {
    active: boolean;
    access_token: string;
}

export async function createHubSpotContact(settings: HubSpotSettings, lead: any) {
    if (!settings.active || !settings.access_token) return false;

    const url = 'https://api.hubapi.com/crm/v3/objects/contacts';
    
    // Diagnostic Data
    const score = lead.analysisResult?.profile?.skin_score || 0;
    const visualAge = lead.analysisResult?.hidden_analysis?.estimated_visual_age || 0;
    const issues = lead.analysisResult?.profile?.issues?.join(';') || ''; // HubSpot uses ; for multi-select usually, or string

    const body = {
        properties: {
            email: lead.email, // Can be empty, HubSpot might require it or phone
            phone: lead.phone,
            firstname: 'New',
            lastname: 'Lead', // Placeholder
            cure_scan_score: score.toString(), // Custom property (must exist in HubSpot or will be ignored/error if strict)
            // Ideally we use standard fields like 'description' or 'message' for the summary
            description: `[CureScan AI Analysis]\nSkin Score: ${score}\nVisual Age: ${visualAge}\nIssues: ${issues}\nSource: ${lead.tracking?.source || 'direct'}`,
            lifecyclestage: 'lead'
        }
    };

    try {
        console.log('Sending to HubSpot...');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.access_token}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const err = await response.json();
            // If contact exists (409), we might want to update, but for now just log
            if (response.status === 409) {
                console.log('HubSpot: Contact already exists.');
                return true; 
            }
            console.error('HubSpot Error:', err);
            return false;
        }

        const data = await response.json();
        console.log('HubSpot Success:', data.id);
        return true;
    } catch (error) {
        console.error('HubSpot Network Error:', error);
        return false;
    }
}
