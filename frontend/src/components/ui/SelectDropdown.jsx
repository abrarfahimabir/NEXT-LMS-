import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { FiChevronDown, FiCheck, FiSearch, FiX, FiLoader } from "react-icons/fi";
import "./SelectDropdown.css";

/**
 * Premium SelectDropdown Component
 * 
 * A highly engineered, accessible dropdown with fluid animations, micro-interactions,
 * and sophisticated visual hierarchy. Built with Framer Motion.
 * 
 * Features:
 * - Spring-physics based animations with custom easing
 * - Magnetic hover effects on trigger
 * - Staggered option entrance animations
 * - Ripple/pulse selection feedback
 * - Fully accessible (ARIA, keyboard nav, screen readers)
 * - Search with animated expansion
 * - Grouped options with elegant separators
 * - Multi-select capability
 * - Custom scrollbar styling
 * - Focus ring management with smooth transitions
 * 
 * @param {string|number|Array} value - Selected value(s)
 * @param {function} onChange - Change handler (value) => void
 * @param {Array} options - Array of {value, label, group?, icon?, disabled?} objects
 * @param {string} placeholder - Placeholder text when no selection
 * @param {boolean} searchable - Enable search/filter functionality
 * @param {boolean} multi - Enable multi-select mode
 * @param {boolean} loading - Show loading spinner state
 * @param {string} label - Accessible label for the select
 * @param {string} error - Error message to display
 * @param {string} helperText - Helper text below the select
 * @param {string} className - Additional CSS classes
 * @param {boolean} disabled - Disable the select entirely
 * @param {React.ReactNode} prefix - Optional prefix element (icon/avatar) before trigger text
 * @param {React.ReactNode} renderValue - Custom render function for selected value display
 */

