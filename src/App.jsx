import React, { useEffect, useMemo, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Search, HelpCircle } from 'lucide-react';
import { AppProvider, useAppContext } from './context/AppContext';
import Header from './components/Header';
import DataStatus from './components/DataStatus';
import supabase from './lib/supabase';
import ColumnSelection from './components/ColumnSelection';
import SimplePagination from './components/SimplePagination';
import Instruction from './components/Instruction';

// Lazy load components that aren't needed immediately
const PumpCurves = lazy(() => import('./components/PumpCurves'));
const ResultsTable = lazy(() => import('./components/ResultsTable'));

// Utility function to parse horsepower values (handles fractions and mixed numbers)
const parseHorsePower = (hp) => {
  if (typeof hp === 'number') {
    return hp;
  }
  
  const hpStr = String(hp).trim();
  
  // Handle mixed number format like "1 1/4"
  if (hpStr.includes(' ') && hpStr.includes('/')) {
    const parts = hpStr.split(' ');
    const wholeNumber = parseFloat(parts[0]);
    const fractionParts = parts[1].split('/');
    if (fractionParts.length === 2) {
      const numerator = parseFloat(fractionParts[0]);
      const denominator = parseFloat(fractionParts[1]);
      if (!isNaN(wholeNumber) && !isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return wholeNumber + (numerator / denominator);
      }
    }
  } 
  // Handle simple fractions like "1/2"
  else if (hpStr.includes('/')) {
    const fractionParts = hpStr.split('/');
    if (fractionParts.length === 2) {
      const numerator = parseFloat(fractionParts[0]);
      const denominator = parseFloat(fractionParts[1]);
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return numerator / denominator;
      }
    }
  }
  // Regular number
  else {
    return parseFloat(hpStr);
  }
  
  return NaN; // Return NaN if parsing failed
};

// Convert horsepower to kilowatt (1 HP = 0.745699872 kW)
const horsePowerToKw = (hp) => {
  const hpNum = parseHorsePower(hp);
  if (!isNaN(hpNum)) {
    return {
      kw: (hpNum * 0.745699872).toFixed(2),
      w: Math.round(hpNum * 0.745699872 * 1000)
    };
  }
  return { kw: null, w: null };
};


const queryClient = new QueryClient();

// Utility functions
const convertFlowFromLpm = (value, toUnit) => {
  switch(toUnit) {
    case "L/min": return value;
    case "L/sec": return value / 60;
    case "m³/hr": return value * 60 / 1000;
    case "m³/min": return value / 1000;
    case "US gpm": return value / 3.785;
    default: return value;
  }
};

const convertFlowToLpm = (value, fromUnit) => {
  switch(fromUnit) {
    case "L/min": return value;
    case "L/sec": return value * 60;
    case "m³/hr": return value * 1000 / 60;
    case "m³/min": return value * 1000;
    case "US gpm": return value * 3.785;
    default: return value;
  }
};

const convertHeadFromM = (value, toUnit) => {
  switch(toUnit) {
    case "m": return value;
    case "ft": return value * 3.28084;
    default: return value;
  }
};

const convertHeadToM = (value, fromUnit) => {
  switch(fromUnit) {
    case "m": return value;
    case "ft": return value * 0.3048;
    default: return value;
  }
};


const AppContent = () => {
  const { language, setLanguage, getText, darkMode, setDarkMode } = useAppContext();

  // State management
  const [pumpData, setPumpData] = React.useState([]);
  const [curveData, setCurveData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [dataTimestamp, setDataTimestamp] = React.useState(null);
  const [hasSearched, setHasSearched] = React.useState(false);

  // Filter states
 const [selectedCategory, setSelectedCategory] = React.useState("");
  const [hpFilter, setHpFilter] = React.useState("");
  const [modelFilter, setModelFilter] = React.useState("");
  const [outletSizeValue, setOutletSizeValue] = React.useState("");
  const [outletSizeUnit, setOutletSizeUnit] = React.useState("mm"); // "mm" or "inch"

  const [frequency, setFrequency] = React.useState("");
  const [phase, setPhase] = React.useState("");

  // Application inputs
  const [floors, setFloors] = React.useState(0);
  const [faucets, setFaucets] = React.useState(0);
  const [pondLength, setPondLength] = React.useState(0);
  const [pondWidth, setPondWidth] = React.useState(0);
  const [pondHeight, setPondHeight] = React.useState(0);
  const [drainTime, setDrainTime] = React.useState(0.01);
  const [undergroundDepth, setUndergroundDepth] = React.useState(0);
  const [particleSize, setParticleSize] = React.useState(0);

  // Manual inputs
  const [flowUnit, setFlowUnit] = React.useState("L/min");
  const [flowValue, setFlowValue] = React.useState(0);
  const [headUnit, setHeadUnit] = React.useState("m");
  const [headValue, setHeadValue] = React.useState(0);
  const [maxFlowValue, setMaxFlowValue] = React.useState(0);
  const [maxHeadValue, setMaxHeadValue] = React.useState(0);
  const [maxFlowTolerance, setMaxFlowTolerance] = React.useState(10);  // Default 10% tolerance
  const [maxHeadTolerance, setMaxHeadTolerance] = React.useState(10);  // Default 10% tolerance

  // Tolerance settings (percentage)
  const [flowTolerance, setFlowTolerance] = React.useState(20); // Default 10% tolerance for flow
  const [headTolerance, setHeadTolerance] = React.useState(20); // Default 10% tolerance for head
  const [outletTolerance, setOutletTolerance] = React.useState(1); // Default 10% tolerance for outlet size

  // Results
  const [selectedPumps, setSelectedPumps] = React.useState([]);
  const [resultPercent, setResultPercent] = React.useState(100);
  const [selectedColumns, setSelectedColumns] = React.useState([
    "Q Rated/LPM", 
    "Head Rated/M",
    "HP",
    "Power(KW)",
    "Outlet", // Generic outlet column that will display based on selected unit
    "Frequency_Hz",
    "Phase",
    "Category",
    "Product Link"
    // Add more columns as needed
  ]);
  const [showColumnSelection, setShowColumnSelection] = React.useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  
  // Instructions modal state
  const [showInstructions, setShowInstructions] = React.useState(false);

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return pumpData.slice(startIndex, startIndex + rowsPerPage);
  }, [pumpData, currentPage, rowsPerPage]);

  // All available values for filters
  const [allCategories, setAllCategories] = React.useState([]);
  const [allFrequencies, setAllFrequencies] = React.useState([]);
  const [allPhases, setAllPhases] = React.useState([]);
  const [allHorsePowers, setAllHorsePowers] = React.useState([]);

  // Constants for frequency and phase values
  const FREQUENCY_OPTIONS = ["50", "60"];
  const PHASE_OPTIONS = ["1", "3"];

  // --- FETCH ALL MATCHING DATA FROM SUPABASE (NO PAGINATION, WITH BATCHING) ---
  const fetchAllRows = async (table, filters = {}) => {
    const batchSize = 1000;
    let allRows = [];
    let from = 0;
    let to = batchSize - 1;
    let keepGoing = true;

    while (keepGoing) {
      let query = supabase.from(table).select('*').range(from, to);
      // Apply filters
      Object.entries(filters).forEach(([col, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query = query.eq(col, val);
        }
      });
      const { data, error } = await query;
      if (error) {
        console.error(`Fetch error for ${table}:`, error);
        return { error, data: [] };
      }
      allRows = allRows.concat(data || []);
      if (!data || data.length < batchSize) {
        keepGoing = false;
      } else {
        from += batchSize;
        to += batchSize;
      }
    }
    return { data: allRows };
  };

