import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ExpenseRecord {
  id: number;
  halaqah: string;
  nama: string;
  tanggal: string;
  jumlah: number;
  kategori: string;
  catatan: string;
}

interface FinanceSemesterProps {
  expenseRecords: ExpenseRecord[];
  selectedStudent: string;
  students: any[];
}

const FinanceSemesterSection: React.FC<FinanceSemesterProps> = ({
  expenseRecords,
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyShort = (amount: number) => {
    if (amount >= 1000) {
      return `Rp ${(amount / 1000).toFixed(0)}k`;
    }
    return formatCurrency(amount);
  };

  const getDaysInSemester = () => {
    // Semester 1: July-December (6 months)
    // Semester 2: January-June (6 months)
    // Approximate days: 31+31+30+31+30+31 = 184 for Jul-Dec
    // 31+28/29+31+30+31+30 = 181/182 for Jan-Jun
    if (currentSemester === 1) {
      return 184; // Jul-Dec
    } else {
      // Check if leap year
      const isLeapYear = currentYear % 4 === 0 && (currentYear % 100 !== 0 || currentYear % 400 === 0);
      return isLeapYear ? 182 : 181; // Jan-Jun
    }
  };

  const getFinanceStatus = (pct: number) => {
    if (pct <= 50) return 'Sangat Hemat';
    if (pct <= 100) return 'Hemat';
    if (pct <= 150) return 'Cukup Proporsional';
    if (pct <= 200) return 'Boros';
    return 'Sangat Boros';
  };

  const getStatusColor = (pct: number) => {
    if (pct <= 50) return 'text-green-700';
    if (pct <= 100) return 'text-green-600';
    if (pct <= 150) return 'text-yellow-600';
    if (pct <= 200) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStudentFinanceData = () => {
    if (!selectedStudent) return [];
    
    const student = students.find(s => s.id.toString() === selectedStudent);
    if (!student) return [];
    
    const semesterRecords = expenseRecords.filter(record => {
      const recordDate = new Date(record.tanggal);
      const recordYear = recordDate.getFullYear();
      const recordMonth = recordDate.getMonth();
      
      const inSemester = currentSemester === 1 
        ? recordMonth >= 6 && recordMonth <= 11
        : recordMonth >= 0 && recordMonth <= 5;
      
      return record.nama === student.name && recordYear === currentYear && inSemester;
    });

    const totalExpense = semesterRecords.reduce((sum, record) => sum + record.jumlah, 0);
    const daysInSemester = getDaysInSemester();
    const budgetHarian = 15000;
    const budgetSemesteran = budgetHarian * daysInSemester;
    const persentase = budgetSemesteran > 0 ? Math.round((totalExpense / budgetSemesteran) * 100) : 0;
    const status = getFinanceStatus(persentase);

    return [{
      nama: student.name,
      budgetHarian,
      budgetSemesteran,
      pengeluaranSemester: totalExpense,
      status,
      persentase
    }];
  };

  const studentData = getStudentFinanceData();

  if (!selectedStudent) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Data Keuangan - Per Semester
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
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Santri</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Budget Harian</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Budget Semesteran</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pengeluaran Semester Ini</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Persentase</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {studentData.map((student, index) => (
              <tr key={index}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.nama}</td>
                <td className="px-4 py-3 text-center text-sm">{formatCurrencyShort(student.budgetHarian)}</td>
                <td className="px-4 py-3 text-center text-sm">{formatCurrencyShort(student.budgetSemesteran)}</td>
                <td className="px-4 py-3 text-center text-sm font-medium text-green-600">{formatCurrencyShort(student.pengeluaranSemester)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-medium ${getStatusColor(student.persentase)}`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-medium ${getStatusColor(student.persentase)}`}>
                    {student.persentase}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinanceSemesterSection;
