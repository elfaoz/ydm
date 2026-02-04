import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Attendance from "./pages/Attendance";
import Halaqah from "./pages/Halaqah";
import Activities from "./pages/Activities";
import Finance from "./pages/Finance";
import AddStudent from "./pages/AddStudent";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import KDM from "./pages/KDM";
import UpgradePlan from "./pages/UpgradePlan";
import Payment from "./pages/Payment";
import Install from "./pages/Install";
import Event from "./pages/Event";
import Settings from "./pages/Settings";
import UserManagement from "./pages/UserManagement";
import BackupData from "./pages/BackupData";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => (
  <>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        {/* Halaman publik */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/kdm" element={<KDM />} />
        <Route path="/upgrade" element={<UpgradePlan />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/install" element={<Install />} />

        {/* Dashboard - guest allowed */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute guestAllowed={true}>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* Halaman yang dilindungi */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <Layout>
                <Attendance />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/halaqah"
          element={
            <ProtectedRoute>
              <Layout>
                <Halaqah />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/activities"
          element={
            <ProtectedRoute>
              <Layout>
                <Activities />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance"
          element={
            <ProtectedRoute>
              <Layout>
                <Finance />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/event"
          element={
            <ProtectedRoute>
              <Layout>
                <Event />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-student"
          element={
            <ProtectedRoute>
              <Layout>
                <AddStudent />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-management"
          element={
            <ProtectedRoute>
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/backup"
          element={
            <ProtectedRoute guestAllowed={true}>
              <Layout>
                <BackupData />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </>
);

export default App;
