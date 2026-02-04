import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ExpenseRecord {
  id: number;
  halaqah: string;
  nama: string;
  tanggal: string;
  jumlah: number;
  kategori: string;
  catatan: string;
}

interface FinanceContextType {
  expenseRecords: ExpenseRecord[];
  addExpenseRecord: (record: ExpenseRecord) => void;
  updateExpenseRecord: (record: ExpenseRecord) => void;
  deleteExpenseRecord: (id: number) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>([]);

  const addExpenseRecord = (record: ExpenseRecord) => {
    setExpenseRecords(prev => [...prev, record]);
  };

  const updateExpenseRecord = (record: ExpenseRecord) => {
    setExpenseRecords(prev =>
      prev.map(r => (r.id === record.id ? record : r))
    );
  };

  const deleteExpenseRecord = (id: number) => {
    setExpenseRecords(prev => prev.filter(r => r.id !== id));
  };

  return (
    <FinanceContext.Provider
      value={{
        expenseRecords,
        addExpenseRecord,
        updateExpenseRecord,
        deleteExpenseRecord,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
};
