import React, { useRef, useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';

const ResultsTable = ({ 
  pumpData = [], 
  paginatedData = [],  // Add this prop
  isLoading = false,
  selectedPumps = [],
  togglePumpSelection,
  selectAllPumpsOnPage,
  deselectAllPumpsOnPage,
  essentialColumns = [],
  selectedColumns = [],
  flowUnit = "L/min",
  headUnit = "m",
  convertFlowFromLpm,
  convertHeadFromM
}) => {
  const { getText, language } = useAppContext();
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  
  // Add sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });
  
  // Define column widths (in px)
  const columnWidths = {
    select: 70,       // Width for the checkbox column
    standard: 160,    // Width for most columns (Model, Model No, etc)
    numeric: 140,     // Width for numeric columns (Q Rated, Head Rated) - increased to fit unit
    total: 0          // Will be calculated below
  };
  
  // Calculate total width based on visible columns
  columnWidths.total = 
    columnWidths.select + 
    (essentialColumns.length * columnWidths.standard) +
    (selectedColumns.includes("Q Rated/LPM") ? columnWidths.numeric : 0) +
    (selectedColumns.includes("Head Rated/M") ? columnWidths.numeric : 0) + 
    (selectedColumns.filter(col => col !== "Q Rated/LPM" && col !== "Head Rated/M").length * columnWidths.standard);
  
  // Measure container width on mount and resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    // Initial measurement
    updateWidth();
    
    // Add resize handler
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">{getText("Matching Pumps", language)}</h3>
        <div className="text-center py-8">
          <div className="animate-pulse flex flex-col items-center justify-center">
            <div className="rounded-full bg-blue-200 h-8 w-8 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2.5"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // No results state
  if (!pumpData || pumpData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">{getText("Matching Pumps", language)}</h3>
        <div className="text-center py-8">
          <p className="text-amber-600 font-medium text-lg mb-2">
            {getText("No Matches", language)}
          </p>
          <p className="text-gray-600">
            {getText("Select Warning", language)}
          </p>
        </div>
      </div>
    );
  }

  // Get proper translated unit text for display
  const flowUnitText = getText(flowUnit, language);
  const headUnitText = getText(headUnit, language);

  // Start with essential columns and checkbox
  let allColumns = [
    // Special column for checkboxes
    { id: 'select', label: getText('Select', language), width: '70px', special: true, sortable: false },
    // Essential columns (dynamic from props)
    ...essentialColumns.map(col => ({ 
      id: col, 
      label: getText(col, language), 
      width: '160px',
      sortable: true,
      render: (pump) => {
        // Translate category values
        if (col === 'Category' && pump[col]) return getText(pump[col], language);
        // Translate phase if you have translations
        if (col === 'Phase' && pump[col]) return getText(pump[col], language);
        return pump[col];
      }
    }))
  ];
  
  // Add Q Rated column only if selected
  if (selectedColumns.includes("Q Rated/LPM")) {
    allColumns.push({ 
      id: 'qRated', 
      label: getText("Q Rated", language, { unit: flowUnitText }),
      width: '140px',
      sortable: true,
      sortKey: "Q Rated/LPM", // Used for sorting actual numeric values
      render: (pump) => `${Math.round(convertFlowFromLpm(pump["Q Rated/LPM"], flowUnit) * 100) / 100} ${flowUnitText}`
    });
  }
  
  // Add Head Rated column only if selected
  if (selectedColumns.includes("Head Rated/M")) {
    allColumns.push({ 
      id: 'headRated', 
      label: getText("Head Rated", language, { unit: headUnitText }),
      width: '140px',
      sortable: true,
      sortKey: "Head Rated/M", // Used for sorting actual numeric values
      render: (pump) => `${Math.round(convertHeadFromM(pump["Head Rated/M"], headUnit) * 100) / 100} ${headUnitText}`
    });
  }
  
  // Add other selected columns
  const otherColumns = selectedColumns.filter(
    col => col !== "Q Rated/LPM" && col !== "Head Rated/M"
  ).map(col => ({ 
    id: col, 
    label: getText(col, language), 
    width: '160px',
    sortable: col !== "Product Link", // Don't make links sortable
    sortKey: col,
    render: (pump) => {
      if (col === 'Category' && pump[col]) return getText(pump[col], language);
      if (col === 'Phase' && pump[col]) return getText(pump[col], language);
      if (col === "Product Link" && pump[col]) {
        return (
          <a 
            href={pump[col]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {getText("View Product", language)}
          </a>
        );
      }
      return pump[col] || "-";
    }
  }));
  
  // Add other columns to the list
  allColumns = [...allColumns, ...otherColumns];
  
  // Request a sort
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get sorted items
  const getSortedItems = (items) => {
    if (!sortConfig.key) return items;
    
    return [...items].sort((a, b) => {
      // Find the column definition for the sort key
      const column = allColumns.find(col => col.id === sortConfig.key || col.sortKey === sortConfig.key);
      
      // Get the actual sort key to use (may be different from column id)
      const sortKey = column?.sortKey || sortConfig.key;
      
      // Get values to compare
      let aValue = a[sortKey];
      let bValue = b[sortKey];
      
      // Convert to numbers if they are numeric
      if (!isNaN(parseFloat(aValue)) && !isNaN(parseFloat(bValue))) {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        // For string comparisons, use localeCompare
        return sortConfig.direction === 'ascending' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // Default numeric comparison
      if (sortConfig.direction === 'ascending') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };
  
  // Get the sorted data
  const sortedData = getSortedItems(paginatedData);
  
  // Helper to get sort direction icon
  const getSortDirectionIcon = (columnId) => {
    if (sortConfig.key !== columnId) return null;
    
    return sortConfig.direction === 'ascending' 
      ? '↑' 
      : '↓';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">{getText("Matching Pumps", language)}</h3>
      <p className="text-sm text-gray-600 mb-4">
        {getText("Found Pumps", language, { count: pumpData.length })}
      </p>

      {/* Select/Deselect All + Export CSV Buttons */}
      <div className="flex space-x-2 mb-2">
        <button
          onClick={selectAllPumpsOnPage}
          className="px-3 py-1 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100"
        >
          {getText("Select All", language)}
        </button>
        <button
          onClick={deselectAllPumpsOnPage}
          className="px-3 py-1 text-sm bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100"
        >
          {getText("Deselect All", language)}
        </button>
        <button
          onClick={() => {
            // Get columns to export (excluding 'select' special column)
            const exportColumns = allColumns.filter(col => col.id !== 'select');
            // Get selected pump data
            const selectedRows = pumpData.filter(pump => selectedPumps.includes(pump["Model No."]));
            // Build CSV header (translated)
            const header = exportColumns.map(col => col.label).join(",");
            // Build CSV rows
            const rows = selectedRows.map(pump =>
              exportColumns.map(col => {
                if (col.id === "Product Link") {
                  return `"${String(pump[col.id] ?? '').replace(/"/g, '""')}"`;
                }
                // Use render if available, else raw value
                if (col.render) {
                  // Remove units from rendered value for CSV
                  return `"${String(col.render(pump)).replace(/\s*\([^)]*\)/g, '').replace(/"/g, '""')}"`;
                }
                return `"${String(pump[col.id] ?? '').replace(/"/g, '""')}"`;
              }).join(",")
            );
            const csvContent = [header, ...rows].join("\r\n");
            // Add UTF-8 BOM for Excel compatibility with Chinese
            const bom = '\uFEFF';
            const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'selected_pumps.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="px-3 py-1 text-sm bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100"
        >
          {getText("Export CSV", language)}
        </button>
      </div>

      {/* Single scrollable container */}
      <div className="overflow-x-auto border rounded-md" ref={containerRef}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {allColumns.map(column => (
                <th 
                  key={column.id}
                  scope="col"
                  className={`py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable ? requestSort(column.id) : null}
                >
                  <div className="flex items-center">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <span className="ml-1 text-gray-400">
                        {getSortDirectionIcon(column.id) || ''}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((pump, index) => (
              <tr 
                key={`${pump["Model No."]}-${index}`} 
                className="hover:bg-gray-50"
              >
                {allColumns.map(column => (
                  <td 
                    key={`${pump["Model No."]}-${column.id}`}
                    className="py-4 px-4 whitespace-nowrap" 
                    style={{ width: column.width }}
                  >
                    {column.special ? (
                      <input
                        type="checkbox"
                        checked={selectedPumps.includes(pump["Model No."])}
                        onChange={() => togglePumpSelection(pump["Model No."])}
                        className="rounded border-gray-300"
                      />
                    ) : column.render(pump)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500">
          {getText("Showing Results", language, { count: pumpData.length })}
        </p>
        <p className="text-sm text-gray-500">
          {getText("Select Pumps", language)}
        </p>
      </div>
    </div>
  );
};

export default ResultsTable;