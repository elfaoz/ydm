import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import EditStudentModal from '@/components/EditStudentModal';
import { useStudents, Student } from '@/contexts/StudentContext';

const RegisteredStudentsTable: React.FC = () => {
  const { students, updateStudent, deleteStudent } = useStudents();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleSaveStudent = (updatedStudent: Student) => {
    updateStudent(updatedStudent);
  };

  const handleDeleteStudent = (studentId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data santri ini?')) {
      deleteStudent(studentId);
    }
  };

  return (
    <>
      <Card className="shadow-sm border border-gray-100">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">Registered Students</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-16">No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={student.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.gender}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>{student.level}</TableCell>
                    <TableCell>{student.period}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={() => handleEditStudent(student)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EditStudentModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        student={selectedStudent}
        onSave={handleSaveStudent}
      />
    </>
  );
};

export default RegisteredStudentsTable;