const fetchData = async () => {
  setLoading(true);
  try {
    // Base select always fetches categories for display
    let base = supabase
      .from("pump_selection_data")
      .select(`
        *,
        product_categories (
          category_id,
          categories ( name )
        )
      `);

    // When a category is picked, use an inner join + equality on that category id
    if (selectedCategory) {
      base = supabase
        .from("pump_selection_data")
        .select(`
          *,
          product_categories!inner (
            category_id,
            categories ( name )
          )
        `)
        .eq("product_categories.category_id", selectedCategory);
    }

    // Frequency & Phase filters
    if (frequency && frequency !== getText("Show All Frequency", language)) {
      base = base.eq("Frequency_Hz", Number(frequency));
    }
    if (phase && phase !== getText("Show All Phase", language)) {
      const phaseNum = Number(phase);
      if (!Number.isNaN(phaseNum)) base = base.eq("Phase", phaseNum);
    }

    const { data: rawRows, error: pumpError } = await base;
    if (pumpError) throw pumpError;

    // De-dupe by product id (just in case)
    const byId = new Map();
    for (const row of rawRows || []) {
      const id = row.id;
      const catNames = (row.product_categories || [])
        .map(pc => pc?.categories?.name)
        .filter(Boolean);

      if (!byId.has(id)) {
        byId.set(id, {
          ...row,
          Category: Array.from(new Set(catNames)).join(", "),
          _categoryNames: Array.from(new Set(catNames)),
        });
      } else {
        const existing = byId.get(id);
        const merged = Array.from(new Set([...(existing._categoryNames || []), ...catNames]));
        existing._categoryNames = merged;
        existing.Category = merged.join(", ");
      }
    }

    let pumpRows = Array.from(byId.values());

    // Client-side HP filter
    if (hpFilter && hpFilter.trim() !== "") {
      pumpRows = pumpRows.filter(p => {
        const pumpHP = p["HP"];
        return String(pumpHP) === String(hpFilter);
      });
    }

    // Client-side model filter (prefix match)
    if (modelFilter && modelFilter.trim() !== "") {
      pumpRows = pumpRows.filter(p => {
        const modelNo = p["Model No."];
        return modelNo && modelNo.toLowerCase().startsWith(modelFilter.toLowerCase());
      });
    }
    
    // Client-side outlet size filter with tolerance
    if (outletSizeValue && outletSizeValue.trim() !== "") {
      const outletSize = parseFloat(outletSizeValue);
      if (!isNaN(outletSize)) {
        const outletMin = outletSize * (1 - outletTolerance / 100);
        const outletMax = outletSize * (1 + outletTolerance / 100);
        
        pumpRows = pumpRows.filter(p => {
          let pumpOutletSize;
          
          if (outletSizeUnit === "mm") {
            // Filter by mm directly with tolerance
            pumpOutletSize = p["Outlet (mm)"];
            return pumpOutletSize !== undefined && pumpOutletSize !== null && 
                  pumpOutletSize >= outletMin && pumpOutletSize <= outletMax;
          } else {
            // Filter by inches, but check both fields
            // Some pumps might store outlet size in inches directly, others in mm
            pumpOutletSize = p["Outlet (inch)"];
            
            if (pumpOutletSize !== undefined && pumpOutletSize !== null) {
              return pumpOutletSize >= outletMin && pumpOutletSize <= outletMax;
            }
            
            // If not found in inches, check mm and convert
            pumpOutletSize = p["Outlet (mm)"];
            if (pumpOutletSize !== undefined && pumpOutletSize !== null) {
              // Convert mm to inches (1 inch = 25.4 mm)
              const inchSize = pumpOutletSize / 25.4;
              // Compare with tolerance range
              return inchSize >= outletMin && inchSize <= outletMax;
            }
            
            return false;
          }
        });
      }
    }

    // Client-side flow/head filters with tolerance
    const requiredFlowLpm = convertFlowToLpm(flowValue, flowUnit);
    const requiredHeadM = convertHeadToM(headValue, headUnit);

    if (requiredFlowLpm > 0) {
      const flowMin = requiredFlowLpm * (1 - flowTolerance / 100);
      const flowMax = requiredFlowLpm * (1 + flowTolerance / 100);
      pumpRows = pumpRows.filter(p => {
        const pumpFlow = p["Q Rated/LPM"];
        return pumpFlow >= flowMin && pumpFlow <= flowMax;
      });
    }
    if (requiredHeadM > 0) {
      const headMin = requiredHeadM * (1 - headTolerance / 100);
      const headMax = requiredHeadM * (1 + headTolerance / 100);
      pumpRows = pumpRows.filter(p => {
        const pumpHead = p["Head Rated/M"];
        return pumpHead >= headMin && pumpHead <= headMax;
      });
    }
    
    // Filter by max flow value (if set)
    if (maxFlowValue > 0) {
      const maxFlowLpm = convertFlowToLpm(maxFlowValue, flowUnit);
      // Calculate tolerance range
      const maxFlowMin = maxFlowLpm * (1 - maxFlowTolerance / 100);
      const maxFlowMax = maxFlowLpm * (1 + maxFlowTolerance / 100);
      
      // Debug: Log ALL available flow fields in first few pumps
      if (pumpRows && pumpRows.length > 0) {
        console.log("Max Flow Filter Debug:");
        console.log("- Input value:", maxFlowValue, flowUnit, "->", maxFlowLpm, "LPM");
        console.log("- Tolerance range:", maxFlowMin, "-", maxFlowMax, "LPM");
        console.log("- Available data keys:", Object.keys(pumpRows[0]).filter(k => k.toLowerCase().includes("flow")));
        
        // Log the first 3 pumps to see their Max Flow values
        for (let i = 0; i < Math.min(3, pumpRows.length); i++) {
          const pump = pumpRows[i];
          console.log(`Pump ${i+1} (${pump["Model No."] || "Unknown"}):`, {
            "Max Flow (LPM)": pump["Max Flow (LPM)"],
            "Flow Type": typeof pump["Max Flow (LPM)"],
            // Check for other possible column names
            "Q Max": pump["Q Max"] || "N/A",
            "MaxFlow": pump["MaxFlow"] || "N/A",
            "Max_Flow": pump["Max_Flow"] || "N/A"
          });
        }
      }
      
      // Try to handle both number and string values
      pumpRows = pumpRows.filter(p => {
        const pumpMaxFlow = p["Max Flow (LPM)"];
        // If it's a string, convert to number
        const numericValue = typeof pumpMaxFlow === 'string' ? parseFloat(pumpMaxFlow) : pumpMaxFlow;
        // Log any pumps that match the tolerance range
        if (numericValue >= maxFlowMin && numericValue <= maxFlowMax) {
          console.log("Found match for Max Flow:", p["Model No."], numericValue);
        }
        return numericValue !== undefined && numericValue !== null && !isNaN(numericValue) && 
               numericValue >= maxFlowMin && numericValue <= maxFlowMax;
      });
    }
    
    // Filter by max head value (if set)
    if (maxHeadValue > 0) {
      const maxHeadM = convertHeadToM(maxHeadValue, headUnit);
      // Calculate tolerance range
      const maxHeadMin = maxHeadM * (1 - maxHeadTolerance / 100);
      const maxHeadMax = maxHeadM * (1 + maxHeadTolerance / 100);
      
      // Debug: Log ALL available head fields in first few pumps
      if (pumpRows && pumpRows.length > 0) {
        console.log("Max Head Filter Debug:");
        console.log("- Input value:", maxHeadValue, headUnit, "->", maxHeadM, "M");
        console.log("- Tolerance range:", maxHeadMin, "-", maxHeadMax, "M");
        console.log("- Available data keys:", Object.keys(pumpRows[0]).filter(k => k.toLowerCase().includes("head")));
        
        // Log the first 3 pumps to see their Max Head values
        for (let i = 0; i < Math.min(3, pumpRows.length); i++) {
          const pump = pumpRows[i];
          console.log(`Pump ${i+1} (${pump["Model No."] || "Unknown"}):`, {
            "Max Head(M)": pump["Max Head(M)"],
            "Max Head (M)": pump["Max Head (M)"],
            "Head Type": typeof pump["Max Head(M)"] || typeof pump["Max Head (M)"],
            // Check for other possible column names
            "H Max": pump["H Max"] || "N/A",
            "MaxHead": pump["MaxHead"] || "N/A",
            "Max_Head": pump["Max_Head"] || "N/A"
          });
        }
      }
      
      // Try to handle both column name variations and string/number conversion
      pumpRows = pumpRows.filter(p => {
        // Check both column name formats (with and without space)
        const pumpMaxHead = p["Max Head(M)"] || p["Max Head (M)"];
        // If it's a string, convert to number
        const numericValue = typeof pumpMaxHead === 'string' ? parseFloat(pumpMaxHead) : pumpMaxHead;
        // Log any pumps that match the tolerance range
        if (numericValue >= maxHeadMin && numericValue <= maxHeadMax) {
          console.log("Found match for Max Head:", p["Model No."], numericValue);
        }
        return numericValue !== undefined && numericValue !== null && !isNaN(numericValue) && 
               numericValue >= maxHeadMin && numericValue <= maxHeadMax;
      });
    }

    // Log filtering results
    console.log("Filtering results:", {
      "Total pumps after basic filters": pumpRows.length,
      "Max Flow filter active": maxFlowValue > 0,
      "Max Head filter active": maxHeadValue > 0,
      "Flow value filter active": requiredFlowLpm > 0,
      "Head value filter active": requiredHeadM > 0
    });

    // Top X% by closeness
    let filtered = pumpRows;
    const rf = requiredFlowLpm || 1;
    const rh = requiredHeadM || 1;
    const percent = resultPercent || 100;

    if (percent < 100 && filtered.length > 0) {
      filtered = filtered
        .map(p => ({
          ...p,
          _score:
            Math.abs((p["Q Rated/LPM"] - requiredFlowLpm) / rf) +
            Math.abs((p["Head Rated/M"] - requiredHeadM) / rh),
        }))
        .sort((a, b) => a._score - b._score)
        .slice(0, Math.ceil(filtered.length * percent / 100));
    }

    // Curves
    const { data: curveRows, error: curveError } = await supabase
      .from("pump_curve_data")
      .select("*");
    if (curveError) throw curveError;

    setPumpData(filtered);
    setCurveData(curveRows || []);
    setDataTimestamp(new Date().toLocaleString());
  } catch (err) {
    console.error(err);
    setPumpData([]);
    setCurveData([]);
  } finally {
    setLoading(false);
  }
};



  // Fetch all unique categories, frequencies, phases, and horse powers for filter options
