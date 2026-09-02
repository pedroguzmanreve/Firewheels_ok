import React from 'react';
import { Award, LogOut, User as UserIcon } from 'lucide-react';
import { Logo } from './Logo';
import { ClubInfo } from '../types';
import { StorageService } from '../services/storageService';
import { User } from 'firebase/auth';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenShareModal: () => void;
  onTogglePublicMode: () => void;
  isPublicMode: boolean;
  clubInfo?: ClubInfo;
  onUpdateClubInfo?: (info: ClubInfo) => void;
  currentUser?: User | null;
  isAdminLoggedIn?: boolean;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenShareModal,
  onTogglePublicMode,
  isPublicMode,
  clubInfo,
  onUpdateClubInfo,
  currentUser,
  isAdminLoggedIn,
  onLogout,
}) => {
  const handleLogoChange = async (newLogoUrl: string) => {
    if (clubInfo && onUpdateClubInfo) {
      const updated = { ...clubInfo, logo_url: newLogoUrl };
      await StorageService.saveClubInfo(updated);
      onUpdateClubInfo(updated);
    }
  };

  if (isPublicMode) {
    return (
      <header className="bg-gradient-to-r from-red-950 via-red-900 to-stone-900 text-white py-4 px-4 sm:px-8 border-b-4 border-amber-500/80 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <Logo size="md" logoUrl={clubInfo?.logo_url} />
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
                {clubInfo?.name || 'CLUB DEPORTIVO FIRE WHEELS'}
              </h1>
              <p className="text-amber-200/90 text-xs sm:text-sm font-semibold tracking-wide uppercase">
                {clubInfo?.subtitle || 'Escuela Formativa de Patinaje'}
              </p>
            </div>
          </div>
          <button
            onClick={onTogglePublicMode}
            className="bg-white/10 hover:bg-white/20 text-white text-sm font-bold py-2 px-4 rounded-xl border border-amber-400/40 transition-all flex items-center gap-2"
          >
            ← Volver al Panel de Administración
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-gradient-to-r from-red-950 via-red-900 to-stone-900 text-white shadow-md sticky top-0 z-30 border-b-4 border-amber-500/80">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <Logo
            size="md"
            logoUrl={clubInfo?.logo_url}
            editable={true}
            onLogoChange={handleLogoChange}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight text-white">
                {clubInfo?.name || 'CLUB DEPORTIVO FIRE WHEELS'}
              </h1>
              <span className="hidden sm:inline-block bg-amber-400 text-stone-950 border border-amber-300 text-xs font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                ADMIN
              </span>
            </div>
            <p className="text-amber-200/90 text-xs font-medium tracking-wide uppercase flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              {clubInfo?.subtitle || 'Escuela Formativa de Patinaje'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Back to Dashboard Button when inside sub-modules */}
          {activeTab !== 'dashboard' && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs sm:text-sm py-2 px-3.5 rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
              title="Volver al Menú Principal"
            >
              <span>← Volver a Inicio</span>
            </button>
          )}

          {isAdminLoggedIn && (
            <div className="flex items-center gap-2">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Usuario'}
                  className="w-8 h-8 rounded-full border-2 border-amber-400 hidden sm:block object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : currentUser?.email ? (
                <div className="hidden md:flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 text-xs font-medium text-amber-200">
                  <UserIcon className="w-3.5 h-3.5 text-amber-300" />
                  <span className="max-w-[140px] truncate">{currentUser.email}</span>
                </div>
              ) : null}

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white text-xs font-bold py-2 px-3 rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
                  title="Cerrar sesión de administrador"
                >
                  <LogOut className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

