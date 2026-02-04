import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, Database, FileJson, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const BackupData: React.FC = () => {
  const { t } = useLanguage();

  const handleBackupAll = () => {
    const backupData: { [key: string]: any } = {};
    
    // Collect all localStorage data with kdm_ prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('kdm_') || key === 'profile_data' || key === 'students' || key === 'halaqahs' || key === 'events') {
        try {
          backupData[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          backupData[key] = localStorage.getItem(key);
        }
      }
    }

    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_kdm_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: t('success'),
      description: t('backupSuccess'),
    });
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backupData = JSON.parse(event.target?.result as string);
        
        Object.entries(backupData).forEach(([key, value]) => {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        });

        toast({
          title: t('success'),
          description: t('restoreSuccess'),
        });

        // Reload to apply restored data
        window.location.reload();
      } catch (error) {
        toast({
          title: t('error'),
          description: t('restoreFailed'),
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm(t('confirmClearData'))) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('kdm_') || key === 'profile_data' || key === 'students' || key === 'halaqahs' || key === 'events') {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      toast({
        title: t('success'),
        description: t('dataClearedSuccess'),
      });

      window.location.reload();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('backupData')}</h1>
        <p className="text-muted-foreground">{t('backupDataDesc')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Backup Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-[#5db3d2]" />
              {t('downloadBackup')}
            </CardTitle>
            <CardDescription>{t('downloadBackupDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleBackupAll} 
              className="w-full bg-[#5db3d2] hover:bg-[#4a9ab8]"
            >
              <FileJson className="mr-2 h-4 w-4" />
              {t('backupNow')}
            </Button>
          </CardContent>
        </Card>

        {/* Restore Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-green-500" />
              {t('restoreBackup')}
            </CardTitle>
            <CardDescription>{t('restoreBackupDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreBackup}
                className="hidden"
              />
              <Button variant="outline" className="w-full" asChild>
                <span>
                  <Database className="mr-2 h-4 w-4" />
                  {t('selectBackupFile')}
                </span>
              </Button>
            </label>
          </CardContent>
        </Card>

        {/* Clear Data Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-red-500" />
              {t('clearAllData')}
            </CardTitle>
            <CardDescription>{t('clearAllDataDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleClearData} 
              variant="destructive" 
              className="w-full"
            >
              {t('clearData')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Database className="h-6 w-6 text-[#5db3d2] flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">{t('dataStoredLocally')}</h3>
              <p className="text-sm text-gray-600">{t('dataStoredLocallyDesc')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupData;
