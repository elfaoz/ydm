import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface VoucherData {
  id: string;
  code: string;
  discount: number;
  startDate: string;
  endDate: string;
}

export interface BankData {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface PriceData {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
}

export interface RolePermission {
  userId: string;
  username: string;
  permissions: {
    [page: string]: boolean;
  };
}

export interface BonusSettings {
  gajiPokok: number;
  bonusPerHalaman: number;
  withdrawalWhatsapp: string;
}

export interface WhatsAppCSData {
  id: string;
  name: string;
  serviceType: string;
  phoneNumber: string;
}

export interface WithdrawalRequest {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  bankInfo: string;
  accountNumber: string;
  amount: number;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  studentReports?: { nama: string; halaqah: string; pencapaian: number; bonus: number }[];
}

// New interfaces for Settings tabs
export interface MemorizationProgram {
  id: string;
  name: string;
  targetMonthly: number; // pages per month
  targetSemester: number; // pages per semester
}

export interface ExpenseCategory {
  id: string;
  name: string;
}

export interface AttendanceCategory {
  id: string;
  name: string;
}

export interface ActivityCategory {
  id: string;
  name: string;
}

export interface GatekeeperPassword {
  id: string;
  pageName: string;
  accessCode: string;
}

interface SettingsContextType {
  // Vouchers
  vouchers: VoucherData[];
  addVoucher: (voucher: Omit<VoucherData, 'id'>) => void;
  updateVoucher: (id: string, voucher: Partial<VoucherData>) => void;
  deleteVoucher: (id: string) => void;
  
  // Banks
  banks: BankData[];
  addBank: (bank: Omit<BankData, 'id'>) => void;
  updateBank: (id: string, bank: Partial<BankData>) => void;
  deleteBank: (id: string) => void;
  
  // Prices
  prices: PriceData[];
  updatePrice: (id: string, price: Partial<PriceData>) => void;
  
  // WhatsApp
  whatsappNumber: string;
  setWhatsappNumber: (number: string) => void;
  
  // WhatsApp CS
  whatsappCSList: WhatsAppCSData[];
  addWhatsAppCS: (cs: Omit<WhatsAppCSData, 'id'>) => void;
  updateWhatsAppCS: (id: string, cs: Partial<WhatsAppCSData>) => void;
  deleteWhatsAppCS: (id: string) => void;
  
  // Role Permissions
  rolePermissions: RolePermission[];
  updateRolePermission: (userId: string, page: string, allowed: boolean) => void;
  addUser: (user: { username: string; password: string }) => void;
  deleteUser: (userId: string) => void;
  updateUserPassword: (userId: string, newPassword: string) => void;
  users: { id: string; username: string; password: string }[];
  
  // Bonus Settings
  bonusSettings: BonusSettings;
  updateBonusSettings: (settings: Partial<BonusSettings>) => void;
  
  // Withdrawal Requests
  withdrawalRequests: WithdrawalRequest[];
  addWithdrawalRequest: (request: Omit<WithdrawalRequest, 'id' | 'status'>) => void;
  updateWithdrawalStatus: (id: string, status: WithdrawalRequest['status']) => void;
  deleteWithdrawalRequest: (id: string) => void;
  
  // Memorization Programs
  memorizationPrograms: MemorizationProgram[];
  addMemorizationProgram: (program: Omit<MemorizationProgram, 'id'>) => void;
  updateMemorizationProgram: (id: string, program: Partial<MemorizationProgram>) => void;
  deleteMemorizationProgram: (id: string) => void;
  
  // Expense Categories & Settings
  expenseCategories: ExpenseCategory[];
  addExpenseCategory: (category: Omit<ExpenseCategory, 'id'>) => void;
  updateExpenseCategory: (id: string, category: Partial<ExpenseCategory>) => void;
  deleteExpenseCategory: (id: string) => void;
  maxDailyExpense: number;
  setMaxDailyExpense: (amount: number) => void;
  
