import { db } from '@/lib/diagnostic/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export interface WebhookPayload {
  event: 'lead.created' | 'lead.updated';
  lead: {
    id: string;
    phone: string;
    email?: string;
    name?: string;
    created_at: string;
    marketing_data: {
      source: string;
      campaign: string;
    };
    diagnostic_result: {
      skin_score: number;
      skin_type: string;
      visual_age: number;
      concerns: string[];
      vip_status: boolean;
    };
  };
}

export async function triggerWebhook(clinicId: string, leadData: any) {
  try {
    // 1. Get Clinic Settings
    // Note: In server context we might use adminDb, but for now we reuse client config logic or pass settings directly
    // Ideally, we fetch settings inside the API route to minimize db calls here, but let's fetch for safety
    // Assuming this runs in API route context where we can fetch settings.
    
    // We need to fetch the Integration Settings. 
    // Since we don't have direct access to adminDb here easily without context, 
    // we will rely on the caller passing the webhook URL or fetching it here if needed.
    // For MVP, let's assume this function is called from API route where we can fetch.
    
    // Placeholder: The actual fetching will happen in the API route to avoid circular deps or context issues
    // This function will just do the sending.
    
    return true; 
  } catch (e) {
    console.error("Webhook trigger failed (placeholder)", e);
    return false;
  }
}

// Actual Sender Function
export async function sendWebhook(url: string, payload: WebhookPayload) {
    if (!url) return;
    
    try {
        console.log(`Sending webhook to ${url}...`);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CureScan-Event': payload.event,
                'User-Agent': 'CureScan-Webhook/1.0'
            },
            body: JSON.stringify(payload),
            // Timeout 5s to not block the lead submission too long
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            console.warn(`Webhook failed with status: ${response.status} ${response.statusText}`);
            return false;
        }
        console.log("Webhook sent successfully");
        return true;
    } catch (error) {
        console.error("Webhook sending error:", error);
        return false;
    }
}
