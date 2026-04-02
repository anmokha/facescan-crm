import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { AnalysisResult } from '@/lib/diagnostic/types';

export async function POST(request: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY is not configured' }, { status: 500 });
    }
    const resend = new Resend(resendApiKey);

    const { leadId, leadUpdateToken } = await request.json();

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const leadRef = adminDb.collection('leads').doc(leadId);
    const leadSnap = await leadRef.get();

    if (!leadSnap.exists) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const leadData = leadSnap.data();
    if (leadData?.leadUpdateToken && leadData.leadUpdateToken !== leadUpdateToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    if (!leadData?.email) {
        return NextResponse.json({ error: 'Lead has no email' }, { status: 400 });
    }
    
    // Prevent duplicate sends (spam protection)
    if (leadData.emailSentAt) {
        const sentTime = leadData.emailSentAt.toDate().getTime();
        const now = Date.now();
        if (now - sentTime < 60 * 60 * 1000) { // 1 hour cooldown
             return NextResponse.json({ success: true, message: 'Email already sent recently' });
        }
    }

    const email = leadData.email;
    const result = leadData.analysisResult as AnalysisResult;
    
    // Fallback if analysis is missing (shouldn't happen)
    if (!result || !result.profile) {
         return NextResponse.json({ error: 'Analysis data missing' }, { status: 400 });
    }

    const score = result.profile?.skin_score || 0;
    const visualAge = result.profile?.visual_age || result.hidden_analysis?.estimated_visual_age || 'N/A';
    
    // Generate HTML Email
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .score-card { background: #f8fafc; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 30px; border: 1px solid #e2e8f0; }
        .score-value { font-size: 48px; font-weight: bold; color: #0f172a; display: block; line-height: 1; margin-bottom: 8px; }
        .score-label { text-transform: uppercase; font-size: 12px; letter-spacing: 1px; color: #64748b; font-weight: bold; }
        .section-title { font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 30px; margin-bottom: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; }
        .prognosis-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin-bottom: 24px; }
        .routine-step { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; }
        .step-num { display: inline-block; background: #0f172a; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; margin-right: 8px; }
        .product-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
        .product-type { color: #0891b2; font-size: 11px; text-transform: uppercase; font-weight: bold; }
        .btn { display: inline-block; background: #0f172a; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-top: 20px; }
        .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Your CureScan Care Map 🧬</h1>
        <p>Personalized analysis and transformation strategy</p>
      </div>

      <div class="score-card">
        <span class="score-label">Your Skin Score</span>
        <span class="score-value">${score}</span>
        <p style="margin: 0; color: #64748b; font-size: 14px;">Visual Age: <strong>${visualAge} years</strong></p>
      </div>

      <div class="prognosis-box">
        <strong style="color: #1e40af; display: block; margin-bottom: 4px;">🎯 Your Success Forecast:</strong>
        ${result.profile?.prognosis?.positive_scenario || "With systematic care, skin quality will improve by 30-40% in 3 months."}
      </div>

      <div class="section-title">Your Routine</div>
      ${result.routine?.map((step: any, i: number) => `
        <div class="routine-step">
          <div style="font-weight: bold; margin-bottom: 4px;">
            <span class="step-num">${i + 1}</span> ${step.stepName}
          </div>
          <div style="font-size: 14px; color: #475569;">${step.instruction}</div>
          ${step.key_ingredients ? `<div style="font-size: 12px; color: #64748b; margin-top: 4px;">🔍 Look for: ${step.key_ingredients}</div>` : ''}
        </div>
      `).join('')}

      <div style="text-align: center;">
        <a href="https://curescan.ai" class="btn">Book Consultation</a>
      </div>

      <div class="footer">
        © 2025 CureScan AI Diagnostic.<br>
        This is an automated analysis. For an accurate diagnosis, please consult a doctor.
      </div>
    </body>
    </html>
    `;

    const { data, error } = await resend.emails.send({
      from: 'CureScan Expert <expert@mail.curescan.pro>', 
      to: [email],
      subject: `Your Personalized Skin Analysis (Score: ${score})`,
      html: htmlContent,
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Update lead with sent timestamp
    await leadRef.update({
        emailSentAt: FieldValue.serverTimestamp()
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Email sending failed:", error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