  // Attendance Categories
  attendanceCategories: AttendanceCategory[];
  addAttendanceCategory: (category: Omit<AttendanceCategory, 'id'>) => void;
  updateAttendanceCategory: (id: string, category: Partial<AttendanceCategory>) => void;
  deleteAttendanceCategory: (id: string) => void;
  
  // Activity Categories
  activityCategories: ActivityCategory[];
  addActivityCategory: (category: Omit<ActivityCategory, 'id'>) => void;
  updateActivityCategory: (id: string, category: Partial<ActivityCategory>) => void;
  deleteActivityCategory: (id: string) => void;
  
  // Gatekeeper Passwords
  gatekeeperPasswords: GatekeeperPassword[];
  addGatekeeperPassword: (password: Omit<GatekeeperPassword, 'id'>) => void;
  updateGatekeeperPassword: (id: string, password: Partial<GatekeeperPassword>) => void;
  deleteGatekeeperPassword: (id: string) => void;
}

const defaultPrices: PriceData[] = [
  { id: 'attendance', name: 'Attendance', price: 65000 },
  { id: 'memorization', name: 'Memorization', price: 120000 },
  { id: 'activities', name: 'Activities', price: 8250, originalPrice: 82500 },
  { id: 'finance', name: 'Finance', price: 99000 },
  { id: 'full-package', name: 'Full Package', price: 249000 },
];

const defaultVouchers: VoucherData[] = [
  { id: '1', code: 'ramadhan', discount: 49, startDate: '2026-01-01', endDate: '2026-12-31' },
  { id: '2', code: 'merdeka', discount: 17, startDate: '2026-01-01', endDate: '2026-12-31' },
  { id: '3', code: 'muharam', discount: 20, startDate: '2026-01-01', endDate: '2026-12-31' },
  { id: '4', code: 'bayardengandoa', discount: 90, startDate: '2026-01-01', endDate: '2026-12-31' },
];

const defaultBanks: BankData[] = [
  { id: '1', bankName: 'BRI', accountNumber: '404301015163532', accountHolder: 'MARKAZ QURAN' },
];

const defaultWhatsAppCS: WhatsAppCSData[] = [
  { id: '1', name: 'Rizal 1', serviceType: 'CS Pendaftaran (halaman signup)', phoneNumber: '6282297697027' },
  { id: '2', name: 'Rizal 1', serviceType: 'CS Konfirmasi Pemesanan (halaman payment)', phoneNumber: '6282297697027' },
  { id: '3', name: 'Rizal 2', serviceType: 'CS Pembayaran Bonus', phoneNumber: '6285223857484' },
];

const defaultBonusSettings: BonusSettings = {
  gajiPokok: 600000,
  bonusPerHalaman: 1500,
  withdrawalWhatsapp: '6285223857484',
};

const defaultUsers = [
  { id: '1', username: 'admin', password: 'admin123' },
  { id: '2', username: 'guest', password: 'guest123' },
  { id: '3', username: 'demopesantren', password: 'freeplan' },
  { id: '4', username: 'demopesantren1', password: 'freeplan' },
  { id: '5', username: 'demopesantren2', password: 'freeplan' },
  { id: '6', username: 'demopesantren3', password: 'freeplan' },
  { id: '7', username: 'demopesantren4', password: 'freeplan' },
];

// New defaults
const defaultMemorizationPrograms: MemorizationProgram[] = [
  { id: '1', name: 'Tahsin', targetMonthly: 4, targetSemester: 20 },
  { id: '2', name: 'Tahfizh 1', targetMonthly: 6, targetSemester: 30 },
  { id: '3', name: 'Tahfizh 2', targetMonthly: 10, targetSemester: 50 },
  { id: '4', name: 'Tahfizh Kamil', targetMonthly: 20, targetSemester: 100 },
];

const defaultExpenseCategories: ExpenseCategory[] = [
  { id: '1', name: 'Makan' },
  { id: '2', name: 'Transport' },
  { id: '3', name: 'Kesehatan' },
  { id: '4', name: 'Pribadi' },
  { id: '5', name: 'Pendidikan' },
];

const defaultAttendanceCategories: AttendanceCategory[] = [
  { id: '1', name: 'Hadir' },
  { id: '2', name: 'Alpha' },
  { id: '3', name: 'Izin' },
  { id: '4', name: 'Sakit' },
  { id: '5', name: 'Tanpa Keterangan' },
  { id: '6', name: 'Haid' },
];

const defaultActivityCategories: ActivityCategory[] = [
  { id: '1', name: 'Bangun Tidur' },
  { id: '2', name: 'Tahajud' },
  { id: '3', name: 'Rawatib' },
  { id: '4', name: 'Shaum' },
  { id: '5', name: 'Tilawah' },
  { id: '6', name: 'Piket' },
];

const defaultGatekeeperPasswords: GatekeeperPassword[] = [
  { id: '1', pageName: 'Attendance', accessCode: 'attendance1' },
  { id: '2', pageName: 'Memorization', accessCode: 'memorization1' },
  { id: '3', pageName: 'Finance', accessCode: 'finance1' },
  { id: '4', pageName: 'Activities', accessCode: 'activities1' },
];

const allPages = [
  'dashboard', 'profile', 'attendance', 'halaqah', 'activities', 
  'finance', 'event', 'add-student', 'upgrade', 'payment', 'setting'
];

const generateDefaultPermissions = () => {
  const permissions: RolePermission[] = defaultUsers.map(user => ({
    userId: user.id,
    username: user.username,
    permissions: allPages.reduce((acc, page) => {
      if (user.username === 'guest') {
        acc[page] = page === 'dashboard';
      } else {
        acc[page] = true;
      }
      return acc;
    }, {} as { [page: string]: boolean })
  }));
  return permissions;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vouchers, setVouchers] = useState<VoucherData[]>(() => {
    const stored = localStorage.getItem('kdm_vouchers');
    return stored ? JSON.parse(stored) : defaultVouchers;
  });
  
