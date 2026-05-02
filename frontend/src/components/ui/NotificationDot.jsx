import { motion } from "framer-motion";
import React from "react";

const NotificationDot = ({ 
  size = "10px", 
  color = "bg-rose-500",
  pulse = true,
  className = ""
}) => {
  return (
    <div className={`relative inline-block ${className}`}>
      {/* Main Dot */}
      <div 
        className={`${color} rounded-full`} 
        style={{ width: size, height: size }}
      />
      
      {/* Pulse Effect */}
      {pulse && (
        <motion.div
          className={`absolute inset-0 ${color} rounded-full`}
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      )}
    </div>
  );
};

export default NotificationDot;
