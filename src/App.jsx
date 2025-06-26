import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Make sure Droplets is included in the imports from lucide-react
import { 
  Search, 
  RefreshCw, 
  RotateCcw, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp,
  Droplet // Changed from Droplets to Droplet (correct icon name)
} from 'lucide-react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import DataStatus from './components/DataStatus';
import supabase from './lib/supabase';
import ColumnSelection from './components/ColumnSelection';
import Pagination from './components/Pagination';
import SimplePagination from './components/SimplePagination';

// Lazy load components that aren't needed immediately
const PumpCurves = lazy(() => import('./components/PumpCurves'));
const ResultsTable = lazy(() => import('./components/ResultsTable'));


const translations = {
  "English": {
    // App title and headers
    "Hung Pump": "Hung Pump",
    "Pump Selection Tool": "Pump Selection Tool",
    "Data loaded": "Data loaded: {n_records} records | Last update: {timestamp}",
    
    // Buttons
    "Refresh Data": "Refresh Data",
    "Reset Inputs": "Reset Inputs",
    "Search": "Search",
    "Show Curve": "Show Pump Curve",
    "Update Curves": "Update Curves",
    
    // Step 1
    "Step 1": "Select Basic Criteria",
    "Category": "Category:",
    "Frequency": "Frequency (Hz):",
    "Phase": "Phase:",
    "Select...": "Select...",
    "All Categories": "All Categories",
    "Show All Frequency": "Show All Frequency",
    "Show All Phase": "Show All Phase",
    
    // Column Selection
    "Column Selection": "Column Selection",
    "Select Columns": "Select columns to display in results:",
    "Select All": "Select All",
    "Deselect All": "Deselect All",
    "Essential Columns": "Essential Columns (always shown)",
    
    // Categories
    "Dirty Water": "Dirty Water",
    "Clean Water": "Clean Water",
    "Speciality Pump": "Speciality Pump",
    "Grinder": "Grinder",
    "Construction": "Construction",
    "Sewage and Wastewater": "Sewage and Wastewater",
    "High Pressure": "High Pressure",
    "Booster": "Booster",
    "BLDC": "BLDC",
    
    // Application section
    "Application Input": "Application Input",
    "Floor Faucet Info": "Each floor = 3.5 m TDH | Each faucet = 15 LPM",
    "Number of Floors": "Number of Floors",
    "Number of Faucets": "Number of Faucets",
    
    // Pond drainage
    "Pond Drainage": "Pond Drainage",
    "Pond Length": "Pond Length (m)",
    "Pond Width": "Pond Width (m)",
    "Pond Height": "Pond Height (m)",
    "Drain Time": "Drain Time (hours)",
    "Pond Volume": "Pond Volume: {volume} L",
    "Required Flow": "Required Flow to drain pond: {flow} {unit}",
    
    // Underground
    "Pump Depth": "Pump Depth Below Ground (m)",
    "Particle Size": "Max Particle Size (mm)",
    
    // Manual Input
    "Manual Input": "Manual Input",
    "Flow Unit": "Flow Unit",
    "Flow Value": "Flow Value",
    "Head Unit": "Head Unit",
    "TDH": "Total Dynamic Head (TDH)",
    
    // Estimated application
    "Estimated Application": "Estimated Application (based on Manual Input)",
    "Estimated Floors": "Estimated Floors",
    "Estimated Faucets": "Estimated Faucets",
    
    // Results
    "Result Display": "Result Display Control",
    "Show Percentage": "Show Top Percentage of Results",
    "Matching Pumps": "Matching Pumps",
    "Found Pumps": "Found {count} matching pumps",
    "Matching Results": "Matching Pumps Results",
    "Showing Results": "Showing all {count} results",
    "View Product": "View Product",
    "Select Pumps": "Select pumps from the table below to view their performance curves",
    
    // Pump Curve Section
    "Pump Curves": "Pump Performance Curves",
    "Select Pump": "Select a pump to view its performance curve:",
    "No Curve Data": "No curve data available for this pump model",
    "Curve Data Loaded": "Curve data loaded: {count} pumps with curve data",
    "Performance Curve": "Performance Curve - {model}",
    "Flow Rate": "Flow Rate ({unit})",
    "Head": "Head ({unit})",
    "Operating Point": "Your Operating Point",
    "Multiple Curves": "Performance Comparison",
    "Compare Pumps": "Compare Selected Pumps",
    
    // Column headers
    "Q Rated/LPM": "Q Rated/LPM",
    "Q Rated": "Q Rated ({unit})",
    "Head Rated/M": "Head Rated/M",
    "Head Rated": "Head Rated ({unit})",
    
    // Flow units
    "L/min": "L/min",
    "L/sec": "L/sec",
    "m³/hr": "m³/hr",
    "m³/min": "m³/min",
    "US gpm": "US gpm",
    
    // Head units
    "m": "m",
    "ft": "ft",
    
    // Warnings & Errors
    "Select Warning": "Please select Frequency and Phase to proceed.",
    "No Matches": "No pumps match your criteria. Try adjusting the parameters.",
    "No Data": "No pump data available. Please check your data source.",

    // Pagination
    "Rows per page:": "Rows per page:",
    "Showing": "Showing",
    "of": "of"
  },
  "繁體中文": {
    // App title and headers
    "Hung Pump": "宏泵集團",
    "Pump Selection Tool": "水泵選型工具",
    "Data loaded": "已載入資料: {n_records} 筆記錄 | 最後更新: {timestamp}",
    
    // Buttons
    "Refresh Data": "刷新資料",
    "Reset Inputs": "重置輸入",
    "Search": "搜尋",
    "Show Curve": "顯示泵浦曲線",
    "Update Curves": "更新曲線",
    
    // Step 1
    "Step 1": "選擇基本條件",
    "Category": "類別:",
    "Frequency": "頻率 (赫茲):",
    "Phase": "相數:",
    "Select...": "請選擇...",
    "All Categories": "所有類別",
    "Show All Frequency": "顯示所有頻率",
    "Show All Phase": "顯示所有相數",
    
    // Column Selection
    "Column Selection": "欄位選擇",
    "Select Columns": "選擇要在結果中顯示的欄位:",
    "Select All": "全選",
    "Deselect All": "取消全選",
    "Essential Columns": "必要欄位 (總是顯示)",
    
    // Categories
    "Dirty Water": "污水泵",
    "Clean Water": "清水泵",
    "Speciality Pump": "特殊用途泵",
    "Grinder": "研磨泵",
    "Construction": "工業泵",
    "Sewage and Wastewater": "污水和廢水泵",
    "High Pressure": "高壓泵",
    "Booster": "加壓泵",
    "BLDC": "無刷直流泵",
    
    // Application section
    "Application Input": "應用輸入",
    "Floor Faucet Info": "每樓層 = 3.5 米揚程 | 每水龍頭 = 15 LPM",
    "Number of Floors": "樓層數量",
    "Number of Faucets": "水龍頭數量",
    
    // Pond drainage
    "Pond Drainage": "池塘排水",
    "Pond Length": "池塘長度 (米)",
    "Pond Width": "池塘寬度 (米)",
    "Pond Height": "池塘高度 (米)",
    "Drain Time": "排水時間 (小時)",
    "Pond Volume": "池塘體積: {volume} 升",
    "Required Flow": "所需排水流量: {flow} {unit}",
    
    // Underground
    "Pump Depth": "幫浦地下深度 (米)",
    "Particle Size": "最大固體顆粒尺寸 (毫米)",
    
    // Manual Input
    "Manual Input": "手動輸入",
    "Flow Unit": "流量單位",
    "Flow Value": "流量值",
    "Head Unit": "揚程單位",
    "TDH": "總動態揚程 (TDH)",
    
    // Estimated application
    "Estimated Application": "估計應用 (基於手動輸入)",
    "Estimated Floors": "估計樓層",
    "Estimated Faucets": "估計水龍頭",
    
    // Results
    "Result Display": "結果顯示控制",
    "Show Percentage": "顯示前百分比的結果",
    "Matching Pumps": "符合條件的幫浦",
    "Found Pumps": "找到 {count} 個符合的幫浦",
    "Matching Results": "符合幫浦結果",
    "Showing Results": "顯示全部 {count} 筆結果",
    "View Product": "查看產品",
    "Select Pumps": "從下表選擇幫浦以查看其性能曲線",
    
    // Pump Curve Section
    "Pump Curves": "幫浦性能曲線",
    "Select Pump": "選擇幫浦以查看其性能曲線:",
    "No Curve Data": "此幫浦型號無曲線資料",
    "Curve Data Loaded": "曲線資料已載入: {count} 個幫浦有曲線資料",
    "Performance Curve": "性能曲線 - {model}",
    "Flow Rate": "流量 ({unit})",
    "Head": "揚程 ({unit})",
    "Operating Point": "您的操作點",
    "Multiple Curves": "性能比較",
    "Compare Pumps": "比較選定的幫浦",
    
    // Column headers
    "Q Rated/LPM": "額定流量 (LPM)",
    "Q Rated": "額定流量 ({unit})",
    "Head Rated/M": "額定揚程 (M)",
    "Head Rated": "額定揚程 ({unit})",
    
    // Flow units
    "L/min": "公升/分鐘",
    "L/sec": "公升/秒",
    "m³/hr": "立方米/小時",
    "m³/min": "立方米/分鐘",
    "US gpm": "美制加侖/分鐘",
    
    // Head units
    "m": "米",
    "ft": "英尺",
    
    // Warnings & Errors
    "Select Warning": "請選擇頻率和相數以繼續。",
    "No Matches": "沒有符合您條件的幫浦。請調整參數。",
    "No Data": "無可用幫浦資料。請檢查您的資料來源。",

    // Pagination
    "Rows per page:": "每頁行數：",
    "Showing": "顯示",
    "of": "共"
  }
};

