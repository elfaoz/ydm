import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Building2, MessageCircle, Copy, Check, ArrowLeft, Plus, X, Tag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useProfile } from '@/contexts/ProfileContext';
import { useSettings } from '@/contexts/SettingsContext';

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profileData } = useProfile();
  const { prices, vouchers, banks, whatsappNumber } = useSettings();
  
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string>('12');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Convert prices array to planDetails object
  const planDetails = useMemo(() => {
    const details: { [key: string]: { name: string; price: number } } = {};
    prices.forEach(p => {
      details[p.id] = { name: p.name, price: p.price };
    });
    return details;
  }, [prices]);

  // Get active vouchers (within date range)
  const activeVouchers = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return vouchers.filter(v => v.startDate <= today && v.endDate >= today);
  }, [vouchers]);

  // Get first bank account
  const primaryBank = banks[0];
  const bankAccount = primaryBank?.accountNumber || '';

  useEffect(() => {
    // Pre-fill from profile
    setFormData({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
    });

    // Initialize selected plans from location state
    const planId = location.state?.planId;
    if (planId) {
      setSelectedPlans([planId]);
    }
  }, [profileData, location.state]);


  const calculateSubtotal = () => {
    if (selectedPlans.includes('full-package')) {
      return 249000 * parseInt(selectedDuration);
    }
    const subtotal = selectedPlans.reduce((total, planId) => {
      return total + (planDetails[planId]?.price || 0);
    }, 0);
    return subtotal * parseInt(selectedDuration);
  };

  const subtotalPrice = calculateSubtotal();
  const discountAmount = appliedVoucher ? Math.round(subtotalPrice * (appliedVoucher.discount / 100)) : 0;
  const totalPrice = subtotalPrice - discountAmount;

  const handleApplyVoucher = () => {
    const code = voucherCode.toLowerCase().trim();
    const foundVoucher = activeVouchers.find(v => v.code.toLowerCase() === code);
    
    if (foundVoucher) {
      setAppliedVoucher({ code: foundVoucher.code, discount: foundVoucher.discount });
      toast({
        title: 'Voucher Berhasil Diterapkan',
        description: `Diskon ${foundVoucher.discount}% telah diterapkan`,
      });
    } else {
      toast({
        title: 'Voucher Tidak Valid',
        description: 'Kode voucher tidak ditemukan atau sudah kadaluarsa',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    toast({
      title: 'Voucher Dihapus',
      description: 'Diskon telah dihapus dari pesanan',
    });
  };

  const handleAddPlan = (planId: string) => {
    // If trying to add full package, replace everything with full package
    if (planId === 'full-package') {
      setSelectedPlans(['full-package']);
      return;
    }
    
    // If full package is already selected, show toast and don't add
    if (selectedPlans.includes('full-package')) {
      toast({
        title: 'Full Package Sudah Dipilih',
        description: 'Full Package tidak bisa dikombinasikan dengan paket lain',
        variant: 'destructive',
      });
      return;
    }
    
    // Otherwise add the package if not already selected
    if (!selectedPlans.includes(planId)) {
      setSelectedPlans([...selectedPlans, planId]);
    }
  };

  const handleRemovePlan = (planId: string) => {
    setSelectedPlans(selectedPlans.filter(id => id !== planId));
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankAccount);
    setCopied(true);
    toast({
      title: 'Nomor Rekening Disalin',
      description: 'Nomor rekening berhasil disalin ke clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppConfirmation = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: 'Data Tidak Lengkap',
        description: 'Mohon lengkapi semua data sebelum konfirmasi',
        variant: 'destructive',
      });
      return;
    }

    if (selectedPlans.length === 0) {
      toast({
        title: 'Belum Ada Paket',
        description: 'Silakan pilih minimal satu paket',
        variant: 'destructive',
      });
      return;
    }

    const selectedPackages = selectedPlans.map(id => planDetails[id]?.name).join(', ');
    const voucherInfo = appliedVoucher ? `%0AVoucher: ${appliedVoucher.code.toUpperCase()} (${appliedVoucher.discount}% off)` : '';
    const bankName = primaryBank?.bankName || 'Bank';
    const accountHolder = primaryBank?.accountHolder || '';
    const message = `Assalamualaikum, saya ingin konfirmasi pembayaran Aplikasi KDM:%0A%0ANama: ${formData.name}%0AEmail: ${formData.email}%0ANo. HP: ${formData.phone}%0APaket: ${selectedPackages}%0ADurasi: ${selectedDuration} bulan${voucherInfo}%0ATotal: Rp ${totalPrice.toLocaleString('id-ID')}%0A%0ASaya sudah melakukan transfer ke rekening ${bankName} a.n ${accountHolder}.`;
    
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="bg-blue-50 min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/upgrade')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Halaman Upgrade
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pembayaran</h1>
          <p className="text-muted-foreground">
            Selesaikan pembayaran untuk mengaktifkan paket pilihan Anda
          </p>
        </div>

        {/* Available Packages */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Pilih Paket
            </CardTitle>
            <CardDescription>Tambahkan paket ke keranjang Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(planDetails).map(([planId, plan]) => (
              <div
                key={planId}
                className={`flex justify-between items-center p-3 rounded-lg border ${
                  selectedPlans.includes(planId) ? 'bg-[#5db3d2]/10 border-[#5db3d2]' : 'bg-background'
                }`}
              >
                <div>
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Rp {plan.price.toLocaleString('id-ID')}/bulan
                  </p>
                </div>
                {selectedPlans.includes(planId) ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemovePlan(planId)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Hapus
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleAddPlan(planId)}
                    className="bg-[#5db3d2] hover:bg-[#4a9ab8] text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Voucher Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="mr-2 h-5 w-5" />
              Voucher Diskon
            </CardTitle>
            <CardDescription>Masukkan kode voucher jika ada</CardDescription>
          </CardHeader>
          <CardContent>
            {appliedVoucher ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-medium text-green-700">{appliedVoucher.code.toUpperCase()}</p>
                  <p className="text-sm text-green-600">Diskon {appliedVoucher.discount}% diterapkan</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRemoveVoucher}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Hapus
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Masukkan kode voucher"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleApplyVoucher}
                  className="bg-[#5db3d2] hover:bg-[#4a9ab8] text-white"
                >
                  Terapkan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Ringkasan Pesanan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPlans.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Belum ada paket dipilih. Silakan tambah paket di atas.
              </p>
            ) : (
              <>
                {/* Duration Selection */}
                <div className="space-y-3 pb-4 border-b">
                  <Label className="text-sm font-medium">Pilih Durasi Berlangganan</Label>
                  <RadioGroup value={selectedDuration} onValueChange={setSelectedDuration} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="12" id="duration-12" />
                      <Label htmlFor="duration-12" className="cursor-pointer">12 Bulan</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="24" id="duration-24" />
                      <Label htmlFor="duration-24" className="cursor-pointer">24 Bulan</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="36" id="duration-36" />
                      <Label htmlFor="duration-36" className="cursor-pointer">36 Bulan</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  {selectedPlans.map((planId) => (
                    <div key={planId} className="flex justify-between items-center py-2">
                      <span className="font-medium">{planDetails[planId]?.name}</span>
                      <span className="text-muted-foreground">
                        Rp {planDetails[planId]?.price.toLocaleString('id-ID')} × {selectedDuration} bln
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal */}
                <div className="flex justify-between items-center border-t pt-4">
                  <span className="text-muted-foreground">Subtotal ({selectedDuration} Bulan)</span>
                  <span className={appliedVoucher ? 'line-through text-muted-foreground' : 'font-semibold'}>
                    Rp {subtotalPrice.toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Discount */}
                {appliedVoucher && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Diskon ({appliedVoucher.discount}%)</span>
                    <span>- Rp {discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center text-lg font-bold border-t pt-4 mt-2">
                  <span>Total</span>
                  <span className="text-[#5db3d2]">Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bank Transfer Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Detail Rekening Tujuan
            </CardTitle>
            <CardDescription>Transfer ke rekening berikut</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Bank</Label>
              <p className="text-lg font-semibold">{primaryBank?.bankName || '-'}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Atas Nama</Label>
              <p className="text-lg font-semibold">{primaryBank?.accountHolder || '-'}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Nomor Rekening</Label>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-lg font-mono font-bold text-[#5db3d2]">{bankAccount}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyAccount}
                  className="ml-auto"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Disalin
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Salin
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Data Pembeli</CardTitle>
            <CardDescription>Isi data Anda untuk konfirmasi pembayaran</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                placeholder="Masukkan nama lengkap"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Masukkan email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Nomor HP/WhatsApp</Label>
              <Input
                id="phone"
                placeholder="Masukkan nomor HP"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Confirmation Button */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Setelah transfer, konfirmasi pembayaran Anda dengan melampirkan bukti pembayaran melalui WhatsApp
              </p>
              <Button
                size="lg"
                className="w-full bg-[#5db3d2] hover:bg-[#4a9ab8] text-white"
                onClick={handleWhatsAppConfirmation}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Konfirmasi via WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
  );
};

export default Payment;
