import React from 'react';
import { TrendingUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import PumpCurveChart from './PumpCurveChart';
import LazyPlot from './LazyPlot';

const PumpCurves = (props) => {
  // Extract the AppContext values
  const { getText, language } = useAppContext();
  
  // Access props from the parent component
  const { selectedPumps = [] } = props;
  
  // Access these functions from parent using props or from context if you moved them there
  const generateCurveData = props.generateCurveData || (() => []);
  const operatingPoint = props.operatingPoint || { flow: 0, head: 0 };
  const flowUnit = props.flowUnit || 'L/min';
  const headUnit = props.headUnit || 'm';

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        {getText("Pump Curves", language)}
      </h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {getText("Selected pumps", language)}: {selectedPumps.join(", ")}
        </p>
      </div>

      {/* Performance Comparison Chart */}
      <div className="mb-8">
        <h4 className="text-md font-semibold mb-4">{getText("Multiple Curves", language)}</h4>
        <div className="h-96">
          <LazyPlot
            data={
              selectedPumps.map((modelNo, index) => {
                const pumpCurveData = generateCurveData(modelNo);
                const flowArr = pumpCurveData.map(d => d.flow);
                const headArr = pumpCurveData.map(d => d.head);
                const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];
                return {
                  x: flowArr,
                  y: headArr,
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: modelNo,
                  line: { color: colors[index % colors.length], width: 3, shape: 'spline' },
                  marker: { size: 8 },
                  hovertemplate: 'Flow: %{x:.0f}<br>Head: %{y:.0f}<extra></extra>',
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