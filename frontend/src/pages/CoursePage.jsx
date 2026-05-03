import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";
import { FiArrowUpRight, FiBookmark, FiFilter, FiGrid, FiLayers, FiSearch, FiStar, FiZap } from "react-icons/fi";
import { Link } from "react-router-dom";

import { demoCourses } from "../data/demoCourses";
import { lmsApi } from "../lib/api";
import { 
  staggerContainer, 
  courseCardVariants, 
  heroVariants,
  pageTransitionVariants,
  premiumGridVariants,
  premiumCardVariants,
  premiumButtonVariants,
  premiumDropdownVariants
} from "../lib/animations";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import SectionHeading from "./components/ui/SectionHeading";
import Skeleton from "./components/ui/Skeleton";
import SelectDropdown from "./components/ui/SelectDropdown";

const PAGE_SIZE = 9; // Increased for premium grid layout

const CoursePage = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [courseResponse, categoryResponse] = await Promise.all([lmsApi.courses(), lmsApi.categories()]);
        const apiCourses = courseResponse.data?.length ? courseResponse.data : demoCourses;
        setCourses(apiCourses);
        setCategories(categoryResponse.data || []);
        setUsingFallback(!courseResponse.data?.length);
      } catch {
        setCourses(demoCourses);
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Sort courses based on selection
  const sortedCourses = useMemo(() => {
    let sorted = [...courses];
    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case "title-asc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "popular":
        sorted.sort((a, b) => (b.enrollment_count || 0) - (a.enrollment_count || 0));
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }
    return sorted;
  }, [courses, sortBy]);

  // Filter courses based on search and category
  const filteredCourses = useMemo(() => {
    return sortedCourses.filter((course) => {
      const matchesSearch =
        !search ||
        [course.title, course.short_description, course.instructor_name, course.category_name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" ||
        String(course.category) === selectedCategory ||
        course.category_name === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [sortedCourses, search, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const pagedCourses = filteredCourses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, sortBy]);

  // Premium course card with glassmorphism effect
  const PremiumCourseCard = ({ course }) => {
    const handleEnroll = async () => {
      try {
        await lmsApi.enroll({ course: course.id });
        // Show success feedback (would normally use toast/notifications)
      } catch (error) {
        // Show error feedback
      }
    };

    return (
      <motion.div
        variants={premiumCardVariants}
        custom={Math.random()}
        whileHover={{ 
          y: -8, 
          scale: 1.02,
          transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
        }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className="premium-course-card">
          <div className="premium-course-card__content">
            {/* Course Media with Premium Overlay */}
            <div className="premium-course-card__media">
              <img 
                src={course.thumbnail_url} 
                alt={course.title} 
                className="premium-course-card__image"
              />
              <div className="premium-course-card__overlay">
                <div className="premium-course-card__overlay-content">
                  <div className="premium-course-card__tags">
                    {[course.category_name, course.status].map((tag, index) => (
                      <span key={index} className="premium-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="premium-course-card__stats">
                    <span><FiPlayCircle /> {course.lesson_count || 0} modules</span>
                    <span><FiUsers /> {course.enrollment_count || 0} students</span>
                  </div>
                  <motion.button
                    onClick={handleEnroll}
                    className="premium-enroll-button"
                    variants={premiumButtonVariants}
                    initial="initial"
                    animate="animate"
                  >
                    Enroll Now
                    <FiArrowUpRight className="ml-2" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Course Information */}
            <div className="premium-course-card__info">
              <div className="premium-course-card__meta">
                <span>{course.instructor_name}</span>
                <span className="premium-course-card__rating">
                  <FiStar />
                  {(course.rating || 4.9).toFixed(1)}
                </span>
              </div>
              
              <h3 className="premium-course-card__title">{course.title}</h3>
              <p className="premium-course-card__description">
                {course.short_description || course.description}
              </p>
              
              <div className="premium-course-card__features">
                {["Certificate", "Lifetime access", "Mentor notes"].map((feature, index) => (
                  <span key={index} className="premium-feature-tag">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  // Premium list item view
  const PremiumListItem = ({ course }) => {
    const handleEnroll = async () => {
      try {
        await lmsApi.enroll({ course: course.id });
        // Show success feedback
      } catch (error) {
        // Show error feedback
      }
    };

    return (
      <motion.div
        variants={premiumCardVariants}
        custom={Math.random()}
        whileHover={{ 
          x: 4, 
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        whileTap={{ scale: 0.99 }}
      >
        <Card className="premium-course-list-item">
          <div className="flex items-center gap-4">
            {/* Course Media */}
            <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden">
              <img 
                src={course.thumbnail_url} 
                alt={course.title} 
                className="object-cover h-full w-full"
              />
            </div>
            
            {/* Course Information */}
            <div className="flex-1">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-sm font-medium premium-tag">{course.category_name}</span>
                <span className="text-sm font-medium premium-tag">{course.status}</span>
              </div>
              
              <h3 className="text-lg font-semibold course-title">{course.title}</h3>
              <p className="text-sm text-muted-foreground course-description">
                {course.short_description || course.description}
              </p>
              
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <FiPlayCircle className="h-4 w-4" />
                  <span>{course.lesson_count || 0} modules</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiUsers className="h-4 w-4" />
                  <span>{course.enrollment_count || 0} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiStar className="h-4 w-4 text-warning" />
                  <span className="font-medium">{course.rating || 4.9}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {["Certificate", "Lifetime access", "Mentor notes"].map((feature, index) => (
                  <span key={index} className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Enrollment Button */}
            <motion.button
              onClick={handleEnroll}
              className="flex-shrink-0 premium-enroll-button-sm"
              variants={premiumButtonVariants}
              initial="initial"
              animate="animate"
            >
              Enroll
              <FiArrowUpRight className="ml-2 h-4 w-4" />
            </motion.button>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Page Transition */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={`course-page-${selectedCategory}-${sortBy}-${currentPage}`}
          variants={pageTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="min-h-screen"
        >
          {/* Hero Section */}
          <motion.section 
            variants={heroVariants}
            initial="initial" 
            animate="animate" 
            className="course-hero relative overflow-hidden"
          >
            {/* Hero Background Elements */}
            <div className="hero-bg-pattern absolute inset-0 opacity-5" />
            <div className="hero-orb-accent absolute -top-10 -right-10" />
            <div className="hero-orb-accent absolute bottom-10 left-10" />
            
            <div class="course-hero__inner relative z-10 pt-20 pb-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 rounded-full bg-primary/10 px-4 py-2 text-primary font-medium">
                    <FiZap className="h-5 w-5" />
                    LMS Learning Hub
                  </div>
                  <h1 className="display-2 font-bold mb-4">
                    Discover Premium Learning Programs
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Elevate your skills with expertly crafted courses designed for professional growth and mastery.
                  </p>
                </div>
                
      {/* Premium Filter Bar */}
                 <div className="space-y-6">
                   <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                     {/* Search */}
                     <div className="w-full lg:w-1/3">
                       <label className="flex items-center gap-2">
                         <FiSearch className="h-4 w-4 text-muted-foreground" />
                         <input
                           type="text"
                           placeholder="Search courses, instructors, topics..."
                           value={search}
                           onChange={(e) => setSearch(e.target.value)}
                           className="w-full pl-8 pr-4 py-3 rounded-xl border border-transparent bg-white/80 dark:bg-gray-800/20 focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-md transition-all duration-300"
                         />
                       </label>
                     </div>
                     
                     {/* Controls */}
                     <div className="flex lg:gap-4 w-full lg:w-2/3 justify-between lg:justify-end">
                       <div className="flex lg:gap-3">
                         {/* Category Filter */}
                         <div className="relative w-full lg:w-1/2">
                           <SelectDropdown
                             placeholder="All Categories"
                             value={selectedCategory}
                             onChange={setSelectedCategory}
                             options={categories.map(cat => ({
                               value: String(cat.id),
                               label: cat.name,
                             }))}
                             searchable
                             className="w-full"
                             size="lg"
                           />
                         </div>
                         
                         {/* Sort Dropdown */}
                         <div className="relative w-full lg:w-1/2">
                           <SelectDropdown
                             placeholder="Sort by: Newest"
                             value={sortBy}
                             onChange={setSortBy}
                             options={[
                               { value: "newest", label: "Newest First" },
                               { value: "oldest", label: "Oldest First" },
                               { value: "title-asc", label: "Title A-Z" },
                               { value: "title-desc", label: "Title Z-A" },
                               { value: "popular", label: "Most Popular" },
                               { value: "rating", label: "Highest Rated" },
                             ]}
                             searchable
                             className="w-full"
                             size="lg"
                           />
                         </div>
                       </div>
                       
                       {/* View Toggle & Actions */}
                       <div className="flex items-center gap-3">
                         <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent bg-white/80 dark:bg-gray-800/20 hover:bg-white/90 dark:hover:bg-gray-800/30 transition-all duration-300">
                           <FiGrid className={`h-4 w-4 ${viewMode === "grid" ? "text-primary" : "text-muted-foreground"}`} onClick={() => setViewMode("grid")} />
                           <FiLayers className={`h-4 w-4 ${viewMode === "list" ? "text-primary" : "text-muted-foreground"}`} onClick={() => setViewMode("list")} />
                         </div>
                         
                         <Button variant="secondary" size="lg">
                           View wishlist
                           <FiBookmark />
                         </Button>
                       </div>
                     </div>
                   </div>
                  
                  {/* Stats Bar */}
                  <div className="flex flex-col lg:flex-row lg:justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <motion.div 
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                      className="flex-1 space-x-6 lg:space-x-12"
                    >
                      {[
                        { label: "Total Programs", value: `${courses.length || demoCourses.length}`, icon: <FiZap /> },
                        { label: "Categories", value: `${categories.length || 5}`, icon: <FiGrid /> },
                        { label: "Learning Paths", value: "Fluid", icon: <FiLayers /> },
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
                          variants={{
                            initial: { opacity: 0, x: 20 },
                            animate: { 
                              opacity: 1, 
                              x: 0,
                              transition: { delay: index * 0.05, duration: 0.6, ease: [0.23, 1, 0.32, 1] }
                            }
                          }}
                          className="flex items-center gap-3 stat-card"
                        >
                          <div className="stat-icon bg-primary/10 rounded-full p-2 text-primary">
                            {item.icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                            <p className="text-lg font-bold">{item.value}</p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                    
                    <div className="text-right text-sm text-muted-foreground">
                      Showing {pagedCourses.length} of {filteredCourses.length} programs
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Course Grid/List */}
            <motion.div
              variants={premiumGridVariants}
              initial="initial"
              animate="animate"
              className="course-display"
            >
              {loading ? (
                <>
                  {/* Loading Skeletons for Grid View */}
                  {viewMode === "grid" && (
                    <div className="grid gap-6">
                      {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                        <motion.div key={index} variants={courseCardVariants} custom={index}>
                          <Card className="premium-course-card">
                            <div className="flex h-64 items-center justify-center">
                              <Skeleton className="h-full w-full rounded-2xl" />
                            </div>
                            <div className="space-y-4 pt-4">
                              <Skeleton className="h-4 w-3/4 rounded" />
                              <Skeleton className="h-3 w-1/2 rounded" />
                              <Skeleton className="h-2 w-1/3 rounded" />
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  
                  {/* Loading Skeletons for List View */}
                  {viewMode === "list" && (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <motion.div key={index} variants={courseCardVariants} custom={index}>
                          <Card className="premium-course-list-item">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0 w-24 h-24">
                                <Skeleton className="h-full w-full rounded-xl" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-full rounded" />
                                <Skeleton className="h-3 w-2/3 rounded" />
                                <Skeleton className="h-2 w-1/2 rounded" />
                                <div className="flex space-x-4">
                                  <Skeleton className="h-3 w-1/4 rounded" />
                                  <Skeleton className="h-3 w-1/4 rounded" />
                                  <Skeleton className="h-3 w-1/4 rounded" />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {Array.from({ length: 3 }).map((_, idx) => (
                                    <Skeleton key={idx} className="h-2 w-16 rounded" />
                                  ))}
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                <Skeleton className="h-8 w-24 rounded-xl" />
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Course Grid View */}
                  {viewMode === "grid" && (
                    <div className="grid gap-6 lg:grid-cols-3">
                      {pagedCourses.map((course, index) => (
                        <motion.div
                          key={course.id}
                          variants={premiumCardVariants}
                          custom={index}
                        >
                          <PremiumCourseCard course={course} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                  
                  {/* Course List View */}
                  {viewMode === "list" && (
                    <div className="space-y-6">
                      {pagedCourses.map((course, index) => (
                        <motion.div
                          key={course.id}
                          variants={premiumCardVariants}
                          custom={index}
                        >
                          <PremiumListItem course={course} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="mt-12 flex items-center justify-between px-4"
              >
                <p className="text-sm text-muted-foreground">
                  Showing {pagedCourses.length} of {filteredCourses.length} programs
                </p>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="lg"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  >
                    Previous
                    <FiArrowUpRight className="ml-2" />
                  </Button>
                  
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-transparent bg-white/80 dark:bg-gray-800/20">
                    <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                  </div>
                  
                  <Button
                    variant="secondary"
                    size="lg"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  >
                    Next
                    <FiArrowUpRight className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </main>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CoursePage;