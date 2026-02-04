import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ActivityRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  activities: Record<string, boolean>;
}

interface ActivityContextType {
  activityRecords: ActivityRecord[];
  addActivityRecord: (record: ActivityRecord) => void;
  updateActivityRecord: (record: ActivityRecord) => void;
  deleteActivityRecord: (id: string) => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activityRecords, setActivityRecords] = useState<ActivityRecord[]>([]);

  const addActivityRecord = (record: ActivityRecord) => {
    setActivityRecords(prev => {
      const existing = prev.filter(r => r.id !== record.id);
      return [...existing, record];
    });
  };

  const updateActivityRecord = (record: ActivityRecord) => {
    setActivityRecords(prev =>
      prev.map(r => (r.id === record.id ? record : r))
    );
  };

  const deleteActivityRecord = (id: string) => {
    setActivityRecords(prev => prev.filter(r => r.id !== id));
  };

  return (
    <ActivityContext.Provider
      value={{
        activityRecords,
        addActivityRecord,
        updateActivityRecord,
        deleteActivityRecord,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within ActivityProvider');
  }
  return context;
};
