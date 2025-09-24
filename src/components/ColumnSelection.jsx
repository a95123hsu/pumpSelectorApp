// src/components/ColumnSelection.jsx
import React, { useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ColumnSelection = ({ 
  showColumnSelection, 
  setShowColumnSelection, 
  selectedColumns, 
  setSelectedColumns,
  getText,
  language,
  essentialColumns,
  allColumns,
  outletSizeUnit = "mm"
}) => {
  const { darkMode } = useAppContext();
  // Memoize optional columns to prevent recalculation
  const optionalColumns = useMemo(() => {
    return allColumns.filter(col => !essentialColumns.includes(col));
  }, [allColumns, essentialColumns]);
  
  return (
    <div className={`rounded-lg shadow-sm border p-6 mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      <button
        onClick={() => setShowColumnSelection(!showColumnSelection)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-blue-200' : 'text-gray-900'}`}>
          {getText("Column Selection", language)}
        </h3>
        {showColumnSelection ? (
          <ChevronUp className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        ) : (
          <ChevronDown className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        )}
      </button>
      
      {showColumnSelection && (
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {getText("Essential Columns", language)}
                </h4>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {essentialColumns.map(col => getText(col, language)).join(", ")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedColumns([...optionalColumns])}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    darkMode 
                      ? 'bg-blue-800 text-blue-100 hover:bg-blue-700' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {getText("Select All", language)}
                </button>
                <button
                  onClick={() => setSelectedColumns([])}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getText("Deselect All", language)}
                </button>
              </div>
            </div>
            <div>
              <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {getText("Select Columns", language)}
              </h4>
              <div className="max-h-40 overflow-y-auto">
                {optionalColumns.map(col => {
                  // Special handling for outlet column to include the unit
                  const labelText = col === "Outlet" ? 
                    getText("Outlet with unit", language, { unit: getText(outletSizeUnit, language) }) : 
                    getText(col, language);
                    
                  return (
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
                        className={`rounded text-blue-600 focus:ring-blue-500 ${
                          darkMode 
                            ? 'border-gray-500 bg-gray-700 focus:ring-offset-gray-800' 
                            : 'border-gray-300 bg-white'
                        }`}
                      />
                      <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        {labelText}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ColumnSelection);