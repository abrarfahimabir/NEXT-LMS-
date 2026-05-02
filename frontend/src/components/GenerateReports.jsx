import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { FiDownload, FiFileText, FiUsers, FiBookOpen, FiActivity, FiBarChart2, FiPieChart, FiTrendingUp, FiCheckCircle, FiClock, FiAlertCircle, FiLoader, FiFilter, FiCalendar, FiSettings, FiPercent, FiBook, FiDollarSign } from "react-icons/fi";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from "recharts";

import { useAuth } from "../context/AuthContext";
import { lmsApi } from "../lib/api";
import { reportTypeVariants, chartVariants, modalVariants, buttonPressVariants, staggerContainer } from "../lib/animations";
import Card from "./ui/Card";
import SectionHeading from "./ui/SectionHeading";
import Skeleton from "./ui/Skeleton";
import Button from "./ui/Button";
import Select from "./ui/Select";

const chartColors = ["#6366f1", "#42d392", "#f8c146", "#fb7185", "#a78bfa", "#67e8f9", "#f43f5e", "#10b981", "#8b5cf6", "#f59e0b"];

// Mapping specific categories and courses to specific colors/gradients
const getSpecificColor = (name, index) => {
  const colorMap = {
    // Categories
    "Development": "#6366f1",
    "Programming": "#42d392",
    "Design": "#fb7185",
    "Data": "#f8c146",
    "Marketing": "#a78bfa",
    "Business": "#67e8f9",
    "Science": "#10b981",
    // Courses (Titles or partial titles)
    "Python": "#42d392",
    "UI/UX": "#fb7185",
    "Data Science": "#f8c146",
    "Web Development": "#6366f1",
    "Marketing": "#a78bfa",
  };

  // Check for direct match or partial match
  const foundColor = Object.entries(colorMap).find(([key]) => name.includes(key));
  return foundColor ? foundColor[1] : chartColors[index % chartColors.length];
};

const getSpecificGradient = (name) => {
  if (name.includes("Development") || name.includes("Programming") || name.includes("Web")) return "url(#primaryGradient)";
  if (name.includes("Design") || name.includes("UI/UX") || name.includes("Marketing")) return "url(#accentGradient)";
  if (name.includes("Data") || name.includes("Science") || name.includes("Business")) return "url(#goldGradient)";
  return "url(#primaryGradient)";
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip" style={{
        background: "rgba(10, 10, 18, 0.9)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        borderRadius: "14px",
        padding: "0.85rem 1.1rem",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
      }}>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted-soft)", fontWeight: 600 }}>{label}</p>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.4rem" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: payload[0].fill || payload[0].color }}></div>
          <p style={{ margin: 0, fontSize: "1.1rem", color: "var(--text)", fontWeight: 800 }}>
            {payload[0].value.toLocaleString()}
            <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginLeft: "0.4rem", fontWeight: 500 }}>
              {payload[0].name === "count" ? "Users" : payload[0].name === "total_courses" ? "Programs" : "Enrollments"}
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// SVG Gradients for charts
const ChartGradients = () => (
  <svg style={{ height: 0, width: 0, position: "absolute" }}>
    <defs>
      <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.4} />
      </linearGradient>
      <linearGradient id="accentGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#42d392" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
      </linearGradient>
      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f8c146" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.4} />
      </linearGradient>
      <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fb7185" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#e11d48" stopOpacity={0.4} />
      </linearGradient>
      <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4} />
      </linearGradient>
    </defs>
  </svg>
);

// Animated stat counter
const AnimatedStatCounter = ({ value, suffix = "" }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime;
    let animationFrame;
    const duration = 1200;
    const endValue = parseInt(value) || 0;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * endValue));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [value]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

