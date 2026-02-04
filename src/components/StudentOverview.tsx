
import React from 'react';
import StudentFilters from './StudentFilters';
import AttendanceSummary from './AttendanceSummary';
import HafalanTable from './HafalanTable';
import FinanceSummary from './FinanceSummary';
import { useStudents } from '@/contexts/StudentContext';

interface StudentOverviewProps {
  selectedStudents: string[];
  onStudentsChange: (students: string[]) => void;
  dateRange: { from: string; to: string };
  onDateRangeChange: (range: { from: string; to: string }) => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

const StudentOverview: React.FC<StudentOverviewProps> = ({
  selectedStudents,
  onStudentsChange,
  dateRange,
  onDateRangeChange,
  selectedCategories,
  onCategoriesChange
}) => {
  const { students } = useStudents();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Student Overview</h2>
      
      <StudentFilters
        selectedStudents={selectedStudents}
        onStudentsChange={onStudentsChange}
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        selectedCategories={selectedCategories}
        onCategoriesChange={onCategoriesChange}
      />
      
      {selectedStudents.length > 0 && (
        <div className="space-y-6">
          {selectedStudents.map((studentId) => {
            const student = students.find(s => s.id.toString() === studentId);
            if (!student) return null;
            
            return (
              <div key={studentId} className="border-b border-gray-200 pb-6 last:border-b-0">
                {selectedCategories.includes('Student Identity') && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">{student.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Nomor Induk:</span>
                        <p className="text-gray-800">{student.studentId}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Full Name:</span>
                        <p className="text-gray-800">{student.name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Date of Birth:</span>
                        <p className="text-gray-800">{student.dateOfBirth}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Level:</span>
                        <p className="text-gray-800">{student.level}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Class:</span>
                        <p className="text-gray-800">{student.class}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Email:</span>
                        <p className="text-gray-800">{student.email}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Phone Number:</span>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-800">{student.phoneNumber}</p>
                          <a
                            href={`https://wa.me/${student.phoneNumber.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                          >
                            💬 Send Message
                          </a>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Address:</span>
                        <p className="text-gray-800">{student.address}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedCategories.includes('Attendance') && (
                  <AttendanceSummary studentId={studentId} dateRange={dateRange} />
                )}
                
                {selectedCategories.includes('Memorization') && (
                  <HafalanTable studentId={studentId} dateRange={dateRange} />
                )}
                
                {selectedCategories.includes('Finance') && (
                  <FinanceSummary studentId={studentId} dateRange={dateRange} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentOverview;
