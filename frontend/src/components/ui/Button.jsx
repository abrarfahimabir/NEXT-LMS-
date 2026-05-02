import { motion } from "framer-motion";
import React from "react";

const Button = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}) => (
  <motion.button
    type={type}
    whileTap={{ scale: 0.985 }}
    className={`ui-button ui-button--${variant} ui-button--${size} ${className}`.trim()}
    {...props}
  >
    {children}
  </motion.button>
);

export default Button;
