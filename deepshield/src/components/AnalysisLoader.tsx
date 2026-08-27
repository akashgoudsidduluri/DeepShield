import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Loader2,
  Circle,
} from 'lucide-react';

const STAGES = [
  'File received',
'Extracting media features',
'Running deepfake detection',
'Evaluating manipulation risk',
'Generating security assessment',
];

export function AnalysisLoader() {
  const [currentStage, setCurrentStage] =
  useState(0);

  const [progress, setProgress] =
  useState(8);

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStage((current) => {
        if (current < STAGES.length - 1) {
          return current + 1;
        }

        return current;
      });
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress((current) => {
        if (current >= 92) {
          return current;
        }

        const increment =
        Math.random() * 4 + 1;

        return Math.min(
          current + increment,
          92
        );
      });
    }, 700);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto mt-16 animate-in fade-in duration-700">
    <div className="text-center mb-10">
    <h2 className="text-3xl font-bold text-white mb-3">
    Analyzing Media
    </h2>

    <p className="text-gray-400 text-lg">
    Running deepfake detection models...
    </p>
    </div>

    <div className="bg-navy-800/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
    <div className="w-full h-2 bg-navy-900 rounded-full overflow-hidden mb-2 border border-white/5">
    <motion.div
    className="h-full bg-electric-blue"
    animate={{
      width: `${progress}%`,
    }}
    transition={{
      duration: 0.5,
      ease: 'easeInOut',
    }}
    />
    </div>

    <div className="text-right text-xs text-gray-500 mb-8">
    {Math.floor(progress)}% · Processing...
    </div>

    <div className="space-y-4 pl-4">
    {STAGES.map((stage, index) => {
      const isCompleted =
      index < currentStage;

      const isActive =
      index === currentStage;

      const isPending =
      index > currentStage;

      return (
        <div
        key={stage}
        className={`flex items-center gap-4 transition-opacity duration-300 ${
          isPending
          ? 'opacity-40'
          : 'opacity-100'
        }`}
        >
        <div className="w-6 flex justify-center">
        {isCompleted && (
          <CheckCircle2 className="h-5 w-5 text-safe" />
        )}

        {isActive && (
          <Loader2 className="h-5 w-5 text-electric-blue animate-spin" />
        )}

        {isPending && (
          <Circle className="h-4 w-4 text-gray-500" />
        )}
        </div>

        <span
        className={`text-sm font-medium ${
          isActive
          ? 'text-electric-blue'
          : isCompleted
          ? 'text-gray-300'
          : 'text-gray-500'
        }`}
        >
        {stage}
        </span>
        </div>
      );
    })}
    </div>
    </div>
    </div>
  );
}
