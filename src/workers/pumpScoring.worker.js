/* eslint-env worker */
self.onmessage = function(event) {
  const { pumpRows, flowLpm, headM, resultPercent } = event.data;
  
  // Filter pumps based on requirements
  let filtered = pumpRows;
  
  if (flowLpm > 0) {
    filtered = filtered.filter(pump => pump["Q Rated/LPM"] >= flowLpm);
  }
  
  if (headM > 0) {
    filtered = filtered.filter(pump => pump["Head Rated/M"] >= headM);
  }
  
  // Score and sort pumps
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
  
  self.postMessage(filtered);
};