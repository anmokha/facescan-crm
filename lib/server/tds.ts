import { adminDb } from '@/lib/firebaseAdmin';
import { ExtendedClientConfig } from './clientConfig';

/**
 * Traffic Distribution System (TDS)
 * Selects a prospective clinic based on assigned weights.
 */

export async function getWeightedProspectClinic(): Promise<ExtendedClientConfig | null> {
    try {
        // 1. Fetch all active prospects
        const snap = await adminDb.collection('clinics')
            .where('type', '==', 'prospect')
            .where('isActive', '==', true)
            .get();

        if (snap.empty) return null;

        const prospects = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as any[];

        // 2. Filter out those with 0 weight (safety)
        const validProspects = prospects.filter(p => (p.trafficWeight || 0) > 0);
        if (validProspects.length === 0) {
            // Fallback to random if all are 0 but active
            const random = prospects[Math.floor(Math.random() * prospects.length)];
            return mapDocToConfig(random);
        }

        // 3. Weighted selection
        const totalWeight = validProspects.reduce((sum, p) => sum + p.trafficWeight, 0);
        let random = Math.random() * totalWeight;

        for (const prospect of validProspects) {
            random -= prospect.trafficWeight;
            if (random <= 0) {
                return mapDocToConfig(prospect);
            }
        }

        return mapDocToConfig(validProspects[0]);

    } catch (error) {
        console.error('TDS Selection Error:', error);
        return null;
    }
}

function mapDocToConfig(doc: any): ExtendedClientConfig {
    return {
        id: doc.slug,
        uid: doc.id,
        name: doc.name,
        slug: doc.slug,
        defaultCountry: doc.defaultCountry || 'AE',
        defaultLocale: doc.defaultLocale || 'en-US',
        supportedLocales: doc.supportedLocales || ['en-US'],
        leadUnlockMethod: doc.leadUnlockMethod || 'phone',
        primaryContactChannel: doc.contactChannel || 'whatsapp',
        whatsappNumber: doc.whatsappNumber,
        instagramHandle: doc.instagramHandle,
        theme: doc.theme || { primaryColor: '#0f172a' },
        modules: doc.modules || ['skin'],
        texts: doc.texts || {},
        services: doc.services || [],
        customSystemPrompt: doc.customSystemPrompt,
        isPilot: true, // Prospects are treated as pilot for UI purposes
        status: 'active'
    } as ExtendedClientConfig;
}
