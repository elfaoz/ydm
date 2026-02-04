
import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

interface FinanceSummaryProps {
  studentId: string;
  dateRange: { from: string; to: string };
}

const FinanceSummary: React.FC<FinanceSummaryProps> = ({ studentId, dateRange }) => {
  // Mock data - replace with actual data fetching
  const financeData = {
    totalRevenue: 2500000,
    totalExpense: 1800000,
    savingPercentage: 28,
    revenues: [
      { date: '2024-01-01', source: 'Monthly Fee', amount: 500000 },
      { date: '2024-01-15', source: 'Book Fee', amount: 150000 },
      { date: '2024-01-20', source: 'Activity Fee', amount: 200000 },
    ],
    expenses: [
      { date: '2024-01-05', category: 'Books', amount: 300000 },
      { date: '2024-01-10', category: 'Uniform', amount: 250000 },
      { date: '2024-01-15', category: 'Activities', amount: 150000 },
    ],
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Finance Summary</h3>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100 mr-3">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600">Total Revenue</p>
              <p className="text-lg font-bold text-green-800">
                {formatCurrency(financeData.totalRevenue)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-red-100 mr-3">
              <TrendingDown size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-600">Total Expense</p>
              <p className="text-lg font-bold text-red-800">
                {formatCurrency(financeData.totalExpense)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100 mr-3">
              <PiggyBank size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600">Saving</p>
              <p className="text-lg font-bold text-blue-800">
                {financeData.savingPercentage}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h4 className="text-md font-semibold text-gray-800">Revenue</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {financeData.revenues.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {new Date(item.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.source}</td>
                    <td className="px-4 py-2 text-sm text-green-600 font-medium">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h4 className="text-md font-semibold text-gray-800">Expenses</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {financeData.expenses.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {new Date(item.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.category}</td>
                    <td className="px-4 py-2 text-sm text-red-600 font-medium">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceSummary;
