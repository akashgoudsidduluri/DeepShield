export interface AnalysisSignal {
  name: string;
  value: string;
  description: string;
}

export interface AnalysisResult {
  riskScore: number;

  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';

  prediction: string;

  confidence: string;

  analysisTime: number;

  mediaType: string;

  signals: AnalysisSignal[];

  recommendation: string;

  fileSize?: string;

  format?: string;

  duration?: number;
}
