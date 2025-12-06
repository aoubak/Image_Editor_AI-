import React from 'react';

interface ComparisonViewProps {
  originalImage: string;
  generatedImage: string;
  onDownload: () => void;
  onReset: () => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ 
  originalImage, 
  generatedImage,
  onDownload,
  onReset
}) => {
  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Original</h3>
          </div>
          <div className="relative aspect-square md:aspect-[4/3] rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shadow-xl">
            <img 
              src={originalImage} 
              alt="Original" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Generated */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Edited Result</h3>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-900/50 text-indigo-300 border border-indigo-700/50">
              Gemini 2.5 Flash
            </span>
          </div>
          <div className="relative aspect-square md:aspect-[4/3] rounded-xl overflow-hidden bg-slate-800 border-2 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
            <img 
              src={generatedImage} 
              alt="Generated" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <button
          onClick={onReset}
          className="px-6 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-medium"
        >
          Start Over
        </button>
        <button
          onClick={onDownload}
          className="px-8 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Result
        </button>
      </div>
    </div>
  );
};

export default ComparisonView;
