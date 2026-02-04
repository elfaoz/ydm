
import React from 'react';

interface StatCardProps {
  title: string;
  icon: string;
  value: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, icon, value, subtitle }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className="text-3xl mr-4">{icon}</div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
