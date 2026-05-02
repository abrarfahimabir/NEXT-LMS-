import { motion } from "framer-motion";
import React from "react";

const ProgressBar = ({
  value = 0,
  max = 100,
  showLabel = true,
  size = "md",
  color = "primary",
  animated = true,
  showStatus = false,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "progress-bar--sm";
      case "lg":
        return "progress-bar--lg";
      default:
        return "progress-bar--md";
    }
  };

  const getColorClass = () => {
    switch (color) {
      case "success":
        return "progress-bar--success";
      case "warning":
        return "progress-bar--warning";
      case "danger":
        return "progress-bar--danger";
      case "info":
        return "progress-bar--info";
      default:
        return "progress-bar--primary";
    }
  };

  const getStatusText = () => {
    if (percentage === 0) return "Not Started";
    if (percentage === 100) return "Completed";
    return "In Progress";
  };

  return (
    <div className="progress-bar-wrapper">
      <div className={`progress-bar ${getSizeClass()} ${getColorClass()}`}>
        <motion.div
          className="progress-bar__fill"
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      {showLabel && (
        <span className="progress-bar__label">{Math.round(percentage)}%</span>
      )}
      {showStatus && (
        <span className={`progress-bar__status progress-bar__status--${color}`}>
          {getStatusText()}
        </span>
      )}
    </div>
  );
};

//Mini progress bar for table cells
export const MiniProgressBar = ({ value = 0, max = 100 }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="mini-progress-bar">
      <div className="mini-progress-bar__track">
        <motion.div
          className="mini-progress-bar__fill"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            backgroundColor:
              percentage === 100
                ? "#6ee7b7"
                : percentage > 0
                ? "#67e8f9"
                : "rgba(255, 255, 255, 0.2)",
          }}
        />
      </div>
      <span className="mini-progress-bar__label">{Math.round(percentage)}%</span>
    </div>
  );
};

export default ProgressBar;
