import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudents, Student } from '@/contexts/StudentContext';
import { useHalaqahs } from '@/contexts/HalaqahContext';
import { Camera, Edit, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StudentIDCard from './StudentIDCard';

interface SchoolData {
  schoolName: string;
  schoolLogo: string;
  schoolAddress: string;
}

const programOptions = [
  { id: 'tahfizh-kamil', name: 'Tahfizh Kamil', gradient: 'from-emerald-600 via-emerald-500 to-teal-400' },
  { id: 'tahfizh-1', name: 'Tahfizh 1', gradient: 'from-blue-600 via-blue-500 to-cyan-400' },
  { id: 'tahfizh-2', name: 'Tahfizh 2', gradient: 'from-purple-600 via-purple-500 to-pink-400' },
  { id: 'tahsin', name: 'Tahsin', gradient: 'from-amber-600 via-amber-500 to-yellow-400' },
];

const StudentProfileTab: React.FC = () => {
  const { students, updateStudent, updateStudentPhoto } = useStudents();
  const { halaqahs } = useHalaqahs();
  
  // Get school data from localStorage
  const [schoolData, setSchoolData] = useState<SchoolData>({ 
    schoolName: '', 
    schoolLogo: '',
    schoolAddress: '' 
  });
  
  useEffect(() => {
    const saved = localStorage.getItem('profile_data');
    if (saved) {
      const data = JSON.parse(saved);
      setSchoolData({
        schoolName: data.schoolName || 'Nama Sekolah',
        schoolLogo: data.schoolLogo || '',
        schoolAddress: data.schoolAddress || 'Alamat Sekolah'
      });
    }
  }, []);
  
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Student | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter students by program
  const getStudentsByProgram = (programId: string) => {
    if (programId === 'all') return students;
    return students.filter(student => student.program === programId);
  };

  const filteredStudents = getStudentsByProgram(selectedProgram);
  const selectedStudent = students.find(s => s.id.toString() === selectedStudentId);
  const studentProgram = selectedStudent?.program || 'tahfizh-kamil';
  const currentProgram = programOptions.find(p => p.id === studentProgram) || programOptions[0];

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedStudent) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = reader.result as string;
        updateStudentPhoto(selectedStudent.id, photoData);
        toast.success('Foto berhasil diupload');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProfile = () => {
    if (selectedStudent) {
      setEditFormData({ ...selectedStudent, program: selectedProgram });
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = () => {
    if (editFormData) {
      updateStudent(editFormData);
      if (editFormData.program) {
        setSelectedProgram(editFormData.program);
      }
      setIsEditModalOpen(false);
      toast.success('Profil berhasil diperbarui');
    }
  };

  // When selecting a student, load their program
  useEffect(() => {
    if (selectedStudent?.program) {
      setSelectedProgram(selectedStudent.program);
    }
  }, [selectedStudent]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="shadow-sm border border-gray-100">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 py-4">
          <CardTitle className="text-lg font-semibold text-gray-800">Filter Santri</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pilih Program</Label>
              <Select 
                value={selectedProgram} 
                onValueChange={(value) => {
                  setSelectedProgram(value);
                  setSelectedStudentId('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Program</SelectItem>
                  {programOptions.map(program => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Pilih Santri</Label>
              <Select 
                value={selectedStudentId} 
                onValueChange={setSelectedStudentId}
                disabled={filteredStudents.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Santri" />
                </SelectTrigger>
                <SelectContent>
                  {filteredStudents.map(student => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedStudent ? (
        <>
          {/* Student Profile with Dynamic Header */}
          <Card className="shadow-sm border border-gray-100 overflow-hidden">
            {/* Dynamic Header based on program */}
            <div className={`relative bg-gradient-to-r ${currentProgram.gradient} px-6 py-6`}>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Avatar with upload overlay */}
                <div className="relative group">
                  <Avatar className="w-24 h-24 border-4 border-white/30 shadow-lg">
                    <AvatarImage src={selectedStudent.photo} alt={selectedStudent.name} />
                    <AvatarFallback className="bg-white/20 text-white text-2xl">
                      <User size={40} />
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Name and Program */}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{selectedStudent.name}</h2>
                  <p className="text-white/80 text-sm sm:text-base">{currentProgram.name}</p>
                </div>

                {/* Edit button */}
                <Button 
                  onClick={handleEditProfile}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white flex items-center gap-2"
                >
                  <Edit size={16} />
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Profile Data - Horizontal Layout */}
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center py-2 border-b border-gray-100">
                  <span className="w-36 text-sm text-gray-500 flex-shrink-0">Nama Lengkap</span>
                  <span className="font-medium text-gray-800">: {selectedStudent.name}</span>
                </div>
                <div className="flex items-center py-2 border-b border-gray-100">
                  <span className="w-36 text-sm text-gray-500 flex-shrink-0">Nomor Induk</span>
                  <span className="font-medium text-gray-800">: {selectedStudent.studentId}</span>
                </div>
                <div className="flex items-center py-2 border-b border-gray-100">
                  <span className="w-36 text-sm text-gray-500 flex-shrink-0">NIK</span>
                  <span className="font-medium text-gray-800">: {selectedStudent.nik || '-'}</span>
                </div>
                <div className="flex items-center py-2 border-b border-gray-100">
                  <span className="w-36 text-sm text-gray-500 flex-shrink-0">Jenis Kelamin</span>
                  <span className="font-medium text-gray-800">: {selectedStudent.gender}</span>
                </div>
                <div className="flex items-center py-2 border-b border-gray-100">
                  <span className="w-36 text-sm text-gray-500 flex-shrink-0">Tempat Lahir</span>
                  <span className="font-medium text-gray-800">: {selectedStudent.placeOfBirth}</span>
                </div>
                <div className="flex items-center py-2 border-b border-gray-100">
                  <span className="w-36 text-sm text-gray-500 flex-shrink-0">Tanggal Lahir</span>
                  <span className="font-medium text-gray-800">: {selectedStudent.dateOfBirth}</span>
                </div>
                <div className="flex items-center py-2 border-b border-gray-100">
                  <span className="w-36 text-sm text-gray-500 flex-shrink-0">Nama Ayah</span>
                  <span className="font-medium text-gray-800">: {selectedStudent.fatherName}</span>
                </div>
                <div className="flex items-center py-2 border-b border-gray-100">
                  <span className="w-36 text-sm text-gray-500 flex-shrink-0">Nama Ibu</span>
                  <span className="font-medium text-gray-800">: {selectedStudent.motherName}</span>
                </div>
                <div className="flex items-center py-2 border-b border-gray-100">
                  <span className="w-36 text-sm text-gray-500 flex-shrink-0">Kelas</span>
                  <span className="font-medium text-gray-800">: {selectedStudent.class}</span>
                </div>
                <div className="flex items-center py-2 border-b border-gray-100">
                  <span className="w-36 text-sm text-gray-500 flex-shrink-0">Jenjang</span>
                  <span className="font-medium text-gray-800">: {selectedStudent.level}</span>
                </div>
                <div className="flex items-center py-2 border-b border-gray-100">
                  <span className="w-36 text-sm text-gray-500 flex-shrink-0">Periode</span>
                  <span className="font-medium text-gray-800">: {selectedStudent.period}</span>
                </div>
                <div className="flex items-center py-2 border-b border-gray-100">
                  <span className="w-36 text-sm text-gray-500 flex-shrink-0">Email</span>
                  <span className="font-medium text-gray-800">: {selectedStudent.email}</span>
                </div>
                <div className="flex items-center py-2 border-b border-gray-100">
                  <span className="w-36 text-sm text-gray-500 flex-shrink-0">No. Telepon</span>
                  <span className="font-medium text-gray-800">: {selectedStudent.phoneNumber}</span>
                </div>
                <div className="flex items-center py-2 border-b border-gray-100 md:col-span-2">
                  <span className="w-36 text-sm text-gray-500 flex-shrink-0">Alamat</span>
                  <span className="font-medium text-gray-800">: {selectedStudent.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student ID Card */}
          <StudentIDCard
            student={selectedStudent}
            schoolName={schoolData.schoolName}
            schoolAddress={schoolData.schoolAddress}
            schoolLogo={schoolData.schoolLogo}
            programId={studentProgram}
            programName={currentProgram.name}
          />
        </>
      ) : (
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-12 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Pilih santri untuk melihat profil dan kartu identitas</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profil Santri</DialogTitle>
          </DialogHeader>
          {editFormData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-studentId">Nomor Induk</Label>
                <Input
                  id="edit-studentId"
                  value={editFormData.studentId}
                  onChange={(e) => setEditFormData({ ...editFormData, studentId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nama Lengkap</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nik">NIK</Label>
                <Input
                  id="edit-nik"
                  value={editFormData.nik || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, nik: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-gender">Jenis Kelamin</Label>
                <Select 
                  value={editFormData.gender} 
                  onValueChange={(value) => setEditFormData({ ...editFormData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-placeOfBirth">Tempat Lahir</Label>
                <Input
                  id="edit-placeOfBirth"
                  value={editFormData.placeOfBirth}
                  onChange={(e) => setEditFormData({ ...editFormData, placeOfBirth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dateOfBirth">Tanggal Lahir</Label>
                <Input
                  id="edit-dateOfBirth"
                  type="date"
                  value={editFormData.dateOfBirth}
                  onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fatherName">Nama Ayah</Label>
                <Input
                  id="edit-fatherName"
                  value={editFormData.fatherName}
                  onChange={(e) => setEditFormData({ ...editFormData, fatherName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-motherName">Nama Ibu</Label>
                <Input
                  id="edit-motherName"
                  value={editFormData.motherName}
                  onChange={(e) => setEditFormData({ ...editFormData, motherName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-class">Kelas</Label>
                <Select 
                  value={editFormData.class} 
                  onValueChange={(value) => setEditFormData({ ...editFormData, class: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['1','2','3','4','5','6','7','8','9','10','11','12','Umum'].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-level">Jenjang</Label>
                <Select 
                  value={editFormData.level} 
                  onValueChange={(value) => setEditFormData({ ...editFormData, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['SD','SMP','SMA','Mahasiswa','Umum'].map(l => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-program">Program</Label>
                <Select 
                  value={editFormData.program || 'tahfizh-kamil'} 
                  onValueChange={(value) => setEditFormData({ ...editFormData, program: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {programOptions.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-period">Periode</Label>
                <Input
                  id="edit-period"
                  value={editFormData.period}
                  onChange={(e) => setEditFormData({ ...editFormData, period: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phoneNumber">No. Telepon</Label>
                <Input
                  id="edit-phoneNumber"
                  value={editFormData.phoneNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-address">Alamat</Label>
                <Input
                  id="edit-address"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
            <Button onClick={handleSaveEdit} className="bg-[#5db3d2] hover:bg-[#4a9ab8] text-white">
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentProfileTab;