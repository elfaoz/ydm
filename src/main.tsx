import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { StudentProvider } from "./contexts/StudentContext";
import { HalaqahProvider } from "./contexts/HalaqahContext";
import { MemorizationProvider } from "./contexts/MemorizationContext";
import { AttendanceProvider } from "./contexts/AttendanceContext";
import { ActivityProvider } from "./contexts/ActivityContext";
import { FinanceProvider } from "./contexts/FinanceContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import { EventProvider } from "./contexts/EventContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SettingsProvider>
        <LanguageProvider>
          <EventProvider>
            <ProfileProvider>
              <StudentProvider>
                <HalaqahProvider>
                  <MemorizationProvider>
                    <AttendanceProvider>
                      <ActivityProvider>
                        <FinanceProvider>
                          <TooltipProvider>
                            <App />
                            <Toaster />
                          </TooltipProvider>
                        </FinanceProvider>
                      </ActivityProvider>
                    </AttendanceProvider>
                  </MemorizationProvider>
                </HalaqahProvider>
              </StudentProvider>
            </ProfileProvider>
          </EventProvider>
        </LanguageProvider>
      </SettingsProvider>
    </AuthProvider>
  </QueryClientProvider>
);
