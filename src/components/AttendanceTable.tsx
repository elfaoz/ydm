
import React, { useState } from 'react';
import { useStudents } from '@/contexts/StudentContext';

interface AttendanceRecord {
  id: number;
  name: string;
  attendance: { [date: string]: 'hadir' | 'sakit' | 'izin' | 'alfa' };
}

const AttendanceTable: React.FC = () => {
  const { students } = useStudents();
  const [attendanceData] = useState<AttendanceRecord[]>([]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hadir': return '✔';
      case 'sakit': return 'S';
      case 'izin': return 'I';
      case 'alfa': return 'A';
      default: return '-';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hadir': return 'text-green-600 bg-green-50';
      case 'sakit': return 'text-yellow-600 bg-yellow-50';
      case 'izin': return 'text-blue-600 bg-blue-50';
      case 'alfa': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Absensi Harian</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Santri
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                26/06
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                27/06
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                28/06
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendanceData.length > 0 ? attendanceData.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.name}
                </td>
                {['26/06', '27/06', '28/06'].map((date) => (
                  <td key={date} className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${getStatusColor(student.attendance[date])}`}>
                      {getStatusIcon(student.attendance[date])}
                    </span>
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  Belum ada data absensi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;
