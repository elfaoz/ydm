import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GatekeeperModalProps {
  isOpen: boolean;
  onAccessGranted: () => void;
  pageName: string;
}

const GatekeeperModal: React.FC<GatekeeperModalProps> = ({ isOpen, onAccessGranted, pageName }) => {
  const [accessCode, setAccessCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Simple JWT-like token generation and verification
  const generateToken = (code: string): string => {
    const payload = {
      code,
      timestamp: Date.now(),
      page: pageName,
    };
    return btoa(JSON.stringify(payload));
  };

  // Different access codes for each page
  const getAccessCodeForPage = (page: string): string => {
    const codes: { [key: string]: string } = {
      'Attendance': 'attendance1',
      'Memorization': 'memorization1',
      'Finance': 'finance1',
      'Activities': 'activities1',
    };
    return codes[page] || '1';
  };

  const verifyToken = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token));
      const expectedCode = getAccessCodeForPage(pageName);
      return payload.code === expectedCode && payload.page === pageName;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    // Check if access was already granted
    const storedToken = localStorage.getItem(`kdm_access_${pageName.toLowerCase()}`);
    if (storedToken && verifyToken(storedToken)) {
      onAccessGranted();
    }
  }, [pageName, onAccessGranted]);

  const handleVerifyAccess = () => {
    setIsVerifying(true);

    // Verify access code - unique for each page
    const expectedCode = getAccessCodeForPage(pageName);
    if (accessCode === expectedCode) {
      const token = generateToken(accessCode);
      localStorage.setItem(`kdm_access_${pageName.toLowerCase()}`, token);
      
      toast({
        title: 'Akses Diberikan',
        description: `Selamat datang di halaman ${pageName}`,
      });
      
      onAccessGranted();
    } else {
      toast({
        title: 'Kode Akses Salah',
        description: 'Silakan masukkan kode akses yang benar',
        variant: 'destructive',
      });
    }

    setIsVerifying(false);
    setAccessCode('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerifyAccess();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Halaman Terkunci</DialogTitle>
          <DialogDescription className="text-center">
            Masukkan kode akses untuk membuka halaman {pageName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div>
            <Input
              type="password"
              placeholder="Masukkan kode akses"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-center text-lg tracking-widest"
              autoFocus
            />
          </div>
          
          <Button
            onClick={handleVerifyAccess}
            disabled={!accessCode || isVerifying}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isVerifying ? 'Memverifikasi...' : 'Verifikasi Kode'}
          </Button>
          
          <p className="text-xs text-center text-gray-500 mt-2">
            Upgrade akun untuk mendapatkan akses ke halaman. Klik untuk upgrade{' '}
            <a href="/upgrade" className="text-blue-600 hover:underline font-semibold">
              disini
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GatekeeperModal;
