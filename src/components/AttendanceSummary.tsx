
import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface AttendanceSummaryProps {
  studentId: string;
  dateRange: { from: string; to: string };
}

const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({ studentId, dateRange }) => {
  // Mock data - replace with actual data fetching
  const attendanceData = {
    present: 18,
    absent: 2,
    sick: 1,
    permission: 1,
  };

  const stats = [
    {
      title: 'Present',
      value: attendanceData.present,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Absent (Alfa)',
      value: attendanceData.absent,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Sick',
      value: attendanceData.sick,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Permission',
      value: attendanceData.permission,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.bgColor} mr-3`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceSummary;
