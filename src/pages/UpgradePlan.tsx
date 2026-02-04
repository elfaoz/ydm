import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';
import { useSettings } from '@/contexts/SettingsContext';

const UpgradePlan: React.FC = () => {
  const navigate = useNavigate();
  const { prices } = useSettings();

  // Get price by id
  const getPrice = (id: string) => {
    const price = prices.find(p => p.id === id);
    return price || { price: 0, originalPrice: undefined };
  };

  // Format price to display string
  const formatPriceDisplay = (price: number) => {
    if (price >= 1000) {
      return `${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 2)}k`;
    }
    return price.toString();
  };

  const plans = [
    {
      id: 'attendance',
      name: 'Attendance',
      price: formatPriceDisplay(getPrice('attendance').price),
      originalPrice: getPrice('attendance').originalPrice ? formatPriceDisplay(getPrice('attendance').originalPrice!) : undefined,
      features: [
        'Input data kehadiran santri',
        'Laporan kehadiran harian',
        'Statistik kehadiran per bulan',
        'Export data kehadiran',
        'Leaderboard kehadiran',
      ],
    },
    {
      id: 'memorization',
      name: 'Memorization',
      price: formatPriceDisplay(getPrice('memorization').price),
      originalPrice: getPrice('memorization').originalPrice ? formatPriceDisplay(getPrice('memorization').originalPrice!) : undefined,
      features: [
        'Tracking hafalan Al-Quran',
        'Input progress per juz dan surah',
        'Riwayat hafalan lengkap',
        'Laporan bulanan hafalan',
        'Leaderboard hafalan',
        'Detail progress per santri',
      ],
    },
    {
      id: 'activities',
      name: 'Activities',
      price: formatPriceDisplay(getPrice('activities').price),
      originalPrice: getPrice('activities').originalPrice ? formatPriceDisplay(getPrice('activities').originalPrice!) : undefined,
      features: [
        'Tracking aktivitas harian',
        'Monitor Tilawah & Tahajud',
        'Laporan Shaum & Rawatib',
        'Jadwal Piket',
        'Monitoring Bangun Tidur',
      ],
    },
    {
      id: 'finance',
      name: 'Finance',
      price: formatPriceDisplay(getPrice('finance').price),
      originalPrice: getPrice('finance').originalPrice ? formatPriceDisplay(getPrice('finance').originalPrice!) : undefined,
      features: [
        'Manajemen keuangan santri',
        'Pencatatan pengeluaran',
        'Kategori pengeluaran',
        'Laporan keuangan bulanan',
        'Laporan keuangan semester',
        'Leaderboard hemat pengeluaran',
      ],
    },
    {
      id: 'full-package',
      name: 'Full Package',
      price: formatPriceDisplay(getPrice('full-package').price),
      originalPrice: getPrice('full-package').originalPrice ? formatPriceDisplay(getPrice('full-package').originalPrice!) : undefined,
      isFullPackage: true,
      features: [
        'Semua fitur Attendance',
        'Semua fitur Memorization',
        'Semua fitur Activities',
        'Semua fitur Finance',
        'Dashboard lengkap & terintegrasi',
        'Export semua data',
        'Support prioritas',
        'Update fitur gratis selamanya',
      ],
    },
  ];

  const handleSelectPlan = (planId: string) => {
    navigate('/payment', { state: { planId } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content with gradient background */}
      <div className="flex-1 bg-[#5db3d2] py-12 px-4">
        <div className="container mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6 text-white hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Dashboard
          </Button>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">Upgrade Paket Anda</h1>
            <p className="text-white/90 text-lg">
              Pilih paket yang sesuai dengan kebutuhan Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative flex flex-col transition-all duration-300 hover:scale-105 bg-white ${
                  plan.isFullPackage 
                    ? 'border-2 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.5)]' 
                    : 'border-2 border-[#5db3d2] shadow-[0_0_20px_rgba(93,179,210,0.3)] hover:shadow-[0_0_30px_rgba(93,179,210,0.5)]'
                }`}
                style={{
                  boxShadow: plan.isFullPackage 
                    ? '0 0 30px rgba(34, 197, 94, 0.4), inset 0 0 60px rgba(34, 197, 94, 0.05)'
                    : '0 0 20px rgba(93, 179, 210, 0.3), inset 0 0 60px rgba(93, 179, 210, 0.05)'
                }}
              >
                {/* Neon glow effect */}
                <div 
                  className={`absolute inset-0 rounded-lg opacity-50 pointer-events-none ${
                    plan.isFullPackage ? 'bg-gradient-to-br from-green-500/10 to-transparent' : 'bg-gradient-to-br from-[#5db3d2]/10 to-transparent'
                  }`}
                />
                
                <CardHeader className="relative z-10">
                  <CardTitle className={`text-2xl ${plan.isFullPackage ? 'text-green-600' : 'text-[#5db3d2]'}`}>
                    {plan.name}
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-bold ${plan.isFullPackage ? 'text-green-600' : 'text-[#5db3d2]'}`}>
                        {plan.price}
                      </span>
                      {plan.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {plan.originalPrice}
                        </span>
                      )}
                      <span className="text-muted-foreground">/bulan</span>
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow relative z-10">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className={`h-5 w-5 mr-2 flex-shrink-0 mt-0.5 ${plan.isFullPackage ? 'text-green-500' : 'text-[#5db3d2]'}`} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="relative z-10">
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full font-semibold ${
                      plan.isFullPackage 
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]' 
                        : 'bg-[#5db3d2] hover:bg-[#4a9ab8] text-white shadow-[0_0_15px_rgba(93,179,210,0.5)]'
                    }`}
                  >
                    Pilih Paket
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UpgradePlan;
