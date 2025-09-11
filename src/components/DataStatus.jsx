import React from 'react';
import { RefreshCw, RotateCcw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const DataStatus = ({ 
  loading, 
  pumpData = [], 
  dataTimestamp,
  onRefresh,
  onReset,
}) => {
  // Get getText and language directly from context
  const { getText, language, darkMode } = useAppContext();
  
  // Ensure we have valid values for parameters
  const count = pumpData?.length || 0;
  const timestamp = dataTimestamp || new Date().toLocaleString();

  return (
    <div className={`rounded-lg p-4 mb-6 border ${darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
      <div className="flex justify-between items-center">
        <span className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
          {/* Pass parameters directly to getText */}
          {getText("Data loaded", language, {
            n_records: count,
            timestamp: timestamp
          })}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={onRefresh}
            className={`flex items-center space-x-1 px-3 py-1 rounded transition-colors ${
              darkMode 
                ? 'bg-blue-800 text-blue-100 hover:bg-blue-700' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>{getText("Refresh Data", language)}</span>
          </button>
          <button
            onClick={onReset}
            className={`flex items-center space-x-1 px-3 py-1 rounded transition-colors ${
              darkMode 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{getText("Reset Inputs", language)}</span>
          </button>
        </div>
      </div>
      {loading && (
        <div className="mt-2">
          <div className="animate-pulse flex space-x-2 items-center">
            <div className={`rounded-full h-3 w-3 ${darkMode ? 'bg-blue-600' : 'bg-blue-200'}`}></div>
            <div className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>Loading data...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(DataStatus);