  const [banks, setBanks] = useState<BankData[]>(() => {
    const stored = localStorage.getItem('kdm_banks');
    return stored ? JSON.parse(stored) : defaultBanks;
  });
  
  const [prices, setPrices] = useState<PriceData[]>(() => {
    const stored = localStorage.getItem('kdm_prices');
    return stored ? JSON.parse(stored) : defaultPrices;
  });
  
  const [whatsappNumber, setWhatsappNumberState] = useState<string>(() => {
    const stored = localStorage.getItem('kdm_whatsapp');
    return stored || '6285223857484';
  });
  
  const [whatsappCSList, setWhatsappCSList] = useState<WhatsAppCSData[]>(() => {
    const stored = localStorage.getItem('kdm_whatsapp_cs');
    return stored ? JSON.parse(stored) : defaultWhatsAppCS;
  });
  
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(() => {
    const stored = localStorage.getItem('kdm_role_permissions');
    return stored ? JSON.parse(stored) : generateDefaultPermissions();
  });
  
  const [users, setUsers] = useState<{ id: string; username: string; password: string }[]>(() => {
    const stored = localStorage.getItem('kdm_users');
    return stored ? JSON.parse(stored) : defaultUsers;
  });
  
  const [bonusSettings, setBonusSettings] = useState<BonusSettings>(() => {
    const stored = localStorage.getItem('kdm_bonus_settings');
    return stored ? JSON.parse(stored) : defaultBonusSettings;
  });
  
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(() => {
    const stored = localStorage.getItem('kdm_withdrawal_requests');
    return stored ? JSON.parse(stored) : [];
  });
  
  // New states
  const [memorizationPrograms, setMemorizationPrograms] = useState<MemorizationProgram[]>(() => {
    const stored = localStorage.getItem('kdm_memorization_programs');
    return stored ? JSON.parse(stored) : defaultMemorizationPrograms;
  });
  
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(() => {
    const stored = localStorage.getItem('kdm_expense_categories');
    return stored ? JSON.parse(stored) : defaultExpenseCategories;
  });
  
