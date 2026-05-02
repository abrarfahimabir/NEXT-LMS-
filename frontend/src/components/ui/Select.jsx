import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { FiChevronDown, FiCheck, FiSearch, FiX } from "react-icons/fi";

/**
 * Custom Select Component - Enhanced dropdown with search, multi-select, and custom styling
 * 
 * @param {string|number} value - Selected value(s)
 * @param {function} onChange - Change handler
 * @param {Array} options - Array of {value, label, group?} objects
 * @param {string} placeholder - Placeholder text
 * @param {boolean} searchable - Enable search/filter
 * @param {boolean} multi - Enable multi-select
 * @param {string} className - Additional class names
 * @param {boolean} disabled - Disable the select
 * @param {string} error - Error message
 * @param {string} label - Label text
 * @param {boolean} loading - Show loading state
 */
const Select = ({
  value,
  onChange,
  options = [],
  placeholder = "Select an option...",
  searchable = false,
  multi = false,
  className = "",
  disabled = false,
  error = "",
  label = "",
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Group options if they have groups
  const groupedOptions = useMemo(() => {
    if (!searchable) return { ungrouped: options };
    
    const filtered = options.filter(opt => 
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
    
    const groups = {};
    const ungrouped = [];
    
    filtered.forEach(opt => {
      if (opt.group) {
        if (!groups[opt.group]) {
          groups[opt.group] = [];
        }
        groups[opt.group].push(opt);
      } else {
        ungrouped.push(opt);
      }
    });
    
    return { ...groups, ungrouped };
  }, [options, search, searchable]);

  // Get display label(s)
  const displayValue = useMemo(() => {
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
  const isSelected = (optValue) => {
    if (multi && Array.isArray(value)) {
      return value.includes(optValue);
    }
    return value === optValue;
  };

  // Handle option click
  const handleSelect = (opt) => {
    if (disabled || loading) return;
    
    if (multi) {
      const newValue = Array.isArray(value) ? [...value] : [];
      const index = newValue.indexOf(opt.value);
      
      if (index > -1) {
        newValue.splice(index, 1);
      } else {
        newValue.push(opt.value);
      }
      
      onChange?.(newValue);
    } else {
      onChange?.(opt.value);
      setIsOpen(false);
      setSearch("");
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, searchable]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          if (document.activeElement === containerRef.current?.querySelector(".custom-select__trigger")) {
            e.preventDefault();
            setIsOpen(true);
          }
        }
        return;
      }
      
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearch("");
      } else if (e.key === "Backspace" && searchable && search === "") {
        if (multi && Array.isArray(value) && value.length > 0) {
          onChange?.(value.slice(0, -1));
        }
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, searchable, search, multi, value, onChange]);

  const selectClasses = [
    "custom-select",
    isOpen && "custom-select--open",
    disabled && "custom-select--disabled",
    loading && "custom-select--loading",
    error && "custom-select--error",
    multi && "custom-select--multi",
    className,
  ].filter(Boolean).join(" ");

  const triggerClasses = [
    "custom-select__trigger",
    isOpen && "custom-select__trigger--open",
    !value && "custom-select__trigger--placeholder",
  ].filter(Boolean).join(" ");

  return (
    <div ref={containerRef} className={selectClasses}>
      {label && (
        <label className="custom-select__label">{label}</label>
      )}
      
      <div 
        className={triggerClasses}
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={!!error}
        tabIndex={disabled ? -1 : 0}
      >
        <div className="custom-select__value">
          {loading ? (
            <span className="custom-select__loading">Loading...</span>
          ) : (
            <span className="custom-select__display">{displayValue}</span>
          )}
        </div>
        
        <div className="custom-select__arrow">
          {loading ? (
            <span className="custom-select__spinner" />
          ) : (
            <FiChevronDown className={isOpen ? "chevron-up" : "chevron-down"} />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="custom-select__dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {searchable && (
              <div className="custom-select__search">
                <FiSearch className="custom-select__search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="custom-select__search-input"
                />
                {search && (
                  <button
                    type="button"
                    className="custom-select__search-clear"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearch("");
                    }}
                  >
                    <FiX />
                  </button>
                )}
              </div>
            )}

             <div className="custom-select__options" role="listbox">
               {(Object.keys(groupedOptions).length === 0 || 
                 Object.keys(groupedOptions).every(k => groupedOptions[k].length === 0)) ? (
                 <div className="custom-select__empty">
                   No options found
                 </div>
               ) : (
                 Object.entries(groupedOptions).map(([group, opts]) => (
                  <React.Fragment key={group}>
                    {group !== "ungrouped" && (
                      <div className="custom-select__group-label">
                        {group}
                      </div>
                    )}
                    {opts.map((opt) => {
                      const selected = isSelected(opt.value);
                      return (
                        <div
                          key={opt.value}
                          className={`custom-select__option ${selected ? "custom-select__option--selected" : ""}`}
                          onClick={() => handleSelect(opt)}
                          role="option"
                          aria-selected={selected}
                        >
                          <span className="custom-select__option-label">
                            {opt.label}
                          </span>
                          {selected && (
                            <FiCheck className="custom-select__option-check" />
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="custom-select__error">{error}</div>
      )}
    </div>
  );
};

export default Select;
