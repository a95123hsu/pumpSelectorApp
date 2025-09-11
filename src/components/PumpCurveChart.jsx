import React from 'react';
import Plot from 'react-plotly.js';
import { useAppContext } from '../context/AppContext';

const Plotly = window.Plotly;

const PumpCurveChart = ({ 
  modelNo, 
  pumpCurveData, 
  operatingPoint, 
  flowUnit, 
  headUnit 
}) => {
  // Get language and getText directly from context
  const { language, getText, darkMode } = useAppContext();
  
  if (pumpCurveData.length === 0) {
    return (
      <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {getText("No Curve Data", language)} - {modelNo}
        </p>
      </div>
    );
  }

  // Prepare data for Plotly
  const flowArr = pumpCurveData.map(d => d.flow);
  const headArr = pumpCurveData.map(d => d.head);

  // Operating point marker
  const opPoint =
    operatingPoint.flow > 0 && operatingPoint.head > 0
      ? [{
          x: [operatingPoint.flow],
          y: [operatingPoint.head],
          mode: 'markers+text',
          marker: { color: 'red', size: 12, symbol: 'star' },
          name: getText("Operating Point", language),
          text: [getText("Operating Point", language)],
          textposition: 'top center',
        }]
      : [];

  return (
    <div className={`border rounded-lg p-5 h-[450px] ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'}`}>
      <h4 className={`text-md font-semibold mb-4 ${darkMode ? 'text-blue-200' : 'text-gray-900'}`}>
        {getText("Performance Curve", language, { model: modelNo })}
      </h4>
      <div className="h-80">
        <Plot
          data={[
            {
              x: flowArr,
              y: headArr,
              type: 'scatter',
              mode: 'lines+markers',
              name: modelNo,
              line: { color: darkMode ? '#60a5fa' : '#8884d8', width: 3, shape: 'spline' },
              marker: { size: 8 },
              hovertemplate: `${getText("Flow", language, { unit: getText(flowUnit, language) })}: %{x:.0f}<br>${getText("Head", language, { unit: getText(headUnit, language) })}: %{y:.0f}<extra></extra>`,
            },
            ...opPoint,
          ]}
          layout={{
            autosize: true,
            height: 350,
            paper_bgcolor: darkMode ? '#1f2937' : '#ffffff',
            plot_bgcolor: darkMode ? '#374151' : '#ffffff',
            font: {
              color: darkMode ? '#f3f4f6' : '#374151'
            },
            xaxis: {
              title: {
                text: getText("Flow Rate", language, { unit: getText(flowUnit, language) }),
                standoff: 20,
              },
              gridcolor: darkMode ? '#4b5563' : '#e5e7eb',
              color: darkMode ? '#f3f4f6' : '#374151'
            },
            yaxis: {
              title: {
                text: getText("Head", language, { unit: getText(headUnit, language) }),
                standoff: 20,
              },
              gridcolor: darkMode ? '#4b5563' : '#e5e7eb',
              color: darkMode ? '#f3f4f6' : '#374151'
            },
            legend: { 
              orientation: 'h', 
              y: -0.2,
              font: {
                color: darkMode ? '#f3f4f6' : '#374151'
              }
            },
            margin: { t: 30, r: 30, b: 60, l: 60 },
          }}
          useResizeHandler
          style={{ width: "100%", height: "100%" }}
          config={{ responsive: true }}
        />
      </div>
    </div>
  );
};

export default React.memo(PumpCurveChart);