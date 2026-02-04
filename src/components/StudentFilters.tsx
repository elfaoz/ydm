
import React from 'react';
import { Calendar, Search, Filter } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { useStudents } from '@/contexts/StudentContext';

interface StudentFiltersProps {
  selectedStudents: string[];
  onStudentsChange: (students: string[]) => void;
  dateRange: { from: string; to: string };
  onDateRangeChange: (range: { from: string; to: string }) => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

const StudentFilters: React.FC<StudentFiltersProps> = ({
  selectedStudents,
  onStudentsChange,
  dateRange,
  onDateRangeChange,
  selectedCategories,
  onCategoriesChange,
}) => {
  const { students: registeredStudents } = useStudents();
  
  const categories = [
    { id: 'Student Identity', name: 'Student Identity' },
    { id: 'Finance', name: 'Finance' },
    { id: 'Attendance', name: 'Attendance' },
    { id: 'Memorization', name: 'Memorization' },
    { id: 'Activities', name: 'Activities' },
  ];

  const students = registeredStudents.map(student => ({
    id: student.studentId,
    name: student.name
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="inline w-4 h-4 mr-1" />
          Date Range
        </label>
        <div className="flex space-x-2">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Filter className="inline w-4 h-4 mr-1" />
          Categories
        </label>
        <div className="border border-gray-300 rounded-md p-3 bg-white">
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onCategoriesChange([...selectedCategories, category.id]);
                    } else {
                      onCategoriesChange(selectedCategories.filter(id => id !== category.id));
                    }
                  }}
                />
                <label
                  htmlFor={category.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Search className="inline w-4 h-4 mr-1" />
          Select Students
        </label>
        <div className="border border-gray-300 rounded-md p-3 bg-white max-h-40 overflow-y-auto">
          <div className="space-y-2">
            {students.map((student) => (
              <div key={student.id} className="flex items-center space-x-2">
                <Checkbox
                  id={student.id}
                  checked={selectedStudents.includes(student.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onStudentsChange([...selectedStudents, student.id]);
                    } else {
                      onStudentsChange(selectedStudents.filter(id => id !== student.id));
                    }
                  }}
                />
                <label
                  htmlFor={student.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {student.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFilters;