// Utility functions
const getText = (key, lang = "English", params = {}) => {
  let text = translations[lang]?.[key] || translations["English"]?.[key] || key;
  Object.keys(params).forEach(param => {
    text = text.replace(`{${param}}`, params[param]);
  });
  return text;
};

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

const queryClient = new QueryClient();

const PumpSelectionApp = () => {
  // State management
  const [language, setLanguage] = useState("English");
  const [pumpData, setPumpData] = useState([]);
  const [curveData, setCurveData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataTimestamp, setDataTimestamp] = useState(null);

  // Filter states
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState("");
  const [phase, setPhase] = useState("");

  // Application inputs
  const [floors, setFloors] = useState(0);
  const [faucets, setFaucets] = useState(0);
  const [pondLength, setPondLength] = useState(0);
  const [pondWidth, setPondWidth] = useState(0);
  const [pondHeight, setPondHeight] = useState(0);
  const [drainTime, setDrainTime] = useState(0.01);
  const [undergroundDepth, setUndergroundDepth] = useState(0);
  const [particleSize, setParticleSize] = useState(0);

  // Manual inputs
  const [flowUnit, setFlowUnit] = useState("L/min");
  const [flowValue, setFlowValue] = useState(0);
  const [headUnit, setHeadUnit] = useState("m");
  const [headValue, setHeadValue] = useState(0);

  // Results
  const [selectedPumps, setSelectedPumps] = useState([]);
  const [resultPercent, setResultPercent] = useState(100);
  const [selectedColumns, setSelectedColumns] = useState([
    "Q Rated/LPM", 
    "Head Rated/M",  // Add any additional columns you want by default
    "Frequency_Hz",
    "Phase",
    "Category",
    "Product Link"
    // Add more columns as needed
  ]);
  const [showColumnSelection, setShowColumnSelection] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return pumpData.slice(startIndex, startIndex + rowsPerPage);
  }, [pumpData, currentPage, rowsPerPage]);

  // All available values for filters
  const [allCategories, setAllCategories] = useState([]);
  const [allFrequencies, setAllFrequencies] = useState([]);
  const [allPhases, setAllPhases] = useState([]);

  // Hardcoded categories list
  const HARDCODED_CATEGORIES = [
    "BLDC",
    "Booster",
    "Clean Water",
    "Construction",
    "Dirty Water",
    "Grinder",
    "High Pressure",
    "Sewage and Wastewater",
    "Speciality Pump"
  ];

  // Hardcoded frequency list
  const HARDCODED_FREQUENCIES = [
    "50",
    "60"
  ];

  // Hardcoded phase list
  const HARDCODED_PHASES = [
    "1",
    "3"
  ];

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

    // Build filters for Supabase
    const filters = {};
    if (category && category !== getText("All Categories", language)) {
      filters["Category"] = category;
    }
    if (frequency && frequency !== getText("Show All Frequency", language)) {
      filters["Frequency_Hz"] = Number(frequency);
    }
    if (phase && phase !== getText("Show All Phase", language)) {
      if (HARDCODED_PHASES.includes(phase)) {
        filters["Phase"] = phase;
      }
    }

    // Fetch all pump data in batches
    const { data: pumpRows, error: pumpError } = await fetchAllRows('pump_selection_data', filters);

    // Fetch all curve data in batches
    const { data: curveRows, error: curveError } = await fetchAllRows('pump_curve_data');

    if (pumpError || curveError) {
      setPumpData([]);
      setCurveData([]);
      setLoading(false);
      return;
    }

    // --- CLIENT-SIDE FILTRATION BASED ON FLOW/HEAD ---
    // Use flowValue/headValue (manual input or auto-calculated)
    const requiredFlowLpm = convertFlowToLpm(flowValue, flowUnit);
    const requiredHeadM = convertHeadToM(headValue, headUnit);

    // Only filter if user has entered a value
    let filtered = pumpRows;
    if (requiredFlowLpm > 0) {
      filtered = filtered.filter(pump => pump["Q Rated/LPM"] >= requiredFlowLpm);
    }
    if (requiredHeadM > 0) {
      filtered = filtered.filter(pump => pump["Head Rated/M"] >= requiredHeadM);
    }

    // --- RESULT DISPLAY CONTROL: Show top X% of results ---
    let percent = resultPercent || 100;
    if (percent < 100 && filtered.length > 0) {
      // Sort by how close the pump is to the required flow/head (prioritize smallest excess)
      filtered = filtered
        .map(pump => ({
          ...pump,
          _score: (
            Math.abs((pump["Q Rated/LPM"] - requiredFlowLpm) / (requiredFlowLpm || 1)) +
            Math.abs((pump["Head Rated/M"] - requiredHeadM) / (requiredHeadM || 1))
          )
        }))
        .sort((a, b) => a._score - b._score)
        .slice(0, Math.ceil(filtered.length * percent / 100));
    }

    setPumpData(filtered);
    setCurveData(curveRows || []);
    setDataTimestamp(new Date().toLocaleString());
    setLoading(false);
  };

  // Fetch all unique categories, frequencies, and phases for filter options
  useEffect(() => {
    // Only set categories and frequencies from hardcoded lists
    setAllCategories(HARDCODED_CATEGORIES);
    setAllFrequencies(HARDCODED_FREQUENCIES);
    setAllPhases(HARDCODED_PHASES);
  }, []);

  // Calculated values
  const pondVolume = pondLength * pondWidth * pondHeight * 1000;
  const drainTimeMin = drainTime * 60;
  const pondLpm = pondVolume / drainTimeMin || 0;

  const autoFlow = category === "Booster" ? Math.max(faucets * 15, pondLpm) : pondLpm;
  const autoTdh = category === "Booster" ? Math.max(floors * 3.5, pondHeight) :
    (undergroundDepth > 0 ? undergroundDepth : pondHeight);

  // Available columns for selection
  const essentialColumns = ["Model No."];
  const allColumns = Object.keys(pumpData[0] || {}).filter(col => col !== "DB ID");

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
  }, [category, frequency, phase, flowValue, headValue]);

  // Reset function
  const resetInputs = () => {
    setCategory("");
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
    setSelectedPumps([]);
    setSelectedColumns([
      "Q Rated/LPM", 
      "Head Rated/M",  // Make sure these match the ones above
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
  const [cachedAllColumns, setCachedAllColumns] = useState([]);

  // Add this effect near your other useEffect hooks (around line 520-540)
  // Only calculate allColumns once after data is loaded
  useEffect(() => {
    if (pumpData.length > 0 && cachedAllColumns.length === 0) {
      setCachedAllColumns(Object.keys(pumpData[0] || {}).filter(col => col !== "DB ID"));
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
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img 
                    src={`/images/logo.gif?v=${new Date().getTime()}`} 
                    alt="Hung Pump Logo" 
                    className="h-12"
                  />
                  <h1 className="text-2xl font-bold text-blue-700">
                    {getText("Hung Pump", language)}
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="繁體中文">繁體中文</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-6">
            <h2 className="text-xl font-semibold mb-6">{getText("Pump Selection Tool", language)}</h2>
            
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
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">{getText("Step 1", language)}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getText("Category", language)}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{getText("All Categories", language)}</option>
                    {allCategories.map(cat => (
                      <option key={cat} value={cat}>{getText(cat, language)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getText("Frequency", language)}
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{getText("Show All Frequency", language)}</option>
                    {allFrequencies.map(freq => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getText("Phase", language)}
                  </label>
                  <select
                    value={phase}
                    onChange={(e) => setPhase(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{getText("Show All Phase", language)}</option>
                    {allPhases.map(ph => (
                      <option key={ph} value={ph}>{ph}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Application Inputs */}
            {category === "Booster" && (
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">{getText("Application Input", language)}</h3>
                <p className="text-sm text-gray-600 mb-4">{getText("Floor Faucet Info", language)}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pond Drainage */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                {getText("Pond Drainage", language)}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {pondVolume > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                  <p className="text-sm text-blue-700">
                    {getText("Pond Volume", language, { volume: Math.round(pondVolume) })}
                  </p>
                  {pondLpm > 0 && (
                    <p className="text-sm text-blue-700 mt-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Manual Input */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">{getText("Manual Input", language)}</h3>
              
              {/* Flow Unit Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {getText(unit, language)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText("Flow Value", language)}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Head Unit Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {getText(unit, language)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getText("TDH", language)}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Estimated Application for Booster */}
              {category === "Booster" && (flowValue > 0 || headValue > 0) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                    {getText("Estimated Application", language)}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-yellow-700">
                        {Math.round(convertHeadToM(headValue, headUnit) / 3.5)}
                      </div>
                      <div className="text-xs text-yellow-600">{getText("Estimated Floors", language)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-yellow-700">
                        {Math.round(convertFlowToLpm(flowValue, flowUnit) / 15)}
                      </div>
                      <div className="text-xs text-yellow-600">{getText("Estimated Faucets", language)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Column Selection */}
            <ColumnSelection
              showColumnSelection={showColumnSelection}
              setShowColumnSelection={setShowColumnSelection}
              selectedColumns={selectedColumns}
              setSelectedColumns={setSelectedColumns}
              getText={getText}
              language={language}
              essentialColumns={essentialColumns}
              allColumns={cachedAllColumns}
            />

            {/* Result Percentage Slider */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">{getText("Result Display", language)}</h3>
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700 min-w-0">
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
                <span className="text-sm font-medium text-gray-700 min-w-0">
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

            {/* Results Table */}
            <Suspense fallback={<div>Loading results...</div>}>
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
                convertFlowFromLpm={convertFlowFromLpm}
                convertHeadFromM={convertHeadFromM}
              />
              
              {pumpData.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
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
          </div>
        </div>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default PumpSelectionApp;
