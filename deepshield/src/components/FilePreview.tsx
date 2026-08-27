import { useEffect, useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  onAnalyze: () => void;
}

export function FilePreview({ file, onRemove, onAnalyze }: FilePreviewProps) {
  const [objectUrl, setObjectUrl] = useState<string>('');
  
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');
  
  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-navy-800/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white truncate max-w-md">{file.name}</span>
            <span className="text-xs text-gray-400">{formatSize(file.size)} • {file.type || 'Unknown Type'}</span>
          </div>
          <button 
            onClick={onRemove}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Remove file"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Media Preview Area */}
        <div className="bg-black/40 p-6 flex justify-center items-center min-h-[300px]">
          {isImage && (
            <img 
              src={objectUrl} 
              alt="Preview" 
              className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg"
            />
          )}
          
          {isVideo && (
            <video 
              src={objectUrl} 
              controls 
              className="max-w-full max-h-[500px] rounded-lg shadow-lg"
            />
          )}
          
          {isAudio && (
            <div className="w-full max-w-md p-8 bg-navy-900 rounded-xl border border-white/10 flex flex-col items-center gap-6 shadow-lg">
              <div className="w-24 h-24 rounded-full bg-electric-blue/10 border border-electric-blue/30 flex items-center justify-center">
                 <div className="flex items-center gap-1">
                   {[1, 2, 3, 4, 5].map((i) => (
                     <div key={i} className={`w-1.5 bg-electric-blue rounded-full animate-pulse`} style={{ height: `${Math.random() * 24 + 12}px`, animationDelay: `${i * 0.15}s` }} />
                   ))}
                 </div>
              </div>
              <audio src={objectUrl} controls className="w-full" />
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-6 bg-navy-800/90 flex justify-center border-t border-white/10">
          <button 
            onClick={onAnalyze}
            className="flex items-center gap-2 px-8 py-3.5 bg-electric-blue text-navy-900 text-base font-bold rounded-lg shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:bg-cyan-accent hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <ShieldAlert className="h-5 w-5" />
            Analyze Media
          </button>
        </div>
      </div>
    </div>
  );
}
