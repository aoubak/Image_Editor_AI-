import React, { useState, useRef, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import ComparisonView from './components/ComparisonView';
import Button from './components/Button';
import { generateEditedImage } from './services/geminiService';
import { ImageStatus } from './types';

// Default prompt suggestion
const DEFAULT_PROMPT = "Make me wear a dark purple suit. Keep my face exactly the same. Do not change my skin tone. Enhance the colors slightly for a clean and professional look.";

const App: React.FC = () => {
  const [status, setStatus] = useState<ImageStatus>(ImageStatus.IDLE);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
  const [error, setError] = useState<string | null>(null);

  const resultSectionRef = useRef<HTMLDivElement>(null);

  const handleImageSelected = (base64: string, mimeType: string, previewUrl: string) => {
    setImageBase64(base64);
    setImageMimeType(mimeType);
    setOriginalImage(previewUrl);
    setGeneratedImage(null);
    setStatus(ImageStatus.UPLOADING); // Use UPLOADING state to show edit interface
    setError(null);
  };

  const handleGenerate = async () => {
    if (!imageBase64 || !imageMimeType || !prompt.trim()) return;

    setStatus(ImageStatus.GENERATING);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await generateEditedImage(imageBase64, imageMimeType, prompt);
      
      if (response.imageUrl) {
        setGeneratedImage(response.imageUrl);
        setStatus(ImageStatus.SUCCESS);
      } else if (response.text) {
        // Handle cases where the model refused or returned only text
        setError(response.text || "The model could not generate an image. It might have been blocked by safety filters.");
        setStatus(ImageStatus.UPLOADING); // Go back to editing state
      } else {
        setError("No image generated. Please try a different prompt.");
        setStatus(ImageStatus.UPLOADING);
      }
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while communicating with the API. Please try again.");
      setStatus(ImageStatus.ERROR);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `edited-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setStatus(ImageStatus.IDLE);
    setOriginalImage(null);
    setImageBase64(null);
    setImageMimeType(null);
    setGeneratedImage(null);
    setPrompt(DEFAULT_PROMPT);
    setError(null);
  };

  // Auto-scroll to result when success
  useEffect(() => {
    if (status === ImageStatus.SUCCESS && resultSectionRef.current) {
      resultSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              SuitUp AI
            </span>
          </div>
          <a 
            href="https://ai.google.dev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Powered by Gemini
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Intro Section - Only show when IDLE */}
        {status === ImageStatus.IDLE && (
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
              Professional Image Editing <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                Powered by AI
              </span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Upload a photo and use natural language to make precise edits. 
              Change outfits, adjust lighting, or modify the background while keeping the subject intact.
            </p>
            <div className="max-w-xl mx-auto">
              <ImageUploader onImageSelected={handleImageSelected} />
            </div>
          </div>
        )}

        {/* Editor Section - Show when image is selected */}
        {(status !== ImageStatus.IDLE) && originalImage && (
          <div className="max-w-5xl mx-auto">
            {/* Input Controls */}
            {status !== ImageStatus.SUCCESS && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl backdrop-blur-sm">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Thumbnail */}
                  <div className="w-full md:w-48 flex-shrink-0">
                    <div className="aspect-square rounded-lg overflow-hidden border border-slate-600 bg-slate-900 relative group">
                      <img 
                        src={originalImage} 
                        alt="Original thumbnail" 
                        className="w-full h-full object-cover"
                      />
                      <button 
                        onClick={handleReset}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-sm font-medium"
                      >
                        Change Image
                      </button>
                    </div>
                  </div>

                  {/* Text Prompt */}
                  <div className="flex-grow w-full space-y-4">
                    <div>
                      <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">
                        Describe your edit
                      </label>
                      <div className="relative">
                        <textarea
                          id="prompt"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none leading-relaxed"
                          placeholder="E.g., Make me wear a tuxedo, keep the background..."
                          disabled={status === ImageStatus.GENERATING}
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                          {prompt.length} chars
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg flex items-center space-x-3 text-red-200">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button 
                        onClick={handleGenerate} 
                        isLoading={status === ImageStatus.GENERATING}
                        className="w-full sm:w-auto min-w-[160px]"
                        icon={
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        }
                      >
                        {status === ImageStatus.GENERATING ? 'Generating...' : 'Generate Edit'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results View */}
            {status === ImageStatus.SUCCESS && generatedImage && (
              <div ref={resultSectionRef}>
                <ComparisonView 
                  originalImage={originalImage}
                  generatedImage={generatedImage}
                  onDownload={handleDownload}
                  onReset={handleReset}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
