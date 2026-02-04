
import React from 'react';
import { User, Calendar, MapPin, CreditCard } from 'lucide-react';

interface StudentProfileProps {
  studentId: string;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ studentId }) => {
  // Mock data - replace with actual data fetching
  const studentData = {
    '1': {
      name: 'Ahmad Fauzi',
      role: 'Santri Kelas 10',
      dateOfBirth: '15 Januari 2008',
      address: 'Jl. Pesantren No. 45, Jakarta Selatan',
      bankInfo: 'BCA - 9876543210',
    },
    '2': {
      name: 'Fatimah Az-Zahra',
      role: 'Santri Kelas 11',
      dateOfBirth: '22 Maret 2007',
      address: 'Jl. Masjid No. 12, Jakarta Timur',
      bankInfo: 'Mandiri - 1122334455',
    },
  };

  const student = studentData[studentId as keyof typeof studentData] || studentData['1'];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <User size={24} className="text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">{student.name}</h3>
          <p className="text-gray-600">{student.role}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-3">
          <Calendar className="text-gray-400" size={16} />
          <div>
            <p className="text-sm font-medium text-gray-900">Date of Birth</p>
            <p className="text-sm text-gray-600">{student.dateOfBirth}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <MapPin className="text-gray-400" size={16} />
          <div>
            <p className="text-sm font-medium text-gray-900">Address</p>
            <p className="text-sm text-gray-600">{student.address}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 md:col-span-2">
          <CreditCard className="text-gray-400" size={16} />
          <div>
            <p className="text-sm font-medium text-gray-900">Bank Information</p>
            <p className="text-sm text-gray-600">{student.bankInfo}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
