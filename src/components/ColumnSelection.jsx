// src/components/ColumnSelection.jsx
import React, { useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const ColumnSelection = ({ 
  showColumnSelection, 
  setShowColumnSelection, 
  selectedColumns, 
  setSelectedColumns,
  getText,
  language,
  essentialColumns,
  allColumns
}) => {
  // Memoize optional columns to prevent recalculation
  const optionalColumns = useMemo(() => {
    return allColumns.filter(col => !essentialColumns.includes(col));
  }, [allColumns, essentialColumns]);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <button
        onClick={() => setShowColumnSelection(!showColumnSelection)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-lg font-semibold">{getText("Column Selection", language)}</h3>
        {showColumnSelection ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {showColumnSelection && (
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {getText("Essential Columns", language)}
                </h4>
                <p className="text-sm text-gray-500">
                  {essentialColumns.join(", ")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedColumns([...optionalColumns])}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                >
                  {getText("Select All", language)}
                </button>
                <button
                  onClick={() => setSelectedColumns([])}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  {getText("Deselect All", language)}
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {getText("Select Columns", language)}
              </h4>
              <div className="max-h-40 overflow-y-auto">
                {optionalColumns.map(col => (
                  <label key={col} className="flex items-center space-x-2 mb-1">
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(col)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedColumns(prev => [...prev, col]);
                        } else {
                          setSelectedColumns(prev => prev.filter(c => c !== col));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{col}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ColumnSelection);