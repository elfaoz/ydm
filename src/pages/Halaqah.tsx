import React, { useState } from 'react';
import { Book, Plus, TrendingUp, Calendar, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MemorizationTable from '../components/MemorizationTable';
import DetailMemorizationModal from '../components/DetailMemorizationModal';
import EditMemorizationModal from '../components/EditMemorizationModal';
import SantriRanking from '../components/SantriRanking';
import MemorizationMonthlySection from '../components/MemorizationMonthlySection';
import MemorizationSemesterSection from '../components/MemorizationSemesterSection';
import { MemorizationRecord } from '@/contexts/MemorizationContext';
import { useStudents } from '@/contexts/StudentContext';
import { useHalaqahs } from '@/contexts/HalaqahContext';
import { useMemorization } from '@/contexts/MemorizationContext';
import { surahs, getSurahByName } from '@/utils/surahData';
import { getJuzData } from '@/utils/juzData';
import { toast } from 'sonner';
import GatekeeperModal from '@/components/GatekeeperModal';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Halaqah: React.FC = () => {
    const { students } = useStudents();
    const { halaqahs } = useHalaqahs();
    const { memorizationRecords, addMemorizationRecord, updateMemorizationRecord, deleteMemorizationRecord } = useMemorization();
    const [selectedHalaqah, setSelectedHalaqah] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [hasAccess, setHasAccess] = useState(false);
    
    // Daily Records filters
    const [recordsSelectedHalaqah, setRecordsSelectedHalaqah] = useState('');
    const [recordsSelectedStudent, setRecordsSelectedStudent] = useState('');
    
    // Edit and delete modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<MemorizationRecord | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<MemorizationRecord | null>(null);
    
    // Input form state
    const [memorizationTarget, setMemorizationTarget] = useState('');
    const [memorizationActual, setMemorizationActual] = useState('');
    const [selectedJuz, setSelectedJuz] = useState('');
    const [selectedSurah, setSelectedSurah] = useState('');
    const [ayahFrom, setAyahFrom] = useState('');
    const [ayahTo, setAyahTo] = useState('');
    
    
    // Detail modal state
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<MemorizationRecord | null>(null);

    // --- KODE LOGIKA JUZ BARU ---
    const currentJuzData = selectedJuz ? getJuzData(Number(selectedJuz)) : null;
    const availableSurahs = currentJuzData ? currentJuzData.ranges.map(r => r.surahName) : [];
    const selectedRange = currentJuzData?.ranges.find(r => r.surahName === selectedSurah); // Range untuk Surah 1
    const availableAyahs = selectedRange
        ? Array.from({ length: selectedRange.ayahTo - selectedRange.ayahFrom + 1 },
                      (_, i) => selectedRange.ayahFrom + i)
        : [];
    // --- AKHIR KODE LOGIKA JUZ BARU ---

    const getStudentsByHalaqah = (halaqahId: string) => {
        if (!halaqahId) return students;
        const halaqah = halaqahs.find(h => h.id.toString() === halaqahId);
        if (!halaqah?.selectedStudents) return [];
        
        return students.filter(student => 
            halaqah.selectedStudents?.includes(student.id.toString())
        );
    };

    const filteredStudents = getStudentsByHalaqah(selectedHalaqah);

    const handleSaveMemorization = () => {
        if (!recordsSelectedStudent || !memorizationTarget || !memorizationActual) return;
        
        const student = students.find(s => s.id.toString() === recordsSelectedStudent);
        const selectedSurahData = surahs.find(s => s.name === selectedSurah);
        if (!student) return;

        const target = parseInt(memorizationTarget);
        const actual = parseInt(memorizationActual);
        const percentage = Math.round((actual / target) * 100);
        
        let status = 'Not Achieved';
        if (percentage === 100) status = 'Fully Achieved';
        else if (percentage >= 75) status = 'Achieved';

        // Find student's halaqah
        const studentHalaqah = halaqahs.find(h => 
            h.selectedStudents?.includes(student.id.toString())
        );

        // Collect all surah details
        const surahDetails = [];
        if (selectedSurah && ayahFrom && ayahTo) {
            const surahData1 = getSurahByName(selectedSurah);
            surahDetails.push({
                surahName: surahData1?.name || selectedSurah,
                ayahFrom: parseInt(ayahFrom),
                ayahTo: parseInt(ayahTo),
            });
        }

        const newRecord: MemorizationRecord = {
            id: `${recordsSelectedStudent}-${selectedDate}-${Date.now()}`,
            studentName: student.name,
            date: selectedDate,
            target,
            actual,
            percentage,
            status,
            halaqah: studentHalaqah?.name || '-',
            level: studentHalaqah?.level || 'Tahfidz 1',
            pembina: studentHalaqah?.pembina || 'Ustadz Ahmad',
            memorizationDetail: {
                juz: parseInt(selectedJuz) || 1,
                pageFrom: 1, // Logika ini mungkin perlu diperbaiki
                pageTo: actual, // Logika ini mungkin perlu diperbaiki
                surahDetails,
            }
        };

        addMemorizationRecord(newRecord);

        // Reset form
        setMemorizationTarget('');
        setMemorizationActual('');
        setSelectedJuz('');
        setSelectedSurah('');
        setAyahFrom('');
        setAyahTo('');
        toast.success('Data hafalan berhasil ditambahkan');
    };

    const handleDetail = (student: any) => {
        // This would be implemented when you have actual memorization data
        const record: MemorizationRecord = {
            id: student.id.toString(),
            studentName: student.name,
            date: new Date().toISOString().split('T')[0],
            target: 0,
            actual: 0,
            percentage: 0,
            status: 'No data',
            memorizationDetail: {
                juz: 1,
                pageFrom: 1,
                pageTo: 1,
                surahDetails: [],
            }
        };
        setSelectedRecord(record);
        setIsDetailModalOpen(true);
    };

    const handleEditRecord = (record: MemorizationRecord) => {
        setEditingRecord(record);
        setIsEditModalOpen(true);
    };

    const handleUpdateRecord = (updatedRecord: MemorizationRecord) => {
        updateMemorizationRecord(updatedRecord.id, updatedRecord);
        toast.success('Data hafalan berhasil diperbarui');
        setIsEditModalOpen(false);
        setEditingRecord(null);
    };

    const handleDeleteClick = (record: MemorizationRecord) => {
        setRecordToDelete(record);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (recordToDelete) {
            deleteMemorizationRecord(recordToDelete.id);
            toast.success('Data hafalan berhasil dihapus');
            setIsDeleteDialogOpen(false);
            setRecordToDelete(null);
        }
    };

    const getPercentageColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-600 bg-green-100';
        if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getProgressBarColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <>
            <GatekeeperModal 
                isOpen={!hasAccess}
                onAccessGranted={() => setHasAccess(true)}
                pageName="Memorization"
            />
            
            {hasAccess && (
                <div className="p-6">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Memorization</h1>
                        <p className="text-gray-600">Kelola pencapaian hafalan santri per halaqah</p>
                    </div>

                    <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="overview">Halaqah Overview</TabsTrigger>
                    <TabsTrigger value="records">Daily Records</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                    
                    {/* Date Selector for Overview */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="inline w-4 h-4 mr-1" />
                            Pilih Tanggal untuk Melihat Progress
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Progress Hafalan per Tanggal - All Halaqah
                            </h3>
                            <p className="text-sm text-gray-600">
                                Tanggal: {new Date(selectedDate).toLocaleDateString('id-ID')}
                            </p>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Halaqah
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nama Santri
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Target (Halaman)
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pencapaian (Halaman)
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Progress Pencapaian
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Riwayat
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {students.length > 0 ? students.map((student) => {
                                        // Find student's halaqah
                                        const studentHalaqah = halaqahs.find(h => 
                                            h.selectedStudents?.includes(student.id.toString())
                                        );
                                        
                                        const studentRecords = memorizationRecords.filter(r => 
                                            r.studentName === student.name && 
                                            new Date(r.date) <= new Date(selectedDate)
                                        );
                                        const totalTarget = studentRecords.reduce((sum, record) => sum + record.target, 0);
                                        const totalPages = studentRecords.reduce((sum, record) => sum + record.actual, 0);
                                        const progressPercentage = totalTarget > 0 ? Math.round((totalPages / totalTarget) * 100) : 0;
                                        
                                        // Get the latest record for this student on the selected date
                                        const latestRecord = memorizationRecords
                                            .filter(r => r.studentName === student.name && r.date === selectedDate)
                                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                                        
                                        return (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {studentHalaqah?.name || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {student.name}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {totalTarget}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="text-lg font-bold text-blue-600">
                                                        {totalPages}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                                        <div 
                                                            className={`h-3 rounded-full ${getProgressBarColor(progressPercentage)}`} 
                                                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-xs text-center text-gray-500 mt-1">
                                                        {progressPercentage}%
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <details className="inline-block">
                                                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                                            <span className="text-sm">Lihat Riwayat ↓</span>
                                                        </summary>
                                                        <div className="mt-2 p-3 bg-gray-50 rounded-md text-left">
                                                            {studentRecords.length > 0 ? (
                                                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                                                    {studentRecords.slice(-5).reverse().map((record, index) => (
                                                                        <div key={index} className="text-xs text-gray-600">
                                                                            {new Date(record.date).toLocaleDateString('id-ID')}: {record.actual} halaman
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs text-gray-500">Belum ada data</div>
                                                            )}
                                                        </div>
                                                    </details>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                Belum ada data hafalan
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Progress Hafalan Berdasarkan Level */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Progress Hafalan Berdasarkan Level
                            </h3>
                            <p className="text-sm text-gray-600">
                                Target berdasarkan level masing-masing santri
                            </p>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Halaqah
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nama Santri
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Level
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Target Per Level (Halaman)
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pencapaian (Halaman)
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Progress Pencapaian
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {students.length > 0 ? students.map((student) => {
                                        // Find student's halaqah
                                        const studentHalaqah = halaqahs.find(h => 
                                            h.selectedStudents?.includes(student.id.toString())
                                        );
                                        
                                        const studentRecords = memorizationRecords.filter(r => 
                                            r.studentName === student.name && 
                                            new Date(r.date) <= new Date(selectedDate)
                                        );
                                        const totalPages = studentRecords.reduce((sum, record) => sum + record.actual, 0);
                                        
                                        // Determine target based on level
                                        const level = studentHalaqah?.level || '';
                                        let targetPerLevel = 0;
                                        if (level.includes('Tahsin')) {
                                            targetPerLevel = 23;
                                        } else if (level.includes('Tahfizh 1')) {
                                            targetPerLevel = 103;
                                        } else if (level.includes('Tahfizh 2')) {
                                            targetPerLevel = 203;
                                        } else if (level.includes('Tahfizh Kamil')) {
                                            targetPerLevel = 604;
                                        }
                                        
                                        const progressPercentage = targetPerLevel > 0 ? Math.round((totalPages / targetPerLevel) * 100) : 0;
                                        
                                        return (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {studentHalaqah?.name || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {student.name}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        {level || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {targetPerLevel}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="text-lg font-bold text-blue-600">
                                                        {totalPages}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                                        <div 
                                                            className={`h-3 rounded-full ${getProgressBarColor(progressPercentage)}`} 
                                                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-xs text-center text-gray-500 mt-1">
                                                        {progressPercentage}%
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                Belum ada data hafalan
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Santri Ranking Section */}
                    <SantriRanking memorizationRecords={memorizationRecords} />
                </TabsContent>
                
                <TabsContent value="records" className="space-y-6">
                    {/* Daily Records Input Section (Filters) */}
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3">
                            <Calendar className="text-gray-400" size={20} />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <select 
                            value={recordsSelectedHalaqah}
                            onChange={(e) => {
                                setRecordsSelectedHalaqah(e.target.value);
                                setRecordsSelectedStudent('');
                            }}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Semua Halaqah</option>
                            {halaqahs.map(halaqah => (
                                <option key={halaqah.id} value={halaqah.id.toString()}>
                                    {halaqah.name}
                                </option>
                            ))}
                        </select>
                        
                        <select 
                            value={recordsSelectedStudent}
                            onChange={(e) => setRecordsSelectedStudent(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Pilih Santri</option>
                            {getStudentsByHalaqah(recordsSelectedHalaqah).map(student => (
                                <option key={student.id} value={student.id.toString()}>
                                    {student.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Input Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Input Hafalan - {recordsSelectedStudent ? students.find(s => s.id.toString() === recordsSelectedStudent)?.name : 'Pilih Santri'}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Tanggal: {new Date(selectedDate).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Target Hafalan Harian (halaman)
                                    </label>
                                    <input
                                        type="number"
                                        value={memorizationTarget}
                                        onChange={(e) => setMemorizationTarget(e.target.value)}
                                        placeholder="Masukkan target..."
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pencapaian Aktual (halaman)
                                    </label>
                                    <input
                                        type="number"
                                        value={memorizationActual}
                                        onChange={(e) => setMemorizationActual(e.target.value)}
                                        placeholder="Masukkan pencapaian..."
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Juz Ke
                                    </label>
                                    <select
                                        value={selectedJuz}
                                        onChange={(e) => {
                                            setSelectedJuz(e.target.value);
                                            // Reset Surah/Ayat saat Juz berubah
                                            setSelectedSurah(''); setAyahFrom(''); setAyahTo('');
                                        }}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Pilih Juz</option>
                                        {Array.from({ length: 30 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                Juz {i + 1}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {/* 1. Surah dan Ayat Pertama (Menggunakan filter Juz) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Surat (1)
                                    </label>
                                    <select
                                        value={selectedSurah}
                                        onChange={(e) => {
                                            setSelectedSurah(e.target.value);
                                            setAyahFrom('');
                                            setAyahTo('');
                                        }}
                                        disabled={!selectedJuz} 
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    >
                                        <option value="">{selectedJuz ? 'Pilih Surat di Juz ini' : 'Pilih Juz Dahulu'}</option>
                                        {availableSurahs.map(surahName => {
                                            const surahData = getSurahByName(surahName);
                                            return (
                                                <option key={surahName} value={surahName}>
                                                    {surahData?.number}. {surahName} ({surahData?.arabicName})
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ayat (dari - sampai) (1)
                                    </label>
                                    <div className="flex space-x-2">
                                        <select
                                            value={ayahFrom}
                                            onChange={(e) => setAyahFrom(e.target.value)}
                                            disabled={!selectedSurah}
                                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                        >
                                            <option value="">Dari</option>
                                            {availableAyahs.map((ayah) => (
                                                <option key={ayah} value={ayah}>
                                                    {ayah}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={ayahTo}
                                            onChange={(e) => setAyahTo(e.target.value)}
                                            disabled={!selectedSurah || !ayahFrom}
                                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                        >
                                            <option value="">Sampai</option>
                                            {availableAyahs.filter(ayah => ayah >= Number(ayahFrom)).map((ayah) => (
                                                <option key={ayah} value={ayah}>
                                                    {ayah}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>


                            {/* Tombol Simpan */}
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleSaveMemorization}
                                    disabled={!recordsSelectedStudent || !memorizationTarget || !memorizationActual}
                                    className="flex items-center space-x-2 bg-[#5db3d2] text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-[#4a9ab8] transition-colors disabled:bg-gray-400"
                                >
                                    <Plus size={20} />
                                    <span>Simpan Hafalan</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Rincian Riwayat Hafalan Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Rincian Riwayat Hafalan
                            </h3>
                            <p className="text-sm text-gray-600">
                                Daftar semua pencatatan hafalan santri berdasarkan filter
                            </p>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tanggal
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nama Santri
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Juz
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Surat 1
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ayat 1
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {memorizationRecords
                                        .filter(r => 
                                            (!recordsSelectedHalaqah || r.halaqah === halaqahs.find(h => h.id.toString() === recordsSelectedHalaqah)?.name) &&
                                            (!recordsSelectedStudent || r.studentName === students.find(s => s.id.toString() === recordsSelectedStudent)?.name)
                                        )
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .map((record) => {
                                            const surahDetails = record.memorizationDetail?.surahDetails || [];
                                            const surah1 = surahDetails[0];
                                            
                                            return (
                                                <tr key={record.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {new Date(record.date).toLocaleDateString('id-ID')}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {record.studentName}
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-sm text-gray-900">
                                                        {record.memorizationDetail?.juz || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        {surah1?.surahName || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        {surah1 ? `${surah1.ayahFrom} - ${surah1.ayahTo}` : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <button
                                                                onClick={() => handleEditRecord(record)}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(record)}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    {memorizationRecords.filter(r => 
                                        (!recordsSelectedHalaqah || r.halaqah === halaqahs.find(h => h.id.toString() === recordsSelectedHalaqah)?.name) &&
                                        (!recordsSelectedStudent || r.studentName === students.find(s => s.id.toString() === recordsSelectedStudent)?.name)
                                    ).length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                Belum ada data hafalan
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    {/* Memorization Monthly/Semester Section */}
                    <MemorizationMonthlySection 
                        memorizationRecords={memorizationRecords}
                        selectedStudent={recordsSelectedStudent}
                        students={students}
                    />
                    <MemorizationSemesterSection 
                        memorizationRecords={memorizationRecords}
                        selectedStudent={recordsSelectedStudent}
                        students={students}
                    />
                </TabsContent>
                
                {/* Modals */}
                <DetailMemorizationModal 
                    isOpen={isDetailModalOpen} 
                    onClose={() => setIsDetailModalOpen(false)} 
                    record={selectedRecord} 
                />
                <EditMemorizationModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingRecord(null);
                    }}
                    record={editingRecord}
                    onSubmit={handleUpdateRecord}
                />
                
                {/* Delete Alert Dialog */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
                            <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus data hafalan untuk **{recordToDelete?.studentName}** pada tanggal **{recordToDelete?.date}**? Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">
                                Hapus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Tabs>
                </div>
            )}
        </>
    );
};

export default Halaqah;