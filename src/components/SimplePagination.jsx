// src/components/SimplePagination.jsx
import React from 'react';

const SimplePagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  totalItems,
  getText,
  language
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {getText ? getText("Rows per page:", language) : "Rows per page:"}
        </span>
        <select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          className="px-2 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={250}>250</option>
          <option value={500}>500</option>
        </select>
        
        <span className="text-sm text-gray-600 ml-4">
          {getText ? getText("Showing", language) : "Showing"} {Math.min((currentPage - 1) * rowsPerPage + 1, totalItems)}-
          {Math.min(currentPage * rowsPerPage, totalItems)} {getText ? getText("of", language) : "of"} {totalItems}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <span className="px-3 py-1">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default React.memo(SimplePagination);