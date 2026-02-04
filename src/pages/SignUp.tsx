import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Format pesan WhatsApp dengan format yang sama seperti email
      const message = `Assalamu'alaikum Warahmatullahi Wabarakatuh,

Pendaftaran KDM - Karim Dashboard Manager

Email: ${email}
No. WhatsApp: ${whatsapp}

Saya ingin mendapatkan notifikasi pembukaan pendaftaran KDM – Karim Dashboard Manager pada periode berikutnya.

Jazakummullahu khairan`;

      // Encode message untuk URL
      const encodedMessage = encodeURIComponent(message);
      
      // Buka WhatsApp dengan pesan yang sudah diformat
      const whatsappUrl = `https://wa.me/6285223857484?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');

      toast({
        title: 'Membuka WhatsApp',
        description: 'Silakan kirim pesan melalui WhatsApp.',
      });
      
      // Reset form
      setEmail('');
      setWhatsapp('');
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Terjadi kesalahan',
        description: 'Gagal membuka WhatsApp. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-[hsl(var(--brand-kdm-light)/0.3)] to-background p-4">
      <Card className="w-full max-w-2xl shadow-xl border-[hsl(var(--brand-kdm-light))]">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-start">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="gap-2 text-[hsl(var(--brand-kdm))] hover:bg-[hsl(var(--brand-kdm-light))]">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Login
              </Button>
            </Link>
          </div>
          <CardTitle className="text-3xl font-bold text-[hsl(var(--brand-kdm))]">
            Pendaftaran KDM 1.0
          </CardTitle>
          <CardDescription className="text-base leading-relaxed px-4">
            Mohon Maaf, Pendaftaran Semester ini Telah <span className="font-bold">Ditutup</span>. 
            Namun, jangan khawatir anda masih bisa mendapatkan kesempatan menggunakan 
            KDM – Karim Dashboard Manager di semester berikutnya. Silakan tinggalkan 
            email pribadi atau email sekolah Anda di bawah ini untuk mendapatkan 
            informasi waktu pendaftaran berikutnya.
          </CardDescription>
          <p className="text-sm text-gray-500 italic">~Insankarim.com~</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="Contoh: 081234567890"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              Masukan No. WA dan E-mail untuk mendapatkan update informasi terbaru
            </p>
            <Button 
              type="submit" 
              className="w-full bg-[hsl(var(--brand-kdm))] hover:bg-[hsl(var(--brand-kdm))/0.9] text-[hsl(var(--brand-kdm-foreground))]"
              disabled={isLoading}
            >
              {isLoading ? 'Membuka WhatsApp...' : 'Kirim via WhatsApp'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
