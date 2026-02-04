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

interface FinanceMonthlyProps {
  expenseRecords: ExpenseRecord[];
  selectedStudent: string;
  students: any[];
}

const FinanceMonthlySection: React.FC<FinanceMonthlyProps> = ({
  expenseRecords,
  selectedStudent,
  students
}) => {
  const months = [
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'
  ];
  
  // Get current date
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-11
  // Academic year: July (6) to June (5)
  // If current month is 0-5 (Jan-Jun), we're in second semester
  // If current month is 6-11 (Jul-Dec), we're in first semester
  const initialMonthIndex = currentMonth >= 6 ? currentMonth - 6 : currentMonth + 6;
  
  const [currentMonthIndex, setCurrentMonthIndex] = useState(initialMonthIndex);
  const [currentYear] = useState(new Date().getFullYear());

  const goToPreviousMonth = () => {
    setCurrentMonthIndex((prev) => (prev === 0 ? 11 : prev - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonthIndex((prev) => (prev === 11 ? 0 : prev + 1));
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

  // Convert academic month index to calendar month (0-11)
  const getCalendarMonth = (academicIndex: number) => {
    // Academic: 0=Jul, 1=Aug, ..., 5=Dec, 6=Jan, ..., 11=Jun
    // Calendar: 0=Jan, 1=Feb, ..., 6=Jul, ..., 11=Dec
    if (academicIndex < 6) {
      return academicIndex + 6; // Jul-Dec
    } else {
      return academicIndex - 6; // Jan-Jun
    }
  };

  const getDaysInMonth = (monthIndex: number) => {
    const calendarMonth = getCalendarMonth(monthIndex);
    const year = calendarMonth < 6 ? currentYear + 1 : currentYear;
    return new Date(year, calendarMonth + 1, 0).getDate();
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
    
    const calendarMonth = getCalendarMonth(currentMonthIndex);
    const year = calendarMonth < 6 ? currentYear + 1 : currentYear;
    
    const monthRecords = expenseRecords.filter(record => {
      const recordDate = new Date(record.tanggal);
      const recordMonth = recordDate.getMonth();
      const recordYear = recordDate.getFullYear();
      return record.nama === student.name && recordMonth === calendarMonth && recordYear === year;
    });

    const totalExpense = monthRecords.reduce((sum, record) => sum + record.jumlah, 0);
    const daysInMonth = getDaysInMonth(currentMonthIndex);
    const budgetHarian = 15000;
    const budgetBulanan = budgetHarian * daysInMonth;
    const persentase = budgetBulanan > 0 ? Math.round((totalExpense / budgetBulanan) * 100) : 0;
    const status = getFinanceStatus(persentase);

    return [{
      nama: student.name,
      budgetHarian,
      budgetBulanan,
      pengeluaranBulan: totalExpense,
      status,
      persentase
    }];
  };

  const studentData = getStudentFinanceData();
  
  if (!selectedStudent) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8 mt-8">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Data Keuangan - Per Bulan
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
              {months[currentMonthIndex]} {currentYear}
            </span>
            <button
              onClick={goToNextMonth}
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
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Budget Bulanan</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pengeluaran Bulan Ini</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Persentase</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {studentData.map((student, index) => (
              <tr key={index}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.nama}</td>
                <td className="px-4 py-3 text-center text-sm">{formatCurrencyShort(student.budgetHarian)}</td>
                <td className="px-4 py-3 text-center text-sm">{formatCurrencyShort(student.budgetBulanan)}</td>
                <td className="px-4 py-3 text-center text-sm font-medium text-green-600">{formatCurrencyShort(student.pengeluaranBulan)}</td>
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

export default FinanceMonthlySection;
