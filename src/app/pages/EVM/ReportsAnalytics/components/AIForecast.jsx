import React from "react";

const AIForecast = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        AI Forecast & Analysis
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Demand Forecast */}
        <div className="p-4 border border-gray-200 rounded-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Demand Forecast by Region
          </h3>
          <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center text-gray-400">
            [Line Chart Placeholder]
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="p-4 border border-gray-200 rounded-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            AI Recommendations
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800">
                Optimize Production
              </h4>
              <p className="text-sm text-gray-600">
                Increase production of Model X (Long Range) by 15% for Q3 due to
                anticipated high demand in North America. Review supply chain
                capacity for key components.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">
                Targeted Distribution
              </h4>
              <p className="text-sm text-gray-600">
                Prioritize shipments of Model 3 to the European market in Q4, as
                forecast indicates a 10% surge in demand, aligning with regional
                incentive programs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">
                Dealer Performance Incentive
              </h4>
              <p className="text-sm text-gray-600">
                Implement a sales incentive program for dealers in the
                Asia-Pacific region for Model Y, aiming to boost sales by 8%
                given current inventory levels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIForecast;
