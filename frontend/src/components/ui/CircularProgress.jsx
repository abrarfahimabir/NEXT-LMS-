import { motion } from "framer-motion";
import React from "react";

const CircularProgress = ({
  value = 0,
  max = 100,
  size = 60,
  strokeWidth = 6,
  color = "text-primary",
  trackColor = "text-slate-200 dark:text-slate-800",
  showLabel = true,
  labelClassName = "text-xs font-bold",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className={trackColor}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeInOut" }}
          strokeLinecap="round"
          className={color}
        />
      </svg>
      {showLabel && (
        <span className={`absolute ${labelClassName}`}>
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

export default CircularProgress;
