import React, { useState } from 'react';
import { Download, Share2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { useMemorization } from '@/contexts/MemorizationContext';
import { useAttendance } from '@/contexts/AttendanceContext';
import { useActivity } from '@/contexts/ActivityContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useProfile } from '@/contexts/ProfileContext';
import jsPDF from 'jspdf';

const ShareResultsMonthlySection: React.FC = () => {
  const { students } = useStudents();
  const { memorizationRecords } = useMemorization();
  const { attendanceRecords } = useAttendance();
  const { activityRecords } = useActivity();
  const { expenseRecords } = useFinance();
  const { profileData } = useProfile();
  
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const categories = [
    { id: 'profile', label: 'Nama Santri' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'memorization', label: 'Memorization' },
    { id: 'activities', label: 'Activities' },
    { id: 'finance', label: 'Finance' }
  ];

  const recipients = [
    { id: 'mudir_am', label: "Mudir 'Am" },
    { id: 'mudir_asrama', label: 'Mudir Asrama' },
    { id: 'orang_tua', label: 'Orang Tua Santri' }
  ];

  const goToPreviousMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonthIndex(prev => prev - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonthIndex(prev => prev + 1);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(c => c !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleRecipientToggle = (recipientId: string) => {
    if (selectedRecipients.includes(recipientId)) {
      setSelectedRecipients(selectedRecipients.filter(r => r !== recipientId));
    } else {
      setSelectedRecipients([...selectedRecipients, recipientId]);
    }
  };

  const getDaysInMonth = () => {
    return new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  };

  const getMemStatus = (pct: number) => {
    if (pct >= 80) return 'Baik Sekali';
    if (pct >= 60) return 'Baik';
    if (pct >= 40) return 'Cukup';
    if (pct >= 20) return 'Kurang';
    return 'Sangat Kurang';
  };

  const getFinanceStatus = (pct: number) => {
    if (pct <= 50) return 'Sangat Hemat';
    if (pct <= 100) return 'Hemat';
    if (pct <= 150) return 'Cukup Proporsional';
    if (pct <= 200) return 'Boros';
    return 'Sangat Boros';
  };

  const getStudentData = () => {
    if (!selectedStudent) return null;
    
    const student = students.find(s => s.id.toString() === selectedStudent);
    if (!student) return null;

    const profileDataStudent = {
      name: student.name,
      class: student.class,
      level: student.level,
      period: student.period
    };

    // Filter by current selected month
    const monthAttendance = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      const recordYear = recordDate.getFullYear();
      const recordMonth = recordDate.getMonth();
      return record.studentId === selectedStudent && recordYear === currentYear && recordMonth === currentMonthIndex;
    });

    const attendanceData = {
      hadir: monthAttendance.filter(r => r.status === 'hadir').length,
      izin: monthAttendance.filter(r => r.status === 'izin').length,
      sakit: monthAttendance.filter(r => r.status === 'sakit').length,
      tanpaKeterangan: monthAttendance.filter(r => r.status === 'tanpa keterangan').length,
      pulang: monthAttendance.filter(r => r.status === 'pulang').length,
    };

    const monthMemorization = memorizationRecords.filter(record => {
      const recordDate = new Date(record.date);
      const recordYear = recordDate.getFullYear();
      const recordMonth = recordDate.getMonth();
      return record.studentName === student.name && recordYear === currentYear && recordMonth === currentMonthIndex;
    });

    // Target berdasarkan level santri
    const getTargetByLevel = (level: string) => {
      const levelLower = level?.toLowerCase() || '';
      if (levelLower.includes('tahsin')) {
        return { daily: 4, monthly: 4, semester: 20 };
      } else if (levelLower.includes('tahfizh kamil') || levelLower.includes('tahfidz kamil')) {
        return { daily: 20, monthly: 20, semester: 100 };
      } else if (levelLower.includes('tahfizh 2') || levelLower.includes('tahfidz 2')) {
        return { daily: 10, monthly: 10, semester: 50 };
      } else if (levelLower.includes('tahfizh 1') || levelLower.includes('tahfidz 1') || levelLower.includes('tahfizh') || levelLower.includes('tahfidz')) {
        return { daily: 6, monthly: 6, semester: 30 };
      }
      return { daily: 4, monthly: 4, semester: 20 };
    };

    const levelTarget = getTargetByLevel(student.level);
    const memTargetHarian = levelTarget.daily;
    const memTargetBulanan = levelTarget.monthly;
    const memActual = monthMemorization.reduce((sum, r) => sum + r.actual, 0);
    const memPercentage = memTargetBulanan > 0 ? Math.round((memActual / memTargetBulanan) * 100) : 0;

    const memorizationData = {
      targetHarian: memTargetHarian,
      targetBulanan: memTargetBulanan,
      actual: memActual,
      percentage: memPercentage,
      status: getMemStatus(memPercentage),
    };

    const monthActivities = activityRecords.filter(record => {
      const recordDate = new Date(record.date);
      const recordYear = recordDate.getFullYear();
      const recordMonth = recordDate.getMonth();
      return record.studentId === selectedStudent && recordYear === currentYear && recordMonth === currentMonthIndex;
    });

    const activitiesData = {
      bangunTidur: monthActivities.filter(r => r.activities['bangun_tidur']).length,
      tahajud: monthActivities.filter(r => r.activities['tahajud']).length,
      rawatib: monthActivities.filter(r => r.activities['rawatib']).length,
      shaum: monthActivities.filter(r => r.activities['shaum']).length,
      tilawah: monthActivities.filter(r => r.activities['tilawah']).length,
      piket: monthActivities.filter(r => r.activities['piket']).length,
    };

    const monthExpenses = expenseRecords.filter(record => {
      const recordDate = new Date(record.tanggal);
      const recordYear = recordDate.getFullYear();
      const recordMonth = recordDate.getMonth();
      return record.nama === student.name && recordYear === currentYear && recordMonth === currentMonthIndex;
    });

    const dailyBudget = 15000;
    const daysInMon = getDaysInMonth();
    const monthBudget = dailyBudget * daysInMon;
    const totalExpense = monthExpenses.reduce((sum, record) => sum + record.jumlah, 0);
    const financePercentage = monthBudget > 0 ? Math.round((totalExpense / monthBudget) * 100) : 0;

    const financeData = {
      totalExpense,
      budget: monthBudget,
      percentage: financePercentage,
      status: getFinanceStatus(financePercentage),
    };

    return {
      profile: profileDataStudent,
      attendance: attendanceData,
      memorization: memorizationData,
      activities: activitiesData,
      finance: financeData
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleWhatsAppShare = () => {
    const studentData = getStudentData();
    if (!studentData || selectedCategories.length === 0 || selectedRecipients.length === 0) return;

    const student = students.find(s => s.id.toString() === selectedStudent);
    if (!student) return;

    const today = new Date();
    const formattedDate = today.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const recipientNames = selectedRecipients.map(id => {
      const recipient = recipients.find(r => r.id === id);
      return recipient?.label || '';
    }).join(', ');

    let message = `Kepada Ykh. ${recipientNames}\n\n`;
    message += `Berikut ini kami sampaikan laporan perkembangan ananda *${student.name}* per tanggal ${formattedDate}\n\n`;

    if (selectedCategories.includes('profile')) {
      message += `*Data Santri*\n`;
      message += `Nama: ${studentData.profile.name}\n`;
      message += `Kelas: ${studentData.profile.class}\n`;
      message += `Bulan: ${months[currentMonthIndex]}\n`;
      message += `Tahun: ${currentYear}\n\n`;
    }

    if (selectedCategories.includes('attendance')) {
      message += `*Kehadiran (Per Bulan)*\n`;
      message += `Hadir: ${studentData.attendance.hadir} hari\n`;
      message += `Izin: ${studentData.attendance.izin} hari\n`;
      message += `Sakit: ${studentData.attendance.sakit} hari\n`;
      message += `Tanpa Keterangan: ${studentData.attendance.tanpaKeterangan} hari\n`;
      message += `Pulang: ${studentData.attendance.pulang} hari\n\n`;
    }

    if (selectedCategories.includes('memorization')) {
      message += `*Hafalan (Per Bulan)*\n`;
      message += `Target Bulanan: ${studentData.memorization.targetBulanan} halaman\n`;
      message += `Pencapaian: ${studentData.memorization.actual} halaman\n`;
      message += `Persentase: ${studentData.memorization.percentage}%\n`;
      message += `Status: ${studentData.memorization.status}\n\n`;
    }

    if (selectedCategories.includes('activities')) {
      message += `*Aktivitas (Per Bulan)*\n`;
      message += `Bangun Tidur: ${studentData.activities.bangunTidur} hari\n`;
      message += `Tahajud: ${studentData.activities.tahajud} hari\n`;
      message += `Rawatib: ${studentData.activities.rawatib} hari\n`;
      message += `Shaum: ${studentData.activities.shaum} hari\n`;
      message += `Tilawah: ${studentData.activities.tilawah} hari\n`;
      message += `Piket: ${studentData.activities.piket} hari\n\n`;
    }

    if (selectedCategories.includes('finance')) {
      message += `*Keuangan (Per Bulan)*\n`;
      message += `Anggaran Bulan: ${formatCurrency(studentData.finance.budget)}\n`;
      message += `Total Pengeluaran: ${formatCurrency(studentData.finance.totalExpense)}\n`;
      message += `Persentase: ${studentData.finance.percentage}%\n`;
      message += `Status: ${studentData.finance.status}\n\n`;
    }

    message += `Demikian laporan ini kami sampaikan. Semoga dapat menjadi bahan evaluasi dan motivasi bagi ananda untuk terus mengembangkan aspek kehadiran, hafalan qur'an, ibadah, dan manajemen keuangan.\n\n`;
    message += `Wassalamu'alaikum warahmatullahi wabarakatuh.\n\n`;
    message += `Hormat kami,\n`;
    message += `${profileData.name}\n`;
    message += `${profileData.role}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handlePDFDownload = () => {
    const studentData = getStudentData();
    if (!studentData || selectedCategories.length === 0 || selectedRecipients.length === 0) return;

    const student = students.find(s => s.id.toString() === selectedStudent);
    if (!student) return;

    const today = new Date();
    const formattedDate = today.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const recipientNames = selectedRecipients.map(id => {
      const recipient = recipients.find(r => r.id === id);
      return recipient?.label || '';
    }).join('\n');

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Helper function to check and add new page if needed
    const checkPageBreak = (neededHeight: number) => {
      if (yPos + neededHeight > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }
    };

    // Title - Bold
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(3, 152, 158);
    doc.text('Laporan Perkembangan Santri', pageWidth / 2, yPos, { align: 'center' });
    yPos += 18;

    // Recipient
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    doc.text('Kepada Yth.', 20, yPos);
    yPos += 7;
    const recipientLines = recipientNames.split('\n');
    recipientLines.forEach(line => {
      doc.text(line, 20, yPos);
      yPos += 6;
    });
    yPos += 6;

    // Greeting
    doc.text("Assalamu'alaikum warahmatullahi wabarakatuh.", 20, yPos);
    yPos += 10;
    doc.text(`Dengan hormat, berikut kami sampaikan laporan perkembangan ananda`, 20, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text(`${student.name}`, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(` per ${formattedDate}.`, 20 + doc.getTextWidth(`${student.name} `), yPos);
    yPos += 14;

    // Helper function for section headers
    const addSectionHeader = (title: string) => {
      checkPageBreak(20);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(68, 68, 68);
      doc.text(title, 20, yPos);
      yPos += 3;
      doc.setDrawColor(238, 238, 238);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 8;
    };

    // Helper function for table rows
    const addTableRow = (label: string, value: string) => {
      checkPageBreak(12);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 51, 51);
      doc.setFillColor(255, 255, 255);
      doc.rect(20, yPos - 5, 65, 10, 'S');
      doc.text(label, 22, yPos);
      doc.setFont('helvetica', 'normal');
      doc.rect(85, yPos - 5, pageWidth - 105, 10, 'S');
      doc.text(value, 87, yPos);
      yPos += 10;
    };

    // Profile Section
    if (selectedCategories.includes('profile')) {
      addSectionHeader('Data Santri');
      addTableRow('Nama', studentData.profile.name);
      addTableRow('Kelas', studentData.profile.class);
      addTableRow('Bulan', months[currentMonthIndex]);
      addTableRow('Tahun', currentYear.toString());
      yPos += 8;
    }

    // Attendance Section
    if (selectedCategories.includes('attendance')) {
      addSectionHeader('Kehadiran (Per Bulan)');
      addTableRow('Hadir', `${studentData.attendance.hadir} hari`);
      addTableRow('Izin', `${studentData.attendance.izin} hari`);
      addTableRow('Sakit', `${studentData.attendance.sakit} hari`);
      addTableRow('Tanpa Keterangan', `${studentData.attendance.tanpaKeterangan} hari`);
      addTableRow('Pulang', `${studentData.attendance.pulang} hari`);
      yPos += 8;
    }

    // Memorization Section
    if (selectedCategories.includes('memorization')) {
      addSectionHeader('Hafalan (Per Bulan)');
      addTableRow('Target Bulanan', `${studentData.memorization.targetBulanan} halaman`);
      addTableRow('Pencapaian', `${studentData.memorization.actual} halaman`);
      addTableRow('Persentase', `${studentData.memorization.percentage}%`);
      addTableRow('Status', studentData.memorization.status);
      yPos += 8;
    }

    // Activities Section
    if (selectedCategories.includes('activities')) {
      addSectionHeader('Aktivitas (Per Bulan)');
      addTableRow('Bangun Tidur', `${studentData.activities.bangunTidur} hari`);
      addTableRow('Tahajud', `${studentData.activities.tahajud} hari`);
      addTableRow('Rawatib', `${studentData.activities.rawatib} hari`);
      addTableRow('Shaum', `${studentData.activities.shaum} hari`);
      addTableRow('Tilawah', `${studentData.activities.tilawah} hari`);
      addTableRow('Piket', `${studentData.activities.piket} hari`);
      yPos += 8;
    }

    // Finance Section
    if (selectedCategories.includes('finance')) {
      addSectionHeader('Keuangan (Per Bulan)');
      addTableRow('Anggaran Bulan', formatCurrency(studentData.finance.budget));
      addTableRow('Total Pengeluaran', formatCurrency(studentData.finance.totalExpense));
      addTableRow('Persentase', `${studentData.finance.percentage}%`);
      addTableRow('Status', studentData.finance.status);
      yPos += 8;
    }

    // Closing message
    checkPageBreak(50);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    const closingText = 'Demikian laporan ini kami sampaikan. Semoga dapat menjadi bahan evaluasi dan motivasi bagi ananda untuk terus mengembangkan aspek kehadiran, hafalan qur\'an, ibadah, dan manajemen keuangan.';
    const splitClosing = doc.splitTextToSize(closingText, pageWidth - 40);
    doc.text(splitClosing, 20, yPos);
    yPos += splitClosing.length * 6 + 10;

    // Signature
    checkPageBreak(40);
    doc.text("Wassalamu'alaikum warahmatullahi wabarakatuh.", 20, yPos);
    yPos += 12;
    doc.text('Hormat kami,', 20, yPos);
    yPos += 18;
    doc.setFont('helvetica', 'bold');
    doc.text(profileData.name, 20, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(profileData.role, 20, yPos);

    // Save PDF
    doc.save(`Laporan_Bulanan_${student.name.replace(/\s+/g, '_')}_${months[currentMonthIndex]}_${currentYear}.pdf`);
  };

  const handleShowPreview = () => {
    const studentData = getStudentData();
    if (!studentData || selectedCategories.length === 0 || selectedRecipients.length === 0) return;

    const student = students.find(s => s.id.toString() === selectedStudent);
    if (!student) return;

    const today = new Date();
    const formattedDate = today.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const recipientNames = selectedRecipients.map(id => {
      const recipient = recipients.find(r => r.id === id);
      return recipient?.label || '';
    }).join(' | ');

    let htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Laporan Perkembangan Santri - ${student.name}</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap">
  <style>
    @page { margin: 1.5cm; }
    body {
      font-family: 'Nunito', sans-serif;
      background-color: #ffffff;
      color: #333;
      padding: 1rem;
      line-height: 1.6;
      font-size: 1.1rem;
    }
    .container { max-width: 800px; margin: auto; }
    h1 {
      text-align: center;
      color: #03989e;
      margin-bottom: 1.5rem;
      font-size: 1.8rem;
      text-transform: uppercase;
      font-weight: bold;
    }
    h2 {
      margin-top: 1.5rem;
      color: #444;
      border-bottom: 2px solid #eee;
      padding-bottom: 5px;
      font-size: 1.3rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    table th, table td {
      border: 1px solid #ddd;
      padding: 10px 15px;
      text-align: left;
      background-color: #ffffff;
    }
    table th {
      font-weight: 700;
      width: 40%;
    }
    .signature { margin-top: 3rem; }
    .footer {
      margin-top: 2.5rem;
      font-size: 0.95rem;
      text-align: center;
      color: #777;
      border-top: 1px solid #eee;
      padding-top: 10px;
    }
    .download-btn {
      display: block;
      width: fit-content;
      margin: 2rem auto;
      padding: 12px 24px;
      background-color: #16a34a;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
    }
    .download-btn:hover {
      background-color: #15803d;
    }
    @media print {
      .download-btn { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Laporan Perkembangan Santri</h1>

    <p>
      Kepada Yth.<br>
      ${recipientNames}
    </p>

    <p>
      Assalamu'alaikum warahmatullahi wabarakatuh.<br>
      Berikut kami sampaikan laporan perkembangan ananda <strong>${student.name}</strong> per <strong>${formattedDate}</strong>.
    </p>`;

    if (selectedCategories.includes('profile')) {
      htmlContent += `
    <h2>Data Santri</h2>
    <table>
      <tr><th>Nama</th><td>${studentData.profile.name}</td></tr>
      <tr><th>Kelas</th><td>${studentData.profile.class}</td></tr>
      <tr><th>Bulan</th><td>${months[currentMonthIndex]}</td></tr>
      <tr><th>Tahun</th><td>${currentYear}</td></tr>
    </table>`;
    }

    if (selectedCategories.includes('attendance')) {
      htmlContent += `
    <h2>Kehadiran (Per Bulan)</h2>
    <table>
      <tr><th>Hadir</th><td>${studentData.attendance.hadir} hari</td></tr>
      <tr><th>Izin</th><td>${studentData.attendance.izin} hari</td></tr>
      <tr><th>Sakit</th><td>${studentData.attendance.sakit} hari</td></tr>
      <tr><th>Tanpa Keterangan</th><td>${studentData.attendance.tanpaKeterangan} hari</td></tr>
      <tr><th>Pulang</th><td>${studentData.attendance.pulang} hari</td></tr>
    </table>`;
    }

    if (selectedCategories.includes('memorization')) {
      htmlContent += `
    <h2>Hafalan (Per Bulan)</h2>
    <table>
      <tr><th>Target Bulanan</th><td>${studentData.memorization.targetBulanan} halaman</td></tr>
      <tr><th>Pencapaian</th><td>${studentData.memorization.actual} halaman</td></tr>
      <tr><th>Persentase</th><td>${studentData.memorization.percentage}%</td></tr>
      <tr><th>Status</th><td>${studentData.memorization.status}</td></tr>
    </table>`;
    }

    if (selectedCategories.includes('activities')) {
      htmlContent += `
    <h2>Aktivitas (Per Bulan)</h2>
    <table>
      <tr><th>Bangun Tidur</th><td>${studentData.activities.bangunTidur} hari</td></tr>
      <tr><th>Tahajud</th><td>${studentData.activities.tahajud} hari</td></tr>
      <tr><th>Rawatib</th><td>${studentData.activities.rawatib} hari</td></tr>
      <tr><th>Shaum</th><td>${studentData.activities.shaum} hari</td></tr>
      <tr><th>Tilawah</th><td>${studentData.activities.tilawah} hari</td></tr>
      <tr><th>Piket</th><td>${studentData.activities.piket} hari</td></tr>
    </table>`;
    }

    if (selectedCategories.includes('finance')) {
      htmlContent += `
    <h2>Keuangan (Per Bulan)</h2>
    <table>
      <tr><th>Anggaran Bulan</th><td>${formatCurrency(studentData.finance.budget)}</td></tr>
      <tr><th>Total Pengeluaran</th><td>${formatCurrency(studentData.finance.totalExpense)}</td></tr>
      <tr><th>Persentase</th><td>${studentData.finance.percentage}%</td></tr>
      <tr><th>Status</th><td>${studentData.finance.status}</td></tr>
    </table>`;
    }

    htmlContent += `
    <p>
      Demikian laporan ini kami sampaikan. Semoga dapat menjadi bahan evaluasi dan motivasi bagi ananda untuk terus mengembangkan aspek kehadiran, hafalan qur'an, ibadah, dan manajemen keuangan.
    </p>

    <div class="signature">
      <p>
        Wassalamu'alaikum warahmatullahi wabarakatuh.<br><br>
        Hormat kami,<br><br>
        <strong>${profileData.name}</strong><br>
        ${profileData.role}
      </p>
    </div>

    <button class="download-btn" onclick="window.print()">Download PDF</button>
  </div>
</body>
</html>`;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Download & Share Report Bulanan</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
            {months[currentMonthIndex]} {currentYear}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Pilih santri dan kategori data yang ingin diunduh atau dibagikan (laporan bulanan)
      </p>

      {/* Student Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pilih Santri:
        </label>
        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih santri..." />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id.toString()}>
                {student.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Pilih Kategori:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`share-monthly-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => handleCategoryToggle(category.id)}
              />
              <label
                htmlFor={`share-monthly-${category.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {category.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Recipient Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tujuan Laporan:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recipients.map((recipient) => (
            <div key={recipient.id} className="flex items-center space-x-2">
              <Checkbox
                id={`recipient-monthly-${recipient.id}`}
                checked={selectedRecipients.includes(recipient.id)}
                onCheckedChange={() => handleRecipientToggle(recipient.id)}
              />
              <label
                htmlFor={`recipient-monthly-${recipient.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {recipient.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center mb-6">
        <Button
          onClick={handleWhatsAppShare}
          disabled={!selectedStudent || selectedCategories.length === 0 || selectedRecipients.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share via WhatsApp
        </Button>
      </div>

      {/* Preview */}
      {selectedStudent && selectedCategories.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Preview Report:</h4>
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            {(() => {
              const studentData = getStudentData();
              if (!studentData) return null;

              return (
                <>
                  {selectedCategories.includes('profile') && (
                    <div>
                      <p className="font-semibold text-sm">Data Santri</p>
                      <p className="text-xs text-gray-600">
                        {studentData.profile.name} - {studentData.profile.class} - {months[currentMonthIndex]} {currentYear}
                      </p>
                    </div>
                  )}
                  {selectedCategories.includes('attendance') && (
                    <div>
                      <p className="font-semibold text-sm">Kehadiran (Bulan)</p>
                      <p className="text-xs text-gray-600">
                        Hadir: {studentData.attendance.hadir}, Izin: {studentData.attendance.izin}, Sakit: {studentData.attendance.sakit}
                      </p>
                    </div>
                  )}
                  {selectedCategories.includes('memorization') && (
                    <div>
                      <p className="font-semibold text-sm">Hafalan (Bulan)</p>
                      <p className="text-xs text-gray-600">
                        Target: {studentData.memorization.targetBulanan} hal, Pencapaian: {studentData.memorization.actual} hal
                      </p>
                    </div>
                  )}
                  {selectedCategories.includes('activities') && (
                    <div>
                      <p className="font-semibold text-sm">Aktivitas (Bulan)</p>
                      <p className="text-xs text-gray-600">
                        Bangun Tidur: {studentData.activities.bangunTidur}, Tahajud: {studentData.activities.tahajud}, Rawatib: {studentData.activities.rawatib}
                      </p>
                    </div>
                  )}
                  {selectedCategories.includes('finance') && (
                    <div>
                      <p className="font-semibold text-sm">Keuangan (Bulan)</p>
                      <p className="text-xs text-gray-600">
                        Total Pengeluaran: {formatCurrency(studentData.finance.totalExpense)}
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-center gap-3 mt-4">
            <Button
              onClick={handleShowPreview}
              disabled={selectedRecipients.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Eye className="mr-2 h-4 w-4" />
              Tampilkan
            </Button>
            <Button
              onClick={handlePDFDownload}
              disabled={selectedRecipients.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareResultsMonthlySection;