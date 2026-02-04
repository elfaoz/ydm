import React, { useState } from 'react';
import { Download, Share2, Eye, ChevronLeft, ChevronRight, CheckSquare, Square } from 'lucide-react';
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
import { useMemorization, MemorizationRecord } from '@/contexts/MemorizationContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useHalaqahs } from '@/contexts/HalaqahContext';
import jsPDF from 'jspdf';

const ShareResultsDailySection: React.FC = () => {
  const { students } = useStudents();
  const { memorizationRecords } = useMemorization();
  const { profileData } = useProfile();
  const { halaqahs } = useHalaqahs();
  
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

  const getStatusIndonesian = (status: string) => {
    switch (status) {
      case 'Fully Achieved': return 'Tercapai Penuh';
      case 'Achieved': return 'Tercapai';
      case 'Not Achieved': return 'Tidak Tercapai';
      default: return status;
    }
  };

  const getSemesterLabel = (semesterValue: string) => {
    if (!semesterValue) return '-';
    // Check if it contains semester info like "1" or "2" or "Ganjil"/"Genap"
    if (semesterValue.includes('1') || semesterValue.toLowerCase().includes('ganjil')) {
      return 'Ganjil';
    } else if (semesterValue.includes('2') || semesterValue.toLowerCase().includes('genap')) {
      return 'Genap';
    }
    // If it's a year format like "2025-2026", determine based on current month
    const currentMonth = new Date().getMonth() + 1; // 1-12
    return currentMonth >= 7 ? 'Ganjil' : 'Genap';
  };

  const getStudentData = () => {
    if (!selectedStudent) return null;
    
    const student = students.find(s => s.id.toString() === selectedStudent);
    if (!student) return null;

    const studentHalaqah = halaqahs.find(h => 
      h.selectedStudents?.includes(student.id.toString())
    );

    // Get memorization records for the selected student within the date range
    const dailyRecords = memorizationRecords.filter(record => {
      const recordDate = new Date(record.date);
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      return record.studentName === student.name && 
             recordDate >= fromDate && 
             recordDate <= toDate;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const profileDataStudent = {
      name: student.name,
      class: student.class,
      level: studentHalaqah?.level || student.level || '-',
      semester: getSemesterLabel(student.period || ''),
      year: new Date().getFullYear().toString(),
    };

    return {
      profile: profileDataStudent,
      records: dailyRecords
    };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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

  const handlePreview = () => {
    const studentData = getStudentData();
    if (!studentData) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Laporan Hafalan Harian - ${studentData.profile.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          h1 { color: #03989e; text-align: center; font-size: 24px; margin-bottom: 20px; }
          h2 { color: #444; font-size: 16px; margin: 15px 0 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .section { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .closing { margin-top: 30px; }
          .signature { margin-top: 40px; }
        </style>
      </head>
      <body>
        <h1>Laporan Hafalan Harian Santri</h1>
        
        <div class="section">
          <h2>Data Santri</h2>
          <table>
            <tr><td><strong>Nama</strong></td><td>${studentData.profile.name}</td></tr>
            <tr><td><strong>Kelas</strong></td><td>${studentData.profile.class}</td></tr>
            <tr><td><strong>Level</strong></td><td>${studentData.profile.level}</td></tr>
            <tr><td><strong>Semester</strong></td><td>${studentData.profile.semester}</td></tr>
            <tr><td><strong>Tahun</strong></td><td>${studentData.profile.year}</td></tr>
            <tr><td><strong>Periode</strong></td><td>${getPeriodString()}</td></tr>
          </table>
        </div>
        
        <div class="section">
          <h2>Data Hafalan</h2>
          ${studentData.records.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th style="width: 20%;">Tanggal</th>
                  <th style="width: 55%;">Detail Surat</th>
                  <th style="width: 25%;">Nilai</th>
                </tr>
              </thead>
              <tbody>
                ${studentData.records.map(record => {
                  const surahDetails = record.memorizationDetail?.surahDetails && record.memorizationDetail.surahDetails.length > 0
                    ? record.memorizationDetail.surahDetails.map(detail => 
                        `Juz ${record.memorizationDetail?.juz || '-'}, ${detail.surahName} - Ayat ${detail.ayahFrom} sampai ${detail.ayahTo}, ${record.actual} halaman`
                      ).join('<br>')
                    : `Juz ${record.memorizationDetail?.juz || '-'}, ${record.actual} halaman`;
                  
                  return `
                    <tr>
                      <td>${formatShortDate(record.date)}</td>
                      <td>${surahDetails}</td>
                      <td>${getStatusIndonesian(record.status)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          ` : `
            <p style="color: #888; text-align: center; padding: 20px;">Belum ada data hafalan pada periode ini</p>
          `}
        </div>
        
        <div class="closing">
          <p>Demikian laporan hafalan harian ini kami sampaikan. Semoga dapat menjadi bahan evaluasi dan motivasi bagi ananda untuk terus mengembangkan hafalan Al-Qur'an.</p>
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
    doc.setTextColor(3, 152, 158);
    doc.text('Laporan Hafalan Harian Santri', pageWidth / 2, yPos, { align: 'center' });
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
      doc.setFillColor(255, 255, 255);
      doc.rect(20, yPos - 5, 50, 10, 'S');
      doc.text(label, 22, yPos);
      doc.setFont('helvetica', 'normal');
      doc.rect(70, yPos - 5, pageWidth - 90, 10, 'S');
      doc.text(value, 72, yPos);
      yPos += 10;
    };

    addTableRow('Nama', studentData.profile.name);
    addTableRow('Kelas', studentData.profile.class);
    addTableRow('Level', studentData.profile.level);
    addTableRow('Semester', studentData.profile.semester);
    addTableRow('Tahun', studentData.profile.year);
    addTableRow('Periode', getPeriodString());
    yPos += 10;

    // Data Hafalan Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(68, 68, 68);
    doc.text('Data Hafalan', 20, yPos);
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
      doc.rect(55, yPos - 5, 95, 10, 'FD');
      doc.rect(150, yPos - 5, 40, 10, 'FD');
      doc.setTextColor(51, 51, 51);
      doc.text('Tanggal', 22, yPos);
      doc.text('Detail Surat', 57, yPos);
      doc.text('Nilai', 152, yPos);
      yPos += 10;

      // Table Rows
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      studentData.records.forEach((record) => {
        const surahDetailsArr = record.memorizationDetail?.surahDetails && record.memorizationDetail.surahDetails.length > 0
          ? record.memorizationDetail.surahDetails.map(detail => 
              `Juz ${record.memorizationDetail?.juz || '-'}, ${detail.surahName} - Ayat ${detail.ayahFrom} s/d ${detail.ayahTo}, ${record.actual} hal`
            )
          : [`Juz ${record.memorizationDetail?.juz || '-'}, ${record.actual} halaman`];
        
        const detailText = surahDetailsArr.join('\n');
        const splitDetail = doc.splitTextToSize(detailText, 90);
        const rowHeight = Math.max(splitDetail.length * 5 + 5, 10);
        
        checkPageBreak(rowHeight + 5);

        doc.rect(20, yPos - 5, 35, rowHeight, 'S');
        doc.rect(55, yPos - 5, 95, rowHeight, 'S');
        doc.rect(150, yPos - 5, 40, rowHeight, 'S');

        doc.text(formatShortDate(record.date).substring(0, 15), 22, yPos);
        doc.text(splitDetail, 57, yPos);
        doc.text(getStatusIndonesian(record.status), 152, yPos);

        yPos += rowHeight;
      });
    } else {
      doc.setFontSize(12);
      doc.setTextColor(136, 136, 136);
      doc.text('Belum ada data hafalan pada periode ini', 20, yPos);
      yPos += 15;
    }

    // Closing
    yPos += 10;
    checkPageBreak(50);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    const closingText = 'Demikian laporan hafalan harian ini kami sampaikan. Semoga dapat menjadi bahan evaluasi dan motivasi bagi ananda untuk terus mengembangkan hafalan Al-Qur\'an.';
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

    doc.save(`Laporan_Hafalan_Harian_${studentData.profile.name}_${dateFrom}_${dateTo}.pdf`);
  };

  const handleWhatsAppShare = () => {
    const studentData = getStudentData();
    if (!studentData || selectedRecipients.length === 0) return;

    const recipientNames = selectedRecipients.map(id => {
      const recipient = recipients.find(r => r.id === id);
      return recipient?.label || '';
    }).join(', ');

    let message = `Kepada Yth. ${recipientNames}\n\n`;
    message += `Berikut ini kami sampaikan laporan hafalan harian ananda *${studentData.profile.name}* periode ${getPeriodString()}\n\n`;

    message += `*Data Santri*\n`;
    message += `Nama: ${studentData.profile.name}\n`;
    message += `Kelas: ${studentData.profile.class}\n`;
    message += `Level: ${studentData.profile.level}\n`;
    message += `Semester: ${studentData.profile.semester}\n`;
    message += `Tahun: ${studentData.profile.year}\n\n`;

    message += `*Data Hafalan*\n`;
    if (studentData.records.length > 0) {
      studentData.records.forEach((record) => {
        message += `📅 ${formatShortDate(record.date)}\n`;
        if (record.memorizationDetail?.surahDetails && record.memorizationDetail.surahDetails.length > 0) {
          record.memorizationDetail.surahDetails.forEach(detail => {
            message += `   Juz ${record.memorizationDetail?.juz}, ${detail.surahName} - Ayat ${detail.ayahFrom} s/d ${detail.ayahTo}\n`;
          });
        }
        message += `   Nilai: ${getStatusIndonesian(record.status)}\n\n`;
      });
    } else {
      message += `Belum ada data hafalan pada periode ini\n\n`;
    }

    message += `Demikian laporan hafalan harian ini kami sampaikan. Semoga dapat menjadi bahan evaluasi dan motivasi bagi ananda untuk terus mengembangkan hafalan Al-Qur'an.\n\n`;
    message += `Wassalamu'alaikum warahmatullahi wabarakatuh.\n\n`;
    message += `Hormat kami,\n`;
    message += `${profileData.name}\n`;
    message += `${profileData.role}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const studentData = getStudentData();
  const canGenerate = selectedStudent;
  const canShare = selectedStudent && selectedRecipients.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Download & Share Report Harian</h3>
        <p className="text-sm text-gray-600">Laporan hafalan harian santri dengan format tabel</p>
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
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sampai:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Preview Data */}
        {studentData && studentData.records.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3">Preview Data Hafalan ({studentData.records.length} record)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Tanggal</th>
                    <th className="text-left py-2 px-2">Detail Surat</th>
                    <th className="text-left py-2 px-2">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {studentData.records.slice(0, 5).map((record, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-2">{formatShortDate(record.date)}</td>
                      <td className="py-2 px-2">
                        {record.memorizationDetail?.surahDetails && record.memorizationDetail.surahDetails.length > 0 ? (
                          record.memorizationDetail.surahDetails.map((detail, idx) => (
                            <div key={idx}>
                              Juz {record.memorizationDetail?.juz}, {detail.surahName} - Ayat {detail.ayahFrom} s/d {detail.ayahTo}
                            </div>
                          ))
                        ) : (
                          <span>Juz {record.memorizationDetail?.juz || '-'}</span>
                        )}
                      </td>
                      <td className="py-2 px-2">{getStatusIndonesian(record.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {studentData.records.length > 5 && (
                <p className="text-sm text-gray-500 mt-2">... dan {studentData.records.length - 5} record lainnya</p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            onClick={handlePreview}
            disabled={!canGenerate}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Tampilkan
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handlePDFDownload}
            disabled={!canGenerate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          
          <Button 
            onClick={handleWhatsAppShare}
            disabled={!canShare}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Share2 className="h-4 w-4" />
            Share via WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareResultsDailySection;
