import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useStudents } from '@/contexts/StudentContext';
import { useHalaqahs } from '@/contexts/HalaqahContext';
import { X } from 'lucide-react';

interface Halaqah {
  id: number;
  name: string;
  membersCount: number;
  level: string;
  pembina: string;
  selectedStudents?: string[];
}

interface EditHalaqahModalProps {
  isOpen: boolean;
  onClose: () => void;
  halaqah: Halaqah | null;
  onSave: (updatedHalaqah: Halaqah) => void;
}

const EditHalaqahModal: React.FC<EditHalaqahModalProps> = ({
  isOpen,
  onClose,
  halaqah,
  onSave
}) => {
  const { students } = useStudents();
  const { halaqahs } = useHalaqahs();
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    pembina: ''
  });
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (halaqah) {
      setFormData({
        name: halaqah.name,
        level: halaqah.level,
        pembina: halaqah.pembina
      });
      setSelectedStudents(halaqah.selectedStudents || []);
    }
  }, [halaqah]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setValidationError('');
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => {
      const isRemoving = prev.includes(studentId);
      
      if (isRemoving) {
        // Allow removal
        setValidationError('');
        return prev.filter(id => id !== studentId);
      } else {
        // Check if student is already in another halaqah
        const studentInOtherHalaqah = halaqahs.find(h => 
          h.id !== halaqah?.id && 
          h.selectedStudents?.includes(studentId)
        );
        
        if (studentInOtherHalaqah) {
          setValidationError(`Santri sudah terdaftar di ${studentInOtherHalaqah.name}. Satu santri hanya bisa di satu halaqah.`);
          return prev;
        }
        
        setValidationError('');
        return [...prev, studentId];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedStudents.length === 0) {
      setValidationError('Pilih minimal satu santri sebagai anggota halaqah.');
      return;
    }

    if (!halaqah) return;

    const updatedHalaqah: Halaqah = {
      ...halaqah,
      name: formData.name,
      membersCount: selectedStudents.length,
      level: formData.level,
      pembina: formData.pembina,
      selectedStudents: selectedStudents
    };

    onSave(updatedHalaqah);
    onClose();
  };

  const handleClose = () => {
    setValidationError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            Edit Halaqah
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Halaqah Name */}
            <div className="space-y-2">
              <Label htmlFor="editHalaqahName">Halaqah Name</Label>
              <Input
                id="editHalaqahName"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Masukkan nama halaqah"
                required
              />
            </div>


            {/* Level */}
            <div className="space-y-2">
              <Label htmlFor="editLevel">Level</Label>
              <Select 
                value={formData.level} 
                onValueChange={(value) => handleInputChange('level', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tahsin (2 Juz : Juz 30 dan Juz 29 atau Juz 1)">Tahsin (2 Juz : Juz 30 dan Juz 29 atau Juz 1)</SelectItem>
                  <SelectItem value="Tahfizh 1 (5 Juz)">Tahfizh 1 (5 Juz)</SelectItem>
                  <SelectItem value="Tahfizh 2 (10 Juz)">Tahfizh 2 (10 Juz)</SelectItem>
                  <SelectItem value="Tahfizh Kamil (30 Juz)">Tahfizh Kamil (30 Juz)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pembina Halaqah */}
            <div className="space-y-2">
              <Label htmlFor="editPembina">Pembina Halaqah</Label>
              <Input
                id="editPembina"
                type="text"
                value={formData.pembina}
                onChange={(e) => handleInputChange('pembina', e.target.value)}
                placeholder="Masukkan nama pembina"
                required
              />
            </div>
          </div>

          {/* Student Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Pilih Santri ({selectedStudents.length} dipilih)
              </Label>
              {validationError && (
                <span className="text-sm text-red-600">{validationError}</span>
              )}
            </div>
            
            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
              {students.length === 0 ? (
                <p className="text-gray-500 text-sm">Belum ada santri terdaftar</p>
              ) : (
                <div className="space-y-3">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`student-${student.id}`}
                        checked={selectedStudents.includes(student.id.toString())}
                        onCheckedChange={() => handleStudentToggle(student.id.toString())}
                      />
                      <label
                        htmlFor={`student-${student.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        {student.name} - {student.studentId}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Students Display */}
          {selectedStudents.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Santri Terpilih:</Label>
              <div className="flex flex-wrap gap-2">
                {selectedStudents.map((studentId) => {
                  const student = students.find(s => s.id.toString() === studentId);
                  return student ? (
                    <div
                      key={studentId}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {student.name}
                      <button
                        type="button"
                        onClick={() => handleStudentToggle(studentId)}
                        className="hover:bg-blue-200 rounded-full p-1"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditHalaqahModal;