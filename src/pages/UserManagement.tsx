import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Key, Eye, EyeOff, GraduationCap, Users, UserCheck, Shield, Book, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import { useLanguage } from '@/contexts/LanguageContext';

type UserRole = 'santri' | 'guru' | 'ortu' | 'admin' | 'muhafizh';

interface UserWithRole {
  id: string;
  username: string;
  password: string;
  role: UserRole;
}

// Helper to migrate old role names to new - moved outside component
const migrateOldRole = (oldRole: string): UserRole => {
  switch (oldRole) {
    case 'student': return 'santri';
    case 'teacher': return 'guru';
    case 'parent': return 'ortu';
    case 'admin': return 'admin';
    case 'muhafizh': return 'muhafizh';
    default: 
      if (['santri', 'guru', 'ortu', 'admin', 'muhafizh'].includes(oldRole)) {
        return oldRole as UserRole;
      }
      return 'santri';
  }
};

// Generate default users
const generateDefaultUsers = (): UserWithRole[] => {
  const defaultUsers: UserWithRole[] = [];
  
  // Admin accounts (10)
  for (let i = 1; i <= 10; i++) {
    defaultUsers.push({
      id: `admin-${i}`,
      username: i === 1 ? 'admin' : `admin${i}`,
      password: 'admin123',
      role: 'admin'
    });
  }
  
  // Santri accounts (350)
  for (let i = 1; i <= 350; i++) {
    defaultUsers.push({
      id: `santri-${i}`,
      username: `santri${i}`,
      password: 'santri123',
      role: 'santri'
    });
  }
  
  // Guru accounts (350)
  for (let i = 1; i <= 350; i++) {
    defaultUsers.push({
      id: `guru-${i}`,
      username: `guru${i}`,
      password: 'guru123',
      role: 'guru'
    });
  }
  
  // Ortu accounts (350)
  for (let i = 1; i <= 350; i++) {
    defaultUsers.push({
      id: `ortu-${i}`,
      username: `ortu${i}`,
      password: 'ortu123',
      role: 'ortu'
    });
  }
  
  // Muhafizh accounts (100)
  for (let i = 1; i <= 100; i++) {
    defaultUsers.push({
      id: `muhafizh-${i}`,
      username: `muhafizh${i}`,
      password: 'muhafizh123',
      role: 'muhafizh'
    });
  }
  
  return defaultUsers;
};

