import React, { useState } from 'react';
import { AuthService } from '../services/authService';
import { ShieldCheck, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { Logo } from './Logo';
import { ClubInfo } from '../types';

interface AdminLoginProps {
  clubInfo?: ClubInfo;
  onSuccessLogin: () => void;
  onGoToPublicRegistration: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  clubInfo,
  onSuccessLogin,
  onGoToPublicRegistration,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    try {
      await AuthService.loginWithGoogle();
      onSuccessLogin();
    } catch (err: any) {
      console.error('Google login error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('La ventana de inicio de sesión con Google fue cerrada.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMessage('El navegador bloqueó la ventana emergente de Google. Por favor permita ventanas emergentes e intente nuevamente.');
      } else {
        setErrorMessage(err.message || 'Error al iniciar sesión con Google.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Por favor ingrese correo electrónico y contraseña.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await AuthService.loginWithEmail(email, password);
      onSuccessLogin();
    } catch (err: any) {
      console.error('Login error:', err);
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        setErrorMessage('Credenciales inválidas. Compruebe su correo y contraseña.');
      } else {
        setErrorMessage(err.message || 'Error al iniciar sesión en el club.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-stone-900 text-white p-8 text-center border-b-4 border-amber-500/80">
          <div className="flex justify-center mb-3">
            <Logo size="lg" logoUrl={clubInfo?.logo_url} />
          </div>
          <h2 className="text-2xl font-black tracking-tight uppercase">
            {clubInfo?.name || 'CLUB DEPORTIVO FIRE WHEELS'}
          </h2>
          <p className="text-amber-300 text-xs font-bold uppercase tracking-wider mt-1">
            Acceso Administrativo Seguro
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 text-xs sm:text-sm p-3.5 rounded-2xl flex items-center gap-2 font-semibold">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Primary Action: Google Authentication */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="w-full bg-white hover:bg-stone-50 text-stone-800 font-bold py-3.5 px-4 rounded-xl border-2 border-stone-300 hover:border-stone-400 shadow-sm transition-all flex items-center justify-center gap-3 text-sm active:scale-[0.98] disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-stone-600" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Iniciar Sesión con Google</span>
                </>
              )}
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink mx-4 text-stone-400 text-xs font-bold uppercase">
              o con correo institucional
            </span>
            <div className="flex-grow border-t border-stone-200"></div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Correo del Director / Administrador:
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@firewheels.com"
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Contraseña de Seguridad:
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full bg-gradient-to-r from-red-950 to-red-900 hover:from-red-900 hover:to-stone-900 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm border border-amber-500/40 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                  <span>Acceder con Correo</span>
                </>
              )}
            </button>
          </form>

          {/* Link to public registration */}
          <div className="pt-4 border-t border-stone-100 text-center">
            <button
              type="button"
              onClick={onGoToPublicRegistration}
              className="text-stone-600 hover:text-amber-800 text-xs font-bold underline"
            >
              ¿Eres padre de familia? Ir al Formulario Público de Inscripción →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

