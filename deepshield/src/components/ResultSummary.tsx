import { getRiskSummary } from '../utils/riskUtils';

interface ResultSummaryProps {
  score: number;
  prediction: string;
}

export function ResultSummary({
  score,
  prediction,
}: ResultSummaryProps) {
  let verdict = '';

  if (prediction === 'LIKELY_AI_GENERATED') {
    verdict =
    'The detector found indicators consistent with AI-generated media.';
  } else if (prediction === 'LIKELY_MANIPULATED') {
    verdict =
    'The detector found strong indicators of manipulated or synthetic media.';
  } else if (prediction === 'LIKELY_AUTHENTIC') {
    verdict =
    'The detector did not find strong indicators of AI generation or manipulation.';
  } else if (prediction === 'INCONCLUSIVE') {
    verdict =
    'The available analysis was inconclusive.';
  } else {
    verdict = getRiskSummary(score);
  }

  return (
    <div className="text-center px-4 mb-6 space-y-3">
    <p className="text-xl text-white font-semibold">
    {verdict}
    </p>

    <p className="text-base text-gray-400 leading-relaxed">
    {getRiskSummary(score)}
    </p>
    </div>
  );
}
