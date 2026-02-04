import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Halaqah {
  id: number;
  name: string;
  membersCount: number;
  level: string;
  pembina: string;
  selectedStudents?: string[];
}

interface HalaqahContextType {
  halaqahs: Halaqah[];
  addHalaqah: (halaqah: Omit<Halaqah, 'id'>) => void;
  updateHalaqah: (id: number, halaqah: Partial<Halaqah>) => void;
  deleteHalaqah: (id: number) => void;
}

const HalaqahContext = createContext<HalaqahContextType | undefined>(undefined);

interface HalaqahProviderProps {
  children: ReactNode;
}

export const HalaqahProvider: React.FC<HalaqahProviderProps> = ({ children }) => {
  const [halaqahs, setHalaqahs] = useState<Halaqah[]>([]);

  const addHalaqah = (halaqahData: Omit<Halaqah, 'id'>) => {
    const newHalaqah: Halaqah = {
      ...halaqahData,
      id: Date.now(), // Use timestamp for unique ID
    };
    setHalaqahs(prev => [...prev, newHalaqah]);
  };

  const updateHalaqah = (id: number, updatedData: Partial<Halaqah>) => {
    setHalaqahs(prev =>
      prev.map(halaqah =>
        halaqah.id === id ? { ...halaqah, ...updatedData } : halaqah
      )
    );
  };

  const deleteHalaqah = (id: number) => {
    setHalaqahs(prev => prev.filter(halaqah => halaqah.id !== id));
  };

  return (
    <HalaqahContext.Provider value={{
      halaqahs,
      addHalaqah,
      updateHalaqah,
      deleteHalaqah,
    }}>
      {children}
    </HalaqahContext.Provider>
  );
};

export const useHalaqahs = () => {
  const context = useContext(HalaqahContext);
  if (context === undefined) {
    throw new Error('useHalaqahs must be used within a HalaqahProvider');
  }
  return context;
};