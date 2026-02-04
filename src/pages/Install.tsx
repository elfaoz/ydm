import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Cek apakah aplikasi sudah terinstall
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // ✅ Tampilkan prompt install otomatis setelah jeda singkat
      setTimeout(() => {
        try {
          e.prompt();
        } catch (err) {
          console.warn('Gagal menampilkan prompt otomatis:', err);
        }
      }, 800); // bisa disesuaikan (dalam milidetik)
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Jika pengguna sudah menginstall (misal via event)
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Install KDM App</CardTitle>
          <CardDescription>
            Install aplikasi Karim Dashboard Manager di perangkat Anda untuk akses lebih cepat dan lancar.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isInstalled ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                Aplikasi sudah terinstall di perangkat Anda ✅
              </p>
              <Button onClick={() => navigate('/')} className="w-full">
                Buka Dashboard
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">1</span>
                  </div>
                  <p>Akses aplikasi tanpa perlu membuka browser</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">2</span>
                  </div>
                  <p>Berfungsi secara offline setelah pertama kali dimuat</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">3</span>
                  </div>
                  <p>Pengalaman cepat seperti aplikasi native</p>
                </div>
              </div>

              {deferredPrompt ? (
                <Button 
                  onClick={handleInstall} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install Sekarang
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    Untuk menginstall aplikasi secara manual:
                  </p>
                  <div className="text-xs text-muted-foreground space-y-2 bg-muted p-4 rounded-lg">
                    <p><strong>Di iOS:</strong> Tap tombol Share → "Add to Home Screen"</p>
                    <p><strong>Di Android:</strong> Tap menu browser → "Add to Home screen" atau "Install app"</p>
                  </div>
                </div>
              )}

              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                className="w-full"
              >
                Kembali ke Dashboard
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Install;
