import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns';
import { id, enUS } from 'date-fns/locale';
import { useEvents } from '@/contexts/EventContext';
import { useLanguage } from '@/contexts/LanguageContext';

const ProgramCalendar: React.FC = () => {
  const { events } = useEvents();
  const { t, language } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const locale = language === 'id' ? id : enUS;

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get starting day of week (0 = Sunday)
  const startingDayOfWeek = getDay(monthStart);

  // Get programs for selected date
  const selectedDatePrograms = selectedDate
    ? events.filter(p => isSameDay(new Date(p.date), selectedDate))
    : [];

  // Check if a date has programs
  const hasPrograms = (date: Date) => events.some(p => isSameDay(new Date(p.date), date));

  // Get status color for calendar dot
  const getDateStatus = (date: Date) => {
    const programs = events.filter(p => isSameDay(new Date(p.date), date));
    if (programs.some(p => p.status === 'upcoming')) return 'bg-orange-500';
    if (programs.some(p => p.status === 'completed')) return 'bg-purple-500';
    if (programs.some(p => p.status === 'canceled')) return 'bg-gray-400';
    return '';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'upcoming': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'canceled': return 'bg-gray-100 border-gray-300 text-gray-600';
      default: return 'bg-muted border-border text-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return t('completed');
      case 'upcoming': return t('upcoming');
      case 'canceled': return t('canceled');
      default: return status;
    }
  };

  const dayNames = language === 'id' 
    ? ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          {t('programCalendar')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Calendar */}
          <div className="space-y-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {format(currentMonth, 'MMMM yyyy', { locale })}
              </h3>
              <div className="flex flex-col gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={handlePrevMonth}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleNextMonth}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="border rounded-lg p-3">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-9" />
                ))}

                {/* Actual days */}
                {daysInMonth.map(day => {
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());
                  const hasProg = hasPrograms(day);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        h-9 w-full rounded-md text-sm relative transition-colors
                        ${isSelected ? 'bg-[#5db3d2] text-white' : ''}
                        ${isToday && !isSelected ? 'bg-accent text-accent-foreground font-bold' : ''}
                        ${!isSelected && !isToday ? 'hover:bg-muted' : ''}
                      `}
                    >
                      {format(day, 'd')}
                      {hasProg && (
                        <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full ${getDateStatus(day)}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-purple-500" />
                <span>{t('completed')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-orange-500" />
                <span>{t('upcoming')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-gray-400" />
                <span>{t('canceled')}</span>
              </div>
            </div>
          </div>

          {/* Right: Program Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {selectedDate ? format(selectedDate, 'EEEE, d MMMM yyyy', { locale }) : t('selectDate')}
            </h3>

            {selectedDatePrograms.length > 0 ? (
              <div className="space-y-3">
                {selectedDatePrograms.map(program => (
                  <div
                    key={program.id}
                    className={`p-4 rounded-lg border-l-4 ${getStatusColor(program.status)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium">{program.title}</h4>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-background/50 whitespace-nowrap">
                        {getStatusLabel(program.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm">{t('noProgram')}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgramCalendar;
