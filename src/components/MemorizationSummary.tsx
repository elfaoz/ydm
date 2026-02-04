import React from 'react';
import { Book, TrendingUp, Target } from 'lucide-react';

interface MemorizationSummaryProps {
  dateRange?: { from: string; to: string };
}

const MemorizationSummary: React.FC<MemorizationSummaryProps> = ({ dateRange }) => {
  const summaryData = {
    totalPages: 0,
    targetPages: 0,
    averageDaily: 0,
    completionRate: 0
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Memorization Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Memorized */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-green-700 mb-1">
                <Book className="h-4 w-4" />
                <span className="text-sm font-medium">Total Memorized</span>
              </div>
              <p className="text-2xl font-bold text-green-800">{summaryData.totalPages} pages</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        {/* Target Achievement */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-blue-700 mb-1">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Target Achievement</span>
              </div>
              <p className="text-2xl font-bold text-blue-800">{summaryData.completionRate}%</p>
            </div>
            <div className="text-blue-600">
              <div className="w-12 h-12 rounded-full border-4 border-blue-200 flex items-center justify-center">
                <span className="text-sm font-bold">{summaryData.completionRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Average */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-purple-700 mb-1">
                <Book className="h-4 w-4" />
                <span className="text-sm font-medium">Daily Average</span>
              </div>
              <p className="text-2xl font-bold text-purple-800">{summaryData.averageDaily} pages</p>
            </div>
            <div className="text-purple-600">
              <div className="text-right">
                <div className="text-xs text-purple-600">per day</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Details */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Progress: {summaryData.totalPages} of {summaryData.targetPages} pages</span>
          <span>{summaryData.targetPages - summaryData.totalPages} pages remaining</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${summaryData.completionRate}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default MemorizationSummary;