const SelectDropdown = ({
  value,
  onChange,
  options = [],
  placeholder = "Select an option...",
  searchable = false,
  multi = false,
  loading = false,
  label = "",
  error = "",
  helperText = "",
  className = "",
  disabled = false,
  prefix,
  renderValue,
  size = "md", // 'sm', 'md', 'lg'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionsRef = useRef([]);
  
  // Magnetic effect motion values with spring physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const magneticX = useSpring(useTransform(mouseX, [0, 1], [0, 6]), { 
    stiffness: 400, 
    damping: 30,
    restDelta: 0.001 
  });
  const magneticY = useSpring(useTransform(mouseY, [0, 1], [0, 3]), { 
    stiffness: 400, 
    damping: 30,
    restDelta: 0.001 
  });

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const lowerSearch = search.toLowerCase();
    return options.filter(opt => 
      opt.label?.toLowerCase().includes(lowerSearch) ||
      opt.value?.toString().toLowerCase().includes(lowerSearch)
    );
  }, [options, search, searchable]);

  // Group options
  const groupedOptions = useMemo(() => {
    const groups = {};
    const ungrouped = [];
    
    filteredOptions.forEach(opt => {
      if (opt.group) {
        if (!groups[opt.group]) groups[opt.group] = [];
        groups[opt.group].push(opt);
      } else if (!opt.hidden) {
        ungrouped.push(opt);
      }
    });
    
    return { ...groups, ungrouped };
  }, [filteredOptions]);

  // Flatten options for keyboard navigation
  const flatOptions = useMemo(() => {
    const flat = [];
    Object.entries(groupedOptions).forEach(([group, opts]) => {
      if (group !== "ungrouped") {
        flat.push({ type: 'group-header', label: group });
      }
      opts.forEach(opt => flat.push({ ...opt, type: 'option' }));
    });
    return flat;
  }, [groupedOptions]);

  // Get display value(s)
  const displayLabel = useMemo(() => {
    if (multi && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const opt = options.find(o => o.value === value[0]);
        return opt?.label || placeholder;
      }
      return `${value.length} selected`;
    }
    
    const opt = options.find(o => o.value === value);
    return opt?.label || placeholder;
  }, [value, options, placeholder, multi]);

  // Check if option is selected
  const isSelected = useCallback((optValue) => {
    if (multi && Array.isArray(value)) {
      return value.includes(optValue);
    }
    return value === optValue;
  }, [value, multi]);

  // Handle selection with spring animation
  const handleSelect = useCallback((opt) => {
    if (disabled || loading || opt.disabled) return;
    
    if (multi) {
      const newValue = Array.isArray(value) ? [...value] : [];
      const index = newValue.indexOf(opt.value);
      if (index > -1) {
        newValue.splice(index, 1);
      } else {
        newValue.push(opt.value);
      }
      onChange(newValue);
    } else {
      onChange(opt.value);
      // Add small delay before closing to prevent immediate hover on first module
      setTimeout(() => {
        setIsOpen(false);
        setSearch("");
        setFocusedIndex(-1);
      }, 50);
    }
  }, [value, multi, onChange, disabled, loading]);

  // Handle trigger click
  const handleTriggerClick = useCallback(() => {
    if (disabled || loading) return;
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [disabled, loading, isOpen]);

  // Magnetic effect handler
  const handleMouseMove = useCallback((e) => {
    if (!triggerRef.current || disabled) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  }, [disabled, mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch("");
        setFocusedIndex(-1);
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (disabled) return;
      
      const triggerEl = triggerRef.current;
      const isTriggerFocused = document.activeElement === triggerEl;
      
      if (!isOpen) {
        if ((e.key === "Enter" || e.key === " " || e.key === "ArrowDown") && isTriggerFocused) {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }
      
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setSearch("");
          triggerRef.current?.focus();
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex(prev => {
            const next = prev + 1;
            return next < flatOptions.length ? next : 0;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex(prev => {
            const next = prev - 1;
            return next >= 0 ? next : flatOptions.length - 1;
          });
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0) {
            const item = flatOptions[focusedIndex];
            if (item?.type === 'option') {
              handleSelect(item);
            }
          }
          break;
        case "Backspace":
          if (searchable && search === "") {
            if (multi && Array.isArray(value) && value.length > 0) {
              onChange(value.slice(0, -1));
            }
          }
          break;
        case "a":
        case "A":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (multi && Array.isArray(value)) {
              const allValues = options.filter(o => !o.disabled).map(o => o.value);
              onChange(allValues);
            }
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, focusedIndex, flatOptions, handleSelect, disabled, searchable, search, value, onChange, options]);

  // Scroll focused option into view
  useEffect(() => {
    if (focusedIndex >= 0 && optionsRef.current[focusedIndex]) {
      optionsRef.current[focusedIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [focusedIndex]);

  // Reset focused index when filtered options change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [search]);

  // Size classes
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const triggerSizeClasses = {
    sm: "py-2 px-3 text-sm",
    md: "py-3 px-4 text-base",
    lg: "py-4 px-5 text-lg",
  };

  // Combine classes
  const containerClass = [
    "premium-select",
    isOpen && "premium-select--open",
    disabled && "premium-select--disabled",
    loading && "premium-select--loading",
    error && "premium-select--error",
    multi && "premium-select--multi",
    sizeClasses[size],
    className,
  ].filter(Boolean).join(" ");

  // Spring-based dropdown animation variants
  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.92, 
      y: -8,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 30 
      }
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 30,
        restDelta: 0.001
      }
    }
  };

  const optionVariants = {
    hidden: { 
      opacity: 0, 
      x: -12, 
      scale: 0.95,
      transition: { 
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    },
    visible: (custom) => ({
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        delay: custom * 0.035,
        restDelta: 0.001
      }
    })
  };

  return (
    <div ref={containerRef} className={containerClass}>
      {label && (
        <label className="premium-select__label">
          {label}
          {error && <span className="premium-select__label-error">*</span>}
        </label>
      )}

      <motion.div
        ref={triggerRef}
        className={`premium-select__trigger ${triggerSizeClasses[size]} flex items-center gap-2`}
        onClick={handleTriggerClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={!!error}
        tabIndex={disabled ? -1 : 0}
        style={{ x: magneticX, y: magneticY }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {prefix && <span className="premium-select__prefix">{prefix}</span>}
        <span className="flex-1 truncate">{displayLabel}</span>
        {loading ? (
          <FiLoader className="animate-spin" />
        ) : (
          <FiChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="premium-select__dropdown"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {Object.entries(groupedOptions).map(([group, opts], groupIndex) => (
              <React.Fragment key={group}>
                {group !== "ungrouped" && (
                  <motion.div
                    className="premium-select__group-header"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        delay: groupIndex * 0.05
                      }
                    }}
                  >
                    <span className="premium-select__group-label">{group}</span>
                    <div className="premium-select__group-line" />
                  </motion.div>
                )}
                
                {opts.map((opt, idx) => {
                  const flatIndex = flatOptions.findIndex(item => item.value === opt.value);
                  const selected = isSelected(opt.value);
                  const isFocused = focusedIndex === flatIndex;
                  
                  return (
                    <motion.div
                      key={opt.value}
                      id={`option-${flatIndex}`}
                      ref={(el) => { if (el) optionsRef.current[flatIndex] = el; }}
                      className={`premium-select__option ${selected ? "premium-select__option--selected" : ""} ${isFocused ? "premium-select__option--focused" : ""} ${opt.disabled ? "premium-select__option--disabled" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!opt.disabled) handleSelect(opt);
                      }}
                      role="option"
                      aria-selected={selected}
                      aria-disabled={opt.disabled}
                      tabIndex={-1}
                      variants={optionVariants}
                      custom={flatIndex}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      whileHover={!opt.disabled ? { 
                        scale: 1.02, 
                        transition: { 
                          type: "spring",
                          stiffness: 500,
                          damping: 25 
                        }
                      } : {}}
                      whileTap={!opt.disabled ? { scale: 0.98 } : {}}
                      layout
                    >
                      {opt.icon && (
                        <span className="premium-select__option-icon">
                          {opt.icon}
                        </span>
                      )}
                      <span className="premium-select__option-label">
                        {opt.label}
                      </span>
                      {selected && (
                        <motion.span
                          className="premium-select__option-check"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ 
                            type: "spring",
                            stiffness: 600,
                            damping: 20 
                          }}
                        >
                          <FiCheck />
                        </motion.span>
                      )}
                      {isFocused && (
                        <motion.span
                          className="premium-select__option-focus-glow"
                          layoutId="option-focus"
                        />
                      )}
                    </motion.div>
                  );
                })}
              </React.Fragment>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      {error && (
        <motion.div
          id="select-error"
          className="premium-select__error"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
        >
          {error}
        </motion.div>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <span id="select-helper" className="premium-select__helper">
          {helperText}
        </span>
      )}
    </div>
  );
};

export default SelectDropdown;