import React, { useState } from 'react';
import { Calendar, CheckCircle, Circle } from 'lucide-react';
import { useStudents } from '@/contexts/StudentContext';
import { useHalaqahs } from '@/contexts/HalaqahContext';
import { useAttendance } from '@/contexts/AttendanceContext';
import InputAbsensiModal from '@/components/InputAbsensiModal';
import AttendanceMonthlySection from '@/components/AttendanceMonthlySection';
import AttendanceSemesterSection from '@/components/AttendanceSemesterSection';
import LeaderboardAttendance from '@/components/LeaderboardAttendance';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GatekeeperModal from '@/components/GatekeeperModal';

interface StudentAttendance {
  id: string;
  name: string;
  status: 'hadir' | 'izin' | 'sakit' | 'tanpa keterangan' | 'pulang';
  halaqah: string;
  remarks?: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'hadir' | 'izin' | 'sakit' | 'tanpa keterangan' | 'pulang';
  remarks?: string;
}

const Attendance: React.FC = () => {
  const { students } = useStudents();
  const { halaqahs } = useHalaqahs();
  const { attendanceRecords, addAttendanceRecord } = useAttendance();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedHalaqah, setSelectedHalaqah] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentAttendance | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  
  // Input form state
  const [attendanceStatus, setAttendanceStatus] = useState<'hadir' | 'izin' | 'sakit' | 'tanpa keterangan' | 'pulang'>('hadir');
  const [remarks, setRemarks] = useState('');

  const getStudentsByHalaqah = (halaqahId: string) => {
    if (halaqahId === 'all') return students;
    const halaqah = halaqahs.find(h => h.id.toString() === halaqahId);
    if (!halaqah?.selectedStudents) return [];
    
    return students.filter(student => 
      halaqah.selectedStudents?.includes(student.id.toString())
    );
  };

  const filteredStudents = getStudentsByHalaqah(selectedHalaqah);

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      hadir: 'bg-green-100 text-green-800',
      izin: 'bg-yellow-100 text-yellow-800',
      sakit: 'bg-orange-100 text-orange-800',
      'tanpa keterangan': 'bg-red-100 text-red-800',
      pulang: 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const handleSaveAttendance = () => {
    if (!selectedStudent) return;
    
    const student = students.find(s => s.id.toString() === selectedStudent);
    if (!student) return;

    const newRecord: AttendanceRecord = {
      id: `${selectedStudent}-${selectedDate}`,
      studentId: selectedStudent,
      studentName: student.name,
      date: selectedDate,
      status: attendanceStatus,
      remarks: remarks
    };

    addAttendanceRecord(newRecord);

    // Reset form
    setAttendanceStatus('hadir');
    setRemarks('');
  };

  const getAttendanceRecordsForWeek = () => {
    const endDate = new Date(selectedDate);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);
    
    const weekDates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      weekDates.push(new Date(d).toISOString().split('T')[0]);
    }
    
    const studentRecords = attendanceRecords.filter(record => 
      (!selectedStudent || record.studentId === selectedStudent) &&
      weekDates.includes(record.date)
    );
    
    return { weekDates, studentRecords };
  };

  const { weekDates, studentRecords } = getAttendanceRecordsForWeek();

  return (
    <>
      <GatekeeperModal 
        isOpen={!hasAccess}
        onAccessGranted={() => setHasAccess(true)}
        pageName="Attendance"
      />
      
      {hasAccess && (
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Attendance</h1>
            <p className="text-gray-600">Kelola absensi santri harian</p>
          </div>

          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="text-gray-400" size={20} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select 
              value={selectedHalaqah}
              onChange={(e) => {
                setSelectedHalaqah(e.target.value);
                setSelectedStudent('');
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Halaqah</option>
              {halaqahs.map(halaqah => (
                <option key={halaqah.id} value={halaqah.id.toString()}>
                  {halaqah.name}
                </option>
              ))}
            </select>
            
            <select 
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={filteredStudents.length === 0}
            >
              <option value="">Pilih Santri</option>
              {filteredStudents.map(student => (
                <option key={student.id} value={student.id.toString()}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                Input Absensi - {selectedStudent ? students.find(s => s.id.toString() === selectedStudent)?.name : 'Pilih Santri'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Tanggal: {new Date(selectedDate).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {(['hadir', 'izin', 'sakit', 'tanpa keterangan', 'pulang'] as const).map((status) => (
                  <div
                    key={status}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      attendanceStatus === status
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                    onClick={() => setAttendanceStatus(status)}
                  >
                    <div className="flex items-center space-x-3">
                      {attendanceStatus === status ? (
                        <CheckCircle className="text-blue-600" size={24} />
                      ) : (
                        <Circle className="text-gray-400" size={24} />
                      )}
                      <div className="flex-1">
                        <span className={`font-medium capitalize ${
                          attendanceStatus === status ? 'text-blue-800' : 'text-gray-700'
                        }`}>
                          {status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keterangan (opsional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Masukkan keterangan..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Status: <span className="font-medium capitalize">{attendanceStatus}</span>
                  </div>
                  <button 
                    onClick={handleSaveAttendance}
                    disabled={!selectedStudent}
                    className="bg-[#5db3d2] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#4a9ab8] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Save Attendance
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Attendance Table */}
          {studentRecords.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                  Riwayat Absensi - 7 Hari Terakhir
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Santri
                      </th>
                      {weekDates.map(date => (
                        <th key={date} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          {new Date(date).toLocaleDateString('id-ID', { 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                        {selectedStudent ? students.find(s => s.id.toString() === selectedStudent)?.name : 'All Students'}
                      </td>
                      {weekDates.map(date => {
                        const record = studentRecords.find(r => r.date === date);
                        return (
                          <td key={date} className="px-4 py-3 text-center">
                            {record ? (
                              <div className="flex flex-col items-center">
                                {getStatusBadge(record.status)}
                                {record.remarks && (
                                  <span className="text-xs text-gray-500 mt-1" title={record.remarks}>
                                    {record.remarks.substring(0, 10)}...
                                  </span>
                                )}
                              </div>
                            ) : (
                              <Circle className="mx-auto text-gray-300" size={20} />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Monthly Attendance Section */}
          <AttendanceMonthlySection attendanceRecords={attendanceRecords} selectedStudent={selectedStudent} students={students} />

          {/* Semester Attendance Section */}
          <AttendanceSemesterSection attendanceRecords={attendanceRecords} selectedStudent={selectedStudent} students={students} />

          {/* Leaderboard Section */}
          <div className="mt-8">
            <LeaderboardAttendance attendanceRecords={attendanceRecords} />
          </div>

          <InputAbsensiModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            initialData={editingStudent ? {
              halaqah: editingStudent.halaqah,
              studentId: editingStudent.id,
              studentName: editingStudent.name,
              status: editingStudent.status,
              remarks: editingStudent.remarks || ''
            } : null}
            onSave={(updatedStudent) => {
              console.log('Updated student:', updatedStudent);
              setIsModalOpen(false);
            }}
          />
        </div>
      )}
    </>
  );
};

export default Attendance;