  const [maxDailyExpense, setMaxDailyExpenseState] = useState<number>(() => {
    const stored = localStorage.getItem('kdm_max_daily_expense');
    return stored ? parseInt(stored) : 15000;
  });
  
  const [attendanceCategories, setAttendanceCategories] = useState<AttendanceCategory[]>(() => {
    const stored = localStorage.getItem('kdm_attendance_categories');
    return stored ? JSON.parse(stored) : defaultAttendanceCategories;
  });
  
  const [activityCategories, setActivityCategories] = useState<ActivityCategory[]>(() => {
    const stored = localStorage.getItem('kdm_activity_categories');
    return stored ? JSON.parse(stored) : defaultActivityCategories;
  });
  
  const [gatekeeperPasswords, setGatekeeperPasswords] = useState<GatekeeperPassword[]>(() => {
    const stored = localStorage.getItem('kdm_gatekeeper_passwords');
    return stored ? JSON.parse(stored) : defaultGatekeeperPasswords;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('kdm_vouchers', JSON.stringify(vouchers));
  }, [vouchers]);
  
  useEffect(() => {
    localStorage.setItem('kdm_banks', JSON.stringify(banks));
  }, [banks]);
  
  useEffect(() => {
    localStorage.setItem('kdm_prices', JSON.stringify(prices));
  }, [prices]);
  
  useEffect(() => {
    localStorage.setItem('kdm_whatsapp', whatsappNumber);
  }, [whatsappNumber]);
  
  useEffect(() => {
    localStorage.setItem('kdm_whatsapp_cs', JSON.stringify(whatsappCSList));
  }, [whatsappCSList]);
  
  useEffect(() => {
    localStorage.setItem('kdm_role_permissions', JSON.stringify(rolePermissions));
  }, [rolePermissions]);
  
  useEffect(() => {
    localStorage.setItem('kdm_users', JSON.stringify(users));
  }, [users]);
  
  useEffect(() => {
    localStorage.setItem('kdm_bonus_settings', JSON.stringify(bonusSettings));
  }, [bonusSettings]);
  
  useEffect(() => {
    localStorage.setItem('kdm_withdrawal_requests', JSON.stringify(withdrawalRequests));
  }, [withdrawalRequests]);
  
  useEffect(() => {
    localStorage.setItem('kdm_memorization_programs', JSON.stringify(memorizationPrograms));
  }, [memorizationPrograms]);
  
  useEffect(() => {
    localStorage.setItem('kdm_expense_categories', JSON.stringify(expenseCategories));
  }, [expenseCategories]);
  
  useEffect(() => {
    localStorage.setItem('kdm_max_daily_expense', maxDailyExpense.toString());
  }, [maxDailyExpense]);
  
  useEffect(() => {
    localStorage.setItem('kdm_attendance_categories', JSON.stringify(attendanceCategories));
  }, [attendanceCategories]);
  
  useEffect(() => {
    localStorage.setItem('kdm_activity_categories', JSON.stringify(activityCategories));
  }, [activityCategories]);
  
  useEffect(() => {
    localStorage.setItem('kdm_gatekeeper_passwords', JSON.stringify(gatekeeperPasswords));
  }, [gatekeeperPasswords]);

  // Voucher functions
  const addVoucher = (voucher: Omit<VoucherData, 'id'>) => {
    const newVoucher = { ...voucher, id: Date.now().toString() };
    setVouchers([...vouchers, newVoucher]);
  };
  
  const updateVoucher = (id: string, voucher: Partial<VoucherData>) => {
    setVouchers(vouchers.map(v => v.id === id ? { ...v, ...voucher } : v));
  };
  
  const deleteVoucher = (id: string) => {
    setVouchers(vouchers.filter(v => v.id !== id));
  };

