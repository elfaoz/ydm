import React, { useState } from 'react';
import { Calendar, Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useStudents } from '@/contexts/StudentContext';
import { useHalaqahs } from '@/contexts/HalaqahContext';
import { useFinance } from '@/contexts/FinanceContext';
import { toast } from '@/hooks/use-toast';
import FinanceMonthlySection from '@/components/FinanceMonthlySection';
import FinanceSemesterSection from '@/components/FinanceSemesterSection';
import EditExpenseModal from '@/components/EditExpenseModal';
import LeaderboardFinance from '@/components/LeaderboardFinance';
import GatekeeperModal from '@/components/GatekeeperModal';

interface StudentFinance {
  id: number;
  nama: string;
  halaqah: string;
  budgetHarian: number;
  budgetMingguan: number;
  pengeluaranMingguIni: number;
  persentase: number;
  status: 'hemat' | 'over';
  statusText: string;
}

interface ExpenseRecord {
  id: number;
  halaqah: string;
  nama: string;
  tanggal: string;
  jumlah: number;
  kategori: string;
  catatan: string;
}

const Finance: React.FC = () => {
  const { students } = useStudents();
  const { halaqahs: registeredHalaqahs } = useHalaqahs();
  const { expenseRecords, addExpenseRecord, updateExpenseRecord, deleteExpenseRecord } = useFinance();
  const [selectedHalaqah, setSelectedHalaqah] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [isEditExpenseModalOpen, setIsEditExpenseModalOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  
  // Input form state
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseNotes, setExpenseNotes] = useState('');

  // Derived state - calculate summary directly from expenseRecords
  const studentsFinance: StudentFinance[] = React.useMemo(() => {
    const defaultBudgetHarian = 15000;
    const defaultBudgetMingguan = defaultBudgetHarian * 7;
    
    // Get current week dates
    const endDate = new Date(selectedDate);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);
    
    const weekDatesForCalc: string[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      weekDatesForCalc.push(new Date(d).toISOString().split('T')[0]);
    }
    
    // Group expenses by student name for the current week
    const expensesByStudent: Record<string, number> = {};
    expenseRecords.forEach(record => {
      if (weekDatesForCalc.includes(record.tanggal)) {
        if (!expensesByStudent[record.nama]) {
          expensesByStudent[record.nama] = 0;
        }
        expensesByStudent[record.nama] += record.jumlah;
      }
    });
    
    // Create finance summary for each student with expenses
    return Object.entries(expensesByStudent).map(([nama, pengeluaranMingguIni], index) => {
      const persentase = Math.round((pengeluaranMingguIni / defaultBudgetMingguan) * 100);
      return {
        id: index + 1,
        nama,
        halaqah: selectedHalaqah,
        budgetHarian: defaultBudgetHarian,
        budgetMingguan: defaultBudgetMingguan,
        pengeluaranMingguIni,
        persentase,
        status: persentase <= 100 ? 'hemat' : 'over' as 'hemat' | 'over',
        statusText: persentase <= 100 ? 'Hemat' : 'Over Budget'
      };
    });
  }, [expenseRecords, selectedDate, selectedHalaqah]);

  const getStudentsByHalaqah = (halaqahId: string) => {
    if (halaqahId === 'all') return students;
    const halaqah = registeredHalaqahs.find(h => h.id.toString() === halaqahId);
    if (!halaqah?.selectedStudents) return [];
    
    return students.filter(student => 
      halaqah.selectedStudents?.includes(student.id.toString())
    );
  };

  const filteredStudents = getStudentsByHalaqah(selectedHalaqah);

  const handleSaveExpense = () => {
    if (!selectedStudent || !expenseAmount) return;
    
    const student = students.find(s => s.id.toString() === selectedStudent);
    if (!student) return;

    const newExpense: ExpenseRecord = {
      id: Date.now(),
      halaqah: selectedHalaqah,
      nama: student.name,
      tanggal: selectedDate,
      jumlah: parseInt(expenseAmount),
      kategori: expenseCategory,
      catatan: expenseNotes,
    };
    
    addExpenseRecord(newExpense);

    // Reset form
    setExpenseAmount('');
    setExpenseCategory('');
    setExpenseNotes('');
  };

  const getExpenseRecordsForWeek = () => {
    const endDate = new Date(selectedDate);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);
    
    const weekDates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      weekDates.push(new Date(d).toISOString().split('T')[0]);
    }
    
    const studentExpenses = expenseRecords.filter(record => 
      (!selectedStudent || record.nama === students.find(s => s.id.toString() === selectedStudent)?.name) &&
      weekDates.includes(record.tanggal)
    );
    
    return { weekDates, studentExpenses };
  };

  const { weekDates, studentExpenses } = getExpenseRecordsForWeek();

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

  const handleEditExpense = (expense: ExpenseRecord) => {
    setEditingExpense(expense);
    setIsEditExpenseModalOpen(true);
  };

  const handleUpdateExpense = (updatedExpense: ExpenseRecord) => {
    updateExpenseRecord(updatedExpense);
    toast({
      title: "Berhasil",
      description: "Data pengeluaran telah diperbarui",
    });
  };

  const handleDeleteExpense = (id: number) => {
    deleteExpenseRecord(id);
    toast({
      title: "Berhasil",
      description: "Data pengeluaran telah dihapus",
    });
  };

  return (
    <>
      <GatekeeperModal 
        isOpen={!hasAccess}
        onAccessGranted={() => setHasAccess(true)}
        pageName="Finance"
      />
      
      {hasAccess && (
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Keuangan</h1>
            <p className="text-gray-600">Kelola data keuangan santri mingguan secara teratur</p>
          </div>

          {/* Filters - Only appears once */}
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
              {registeredHalaqahs.map(halaqah => (
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

          {/* Input Section - Only appears once */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                Input Pengeluaran - {selectedStudent ? students.find(s => s.id.toString() === selectedStudent)?.name : 'Pilih Santri'}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Pengeluaran
                  </label>
                  <input
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="Masukkan jumlah..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih kategori</option>
                    <option value="Makan">Makan</option>
                    <option value="Transport">Transport</option>
                    <option value="Pribadi">Pribadi</option>
                    <option value="Kesehatan">Kesehatan</option>
                    <option value="Pendidikan">Pendidikan</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (opsional)
                </label>
                <textarea
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  placeholder="Masukkan catatan..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Jumlah: {expenseAmount ? formatCurrency(parseInt(expenseAmount)) : 'Rp 0'}
                  </div>
                  <button 
                    onClick={handleSaveExpense}
                    disabled={!selectedStudent || !expenseAmount}
                    className="bg-[#5db3d2] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#4a9ab8] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Save Expense
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Expense Table - Only appears once */}
          {studentExpenses.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                  Riwayat Pengeluaran - 7 Hari Terakhir
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
                        const dayExpenses = studentExpenses.filter(e => e.tanggal === date);
                        const totalAmount = dayExpenses.reduce((sum, e) => sum + e.jumlah, 0);
                        return (
                          <td key={date} className="px-4 py-3 text-center">
                            {dayExpenses.length > 0 ? (
                              <div className="flex flex-col items-center">
                                <span className="text-sm font-medium text-green-600">
                                  {formatCurrencyShort(totalAmount)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {dayExpenses.length} item{dayExpenses.length > 1 ? 's' : ''}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-300">-</span>
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

          {/* Expense History Detail Section - Only appears once */}
          {expenseRecords.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                  Rincian Riwayat Pengeluaran
                </h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Jumlah Pengeluaran</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Catatan</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenseRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {new Date(record.tanggal).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="font-medium">{record.nama}</TableCell>
                        <TableCell>{formatCurrency(record.jumlah)}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {record.kategori}
                          </span>
                        </TableCell>
                        <TableCell>{record.catatan || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditExpense(record)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(record.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Summary Table - Only appears once */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Santri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget Harian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget Mingguan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pengeluaran Minggu Ini
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Persentase
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentsFinance.map((finance) => (
                    <tr key={finance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {finance.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatCurrency(finance.budgetHarian)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatCurrency(finance.budgetMingguan)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatCurrency(finance.pengeluaranMingguIni)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className={`font-medium ${
                            finance.persentase > 100 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {finance.persentase}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          finance.status === 'hemat' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {finance.statusText}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Finance Section */}
          <FinanceMonthlySection 
            expenseRecords={expenseRecords}
            selectedStudent={selectedStudent}
            students={students}
          />
          
          {/* Semester Finance Section */}
          <FinanceSemesterSection 
            expenseRecords={expenseRecords}
            selectedStudent={selectedStudent}
            students={students}
          />

          {/* Finance Leaderboard */}
          <LeaderboardFinance expenseRecords={expenseRecords} />

          {/* Edit Expense Modal */}
          {editingExpense && (
            <EditExpenseModal
              isOpen={isEditExpenseModalOpen}
              onClose={() => {
                setIsEditExpenseModalOpen(false);
                setEditingExpense(null);
              }}
              expense={editingExpense}
              onSave={handleUpdateExpense}
            />
          )}
        </div>
      )}
    </>
  );
};

export default Finance;
