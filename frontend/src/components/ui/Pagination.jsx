import { motion } from "framer-motion";
import React from "react";
import { FiChevronLeft, FiChevronRight, FiMoreHorizontal } from "react-icons/fi";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  maxVisiblePages = 5,
  showFirstLast = true,
  showPrevNext = true,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      {showFirstLast && (
        <button
          className="pagination__btn pagination__btn--first"
          onClick={() => handlePageClick(1)}
          disabled={currentPage === 1}
          title="First page"
        >
          <FiChevronLeft />
          <FiChevronLeft style={{ marginLeft: -8 }} />
        </button>
      )}

      {showPrevNext && (
        <button
          className="pagination__btn pagination__btn--prev"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous page"
        >
          <FiChevronLeft />
        </button>
      )}

      <div className="pagination__pages">
        {getPageNumbers().map((page) => (
          <motion.button
            key={page}
            className={`pagination__page ${
              page === currentPage ? "pagination__page--active" : ""
            }`}
            onClick={() => handlePageClick(page)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {page}
          </motion.button>
        ))}
      </div>

      {showPrevNext && (
        <button
          className="pagination__btn pagination__btn--next"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Next page"
        >
          <FiChevronRight />
        </button>
      )}

      {showFirstLast && (
        <button
          className="pagination__btn pagination__btn--last"
          onClick={() => handlePageClick(totalPages)}
          disabled={currentPage === totalPages}
          title="Last page"
        >
          <FiChevronRight />
          <FiChevronRight style={{ marginLeft: -8 }} />
        </button>
      )}
    </div>
  );
};

export default Pagination;
