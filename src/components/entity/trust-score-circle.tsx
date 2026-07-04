import React from "react";

interface TrustScoreCircleProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TrustScoreCircle({ score, size = "md", className = "" }: TrustScoreCircleProps) {
  const sizeClasses = {
    sm: {
      container: "w-16 h-16",
      radius: 20,
      strokeWidth: 4,
      scoreText: "text-base font-extrabold",
      label: "text-[7px]",
      viewBox: "0 0 50 50",
      center: 25,
    },
    md: {
      container: "w-28 h-28",
      radius: 32,
      strokeWidth: 7,
      scoreText: "text-3xl font-black",
      label: "text-[10px]",
      viewBox: "0 0 80 80",
      center: 40,
    },
    lg: {
      container: "w-40 h-40",
      radius: 48,
      strokeWidth: 10,
      scoreText: "text-5xl font-black",
      label: "text-xs",
      viewBox: "0 0 110 110",
      center: 55,
    },
  };

  const config = sizeClasses[size];
  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = "stroke-emerald-500 text-emerald-700";
  if (score < 50) {
    colorClass = "stroke-rose-500 text-rose-700";
  } else if (score < 80) {
    colorClass = "stroke-amber-500 text-amber-700";
  }

  return (
    <div className={`relative ${config.container} ${className}`}>
      <svg className="w-full h-full transform -rotate-90" viewBox={config.viewBox}>
        <circle
          cx={config.center}
          cy={config.center}
          r={config.radius}
          className="stroke-slate-200"
          strokeWidth={config.strokeWidth}
          fill="transparent"
        />
        <circle
          cx={config.center}
          cy={config.center}
          r={config.radius}
          className={`transition-all duration-1000 ease-out ${colorClass}`}
          strokeWidth={config.strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-slate-900 tracking-tight leading-none ${config.scoreText}`}>
          {score}
        </span>
        <span className={`text-slate-400 uppercase tracking-wider font-bold mt-0.5 ${config.label}`}>
          Score
        </span>
      </div>
    </div>
  );
}
