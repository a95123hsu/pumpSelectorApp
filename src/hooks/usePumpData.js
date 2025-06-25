import { useQuery, useQueryClient } from '@tanstack/react-query';
import supabase from '../lib/supabase';

// Fetch all rows with batching
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
      query = query.eq(col, val);
    });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    allRows = allRows.concat(data || []);
    
    if (!data || data.length < batchSize) {
      keepGoing = false;
    } else {
      from = to + 1;
      to = from + batchSize - 1;
    }
  }
  
  return allRows;
};

export function usePumpData(filters, flowLpm, headM, resultPercent) {
  return useQuery({
    queryKey: ['pumpData', filters, flowLpm, headM, resultPercent],
    queryFn: async () => {
      const pumpRows = await fetchAllRows('pump_selection_data', filters);
      
      // Client-side filtering
      let filtered = pumpRows;
      
      if (flowLpm > 0) {
        filtered = filtered.filter(pump => pump["Q Rated/LPM"] >= flowLpm);
      }
      
      if (headM > 0) {
        filtered = filtered.filter(pump => pump["Head Rated/M"] >= headM);
      }
      
      // Result display control
      let percent = resultPercent || 100;
      if (percent < 100 && filtered.length > 0) {
        filtered = filtered
          .map(pump => ({
            ...pump,
            _score: (
              Math.abs((pump["Q Rated/LPM"] - flowLpm) / (flowLpm || 1)) +
              Math.abs((pump["Head Rated/M"] - headM) / (headM || 1))
            )
          }))
          .sort((a, b) => a._score - b._score)
          .slice(0, Math.ceil(filtered.length * percent / 100));
      }
      
      return filtered;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCurveData() {
  return useQuery({
    queryKey: ['curveData'],
    queryFn: async () => {
      return await fetchAllRows('pump_curve_data');
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}