import { useState, useEffect } from 'react';

export default function usePumpWorker(pumpRows, flowLpm, headM, resultPercent) {
  const [results, setResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    if (!pumpRows.length) return;
    
    setIsProcessing(true);
    
    const worker = new Worker(new URL('../workers/pumpScoring.worker.js', import.meta.url));
    
    worker.onmessage = (event) => {
      setResults(event.data);
      setIsProcessing(false);
    };
    
    worker.postMessage({ pumpRows, flowLpm, headM, resultPercent });
    
    return () => {
      worker.terminate();
    };
  }, [pumpRows, flowLpm, headM, resultPercent]);
  
  return { results, isProcessing };
}