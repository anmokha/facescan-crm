import { db } from '@/lib/diagnostic/firebaseConfig';
import { collection, addDoc } from "firebase/firestore";
import { HairProfile, AnalysisResult } from '@/lib/diagnostic/types';

// Save lead (email + analysis data) to Firebase
export const saveLead = async (email: string, profile: HairProfile, fullResult?: AnalysisResult): Promise<void> => {
  try {
    const leadData: any = {
      email,
      curlType: profile.curlType,
      porosity: profile.porosity,
      timestamp: Date.now(),
      source: 'AI Diagnostic'
    };

    // Save full analysis result if provided
    if (fullResult) {
      leadData.analysisResult = fullResult;
    }

    await addDoc(collection(db, "leads"), leadData);
    console.log('Lead saved to Firebase');
  } catch (error) {
    console.error('Error saving lead to Firebase: ', error);

    // Fallback to localStorage if Firebase fails
    try {
      const existing = localStorage.getItem('diagnostic_leads');
      const leads = existing ? JSON.parse(existing) : [];
      leads.push({
        email,
        curlType: profile.curlType,
        porosity: profile.porosity,
        timestamp: Date.now(),
        analysisResult: fullResult
      });
      localStorage.setItem('diagnostic_leads', JSON.stringify(leads));
      console.log('Lead saved to localStorage (fallback)');
    } catch (e) {
      console.error("Local storage fallback failed", e);
    }
  }
};
