import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

interface ActivityRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  activities: Record<string, boolean>;
}

interface LeaderboardPiketProps {
  activityRecords: ActivityRecord[];
}

const LeaderboardPiket: React.FC<LeaderboardPiketProps> = ({ activityRecords }) => {
  const studentActivities = activityRecords.reduce((acc: any[], record) => {
    const completed = record.activities['piket'] ? 1 : 0;
    const existing = acc.find(item => item.nama === record.studentName);
    
    if (existing) {
      existing.totalAktivitas += completed;
    } else {
      acc.push({
        nama: record.studentName,
        totalAktivitas: completed
      });
    }
    return acc;
  }, []);

  const leaderboard = studentActivities.sort((a, b) => b.totalAktivitas - a.totalAktivitas).slice(0, 10);

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
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-sky-50 to-blue-50">
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-sky-600" />
          <h3 className="text-lg font-semibold text-gray-800">Leaderboard Aktivitas Piket 🧹</h3>
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
                Total Aktivitas
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.length > 0 ? leaderboard.map((student, index) => (
              <tr key={student.nama} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-2">
                    {getRankIcon(index + 1)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRankBadgeColor(index + 1)}`}>
                      #{index + 1}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{student.nama}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-bold text-sky-600">{student.totalAktivitas} hari</div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  Belum ada data aktivitas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardPiket;
