import React, { useState } from 'react';
import { User, MapPin, Calendar, CreditCard, Phone, Mail, Clock, Edit3, Download, Lock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useStudents } from "@/contexts/StudentContext";
import { useHalaqahs } from "@/contexts/HalaqahContext";
import { useMemorization } from "@/contexts/MemorizationContext";
import { useSettings } from "@/contexts/SettingsContext";
import jsPDF from 'jspdf';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPin, setWithdrawPin] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const { toast } = useToast();
  const { students } = useStudents();
  const { halaqahs } = useHalaqahs();
  const { memorizationRecords } = useMemorization();
  const { bonusSettings, withdrawalRequests, addWithdrawalRequest } = useSettings();

  // Profile data state with localStorage persistence
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('profile_data');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      name: 'Ustadz Ahmad Wijaya',
      role: 'Guru Pendamping Senior',
      dateOfBirth: '15 Agustus 1985',
      address: 'Jl. Pesantren No. 123, Jakarta Selatan',
      bankInfo: 'BCA - 1234567890',
      phone: '+62 812-3456-7890',
      email: 'ahmad.wijaya@pesantren.com',
      workPeriod: '',
      currentBalance: 0,
      accountNumber: '4043-0101-5163-532',
      nik: '3174021585123456',
      profileImage: '',
      // School identity
      schoolName: 'ASRAMA PESANTREN PERSATUAN ISLAM 80 Al-AMIN SINDANGKASIH',
      schoolDirector: '',
      schoolAddress: 'Jl. Raya Ancol No. 27 Sindangkasih Ciamis 46268',
      schoolLogo: '',
      // Gatekeeper PIN for bonus withdrawal
      withdrawalPin: '123456',
    };
  });

  // Editable form state
  const [formData, setFormData] = useState(profileData);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setFormData({ ...formData, profileImage: imageData });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    // Include new PIN if set
    const updatedFormData = newPin.length === 6 
      ? { ...formData, withdrawalPin: newPin }
      : formData;
    
    setProfileData(updatedFormData);
    localStorage.setItem('profile_data', JSON.stringify(updatedFormData));
    setIsEditing(false);
    setNewPin('');
    toast({
      title: "Perubahan berhasil disimpan",
      description: "Data profil Anda telah diperbarui",
    });
  };

  // Get memorization data for bonus calculation from Progress Hafalan per Tanggal
  const getMemorizationData = () => {
    const halaqahData: any[] = [];
    
    // Get unique students from memorization records
    const uniqueStudents = new Map<string, any>();
    
    memorizationRecords.forEach(record => {
      if (!uniqueStudents.has(record.studentName)) {
        uniqueStudents.set(record.studentName, {
          studentName: record.studentName,
          halaqah: record.halaqah || '',
          target: record.target,
          actual: record.actual,
          totalActual: record.actual
        });
      } else {
        const existing = uniqueStudents.get(record.studentName);
        existing.totalActual += record.actual;
      }
    });
    
      // Convert to array format for table
    let counter = 1;
    uniqueStudents.forEach((data) => {
      const persentase = Math.min(Math.round((data.totalActual / data.target) * 100), 100);
      const bonusPerHalaman = bonusSettings.bonusPerHalaman;
      const idr = data.totalActual * bonusPerHalaman;
      
      halaqahData.push({
        no: counter++,
        halaqah: data.halaqah,
        nama: data.studentName,
        target: data.target,
        pencapaian: data.totalActual,
        persentase: persentase,
        idr: idr
      });
    });
    
    return halaqahData;
  };

  const memorizationData = getMemorizationData();
  
  // Calculate totals
  const averagePercentage = memorizationData.length > 0 
    ? memorizationData.reduce((sum, item) => sum + item.persentase, 0) / memorizationData.length
    : 0;
  const totalBonus = memorizationData.reduce((sum, item) => sum + item.idr, 0);
  
  // KPI Evaluation based on average percentage
  const getKPIEvaluation = (percentage: number) => {
    if (percentage >= 91) return { status: 'Bimbingan Sangat Efektif', message: 'Luar biasa! Pertahankan kinerja yang sangat baik ini!' };
    if (percentage >= 76) return { status: 'Bimbingan Efektif', message: 'Kerja bagus! Terus tingkatkan kualitas bimbingan Anda!' };
    if (percentage >= 61) return { status: 'Bimbingan Cukup Efektif', message: 'Cukup baik, masih ada ruang untuk peningkatan. Tetap semangat!' };
    return { status: 'Bimbingan Tidak Efektif', message: 'Mari tingkatkan strategi bimbingan agar lebih efektif. Semangat!' };
  };
  
  const kpiEvaluation = getKPIEvaluation(averagePercentage);

  const bonusHistory: any[] = [];

  const handleAgreeMoU = () => {
    setHasAgreed(true);
    setShowAgreementModal(true);
  };

  const handleWithdrawConfirm = () => {
    setShowWithdrawModal(false);
    setShowPinModal(true);
  };

  const handleWithdrawSubmit = () => {
    if (withdrawPin.length !== 6) {
      toast({
        title: "PIN tidak valid",
        description: "PIN harus terdiri dari 6 digit angka",
        variant: "destructive",
      });
      return;
    }

    // Verify PIN matches the stored withdrawal PIN
    const storedPin = profileData.withdrawalPin || '123456';
    if (withdrawPin !== storedPin) {
      toast({
        title: "PIN Salah",
        description: "PIN yang Anda masukkan tidak sesuai",
        variant: "destructive",
      });
      return;
    }

    // Add withdrawal request to settings context
    const studentReports = memorizationData.map(item => ({
      nama: item.nama,
      halaqah: item.halaqah,
      pencapaian: item.pencapaian,
      bonus: item.idr
    }));
    
    addWithdrawalRequest({
      userName: profileData.name,
      userEmail: profileData.email || 'email@example.com',
      userPhone: profileData.phone,
      bankInfo: profileData.bankInfo,
      accountNumber: profileData.accountNumber || '',
      amount: totalBonus,
      requestDate: new Date().toISOString(),
      studentReports
    });

    // Send WhatsApp notification
    const message = `Pengajuan Penarikan Dana%0A%0AData Pemohon:%0A%0ANama: ${profileData.name}%0AEmail: ${profileData.email || 'nashers.manziel@gmail.com'}%0ANo. HP: ${profileData.phone}%0AAlamat: ${profileData.address}%0A%0ATanggal Pengajuan:%0A${new Date().toLocaleDateString('id-ID')}%0A%0ANominal Pengajuan:%0ARp ${totalBonus.toLocaleString('id-ID')}%0A%0AInformasi Rekening Penerima:%0A${profileData.bankInfo}%0ANo. Rekening: ${profileData.accountNumber || '4043-0101-5163-532'}%0AAtас Nama: ${profileData.name}%0A%0ATerima Kasih.`;
    const whatsappUrl = `https://wa.me/${bonusSettings.withdrawalWhatsapp}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    
    setShowPinModal(false);
    setWithdrawPin('');
    setWithdrawAmount('');
    
    toast({
      title: "Pengajuan berhasil dikirim",
      description: "Pengajuan penarikan dana telah dikirim dan menunggu validasi admin",
    });
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Set font to Roboto
    doc.setFont('helvetica', 'normal');
    
    // Add institution name (center, bold, size 12)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const institutionText = profileData.schoolName || 'ASRAMA PESANTREN PERSATUAN ISLAM 80 Al-AMIN SINDANGKASIH';
    const institutionWidth = doc.getTextWidth(institutionText);
    doc.text(institutionText, (210 - institutionWidth) / 2, 20);
    
    // Add address (center, normal, size 12)
    doc.setFont('helvetica', 'normal');
    const addressText = profileData.schoolAddress || 'Jl. Raya Ancol No. 27 Sindangkasih Ciamis 46268';
    const addressWidth = doc.getTextWidth(addressText);
    doc.text(addressText, (210 - addressWidth) / 2, 30);
    
    // Add title (center, bold, size 12)
    doc.setFont('helvetica', 'bold');
    const titleText = 'Memorandum of Understanding (MoU)';
    const titleWidth = doc.getTextWidth(titleText);
    doc.text(titleText, (210 - titleWidth) / 2, 50);
    
    // Add subtitle (center, bold, size 12)
    const subtitle1 = `Antara ${profileData.schoolDirector || 'Mudir'} dan Musyrif/Muhafizh`;
    const subtitle1Width = doc.getTextWidth(subtitle1);
    doc.text(subtitle1, (210 - subtitle1Width) / 2, 60);
    
    const subtitle2 = 'Tentang: Amanah Pengasuhan, Pembinaan SKL Tahfizh, dan Sistem Penilaian Kinerja';
    const subtitle2Width = doc.getTextWidth(subtitle2);
    doc.text(subtitle2, (210 - subtitle2Width) / 2, 70);
    
    // Add complete content (justify, normal, size 12)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    let yPos = 90;
    const content = [
      '',
      'I. Latar Belakang',
      'Dalam rangka mencapai Standar Kompetensi Lulusan (SKL) bidang tahfizh, dibutuhkan sinergi antara kepala lembaga dan para musyrif/muhafizh dengan pembagian tugas, target, hak, serta sistem penilaian kinerja yang jelas dan terukur.',
      '',
      'II. Tujuan Kesepakatan',
      '• Menjamin pencapaian target hafalan santri (SKL)',
      '• Menegaskan amanah dan tanggung jawab musyrif dalam pembinaan tahfizh',
      '• Memberikan kejelasan sistem penghargaan, evaluasi, dan bonus capaian berbasis kinerja',
      '',
      'III. Amanah dan Tanggung Jawab Musyrif/Muhafizh',
      '• Melaksanakan pembinaan tahfizh sesuai target yang telah ditetapkan',
      '• Memberikan laporan perkembangan santri secara berkala',
      '• Menjaga amanah dalam pengelolaan proses pembelajaran',
      '• Membangun komunikasi yang baik dengan santri dan orangtua',
      '',
      'IV. Hak Musyrif/Muhafizh',
      `• Gaji pokok bulanan sebesar maksimal Rp${bonusSettings.gajiPokok.toLocaleString('id-ID')}, diberikan secara tetap tanpa bergantung pada capaian target.`,
      '• Bonus capaian bulanan:',
      `   - Dihitung dari: Gaji pokok + Bonus hafalan.`,
      `   - Bonus hafalan = Jumlah halaman × Rp${bonusSettings.bonusPerHalaman.toLocaleString('id-ID')}.`,
      `   - Contoh: Gaji Pokok Rp${bonusSettings.gajiPokok.toLocaleString('id-ID')} + Bonus hafalan 200 halaman = Rp${(bonusSettings.gajiPokok + 200 * bonusSettings.bonusPerHalaman).toLocaleString('id-ID')}.`,
      '• Total penerimaan = gaji pokok + bonus hafalan.',
      '',
      'V. Penutup',
      'Demikian kesepakatan ini dibuat atas dasar musyawarah dan mufakat untuk mencapai tujuan bersama dalam pembinaan santri yang Islami.',
      '',
      'Wallaahu a\'lam bishawab.',
      '',
      'Tanda Tangan:',
      '',
      profileData.schoolDirector || 'Mudir',
      '',
      '',
      '(_________________)',
      '',
      'Musyrif/Muhafizh',
      '',
      '',
      `(${profileData.name})`,
      `NIK: ${profileData.nik}`,
      ''
    ];

    content.forEach(line => {
      if (line.trim() === '') {
        yPos += 6;
      } else if (line.startsWith('I.') || line.startsWith('II.') || line.startsWith('III.') || line.startsWith('IV.') || line.startsWith('V.')) {
        doc.setFont('helvetica', 'bold');
        doc.text(line, 20, yPos);
        doc.setFont('helvetica', 'normal');
        yPos += 8;
      } else if (line.includes('Tanda Tangan:') || line.includes('Kepala Lembaga') || line.includes('Musyrif/Muhafizh') || line.includes('(') || line.includes('NIK:')) {
        // Center signature section
        const lineWidth = doc.getTextWidth(line);
        doc.text(line, (210 - lineWidth) / 2, yPos);
        yPos += 8;
      } else {
        const splitText = doc.splitTextToSize(line, 170);
        doc.text(splitText, 20, yPos);
        yPos += splitText.length * 6;
      }
      
      // Add new page if needed
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    doc.save('MoU_Agreement.pdf');
  };

  const handleDownloadBonusPDF = () => {
    const doc = new jsPDF();
    const pageWidth = 210;
    const margin = 20;
    
    // Add logo if available
    if (profileData.schoolLogo) {
      try {
        doc.addImage(profileData.schoolLogo, 'PNG', (pageWidth - 25) / 2, 10, 25, 25);
      } catch (e) {
        console.log('Could not add logo to PDF');
      }
    }
    
    // Header - Institution name
    let yPos = profileData.schoolLogo ? 42 : 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    const institutionText = profileData.schoolName || 'ASRAMA PESANTREN PERSATUAN ISLAM 80 Al-AMIN SINDANGKASIH';
    const institutionWidth = doc.getTextWidth(institutionText);
    doc.text(institutionText, (pageWidth - institutionWidth) / 2, yPos);
    
    // Address
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const addressText = profileData.schoolAddress || 'Jl. Raya Ancol No. 27 Sindangkasih Ciamis 46268';
    const addressWidth = doc.getTextWidth(addressText);
    doc.text(addressText, (pageWidth - addressWidth) / 2, yPos);
    
    // Horizontal line
    yPos += 5;
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    // Title
    yPos += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    const titleText = 'LAPORAN BONUS HAFALAN';
    const titleWidth = doc.getTextWidth(titleText);
    doc.text(titleText, (pageWidth - titleWidth) / 2, yPos);
    
    // Applicant info section
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Data Pemohon', margin, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Two column layout for applicant info
    const col1X = margin;
    const col2X = 70;
    
    doc.text('Nama', col1X, yPos);
    doc.text(`: ${profileData.name}`, col2X, yPos);
    yPos += 6;
    doc.text('Jabatan', col1X, yPos);
    doc.text(`: ${profileData.role}`, col2X, yPos);
    yPos += 6;
    doc.text('Gaji Pokok', col1X, yPos);
    doc.text(`: Rp ${bonusSettings.gajiPokok.toLocaleString('id-ID')}`, col2X, yPos);
    yPos += 6;
    doc.text('Bonus per Halaman', col1X, yPos);
    doc.text(`: Rp ${bonusSettings.bonusPerHalaman.toLocaleString('id-ID')}`, col2X, yPos);
    
    // Student report table
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Laporan Lengkap Per Santri', margin, yPos);
    
    // Table header
    yPos += 8;
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 8, 'F');
    doc.setFontSize(9);
    doc.text('No', margin + 2, yPos);
    doc.text('Nama Santri', margin + 15, yPos);
    doc.text('Halaqah', margin + 65, yPos);
    doc.text('Pencapaian', margin + 100, yPos);
    doc.text('Bonus (Rp)', margin + 135, yPos);
    
    // Table rows
    doc.setFont('helvetica', 'normal');
    yPos += 8;
    
    memorizationData.forEach((item, idx) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(String(idx + 1), margin + 2, yPos);
      doc.text(item.nama.substring(0, 20), margin + 15, yPos);
      doc.text(item.halaqah.substring(0, 15), margin + 65, yPos);
      doc.text(`${item.pencapaian} hlm`, margin + 100, yPos);
      doc.text(item.idr.toLocaleString('id-ID'), margin + 135, yPos);
      yPos += 7;
    });
    
    // Summary section
    yPos += 10;
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Total Bonus Hafalan', margin, yPos);
    doc.text(`: Rp ${totalBonus.toLocaleString('id-ID')}`, col2X, yPos);
    yPos += 6;
    doc.text('Gaji Pokok', margin, yPos);
    doc.text(`: Rp ${bonusSettings.gajiPokok.toLocaleString('id-ID')}`, col2X, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Total Penerimaan', margin, yPos);
    doc.text(`: Rp ${(bonusSettings.gajiPokok + totalBonus).toLocaleString('id-ID')}`, col2X, yPos);
    
    // Note section
    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Catatan: Penarikan hanya dapat dilakukan di akhir semester.', margin, yPos);
    doc.setTextColor(0, 0, 0);
    
    // Date and Signature section - at the bottom
    yPos += 20;
    const currentDate = new Date().toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    
    // Right-aligned date above signatures
    const dateText = `Ciamis, ${currentDate}`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(dateText, pageWidth - margin - doc.getTextWidth(dateText), yPos);
    
    // Signature section
    yPos += 15;
    const leftSignX = margin + 25;
    const rightSignX = pageWidth - margin - 45;
    
    doc.text('Pemohon,', leftSignX, yPos);
    doc.text('Admin,', rightSignX, yPos);
    
    yPos += 35;
    // Signature lines - centered under labels
    doc.line(leftSignX - 15, yPos, leftSignX + 35, yPos);
    doc.line(rightSignX - 15, yPos, rightSignX + 35, yPos);
    
    yPos += 6;
    // Names in parentheses - centered under lines
    const pemohonName = `(${profileData.name})`;
    const adminName = '(                              )';
    
    const pemohonNameX = leftSignX + 10 - (doc.getTextWidth(pemohonName) / 2);
    const adminNameX = rightSignX + 10 - (doc.getTextWidth(adminName) / 2);
    
    doc.text(pemohonName, pemohonNameX, yPos);
    doc.text(adminName, adminNameX, yPos);
    
    doc.save('Laporan_Bonus_Hafalan.pdf');
  };

  // Get user's withdrawal requests
  const userWithdrawalRequests = withdrawalRequests.filter(
    req => req.userName === profileData.name
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Profile</h1>
        <p className="text-gray-600">Informasi data pribadi</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Profile - Solid Blue */}
        <div className="px-6 py-8 bg-[#5db3d2]">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Avatar with upload overlay */}
            <div className="relative group">
              <Avatar className="w-24 h-24 border-4 border-white/30 shadow-lg">
                <AvatarImage src={profileData.profileImage || "/placeholder.svg"} alt="Profile" />
                <AvatarFallback className="bg-white/20 text-white text-2xl">
                  <User size={40} />
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <User className="w-8 h-8 text-white" />
                </label>
              )}
            </div>
            
            {/* Name and Role */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-white">{profileData.name}</h2>
              <p className="text-white/80">{profileData.role}</p>
            </div>
            
            {/* Edit button */}
            <Button 
              onClick={() => {
                setFormData(profileData);
                setIsEditing(!isEditing);
              }} 
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white flex items-center gap-2"
            >
              <Edit3 size={16} />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="p-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Edit Profile</TabsTrigger>
              <TabsTrigger value="mou">MoU</TabsTrigger>
              <TabsTrigger value="bonus">Bonus</TabsTrigger>
            </TabsList>
            
            {/* Edit Profile Tab */}
            <TabsContent value="profile" className="space-y-6 mt-6">
              {/* View Mode - Inline Layout */}
              {!isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="w-36 text-sm text-gray-500 flex-shrink-0">Nama Lengkap</span>
                    <span className="font-medium text-gray-800">: {profileData.name}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="w-36 text-sm text-gray-500 flex-shrink-0">Jabatan</span>
                    <span className="font-medium text-gray-800">: {profileData.role}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="w-36 text-sm text-gray-500 flex-shrink-0">NIK</span>
                    <span className="font-medium text-gray-800">: {profileData.nik}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="w-36 text-sm text-gray-500 flex-shrink-0">Tanggal Lahir</span>
                    <span className="font-medium text-gray-800">: {profileData.dateOfBirth}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="w-36 text-sm text-gray-500 flex-shrink-0">Nomor HP</span>
                    <span className="font-medium text-gray-800">: {profileData.phone}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="w-36 text-sm text-gray-500 flex-shrink-0">Email</span>
                    <span className="font-medium text-gray-800">: {profileData.email}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="w-36 text-sm text-gray-500 flex-shrink-0">Rekening & Bank</span>
                    <span className="font-medium text-gray-800">: {profileData.bankInfo}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100 md:col-span-2">
                    <span className="w-36 text-sm text-gray-500 flex-shrink-0">Alamat</span>
                    <span className="font-medium text-gray-800">: {profileData.address}</span>
                  </div>
                </div>
              )}

              {/* Edit Mode - Form Inputs */}
              {isEditing && (
                <>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={formData.profileImage || "/placeholder.svg"} alt="Profile" />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                        <User size={24} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Label>Upload Gambar Profil</Label>
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nama Lengkap</Label>
                        <Input 
                          value={formData.name} 
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Jabatan</Label>
                        <Input 
                          value={formData.role} 
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Tanggal Lahir</Label>
                        <Input 
                          value={formData.dateOfBirth} 
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Nomor HP</Label>
                        <Input 
                          value={formData.phone} 
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input 
                          value={formData.email} 
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Alamat</Label>
                        <Textarea 
                          value={formData.address} 
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Rekening & Bank</Label>
                        <Input 
                          value={formData.bankInfo} 
                          onChange={(e) => setFormData({ ...formData, bankInfo: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>NIK</Label>
                        <Input 
                          value={formData.nik} 
                          onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Ubah PIN Penarikan (6 digit)</Label>
                        <Input 
                          type="password" 
                          placeholder="Masukkan PIN baru (6 digit)" 
                          maxLength={6} 
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">PIN ini digunakan sebagai gatekeeper untuk penarikan bonus</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Identitas Sekolah Section */}
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-semibold">Identitas Sekolah</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nama Sekolah</Label>
                      <Input 
                        value={formData.schoolName || ''} 
                        onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Masukkan nama sekolah"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Nama Mudir</Label>
                      <Input 
                        value={formData.schoolDirector || ''} 
                        onChange={(e) => setFormData({ ...formData, schoolDirector: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Masukkan nama mudir"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Alamat Sekolah</Label>
                      <Textarea 
                        value={formData.schoolAddress || ''} 
                        onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Masukkan alamat sekolah"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {isEditing && (
                      <div className="space-y-2">
                        <Label>Upload Logo Sekolah</Label>
                        <Input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData({ ...formData, schoolLogo: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                    )}
                    
                    {formData.schoolLogo && (
                      <div className="mt-4">
                        <Label className="mb-2 block">Preview Logo Sekolah</Label>
                        <img 
                          src={formData.schoolLogo} 
                          alt="Logo Sekolah" 
                          className="w-24 h-24 object-contain border rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Hak Musyrif/Muhafizh Section - Read Only from Settings */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Hak Musyrif/Muhafizh</h3>
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">(Diatur di Settings)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Gaji Pokok (Rp)</Label>
                    <Input 
                      type="number"
                      value={bonusSettings.gajiPokok}
                      disabled={true}
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bonus Hafalan per Halaman (Rp)</Label>
                    <Input 
                      type="number"
                      value={bonusSettings.bonusPerHalaman}
                      disabled={true}
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>
              
              {/* Password section removed */}
              
              {isEditing && (
                <div className="flex gap-4">
                  <Button onClick={handleSaveProfile} className="bg-[#5db3d2] hover:bg-[#4a9ab8] text-white">Simpan Perubahan</Button>
                  <Button variant="outline" onClick={() => {
                    setFormData(profileData);
                    setIsEditing(false);
                  }}>
                    Batal
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* MoU Tab */}
            <TabsContent value="mou" className="mt-6">
              <div className="bg-white p-8 rounded-lg border shadow-sm font-roboto">
                <div className="text-center mb-8">
                  {profileData.schoolLogo ? (
                    <img 
                      src={profileData.schoolLogo} 
                      alt="Logo Sekolah" 
                      className="w-16 h-16 object-contain mx-auto mb-4"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">API</span>
                    </div>
                  )}
                  <h1 className="text-xl font-bold text-gray-800">
                    Memorandum of Understanding (MoU)
                  </h1>
                  <p className="text-gray-600 mt-2">Antara {profileData.schoolDirector || 'Mudir'} dan Musyrif/Muhafizh</p>
                  <p className="text-gray-600">Tentang: Amanah Pengasuhan, Pembinaan SKL Tahfizh, dan Sistem Penilaian Kinerja</p>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-800">{profileData.schoolName || 'ASRAMA PESANTREN PERSATUAN ISLAM 80 Al-AMIN SINDANGKASIH'}</p>
                    <p className="text-xs text-blue-600">{profileData.schoolAddress || 'Jl. Raya Ancol No. 27 Sindangkasih Ciamis 46268'}</p>
                  </div>
                </div>

                <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
                  <section>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">I. Latar Belakang</h2>
                    <p>Dalam rangka mencapai Standar Kompetensi Lulusan (SKL) bidang tahfizh, dibutuhkan sinergi antara kepala lembaga dan para musyrif/muhafizh dengan pembagian tugas, target, hak, serta sistem penilaian kinerja yang jelas dan terukur.</p>
                  </section>

                  <section>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">II. Tujuan Kesepakatan</h2>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Menjamin pencapaian target hafalan santri (SKL).</li>
                      <li>Menegaskan amanah dan tanggung jawab musyrif dalam pembinaan tahfizh.</li>
                      <li>Memberikan kejelasan sistem penghargaan, evaluasi, dan bonus capaian berbasis kinerja.</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">III. Ketentuan Amanah</h2>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Setiap musyrif diberi amanah maksimal 20 orang santri.</li>
                      <li>Target capaian SKL untuk setiap santri adalah 3 juz dalam waktu 2 tahun.</li>
                      <li>Musyrif bertanggung jawab dalam:
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                          <li>Pembinaan hafalan harian (setoran, murojaah).</li>
                          <li>Pencatatan progres hafalan.</li>
                          <li>Membina kedisiplinan dan motivasi santri.</li>
                          <li>Berkoordinasi aktif dengan kepala tahfizh/asrama.</li>
                        </ul>
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">IV. Hak Musyrif/Muhafizh</h2>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Gaji pokok bulanan sebesar maksimal Rp{bonusSettings.gajiPokok.toLocaleString('id-ID')}, diberikan secara tetap tanpa bergantung pada capaian target.</li>
                      <li>Bonus capaian bulanan:
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                          <li>Dihitung dari: Gaji pokok + Bonus hafalan.</li>
                          <li>Bonus hafalan = Jumlah halaman × Rp{bonusSettings.bonusPerHalaman.toLocaleString('id-ID')}.</li>
                          <li>Contoh: Gaji Pokok Rp{bonusSettings.gajiPokok.toLocaleString('id-ID')} + Bonus hafalan (200 halaman × Rp{bonusSettings.bonusPerHalaman.toLocaleString('id-ID')}) = Rp{(bonusSettings.gajiPokok + 200 * bonusSettings.bonusPerHalaman).toLocaleString('id-ID')}.</li>
                        </ul>
                      </li>
                      <li>Total penerimaan = gaji pokok + bonus hafalan.</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">V. Evaluasi dan Rotasi</h2>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Evaluasi dilakukan setiap bulan untuk memantau pencapaian SKL dan kinerja.</li>
                      <li>Jika selama 2 tahun rata-rata pencapaian bulanan di bawah 80%, maka akan dilakukan rotasi amanah oleh pihak kepala/lembaga.</li>
                      <li>Musyrif yang dirotasi berhak mendapatkan pembinaan dan penugasan sesuai kompetensinya.</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">VI. Penutup</h2>
                    <p>Kesepakatan ini disusun atas dasar amanah, kepercayaan, dan semangat kolaboratif demi kemajuan dan keberkahan lembaga, serta demi tumbuhnya generasi penghafal Al-Qur'an yang berkualitas.</p>
                  </section>

                  <section>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">VII. Tanda Tangan</h2>
                    <p className="mb-4">Disepakati dan ditandatangani pada tanggal: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    
                    <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t">
                      <div className="text-center">
                        <p className="mb-16">{profileData.schoolDirector || 'Mudir'}</p>
                        <div className="border-b border-gray-400 w-32 mx-auto mb-2"></div>
                        <p className="text-xs">Tanda Tangan & Nama</p>
                      </div>
                      <div className="text-center">
                        <p className="mb-16">{profileData.name}</p>
                        <div className="border-b border-gray-400 w-32 mx-auto mb-2"></div>
                        <p className="text-xs">NIK. {profileData.nik}</p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Agreement Section */}
                {!hasAgreed && (
                  <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="agreement" 
                        checked={false}
                        onCheckedChange={(checked) => {
                          if (checked) handleAgreeMoU();
                        }}
                      />
                      <Label htmlFor="agreement" className="text-sm">
                        Saya telah membaca dan memahami seluruh isi MoU ini
                      </Label>
                    </div>
                  </div>
                )}

                {hasAgreed && (
                  <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-green-700 font-semibold">✓ Anda telah menyetujui MoU ini</p>
                  </div>
                )}

                <div className="mt-8 text-center">
                  <Button onClick={handleDownloadPDF} className="flex items-center gap-2 mx-auto bg-[#5db3d2] hover:bg-[#4a9ab8] text-white">
                    <Download size={16} />
                    Download PDF
                  </Button>
                </div>
              </div>

              {/* Agreement Confirmation Modal */}
              <Dialog open={showAgreementModal} onOpenChange={setShowAgreementModal}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>MoU Telah Disetujui</DialogTitle>
                  </DialogHeader>
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-green-600 text-2xl">✓</span>
                    </div>
                    <p className="text-lg font-semibold mb-2">Anda telah menyetujui MoU</p>
                    <p className="text-gray-600 mb-4">Selamat Bekerja Dengan Amanah dan Penuh Tanggung Jawab</p>
                    <p className="text-blue-600 font-semibold">Barakallahu Fiik</p>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setShowAgreementModal(false)} className="w-full bg-[#5db3d2] hover:bg-[#4a9ab8] text-white">
                      Terima Kasih
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Bonus Tab */}
            <TabsContent value="bonus" className="mt-6">
              <div className="space-y-6">
                {/* Bonus Display - Two Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Total Accumulated Bonus */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-600">Total Akumulasi Bonus</h3>
                        <p className="text-2xl font-bold text-green-600 mt-2">
                          Rp {totalBonus.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="text-green-500 text-2xl font-bold opacity-50">
                        💰
                      </div>
                    </div>
                  </div>
                  
                  {/* Total Withdrawn */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-600">Total Bonus Dicairkan</h3>
                        <p className="text-2xl font-bold text-blue-600 mt-2">
                          Rp {userWithdrawalRequests
                            .filter(r => r.status === 'completed')
                            .reduce((sum, r) => sum + r.amount, 0)
                            .toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="text-blue-500 text-2xl font-bold opacity-50">
                        💸
                      </div>
                    </div>
                  </div>
                </div>

                {/* Memorization Data Table */}
                <div className="bg-white rounded-lg border">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Data Hafalan untuk Perhitungan Bonus</h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Halaqah</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Target (Halaman)</TableHead>
                        <TableHead>Pencapaian (Halaman)</TableHead>
                        <TableHead>Persentase</TableHead>
                        <TableHead>IDR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {memorizationData.length > 0 ? memorizationData.map((item) => {
                        return (
                          <TableRow key={item.no}>
                            <TableCell>{item.no}</TableCell>
                            <TableCell>{item.halaqah}</TableCell>
                            <TableCell>{item.nama}</TableCell>
                            <TableCell>{item.target}</TableCell>
                            <TableCell>{item.pencapaian}</TableCell>
                            <TableCell>{item.persentase}%</TableCell>
                            <TableCell>Rp {item.idr.toLocaleString('id-ID')}</TableCell>
                          </TableRow>
                        );
                      }) : (
                        <TableRow>
                          <TableCell colSpan={7} className="px-6 py-8 text-center text-gray-500">
                            Belum ada data hafalan
                          </TableCell>
                        </TableRow>
                      )}
                      {memorizationData.length > 0 && (
                        <TableRow className="bg-gray-50 font-semibold">
                          <TableCell colSpan={6}>Total Bonus</TableCell>
                          <TableCell>Rp {totalBonus.toLocaleString('id-ID')}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Hasil Bimbingan Summary */}
                {memorizationData.length > 0 && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-3">Perhitungan Hasil Bimbingan</h4>
                      <div className="space-y-2 text-sm text-blue-700">
                        <div>
                          <span className="font-medium">1. Persentase Hasil Bimbingan:</span>
                          <div className="mt-1 ml-4">
                            <span className="font-bold">{Math.round(averagePercentage)}%</span> - <span className="font-semibold">{kpiEvaluation.status}</span>
                            <p className="text-xs mt-1 italic">{kpiEvaluation.message}</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-blue-200">
                          <span className="font-medium">2. Perolehan bonus sebesar:</span>
                          <div className="mt-1 ml-4">
                            <span className="font-bold text-lg">Rp {totalBonus.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transaction Details Table */}
                <div className="bg-white rounded-lg border">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Detail Transaksi Penarikan</h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Jumlah Transaksi</TableHead>
                        <TableHead>Saldo Akhir</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userWithdrawalRequests.length > 0 ? userWithdrawalRequests.map((req, idx) => {
                        // Calculate running balance - show 0 if this request is completed
                        const completedAmountUpToHere = userWithdrawalRequests
                          .slice(0, idx + 1)
                          .filter(r => r.status === 'completed')
                          .reduce((sum, r) => sum + r.amount, 0);
                        const runningBalance = req.status === 'completed' ? 0 : Math.max(0, totalBonus - completedAmountUpToHere);
                        
                        return (
                          <TableRow key={req.id}>
                            <TableCell>{new Date(req.requestDate).toLocaleDateString('id-ID')}</TableCell>
                            <TableCell>Rp {req.amount.toLocaleString('id-ID')}</TableCell>
                            <TableCell>Rp {runningBalance.toLocaleString('id-ID')}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  req.status === 'completed' ? 'default' :
                                  req.status === 'approved' ? 'secondary' :
                                  req.status === 'rejected' ? 'destructive' : 'outline'
                                }
                              >
                                {req.status === 'pending' && 'Menunggu'}
                                {req.status === 'approved' && 'Disetujui'}
                                {req.status === 'completed' && 'Berhasil'}
                                {req.status === 'rejected' && 'Ditolak'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      }) : (
                        <TableRow>
                          <TableCell colSpan={4} className="px-6 py-8 text-center text-gray-500">
                            Belum ada transaksi penarikan
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Withdraw and Download Buttons */}
                <div className="text-center space-y-4">
                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={handleDownloadBonusPDF}
                      className="bg-[#5db3d2] hover:bg-[#4a9ab8] text-white flex items-center gap-2"
                    >
                      <Download size={16} />
                      Download
                    </Button>
                    <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
                      <DialogTrigger asChild>
                        <Button 
                          className="bg-orange-600 hover:bg-orange-700"
                          onClick={() => setWithdrawAmount(totalBonus.toString())}
                        >
                          Ajukan Penarikan
                        </Button>
                      </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Konfirmasi Penarikan Dana</DialogTitle>
                        <DialogDescription>
                          Apakah Anda yakin akan melakukan penarikan sebesar Rp {totalBonus.toLocaleString('id-ID')}?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowWithdrawModal(false)}>
                          Batal
                        </Button>
                        <Button onClick={handleWithdrawConfirm} className="bg-[#5db3d2] hover:bg-[#4a9ab8] text-white">
                          Ya, Lanjutkan
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  </div>
                  
                  {/* Updated Withdrawal Notes */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                    <p className="font-semibold mb-2">📋 Ketentuan Penarikan Dana:</p>
                    <ul className="space-y-1 text-xs text-left">
                      <li>• Minimal penarikan: <span className="font-semibold">Rp 500.000</span></li>
                      <li>• <span className="font-semibold">Penarikan hanya dapat dilakukan di akhir semester</span></li>
                      <li>• Wajib melampirkan dokumen bukti penarikan dalam format <span className="font-semibold">PDF</span></li>
                      <li>• Lampirkan <span className="font-semibold">laporan lengkap setiap santri</span> dalam dokumen</li>
                      <li>• Proses verifikasi membutuhkan waktu 1-3 hari kerja</li>
                      <li>• Pastikan data rekening sudah benar sebelum mengajukan</li>
                    </ul>
                  </div>
                </div>

                {/* PIN Modal */}
                <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>PIN Penarikan Dana</DialogTitle>
                      <DialogDescription>
                        Masukkan PIN khusus untuk melakukan penarikan dana
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>PIN Penarikan (6 digit)</Label>
                        <Input
                          type="password"
                          placeholder="Masukkan PIN"
                          value={withdrawPin}
                          onChange={(e) => setWithdrawPin(e.target.value)}
                          maxLength={6}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowPinModal(false)}>
                        Batal
                      </Button>
                      <Button onClick={handleWithdrawSubmit} className="bg-[#5db3d2] hover:bg-[#4a9ab8] text-white">
                        Kirim Pengajuan
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;