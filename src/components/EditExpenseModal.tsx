import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExpenseRecord {
  id: number;
  halaqah: string;
  nama: string;
  tanggal: string;
  jumlah: number;
  kategori: string;
  catatan: string;
}

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseRecord | null;
  onSave: (updatedExpense: ExpenseRecord) => void;
}

const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
  onSave,
}) => {
  const [jumlah, setJumlah] = useState('');
  const [kategori, setKategori] = useState('');
  const [catatan, setCatatan] = useState('');

  useEffect(() => {
    if (expense) {
      setJumlah(expense.jumlah.toString());
      setKategori(expense.kategori);
      setCatatan(expense.catatan);
    }
  }, [expense]);

  const handleSave = () => {
    if (!expense) return;

    const updatedExpense: ExpenseRecord = {
      ...expense,
      jumlah: parseInt(jumlah),
      kategori,
      catatan,
    };

    onSave(updatedExpense);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Pengeluaran</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Jumlah Pengeluaran</Label>
            <Input
              type="number"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              placeholder="Masukkan jumlah..."
            />
          </div>
          
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={kategori} onValueChange={setKategori}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Makan">Makan</SelectItem>
                <SelectItem value="Transport">Transport</SelectItem>
                <SelectItem value="Pribadi">Pribadi</SelectItem>
                <SelectItem value="Kesehatan">Kesehatan</SelectItem>
                <SelectItem value="Pendidikan">Pendidikan</SelectItem>
                <SelectItem value="Lain-lain">Lain-lain</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Catatan</Label>
            <Input
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Masukkan catatan..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditExpenseModal;
