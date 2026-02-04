import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  role: string;
  dateOfBirth: string;
  address: string;
  bankInfo: string;
  nik: string;
}

interface ProfileContextType {
  profileData: ProfileData;
  updateProfile: (data: Partial<ProfileData>) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const defaultProfile: ProfileData = {
  name: 'Ustadz Ahmad Wijaya',
  role: 'Guru Pendamping Senior',
  dateOfBirth: '15 Agustus 1985',
  address: 'Jl. Pesantren No. 123, Jakarta Selatan',
  bankInfo: 'BCA - 1234567890',
  phone: '+62 812-3456-7890',
  email: 'ahmad.wijaya@pesantren.com',
  nik: '3174021585123456',
};

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfile);

  useEffect(() => {
    const stored = localStorage.getItem('kdm_profile');
    if (stored) {
      setProfileData(JSON.parse(stored));
    }
  }, []);

  const updateProfile = (data: Partial<ProfileData>) => {
    const updated = { ...profileData, ...data };
    setProfileData(updated);
    localStorage.setItem('kdm_profile', JSON.stringify(updated));
  };

  return (
    <ProfileContext.Provider value={{ profileData, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
