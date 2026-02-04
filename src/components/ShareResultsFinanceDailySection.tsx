import React, { useState } from 'react';
import { Download, Share2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStudents } from '@/contexts/StudentContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useProfile } from '@/contexts/ProfileContext';
import jsPDF from 'jspdf';

const ShareResultsFinanceDailySection: React.FC = () => {
  const { students } = useStudents();
  const { expenseRecords } = useFinance();
  const { profileData } = useProfile();
  
  const [selectedStudent, setSelectedStudent] = useState('');
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  const recipients = [
    { id: 'mudir_am', label: "Mudir 'Am" },
    { id: 'mudir_asrama', label: 'Mudir Asrama' },
    { id: 'orang_tua', label: 'Orang Tua Santri' }
  ];

  const handleRecipientToggle = (recipientId: string) => {
    if (selectedRecipients.includes(recipientId)) {
      setSelectedRecipients(selectedRecipients.filter(r => r !== recipientId));
    } else {
      setSelectedRecipients([...selectedRecipients, recipientId]);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getPeriodString = () => {
    return `${formatShortDate(dateFrom)} - ${formatShortDate(dateTo)}`;
  };

  const getStudentData = () => {
    if (!selectedStudent) return null;
    
    const student = students.find(s => s.id.toString() === selectedStudent);
    if (!student) return null;

    // Get expense records for the selected student within the date range
    const dailyRecords = expenseRecords.filter(record => {
      const recordDate = new Date(record.tanggal);
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      return record.nama === student.name && 
             recordDate >= fromDate && 
             recordDate <= toDate;
    }).sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

    const totalExpense = dailyRecords.reduce((sum, r) => sum + r.jumlah, 0);

    return {
      profile: {
        name: student.name,
        class: student.class,
        year: new Date().getFullYear().toString(),
      },
      records: dailyRecords,
      totalExpense
    };
  };

  const handlePreview = () => {
    const studentData = getStudentData();
    if (!studentData) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Laporan Keuangan Harian - ${studentData.profile.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          h1 { color: #5db3d2; text-align: center; font-size: 24px; margin-bottom: 20px; }
          h2 { color: #444; font-size: 16px; margin: 15px 0 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .section { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .closing { margin-top: 30px; }
          .signature { margin-top: 40px; }
          .total-row { font-weight: bold; background-color: #f0f9ff; }
        </style>
      </head>
      <body>
        <h1>Laporan Keuangan Harian Santri</h1>
        
        <div class="section">
          <h2>Data Santri</h2>
          <table>
            <tr><td><strong>Nama</strong></td><td>${studentData.profile.name}</td></tr>
            <tr><td><strong>Kelas</strong></td><td>${studentData.profile.class}</td></tr>
            <tr><td><strong>Tahun</strong></td><td>${studentData.profile.year}</td></tr>
            <tr><td><strong>Periode</strong></td><td>${getPeriodString()}</td></tr>
          </table>
        </div>
        
        <div class="section">
          <h2>Data Pengeluaran</h2>
          ${studentData.records.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th style="width: 20%;">Tanggal</th>
                  <th style="width: 25%;">Kategori</th>
                  <th style="width: 30%;">Catatan</th>
                  <th style="width: 25%;">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                ${studentData.records.map(record => `
                  <tr>
                    <td>${formatShortDate(record.tanggal)}</td>
                    <td>${record.kategori}</td>
                    <td>${record.catatan || '-'}</td>
                    <td>${formatCurrency(record.jumlah)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;">Total Pengeluaran</td>
                  <td>${formatCurrency(studentData.totalExpense)}</td>
                </tr>
              </tbody>
            </table>
          ` : `
            <p style="color: #888; text-align: center; padding: 20px;">Belum ada data pengeluaran pada periode ini</p>
          `}
        </div>
        
        <div class="closing">
          <p>Demikian laporan keuangan harian ini kami sampaikan. Semoga dapat menjadi bahan evaluasi pengelolaan keuangan ananda.</p>
        </div>
        
        <div class="signature">
          <p>Wassalamu'alaikum warahmatullahi wabarakatuh.</p>
          <p style="margin-top: 20px;">Hormat kami,</p>
          <p style="margin-top: 40px;"><strong>${profileData.name}</strong></p>
          <p>${profileData.role}</p>
        </div>
      </body>
      </html>
    `;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  const handlePDFDownload = () => {
    const studentData = getStudentData();
    if (!studentData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    const checkPageBreak = (neededHeight: number) => {
      if (yPos + neededHeight > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }
    };

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(93, 179, 210);
    doc.text('Laporan Keuangan Harian Santri', pageWidth / 2, yPos, { align: 'center' });
    yPos += 18;

    // Data Santri Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(68, 68, 68);
    doc.text('Data Santri', 20, yPos);
    yPos += 3;
    doc.setDrawColor(238, 238, 238);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 8;

    const addTableRow = (label: string, value: string) => {
      checkPageBreak(12);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 51, 51);
      doc.rect(20, yPos - 5, 50, 10, 'S');
      doc.text(label, 22, yPos);
      doc.setFont('helvetica', 'normal');
      doc.rect(70, yPos - 5, pageWidth - 90, 10, 'S');
      doc.text(value, 72, yPos);
      yPos += 10;
    };

    addTableRow('Nama', studentData.profile.name);
    addTableRow('Kelas', studentData.profile.class);
    addTableRow('Tahun', studentData.profile.year);
    addTableRow('Periode', getPeriodString());
    yPos += 10;

    // Data Pengeluaran Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(68, 68, 68);
    doc.text('Data Pengeluaran', 20, yPos);
    yPos += 3;
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;

    if (studentData.records.length > 0) {
      // Table Header
      checkPageBreak(15);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPos - 5, 35, 10, 'FD');
      doc.rect(55, yPos - 5, 40, 10, 'FD');
      doc.rect(95, yPos - 5, 55, 10, 'FD');
      doc.rect(150, yPos - 5, 40, 10, 'FD');
      doc.setTextColor(51, 51, 51);
      doc.text('Tanggal', 22, yPos);
      doc.text('Kategori', 57, yPos);
      doc.text('Catatan', 97, yPos);
      doc.text('Jumlah', 152, yPos);
      yPos += 10;

      // Table Rows
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      studentData.records.forEach((record) => {
        checkPageBreak(15);
        doc.rect(20, yPos - 5, 35, 10, 'S');
        doc.rect(55, yPos - 5, 40, 10, 'S');
        doc.rect(95, yPos - 5, 55, 10, 'S');
        doc.rect(150, yPos - 5, 40, 10, 'S');

        doc.text(formatShortDate(record.tanggal).substring(0, 12), 22, yPos);
        doc.text(record.kategori.substring(0, 15), 57, yPos);
        doc.text((record.catatan || '-').substring(0, 20), 97, yPos);
        doc.text(formatCurrency(record.jumlah), 152, yPos);

        yPos += 10;
      });

      // Total Row
      checkPageBreak(15);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(240, 249, 255);
      doc.rect(20, yPos - 5, 130, 10, 'FD');
      doc.rect(150, yPos - 5, 40, 10, 'FD');
      doc.text('Total Pengeluaran', 100, yPos, { align: 'right' });
      doc.text(formatCurrency(studentData.totalExpense), 152, yPos);
      yPos += 15;
    } else {
      doc.setFontSize(12);
      doc.setTextColor(136, 136, 136);
      doc.text('Belum ada data pengeluaran pada periode ini', 20, yPos);
      yPos += 15;
    }

    // Closing
    yPos += 10;
    checkPageBreak(50);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    const closingText = 'Demikian laporan keuangan harian ini kami sampaikan. Semoga dapat menjadi bahan evaluasi pengelolaan keuangan ananda.';
    const splitClosing = doc.splitTextToSize(closingText, pageWidth - 40);
    doc.text(splitClosing, 20, yPos);
    yPos += splitClosing.length * 6 + 10;

    doc.text("Wassalamu'alaikum warahmatullahi wabarakatuh.", 20, yPos);
    yPos += 15;

    doc.text('Hormat kami,', 20, yPos);
    yPos += 20;

    doc.setFont('helvetica', 'bold');
    doc.text(profileData.name, 20, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(profileData.role, 20, yPos);

    doc.save(`Laporan_Keuangan_Harian_${studentData.profile.name}_${dateFrom}_${dateTo}.pdf`);
  };

  const handleWhatsAppShare = () => {
    const studentData = getStudentData();
    if (!studentData || selectedRecipients.length === 0) return;

    const recipientNames = selectedRecipients.map(id => {
      const recipient = recipients.find(r => r.id === id);
      return recipient?.label || '';
    }).join(', ');

    let message = `Kepada Yth. ${recipientNames}\n\n`;
    message += `Berikut ini kami sampaikan laporan keuangan harian ananda *${studentData.profile.name}* periode ${getPeriodString()}\n\n`;

    message += `*Data Santri*\n`;
    message += `Nama: ${studentData.profile.name}\n`;
    message += `Kelas: ${studentData.profile.class}\n`;
    message += `Tahun: ${studentData.profile.year}\n\n`;

    message += `*Data Pengeluaran*\n`;
    if (studentData.records.length > 0) {
      studentData.records.forEach((record) => {
        message += `📅 ${formatShortDate(record.tanggal)}\n`;
        message += `   ${record.kategori}: ${formatCurrency(record.jumlah)}\n`;
        if (record.catatan) {
          message += `   Catatan: ${record.catatan}\n`;
        }
        message += `\n`;
      });
      message += `*Total Pengeluaran: ${formatCurrency(studentData.totalExpense)}*\n\n`;
    } else {
      message += `Belum ada data pengeluaran pada periode ini\n\n`;
    }

    message += `Demikian laporan keuangan harian ini kami sampaikan. Semoga dapat menjadi bahan evaluasi pengelolaan keuangan ananda.\n\n`;
    message += `Wassalamu'alaikum warahmatullahi wabarakatuh.\n\n`;
    message += `Hormat kami,\n`;
    message += `${profileData.name}\n`;
    message += `${profileData.role}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const canGenerate = selectedStudent;
  const canShare = selectedStudent && selectedRecipients.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Download & Share Report Keuangan Harian</h3>
        <p className="text-sm text-gray-600">Laporan pengeluaran harian santri dengan format tabel</p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Period Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Periode</label>
          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Dari:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5db3d2]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sampai:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5db3d2]"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">Periode: {getPeriodString()}</p>
        </div>

        {/* Student Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Santri</label>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih santri..." />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id.toString()}>
                  {student.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Recipients Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Penerima Laporan (untuk WhatsApp)</label>
          <div className="flex flex-wrap gap-4">
            {recipients.map((recipient) => (
              <label key={recipient.id} className="flex items-center space-x-2 cursor-pointer">
                <Checkbox 
                  checked={selectedRecipients.includes(recipient.id)}
                  onCheckedChange={() => handleRecipientToggle(recipient.id)}
                />
                <span className="text-sm text-gray-700">{recipient.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
          <Button
            onClick={handlePreview}
            disabled={!canGenerate}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye size={18} />
            Preview
          </Button>
          <Button
            onClick={handlePDFDownload}
            disabled={!canGenerate}
            className="flex items-center gap-2 bg-[#5db3d2] hover:bg-[#4a9bb8] text-white"
          >
            <Download size={18} />
            Download PDF
          </Button>
          <Button
            onClick={handleWhatsAppShare}
            disabled={!canShare}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
          >
            <Share2 size={18} />
            Share via WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareResultsFinanceDailySection;
