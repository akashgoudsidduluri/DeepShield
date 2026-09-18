import { AnalysisResult } from '../types/analysis';

// Backend endpoint, overridable per environment via VITE_BACKEND_URL.
// Default '' = same origin: `npm start` (server.js) runs the FastAPI
// backend behind this app and proxies /analyze. For frontend-only dev
// (`npm run dev`), set VITE_BACKEND_URL=http://127.0.0.1:8000 in .env.local.
const BACKEND_BASE =
  (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? '';

const BACKEND_URL = BACKEND_BASE.replace(/\/$/, '') + '/analyze';

// Hard cap on a single analysis request (video can legitimately take a
// while, but the UI should never hang forever on a dead server).
const REQUEST_TIMEOUT_MS = 330_000;

function getRecommendation(
  riskScore: number,
  prediction: string
): string {
  if (prediction === 'INCONCLUSIVE') {
    return 'The analysis was inconclusive. Treat this media as unverified and confirm its authenticity with the original source before relying on it.';
  }

  if (
    prediction === 'LIKELY_MANIPULATED' ||
    prediction === 'LIKELY_AI_GENERATED' ||
    riskScore >= 70
  ) {
    return 'High manipulation risk detected. Do not make financial, security, identity-related, or other important decisions based solely on this media. Verify the source through an independent channel.';
  }

  if (riskScore >= 30) {
    return 'Some characteristics warrant additional verification. Exercise caution before sharing or acting on information contained in this media and verify the original source.';
  }

  return 'Low manipulation risk detected. No strong indicators of AI-generated or manipulated content were found. For important decisions, always verify information through trusted sources.';
}

function getSignalDescription(
  signal: {
    name: string;
    value: string;
    score?: number;
  },
  provider: string
): string {
  const scoreText =
  typeof signal.score === 'number'
  ? ` Detection score: ${signal.score.toFixed(1)}%.`
  : '';

  if (provider === 'Reality Defender') {
    return `Detection model verdict: ${signal.value}.${scoreText}`;
  }

  return `${signal.value}.${scoreText}`;
}

export async function analyzeMedia(
  file: File
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  let response: Response;

  try {
    response = await fetch(BACKEND_URL, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(
        'The analysis took too long and was cancelled. Please try again with a smaller file.'
      );
    }

    console.error('Network error:', error);

    throw new Error(
      'Unable to reach the DeepShield analysis server. Please ensure the backend is running and VITE_BACKEND_URL is configured.'
    );
  } finally {
    clearTimeout(timeoutId);
  }

  let data: any;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      'The analysis server returned an invalid response.'
    );
  }

  if (!response.ok) {
    if (response.status === 413) {
      throw new Error(data.detail || 'The file is too large to analyze.');
    }

    throw new Error(
      data.detail ||
      `Analysis failed with status ${response.status}.`
    );
  }

  if (!data.success) {
    throw new Error(
      data.detail ||
      'The analysis could not be completed.'
    );
  }

  const fileSizeMB = (
    file.size / (1024 * 1024)
  ).toFixed(2);

  const format =
  file.name
  .split('.')
  .pop()
  ?.toUpperCase() ||
  'UNKNOWN';

  return {
    riskScore: Number(data.risk_score),

    riskLevel: data.risk_level,

    prediction: data.prediction,

    confidence: `${Number(data.confidence).toFixed(1)}%`,

    analysisTime: Number(data.analysis_time),

    mediaType: data.media_type,

    format,

      fileSize: `${fileSizeMB} MB`,

      signals: (data.signals || []).map(
        (signal: any) => ({
          name: signal.name || 'Detection Signal',

          value:
          typeof signal.score === 'number'
        ? `${signal.value || 'UNKNOWN'} • ${signal.score.toFixed(1)}%`
        : signal.value || 'NO SCORE',

        description: getSignalDescription(
          signal,
          data.provider || ''
        ),
        })
      ),

      recommendation: getRecommendation(
        Number(data.risk_score),
                                        data.prediction
      ),
  };
}
