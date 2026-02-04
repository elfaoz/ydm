
import React from 'react';

interface HafalanTableProps {
  studentId: string;
  dateRange: { from: string; to: string };
}

const HafalanTable: React.FC<HafalanTableProps> = ({ studentId, dateRange }) => {
  // Mock data - replace with actual data fetching
  const hafalanData = [
    { date: '2024-01-01', target: 2, actual: 2, percentage: 100, status: 'Fully Achieved' },
    { date: '2024-01-02', target: 2, actual: 1, percentage: 50, status: 'Not Achieved' },
    { date: '2024-01-03', target: 2, actual: 1.5, percentage: 75, status: 'Achieved' },
    { date: '2024-01-04', target: 2, actual: 2, percentage: 100, status: 'Fully Achieved' },
    { date: '2024-01-05', target: 2, actual: 1, percentage: 50, status: 'Not Achieved' },
  ];

  const getStatusBadge = (status: string, percentage: number) => {
    let colorClass = '';
    if (percentage >= 80) colorClass = 'bg-green-100 text-green-800';
    else if (percentage >= 60) colorClass = 'bg-yellow-100 text-yellow-800';
    else colorClass = 'bg-red-100 text-red-800';

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {status}
      </span>
    );
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Hafalan (Qur'an Memorization)</h3>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hafalanData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {new Date(row.date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {row.target} pages
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {row.actual} pages
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`font-medium ${getPercentageColor(row.percentage)}`}>
                      {row.percentage}%
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(row.status, row.percentage)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HafalanTable;
