import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useMemorization } from '@/contexts/MemorizationContext';
import { useAttendance } from '@/contexts/AttendanceContext';
import { useActivity } from '@/contexts/ActivityContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useHalaqahs } from '@/contexts/HalaqahContext';
import SantriRanking from './SantriRanking';

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'hadir' | 'izin' | 'sakit' | 'tanpa keterangan' | 'pulang';
}

interface ActivityRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  activities: Record<string, boolean>;
}

interface ExpenseRecord {
  id: number;
  nama: string;
  halaqah: string;
  jumlah: number;
  tanggal: string;
}

interface LeaderboardOverviewProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

const LeaderboardOverview: React.FC<LeaderboardOverviewProps> = ({
  selectedCategories,
  onCategoriesChange
}) => {
  const { memorizationRecords } = useMemorization();
  const { attendanceRecords } = useAttendance();
  const { activityRecords } = useActivity();
  const { expenseRecords } = useFinance();
  const { halaqahs } = useHalaqahs();
  const [showResults, setShowResults] = useState(false);

  const categories = [
    { id: 'Attendance', label: 'Attendance' },
    { id: 'Memorization', label: 'Memorization' },
    { id: 'Activities', label: 'Activities' },
    { id: 'Finance', label: 'Finance' }
  ];

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter(c => c !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  // Get top 3 for each category
  const getTop3Memorization = () => {
    const levelTargets: Record<string, number> = {
      'Tahsin (2 Juz : Juz 30 dan Juz 29 atau Juz 1)': 23,
      'Tahfizh 1 (5 Juz)': 103,
      'Tahfizh 2 (10 Juz)': 203,
      'Tahfizh Kamil (30 Juz)': 604
    };

    const rankingData = memorizationRecords.reduce((acc: any[], record) => {
      const existingStudent = acc.find(student => student.name === record.studentName);
      
      if (existingStudent) {
        existingStudent.totalPages += record.actual;
      } else {
        // Find halaqah to get level and pembina
        const halaqah = halaqahs.find(h => h.name === record.halaqah);
        const level = halaqah?.level || record.level || 'Tahfizh 1 (5 Juz)';
        const targetPages = levelTargets[level] || 103;
        
        acc.push({
          id: record.id,
          name: record.studentName,
          halaqah: record.halaqah || '-',
          level: level,
          targetPages: targetPages,
          pembina: halaqah?.pembina || '-',
          totalPages: record.actual
        });
      }
      
      return acc;
    }, []).sort((a, b) => b.totalPages - a.totalPages).slice(0, 3);
    
    return rankingData;
  };

  const getTop3Attendance = () => {
    const studentAttendance = attendanceRecords.reduce((acc: any[], record) => {
      const existing = acc.find(item => item.nama === record.studentName);
      if (existing) {
        if (record.status === 'hadir') existing.totalHadir += 1;
        if (record.status === 'izin') existing.totalIzin += 1;
        if (record.status === 'sakit') existing.totalSakit += 1;
        if (record.status === 'tanpa keterangan') existing.totalTanpaKeterangan += 1;
        if (record.status === 'pulang') existing.totalPulang += 1;
      } else {
        acc.push({
          nama: record.studentName,
          totalHadir: record.status === 'hadir' ? 1 : 0,
          totalIzin: record.status === 'izin' ? 1 : 0,
          totalSakit: record.status === 'sakit' ? 1 : 0,
          totalTanpaKeterangan: record.status === 'tanpa keterangan' ? 1 : 0,
          totalPulang: record.status === 'pulang' ? 1 : 0
        });
      }
      return acc;
    }, []);
    
    return studentAttendance.sort((a, b) => b.totalHadir - a.totalHadir).slice(0, 3);
  };

  const getTop3ByActivity = (activityId: string) => {
    const studentActivities = activityRecords.reduce((acc: any[], record) => {
      if (record.activities[activityId]) {
        const existing = acc.find(item => item.nama === record.studentName);
        if (existing) {
          existing.totalAktivitas += 1;
        } else {
          acc.push({
            nama: record.studentName,
            totalAktivitas: 1
          });
        }
      }
      return acc;
    }, []);
    
    return studentActivities.sort((a, b) => b.totalAktivitas - a.totalAktivitas).slice(0, 3);
  };

  const getTop3Finance = () => {
    const studentExpenses = expenseRecords.reduce((acc: any[], record) => {
      const existing = acc.find(item => item.nama === record.nama);
      if (existing) {
        existing.totalPengeluaran += record.jumlah;
      } else {
        acc.push({
          nama: record.nama,
          totalPengeluaran: record.jumlah
        });
      }
      return acc;
    }, []);
    
    return studentExpenses.sort((a, b) => a.totalPengeluaran - b.totalPengeluaran).slice(0, 3);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Overview</h2>
      
      {/* Category Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Pilih Kategori:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => handleCategoryToggle(category.id)}
              />
              <label
                htmlFor={category.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {category.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Show Results Button */}
      <div className="mb-6">
        <Button 
          onClick={() => setShowResults(true)}
          disabled={selectedCategories.length === 0}
          className="w-full md:w-auto"
        >
          Tampilkan
        </Button>
      </div>

      {/* Results */}
      {showResults && selectedCategories.length > 0 && (
        <div className="space-y-6">
          {/* Memorization Top 3 */}
          {selectedCategories.includes('Memorization') && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Leaderboard Hafalan</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Halaqah</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Level</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Target Per Level (Halaman)</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pembina Halaqah</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Pages</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getTop3Memorization().map((student, index) => (
                      <tr key={student.id}>
                        <td className="px-4 py-3 text-center font-bold text-blue-600">#{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium">{student.name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{student.halaqah}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs">{student.level}</td>
                        <td className="px-4 py-3 text-center font-medium text-gray-900">{student.targetPages}</td>
                        <td className="px-4 py-3 text-center text-sm">{student.pembina}</td>
                        <td className="px-4 py-3 text-center font-bold text-green-600">{student.totalPages} halaman</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Attendance Top 3 */}
          {selectedCategories.includes('Attendance') && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Leaderboard Kehadiran</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Hadir</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Izin</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sakit</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tanpa Keterangan</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pulang</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getTop3Attendance().map((student, index) => (
                      <tr key={student.nama}>
                        <td className="px-4 py-3 text-center font-bold text-blue-600">#{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium">{student.nama}</td>
                        <td className="px-4 py-3 text-center font-bold text-green-600">{student.totalHadir}</td>
                        <td className="px-4 py-3 text-center text-yellow-600">{student.totalIzin}</td>
                        <td className="px-4 py-3 text-center text-orange-600">{student.totalSakit}</td>
                        <td className="px-4 py-3 text-center text-red-600">{student.totalTanpaKeterangan}</td>
                        <td className="px-4 py-3 text-center text-purple-600">{student.totalPulang}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Activities - Separate Tables for Each Activity */}
          {selectedCategories.includes('Activities') && (
            <div className="border-t pt-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Leaderboard Kegiatan Harian</h3>
              
              {/* Bangun Tidur */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span>⏰</span> Aktivitas Bangun Tidur
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rank</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Hari</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getTop3ByActivity('bangun').map((student, index) => (
                        <tr key={student.nama}>
                          <td className="px-4 py-3 text-center font-bold text-blue-600">#{index + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium">{student.nama}</td>
                          <td className="px-4 py-3 text-center font-bold text-purple-600">{student.totalAktivitas} hari</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tahajud */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span>🌙</span> Aktivitas Tahajud
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rank</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Hari</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getTop3ByActivity('tahajud').map((student, index) => (
                        <tr key={student.nama}>
                          <td className="px-4 py-3 text-center font-bold text-blue-600">#{index + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium">{student.nama}</td>
                          <td className="px-4 py-3 text-center font-bold text-purple-600">{student.totalAktivitas} hari</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rawatib */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span>🕌</span> Aktivitas Rawatib
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rank</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Hari</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getTop3ByActivity('rawatib').map((student, index) => (
                        <tr key={student.nama}>
                          <td className="px-4 py-3 text-center font-bold text-blue-600">#{index + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium">{student.nama}</td>
                          <td className="px-4 py-3 text-center font-bold text-purple-600">{student.totalAktivitas} hari</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Shaum */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span>🕋</span> Aktivitas Shaum
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rank</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Hari</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getTop3ByActivity('shaum').map((student, index) => (
                        <tr key={student.nama}>
                          <td className="px-4 py-3 text-center font-bold text-blue-600">#{index + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium">{student.nama}</td>
                          <td className="px-4 py-3 text-center font-bold text-purple-600">{student.totalAktivitas} hari</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tilawah */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span>📖</span> Aktivitas Tilawah
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rank</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Hari</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getTop3ByActivity('tilawah').map((student, index) => (
                        <tr key={student.nama}>
                          <td className="px-4 py-3 text-center font-bold text-blue-600">#{index + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium">{student.nama}</td>
                          <td className="px-4 py-3 text-center font-bold text-purple-600">{student.totalAktivitas} hari</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Piket */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span>🧹</span> Aktivitas Piket
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rank</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Hari</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getTop3ByActivity('piket').map((student, index) => (
                        <tr key={student.nama}>
                          <td className="px-4 py-3 text-center font-bold text-blue-600">#{index + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium">{student.nama}</td>
                          <td className="px-4 py-3 text-center font-bold text-purple-600">{student.totalAktivitas} hari</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Finance Top 3 */}
          {selectedCategories.includes('Finance') && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Leaderboard Keuangan</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Pengeluaran</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getTop3Finance().map((student, index) => (
                      <tr key={student.nama}>
                        <td className="px-4 py-3 text-center font-bold text-blue-600">#{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium">{student.nama}</td>
                        <td className="px-4 py-3 text-center font-bold text-green-600">{formatCurrency(student.totalPengeluaran)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaderboardOverview;
