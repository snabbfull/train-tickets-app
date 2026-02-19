import "./Pagination.css";

const Pagination = ({ totalCount, limit, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalCount / limit);
  const visiblePages =
    totalPages >= 10
      ? [1, 2, 3, "ellipsis", totalPages]
      : Array.from({ length: totalPages }, (_, i) => i + 1);

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        type="button"
        className="pagination-nav-btn pagination-nav-btn-left"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ‹
      </button>

      {visiblePages.map((page, idx) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            className={`pagination-page-btn ${currentPage === page ? "active" : ""}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        className="pagination-nav-btn pagination-nav-btn-right"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        ›
      </button>
    </div>
  );
};

export default Pagination;
