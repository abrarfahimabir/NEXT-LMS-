import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import { FiAlertTriangle, FiX, FiCheck } from "react-icons/fi";

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed? This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="confirmation-dialog-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="confirmation-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="confirmation-dialog__icon">
            <FiAlertTriangle />
          </div>
          <h3 className="confirmation-dialog__title">{title}</h3>
          <p className="confirmation-dialog__message">{message}</p>
          <div className="confirmation-dialog__actions">
            <button
              onClick={onClose}
              className="ui-button ui-button--secondary"
              disabled={loading}
            >
              <FiX />
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`ui-button ui-button--${variant}`}
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner" />
              ) : (
                <>
                  <FiCheck />
                  {confirmText}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmationDialog;