useEffect(() => {
  (async () => {
    // Fetch categories
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');
    if (!error) setAllCategories(data || []);
    
    // Set frequency and phase options from constants
    setAllFrequencies(FREQUENCY_OPTIONS);
    setAllPhases(PHASE_OPTIONS);
    
    // Fetch unique HP values
    const { data: hpData, error: hpError } = await supabase
      .from('pump_selection_data')
      .select('HP')
      .not('HP', 'is', null);
    
    if (!hpError && hpData) {
      // Get unique HP values and sort them numerically (from small to large)
      const uniqueHPs = [...new Set(hpData.map(item => item.HP))]
        .filter(hp => hp !== null && hp !== undefined && hp !== '')
        .map(hp => {
          // Use the utility function to parse horsepower values
          const numericValue = parseHorsePower(hp);
          
          return { original: hp, numeric: numericValue };
        })
        .sort((a, b) => a.numeric - b.numeric)  // Sort by numeric value (ascending)
        .map(item => item.original);  // Convert back to original format
      setAllHorsePowers(uniqueHPs);
    }
  })();
}, []);


  // Calculated values
  const pondVolume = pondLength * pondWidth * pondHeight * 1000;
  const drainTimeMin = drainTime * 60;
  const pondLpm = pondVolume / drainTimeMin || 0;
