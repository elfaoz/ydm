import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddNewStudent from '@/components/AddNewStudent';
import RegisteredStudentsTable from '@/components/RegisteredStudentsTable';
import HalaqahManagement from '@/components/HalaqahManagement';
import StudentProfileTab from '@/components/StudentProfileTab';

const AddStudent: React.FC = () => {

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Student Management</h1>
        <p className="text-muted-foreground">Kelola data santri dan halaqah</p>
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="w-full flex overflow-x-auto scrollbar-hide whitespace-nowrap">
          <TabsTrigger value="students" className="flex-shrink-0">Add New Student</TabsTrigger>
          <TabsTrigger value="halaqah" className="flex-shrink-0">Halaqah Management</TabsTrigger>
          <TabsTrigger value="profile" className="flex-shrink-0">Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="students" className="space-y-6">
          <AddNewStudent />
          <RegisteredStudentsTable />
        </TabsContent>
        
        <TabsContent value="halaqah" className="space-y-6">
          <HalaqahManagement />
        </TabsContent>
        
        <TabsContent value="profile" className="space-y-6">
          <StudentProfileTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddStudent;
