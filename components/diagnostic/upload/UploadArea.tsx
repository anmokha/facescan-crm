import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, Plus, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { UploadedImage } from '@/lib/diagnostic/types';
import imageCompression from 'browser-image-compression';
import { validateFaceInImage } from '@/lib/diagnostic/faceDetector';
import { getMessages } from '@/lib/i18n/messages';
import type { Locale } from '@/lib/i18n';

interface UploadAreaProps {
  images: UploadedImage[];
  setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  uploadHint?: string;
  locale?: Locale;
}

const UploadArea: React.FC<UploadAreaProps> = ({
  images,
  setImages,
  onAnalyze,
  isAnalyzing,
  uploadHint,
  locale = 'en-US'
}) => {
  const messages = getMessages(locale);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasConsent, setHasConsent] = useState(false);

  const processFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    setIsProcessing(true);
    setErrorMsg(null);

    const options = {
      maxSizeMB: 1.2,
      maxWidthOrHeight: 1600,
      useWebWorker: true
    };

    try {
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        // Skip non-image files
        if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.heic')) continue;

        // --- ВАЛИДАЦИЯ ЛИЦА ---
        const { hasFace } = await validateFaceInImage(file);
        if (!hasFace) {
            setErrorMsg(messages.uploadErrorNoFace);
            continue; // Пропускаем это фото
        }

        let processedFile = file;

        // 1. HEIC Conversion (for iOS/Android Live Photos)
        if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
             try {
                 console.log('Detected HEIC file, converting...');
                 // Dynamic import to avoid SSR issues with window
                 const heic2any = (await import('heic2any')).default;
                 
                 const convertedBlob = await heic2any({
                     blob: file,
                     toType: 'image/jpeg',
                     quality: 0.8
                 });
                 
                 // Handle array result (rare, but possible with burst photos)
                 const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                 processedFile = new File([blob], file.name.replace(/\.heic$/i, ".jpg"), { type: 'image/jpeg' });
                 console.log('HEIC converted successfully');
             } catch (heicError) {
                 console.error('HEIC conversion failed:', heicError);
                 // We continue, hoping browser might handle it natively or fallback works
             }
        }

        // 2. Compression (Standard Logic)
        try {
           processedFile = await imageCompression(processedFile, options);
        } catch (workerError) {
           console.warn('WebWorker compression failed, trying main thread fallback:', workerError);
           try {
             // Fallback: No WebWorker
             processedFile = await imageCompression(processedFile, { ...options, useWebWorker: false });
           } catch (fallbackError) {
             console.error('Compression failed completely:', fallbackError);
             // If file is small enough (< 2MB), try using original
             if (processedFile.size < 2 * 1024 * 1024) {
                console.log('Using original file as fallback (small enough)');
             } else {
                throw new Error(messages.uploadErrorFileSize);
             }
           }
        }
        
        // 3. Convert to Base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve((e.target.result as string).split(',')[1]);
            } else {
              reject(new Error('Failed to read file'));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(processedFile);
        });

        const base64 = await base64Promise;

        setImages(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          url: URL.createObjectURL(processedFile),
          file: processedFile,
          base64
        }]);
      }
    } catch (error: any) {
      console.error('Processing error:', error);
      alert(`${messages.uploadErrorGeneric}: ${error.message || ''}`);
    } finally {
      setIsProcessing(false);
    }
  }, [setImages, messages]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    processFiles(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative group border-2 border-dashed rounded-3xl p-8 transition-all duration-300 ease-in-out bg-white
          ${images.length > 0 ? 'border-primary-200' : 'border-stone-300 hover:border-primary-400 hover:bg-stone-50'}
          ${isProcessing ? 'opacity-70 pointer-events-none' : ''}
        `}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {isProcessing && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-3xl">
              <Loader2 className="animate-spin text-primary-500 mb-2" size={32} />
              <p className="text-sm font-bold text-stone-700">{messages.uploadProcessing}</p>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-medium">{errorMsg}</p>
            <button onClick={() => setErrorMsg(null)} className="ml-auto text-red-400 hover:text-red-600">
                <X size={16} />
            </button>
          </div>
        )}

        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 cursor-pointer"
               onClick={() => fileInputRef.current?.click()}>
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4 text-primary-500 group-hover:scale-110 transition-transform">
              <Upload size={32} />
            </div>
            <h3 className="font-serif text-2xl text-stone-800 mb-2">{messages.uploadTitle}</h3>
            <p className="text-stone-500 max-w-sm mb-6 text-sm leading-relaxed">
              {uploadHint || messages.uploadDragHint}
            </p>
            <button className="px-6 py-2.5 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-all">
              {messages.uploadSelectButton}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden shadow-sm group/img">
                  <img src={img.url} alt="Uploaded" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors opacity-0 group-hover/img:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {images.length < 4 && (
                 <button
                   onClick={() => fileInputRef.current?.click()}
                   className="aspect-square rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 hover:text-primary-500 hover:border-primary-300 hover:bg-primary-50 transition-all"
                 >
                   <Plus size={24} />
                   <span className="text-xs font-medium mt-1">{messages.uploadAddMore}</span>
                 </button>
              )}
            </div>

            <div className="flex justify-center pt-2 flex-col items-center gap-4">
              
              {/* CONSENT CHECKBOX */}
              <label className="flex items-start gap-3 text-sm text-stone-600 max-w-md mx-auto cursor-pointer group select-none">
                  <div className="relative flex items-center mt-0.5">
                      <input 
                          type="checkbox" 
                          className="peer sr-only"
                          checked={hasConsent}
                          onChange={(e) => setHasConsent(e.target.checked)}
                      />
                      <div className="w-5 h-5 border-2 border-stone-300 rounded bg-white peer-checked:bg-stone-800 peer-checked:border-stone-800 transition-all"></div>
                      <svg className="absolute w-3.5 h-3.5 text-white left-1 top-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                  </div>
                  <span className="leading-tight group-hover:text-stone-800 transition-colors">
                      {messages.uploadConsent}
                  </span>
              </label>

              {/* Privacy & Consent Notice */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900 mb-1">
                      Privacy & Consent
                    </p>
                    <p className="text-blue-800 leading-relaxed mb-2">
                      By clicking "Analyze", you agree to our processing of your photos for cosmetic skin analysis.
                      Photos are stored securely for 30 days and can be deleted upon request.
                    </p>
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      className="text-blue-600 underline text-xs font-medium hover:text-blue-700"
                    >
                      Privacy Policy →
                    </a>
                  </div>
                </div>
              </div>

              <button
                onClick={onAnalyze}
                disabled={isAnalyzing || isProcessing || !hasConsent}
                className={`
                  relative px-8 py-3.5 rounded-full font-medium text-lg shadow-lg transition-all
                  ${(isAnalyzing || isProcessing || !hasConsent)
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:-translate-y-0.5 hover:shadow-primary-500/40 shadow-primary-500/20'}
                `}
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-stone-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {messages.uploadAnalyzing}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles size={18} />
                    {messages.uploadAnalyzeButton}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => processFiles(e.target.files)}
        className="hidden"
        multiple
        accept="image/*,.heic"
      />
    </div>
  );
};

export default UploadArea;