// Detect Booster by name → id match
const isBooster = (() => {
  const booster = allCategories.find(c => c.name === 'Booster');
  return booster ? String(booster.id) === String(selectedCategory) : false;
})();


  const autoFlow = isBooster ? Math.max(faucets * 15, pondLpm) : pondLpm;
const autoTdh  = isBooster ? Math.max(floors * 3.5, pondHeight)
                           : (undergroundDepth > 0 ? undergroundDepth : pondHeight);


  // Available columns for selection
  const essentialColumns = ["Model No."];
  const allColumns = Object.keys(pumpData[0] || {}).filter(col => col !== "DB ID" && col !== "id" && col !== "product_categories" && col !== "_categoryNames");

  // Use useMemo for optionalColumns to prevent recalculation on every render
  const optionalColumns = useMemo(() => {
    return allColumns.filter(col => !essentialColumns.includes(col));
  }, [allColumns, essentialColumns]);

  // Auto-fill flow and head values
  useEffect(() => {
    if (autoFlow > 0) {
      setFlowValue(convertFlowFromLpm(autoFlow, flowUnit));
    }
    // eslint-disable-next-line
  }, [autoFlow, flowUnit]);
  useEffect(() => {
    if (autoTdh > 0) {
      setHeadValue(convertHeadFromM(autoTdh, headUnit));
    }
    // eslint-disable-next-line
  }, [autoTdh, headUnit]);

  // Reset to first page when filters change
useEffect(() => {
  setCurrentPage(1);
}, [selectedCategory, hpFilter, modelFilter, outletSizeValue, outletSizeUnit, frequency, phase, 
    flowValue, headValue, flowTolerance, headTolerance,
    maxFlowValue, maxHeadValue, maxFlowTolerance, maxHeadTolerance]);

