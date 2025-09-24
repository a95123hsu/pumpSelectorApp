// Using default export
const translations = {
  "English": {
    // App title and headers
    "Hung Pump": "Hung Pump Group",
    "Pump Selection Tool": "Pump Selection Tool",
    "Data loaded": "Data loaded: {n_records} records | Last update: {timestamp}",
    
    // Buttons
    "Refresh Data": "Refresh Data",
    "Reset Inputs": "Reset Inputs",
    "Search": "Search",
    "Show Curve": "Show Pump Curve",
    "Update Curves": "Update Curves",
    "Export CSV": "Export CSV",
    "Light On": "Light On",
    "Light Off": "Light Off",
    "Switch to light mode": "Switch to light mode",
    "Switch to dark mode": "Switch to dark mode",
    
    // Step 1
    "Step 1": "Select Basic Criteria (Optional)",
    "Category": "Category:",
    "Model Filter": "Model Filter:",
    "Enter model prefix (e.g., BPS)": "Enter model prefix (e.g., BPS)",
    "Model Filter": "Model Filter:",
    "Model Filter Placeholder": "Enter model prefix (e.g., BPS)",
    "Outlet Size": "Outlet Size:",
    "Enter outlet size": "Enter outlet size",
    "mm": "mm",
    "inch": "inch",
    "Horse Power": "Horse Power:",
    "Output": "Output:",
    "All HP": "All HP",
    "All Output": "All Output",
    "Frequency": "Frequency (Hz):",
    "Phase": "Phase:",
    "Select...": "Select...",
    "All Categories": "All Categories",
    "Show All Frequency": "Show All Frequency",
    "Show All Phase": "Show All Phase",
    
    // Column Selection
    "Column Selection": "Column Selection (Optional)",
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
    "High Head Submersible Clean Water Pumps": "High Head Submersible Clean Water Pumps",
    "Macerator Grinder Pump": "Macerator Grinder Pump",
    "Lift Station Dirty Water Pump System": "Lift Station Dirty Water Pump System",
    "High Flow Dirty Water Pumps": "High Flow Dirty Water Pumps",
    "Dewatering Pump": "Dewatering Pump",
    "Sump Pump": "Sump Pump",
    "Vortex Pump": "Vortex Pump",
    
    // Application section
    "Application Input": "Application Input (Optional)",
    "Floor Faucet Info": "Each floor = 3.5 m TDH | Each faucet = 15 LPM",
    "Number of Floors": "Number of Floors",
    "Number of Faucets": "Number of Faucets",
    
    // Pond drainage
    "Pond Drainage": "Pond Drainage (Optional)",
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
    "Manual Input": "Manual Input (Optional)",
    "Flow Unit": "Flow Unit",
    "Rated Flow": "Rated Flow",
    "Flow Value": "Flow Value",
    "Head Unit": "Head Unit",
    "TDH": "Total Dynamic Head (TDH)",
    "Search Tolerance": "Search Tolerance",
    "Flow Tolerance": "Flow Tolerance",
    "Head Tolerance": "Head Tolerance",
    "Outlet Tolerance Range": "Outlet Tolerance Range (±10%)",
    
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
    "Selected pumps": "Selected pumps",
    
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
    "Select": "Select",
    "Model No.": "Model No.",
    "Q Rated/LPM": "Q Rated/LPM",
    "Q Rated": "Q Rated ({unit})",
    "Head Rated/M": "Head Rated/M",
    "Head Rated": "Head Rated ({unit})",
    "Frequency_Hz": "Frequency (Hz)",
    "Phase": "Phase:",
    "Category": "Category:",
    "Product Link": "Product Link",
    "HP": "HP",
    "Power(KW)": "Power (KW)",
    "HP with Power": "{hp} HP ({kw} kW / {w} W)",
    "Outlet": "Outlet ({unit})",
    "Current_A": "Current (A)",
    "Weight_kg": "Weight (kg)",
    "Outlet (mm)": "Outlet (mm)",
    "Outlet (inch)": "Outlet (inch)",
    "Outlet": "Outlet",
    "Outlet with unit": "Outlet ({unit})",
    "Pass Solid Dia(mm)": "Pass Solid Dia (mm)",
    "Max_Particle_Size_mm": "Max Particle Size (mm)",
    "Efficiency": "Efficiency (%)",
    "Max Head(M)": "Max Head (M)",
    "Max Flow (LPM)": "Max Flow (LPM)",
    "Max Head (ft)": "Max Head (ft)",
    "Series": "Series",
    
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
    "max head (m)": "Max Head (M)",
    
    // Pagination UI
    "Rows per page:": "Rows per page:",
    "Showing": "Showing",
    "of": "of",
    "Previous": "Previous",
    "Next": "Next",
    "Page": "Page",
    "Flow": "Flow"
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
    "Export CSV": "匯出CSV",
    "Light On": "開燈",
    "Light Off": "關燈",
    "Switch to light mode": "切換到亮色模式",
    "Switch to dark mode": "切換到暗色模式",
    
    // Step 1
    "Step 1": "選擇基本條件 (選填)",
    "Category": "類別:",
    "Model Filter": "型號篩選:",
    "Model Filter Placeholder": "輸入型號前綴 (例如: BPS)",
    "Enter model prefix (e.g., BPS)": "輸入型號前綴 (例如: BPS)",
    "Outlet Size": "出水口徑:",
    "Enter outlet size": "輸入出水口徑尺寸",
    "mm": "毫米",
    "inch": "英吋",
    "Horse Power": "馬力:",
    "Output": "輸出功率:",
    "All HP": "所有馬力",
    "All Output": "所有輸出功率",
    "Frequency": "頻率 (赫茲):",
    "Phase": "相數:",
    "Select...": "請選擇...",
    "All Categories": "所有類別",
    "Show All Frequency": "顯示所有頻率",
    "Show All Phase": "顯示所有相數",
    
    // Column Selection
    "Column Selection": "欄位選擇 (選填)",
    "Select Columns": "選擇要在結果中顯示的欄位:",
    "Select All": "全選",
    "Deselect All": "全部取消",
    "Essential Columns": "必要欄位 (總是顯示)",
    
    // Categories
  "Skimmer Pump": "撇渣泵",
  "Residue Dewater Pump": "殘渣排水泵",
  "Garden Pump": "花園泵",
  "BLDC Swimming Pool Pump": "BLDC泳池泵",
  "High Pressure": "高壓泵",
  "High Head Submersible Clean Water Pumps": "高揚程潛水清水泵",
  "Macerator Grinder Pump": "粉碎泵",
  "Speciality Pump": "特殊泵",
  "Lift Station Dirty Water Pump System": "提升站污水泵系統",
  "Grinder": "研磨泵",
  "Sewage and Wastewater": "污水及廢水泵",
  "Fountain Floating Tree Pump": "噴泉浮動樹泵",
  "Submersible Booster Pump": "潛水增壓泵",
  "Clean Water": "清水泵",
  "Booster": "增壓泵",
  "BLDC": "BLDC泵",
  "High Flow Dirty Water Pumps": "高流量污水泵",
  "Floating Tree": "浮動樹泵",
  "Dirty Sewage Cutter Pumps": "污水切割泵",
  "Rain Water": "雨水泵",
  "Vortex Pump": "渦流泵",
  "Sump Pump": "集水坑泵",
  "Dewatering Pump": "排水泵",
  "High Head Dirty Sump Pumps": "高揚程污水集水坑泵",
  "Construction": "建築泵",
  "Dirty Water": "污水泵",
  "All Stainless Submersible Sump and Sewage Pumps": "全不鏽鋼潛水集水坑及污水泵",
  "BLDC Dosing Pump": "BLDC計量泵",
  "Booster and Centrifugal": "增壓及離心泵",
  "Swimming Pool Pump": "泳池泵",
  "Progressive Cavity": "螺桿泵",
    
    // Application section
    "Application Input": "應用輸入 (選填)",
    "Floor Faucet Info": "每樓層 = 3.5 米揚程 | 每水龍頭 = 15 LPM",
    "Number of Floors": "樓層數量",
    "Number of Faucets": "水龍頭數量",
    
    // Pond drainage
    "Pond Drainage": "池塘排水 (選填)",
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
    "Manual Input": "手動輸入 (選填)",
    "Flow Unit": "流量單位",
    "Rated Flow": "額定流量",
    "Flow Value": "流量值",
    "Head Unit": "揚程單位",
    "Rated Head": "額定揚程",
    "Search Tolerance": "搜尋容差",
    "Flow Tolerance": "流量容差",
    "Head Tolerance": "揚程容差",
    "Outlet Tolerance Range": "出水口徑容差範圍 (±10%)",
    
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
    "Selected pumps": "選定的幫浦",
    
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
    "Select": "選擇",
    "Model No.": "型號",
    "Q Rated/LPM": "額定流量 (公升/分鐘)",
    "Q Rated": "額定流量 ({unit})",
    "Head Rated/M": "額定揚程 (米)",
    "Head Rated": "額定揚程 ({unit})",
    "Frequency_Hz": "頻率 (赫茲)",
    "Phase": "相數:",
    "Category": "類別:",
    "Product Link": "產品連結",
    "HP": "馬力 (HP)",
    "Power(KW)": "功率 (千瓦)",
    "HP with Power": "{hp} HP ({kw} kW / {w} W)",
    "Outlet": "出水口徑 ({unit})",
    "Current_A": "電流 (安培)",
    "Weight_kg": "重量 (公斤)",
    "Outlet (mm)": "出水口徑 (毫米)",
    "Outlet (inch)": "出水口徑 (英吋)",
    "Outlet": "出水口徑",
    "Outlet with unit": "出水口徑 ({unit})",
    "Pass Solid Dia(mm)": "可通過固體直徑 (毫米)",
    "Max_Particle_Size_mm": "最大顆粒尺寸 (毫米)",
    "Efficiency": "效率 (%)",
    "Max Head (M)": "最大揚程 (米)",
    "Max Flow (LPM)": "最大流量 (公升/分鐘)",
    "Max Head (ft)": "最大揚程 (英尺)",
    "Series": "系列",
    
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
    "max head (m)": "最大揚程 (米)",
    
    // Pagination UI
    "Rows per page:": "每頁顯示行數:",
    "Showing": "顯示",
    "of": "共",
    "Previous": "上一頁",
    "Next": "下一頁",
    "Page": "頁次",
    "Flow": "流量"
  }
};

export default translations;