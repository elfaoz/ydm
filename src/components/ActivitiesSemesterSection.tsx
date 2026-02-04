import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ActivityRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  activities: Record<string, boolean>;
}

interface ActivitiesSemesterProps {
  activityRecords: ActivityRecord[];
  selectedStudent: string;
  students: any[];
  activities: Array<{ id: string; label: string; emoji: string }>;
}

const ActivitiesSemesterSection: React.FC<ActivitiesSemesterProps> = ({
  activityRecords,
  selectedStudent,
  students,
  activities
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

  const getSemesterStats = () => {
    if (!selectedStudent) return {};
    
    const semesterRecords = activityRecords.filter(record => {
      const recordDate = new Date(record.date);
      const recordYear = recordDate.getFullYear();
      const recordMonth = recordDate.getMonth();
      
      const inSemester = currentSemester === 1 
        ? recordMonth >= 6 && recordMonth <= 11
        : recordMonth >= 0 && recordMonth <= 5;
      
      return record.studentId === selectedStudent && recordYear === currentYear && inSemester;
    });

    const stats: Record<string, number> = {};
    activities.forEach(activity => {
      stats[activity.id] = semesterRecords.filter(r => r.activities[activity.id]).length;
    });

    return stats;
  };

  const stats = getSemesterStats();
  const studentName = selectedStudent ? students.find(s => s.id.toString() === selectedStudent)?.name : '';

  if (!selectedStudent || activityRecords.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Data Aktivitas - Per Semester
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
              {activities.map(activity => (
                <th key={activity.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {activity.emoji} {activity.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            <tr>
              {activities.map(activity => (
                <td key={activity.id} className="px-6 py-4 text-sm font-medium text-gray-900">
                  {stats[activity.id] || 0} hari
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivitiesSemesterSection;