// Automatically select Max Flow and Max Head columns when user inputs values in the Max Limits section
useEffect(() => {
  if (maxFlowValue > 0 || maxHeadValue > 0) {
    // Create a new array with all current selections
    const updatedColumns = [...selectedColumns];
    
    // Add Max Flow column if not already included and user has entered a value
    if (maxFlowValue > 0 && !updatedColumns.includes("Max Flow (LPM)")) {
      updatedColumns.push("Max Flow (LPM)");
      console.log("Auto-selected Max Flow column due to user input in Max Limits section");
    }
    
    // Add Max Head column if not already included and user has entered a value
    const maxHeadColumnName = "Max Head(M)";
    if (maxHeadValue > 0 && !updatedColumns.includes(maxHeadColumnName)) {
      updatedColumns.push(maxHeadColumnName);
      console.log("Auto-selected Max Head column due to user input in Max Limits section");
    }
    
    // Only update state if we've added new columns
    if (updatedColumns.length > selectedColumns.length) {
      setSelectedColumns(updatedColumns);
    }
  }
}, [maxFlowValue, maxHeadValue, selectedColumns]);



  // Reset function
  const resetInputs = () => {
    setSelectedCategory("");
    setHpFilter("");
    setModelFilter("");
    setOutletSizeValue("");
    setOutletSizeUnit("mm");
    setFrequency("");
    setPhase("");
    setFloors(0);
    setFaucets(0);
    setPondLength(0);
    setPondWidth(0);
    setPondHeight(0);
    setDrainTime(0.01);
    setUndergroundDepth(0);
    setParticleSize(0);
    setFlowValue(0);
    setHeadValue(0);
    setMaxFlowValue(0);
    setMaxHeadValue(0);
    setMaxFlowTolerance(10);
    setMaxHeadTolerance(10);
    setFlowTolerance(10);
    setHeadTolerance(10);
    setOutletTolerance(10);
    setSelectedPumps([]);
    setHasSearched(false);
    setPumpData([]);
    setSelectedColumns([
      "Q Rated/LPM", 
      "Head Rated/M",
      "HP",
      "Power(KW)",
      "Outlet", // Generic outlet column that will display based on selected unit
      "Frequency_Hz",
      "Phase",
      "Category",
      "Product Link"
      // Add more columns as needed
    ]);
  };

  // Search function
  const handleSearch = () => {
    setSelectedPumps([]);
    setHasSearched(true);
    fetchData();
  };


  // Toggle pump selection
  const togglePumpSelection = (modelNo) => {
    setSelectedPumps(prev =>
      prev.includes(modelNo)
        ? prev.filter(id => id !== modelNo)
        : [...prev, modelNo]
    );
  };

  // Generate curve chart data
  const generateCurveData = (modelNo) => {
    const pump = curveData.find(p => p["Model No."] === modelNo);
    if (!pump) return [];
    const headColumns = Object.keys(pump).filter(col => col.endsWith('M') && col !== 'Max Head(M)');
    const data = [];
    headColumns.forEach(col => {
      const headValue = parseFloat(col.replace('M', ''));
      const flowValue = pump[col];
      if (flowValue && flowValue > 0) {
        data.push({
          flow: convertFlowFromLpm(flowValue, flowUnit),
          head: convertHeadFromM(headValue, headUnit),
          model: modelNo
        });
      }
    });
    return data.sort((a, b) => a.flow - b.flow);
  };

  // Prepare comparison chart data
  const comparisonData = useMemo(() => {
    if (selectedPumps.length === 0) return [];
    const allData = [];
    selectedPumps.forEach(modelNo => {
      const pumpData = generateCurveData(modelNo);
      allData.push(...pumpData);
    });
    return allData;
  }, [selectedPumps, flowUnit, headUnit]);

  // Operating point for charts
  const operatingPoint = {
    flow: convertFlowFromLpm(convertFlowToLpm(flowValue, flowUnit), flowUnit),
    head: convertHeadFromM(convertHeadToM(headValue, headUnit), headUnit)
  };

  // Add this near your other state variables (around line 370-380)
  const [cachedAllColumns, setCachedAllColumns] = React.useState([]);

  // Add this effect near your other useEffect hooks (around line 520-540)
  // Only calculate allColumns once after data is loaded
  useEffect(() => {
    if (pumpData.length > 0 && cachedAllColumns.length === 0) {
      // Get all columns from the pump data
      let columns = Object.keys(pumpData[0] || {}).filter(col => 
        col !== "DB ID" && 
        col !== "id" && 
        col !== "product_categories" && 
        col !== "_categoryNames"
      );
      
      // Replace "Outlet (mm)" and "Outlet (inch)" with a generic "Outlet" column
      // to match what we use in selectedColumns
      const outletMmIndex = columns.indexOf("Outlet (mm)");
      const outletInchIndex = columns.indexOf("Outlet (inch)");
      
      if (outletMmIndex !== -1 || outletInchIndex !== -1) {
        // Remove both outlet columns
        columns = columns.filter(col => col !== "Outlet (mm)" && col !== "Outlet (inch)");
        
        // Add the generic outlet column if it doesn't already exist
        if (!columns.includes("Outlet")) {
          columns.push("Outlet");
        }
      }
      
      setCachedAllColumns(columns);
    }
  }, [pumpData, cachedAllColumns.length]);

  // Add these functions in App.jsx where you have other pump selection functions
  const selectAllPumpsOnPage = () => {
    // Get all model numbers from the current page
    const modelNos = paginatedData.map(pump => pump["Model No."]);
    
    // Add them to the selected pumps (avoiding duplicates)
    setSelectedPumps(prev => {
      const newSelection = [...prev];
      modelNos.forEach(modelNo => {
        if (!newSelection.includes(modelNo)) {
          newSelection.push(modelNo);
        }
      });
      return newSelection;
    });
  };

  const deselectAllPumpsOnPage = () => {
    // Get all model numbers from the current page
    const modelNos = paginatedData.map(pump => pump["Model No."]);
    
    // Remove them from the selected pumps
    setSelectedPumps(prev => 
      prev.filter(modelNo => !modelNos.includes(modelNo))
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border-b transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <a href="https://www.hungpump.com/" tabIndex={0} aria-label="Go to homepage">
                  <img 
                    src={`/images/logo.gif?v=${new Date().getTime()}`}
                    alt="Hung Pump Logo" 
                    className="h-12 md:h-16 object-contain" 
                  />
                </a>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-blue-600' : 'text-blue-600'}`}> 
                  {getText("Hung Pump", language)}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                {/* Dark mode toggle */}
                <button
                  onClick={() => setDarkMode(dm => !dm)}
                  className={`px-3 py-2 rounded-md font-medium border ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300'} transition-colors`}
                  aria-label={darkMode ? getText('Switch to light mode', language) : getText('Switch to dark mode', language)}
                >
                  {darkMode ? getText('Light On', language) : getText('Light Off', language)}
                </button>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'border-gray-300'}`}
                >
                  <option value="English">English</option>
                  <option value="繁體中文">繁體中文</option>
                </select>
                {/* Instructions button */}
                <button
                  onClick={() => setShowInstructions(true)}
                  className={`flex items-center px-3 py-2 rounded-md font-medium border ${darkMode ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700' : 'bg-blue-500 text-white border-blue-400 hover:bg-blue-600'} transition-colors`}
                  aria-label="Show Instructions"
                >
                  <HelpCircle className="w-5 h-5 mr-2" />
                  {getText("Instructions", language) || "Instructions"}
                </button>
              </div>
            </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-blue-200' : ''}`}>{getText("Pump Selection Tool", language)}</h2>
        
        {/* Data Status */}
        <DataStatus 
          loading={loading}
          pumpData={pumpData}
          dataTimestamp={dataTimestamp}
          onRefresh={() => window.location.reload()}
          onReset={resetInputs}
          language={language}
        />

        {/* Step 1: Basic Criteria */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-lg shadow-sm border p-6 mb-6 transition-colors`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-blue-200' : ''}`}>{getText("Step 1", language)}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
<div>
  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
    {getText("Category", language)}
  </label>
  <select
    value={selectedCategory}
    onChange={(e) => setSelectedCategory(e.target.value)}
    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'border-gray-300'}`}
  >
    <option value="">{getText("All Categories", language)}</option>
    {allCategories.map((cat) => (
      <option key={cat.id} value={String(cat.id)}>
        {getText(cat.name, language)}
      </option>
    ))}
  </select>
</div>

<div>
  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
    {getText("Output", language)}
  </label>
  <select
    value={hpFilter}
    onChange={(e) => setHpFilter(e.target.value)}
    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'border-gray-300'}`}
  >
    <option value="">{getText("All Output", language)}</option>
    {allHorsePowers.map(hp => {
      // Convert HP to kW and W using the utility function
      const { kw, w } = horsePowerToKw(hp);
      
      return (
        <option key={hp} value={hp}>
          {hp} HP {kw ? `(${kw} kW / ${w} W)` : ''}
        </option>
      );
    })}
  </select>