  // Bank functions
  const addBank = (bank: Omit<BankData, 'id'>) => {
    const newBank = { ...bank, id: Date.now().toString() };
    setBanks([...banks, newBank]);
  };
  
  const updateBank = (id: string, bank: Partial<BankData>) => {
    setBanks(banks.map(b => b.id === id ? { ...b, ...bank } : b));
  };
  
  const deleteBank = (id: string) => {
    setBanks(banks.filter(b => b.id !== id));
  };

  // Price functions
  const updatePrice = (id: string, price: Partial<PriceData>) => {
    setPrices(prices.map(p => p.id === id ? { ...p, ...price } : p));
  };

  // WhatsApp function
  const setWhatsappNumber = (number: string) => {
    setWhatsappNumberState(number);
  };
  
  // WhatsApp CS functions
  const addWhatsAppCS = (cs: Omit<WhatsAppCSData, 'id'>) => {
    const newCS = { ...cs, id: Date.now().toString() };
    setWhatsappCSList([...whatsappCSList, newCS]);
  };
  
  const updateWhatsAppCS = (id: string, cs: Partial<WhatsAppCSData>) => {
    setWhatsappCSList(whatsappCSList.map(c => c.id === id ? { ...c, ...cs } : c));
  };
  
  const deleteWhatsAppCS = (id: string) => {
    setWhatsappCSList(whatsappCSList.filter(c => c.id !== id));
  };

  // Role permission functions
  const updateRolePermission = (userId: string, page: string, allowed: boolean) => {
    setRolePermissions(rolePermissions.map(rp => 
      rp.userId === userId 
        ? { ...rp, permissions: { ...rp.permissions, [page]: allowed } }
        : rp
    ));
  };

  // User management functions
  const addUser = (user: { username: string; password: string }) => {
    const newUserId = Date.now().toString();
    const newUser = { id: newUserId, ...user };
    setUsers([...users, newUser]);
    
    const newPermission: RolePermission = {
      userId: newUserId,
      username: user.username,
      permissions: allPages.reduce((acc, page) => {
        acc[page] = true;
        return acc;
      }, {} as { [page: string]: boolean })
    };
    setRolePermissions([...rolePermissions, newPermission]);
  };
  
