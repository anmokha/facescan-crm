import { AnalysisResult } from "@/lib/diagnostic/types";

export const analyzeHairImages = async (
  base64Images: string[],
  diagnosticType: string = 'hair',
  customerId?: string,
  locale?: string,
  tracking?: any
): Promise<AnalysisResult> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Include session token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('customerSession');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        images: base64Images,
        diagnosticType,
        customerId,
        locale,
        tracking
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to analyze images' }));
      throw new Error(errorData.error || "Analysis failed. Please try again.");
    }

    const result = await response.json() as AnalysisResult;
    return result;

  } catch (error: any) {
    console.error("Analysis Error:", error);
    throw new Error(error.message || "Analysis failed. Please try again.");
  }
};
