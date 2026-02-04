import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'hadir' | 'izin' | 'sakit' | 'tanpa keterangan' | 'pulang';
  remarks?: string;
}

interface AttendanceContextType {
  attendanceRecords: AttendanceRecord[];
  addAttendanceRecord: (record: AttendanceRecord) => void;
  updateAttendanceRecord: (record: AttendanceRecord) => void;
  deleteAttendanceRecord: (id: string) => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  const addAttendanceRecord = (record: AttendanceRecord) => {
    setAttendanceRecords(prev => {
      const existing = prev.filter(r => r.id !== record.id);
      return [...existing, record];
    });
  };

  const updateAttendanceRecord = (record: AttendanceRecord) => {
    setAttendanceRecords(prev =>
      prev.map(r => (r.id === record.id ? record : r))
    );
  };

  const deleteAttendanceRecord = (id: string) => {
    setAttendanceRecords(prev => prev.filter(r => r.id !== id));
  };

  return (
    <AttendanceContext.Provider
      value={{
        attendanceRecords,
        addAttendanceRecord,
        updateAttendanceRecord,
        deleteAttendanceRecord,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within AttendanceProvider');
  }
  return context;
};
