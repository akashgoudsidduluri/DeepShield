import { AlertOctagon } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mt-16 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-danger/10 border border-danger/30 rounded-2xl p-8 text-center backdrop-blur-sm">
        <div className="flex justify-center mb-4">
          <AlertOctagon className="h-12 w-12 text-danger" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Analysis Failed</h3>
        <p className="text-gray-300 mb-8">{message}</p>
        <button 
          onClick={onRetry}
          className="px-6 py-2.5 bg-navy-800 border border-white/20 text-white rounded-lg hover:bg-navy-700 transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
