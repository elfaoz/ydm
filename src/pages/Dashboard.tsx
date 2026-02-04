import React, { useState } from 'react';
import DashboardStats from '../components/DashboardStats';
import DashboardNavCards from '../components/DashboardNavCards';
import ProgramCalendar from '../components/ProgramCalendar';
import StudentOverviewDashboard from '../components/StudentOverviewDashboard';
import LeaderboardOverview from '../components/LeaderboardOverview';
import ShareResultsSection from '../components/ShareResultsSection';
import ShareResultsMonthlySection from '../components/ShareResultsMonthlySection';
import ShareResultsDailySection from '../components/ShareResultsDailySection';
import ShareResultsFinanceDailySection from '../components/ShareResultsFinanceDailySection';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Attendance', 'Memorization', 'Activities', 'Finance']);
  const { t } = useLanguage();
  const { isGuest } = useAuth();

  return (
    <div className="p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('dashboard')}</h1>
        <p className="text-muted-foreground">Ustadz Ahmad Wijaya</p>
      </div>
      
      <DashboardStats />
      
      {/* Navigation Cards - hidden for guest */}
      {!isGuest && <DashboardNavCards />}
      
      <ProgramCalendar />
      
      <StudentOverviewDashboard />
      
      <LeaderboardOverview 
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
      />
      
      {/* Report Download and Share Section - Semester */}
      <ShareResultsSection />
      
      {/* Report Download and Share Section - Bulanan */}
      <ShareResultsMonthlySection />
      
      {/* Report Download and Share Section - Harian */}
      <ShareResultsDailySection />
      
      {/* Report Download and Share Section - Keuangan Harian */}
      <ShareResultsFinanceDailySection />
    </div>
  );
};

export default Dashboard;