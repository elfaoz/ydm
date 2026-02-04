import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SurahDetail {
  surahName: string;
  ayahFrom: number;
  ayahTo: number;
}

export interface MemorizationDetail {
  juz: number;
  pageFrom: number;
  pageTo: number;
  surahDetails: SurahDetail[];
}

export interface MemorizationRecord {
  id: string;
  studentName: string;
  date: string;
  target: number;
  actual: number;
  percentage: number;
  status: string;
  memorizationDetail?: MemorizationDetail;
  halaqah?: string;
  level?: string;
  pembina?: string;
}

interface MemorizationContextType {
  memorizationRecords: MemorizationRecord[];
  addMemorizationRecord: (record: MemorizationRecord) => void;
  updateMemorizationRecord: (id: string, record: MemorizationRecord) => void;
  deleteMemorizationRecord: (id: string) => void;
}

const MemorizationContext = createContext<MemorizationContextType | undefined>(undefined);

export const MemorizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [memorizationRecords, setMemorizationRecords] = useState<MemorizationRecord[]>(() => {
    const stored = localStorage.getItem('memorizationRecords');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('memorizationRecords', JSON.stringify(memorizationRecords));
  }, [memorizationRecords]);

  const addMemorizationRecord = (record: MemorizationRecord) => {
    setMemorizationRecords(prev => [...prev, record]);
  };

  const updateMemorizationRecord = (id: string, record: MemorizationRecord) => {
    setMemorizationRecords(prev =>
      prev.map(r => (r.id === id ? record : r))
    );
  };

  const deleteMemorizationRecord = (id: string) => {
    setMemorizationRecords(prev => prev.filter(r => r.id !== id));
  };

  return (
    <MemorizationContext.Provider
      value={{
        memorizationRecords,
        addMemorizationRecord,
        updateMemorizationRecord,
        deleteMemorizationRecord,
      }}
    >
      {children}
    </MemorizationContext.Provider>
  );
};

export const useMemorization = () => {
  const context = useContext(MemorizationContext);
  if (!context) {
    throw new Error('useMemorization must be used within a MemorizationProvider');
  }
  return context;
};
