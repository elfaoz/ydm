import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from './ui/badge';

interface MemorizationRecord {
  id: string;
  studentName: string;
  date: string;
  target: number;
  actual: number;
  percentage: number;
  status: string;
}

interface MemorizationSemesterProps {
  memorizationRecords: MemorizationRecord[];
  selectedStudent: string;
  students: any[];
}

const MemorizationSemesterSection: React.FC<MemorizationSemesterProps> = ({
  memorizationRecords,
  selectedStudent,
  students
}) => {
  // Semester dinamis berdasarkan bulan sekarang
  // Semester 1: Juli - Desember (months 6-11)
  // Semester 2: Januari - Juni (months 0-5)
  const currentMonth = new Date().getMonth();
  const initialSemester = currentMonth >= 6 ? 1 : 2;
  
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentSemester, setCurrentSemester] = useState(initialSemester);

  const goToPreviousSemester = () => {
    if (currentSemester === 1) {
      setCurrentYear(prev => prev - 1);
      setCurrentSemester(2);
    } else {
      setCurrentSemester(1);
    }
  };

  const goToNextSemester = () => {
    if (currentSemester === 2) {
      setCurrentYear(prev => prev + 1);
      setCurrentSemester(1);
    } else {
      setCurrentSemester(2);
    }
  };

  const getStatusLabel = (percentage: number) => {
    if (percentage >= 80) return 'Baik Sekali';
    if (percentage >= 60) return 'Baik';
    if (percentage >= 40) return 'Cukup';
    if (percentage >= 20) return 'Kurang';
    return 'Sangat Kurang';
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 60) return 'bg-blue-100 text-blue-800';
    if (percentage >= 40) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 20) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getDaysInSemester = () => {
    // Semester 1: July-December (184 days)
    // Semester 2: January-June (181/182 days)
    if (currentSemester === 1) {
      return 184;
    } else {
      const isLeapYear = currentYear % 4 === 0 && (currentYear % 100 !== 0 || currentYear % 400 === 0);
      return isLeapYear ? 182 : 181;
    }
  };

  // Target berdasarkan level santri
  const getTargetByLevel = (level: string) => {
    const levelLower = level?.toLowerCase() || '';
    if (levelLower.includes('tahsin')) {
      return { daily: 4, monthly: 4, semester: 20 };
    } else if (levelLower.includes('tahfizh kamil') || levelLower.includes('tahfidz kamil')) {
      return { daily: 20, monthly: 20, semester: 100 };
    } else if (levelLower.includes('tahfizh 2') || levelLower.includes('tahfidz 2')) {
      return { daily: 10, monthly: 10, semester: 50 };
    } else if (levelLower.includes('tahfizh 1') || levelLower.includes('tahfidz 1') || levelLower.includes('tahfizh') || levelLower.includes('tahfidz')) {
      return { daily: 6, monthly: 6, semester: 30 };
    }
    return { daily: 4, monthly: 4, semester: 20 }; // Default Tahsin
  };

  const getSemesterStats = () => {
    if (!selectedStudent) return { targetHarian: 0, targetSemesteran: 0, actual: 0, percentage: 0, status: '' };
    
    const student = students.find(s => s.id.toString() === selectedStudent);
    if (!student) return { targetHarian: 0, targetSemesteran: 0, actual: 0, percentage: 0, status: '' };
    
    const semesterRecords = memorizationRecords.filter(record => {
      const recordDate = new Date(record.date);
      const recordYear = recordDate.getFullYear();
      const recordMonth = recordDate.getMonth();
      
      const inSemester = currentSemester === 1 
        ? recordMonth >= 6 && recordMonth <= 11
        : recordMonth >= 0 && recordMonth <= 5;
      
      return record.studentName === student.name && recordYear === currentYear && inSemester;
    });

    const levelTarget = getTargetByLevel(student.level);
    const targetHarian = levelTarget.daily;
    const targetSemesteran = levelTarget.semester;
    const actual = semesterRecords.reduce((sum, r) => sum + r.actual, 0);
    const percentage = targetSemesteran > 0 ? Math.round((actual / targetSemesteran) * 100) : 0;

    return {
      targetHarian,
      targetSemesteran,
      actual,
      percentage,
      status: getStatusLabel(percentage),
    };
  };

  const stats = getSemesterStats();
  const studentName = selectedStudent ? students.find(s => s.id.toString() === selectedStudent)?.name : '';

  if (!selectedStudent || memorizationRecords.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Data Hafalan - Per Semester
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={goToPreviousSemester}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[150px] text-center">
              Semester {currentSemester} - {currentYear}
            </span>
            <button
              onClick={goToNextSemester}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target Harian</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target Semesteran</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pencapaian (Halaman)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Persentase</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            <tr>
              <td className="px-6 py-4 text-sm">
                <Badge className="bg-blue-100 text-blue-800">{stats.targetHarian}</Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                <Badge className="bg-indigo-100 text-indigo-800">{stats.targetSemesteran}</Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                <Badge className="bg-green-100 text-green-800">{stats.actual}</Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                <Badge className="bg-purple-100 text-purple-800">{stats.percentage}%</Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                <Badge className={getStatusColor(stats.percentage)}>{stats.status}</Badge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemorizationSemesterSection;