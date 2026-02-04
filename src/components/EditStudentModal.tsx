import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Student {
  id: number;
  studentId?: string;
  name: string;
  gender?: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  fatherName?: string;
  motherName?: string;
  registrationPeriod?: string;
  class: string;
  level: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  period: string;
}

interface EditStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onSave: (student: Student) => void;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({
  open,
  onOpenChange,
  student,
  onSave
}) => {
  const [formData, setFormData] = useState<Student>({
    id: 0,
    studentId: '',
    name: '',
    gender: '',
    placeOfBirth: '',
    dateOfBirth: '',
    fatherName: '',
    motherName: '',
    registrationPeriod: '',
    class: '',
    level: '',
    email: '',
    phoneNumber: '',
    address: '',
    period: ''
  });

  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        studentId: student.studentId || '',
        gender: student.gender || '',
        placeOfBirth: student.placeOfBirth || '',
        dateOfBirth: student.dateOfBirth || '',
        fatherName: student.fatherName || '',
        motherName: student.motherName || '',
        registrationPeriod: student.registrationPeriod || student.period,
        email: student.email || '',
        phoneNumber: student.phoneNumber || '',
        address: student.address || ''
      });
    }
  }, [student]);

  const handleInputChange = (field: keyof Student, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            Edit Student Information
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student ID */}
            <div className="space-y-2">
              <Label htmlFor="edit-studentId">Nomor Induk</Label>
              <Input
                id="edit-studentId"
                type="text"
                value={formData.studentId}
                onChange={(e) => handleInputChange('studentId', e.target.value)}
                placeholder="Masukkan nomor induk"
                className="w-full"
              />
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-fullName">Nama Lengkap</Label>
              <Input
                id="edit-fullName"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full"
                required
              />
            </div>

            {/* Jenis Kelamin */}
            <div className="space-y-2">
              <Label htmlFor="edit-gender">Jenis Kelamin</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Place of Birth */}
            <div className="space-y-2">
              <Label htmlFor="edit-placeOfBirth">Place of Birth</Label>
              <Input
                id="edit-placeOfBirth"
                type="text"
                value={formData.placeOfBirth}
                onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
                placeholder="Masukkan tempat lahir"
                className="w-full"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
              <Input
                id="edit-dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Father's Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-fatherName">Father's Name</Label>
              <Input
                id="edit-fatherName"
                type="text"
                value={formData.fatherName}
                onChange={(e) => handleInputChange('fatherName', e.target.value)}
                placeholder="Masukkan nama ayah"
                className="w-full"
              />
            </div>

            {/* Mother's Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-motherName">Mother's Name</Label>
              <Input
                id="edit-motherName"
                type="text"
                value={formData.motherName}
                onChange={(e) => handleInputChange('motherName', e.target.value)}
                placeholder="Masukkan nama ibu"
                className="w-full"
              />
            </div>

            {/* Registration Period */}
            <div className="space-y-2">
              <Label htmlFor="edit-registrationPeriod">Registration Period</Label>
              <Input
                id="edit-registrationPeriod"
                type="text"
                value={formData.registrationPeriod}
                onChange={(e) => handleInputChange('registrationPeriod', e.target.value)}
                placeholder="e.g., 2025-2026"
                className="w-full"
              />
            </div>

            {/* Class */}
            <div className="space-y-2">
              <Label htmlFor="edit-class">Class</Label>
              <Select value={formData.class} onValueChange={(value) => handleInputChange('class', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="7">7</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="9">9</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="11">11</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="Umum">Umum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Jenjang */}
            <div className="space-y-2">
              <Label htmlFor="edit-level">Jenjang</Label>
              <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih jenjang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SD">SD</SelectItem>
                  <SelectItem value="SMP">SMP</SelectItem>
                  <SelectItem value="SMA">SMA</SelectItem>
                  <SelectItem value="Mahasiswa">Mahasiswa</SelectItem>
                  <SelectItem value="Umum">Umum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Masukkan email"
                className="w-full"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="edit-phoneNumber">Phone Number</Label>
              <Input
                id="edit-phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="Masukkan nomor telepon"
                className="w-full"
              />
            </div>
          </div>

          {/* Address - Full width */}
          <div className="space-y-2">
            <Label htmlFor="edit-address">Address</Label>
            <Input
              id="edit-address"
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Masukkan alamat lengkap"
              className="w-full"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStudentModal;