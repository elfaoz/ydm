import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { surahs, getSurahByName } from '@/utils/surahData';
import { getJuzData } from '@/utils/juzData';
import { MemorizationRecord, MemorizationDetail, SurahDetail } from '@/contexts/MemorizationContext';

interface EditMemorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: MemorizationRecord) => void;
  record: MemorizationRecord | null;
}

interface FormData {
  target: number;
  actual: number;
  juz: number;
  surahName: string;
  ayahFrom: number;
  ayahTo: number;
}

const EditMemorizationModal: React.FC<EditMemorizationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  record
}) => {
  const [selectedSurah, setSelectedSurah] = useState<string>('');
  const [maxAyah, setMaxAyah] = useState<number>(1);
  const [validationError, setValidationError] = useState<string>('');
  const [selectedJuz, setSelectedJuz] = useState<number>(1);

  const form = useForm<FormData>({
    defaultValues: {
      target: 0,
      actual: 0,
      juz: 1,
      surahName: '',
      ayahFrom: 1,
      ayahTo: 1,
    }
  });

  useEffect(() => {
    if (record) {
      const surahDetails = record.memorizationDetail?.surahDetails || [];
      form.reset({
        target: record.target,
        actual: record.actual,
        juz: record.memorizationDetail?.juz || 1,
        surahName: surahDetails[0]?.surahName || '',
        ayahFrom: surahDetails[0]?.ayahFrom || 1,
        ayahTo: surahDetails[0]?.ayahTo || 1,
      });
      setSelectedSurah(surahDetails[0]?.surahName || '');
      setSelectedJuz(record.memorizationDetail?.juz || 1);
    }
  }, [record, form]);

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
    if (!record) return;

    // Validation: Actual should not exceed Target
    if (data.actual > data.target) {
      setValidationError('Pencapaian aktual tidak boleh melebihi target!');
      return;
    }

    // Validation: Ayah ranges
    if (data.ayahFrom > data.ayahTo) {
      setValidationError('Ayat "Dari" tidak boleh lebih besar dari "Sampai"');
      return;
    }

    const percentage = Math.min((data.actual / data.target) * 100, 100);
    let status = 'Not Achieved';
    if (percentage === 100) status = 'Fully Achieved';
    else if (percentage >= 75) status = 'Achieved';

    // Collect surah details
    const surahDetails: SurahDetail[] = [];
    if (data.surahName && data.ayahFrom && data.ayahTo) {
      surahDetails.push({
        surahName: data.surahName,
        ayahFrom: data.ayahFrom,
        ayahTo: data.ayahTo,
      });
    }

    const updatedRecord: MemorizationRecord = {
      ...record,
      target: data.target,
      actual: data.actual,
      percentage: Math.round(percentage),
      status,
      memorizationDetail: {
        juz: data.juz,
        pageFrom: record.memorizationDetail?.pageFrom || 1,
        pageTo: data.actual,
        surahDetails,
      }
    };

    onSubmit(updatedRecord);
    setValidationError('');
    onClose();
  };

  const handleClose = () => {
    setValidationError('');
    onClose();
  };

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Hafalan</DialogTitle>
        </DialogHeader>

        {validationError && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {validationError}
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="text-sm">
            <div className="font-semibold text-gray-700">Santri: {record.studentName}</div>
            <div className="text-gray-600">Tanggal: {new Date(record.date).toLocaleDateString('id-ID')}</div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Hafalan Harian (halaman)</FormLabel>
                    <FormControl>
                      <input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pencapaian Aktual (halaman)</FormLabel>
                    <FormControl>
                      <input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="juz"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Juz Ke</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      const juzNum = parseInt(value);
                      field.onChange(juzNum);
                      setSelectedJuz(juzNum);
                    }} 
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Pilih Juz" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60 bg-white border border-gray-200 shadow-lg z-50">
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                        <SelectItem key={juz} value={juz.toString()} className="hover:bg-blue-50 focus:bg-blue-100 cursor-pointer">
                          Juz {juz}
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
              name="surahName"
              render={({ field }) => {
                const juzData = getJuzData(selectedJuz);
                const availableSurahs = juzData?.ranges.map(r => r.surahName) || [];
                return (
                  <FormItem>
                    <FormLabel>Nama Surat (1)</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedSurah(value);
                    }} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Pilih Surat" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 bg-white border border-gray-200 shadow-lg z-50">
                        {surahs.filter(s => availableSurahs.includes(s.name)).map((surah) => (
                          <SelectItem key={surah.number} value={surah.name} className="hover:bg-blue-50 focus:bg-blue-100 cursor-pointer">
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

            <div className="grid grid-cols-2 gap-4">
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
                      <FormLabel>Ayat Dari (1)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value?.toString()}
                        disabled={!selectedSurah}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Dari" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60 bg-white border border-gray-200 shadow-lg z-50">
                          {Array.from({ length: maxAyahForJuz - minAyah + 1 }, (_, i) => minAyah + i).map((ayah) => (
                            <SelectItem key={ayah} value={ayah.toString()} className="hover:bg-blue-50 focus:bg-blue-100 cursor-pointer">
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
                      <FormLabel>Ayat Sampai (1)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value?.toString()}
                        disabled={!selectedSurah}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Sampai" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60 bg-white border border-gray-200 shadow-lg z-50">
                          {Array.from({ length: maxAyahForJuz - minAyah + 1 }, (_, i) => minAyah + i).map((ayah) => (
                            <SelectItem key={ayah} value={ayah.toString()} className="hover:bg-blue-50 focus:bg-blue-100 cursor-pointer">
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


            <div className="flex space-x-3 pt-4">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                Simpan Perubahan
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

export default EditMemorizationModal;
