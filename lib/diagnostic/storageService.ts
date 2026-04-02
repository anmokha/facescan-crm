import { AnalysisResult, SavedAnalysis } from '@/lib/diagnostic/types';

const STORAGE_KEY = 'analysis_data';

export const saveAnalysisResult = (result: AnalysisResult, photos: string[], email?: string): void => {
  try {
    const data: SavedAnalysis = {
      result,
      photos,
      timestamp: Date.now(),
      email
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('Analysis result saved to localStorage');
  } catch (error) {
    console.error('Failed to save analysis result:', error);
  }
};

export const loadAnalysisResult = (): SavedAnalysis | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data: SavedAnalysis = JSON.parse(stored);

    // Optional: Check if result is older than 30 days
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - data.timestamp > thirtyDaysInMs) {
      // Result is too old, clear it
      clearAnalysisResult();
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to load analysis result:', error);
    return null;
  }
};

export const updateAnalysisEmail = (email: string): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const data: SavedAnalysis = JSON.parse(stored);
    data.email = email;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('Email added to saved analysis');
  } catch (error) {
    console.error('Failed to update analysis email:', error);
  }
};

export const clearAnalysisResult = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Analysis result cleared from localStorage');
  } catch (error) {
    console.error('Failed to clear analysis result:', error);
  }
};
