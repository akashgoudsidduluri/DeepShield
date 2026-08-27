import React, { useCallback, useState } from 'react';
import { UploadCloud, FileImage, FileVideo, FileAudio } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
}

export function UploadZone({ onFileSelect }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (isValidFileType(file)) {
        onFileSelect(file);
      } else {
        alert('Unsupported file type. Please upload an image, video, or audio file.');
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (isValidFileType(file)) {
        onFileSelect(file);
      } else {
        alert('Unsupported file type. Please upload an image, video, or audio file.');
      }
    }
  }, [onFileSelect]);

  const isValidFileType = (file: File) => {
    return file.type.startsWith('image/') || 
           file.type.startsWith('video/') || 
           file.type.startsWith('audio/');
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-12 text-center bg-navy-800/50 backdrop-blur-sm
          ${isDragging 
            ? 'border-electric-blue bg-electric-blue/5 shadow-[0_0_30px_rgba(0,229,255,0.15)]' 
            : 'border-white/20 hover:border-white/40 hover:bg-white/5'
          }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
        
        <div className="bg-navy-900 p-4 rounded-full border border-white/10 mb-6 shadow-xl relative z-10">
          <UploadCloud className="h-10 w-10 text-electric-blue" />
        </div>
        
        <h3 className="text-2xl font-semibold text-white mb-3 relative z-10">
          Analyze Suspicious Media
        </h3>
        <p className="text-gray-400 mb-8 max-w-md relative z-10">
          Upload an image, video, or audio file to assess potential AI manipulation risk.
        </p>
        
        <div className="flex gap-6 mb-8 relative z-10">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FileImage className="h-4 w-4" /> Images
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FileVideo className="h-4 w-4" /> Videos
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FileAudio className="h-4 w-4" /> Audio
          </div>
        </div>

        <label className="relative z-10 cursor-pointer inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-navy-900 bg-electric-blue rounded-lg shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:bg-cyan-accent transition-colors duration-200">
          <span>Choose File</span>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*,video/*,audio/*"
            onChange={handleFileInput}
          />
        </label>
        
        <p className="mt-4 text-xs text-gray-500 relative z-10">
          or drag and drop your file here
        </p>
      </div>
    </div>
  );
}