  const deleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    setRolePermissions(rolePermissions.filter(rp => rp.userId !== userId));
  };
  
  const updateUserPassword = (userId: string, newPassword: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, password: newPassword } : u));
  };
  
  // Bonus settings functions
  const updateBonusSettings = (settings: Partial<BonusSettings>) => {
    setBonusSettings(prev => ({ ...prev, ...settings }));
  };
  
  // Withdrawal request functions
  const addWithdrawalRequest = (request: Omit<WithdrawalRequest, 'id' | 'status'>) => {
    const newRequest: WithdrawalRequest = {
      ...request,
      id: Date.now().toString(),
      status: 'pending',
    };
    setWithdrawalRequests(prev => [...prev, newRequest]);
  };
  
  const updateWithdrawalStatus = (id: string, status: WithdrawalRequest['status']) => {
    setWithdrawalRequests(prev => 
      prev.map(req => req.id === id ? { ...req, status } : req)
    );
  };
  
  const deleteWithdrawalRequest = (id: string) => {
    setWithdrawalRequests(prev => prev.filter(req => req.id !== id));
  };
  
  // Memorization Programs functions
  const addMemorizationProgram = (program: Omit<MemorizationProgram, 'id'>) => {
    const newProgram = { ...program, id: Date.now().toString() };
    setMemorizationPrograms([...memorizationPrograms, newProgram]);
  };
  
  const updateMemorizationProgram = (id: string, program: Partial<MemorizationProgram>) => {
    setMemorizationPrograms(memorizationPrograms.map(p => p.id === id ? { ...p, ...program } : p));
  };
  
  const deleteMemorizationProgram = (id: string) => {
    setMemorizationPrograms(memorizationPrograms.filter(p => p.id !== id));
  };
  
  // Expense Categories functions
  const addExpenseCategory = (category: Omit<ExpenseCategory, 'id'>) => {
    const newCategory = { ...category, id: Date.now().toString() };
    setExpenseCategories([...expenseCategories, newCategory]);
  };
  
  const updateExpenseCategory = (id: string, category: Partial<ExpenseCategory>) => {
    setExpenseCategories(expenseCategories.map(c => c.id === id ? { ...c, ...category } : c));
  };
  
  const deleteExpenseCategory = (id: string) => {
    setExpenseCategories(expenseCategories.filter(c => c.id !== id));
  };
  
  const setMaxDailyExpense = (amount: number) => {
    setMaxDailyExpenseState(amount);
  };
  
  // Attendance Categories functions
  const addAttendanceCategory = (category: Omit<AttendanceCategory, 'id'>) => {
    const newCategory = { ...category, id: Date.now().toString() };
    setAttendanceCategories([...attendanceCategories, newCategory]);
  };
  
  const updateAttendanceCategory = (id: string, category: Partial<AttendanceCategory>) => {
    setAttendanceCategories(attendanceCategories.map(c => c.id === id ? { ...c, ...category } : c));
  };
  
  const deleteAttendanceCategory = (id: string) => {
    setAttendanceCategories(attendanceCategories.filter(c => c.id !== id));
  };
  
  // Activity Categories functions
  const addActivityCategory = (category: Omit<ActivityCategory, 'id'>) => {
    const newCategory = { ...category, id: Date.now().toString() };
    setActivityCategories([...activityCategories, newCategory]);
  };
  
  const updateActivityCategory = (id: string, category: Partial<ActivityCategory>) => {
    setActivityCategories(activityCategories.map(c => c.id === id ? { ...c, ...category } : c));
  };
  
  const deleteActivityCategory = (id: string) => {
    setActivityCategories(activityCategories.filter(c => c.id !== id));
  };
  
  // Gatekeeper Passwords functions
  const addGatekeeperPassword = (password: Omit<GatekeeperPassword, 'id'>) => {
    const newPassword = { ...password, id: Date.now().toString() };
    setGatekeeperPasswords([...gatekeeperPasswords, newPassword]);
  };
  
  const updateGatekeeperPassword = (id: string, password: Partial<GatekeeperPassword>) => {
    setGatekeeperPasswords(gatekeeperPasswords.map(p => p.id === id ? { ...p, ...password } : p));
  };
  
  const deleteGatekeeperPassword = (id: string) => {
    setGatekeeperPasswords(gatekeeperPasswords.filter(p => p.id !== id));
  };

  return (
    <SettingsContext.Provider value={{
      vouchers,
      addVoucher,
      updateVoucher,
      deleteVoucher,
      banks,
      addBank,
      updateBank,
      deleteBank,
      prices,
      updatePrice,
      whatsappNumber,
      setWhatsappNumber,
      whatsappCSList,
      addWhatsAppCS,
      updateWhatsAppCS,
      deleteWhatsAppCS,
      rolePermissions,
      updateRolePermission,
      addUser,
      deleteUser,
      updateUserPassword,
      users,
      bonusSettings,
      updateBonusSettings,
      withdrawalRequests,
      addWithdrawalRequest,
      updateWithdrawalStatus,
      deleteWithdrawalRequest,
      memorizationPrograms,
      addMemorizationProgram,
      updateMemorizationProgram,
      deleteMemorizationProgram,
      expenseCategories,
      addExpenseCategory,
      updateExpenseCategory,
      deleteExpenseCategory,
      maxDailyExpense,
      setMaxDailyExpense,
      attendanceCategories,
      addAttendanceCategory,
      updateAttendanceCategory,
      deleteAttendanceCategory,
      activityCategories,
      addActivityCategory,
      updateActivityCategory,
      deleteActivityCategory,
      gatekeeperPasswords,
      addGatekeeperPassword,
      updateGatekeeperPassword,
      deleteGatekeeperPassword,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
