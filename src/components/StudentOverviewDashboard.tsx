import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStudents } from '@/contexts/StudentContext';
import { useHalaqahs } from '@/contexts/HalaqahContext';

const StudentOverviewDashboard: React.FC = () => {
  const { students } = useStudents();
  const { halaqahs } = useHalaqahs();

  // Table 1: Count students by Level (Jenjang) and Gender from Registered Students
  const studentsByLevelAndGender = useMemo(() => {
    const levels = [...new Set(students.map(s => s.level))].filter(Boolean).sort();
    
    const countByLevelGender: Record<string, { male: number; female: number }> = {};
    
    levels.forEach(level => {
      countByLevelGender[level] = { male: 0, female: 0 };
    });
    
    students.forEach(student => {
      const level = student.level || 'Tidak Ada';
      if (!countByLevelGender[level]) {
        countByLevelGender[level] = { male: 0, female: 0 };
      }
      if (student.gender === 'Laki-laki') {
        countByLevelGender[level].male++;
      } else if (student.gender === 'Perempuan') {
        countByLevelGender[level].female++;
      }
    });

    return { levels: Object.keys(countByLevelGender), data: countByLevelGender };
  }, [students]);

  // Table 2: Count halaqah members by Halaqah Level (columns) and Class (rows)
  const membersByLevelAndClass = useMemo(() => {
    // Get unique levels from registered halaqahs
    const halaqahLevels = [...new Set(halaqahs.map(h => h.level))].filter(Boolean).sort();
    
    // Get unique classes from registered students
    const studentClasses = [...new Set(students.map(s => s.class))].filter(Boolean).sort();
    
    // Initialize count matrix
    const countByLevelClass: Record<string, Record<string, number>> = {};
    
    studentClasses.forEach(cls => {
      countByLevelClass[cls] = {};
      halaqahLevels.forEach(level => {
        countByLevelClass[cls][level] = 0;
      });
    });

    // Count members by level and class
    halaqahs.forEach(halaqah => {
      const level = halaqah.level;
      if (halaqah.selectedStudents) {
        halaqah.selectedStudents.forEach(studentId => {
          const student = students.find(s => s.id.toString() === studentId);
          if (student && student.class) {
            if (!countByLevelClass[student.class]) {
              countByLevelClass[student.class] = {};
              halaqahLevels.forEach(l => {
                countByLevelClass[student.class][l] = 0;
              });
            }
            countByLevelClass[student.class][level] = (countByLevelClass[student.class][level] || 0) + 1;
          }
        });
      }
    });

    return { levels: halaqahLevels, classes: studentClasses, data: countByLevelClass };
  }, [halaqahs, students]);

  // Calculate totals for Table 1
  const table1Totals = useMemo(() => {
    let male = 0;
    let female = 0;
    Object.values(studentsByLevelAndGender.data).forEach(count => {
      male += count.male;
      female += count.female;
    });
    return { male, female, total: male + female };
  }, [studentsByLevelAndGender]);

  // Calculate totals for Table 2 (by level and by class)
  const table2Totals = useMemo(() => {
    const levelTotals: Record<string, number> = {};
    const classTotals: Record<string, number> = {};
    let grandTotal = 0;

    membersByLevelAndClass.levels.forEach(level => {
      levelTotals[level] = 0;
    });

    membersByLevelAndClass.classes.forEach(cls => {
      classTotals[cls] = 0;
      membersByLevelAndClass.levels.forEach(level => {
        const count = membersByLevelAndClass.data[cls]?.[level] || 0;
        levelTotals[level] += count;
        classTotals[cls] += count;
        grandTotal += count;
      });
    });

    return { levelTotals, classTotals, grandTotal };
  }, [membersByLevelAndClass]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Student Overview</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Students by Level (Jenjang) and Gender */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jumlah Murid Berdasarkan Jenjang</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Jenis Kelamin</TableHead>
                  {studentsByLevelAndGender.levels.map(level => (
                    <TableHead key={level} className="text-center">{level}</TableHead>
                  ))}
                  <TableHead className="text-center font-semibold">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Laki-laki</TableCell>
                  {studentsByLevelAndGender.levels.map(level => (
                    <TableCell key={level} className="text-center">
                      {studentsByLevelAndGender.data[level]?.male || 0}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-semibold">{table1Totals.male}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Perempuan</TableCell>
                  {studentsByLevelAndGender.levels.map(level => (
                    <TableCell key={level} className="text-center">
                      {studentsByLevelAndGender.data[level]?.female || 0}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-semibold">{table1Totals.female}</TableCell>
                </TableRow>
                <TableRow className="bg-muted/50">
                  <TableCell className="font-semibold">Total</TableCell>
                  {studentsByLevelAndGender.levels.map(level => (
                    <TableCell key={level} className="text-center font-semibold">
                      {(studentsByLevelAndGender.data[level]?.male || 0) + 
                       (studentsByLevelAndGender.data[level]?.female || 0)}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold">{table1Totals.total}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            {studentsByLevelAndGender.levels.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Belum ada data murid terdaftar</p>
            )}
          </CardContent>
        </Card>

        {/* Table 2: Halaqah Members by Level (columns) and Class (rows) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jumlah Anggota Halaqah Berdasarkan Level dan Kelas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Kelas</TableHead>
                  {membersByLevelAndClass.levels.map(level => (
                    <TableHead key={level} className="text-center">{level}</TableHead>
                  ))}
                  <TableHead className="text-center font-semibold">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membersByLevelAndClass.classes.map(cls => (
                  <TableRow key={cls}>
                    <TableCell className="font-medium">{cls}</TableCell>
                    {membersByLevelAndClass.levels.map(level => (
                      <TableCell key={level} className="text-center">
                        {membersByLevelAndClass.data[cls]?.[level] || 0}
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-semibold">
                      {table2Totals.classTotals[cls] || 0}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell className="font-semibold">Total</TableCell>
                  {membersByLevelAndClass.levels.map(level => (
                    <TableCell key={level} className="text-center font-semibold">
                      {table2Totals.levelTotals[level] || 0}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold">{table2Totals.grandTotal}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            {membersByLevelAndClass.levels.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Belum ada data halaqah terdaftar</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentOverviewDashboard;
