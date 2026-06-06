import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({ totalItems, currentPage, pageSize, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems <= pageSize) return null;

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="pagination-bar">
      <div className="pagination-info">
        {startItem}-{endItem} / {totalItems} ta yozuv
      </div>

      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Oldingi sahifa"
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers.map((page) => (
          <button
            type="button"
            key={page}
            className={`pagination-btn page-number ${page === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          className="pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Keyingi sahifa"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
