import React, { useState } from 'react';
import { Trophy, Eye, Medal, Award } from 'lucide-react';
import DetailMemorizationModal from './DetailMemorizationModal';
import { MemorizationRecord } from '@/contexts/MemorizationContext';

interface SantriRankingProps {
  memorizationRecords: MemorizationRecord[];
}

const SantriRanking: React.FC<SantriRankingProps> = ({ memorizationRecords }) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<MemorizationRecord | null>(null);

  // Calculate ranking data from memorization records
  const rankingData = memorizationRecords.reduce((acc: any[], record) => {
    const existingStudent = acc.find(student => student.name === record.studentName);
    
    if (existingStudent) {
      existingStudent.totalPages += record.actual;
      existingStudent.memorizationDetail = record.memorizationDetail;
    } else {
      acc.push({
        id: record.id,
        name: record.studentName,
        halaqah: record.halaqah || '-',
        level: record.level || 'Tahfidz 1',
        pembina: record.pembina || 'Ustadz Ahmad',
        totalPages: record.actual,
        memorizationDetail: record.memorizationDetail
      });
    }
    
    return acc;
  }, []).sort((a, b) => b.totalPages - a.totalPages).map((student, index) => ({
    ...student,
    rank: index + 1
  }));

  const handleViewDetail = (student: typeof rankingData[0]) => {
    const record: MemorizationRecord = {
      id: student.id,
      studentName: student.name,
      date: new Date().toISOString().split('T')[0],
      target: student.totalPages,
      actual: student.totalPages,
      percentage: 100,
      status: 'Fully Achieved',
      memorizationDetail: student.memorizationDetail
    };
    setSelectedStudent(record);
    setIsDetailModalOpen(true);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800';
      case 2:
        return 'bg-gray-100 text-gray-800';
      case 3:
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Leaderboard Hafalan Terbanyak per Tanggal - All Halaqah</h3>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Halaqah
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pembina Halaqah
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Memorized (Jumlah Hafalan)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rankingData.length > 0 ? rankingData.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-2">
                    {getRankIcon(student.rank)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRankBadgeColor(student.rank)}`}>
                      #{student.rank}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{student.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {student.halaqah}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {student.level || 'Tahfidz 1'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-gray-900">{student.pembina || 'Ustadz Ahmad'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-bold text-green-600">{student.totalPages} pages</div>
                  <div className="text-xs text-gray-500">~ {Math.floor(student.totalPages / 20)} Juz</div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Belum ada data ranking santri
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DetailMemorizationModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        record={selectedStudent}
      />
    </div>
  );
};

export default SantriRanking;