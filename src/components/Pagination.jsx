// src/components/Pagination.jsx
import React from 'react';
import { useAppContext } from '../context/AppContext';

const Pagination = ({ 
  currentPage,
  totalPages,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  totalItems,
  getText,
  language
}) => {
  const { darkMode } = useAppContext();
  // Generate array of page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than max pages to show
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end page numbers
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if near beginning or end
      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pb-4">
      <div className="flex items-center gap-2">
        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {getText("Rows per page:", language)}
        </span>
        <select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          className={`px-2 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'border border-gray-300'}`}
        >
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={250}>250</option>
          <option value={500}>500</option>
        </select>
        <span className={`text-sm ml-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {getText("Showing", language)} {Math.min((currentPage - 1) * rowsPerPage + 1, totalItems)}-
          {Math.min(currentPage * rowsPerPage, totalItems)} {getText("of", language)} {totalItems}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          &laquo;
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          &lsaquo;
        </button>
        
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            className={`px-3 py-1 rounded border text-sm ${
              currentPage === page 
                ? 'bg-blue-600 text-white border-blue-600' 
                : page === '...' 
                  ? 'cursor-default' 
                  : darkMode
                    ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700'
                    : 'hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          &rsaquo;
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};

export default React.memo(Pagination);