import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

const LazyPlot = (props) => {
  const [isVisible, setIsVisible] = useState(false);
  const [Plot, setPlot] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isVisible && !Plot) {
      import('react-plotly.js').then((module) => {
        setPlot(() => module.default);
      });
    }
  }, [isVisible, Plot]);

  return (
    <div ref={ref} style={{ width: '100%', height: '100%' }}>
      {isVisible && Plot ? <Plot {...props} /> : <div className="h-full w-full flex items-center justify-center">Loading chart...</div>}
    </div>
  );
};

export default LazyPlot;