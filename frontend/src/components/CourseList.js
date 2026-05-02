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
  pageTransitionVariants
} from "../lib/animations";
import Button from "./ui/Button";
import Card from "./ui/Card";
import SectionHeading from "./ui/SectionHeading";
import Skeleton from "./ui/Skeleton";

const PAGE_SIZE = 6;

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

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

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
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
  }, [courses, search, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const pagedCourses = filteredCourses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  return (
    <div className="layout-stack">
      <motion.section 
        variants={heroVariants}
        initial="initial" 
        animate="animate" 
        className="catalog-hero hero-noise"
      >
        <div className="hero-orb-accent" />
        <div className="catalog-hero__inner">
          <div>
            <div className="ui-badge">
              <FiZap />
              LMS Learning Hub
            </div>
            <h1 className="ui-heading__title" style={{ marginTop: "1rem" }}>
              Access educational materials through a professional LMS interface.
            </h1>
            <p className="ui-heading__text">
              Manage your learning journey with structured modules, track progress, and explore specialized certifications in our comprehensive system.
            </p>
          </div>
          <motion.div 
            className="catalog-metrics"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[
              { label: "Active Programs", value: `${courses.length || demoCourses.length}`, icon: <FiZap /> },
              { label: "Categories", value: `${categories.length || 5}`, icon: <FiGrid /> },
              { label: "Layouts", value: "Fluid", icon: <FiLayers /> },
            ].map((item, index) => (
              <motion.div 
                key={item.label} 
                variants={{
                  initial: { opacity: 0, x: 20 },
                  animate: { 
                    opacity: 1, 
                    x: 0,
                    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
                  }
                }}
                className="mini-card"
                whileHover={{ scale: 1.02, y: -10 }}
              >
                <div className="mini-card__icon">{item.icon}</div>
                <div className="mini-card__label">{item.label}</div>
                <div className="mini-card__value">{item.value}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <SectionHeading
        eyebrow="Explore"
        title="Comprehensive Learning Management for Professionals."
        description="Search by module, browse by category, and access your training materials with an optimized, responsive dashboard experience."
        action={usingFallback ? <div className="ui-badge">Demo environment active</div> : null}
      />

      <Card className="filter-card">
        <div className="filter-bar">
          <label className="input-shell">
            <FiSearch />
            <input
              className="input-shell__field"
              placeholder="Search programs, lead professionals, categories"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <label className="input-shell">
            <FiFilter />
            <select className="input-shell__field" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
              {!categories.length
                ? [...new Set(demoCourses.map((course) => course.category_name))].map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))
                : null}
            </select>
          </label>

          <Button variant="secondary" size="lg">
            View wishlist
            <FiBookmark />
          </Button>
        </div>
      </Card>

      {loading ? (
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="course-grid"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <motion.div key={index} variants={courseCardVariants} custom={index}>
              <Card className="course-card">
                <div className="ui-card__body" style={{ padding: "1rem" }}>
                  <Skeleton className="course-card__media" />
                  <Skeleton style={{ height: "1.4rem", marginTop: "1rem" }} />
                  <Skeleton style={{ height: "1rem", marginTop: "0.75rem" }} />
                  <Skeleton style={{ height: "1rem", marginTop: "0.5rem", width: "80%" }} />
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div 
              key={`${selectedCategory}-${currentPage}`}
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              exit="exit"
              className="course-grid"
            >
              {pagedCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  variants={courseCardVariants}
                  custom={index}
                  whileHover="hover"
                >
                  <Card className="course-card">
                    <div className="course-card__body">
                      <div className="course-card__media">
                        <img src={course.thumbnail_url} alt={course.title} className="course-card__image" />
                        <div className="course-card__overlay" />
                      </div>
                      <div className="course-card__content">
                        <div className="card-meta">
                          <span>{course.instructor_name}</span>
                          <span className="inline-meta">
                            <FiStar />
                            4.9
                          </span>
                        </div>
                        <div>
                          <h3 className="course-card__title">{course.title}</h3>
                          <p className="course-card__text">{course.short_description || course.description}</p>
                        </div>
                        <div className="tag-list">
                          {["Certificate", "Lifetime access", "Mentor notes"].map((pill) => (
                            <span key={pill} className="tag-pill">
                              {pill}
                            </span>
                          ))}
                        </div>
                        <div className="row-between">
                          <span className="subtle-text">{course.lesson_count || 0} modules</span>
                          <span className="subtle-text">{course.enrollment_count || 0} learners</span>
                        </div>
                        <div className="course-card__actions">
                          <Link to={`/courses/${course.id}`} style={{ flex: 1 }}>
                            <Button className="w-full" size="lg">
                              Program Details
                              <FiArrowUpRight />
                            </Button>
                          </Link>
                          <Button variant="secondary" size="lg">
                            <FiBookmark />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          <div className="pagination-row">
            <p className="subtle-text">
              Showing {pagedCourses.length} of {filteredCourses.length} programs
            </p>
            <div className="inline-actions">
              <Button variant="secondary" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>
                Previous
              </Button>
              <div className="tag-pill">Page {currentPage} of {totalPages}</div>
              <Button variant="secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CourseList;
