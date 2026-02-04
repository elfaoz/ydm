
import React, { useState } from 'react';
import { Calendar, CheckCircle, Circle } from 'lucide-react';
import { useStudents } from '@/contexts/StudentContext';
import { useHalaqahs } from '@/contexts/HalaqahContext';
import { useActivity } from '@/contexts/ActivityContext';
import ActivitiesMonthlySection from '@/components/ActivitiesMonthlySection';
import ActivitiesSemesterSection from '@/components/ActivitiesSemesterSection';
import LeaderboardBangunTidur from '@/components/LeaderboardBangunTidur';
import LeaderboardTahajud from '@/components/LeaderboardTahajud';
import LeaderboardRawatib from '@/components/LeaderboardRawatib';
import LeaderboardShaum from '@/components/LeaderboardShaum';
import LeaderboardTilawah from '@/components/LeaderboardTilawah';
import LeaderboardPiket from '@/components/LeaderboardPiket';

interface ActivityRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  activities: Record<string, boolean>;
}

const Activities: React.FC = () => {
  const { students } = useStudents();
  const { halaqahs } = useHalaqahs();
  const { activityRecords, addActivityRecord } = useActivity();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedHalaqah, setSelectedHalaqah] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState('');

  const getStudentsByHalaqah = (halaqahId: string) => {
    if (halaqahId === 'all') return students;
    const halaqah = halaqahs.find(h => h.id.toString() === halaqahId);
    if (!halaqah?.selectedStudents) return [];
    
    return students.filter(student => 
      halaqah.selectedStudents?.includes(student.id.toString())
    );
  };

  const filteredStudents = getStudentsByHalaqah(selectedHalaqah);

  const activities = [
    { id: 'bangun', label: 'Bangun Tidur', emoji: '⏰', completed: true },
    { id: 'tahajud', label: 'Tahajud', emoji: '🌙', completed: true },
    { id: 'rawatib', label: 'Rawatib', emoji: '🕌', completed: false },
    { id: 'shaum', label: 'Shaum', emoji: '🕋', completed: false },
    { id: 'tilawah', label: 'Tilawah', emoji: '📖', completed: true },
    { id: 'piket', label: 'Piket', emoji: '🧹', completed: true },
  ];

  const [activityStatus, setActivityStatus] = useState(
    activities.reduce((acc, activity) => ({
      ...acc,
      [activity.id]: activity.completed
    }), {} as Record<string, boolean>)
  );

  const toggleActivity = (activityId: string) => {
    setActivityStatus(prev => ({
      ...prev,
      [activityId]: !prev[activityId]
    }));
  };

  const handleSaveActivities = () => {
    if (!selectedStudent) return;
    
    const student = students.find(s => s.id.toString() === selectedStudent);
    if (!student) return;

    const newRecord: ActivityRecord = {
      id: `${selectedStudent}-${selectedDate}`,
      studentId: selectedStudent,
      studentName: student.name,
      date: selectedDate,
      activities: { ...activityStatus }
    };

    addActivityRecord(newRecord);
  };

  const getActivityRecordsForWeek = () => {
    const endDate = new Date(selectedDate);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);
    
    const weekDates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      weekDates.push(new Date(d).toISOString().split('T')[0]);
    }
    
    const studentRecords = activityRecords.filter(record => 
      (!selectedStudent || record.studentId === selectedStudent) &&
      weekDates.includes(record.date)
    );
    
    return { weekDates, studentRecords };
  };

  const { weekDates, studentRecords } = getActivityRecordsForWeek();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Activities</h1>
        <p className="text-gray-600">Checklist kegiatan harian santri</p>
      </div>
      
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
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">
            Aktivitas Harian - {selectedStudent ? students.find(s => s.id.toString() === selectedStudent)?.name : 'Pilih Santri'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  activityStatus[activity.id]
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => toggleActivity(activity.id)}
              >
                <div className="flex items-center space-x-3">
                  {activityStatus[activity.id] ? (
                    <CheckCircle className="text-green-600" size={24} />
                  ) : (
                    <Circle className="text-gray-400" size={24} />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{activity.emoji}</span>
                      <span className={`font-medium ${
                        activityStatus[activity.id] ? 'text-green-800' : 'text-gray-700'
                      }`}>
                        {activity.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Aktivitas diselesaikan: {Object.values(activityStatus).filter(Boolean).length} dari {activities.length}
              </div>
              <button 
                onClick={handleSaveActivities}
                disabled={!selectedStudent}
                className="bg-[#5db3d2] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#4a9ab8] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Simpan Aktivitas
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Activities Table */}
      {studentRecords.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              Riwayat Aktivitas - 7 Hari Terakhir
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
                {activities.map(activity => (
                  <tr key={activity.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <span>{activity.emoji}</span>
                        <span>{activity.label}</span>
                      </div>
                    </td>
                    {weekDates.map(date => {
                      const record = studentRecords.find(r => r.date === date);
                      const isCompleted = record?.activities[activity.id] || false;
                      return (
                        <td key={date} className="px-4 py-3 text-center">
                          {isCompleted ? (
                            <CheckCircle className="mx-auto text-green-600" size={20} />
                          ) : (
                            <Circle className="mx-auto text-gray-300" size={20} />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly Activities Section */}
      <ActivitiesMonthlySection 
        activityRecords={activityRecords}
        selectedStudent={selectedStudent}
        students={students}
        activities={activities}
      />

      {/* Semester Activities Section */}
      <ActivitiesSemesterSection 
        activityRecords={activityRecords}
        selectedStudent={selectedStudent}
        students={students}
        activities={activities}
      />

      {/* Leaderboard Sections */}
      <div className="mt-8 space-y-6">
        <LeaderboardBangunTidur activityRecords={activityRecords} />
        <LeaderboardTahajud activityRecords={activityRecords} />
        <LeaderboardRawatib activityRecords={activityRecords} />
        <LeaderboardShaum activityRecords={activityRecords} />
        <LeaderboardTilawah activityRecords={activityRecords} />
        <LeaderboardPiket activityRecords={activityRecords} />
      </div>
    </div>
  );
};

export default Activities;
