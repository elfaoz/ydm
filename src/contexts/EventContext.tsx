import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface EventProgram {
  id: string;
  title: string;
  date: Date;
  status: 'upcoming' | 'completed' | 'canceled';
}

interface EventContextType {
  events: EventProgram[];
  addEvent: (event: Omit<EventProgram, 'id'>) => void;
  updateEvent: (id: string, event: Partial<EventProgram>) => void;
  deleteEvent: (id: string) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<EventProgram[]>(() => {
    const saved = localStorage.getItem('kdm_events');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((e: any) => ({ ...e, date: new Date(e.date) }));
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('kdm_events', JSON.stringify(events));
  }, [events]);

  const addEvent = (event: Omit<EventProgram, 'id'>) => {
    const newEvent: EventProgram = {
      ...event,
      id: Date.now().toString(),
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: string, updates: Partial<EventProgram>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  return (
    <EventContext.Provider value={{ events, addEvent, updateEvent, deleteEvent }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
