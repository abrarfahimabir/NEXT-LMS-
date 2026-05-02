import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { FiCheck, FiX, FiAlertCircle, FiInfo } from "react-icons/fi";

const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <FiCheck />;
      case "error":
        return <FiX />;
      case "warning":
        return <FiAlertCircle />;
      default:
        return <FiInfo />;
    }
  };

  return (
    <motion.div
      className={`toast toast--${toast.type} ui-card`}
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 50, scale: isVisible ? 1 : 0.9 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <div className="toast__icon">{getIcon()}</div>
      <div className="toast__content">
        {toast.title && <strong className="toast__title">{toast.title}</strong>}
        <span className="toast__message">{toast.message}</span>
      </div>
      <button
        className="toast__close"
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onRemove(toast.id), 300);
        }}
      >
        <FiX />
      </button>
    </motion.div>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Custom hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (message, title) => addToast({ type: "success", message, title });
  const error = (message, title) => addToast({ type: "error", message, title });
  const warning = (message, title) => addToast({ type: "warning", message, title });
  const info = (message, title) => addToast({ type: "info", message, title });

  return { toasts, addToast, removeToast, success, error, warning, info };
};

export default ToastContainer;