const UserManagement: React.FC = () => {
  const { t } = useLanguage();
  const { users, addUser, deleteUser, updateUserPassword } = useSettings();
  
  const [usersWithRoles, setUsersWithRoles] = useState<UserWithRole[]>(() => {
    const stored = localStorage.getItem('kdm_users_roles');
    if (stored) {
      // Migrate old roles to new roles
      const parsedUsers = JSON.parse(stored);
      return parsedUsers.map((u: any) => ({
        ...u,
        role: migrateOldRole(u.role)
      }));
    }
    
    return generateDefaultUsers();
  });

  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [editPasswordId, setEditPasswordId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<UserRole>('santri');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 20;

  // Persist users with roles
  useEffect(() => {
    localStorage.setItem('kdm_users_roles', JSON.stringify(usersWithRoles));
  }, [usersWithRoles]);

  // Reset page and search when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery('');
  }, [activeTab]);

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password) {
      toast({ title: t('error'), description: t('usernamePasswordRequired'), variant: 'destructive' });
      return;
    }
    
    if (usersWithRoles.find(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
      toast({ title: t('error'), description: t('usernameExists'), variant: 'destructive' });
      return;
    }
    
    const newUserWithRole: UserWithRole = {
      id: Date.now().toString(),
      username: newUser.username,
      password: newUser.password,
      role: activeTab
    };
    
    setUsersWithRoles([...usersWithRoles, newUserWithRole]);
    setNewUser({ username: '', password: '' });
    setAddDialogOpen(false);
    toast({ title: t('success'), description: t('userAdded') });
  };

  const handleUpdatePassword = (userId: string) => {
    if (!newPassword) {
      toast({ title: t('error'), description: t('passwordRequired'), variant: 'destructive' });
      return;
    }
    
    setUsersWithRoles(usersWithRoles.map(u => 
      u.id === userId ? { ...u, password: newPassword } : u
    ));
    setEditPasswordId(null);
    setNewPassword('');
    toast({ title: t('success'), description: t('passwordUpdated') });
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      setUsersWithRoles(usersWithRoles.filter(u => u.id !== userToDelete));
      setUserToDelete(null);
      setDeleteDialogOpen(false);
      toast({ title: t('success'), description: t('userDeleted') });
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPassword(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Filter users by role and search query
  const filteredUsers = useMemo(() => {
    return usersWithRoles.filter(u => {
      const matchesRole = u.role === activeTab;
      const matchesSearch = searchQuery 
        ? u.username.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesRole && matchesSearch;
    });
  }, [usersWithRoles, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'santri': return <GraduationCap className="h-4 w-4" />;
      case 'guru': return <UserCheck className="h-4 w-4" />;
      case 'ortu': return <Users className="h-4 w-4" />;
      case 'muhafizh': return <Book className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'santri': return t('santriRole');
      case 'guru': return t('guruRole');
      case 'ortu': return t('ortuRole');
      case 'muhafizh': return t('muhafizhRole');
      case 'admin': return t('adminRole');
    }
  };

  const getUserCount = (role: UserRole) => {
    return usersWithRoles.filter(u => u.role === role).length;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('userManagement')}</h1>
        <p className="text-muted-foreground">{t('manageAppUsers')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as UserRole); setCurrentPage(1); }}>
        <TabsList className="w-full flex overflow-x-auto scrollbar-hide whitespace-nowrap">
          <TabsTrigger value="santri" className="flex items-center gap-2 flex-shrink-0">
            <GraduationCap className="h-4 w-4" />
            {t('santriRole')} ({getUserCount('santri')})
          </TabsTrigger>
          <TabsTrigger value="guru" className="flex items-center gap-2 flex-shrink-0">
            <UserCheck className="h-4 w-4" />
            {t('guruRole')} ({getUserCount('guru')})
          </TabsTrigger>
          <TabsTrigger value="ortu" className="flex items-center gap-2 flex-shrink-0">
            <Users className="h-4 w-4" />
            {t('ortuRole')} ({getUserCount('ortu')})
          </TabsTrigger>
          <TabsTrigger value="muhafizh" className="flex items-center gap-2 flex-shrink-0">
            <Book className="h-4 w-4" />
            {t('muhafizhRole')} ({getUserCount('muhafizh')})
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex items-center gap-2 flex-shrink-0">
            <Shield className="h-4 w-4" />
            {t('adminRole')} ({getUserCount('admin')})
          </TabsTrigger>
        </TabsList>

        {(['santri', 'guru', 'ortu', 'muhafizh', 'admin'] as UserRole[]).map(role => (
          <TabsContent key={role} value={role}>
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getRoleIcon(role)}
                    {t('userList')} - {getRoleLabel(role)}
                  </CardTitle>
                  <CardDescription>{t('addEditDeleteUsers')}</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder={t('searchUsers')}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>
                  <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#5db3d2] hover:bg-[#4a9ab8]">
                        <Plus className="h-4 w-4 mr-2" />
                        {t('addUser')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('addNewUser')} - {getRoleLabel(activeTab)}</DialogTitle>
                        <DialogDescription>{t('enterUsernamePassword')}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>{t('username')}</Label>
                          <Input
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            placeholder={t('username')}
                          />
                        </div>
                        <div>
                          <Label>{t('password')}</Label>
                          <Input
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            placeholder={t('password')}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setAddDialogOpen(false)}>{t('cancel')}</Button>
                        <Button onClick={handleAddUser} className="bg-[#5db3d2] hover:bg-[#4a9ab8]">{t('add')}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>{t('username')}</TableHead>
                      <TableHead>{t('password')}</TableHead>
                      <TableHead>{t('action')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user, idx) => (
                      <TableRow key={user.id}>
                        <TableCell>{(currentPage - 1) * itemsPerPage + idx + 1}</TableCell>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>
                          {editPasswordId === user.id ? (
                            <div className="flex gap-2 items-center">
                              <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder={t('newPassword')}
                                className="w-40"
                              />
                              <Button size="sm" onClick={() => handleUpdatePassword(user.id)}>
                                {t('save')}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => {
                                setEditPasswordId(null);
                                setNewPassword('');
                              }}>
                                {t('cancel')}
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-mono">
                                {showPassword[user.id] ? user.password : '••••••••'}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => togglePasswordVisibility(user.id)}
                              >
                                {showPassword[user.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditPasswordId(user.id);
                                setNewPassword('');
                              }}
                            >
                              <Key className="h-4 w-4 mr-1" />
                              {t('editPassword')}
                            </Button>
                            <Dialog open={deleteDialogOpen && userToDelete === user.id} onOpenChange={(open) => {
                              setDeleteDialogOpen(open);
                              if (!open) setUserToDelete(null);
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setUserToDelete(user.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{t('deleteUser')}</DialogTitle>
                                  <DialogDescription>
                                    {t('confirmDeleteUser')} "{user.username}"? {t('actionCannotBeUndone')}.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>{t('cancel')}</Button>
                                  <Button variant="destructive" onClick={handleDeleteUser}>{t('delete')}</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      {t('showing')} {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} {t('of')} {filteredUsers.length}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        {t('previous')}
                      </Button>
                      <span className="flex items-center px-3 text-sm">
                        {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        {t('next')}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default UserManagement;
