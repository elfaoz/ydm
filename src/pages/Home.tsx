import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-roboto">
      {/* Header with Login and Install */}
      <header className="w-full py-4 px-6 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">KDM 1.0</h1>
          <div className="flex space-x-4">
            <Button 
              onClick={() => navigate('/login')}
              variant="outline"
              className="text-gray-900 border-gray-300 hover:bg-gray-50"
            >
              Login
            </Button>
            <Button 
              onClick={() => window.location.href = 'https://insankarim.com/install'}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Install
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            KDM – Karim Dashboard Manager
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
            Dashboard Cerdas Manajemen Santri Terpadu
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Satu platform digital yang membantu guru pendamping mengelola data santri, absensi, hafalan, keuangan, dan aktivitas ibadah dengan cara yang lebih mudah, cepat, dan praktis.
          </p>

          <div className="pt-8">
            <Button 
              onClick={() => navigate('/kdm')}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Mulai Sekarang
            </Button>
          </div>
        </div>

        <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            7 Langkah Lebih Maju Pengelolaan Santri
          </h3>
          
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-start space-x-4">
              <span className="text-2xl">👉</span>
              <div>
                <h4 className="font-semibold text-gray-900">Kelola Santri</h4>
                <p className="text-gray-600">Simpan dan akses data santri secara rapi dan terstruktur.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <span className="text-2xl">👉</span>
              <div>
                <h4 className="font-semibold text-gray-900">Kelola Absensi</h4>
                <p className="text-gray-600">Catat hadir, sakit, izin, dan alfa hanya dalam hitungan detik.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <span className="text-2xl">👉</span>
              <div>
                <h4 className="font-semibold text-gray-900">Kelola Hafalan</h4>
                <p className="text-gray-600">Pantau progres setoran Qur'an dengan perhitungan otomatis target hafalan.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <span className="text-2xl">👉</span>
              <div>
                <h4 className="font-semibold text-gray-900">Kelola Keuangan</h4>
                <p className="text-gray-600">Atur dan laporkan transaksi keuangan santri dengan transparan.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <span className="text-2xl">👉</span>
              <div>
                <h4 className="font-semibold text-gray-900">Kelola Mutabaah</h4>
                <p className="text-gray-600">Checklist ibadah harian santri seperti tahajud, rawatib, shaum, tilawah, hingga piket.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <span className="text-2xl">👉</span>
              <div>
                <h4 className="font-semibold text-gray-900">Laporan Aktivitas</h4>
                <p className="text-gray-600">Evaluasi aktivitas santri sehari-hari secara detail dan real-time.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <span className="text-2xl">👉</span>
              <div>
                <h4 className="font-semibold text-gray-900">Laporan Ibadah</h4>
                <p className="text-gray-600">Rekap ibadah santri secara konsisten untuk memantau perkembangan spiritual.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
