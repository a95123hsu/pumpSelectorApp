import React from 'react';
import { TrendingUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import PumpCurveChart from './PumpCurveChart';
import LazyPlot from './LazyPlot';

const PumpCurves = (props) => {
  // Extract the AppContext values
  const { getText, language, darkMode } = useAppContext();
  
  // Access props from the parent component
  const { selectedPumps = [] } = props;
  
  // Access these functions from parent using props or from context if you moved them there
  const generateCurveData = props.generateCurveData || (() => []);
  const operatingPoint = props.operatingPoint || { flow: 0, head: 0 };
  const flowUnit = props.flowUnit || 'L/min';
  const headUnit = props.headUnit || 'm';

  return (
    <div className={`rounded-lg shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-blue-200' : 'text-gray-900'}`}>
        {getText("Pump Curves", language)}
      </h3>
      
      <div className="mb-4">
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {getText("Selected pumps", language)}: {selectedPumps.join(", ")}
        </p>
      </div>

      {/* Performance Comparison Chart */}
      <div className="mb-8">
        <h4 className={`text-md font-semibold mb-4 ${darkMode ? 'text-blue-200' : 'text-gray-900'}`}>{getText("Multiple Curves", language)}</h4>
        <div className="h-96">
          <LazyPlot
            data={
              selectedPumps.map((modelNo, index) => {
                const pumpCurveData = generateCurveData(modelNo);
                const flowArr = pumpCurveData.map(d => d.flow);
                const headArr = pumpCurveData.map(d => d.head);
                const colors = darkMode 
                  ? ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa'] // Brighter colors for dark mode
                  : ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1']; // Original colors for light mode
                return {
                  x: flowArr,
                  y: headArr,
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: modelNo,
                  line: { color: colors[index % colors.length], width: 3, shape: 'spline' },
                  marker: { size: 8 },
                  hovertemplate: `${getText("Flow", language, { unit: getText(flowUnit, language) })}: %{x:.0f}<br>${getText("Head", language, { unit: getText(headUnit, language) })}: %{y:.0f}<extra></extra>`,
                };
              }).concat(
                (operatingPoint.flow > 0 && operatingPoint.head > 0)
                  ? [{
                      x: [operatingPoint.flow],
                      y: [operatingPoint.head],
                      mode: 'markers+text',
                      marker: { color: 'red', size: 14, symbol: 'star' },
                      name: getText("Operating Point", language),
                      text: [getText("Operating Point", language)],
                      textposition: 'top center',
                    }]
                  : []
              )
            }
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

      {/* Individual Pump Charts */}
      <div className="space-y-6">
        {selectedPumps.map(modelNo => (
          <PumpCurveChart 
            key={modelNo}
            modelNo={modelNo}
            pumpCurveData={generateCurveData(modelNo)}
            operatingPoint={operatingPoint}
            flowUnit={flowUnit}
            headUnit={headUnit}
            language={language}
            getText={getText}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(PumpCurves);