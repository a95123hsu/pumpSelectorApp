// src/columns.js
export const AVAILABLE_COLUMNS = [
  // Essential columns (always shown)
  { id: "Model No.", category: "essential", label: "Model No." },
  
  // Flow and head columns
  { id: "Q Rated/LPM", category: "flow", label: "Q Rated/LPM" },
  { id: "Head Rated/M", category: "flow", label: "Head Rated/M" },
  
  // Electrical specifications
  { id: "Frequency_Hz", category: "electrical", label: "Frequency (Hz)" },
  { id: "Phase", category: "electrical", label: "Phase" },
  { id: "HP", category: "electrical", label: "HP" },
  { id: "Power(KW)", category: "electrical", label: "Power (KW)" },
  { id: "Current_A", category: "electrical", label: "Current (A)" },
  
  // Physical specifications
  { id: "Weight_kg", category: "physical", label: "Weight (kg)" },
  { id: "Outlet (mm)", category: "physical", label: "Outlet (mm)" },
  { id: "Outlet (inch)", category: "physical", label: "Outlet (inch)" },
  { id: "Pass Solid Dia(mm)", category: "physical", label: "Pass Solid Dia (mm)" },
  { id: "Max_Particle_Size_mm", category: "physical", label: "Max Particle Size (mm)" },
  
  // Performance specs
  { id: "Efficiency", category: "performance", label: "Efficiency (%)" },
  { id: "Max Head(M)", category: "performance", label: "Max Head (M)" },
  
  // Categorization
  { id: "Category", category: "info", label: "Category" },
  { id: "Series", category: "info", label: "Series" },
  { id: "Product Link", category: "info", label: "Product Link" }
];

// You can add as many columns as you need to this list

export const ESSENTIAL_COLUMNS = AVAILABLE_COLUMNS
  .filter(col => col.category === "essential")
  .map(col => col.id);

export const DEFAULT_SELECTED_COLUMNS = [
  "Q Rated/LPM",
  "Head Rated/M",
  "Frequency_Hz",
  "Phase",
  "Category",
  "Product Link"
];

// Organize columns by category for better UI
export const COLUMN_CATEGORIES = [
  { id: "flow", label: "Flow & Head" },
  { id: "electrical", label: "Electrical" },
  { id: "physical", label: "Physical" },
  { id: "performance", label: "Performance" },
  { id: "info", label: "Information" }
];