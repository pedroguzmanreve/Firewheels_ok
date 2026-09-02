/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from './services/storageService';
import { AuthService } from './services/authService';
import { Plan, Student, Payment, AttendanceRecord, ClubInfo } from './types';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { StudentsList } from './components/StudentsList';
import { AttendanceModule } from './components/AttendanceModule';
import { PaymentsModule } from './components/PaymentsModule';
import { PlansModule } from './components/PlansModule';
import { DocumentsModule } from './components/DocumentsModule';
import { PublicRegistration } from './components/PublicRegistration';
import { ShareModal } from './components/ShareModal';
import { AdminLogin } from './components/AdminLogin';
import { RotateCcw, Loader2 } from 'lucide-react';
import { INITIAL_CLUB_INFO } from './data/initialData';
import { User } from 'firebase/auth';

export default function App() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [clubInfo, setClubInfo] = useState<ClubInfo>(INITIAL_CLUB_INFO);

  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      return localStorage.getItem('firewheels_active_tab') || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });
  const [isPublicMode, setIsPublicMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.includes('/inscribirse') || hash.includes('inscribirse')) {
        return true;
      }
      try {
        return localStorage.getItem('firewheels_is_public_mode') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isNewPaymentModalOpen, setIsNewPaymentModalOpen] = useState<boolean>(false);

  // Sync activeTab changes to localStorage and hash
  const handleSetActiveTab = useCallback((tab: string) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('firewheels_active_tab', tab);
      localStorage.setItem('firewheels_is_public_mode', 'false');
    } catch (e) {
      console.warn('Could not save tab in localStorage:', e);
    }
    if (window.location.hash.includes('inscribirse')) {
      window.location.hash = '';
    }
  }, []);

  const handleSetPublicMode = useCallback((mode: boolean) => {
    setIsPublicMode(mode);
    try {
      localStorage.setItem('firewheels_is_public_mode', String(mode));
    } catch (e) {
      console.warn('Could not save public mode in localStorage:', e);
    }
    if (mode) {
      window.location.hash = '/inscribirse';
    } else if (window.location.hash.includes('inscribirse')) {
      window.location.hash = '';
    }
  }, []);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);

  // Load public data (plans + club config)
  const loadPublicData = useCallback(async () => {
    try {
      const [fetchedPlans, fetchedClubInfo] = await Promise.all([
        StorageService.getPlans(),
        StorageService.getClubInfo(),
      ]);
      setPlans(fetchedPlans);
      setClubInfo(fetchedClubInfo);
    } catch (err) {
      console.error('Error loading public club info:', err);
    }
  }, []);

  // Load admin data (students, payments, attendance)
  const loadAdminData = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const [fetchedPlans, fetchedStudents, fetchedPayments, fetchedAttendance, fetchedClubInfo] =
        await Promise.all([
          StorageService.getPlans(),
          StorageService.getStudents(),
          StorageService.getPayments(),
          StorageService.getAttendance(),
          StorageService.getClubInfo(),
        ]);

      setPlans(fetchedPlans);
      setStudents(fetchedStudents);
      setPayments(fetchedPayments);
      setAttendance(fetchedAttendance);
      setClubInfo(fetchedClubInfo);
    } catch (err) {
      console.error('Error loading admin data from Firestore:', err);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  // Subscribe to Auth state changes
  useEffect(() => {
    const unsubscribe = AuthService.onAuthChange((user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      if (user) {
        loadAdminData();
      } else {
        loadPublicData();
      }
    });

    // Check hash for direct route like #/inscribirse
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('/inscribirse') || hash.includes('inscribirse')) {
        setIsPublicMode(true);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      unsubscribe();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [loadAdminData, loadPublicData]);

  // Handlers for state updates
  const handleStudentsUpdated = async () => {
    const freshStudents = await StorageService.getStudents();
    setStudents(freshStudents);
  };

  const handlePaymentsUpdated = async () => {
    const freshPayments = await StorageService.getPayments();
    setPayments(freshPayments);
  };

  const handlePlansUpdated = async () => {
    const freshPlans = await StorageService.getPlans();
    setPlans(freshPlans);
  };

  const handleAttendanceUpdated = (newRecords: AttendanceRecord[]) => {
    setAttendance(newRecords);
  };

  const handleResetData = async () => {
    if (
      confirm(
        '¿Está segura de sincronizar / restaurar los datos de demostración en Firestore? Esto inicializará los planes, estudiantes y asistencias base.'
      )
    ) {
      setIsDataLoading(true);
      try {
        await StorageService.resetToDefault();
        await loadAdminData();
      } finally {
        setIsDataLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setStudents([]);
    setPayments([]);
    setAttendance([]);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1A1A1A] font-sans antialiased flex flex-col justify-between selection:bg-amber-400 selection:text-stone-950">
      <div>
        {/* Navigation & Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={(tab) => {
            handleSetActiveTab(tab);
            handleSetPublicMode(false);
          }}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onTogglePublicMode={() => handleSetPublicMode(!isPublicMode)}
          isPublicMode={isPublicMode}
          clubInfo={clubInfo}
          onUpdateClubInfo={(info) => setClubInfo(info)}
          currentUser={currentUser}
          isAdminLoggedIn={!!currentUser}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {isAuthLoading ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
              <p className="text-stone-600 font-bold text-sm">Cargando Club Deportivo Fire Wheels...</p>
            </div>
          ) : isPublicMode ? (
            /* Public Registration View for Parents */
            <PublicRegistration
              plans={plans}
              clubInfo={clubInfo}
              onSuccessSubmit={async () => {
                if (currentUser) {
                  await handleStudentsUpdated();
                }
              }}
            />
          ) : !currentUser ? (
            /* Admin Auth Screen */
            <AdminLogin
              clubInfo={clubInfo}
              onSuccessLogin={loadAdminData}
              onGoToPublicRegistration={() => handleSetPublicMode(true)}
            />
          ) : isDataLoading && students.length === 0 ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
              <p className="text-stone-600 font-bold text-sm">Consultando base de datos Firebase...</p>
            </div>
          ) : (
            /* Admin Authenticated Modules */
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  students={students}
                  payments={payments}
                  attendance={attendance}
                  plans={plans}
                  clubInfo={clubInfo}
                  onNavigateTab={(tab) => handleSetActiveTab(tab)}
                  onOpenShareModal={() => setIsShareModalOpen(true)}
                  onOpenNewPaymentModal={() => {
                    handleSetActiveTab('payments');
                    setIsNewPaymentModalOpen(true);
                  }}
                />
              )}

              {activeTab === 'students' && (
                <StudentsList
                  students={students}
                  plans={plans}
                  payments={payments}
                  clubInfo={clubInfo}
                  onOpenNewStudentForm={() => handleSetPublicMode(true)}
                  onUpdateStudent={async (updatedStudent) => {
                    await StorageService.updateStudent(updatedStudent);
                    await handleStudentsUpdated();
                  }}
                  onDeleteStudent={async (studentId) => {
                    await StorageService.deleteStudent(studentId);
                    await handleStudentsUpdated();
                  }}
                />
              )}

              {activeTab === 'documents' && (
                <DocumentsModule
                  students={students}
                  plans={plans}
                  clubInfo={clubInfo}
                  onUpdateStudent={handleStudentsUpdated}
                  onOpenShareModal={() => setIsShareModalOpen(true)}
                />
              )}

              {activeTab === 'attendance' && (
                <AttendanceModule
                  students={students}
                  attendanceRecords={attendance}
                  onSaveAttendance={handleAttendanceUpdated}
                />
              )}

              {activeTab === 'payments' && (
                <PaymentsModule
                  students={students}
                  plans={plans}
                  payments={payments}
                  onPaymentAdded={handlePaymentsUpdated}
                  onDeletePayment={async (paymentId) => {
                    await StorageService.deletePayment(paymentId);
                    await handlePaymentsUpdated();
                  }}
                  isNewPaymentModalOpen={isNewPaymentModalOpen}
                  setIsNewPaymentModalOpen={setIsNewPaymentModalOpen}
                />
              )}

              {activeTab === 'plans' && (
                <PlansModule
                  plans={plans}
                  clubInfo={clubInfo}
                  onPlansUpdated={handlePlansUpdated}
                  onClubInfoUpdated={(info) => setClubInfo(info)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onTogglePublicMode={() => setIsPublicMode(true)}
        clubInfo={clubInfo}
      />

      {/* Simplified Footer */}
      <footer className="bg-stone-200 border-t border-stone-300 py-6 px-4 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-stone-600">
          <div className="flex items-center gap-2">
            <span className="text-base">🛼</span>
            <span>
              <strong>Club Deportivo Fire Wheels</strong> — Escuela Formativa de Patinaje
            </span>
          </div>

          <div className="flex items-center gap-4">
            {currentUser && (
              <button
                onClick={handleResetData}
                className="text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors"
                title="Inicializar datos base en Firestore"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Sincronizar Datos Iniciales Firestore</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