// Report parameter filters component
const ReportParameterFilters = ({ params, onChange, onApply }) => {
  const [localParams, setLocalParams] = useState(params);

  useEffect(() => {
    setLocalParams(params);
  }, [params]);

  const handleChange = (key, value) => {
    const newParams = { ...localParams, [key]: value };
    setLocalParams(newParams);
    onChange(newParams);
  };

  const dateRangeOptions = [
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 90 Days" },
    { value: "1y", label: "Last Year" },
    { value: "all", label: "All Time" },
    { value: "custom", label: "Custom Range" },
  ];

  const formatOptions = [
    { value: "json", label: "JSON", icon: <FiFileText /> },
    { value: "csv", label: "CSV", icon: <FiBook /> },
    { value: "pdf", label: "PDF", icon: <FiPercent /> },
  ];

  return (
    <motion.div
      variants={reportTypeVariants}
      initial="initial"
      animate="animate"
      className="report-section-card"
    >
      <div className="report-section-card__header">
        <div className="report-section-card__title">
          <FiFilter className="report-section-card__icon" />
          <span>Report Parameters</span>
        </div>
      </div>
      <div className="report-section-card__body">
        <div className="report-filters-bar">
          <div className="filter-group">
            <label className="filter-group__label">Date Range</label>
            <Select
              value={localParams.dateRange}
              onChange={(value) => handleChange("dateRange", value)}
              options={dateRangeOptions}
              placeholder="Select range"
              className="w-full"
            />
          </div>
          
          {localParams.dateRange === "custom" && (
            <div className="filter-group">
              <label className="filter-group__label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={localParams.startDate || ""}
                onChange={(e) => handleChange("startDate", e.target.value)}
              />
            </div>
          )}
          
          {localParams.dateRange === "custom" && (
            <div className="filter-group">
              <label className="filter-group__label">End Date</label>
              <input
                type="date"
                className="form-input"
                value={localParams.endDate || ""}
                onChange={(e) => handleChange("endDate", e.target.value)}
              />
            </div>
          )}

          <div className="filter-group">
            <label className="filter-group__label">Export Format</label>
            <div className="report-format-options">
              {formatOptions.map((fmt) => (
                <div
                  key={fmt.value}
                  className={`format-option ${
                    localParams.format === fmt.value ? "format-option--selected" : ""
                  }`}
                  onClick={() => handleChange("format", fmt.value)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="format-option__icon">{fmt.icon}</span>
                  <span>{fmt.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              const resetParams = {
                dateRange: "30d",
                format: "json",
                startDate: "",
                endDate: "",
              };
              setLocalParams(resetParams);
              onChange(resetParams);
            }}
          >
            Reset Filters
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => onApply(localParams)}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// Scheduling options for automated reports
const ReportScheduling = ({ schedule, onChange }) => {
  const frequencyOptions = [
    { value: "once", label: "Generate Once" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  return (
    <motion.div
      variants={reportTypeVariants}
      initial="initial"
      animate="animate"
      className="report-section-card"
      style={{ marginTop: "1.5rem" }}
    >
      <div className="report-section-card__header">
        <div className="report-section-card__title">
          <FiClock className="report-section-card__icon" />
          <span>Schedule Options</span>
        </div>
      </div>
      <div className="report-section-card__body">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label className="filter-group__label">Frequency</label>
            <Select
              value={schedule.frequency}
              onChange={(value) => onChange({ ...schedule, frequency: value })}
              options={frequencyOptions}
              placeholder="Select frequency"
            />
          </div>
          
          <div>
            <label className="filter-group__label">Time of Day</label>
            <input
              type="time"
              className="form-input"
              value={schedule.time || "09:00"}
              onChange={(e) => onChange({ ...schedule, time: e.target.value })}
            />
          </div>
        </div>
        
        <div style={{ marginTop: "1rem" }}>
          <label className="filter-group__label" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={schedule.emailNotification}
              onChange={(e) => onChange({ ...schedule, emailNotification: e.target.checked })}
              style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
            />
            Send email notification when report is ready
          </label>
        </div>
      </div>
    </motion.div>
  );
};

const GenerateReports = () => {
  const { user: currentUser } = useAuth();
  const [reportType, setReportType] = useState("overview");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Report parameters state
  const [reportParams, setReportParams] = useState({
    dateRange: "30d",
    format: "json",
    startDate: "",
    endDate: "",
    includeDetails: true,
  });
  
  const [schedule, setSchedule] = useState({
    frequency: "once",
    time: "09:00",
    emailNotification: true,
  });

  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    if (isAdmin) {
      fetchReport();
    }
  }, [reportType]);

  const fetchReport = async (params = reportParams) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      const response = await lmsApi.generateReport({ 
        type: reportType,
        ...params,
      });
      
      setReportData(response.data);
      setSuccess("Report generated successfully!");
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError("Failed to generate report. Please try again.");
      setReportData(null);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!reportData) return;

    const format = reportParams.format || "json";
    let content, mimeType, extension;

    switch (format) {
      case "csv":
        // Convert to CSV-like format for demo
        content = Object.entries(reportData).map(([k, v]) => `${k},${JSON.stringify(v)}`).join("\n");
        mimeType = "text/csv";
        extension = ".csv";
        break;
      case "pdf":
        // For demo, still use JSON but with .pdf extension
        content = JSON.stringify(reportData, null, 2);
        mimeType = "application/pdf";
        extension = ".pdf";
        break;
      default:
        content = JSON.stringify(reportData, null, 2);
        mimeType = "application/json";
        extension = ".json";
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSuccess(`Report downloaded as ${format.toUpperCase()}!`);
    setTimeout(() => setSuccess(""), 3000);
  };

  const reportTypes = [
    {
      id: "overview",
      label: "Platform Overview",
      icon: FiBarChart2,
      description: "Complete platform statistics and analytics"
    },
    {
      id: "users",
      label: "User Report",
      icon: FiUsers,
      description: "Detailed user statistics and distribution"
    },
    {
      id: "courses",
      label: "Program Report",
      icon: FiBookOpen,
      description: "Program performance and enrollment data"
    },
    {
      id: "enrollments",
      label: "Enrollment Report",
      icon: FiActivity,
      description: "Learner enrollment history and patterns"
    },
  ];

  if (!isAdmin) {
    return (
      <div className="layout-stack">
        <SectionHeading
          eyebrow="Access Denied"
          title="Generate Reports"
          description="You do not have permission to access this page. Only admins can generate reports."
        />
      </div>
    );
  }

  return (
    <div className="layout-stack">
      <SectionHeading
        eyebrow="Analytics"
        title="Generate Reports"
        description="Create detailed reports for platform analytics. Configure parameters and export in multiple formats."
      />

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="message-banner message-banner--error"
          >
            <FiAlertCircle style={{ marginRight: "0.5rem" }} />
            {error}
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="message-banner message-banner--success"
          >
            <FiCheckCircle style={{ marginRight: "0.5rem" }} />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Type Selection */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="report-types-grid"
      >
        {reportTypes.map((type, index) => (
          <motion.div
            key={type.id}
            variants={reportTypeVariants}
            custom={index}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
          >
            <motion.div
              className={`report-type-card ${reportType === type.id ? "report-type-card--active" : ""}`}
              onClick={() => setReportType(type.id)}
            >
              <type.icon className="report-type-card__icon" />
              <div className="report-type-card__content">
                <h3>{type.label}</h3>
                <p>{type.description}</p>
              </div>
              {reportType === type.id && (
                <motion.div
                  className="report-status-badge report-status-badge--ready"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                  }}
                >
                  <FiCheckCircle style={{ marginRight: "0.25rem" }} />
                  Selected
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Report Parameters & Scheduling */}
      <ReportParameterFilters
        params={reportParams}
        onChange={setReportParams}
        onApply={(params) => {
          setReportParams(params);
          fetchReport(params);
        }}
      />

      <ReportScheduling schedule={schedule} onChange={setSchedule} />

      {/* Report Actions */}
      <motion.div
        variants={buttonPressVariants}
        className="report-actions-bar"
      >
        <div className="report-actions-bar__left">
          {loading && (
            <span className="report-status-badge report-status-badge--generating">
              <FiLoader className="spinner" style={{ marginRight: "0.5rem" }} />
              Generating...
            </span>
          )}
          {reportData && !loading && (
            <span className="report-status-badge report-status-badge--ready">
              <FiCheckCircle style={{ marginRight: "0.5rem" }} />
              Ready to export
            </span>
          )}
        </div>
        
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Button
            variant="primary"
            size="md"
            onClick={fetchReport}
            disabled={loading}
            whileTap={{ scale: 0.985 }}
          >
            {loading ? (
              <>
                <FiLoader className="spinner" />
                Generating...
              </>
            ) : (
              <>
                <FiFileText style={{ marginRight: "0.5rem" }} />
                Generate Report
              </>
            )}
          </Button>
          
          <Button
            variant="secondary"
            size="md"
            onClick={downloadReport}
            disabled={loading || !reportData}
            whileTap={{ scale: 0.985 }}
          >
            <FiDownload style={{ marginRight: "0.5rem" }} />
            Download {reportParams.format?.toUpperCase() || "JSON"}
          </Button>
        </div>
      </motion.div>

      {/* Report Data Display */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="report-content"
          >
            <Card className="report-card" style={{ padding: "2rem" }}>
              <Skeleton style={{ height: "24rem" }} />
            </Card>
          </motion.div>
        ) : reportData ? (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            className="report-content"
          >
            {/* Overview Report */}
            {reportType === "overview" && (
              <motion.div variants={staggerContainer} initial="initial" animate="animate">
                <Card className="report-card">
                  <div className="report-header">
                    <h3>Platform Overview</h3>
                    <span className="report-timestamp">
                      Generated: {new Date(reportData.generated_at || Date.now()).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="stats-grid-report">
                    <div className="stat-box">
                      <div className="stat-box__icon-wrap">
                        <FiUsers />
                      </div>
                      <div className="stat-box__content">
                        <div className="stat-box__value"><AnimatedStatCounter value={reportData.total_users || 0} /></div>
                        <div className="stat-box__label">Total Users</div>
                      </div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-box__icon-wrap">
                        <FiBookOpen />
                      </div>
                      <div className="stat-box__content">
                        <div className="stat-box__value"><AnimatedStatCounter value={reportData.total_courses || 0} /></div>
                        <div className="stat-box__label">Total Programs</div>
                      </div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-box__icon-wrap">
                        <FiActivity />
                      </div>
                      <div className="stat-box__content">
                        <div className="stat-box__value"><AnimatedStatCounter value={reportData.total_enrollments || 0} /></div>
                        <div className="stat-box__label">Enrollments</div>
                      </div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-box__icon-wrap">
                        <FiCheckCircle />
                      </div>
                      <div className="stat-box__content">
                        <div className="stat-box__value"><AnimatedStatCounter value={reportData.published_courses || 0} /></div>
                        <div className="stat-box__label">Published Programs</div>
                      </div>
                    </div>
                  </div>
                </Card>

                <ChartGradients />
                <div className="analytics-grid-report">
                  <Card className="chart-card-report">
                    <h3>Role Distribution</h3>
                    <div className="chart-wrap-animated" style={{ height: "18rem" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={reportData.role_distribution || []} 
                            dataKey="count" 
                            nameKey="role" 
                            innerRadius={70} 
                            outerRadius={100}
                            paddingAngle={5}
                            animationBegin={200}
                            animationDuration={1500}
                          >
                            {(reportData.role_distribution || []).map((entry, index) => (
                              <Cell 
                                key={entry.role} 
                                fill={getSpecificColor(entry.role, index)} 
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card className="chart-card-report">
                    <h3>Category Distribution</h3>
                    <div className="chart-wrap-animated" style={{ height: "18rem" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportData.category_distribution || []}>
                          <defs>
                            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                              <feOffset dx="2" dy="4" result="offsetblur" />
                              <feComponentTransfer>
                                <feFuncA type="linear" slope="0.5" />
                              </feComponentTransfer>
                              <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
                          <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                          <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)", radius: 10 }} content={<CustomTooltip />} />
                          <Bar 
                            dataKey="total_courses" 
                            radius={[10, 10, 0, 0]} 
                            animationBegin={400}
                            animationDuration={1800}
                            barSize={36}
                          >
                            {(reportData.category_distribution || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getSpecificGradient(entry.name)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card className="chart-card-report" style={{ gridColumn: "1 / -1" }}>
                    <h3>Top Enrolled Programs</h3>
                    <div className="chart-wrap-animated" style={{ height: "20rem" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportData.top_enrolled_courses || []} margin={{ bottom: 20 }}>
                          <XAxis 
                            dataKey="title" 
                            stroke="rgba(255,255,255,0.3)" 
                            tick={{ fontSize: 11, fill: "var(--muted)" }} 
                            axisLine={false} 
                            tickLine={false}
                            interval={0}
                            angle={-10}
                            textAnchor="end"
                          />
                          <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)", radius: 10 }} content={<CustomTooltip />} />
                          <Bar 
                            dataKey="enrollment_count" 
                            radius={[12, 12, 0, 0]} 
                            animationBegin={600}
                            animationDuration={2000}
                            barSize={50}
                          >
                            {(reportData.top_enrolled_courses || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getSpecificGradient(entry.title)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Users Report */}
            {reportType === "users" && (
              <Card className="report-card">
                <div className="report-header">
                  <h3>User Report</h3>
                  <span className="report-timestamp">
                    Generated: {new Date(reportData.generated_at || Date.now()).toLocaleString()}
                  </span>
                </div>
                
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.users?.map((user) => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`role-badge role-badge--${user.role}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${user.is_active ? "status-badge--completed" : "status-badge--not-started"}`}>
                              {user.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Programs Report */}
            {reportType === "courses" && (
              <Card className="report-card">
                <div className="report-header">
                  <h3>Program Report</h3>
                  <span className="report-timestamp">
                    Generated: {new Date(reportData.generated_at || Date.now()).toLocaleString()}
                  </span>
                </div>
                
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Program Title</th>
                        <th>Category</th>
                        <th>Lead Professional</th>
                        <th>Status</th>
                        <th>Enrollments</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.courses?.map((course) => (
                        <tr key={course.id}>
                          <td>{course.id}</td>
                          <td>{course.title}</td>
                          <td>{course.category__name}</td>
                          <td>{course.instructor__username}</td>
                          <td>
                            <span className={`status-badge ${course.status === "published" ? "status-badge--completed" : "status-badge--in-progress"}`}>
                              {course.status}
                            </span>
                          </td>
                          <td>{course.enrollment_count}</td>
                          <td>{new Date(course.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Enrollments Report */}
            {reportType === "enrollments" && (
              <Card className="report-card">
                <div className="report-header">
                  <h3>Enrollment Report</h3>
                  <span className="report-timestamp">
                    Generated: {new Date(reportData.generated_at || Date.now()).toLocaleString()}
                  </span>
                </div>
                
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Learner</th>
                        <th>Program</th>
                        <th>Lead Professional</th>
                        <th>Enrolled On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.enrollments?.map((enrollment) => (
                        <tr key={enrollment.id}>
                          <td>{enrollment.id}</td>
                          <td>{enrollment.student__username}</td>
                          <td>{enrollment.course__title}</td>
                          <td>{enrollment.course__instructor__username}</td>
                          <td>{new Date(enrollment.enrolled_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </motion.div>
        ) : (
          !loading && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              className="empty-state"
            >
              <FiFileText className="empty-icon" />
              <p>Select a report type and click "Generate Report"</p>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
};

export default GenerateReports;