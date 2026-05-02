import { motion } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiClock, FiPlayCircle, FiStar, FiUsers } from "react-icons/fi";
import { useParams } from "react-router-dom";

import { demoCourses } from "../data/demoCourses";
import { lmsApi } from "../lib/api";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Skeleton from "./ui/Skeleton";

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const [courseResponse, enrollmentResponse] = await Promise.allSettled([lmsApi.course(id), lmsApi.enrollments()]);
        if (courseResponse.status === "fulfilled") {
          setCourse(courseResponse.value.data);
        } else {
          setCourse(demoCourses.find((item) => String(item.id) === String(id)) || demoCourses[0]);
        }

        if (enrollmentResponse.status === "fulfilled") {
          setEnrollments(enrollmentResponse.value.data);
        }
      } catch {
        setError("Could not load program details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const activeEnrollment = useMemo(
    () => enrollments.find((enrollment) => String(enrollment.course) === String(course?.id)),
    [enrollments, course]
  );

  const handleEnroll = async () => {
    try {
      await lmsApi.enroll({ course: course.id });
      setMessage("Enrollment successful.");
      const enrollmentResponse = await lmsApi.enrollments();
      setEnrollments(enrollmentResponse.data);
    } catch (requestError) {
      const payload = requestError.response?.data;
      const firstValue = payload ? Object.values(payload)[0] : null;
      setError(Array.isArray(firstValue) ? firstValue[0] : "Enrollment failed.");
    }
  };

  if (loading) {
    return (
      <div className="layout-stack">
        <Skeleton style={{ height: "26rem" }} />
        <div className="detail-grid">
          <Skeleton style={{ height: "14rem" }} />
          <Skeleton style={{ height: "14rem" }} />
        </div>
      </div>
    );
  }

  if (!course) {
    return <div className="status-panel">Program not found.</div>;
  }

  return (
    <div className="layout-stack">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="detail-hero">
        <img src={course.thumbnail_url} alt={course.title} className="detail-hero__image" />
        <div className="detail-hero__overlay" />
        <div className="detail-hero__content">
          <div className="tag-list">
            <span className="tag-pill">{course.category_name}</span>
            <span className="tag-pill">{course.status}</span>
          </div>
          <h1 className="ui-heading__title" style={{ marginTop: "1rem" }}>{course.title}</h1>
          <p className="ui-heading__text">{course.description}</p>
          <div className="detail-hero__stats inline-meta" style={{ marginTop: "1.5rem" }}>
            <span className="inline-meta"><FiUsers /> {course.enrollment_count || 0} learners</span>
            <span className="inline-meta"><FiPlayCircle /> {course.lesson_count || 0} units</span>
            <span className="inline-meta"><FiStar /> 4.9 rating</span>
          </div>
        </div>
      </motion.section>

      {message ? <div className="message-banner message-banner--success">{message}</div> : null}
      {error ? <div className="message-banner message-banner--error">{error}</div> : null}

      <div className="detail-grid">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="chart-card">
            <div className="row-between">
              <h2 style={{ margin: 0 }}>Program Outline</h2>
              <span className="subtle-text">{course.modules?.length || 0} modules</span>
            </div>
            <div className="module-stack" style={{ marginTop: "1rem" }}>
              {(course.modules?.length ? course.modules : demoCourses[0].modules).map((module, moduleIndex) => (
                <div key={module.id || moduleIndex} className="module-card">
                  <div className="row-between">
                    <div>
                      <div className="metric-tile__label">Module {moduleIndex + 1}</div>
                      <h3 style={{ margin: "0.65rem 0 0" }}>{module.title}</h3>
                      {module.description ? <p className="subtle-text">{module.description}</p> : null}
                    </div>
                    <div className="tag-pill"><FiPlayCircle /></div>
                  </div>
                  <div className="stack-list" style={{ marginTop: "1rem" }}>
                    {(module.lessons || []).map((lesson, lessonIndex) => (
                      <div key={lesson.id || lessonIndex} className="lesson-row">
                        <div>
                          <div style={{ fontWeight: 500 }}>{lesson.title}</div>
                          <p className="subtle-text">{lesson.content}</p>
                        </div>
                        <span className="inline-meta"><FiClock /> {lesson.duration_minutes || 5} min</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <div className="layout-stack">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="side-card">
              <h2 style={{ marginTop: 0 }}>Enrollment</h2>
              <p className="subtle-text">
                Join this program to unlock units, progress tracking, and dashboard visibility.
              </p>
              <div className="info-box" style={{ marginTop: "1rem" }}>
                <span className="inline-meta"><FiCheckCircle /> Duplicate enrollments are blocked server-side.</span>
              </div>
              <div style={{ marginTop: "1rem" }}>
                {activeEnrollment ? (
                  <div className="message-banner message-banner--success">
                    You're enrolled. Progress: {activeEnrollment.progress_percent}% complete.
                  </div>
                ) : (
                  <Button size="lg" className="w-full" onClick={handleEnroll}>
                    Enroll now
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="side-card">
              <h3 style={{ marginTop: 0 }}>Lead Professional</h3>
              <p>{course.instructor_name}</p>
              <p className="subtle-text">Program ownership respects lead professional editing on the backend.</p>
              <div className="summary-box" style={{ marginTop: "1rem" }}>
                Reviews, certificates, quizzes, and bookmarks now have dedicated UI space for the next iteration.
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
