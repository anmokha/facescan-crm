import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Marker } from '@/lib/diagnostic/types';

interface FaceScannerProps {
  imageSrc: string;
  markers?: Marker[];
  onScanComplete?: () => void;
  isLoading?: boolean;
}

const FaceScanner: React.FC<FaceScannerProps> = ({ imageSrc, markers = [], onScanComplete, isLoading = false }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [showMarkers, setShowMarkers] = useState(false);

  // If we are loading, we are definitely scanning.
  // If loading stops, we might still be finishing the scan animation.
  useEffect(() => {
    if (isLoading) {
      setIsScanning(true);
      setShowMarkers(false);
    }
  }, [isLoading]);

  const handleAnimationComplete = () => {
    if (isLoading) {
      // If still loading, we just let it loop (handled by transition repeat), 
      // OR we can manually restart if we weren't using repeat: Infinity.
      // But using repeat: Infinity is easier for "loading" state.
      // However, we want to STOP looping when isLoading becomes false.
      return; 
    }
    
    // If not loading, this scan is the "final" one (or the single one)
    setIsScanning(false);
    setShowMarkers(true);
    if (onScanComplete) onScanComplete();
  };

  return (
    <div className="relative w-full max-w-lg mx-auto overflow-hidden rounded-3xl bg-slate-900 shadow-2xl mb-8 border border-slate-800">
      <div className="relative">
        {/* 1. Source Image */}
        {imageSrc ? (
            <img 
            src={imageSrc} 
            className={`w-full h-auto block transition-all duration-1000 ${isScanning ? 'opacity-70 grayscale-[30%]' : 'opacity-100'}`}
            alt="Analysis Subject"
            />
        ) : (
            <div className="w-full aspect-[3/4] bg-slate-800 flex items-center justify-center text-slate-600">
                No Image
            </div>
        )}

        {/* 2. Scanning Beam */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              key={isLoading ? 'scanning-loop' : 'scanning-final'}
              initial={{ top: '-10%' }}
              animate={{ top: '110%' }}
              transition={{ 
                duration: 2.5, 
                ease: "easeInOut",
                repeat: isLoading ? Infinity : 0,
                repeatDelay: 0.1 
              }}
              onAnimationComplete={handleAnimationComplete}
              style={{ willChange: 'top' }}
              className="absolute left-0 right-0 h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.6)] z-10 opacity-80 transform-gpu"
            />
          )}
        </AnimatePresence>

        {/* 3. Grid overlay */}
        {isScanning && (
             <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        )}

        {/* 4. Markers Layer (SVG) */}
        <div className="absolute inset-0 z-20 pointer-events-none">
             <AnimatePresence>
              {(!isScanning || showMarkers) && markers.map((marker, idx) => (
                <MarkerPoint key={idx} marker={marker} />
              ))}
            </AnimatePresence>
        </div>
      </div>
      
      {/* Status Overlay */}
      {isScanning && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center z-30 pointer-events-none">
              <div className="bg-black/60 backdrop-blur-md text-cyan-400 text-xs font-mono px-4 py-2 rounded-full border border-cyan-500/30 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  AI ANALYSIS IN PROGRESS...
              </div>
          </div>
      )}
    </div>
  );
};

const MarkerPoint = ({ marker }: { marker: Marker }) => {
    // Convert 0-1000 to percentage
    const xPct = marker.x / 10;
    const yPct = marker.y / 10;
    const duration = 2.5; // Must match beam duration
    // Calculate delay so marker appears when beam hits it (approx)
    // Beam goes from -10% to 110% over 2.5s.
    // Total distance = 120%. Speed = 120 / 2.5 = 48 %/s.
    // Position starts at -10.
    // Time to reach Y% = (Y - (-10)) / 48
    // Simplified: delay roughly proportional to Y
    const delay = (yPct / 100) * duration;

    return (
        <motion.div
            className="absolute w-0 h-0 flex items-center justify-center"
            style={{ left: `${xPct}%`, top: `${yPct}%` }}
        >
             {/* The Dot */}
             <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay, duration: 0.4, type: "spring" }}
                className="relative pointer-events-auto group"
             >
                 {/* Core */}
                 <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,1)] ring-2 ring-white/20" />
                 
                 {/* Ring Pulse */}
                 <motion.div
                    animate={{ scale: [1, 2, 2.5], opacity: [0.7, 0.3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: delay + 0.2 }}
                    style={{ willChange: 'transform, opacity' }}
                    className="absolute inset-0 -m-1 bg-cyan-400/50 rounded-full transform-gpu"
                 />
                 
                 {/* Tooltip */}
                 <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-slate-900/90 backdrop-blur text-white text-[10px] px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 shadow-xl z-50">
                    {marker.label}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-4 border-transparent border-t-slate-900/90"></div>
                 </div>
             </motion.div>
        </motion.div>
    )
}

export default FaceScanner;