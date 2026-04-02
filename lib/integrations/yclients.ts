export interface YClientsSettings {
    active: boolean;
    company_id: string;
    token: string;
}

export async function createYClientsClient(settings: YClientsSettings, lead: any) {
    if (!settings.active || !settings.token || !settings.company_id) return false;

    const url = `https://api.yclients.com/api/v1/clients/${settings.company_id}`;
    
    // Construct comment with diagnostic details
    const score = lead.analysisResult?.profile?.skin_score || 0;
    const issues = lead.analysisResult?.profile?.issues?.join(', ') || 'нет';
    const comment = `[CureScan AI] Skin Score: ${score}/100. Проблемы: ${issues}. Источник: ${lead.tracking?.source || 'direct'}`;

    const body = {
        name: lead.phone || 'New Lead', // YCLIENTS requires name, use phone as fallback or parse if available
        phone: lead.phone,
        comment: comment
    };

    try {
        console.log(`Sending to YCLIENTS (${settings.company_id})...`);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.token}`,
                'Accept': 'application/vnd.yclients.v2+json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const err = await response.text();
            console.error(`YCLIENTS Error: ${response.status}`, err);
            return false;
        }

        const data = await response.json();
        console.log('YCLIENTS Success:', data);
        return true;
    } catch (error) {
        console.error('YCLIENTS Network Error:', error);
        return false;
    }
}
