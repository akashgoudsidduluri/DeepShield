import { AnalysisSignal } from '../types/analysis';

interface AnalysisDetailsProps {
  signals: AnalysisSignal[];
}

export function AnalysisDetails({ signals }: AnalysisDetailsProps) {
  if (!signals || signals.length === 0) return null;

  return (
    <div className="w-full mt-8">
      <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">
        Analysis Details
      </h3>
      <div className="space-y-4">
        {signals.map((signal, index) => (
          <div key={index} className="bg-navy-900/50 rounded-lg p-4 border border-white/5">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-gray-200">{signal.name}</span>
              <span className="text-sm font-mono bg-white/10 px-2 py-1 rounded text-gray-300">
                {signal.value}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {signal.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
