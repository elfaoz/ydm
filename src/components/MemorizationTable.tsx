import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Save, Eye } from 'lucide-react';
import { calculateMemorizationStatus } from '@/utils/surahData';
import InputMemorizationModal from './InputMemorizationModal';
import DetailMemorizationModal from './DetailMemorizationModal';
import EditMemorizationModal from './EditMemorizationModal';
import { useStudents } from '@/contexts/StudentContext';
import { useHalaqahs } from '@/contexts/HalaqahContext';
import { MemorizationRecord, MemorizationDetail, useMemorization } from '@/contexts/MemorizationContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Halaqah {
  id: number;
  name: string;
  membersCount: number;
  level: string;
  pembina: string;
  selectedStudents?: string[];
}

interface MemorizationTableProps {
  memorizationRecords?: MemorizationRecord[];
  selectedHalaqah?: string;
}

const MemorizationTable: React.FC<MemorizationTableProps> = ({ memorizationRecords: propRecords, selectedHalaqah: propSelectedHalaqah = 'all' }) => {
  const { students } = useStudents();
  const { halaqahs: registeredHalaqahs } = useHalaqahs();
  const { memorizationRecords: contextRecords, updateMemorizationRecord } = useMemorization();
  
  // Use context records if prop is not provided or empty
  const memorizationRecords = propRecords && propRecords.length > 0 ? propRecords : contextRecords;
  
  const [records, setRecords] = useState<MemorizationRecord[]>(memorizationRecords);

  // Update records when memorizationRecords changes
  useEffect(() => {
    setRecords(memorizationRecords);
  }, [memorizationRecords]);

  const getStudentsByHalaqah = () => {
    if (propSelectedHalaqah === 'all') return records;
    
    const halaqah = registeredHalaqahs.find(h => h.id.toString() === propSelectedHalaqah);
    if (!halaqah?.selectedStudents) return [];
    
    return records.filter(record => {
      const student = students.find(s => s.name === record.studentName);
      return student && halaqah.selectedStudents?.includes(student.id.toString());
    });
  };

  const filteredRecords = getStudentsByHalaqah();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MemorizationRecord | null>(null);

  const handleEdit = (record: MemorizationRecord) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (updatedRecord: MemorizationRecord) => {
    updateMemorizationRecord(updatedRecord.id, updatedRecord);
    setRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
    setIsEditModalOpen(false);
  };

  const handleSave = (id: string) => {
    setRecords(prev => prev.map(record => {
      if (record.id === id) {
        const percentage = Math.min((editValue / record.target) * 100, 100);
        const { status } = calculateMemorizationStatus(editValue, record.target);
        return {
          ...record,
          actual: editValue,
          percentage: Math.round(percentage),
          status
        };
      }
      return record;
    }));
    setEditingId(null);
  };

  const handleDetail = (record: MemorizationRecord) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleAddRecord = (newRecord: Omit<MemorizationRecord, 'id'>) => {
    const id = Date.now().toString();
    setRecords(prev => [...prev, { ...newRecord, id }]);
  };

  const getStatusBadge = (status: string, percentage: number) => {
    const { color } = calculateMemorizationStatus(percentage / 100 * 2, 2);
    return (
      <Badge className={color}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Data Hafalan Harian</h2>
          <p className="text-gray-600">Ringkasan Hafalan Harian Santri</p>
        </div>
      </div>


      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Nama Santri</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Juz</TableHead>
              <TableHead>Page Range</TableHead>
              <TableHead>Surah Name</TableHead>
              <TableHead>Ayah Range</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length > 0 ? filteredRecords.map((record) => (
              <TableRow key={record.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  {record.studentName}
                </TableCell>
                <TableCell>
                  {new Date(record.date).toLocaleDateString('id-ID')}
                </TableCell>
                <TableCell>
                  {record.memorizationDetail?.juz || '-'}
                </TableCell>
                <TableCell>
                  {record.memorizationDetail ? 
                    `${record.memorizationDetail.pageFrom} - ${record.memorizationDetail.pageTo}` : 
                    '-'
                  }
                </TableCell>
                <TableCell>
                  {record.memorizationDetail?.surahDetails && record.memorizationDetail.surahDetails.length > 0 ? (
                    <div className="space-y-1">
                      {record.memorizationDetail.surahDetails.map((detail, idx) => (
                        <div key={idx}>{detail.surahName}</div>
                      ))}
                    </div>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  {record.memorizationDetail?.surahDetails && record.memorizationDetail.surahDetails.length > 0 ? (
                    <div className="space-y-1">
                      {record.memorizationDetail.surahDetails.map((detail, idx) => (
                        <div key={idx}>{detail.ayahFrom} - {detail.ayahTo}</div>
                      ))}
                    </div>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(record)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDetail(record)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Belum ada data hafalan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <InputMemorizationModal
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
        onSubmit={handleAddRecord}
      />

      <DetailMemorizationModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        record={selectedRecord}
      />

      <EditMemorizationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        record={selectedRecord}
      />
    </div>
  );
};

export default MemorizationTable;
