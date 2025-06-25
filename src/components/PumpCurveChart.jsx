import React from 'react';
import Plot from 'react-plotly.js';
import { useAppContext } from '../context/AppContext';

const PumpCurveChart = ({ 
  modelNo, 
  pumpCurveData, 
  operatingPoint, 
  flowUnit, 
  headUnit 
}) => {
  // Get language and getText directly from context
  const { language, getText } = useAppContext();
  
  if (pumpCurveData.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-gray-600">
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
    <div className="border rounded-lg p-5 h-[450px]">
      <h4 className="text-md font-semibold mb-4">
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
              line: { color: '#8884d8', width: 3, shape: 'spline' },
              marker: { size: 8 },
              hovertemplate: 'Flow: %{x:.0f}<br>Head: %{y:.0f}<extra></extra>',
            },
            ...opPoint,
          ]}
          layout={{
            autosize: true,
            height: 350,
            xaxis: {
              title: {
                text: getText("Flow Rate", language, { unit: getText(flowUnit, language) }),
                standoff: 20,
              },
            },
            yaxis: {
              title: {
                text: getText("Head", language, { unit: getText(headUnit, language) }),
                standoff: 20,
              },
            },
            legend: { orientation: 'h', y: -0.2 },
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