</div>

<div>
  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
    {getText("Model Filter", language)}
  </label>
  <input
    type="text"
    value={modelFilter}
    onChange={(e) => setModelFilter(e.target.value)}
    placeholder={getText("Model Filter Placeholder", language)}
    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700 placeholder-gray-500' : 'border-gray-300 placeholder-gray-400'}`}
  />
</div>



            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {getText("Frequency", language)}
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'border-gray-300'}`}
              >
                <option value="">{getText("Show All Frequency", language)}</option>
                {allFrequencies.map(freq => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {getText("Phase", language)}
              </label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'border-gray-300'}`}
              >
                <option value="">{getText("Show All Phase", language)}</option>
                {allPhases.map(ph => (
                  <option key={ph} value={ph}>{ph}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {getText("Outlet Size", language)}
              </label>
              <div className="flex">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={outletSizeValue}
                  onChange={(e) => setOutletSizeValue(e.target.value)}
                  placeholder={getText("Enter outlet size", language)}
                  className={`flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700 placeholder-gray-500' : 'border-gray-300 placeholder-gray-400'}`}
                />
                <select
                  value={outletSizeUnit}
                  onChange={(e) => setOutletSizeUnit(e.target.value)}
                  className={`px-2 py-2 border-l-0 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'border-gray-300'}`}
                >
                  <option value="mm">{getText("mm", language)}</option>
                  <option value="inch">{getText("inch", language)}</option>
                </select>
              </div>
              
              {/* Outlet size tolerance display */}
              {outletSizeValue && outletSizeValue.trim() !== "" && !isNaN(parseFloat(outletSizeValue)) && (
                <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {getText("Outlet Tolerance Range", language)}: {
                    (Math.round((parseFloat(outletSizeValue) * (1 - outletTolerance / 100)) * 100) / 100)
                  } - {
                    (Math.round((parseFloat(outletSizeValue) * (1 + outletTolerance / 100)) * 100) / 100)
                  } {getText(outletSizeUnit, language)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Application Inputs */}
        {isBooster&& (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-lg shadow-sm border p-6 mb-6 transition-colors`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-blue-200' : ''}`}>{getText("Application Input", language)}</h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{getText("Floor Faucet Info", language)}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {getText("Number of Floors", language)}
                </label>
                <input
                  type="number"
                  min="0"
                  value={floors === '' ? '' : floors}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setFloors('');
                    } else {
                      const parsed = parseInt(value);
                      if (!isNaN(parsed)) {
                        setFloors(parsed);
                      }
                    }
                  }}
                  onBlur={() => {
                    if (floors === '' || isNaN(floors)) {
                      setFloors(0);
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {getText("Number of Faucets", language)}
                </label>
                <input
                  type="number"
                  min="0"
                  value={faucets === '' ? '' : faucets}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setFaucets('');
                    } else {
                      const parsed = parseInt(value);
                      if (!isNaN(parsed)) {
                        setFaucets(parsed);
                      }
                    }
                  }}
                  onBlur={() => {
                    if (faucets === '' || isNaN(faucets)) {
                      setFaucets(0);
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'border-gray-300'}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Pond Drainage */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-lg shadow-sm border p-6 mb-6 transition-colors`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-blue-200' : ''}`}>
            {getText("Pond Drainage", language)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {getText("Pond Length", language)}
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={pondLength === '' ? '' : pondLength}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setPondLength('');
                  } else {
                    const parsed = parseFloat(value);
                    if (!isNaN(parsed)) {
                      setPondLength(parsed);
                    }
                  }
                }}
                onBlur={() => {
                  if (pondLength === '') {
                    setPondLength(0);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'border-gray-300'}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {getText("Pond Width", language)}
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={pondWidth === '' ? '' : pondWidth}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setPondWidth('');
                  } else {
                    const parsed = parseFloat(value);
                    if (!isNaN(parsed)) {
                      setPondWidth(parsed);
                    }
                  }
                }}
                onBlur={() => {
                  if (pondWidth === '') {
                    setPondWidth(0);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'border-gray-300'}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {getText("Pond Height", language)}
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={pondHeight === '' ? '' : pondHeight}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setPondHeight('');
                  } else {
                    const parsed = parseFloat(value);
                    if (!isNaN(parsed)) {
                      setPondHeight(parsed);
                    }
                  }
                }}
                onBlur={() => {
                  if (pondHeight === '') {
                    setPondHeight(0);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'border-gray-300'}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {getText("Drain Time", language)}
              </label>
              <input
                type="number"
                min="0.01"
                step="0.1"
                value={drainTime === '' ? '' : drainTime}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setDrainTime('');
                  } else {
                    const parsed = parseFloat(value);
                    if (!isNaN(parsed)) {
                      setDrainTime(parsed);
                    }
                  }
                }}
                onBlur={() => {
                  if (drainTime === '' || isNaN(drainTime) || drainTime < 0.01) {
                    setDrainTime(0.01); // Minimum value is 0.01
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'border-gray-300'}`}
              />
            </div>
          </div>
          {pondVolume > 0 && (
            <div className={`rounded p-3 mb-4 border ${darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
              <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                {getText("Pond Volume", language, { volume: Math.round(pondVolume) })}
              </p>
              {pondLpm > 0 && (
                <p className={`text-sm mt-1 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                  {getText("Required Flow", language, { 
                    flow: Math.round(convertFlowFromLpm(pondLpm, flowUnit) * 100) / 100, 
                    unit: getText(flowUnit, language) 
                  })}
                </p>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {getText("Pump Depth", language)}
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={undergroundDepth === '' ? '' : undergroundDepth}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setUndergroundDepth('');
                  } else {
                    const parsed = parseFloat(value);
                    if (!isNaN(parsed)) {
                      setUndergroundDepth(parsed);
                    }
                  }
                }}
                onBlur={() => {
                  if (undergroundDepth === '' || isNaN(undergroundDepth)) {
                    setUndergroundDepth(0);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'border-gray-300'}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {getText("Particle Size", language)}
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={particleSize === '' ? '' : particleSize}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setParticleSize('');
                  } else {
                    const parsed = parseFloat(value);
                    if (!isNaN(parsed)) {
                      setParticleSize(parsed);
                    }
                  }
                }}
                onBlur={() => {
                  if (particleSize === '' || isNaN(particleSize)) {
                    setParticleSize(0);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Manual Input */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-lg shadow-sm border p-6 mb-6 transition-colors`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-blue-200' : ''}`}>{getText("Manual Input", language)}</h3>
          
          {/* Flow Unit Selection */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {getText("Flow Unit", language)}
            </label>
            <div className="flex flex-wrap gap-2">
              {["L/min", "L/sec", "m³/hr", "m³/min", "US gpm"].map(unit => (
                <button
                  key={unit}
                  onClick={() => setFlowUnit(unit)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    flowUnit === unit
                      ? 'bg-blue-600 text-white'
                      : darkMode
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getText(unit, language)}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {getText("Rated Flow", language)}
            </label>
            <input
              type="number"
              min="0"
              step="10"
              value={flowValue === '' ? '' : flowValue}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setFlowValue('');
                } else {
                  const parsed = parseFloat(value);
                  if (!isNaN(parsed)) {
                    setFlowValue(parsed);
                  }
                }
              }}
              onBlur={() => {
                if (flowValue === '') {
                  setFlowValue(0);
                }
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'border-gray-300'}`}
            />
          </div>

          {/* Head Unit Selection */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {getText("Head Unit", language)}
            </label>
            <div className="flex gap-2">
              {["m", "ft"].map(unit => (
                <button
                  key={unit}
                  onClick={() => setHeadUnit(unit)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    headUnit === unit
                      ? 'bg-blue-600 text-white'
                      : darkMode
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getText(unit, language)}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {getText("Rated Head", language)}
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={headValue === '' ? '' : headValue}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setHeadValue('');
                } else {
                  const parsed = parseFloat(value);
                  if (!isNaN(parsed)) {
                    setHeadValue(parsed);
                  }
                }
              }}
              onBlur={() => {
                if (headValue === '') {
                  setHeadValue(0);
                }
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'border-gray-300'}`}
            />
          </div>

          {/* Tolerance Settings */}
          <div className={`rounded p-4 mb-4 border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              {getText("Search Tolerance", language)}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {getText("Flow Tolerance", language)} (±%)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={flowTolerance}
                    onChange={(e) => setFlowTolerance(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className={`text-sm font-medium min-w-0 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    ±{flowTolerance}%
                  </span>
                </div>
                {flowValue > 0 && (
                  <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Range: {Math.round(convertFlowFromLpm(convertFlowToLpm(flowValue, flowUnit) * (1 - flowTolerance / 100), flowUnit) * 100) / 100} - {Math.round(convertFlowFromLpm(convertFlowToLpm(flowValue, flowUnit) * (1 + flowTolerance / 100), flowUnit) * 100) / 100} {getText(flowUnit, language)}
                  </div>
                )}
              </div>
              <div>
                <label className={`block text-xs font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {getText("Head Tolerance", language)} (±%)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={headTolerance}
                    onChange={(e) => setHeadTolerance(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className={`text-sm font-medium min-w-0 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    ±{headTolerance}%
                  </span>
                </div>
                {headValue > 0 && (
                  <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Range: {Math.round(convertHeadFromM(convertHeadToM(headValue, headUnit) * (1 - headTolerance / 100), headUnit) * 100) / 100} - {Math.round(convertHeadFromM(convertHeadToM(headValue, headUnit) * (1 + headTolerance / 100), headUnit) * 100) / 100} {getText(headUnit, language)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Estimated Application for Booster */}
          {isBooster && (flowValue > 0 || headValue > 0) && (
            <div className={`rounded p-4 border ${darkMode ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
              <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                {getText("Estimated Application", language)}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className={`text-lg font-semibold ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    {Math.round(convertHeadToM(headValue, headUnit) / 3.5)}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>{getText("Estimated Floors", language)}</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-semibold ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    {Math.round(convertFlowToLpm(flowValue, flowUnit) / 15)}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>{getText("Estimated Faucets", language)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Max Limits */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-lg shadow-sm border p-6 mb-6 transition-colors`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-blue-200' : ''}`}>{getText("Max Limits", language)}</h3>
          
          {/* Flow Unit Selection (reusing the same units from Manual Input) */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {getText("Flow Unit", language)}
            </label>
            <div className="flex flex-wrap gap-2">
              {["L/min", "L/sec", "m³/hr", "m³/min", "US gpm"].map(unit => (
                <button
                  key={unit}
                  onClick={() => setFlowUnit(unit)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    flowUnit === unit
                      ? 'bg-blue-600 text-white'
                      : darkMode
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getText(unit, language)}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {getText("Max Flow Limit", language)}
            </label>
            <input
              type="number"
              min="0"
              step="10"
              value={maxFlowValue === '' ? '' : maxFlowValue}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setMaxFlowValue('');
                } else {
                  const parsed = parseFloat(value);
                  if (!isNaN(parsed)) {
                    setMaxFlowValue(parsed);
                  }
                }
              }}
              onBlur={() => {
                if (maxFlowValue === '') {
                  setMaxFlowValue(0);
                }
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'border-gray-300'}`}
            />
            <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {getText("Filter pumps with maximum flow up to this limit", language)}
            </p>
            
            <div className="mt-3">
              <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {getText("Max Flow Tolerance", language)} (±%)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={maxFlowTolerance}
                  onChange={(e) => setMaxFlowTolerance(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className={`text-sm font-medium min-w-0 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  ±{maxFlowTolerance}%
                </span>
              </div>
              {maxFlowValue > 0 && (
                <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Range: {Math.round(convertFlowFromLpm(convertFlowToLpm(maxFlowValue, flowUnit) * (1 - maxFlowTolerance / 100), flowUnit) * 100) / 100} - {Math.round(convertFlowFromLpm(convertFlowToLpm(maxFlowValue, flowUnit) * (1 + maxFlowTolerance / 100), flowUnit) * 100) / 100} {getText(flowUnit, language)}
                </div>
              )}
            </div>
          </div>

          {/* Head Unit Selection */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {getText("Head Unit", language)}
            </label>
            <div className="flex gap-2">
              {["m", "ft"].map(unit => (
                <button
                  key={unit}
                  onClick={() => setHeadUnit(unit)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    headUnit === unit
                      ? 'bg-blue-600 text-white'
                      : darkMode
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getText(unit, language)}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {getText("Max Head Limit", language)}
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={maxHeadValue === '' ? '' : maxHeadValue}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setMaxHeadValue('');
                } else {
                  const parsed = parseFloat(value);
                  if (!isNaN(parsed)) {
                    setMaxHeadValue(parsed);
                  }
                }
              }}
              onBlur={() => {
                if (maxHeadValue === '') {
                  setMaxHeadValue(0);
                }
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'border-gray-300'}`}
            />
            <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {getText("Filter pumps with maximum head up to this limit", language)}
            </p>
            
            <div className="mt-3">
              <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {getText("Max Head Tolerance", language)} (±%)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={maxHeadTolerance}
                  onChange={(e) => setMaxHeadTolerance(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className={`text-sm font-medium min-w-0 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  ±{maxHeadTolerance}%
                </span>
              </div>
              {maxHeadValue > 0 && (
                <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Range: {Math.round(convertHeadFromM(convertHeadToM(maxHeadValue, headUnit) * (1 - maxHeadTolerance / 100), headUnit) * 100) / 100} - {Math.round(convertHeadFromM(convertHeadToM(maxHeadValue, headUnit) * (1 + maxHeadTolerance / 100), headUnit) * 100) / 100} {getText(headUnit, language)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Result Percentage Slider */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-lg shadow-sm border p-6 mb-6 transition-colors`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-blue-200' : ''}`}>{getText("Result Display", language)}</h3>
          <div className="flex items-center space-x-4">
            <label className={`text-sm font-medium min-w-0 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {getText("Show Percentage", language)}
            </label>
            <input
              type="range"
              min="5"
              max="100"
              step="1"
              value={resultPercent}
              onChange={(e) => setResultPercent(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className={`text-sm font-medium min-w-0 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {resultPercent}%
            </span>
          </div>
        </div>

        {/* Search Button */}
        <div className="mb-6">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span>{getText("Search", language)}</span>
          </button>
        </div>

        {/* Results Section */}
        {hasSearched && (
          <>
            {/* Column Selection - Only shown when results are available */}
            {pumpData.length > 0 && (
              <ColumnSelection
                showColumnSelection={showColumnSelection}
                setShowColumnSelection={setShowColumnSelection}
                selectedColumns={selectedColumns}
                setSelectedColumns={setSelectedColumns}
                getText={getText}
                language={language}
                essentialColumns={essentialColumns}
                allColumns={cachedAllColumns}
                outletSizeUnit={outletSizeUnit}
              />
            )}
            
            {/* Results Table */}
            <Suspense fallback={<div>Loading results...</div>}>
              {pumpData.length > 0 && (
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-lg shadow-sm border p-4 mb-6 transition-colors`}>
                  <SimplePagination
                    currentPage={currentPage}
                    totalPages={Math.max(1, Math.ceil(pumpData.length / rowsPerPage))}
                    onPageChange={setCurrentPage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(value) => {
                      setRowsPerPage(value);
                      setCurrentPage(1);
                    }}
                    totalItems={pumpData.length}
                    getText={getText}
                    language={language}
                  />
                </div>
              )}
              <ResultsTable
            pumpData={pumpData}
            paginatedData={paginatedData}
            isLoading={loading}
            selectedPumps={selectedPumps}
            togglePumpSelection={togglePumpSelection}
            selectAllPumpsOnPage={selectAllPumpsOnPage}
            deselectAllPumpsOnPage={deselectAllPumpsOnPage}
            essentialColumns={essentialColumns}
            selectedColumns={selectedColumns}
            flowUnit={flowUnit}
            headUnit={headUnit}
            outletSizeUnit={outletSizeUnit}
            convertFlowFromLpm={convertFlowFromLpm}
            convertHeadFromM={convertHeadFromM}
          />
          {pumpData.length > 0 && (
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-lg shadow-sm border p-4 mb-6 transition-colors`}>
              <SimplePagination
                currentPage={currentPage}
                totalPages={Math.max(1, Math.ceil(pumpData.length / rowsPerPage))}
                onPageChange={setCurrentPage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(value) => {
                  setRowsPerPage(value);
                  setCurrentPage(1);
                }}
                totalItems={pumpData.length}
                getText={getText}
                language={language}
              />
            </div>
          )}
        </Suspense>
        </>
        )}

        <Suspense fallback={<div>Loading pump curves...</div>}>
          {selectedPumps.length > 0 && (
            <PumpCurves
              selectedPumps={selectedPumps}
              generateCurveData={generateCurveData}
              operatingPoint={operatingPoint}
              flowUnit={flowUnit}
              headUnit={headUnit}
            />
          )}
        </Suspense>
        
        {/* Instructions Modal */}
        {showInstructions && (
          <Instruction onClose={() => setShowInstructions(false)} />
        )}
      </div>
    </div>
  );
};

const PumpSelectionApp = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <AppContent />
    </AppProvider>
  </QueryClientProvider>
);

export default PumpSelectionApp;
