import { motion, useAnimation, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { FiActivity, FiTarget, FiTrendingUp, FiUsers, FiBookOpen, FiBarChart2, FiSettings, FiDatabase, FiLayers, FiFileText, FiArrowUpRight, FiStar, FiClock, FiCheckCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useAuth } from "../context/AuthContext";
import { demoCourses } from "../data/demoCourses";
import { lmsApi } from "../lib/api";
import { 
  heroVariants, 
  statCardVariants, 
  activityItemVariants, 
  chartVariants,
  pulseVariants,
  gradientVariants,
  staggerContainer
} from "../lib/animations";
import Card from "./ui/Card";
import SectionHeading from "./ui/SectionHeading";
import Skeleton from "./ui/Skeleton";
import Button from "./ui/Button";
import CircularProgress from "./ui/CircularProgress";
import NotificationDot from "./ui/NotificationDot";

const chartColors = ["#6366f1", "#42d392", "#f8c146", "#fb7185", "#a78bfa"];

// Enrolled Program Card for Student Dashboard
const EnrolledProgramCard = ({ enrollment, index }) => {
  const { course_details: course, progress_percent } = enrollment;
  
  if (!course) return null;
  
  const isCompleted = progress_percent === 100;
  
  return (
    <motion.div
      variants={statCardVariants}
      custom={index}
      initial="initial"
      animate="animate"
      layout
      className="h-full"
    >
      <Card className="enrolled-card-premium overflow-hidden h-full border-none shadow-xl dark:bg-slate-900/40 backdrop-blur-xl relative group">
        <div className="flex flex-col h-full">
          <div className="card-image-container relative">
            <img 
              src={course.thumbnail_url} 
              alt={course.title} 
              className="transform group-hover:scale-110 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            
            {/* Status Badge */}
            <div className="absolute top-4 left-4 flex gap-2">
              <div className={`backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                isCompleted ? "bg-emerald-500/80" : "bg-indigo-500/80"
              }`}>
                {isCompleted ? <FiCheckCircle size={12} /> : <FiClock size={12} />}
                {isCompleted ? "Completed" : "Active"}
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
               <div className="instructor-badge">
                  <img src={`https://ui-avatars.com/api/?name=${course.instructor_name}&background=6366f1&color=fff`} className="instructor-avatar" alt="" />
                  <span className="text-xs font-semibold text-white/90">{course.instructor_name}</span>
               </div>
            </div>
          </div>
          
          <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-xl font-bold text-slate-100 mb-4 line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors">
              {course.title}
            </h3>
            
            <div className="mt-auto space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Course Completion
                  </span>
                  <span className="text-sm font-bold text-indigo-400">
                    {progress_percent}%
                  </span>
                </div>
                <div className="progress-track-premium">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress_percent}%` }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                    className="progress-bar-premium"
                    style={{ background: isCompleted ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #6366f1, #a78bfa)' }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="module-count-badge">
                  <FiLayers size={16} className="text-indigo-400" />
                  <span>{Math.round((progress_percent / 100) * (course.lesson_count || 12))} / {course.lesson_count || 12} Modules</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                  <FiStar className="fill-current" />
                  <span>4.9</span>
                </div>
              </div>
              
              <Link to={`/courses/${course.id}`} className="block">
                <Button 
                  className="w-full justify-center group/btn py-6 rounded-2xl overflow-hidden relative btn-glow" 
                  variant={isCompleted ? "secondary" : "primary"}
                >
                  <span className="flex items-center gap-2 relative z-10">
                    {progress_percent === 0 ? "Start Journey" : isCompleted ? "Review Material" : "Resume Learning"}
                    <FiArrowUpRight className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Animated counter component
const AnimatedCounter = ({ value, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    let startTime;
    let animationFrame;
    const duration = 1500;
    const endValue = typeof value === 'number' ? value : parseInt(value) || 0;
    
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

  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {count.toLocaleString()}{suffix}
    </motion.span>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "ongoing", "ended"

  // Check if user is admin or instructor
  const isAdmin = user?.role === "admin";
  const isInstructor = user?.role === "instructor";
  const isStudent = user?.role === "student";

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [dashResponse, enrollResponse] = await Promise.all([
          lmsApi.dashboard(),
          isStudent ? lmsApi.enrollments() : Promise.resolve({ data: [] })
        ]);
        
        setData(dashResponse.data);
        setEnrollments(enrollResponse.data || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setData({
          total_users: 2540,
          total_courses: demoCourses.length,
          total_enrollments: demoCourses.reduce((sum, course) => sum + (course.enrollment_count || 0), 0),
          published_courses: demoCourses.length,
          role_counts: [
            { role: "student", count: 2210 },
            { role: "instructor", count: 280 },
            { role: "admin", count: 50 },
          ],
          top_courses: demoCourses.map((course) => ({
            id: course.id,
            title: course.title,
            enrollments: course.enrollment_count,
            status: course.status,
          })),
          recent_activity: [
            { id: 1, message: "A new learner enrolled in Web Development Bootcamp" },
            { id: 2, message: "Python for Beginners reached 980 enrollments" },
            { id: 3, message: "UI/UX Design Masterclass received 12 new reviews" },
          ],
        });
        
        if (isStudent) {
          setEnrollments(demoCourses.slice(0, 3).map((course, idx) => ({
            id: `demo-enroll-${idx}`,
            course_details: course,
            progress_percent: idx === 0 ? 100 : (idx === 1 ? 45 : 0),
            enrolled_at: new Date().toISOString()
          })));
        }
        
        setError("Showing limited data. Could not connect to API.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [isStudent]);

  const stats = data
    ? [
        { label: "Total users", value: data.total_users, icon: FiUsers },
        { label: "Total programs", value: data.total_courses, icon: FiBookOpen },
        { label: "Enrollments", value: data.total_enrollments, icon: FiActivity },
        { label: "Published", value: data.published_courses, icon: FiBarChart2 },
      ]
    : [];

  // Admin-specific stats
  const adminStats = data
    ? [
        { label: "Active sessions", value: "124", icon: FiActivity },
        { label: "Completion rate", value: "78%", icon: FiTarget },
        { label: "Avg. rating", value: "4.2", icon: FiTrendingUp },
        { label: "Databases", value: "3", icon: FiDatabase },
      ]
    : [];

  const studentStats = [
    { label: "Total Programs", value: enrollments.length, icon: FiBookOpen, color: "text-blue-500" },
    { label: "Ongoing", value: enrollments.filter(e => e.progress_percent < 100).length, icon: FiClock, color: "text-amber-500" },
    { label: "Ended", value: enrollments.filter(e => e.progress_percent === 100).length, icon: FiCheckCircle, color: "text-emerald-500" },
  ];

  const filteredEnrollments = enrollments.filter(e => {
    if (filter === "ongoing") return e.progress_percent < 100;
    if (filter === "ended") return e.progress_percent === 100;
    return true;
  });

  return (
    <div className="layout-stack">
      <SectionHeading
        eyebrow={`${user?.role === "instructor" ? "Lead Professional" : user?.role === "student" ? "Learner" : user?.role || "User"} dashboard`}
        title={isAdmin ? "Admin Control Center" : isInstructor ? "Lead Professional Dashboard" : "My Learning Dashboard"}
        description={
          isAdmin
            ? "Complete platform analytics, user management, and program performance."
            : isInstructor
            ? "Track your program performance, learner engagement, and earnings."
            : "Track your learning progress, enrolled programs, and achievements."
        }
      />

      {error ? <div className="message-banner message-banner--warning">{error}</div> : null}

      {loading ? (
        <div className="course-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} style={{ height: "20rem", borderRadius: "32px" }} />
          ))}
        </div>
      ) : (
        <>
          {/* STUDENT VIEW - Summary & Enrolled Courses Grid */}
          {isStudent && (
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="student-dashboard-content"
            >
              {/* Student Summary Stats */}
              <div className="stats-container-grid">
                 {studentStats.map((stat, idx) => (
                   <motion.div
                    key={stat.label}
                    variants={statCardVariants}
                    custom={idx}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="stat-item-wrapper"
                   >
                     <Card className="stat-card-enhanced">
                        <div className="stat-card-bg-icon">
                           <stat.icon />
                        </div>
                        <div className="stat-card-content">
                           <div className={`stat-icon-box ${stat.color}`}>
                              <stat.icon />
                           </div>
                           <div className="stat-info">
                              <span className="stat-label">{stat.label}</span>
                              <h4 className="stat-value">
                                <AnimatedCounter value={stat.value} />
                              </h4>
                           </div>
                        </div>
                     </Card>
                   </motion.div>
                 ))}
              </div>

              {/* Programs Header & Filter */}
              <div className="dashboard-filter-header">
                <div className="filter-title-group">
                  <h2 className="dashboard-subheading">My Programs</h2>
                  <div className="status-count-badge">
                    <span className="count-pulse"></span>
                    {filteredEnrollments.length} {filter !== 'all' ? filter : 'Active'}
                  </div>
                </div>

                <div className="motion-filter-bar">
                   {['all', 'ongoing', 'ended'].map((type) => (
                     <button
                      key={type}
                      onClick={() => setFilter(type)}
                      className={`filter-btn ${filter === type ? 'active' : ''}`}
                     >
                       {filter === type && (
                         <motion.div 
                          layoutId="filter-bg"
                          className="filter-btn-bg"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                         />
                       )}
                       <span className="btn-text">{type}</span>
                     </button>
                   ))}
                </div>
              </div>
              
              <AnimatePresence mode="popLayout">
                {filteredEnrollments.length > 0 ? (
                  <motion.div 
                    layout
                    className="course-grid student-perspective-grid"
                  >
                    {filteredEnrollments.map((enrollment, index) => (
                      <EnrolledProgramCard 
                        key={enrollment.id} 
                        enrollment={enrollment} 
                        index={index} 
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="empty-state-container"
                  >
                    <Card className="status-panel-enhanced">
                      <div className="empty-icon-wrapper">
                        <FiBookOpen />
                      </div>
                      <h3 className="empty-title">No {filter !== 'all' ? filter : ''} programs found</h3>
                      <p className="empty-description">
                        {filter === 'all' 
                          ? "It looks like you haven't started your learning journey yet." 
                          : `You don't have any programs marked as ${filter} right now.`}
                      </p>
                      <Link to="/courses" className="browse-link">
                        <Button variant="primary" className="btn-glow">
                          <span>Explore Programs</span>
                          <FiArrowUpRight />
                        </Button>
                      </Link>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ADMIN & LEAD PROFESSIONAL VIEWS - Analytics & Charts */}
          {(isAdmin || isInstructor) && (
            <>
              {/* Role-specific hero section */}
              {isAdmin && (
                <motion.section 
                  variants={heroVariants}
                  initial="initial" 
                  animate="animate"
                  className="dashboard-hero hero-gradient"
                >
                  <div className="dashboard-hero__inner">
                    <div>
                      <div className="ui-badge">Admin Control Panel</div>
                      <h2 className="ui-heading__title" style={{ marginTop: "1rem" }}>
                        Platform Health & Management
                      </h2>
                      <p className="ui-heading__text">
                        Monitor user activity and system performance.
                      </p>
                    </div>
                    <div className="mini-stat-grid">
                      {adminStats.map((item, index) => (
                        <motion.div 
                          key={item.label}
                          variants={statCardVariants}
                          initial="initial"
                          animate="animate"
                          custom={index}
                          className="mini-card"
                        >
                          <div className="mini-card__label">{item.label}</div>
                          <div className="row-between" style={{ marginTop: "0.75rem" }}>
                            <div className="mini-card__value" style={{ marginTop: 0 }}><AnimatedCounter value={item.value} /></div>
                            <item.icon />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Stats grid */}
              <div className="stats-grid">
                {stats.map((stat, index) => (
                  <motion.div 
                    key={stat.label} 
                    variants={statCardVariants}
                    initial="initial" 
                    animate="animate"
                    custom={index}
                  >
                    <Card className="stat-card motion-card-hover">
                      <div className="stat-card__label">{stat.label}</div>
                      <div className="stat-card__value">
                        <AnimatedCounter value={stat.value} />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Admin-specific sections */}
              {isAdmin && data.user_growth && (
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="chart-card">
                    <h2 style={{ marginTop: 0 }}>User Growth Trend</h2>
                    <p className="subtle-text">New user registrations over the last 6 months</p>
                    <div className="chart-wrap">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.user_growth}>
                          <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: "#07111f", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, color: "#fff" }} />
                          <Bar dataKey="users" radius={[12, 12, 0, 0]} fill="#42d392" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </motion.div>
              )}

              {isAdmin && (
                <motion.div variants={chartVariants} initial="initial" animate="animate">
                  <Card className="action-card">
                    <div className="inline-meta">
                      <h3 style={{ margin: 0 }}>Quick Admin Actions</h3>
                      <FiSettings />
                    </div>
                    <p className="subtle-text">Frequently used administrative functions.</p>
                    <div className="action-grid">
                      <motion.div whileHover="pulse" variants={pulseVariants}>
                        <Link to="/admin/courses" className="action-tile">
                          <FiBookOpen />
                          <span>Manage Programs</span>
                        </Link>
                      </motion.div>
                      <motion.div whileHover="pulse" variants={pulseVariants}>
                        <Link to="/admin/modules" className="action-tile">
                          <FiLayers />
                          <span>Module Management</span>
                        </Link>
                      </motion.div>
                      <motion.div whileHover="pulse" variants={pulseVariants}>
                        <Link to="/users" className="action-tile">
                          <FiUsers />
                          <span>User Management</span>
                        </Link>
                      </motion.div>
                      <motion.div whileHover="pulse" variants={pulseVariants}>
                        <Link to="/admin/reports" className="action-tile">
                          <FiFileText />
                          <span>Generate Reports</span>
                        </Link>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {isInstructor && !isAdmin && (
                <motion.div variants={chartVariants} initial="initial" animate="animate">
                  <Card className="action-card">
                    <div className="inline-meta">
                      <h3 style={{ margin: 0 }}>Lead Professional Actions</h3>
                      <FiSettings />
                    </div>
                    <p className="subtle-text">Manage your programs and generate reports.</p>
                    <div className="action-grid">
                      <motion.div whileHover="pulse" variants={pulseVariants}>
                        <Link to="/admin/reports" className="action-tile">
                          <FiFileText />
                          <span>Generate Reports</span>
                        </Link>
                      </motion.div>
                      <motion.div whileHover="pulse" variants={pulseVariants}>
                        <Link to="/admin/modules" className="action-tile">
                          <FiLayers />
                          <span>Module Management</span>
                        </Link>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
