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
  const { getText, language } = useAppContext();
  
  // Ensure we have valid values for parameters
  const count = pumpData?.length || 0;
  const timestamp = dataTimestamp || new Date().toLocaleString();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center">
        <span className="text-sm text-blue-700">
          {/* Pass parameters directly to getText */}
          {getText("Data loaded", language, {
            n_records: count,
            timestamp: timestamp
          })}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={onRefresh}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{getText("Refresh Data", language)}</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{getText("Reset Inputs", language)}</span>
          </button>
        </div>
      </div>
      {loading && (
        <div className="mt-2">
          <div className="animate-pulse flex space-x-2 items-center">
            <div className="rounded-full bg-blue-200 h-3 w-3"></div>
            <div className="text-sm text-blue-700">Loading data...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(DataStatus);