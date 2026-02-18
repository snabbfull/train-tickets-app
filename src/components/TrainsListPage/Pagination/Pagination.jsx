import "./Pagination.css";

const Pagination = ({ totalCount, limit, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalCount / limit);

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ‹
      </button>

      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          className={currentPage === i + 1 ? "active" : ""}
          onClick={() => onPageChange(i + 1)}
        >
          {i + 1}
        </button>
      ))}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        ›
      </button>
    </div>
  );
};

export default Pagination;
