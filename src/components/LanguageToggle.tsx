import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-white/20 rounded-lg p-1">
      <Globe size={16} className="text-white ml-1" />
      <Button
        variant={language === 'id' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('id')}
        className={`text-xs px-2 py-1 h-6 ${
          language === 'id' 
            ? 'bg-white text-[#5db3d2] hover:bg-white/90' 
            : 'text-white hover:bg-white/20'
        }`}
      >
        ID
      </Button>
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('en')}
        className={`text-xs px-2 py-1 h-6 ${
          language === 'en' 
            ? 'bg-white text-[#5db3d2] hover:bg-white/90' 
            : 'text-white hover:bg-white/20'
        }`}
      >
        EN
      </Button>
    </div>
  );
};

export default LanguageToggle;
