import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AnalysisResults = ({
  stockData,
  views,
  activeView,
  goToView,
  nextView,
  prevView,
  children,
}) => {
  if (!stockData) {
    return null;
  }

  const activeChild = React.Children.toArray(children)[activeView];

  return (
    <div className="mt-10 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white">Results</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-gray-700/50 border border-gray-600 p-1 rounded-lg">
            {views.map((view, index) => (
              <button
                key={index}
                onClick={() => goToView(index)}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeView === index
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                <view.icon className="h-4 w-4 mr-2" />
                {view.name}
              </button>
            ))}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={prevView}
              className="p-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors border border-gray-600"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextView}
              className="p-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors border border-gray-600"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-xl border border-gray-700/80 p-6 min-h-[400px]">
        {activeChild}
      </div>
    </div>
  );
};

export default AnalysisResults;