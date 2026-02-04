
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { surahs, getSurahByName, calculateMemorizationStatus } from '@/utils/surahData';
import { getJuzData } from '@/utils/juzData';
import { MemorizationRecord, MemorizationDetail, SurahDetail } from '@/contexts/MemorizationContext';
import { useStudents } from '@/contexts/StudentContext';
import { useHalaqahs } from '@/contexts/HalaqahContext';

interface InputMemorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: Omit<MemorizationRecord, 'id'>) => void;
}

interface FormData {
  studentName: string;
  date: string;
  target: number;
  actual: number;
  juz: number;
  pageFrom: number;
  pageTo: number;
  surahName: string;
  ayahFrom: number;
  ayahTo: number;
}

const InputMemorizationModal: React.FC<InputMemorizationModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { students } = useStudents();
  const { halaqahs } = useHalaqahs();
  const [selectedSurah, setSelectedSurah] = useState<string>('');
  const [maxAyah, setMaxAyah] = useState<number>(1);
  const [validationError, setValidationError] = useState<string>('');
  const [selectedJuz, setSelectedJuz] = useState<number>(1);

  // Group students by their halaqahs
  const getStudentsByHalaqah = () => {
    const grouped: Record<string, Array<{ id: string; name: string }>> = {};
    
    halaqahs.forEach(halaqah => {
      if (halaqah.selectedStudents?.length) {
        const halaqahStudents = students.filter(student => 
          halaqah.selectedStudents?.includes(student.id.toString())
        ).map(student => ({
          id: student.id.toString(),
          name: student.name
        }));
        
        if (halaqahStudents.length > 0) {
          grouped[halaqah.name] = halaqahStudents;
        }
      }
    });
    
    return grouped;
  };

  const studentsByHalaqah = getStudentsByHalaqah();

  const form = useForm<FormData>({
    defaultValues: {
      studentName: '',
      date: new Date().toISOString().split('T')[0],
      target: 2,
      actual: 0,
      juz: 1,
      pageFrom: 1,
      pageTo: 1,
      surahName: '',
      ayahFrom: 1,
      ayahTo: 1
    }
  });

  // Auto-populate Surah and Ayah based on selected Juz
  useEffect(() => {
    const juzData = getJuzData(selectedJuz);
    if (juzData && juzData.ranges.length > 0 && juzData.ranges[0]) {
      form.setValue('surahName', juzData.ranges[0].surahName);
      form.setValue('ayahFrom', juzData.ranges[0].ayahFrom);
      form.setValue('ayahTo', juzData.ranges[0].ayahTo);
      setSelectedSurah(juzData.ranges[0].surahName);
    }
  }, [selectedJuz, form]);

  useEffect(() => {
    if (selectedSurah) {
      const surah = getSurahByName(selectedSurah);
      if (surah) {
        setMaxAyah(surah.verses);
      }
    }
  }, [selectedSurah]);

  const onFormSubmit = (data: FormData) => {
    // Validation: Actual should not exceed Target
    if (data.actual > data.target) {
      setValidationError('Actual achievement cannot exceed the target!');
      return;
    }

    // Validation: Page and Ayah ranges
    if (data.pageFrom > data.pageTo) {
      setValidationError('Page "From" cannot be greater than "To"');
      return;
    }

    if (data.ayahFrom > data.ayahTo) {
      setValidationError('Ayah "From" cannot be greater than "To"');
      return;
    }

    const percentage = Math.min((data.actual / data.target) * 100, 100);
    const { status } = calculateMemorizationStatus(data.actual, data.target);

    const surahDetails: SurahDetail[] = [];
    if (data.surahName && data.ayahFrom && data.ayahTo) {
      surahDetails.push({
        surahName: data.surahName,
        ayahFrom: data.ayahFrom,
        ayahTo: data.ayahTo,
      });
    }

    const memorizationDetail: MemorizationDetail = {
      juz: data.juz,
      pageFrom: data.pageFrom,
      pageTo: data.pageTo,
      surahDetails,
    };

    const newRecord: Omit<MemorizationRecord, 'id'> = {
      studentName: data.studentName,
      date: data.date,
      target: data.target,
      actual: data.actual,
      percentage: Math.round(percentage),
      status,
      memorizationDetail
    };

    onSubmit(newRecord);
    form.reset();
    setValidationError('');
    setSelectedSurah('');
    onClose();
  };

  const handleClose = () => {
    form.reset();
    setValidationError('');
    setSelectedSurah('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Input Hafalan (Memorization)</DialogTitle>
        </DialogHeader>

        {validationError && (
          <Alert className="mb-4 border-destructive/50 bg-destructive/10">
            <AlertDescription className="text-destructive">
              {validationError}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="studentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose Santri</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select student..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-64 bg-background border shadow-lg z-50 overflow-y-auto">
                      {Object.entries(studentsByHalaqah).length > 0 ? (
                        Object.entries(studentsByHalaqah).map(([halaqah, students]) => (
                          <div key={halaqah}>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted sticky top-0 z-10">
                              {halaqah}
                            </div>
                            {students.map((student) => (
                              <SelectItem 
                                key={student.id} 
                                value={student.name}
                                className="cursor-pointer pl-6"
                              >
                                {student.name}
                              </SelectItem>
                            ))}
                          </div>
                        ))
                      ) : (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          Belum ada halaqah dengan santri terdaftar
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <input
                        type="date"
                        {...field}
                        className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target (pages)</FormLabel>
                    <FormControl>
                      <input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        min="1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="actual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Actual Page</FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      min="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="juz"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Juz</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      const juzNum = parseInt(value);
                      field.onChange(juzNum);
                      setSelectedJuz(juzNum);
                    }} 
                    defaultValue="1"
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select Juz" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60 bg-background border shadow-lg z-50">
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                        <SelectItem key={juz} value={juz.toString()} className="cursor-pointer">
                          Juz {juz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pageFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page From</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue="1">
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="From" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 bg-background border shadow-lg z-50">
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((page) => (
                          <SelectItem key={page} value={page.toString()} className="cursor-pointer">
                            {page}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pageTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page To</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue="1">
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="To" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 bg-background border shadow-lg z-50">
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((page) => (
                          <SelectItem key={page} value={page.toString()} className="cursor-pointer">
                            {page}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Surah */}
            <div className="border-t pt-4 mt-2">
              <h3 className="font-semibold text-sm mb-3">Nama Surat</h3>
              <FormField
                control={form.control}
                name="surahName"
                render={({ field }) => {
                  const juzData = getJuzData(selectedJuz);
                  const availableSurahs = juzData?.ranges.map(r => r.surahName) || [];
                  return (
                    <FormItem>
                      <FormLabel>Surah Name</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedSurah(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select Surah" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60 bg-background border shadow-lg z-50">
                          {surahs.filter(s => availableSurahs.includes(s.name)).map((surah) => (
                            <SelectItem key={surah.number} value={surah.name} className="cursor-pointer">
                              {surah.number}. {surah.name} ({surah.arabicName})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <div className="grid grid-cols-2 gap-4 mt-3">
                <FormField
                  control={form.control}
                  name="ayahFrom"
                  render={({ field }) => {
                    const juzData = getJuzData(selectedJuz);
                    const surahRange = juzData?.ranges.find(r => r.surahName === selectedSurah);
                    const minAyah = surahRange?.ayahFrom || 1;
                    const maxAyahForJuz = surahRange?.ayahTo || maxAyah;
                    return (
                      <FormItem>
                        <FormLabel>Ayat Dari</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          value={field.value?.toString()}
                          disabled={!selectedSurah}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Dari" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 bg-background border shadow-lg z-50">
                            {Array.from({ length: maxAyahForJuz - minAyah + 1 }, (_, i) => minAyah + i).map((ayah) => (
                              <SelectItem key={ayah} value={ayah.toString()} className="cursor-pointer">
                                {ayah}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="ayahTo"
                  render={({ field }) => {
                    const juzData = getJuzData(selectedJuz);
                    const surahRange = juzData?.ranges.find(r => r.surahName === selectedSurah);
                    const minAyah = surahRange?.ayahFrom || 1;
                    const maxAyahForJuz = surahRange?.ayahTo || maxAyah;
                    return (
                      <FormItem>
                        <FormLabel>Ayat Sampai</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          value={field.value?.toString()}
                          disabled={!selectedSurah}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Sampai" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 bg-background border shadow-lg z-50">
                            {Array.from({ length: maxAyahForJuz - minAyah + 1 }, (_, i) => minAyah + i).map((ayah) => (
                              <SelectItem key={ayah} value={ayah.toString()} className="cursor-pointer">
                                {ayah}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                Simpan Hafalan
              </Button>
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Batal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InputMemorizationModal;
