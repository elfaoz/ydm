import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from './ui/badge';

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'hadir' | 'izin' | 'sakit' | 'tanpa keterangan' | 'pulang';
  remarks?: string;
}

interface AttendanceMonthlyProps {
  attendanceRecords: AttendanceRecord[];
  selectedStudent: string;
  students: any[];
}

const AttendanceMonthlySection: React.FC<AttendanceMonthlyProps> = ({
  attendanceRecords,
  selectedStudent,
  students
}) => {
  // Urutan bulan sesuai JS
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Bulan default = real time bulan sekarang
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
  const [currentYear] = useState(new Date().getFullYear());

  // Parser tanggal yang robust
  const parseRecordMonth = (rawDate: string) => {
    const clean = rawDate.replace(/\s+/g, '');
    const parts = clean.split(/[-/.]/);

    let month;

    if (parts.length === 3) {
      if (parts[0].length === 4) {
        month = Number(parts[1]);
      } else {
        month = Number(parts[1]);
      }
    } else if (parts.length === 2) {
      const str = parts[1];
      month = Number(str.slice(0, 2));
    } else {
      return null;
    }

    return month - 1;
  };

  const goToPreviousMonth = () => {
    setCurrentMonthIndex(prev => (prev === 0 ? 11 : prev - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonthIndex(prev => (prev === 11 ? 0 : prev + 1));
  };

  const getMonthlyStats = () => {
    if (!selectedStudent) return { hadir: 0, izin: 0, sakit: 0, tanpaKeterangan: 0, pulang: 0 };

    const monthRecords = attendanceRecords.filter(record => {
      const recordMonth = parseRecordMonth(record.date);
      return record.studentId === selectedStudent && recordMonth === currentMonthIndex;
    });

    return {
      hadir: monthRecords.filter(r => r.status === 'hadir').length,
      izin: monthRecords.filter(r => r.status === 'izin').length,
      sakit: monthRecords.filter(r => r.status === 'sakit').length,
      tanpaKeterangan: monthRecords.filter(r => r.status === 'tanpa keterangan').length,
      pulang: monthRecords.filter(r => r.status === 'pulang').length,
    };
  };

  const stats = getMonthlyStats();
  const studentName = selectedStudent ? students.find(s => s.id.toString() === selectedStudent)?.name : '';

  if (!selectedStudent) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Data Absensi - Per Bulan
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
              {months[currentMonthIndex]} {currentYear}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        {studentName && (
          <p className="text-sm text-gray-600 mt-1">Santri: {studentName}</p>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hadir</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Izin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sakit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanpa Keterangan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pulang</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            <tr>
              <td className="px-6 py-4 text-sm">
                <Badge className="bg-green-100 text-green-800">{stats.hadir}</Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                <Badge className="bg-yellow-100 text-yellow-800">{stats.izin}</Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                <Badge className="bg-orange-100 text-orange-800">{stats.sakit}</Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                <Badge className="bg-red-100 text-red-800">{stats.tanpaKeterangan}</Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                <Badge className="bg-purple-100 text-purple-800">{stats.pulang}</Badge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceMonthlySection;
