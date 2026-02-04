import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Book, FileText, Wallet } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const DashboardNavCards: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const navItems = [
    {
      path: '/attendance',
      icon: Calendar,
      label: t('attendance'),
      emoji: '📅',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    {
      path: '/halaqah',
      icon: Book,
      label: t('memorization'),
      emoji: '📖',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
    },
    {
      path: '/activities',
      icon: FileText,
      label: t('activities'),
      emoji: '📝',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
    },
    {
      path: '/finance',
      icon: Wallet,
      label: t('finance'),
      emoji: '💸',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {navItems.map((item) => (
        <Card
          key={item.path}
          className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${item.color} ${item.hoverColor} text-white border-0`}
          onClick={() => navigate(item.path)}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <span className="text-4xl mb-2">{item.emoji}</span>
            <span className="font-semibold text-center">{item.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardNavCards;
