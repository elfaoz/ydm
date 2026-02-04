import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import LanguageToggle from './LanguageToggle';
import { Button } from './ui/button';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#5db3d2] shadow-sm border-b border-[#5db3d2] px-6 py-4 flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-white/20 mr-4 transition-colors text-white"
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-white">{t('welcome')}</h2>
          <p className="text-sm text-white/80">{t('manageMutabaah')}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Language Toggle */}
        <LanguageToggle />
        
        {/* Logout Button - Icon only */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-white hover:bg-white/20 hover:text-white"
          title={t('logout')}
        >
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  );
};

export default Header;
