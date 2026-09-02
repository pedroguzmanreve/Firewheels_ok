import React from 'react';
import { Student, Payment, AttendanceRecord, Plan, ClubInfo } from '../types';
import { INITIAL_CLUB_INFO } from '../data/initialData';
import { MascotAssistant } from './MascotAssistant';
import {
  Users,
  CreditCard,
  CalendarCheck,
  DollarSign,
  Link2,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  Settings,
  Smartphone,
  Zap,
  Sparkles,
  QrCode,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface DashboardProps {
  students: Student[];
  payments: Payment[];
  attendance: AttendanceRecord[];
  plans: Plan[];
  clubInfo?: ClubInfo;
  onNavigateTab: (tab: string) => void;
  onOpenShareModal: () => void;
  onOpenNewPaymentModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  students,
  payments,
  attendance,
  plans,
  clubInfo = INITIAL_CLUB_INFO,
  onNavigateTab,
  onOpenShareModal,
  onOpenNewPaymentModal,
}) => {
  const activeStudents = students.filter((s) => s.status === 'active');
  const TODAY = new Date().toISOString().split('T')[0];

  // Calculate payments for current month
  const currentMonthYear = 'Agosto 2026';
  const currentMonthPayments = payments.filter(
    (p) => p.period_month.includes('Agosto') || p.payment_date.startsWith('2026-08')
  );
  const totalIncomeMonth = currentMonthPayments.reduce((acc, curr) => acc + curr.amount, 0);

  // Students who paid this month
  const paidStudentIds = new Set(currentMonthPayments.map((p) => p.student_id));
  const pendingPaymentStudents = activeStudents.filter((s) => !paidStudentIds.has(s.id));

  // Attendance for today
  const todayAttendance = attendance.filter((a) => a.date === TODAY);
  const presentTodayCount = todayAttendance.filter((a) => a.status === 'present').length;

  return (
    <div className="space-y-8 pb-12">
      {/* PWA FUNCTION TILES GRID (BOTONES GRANDES DE ACCESO RÁPIDO) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-700" />
            <span>Funciones Principales PWA (Acceso Directo)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. TOMAR ASISTENCIA HOY */}
          <div
            onClick={() => onNavigateTab('attendance')}
            className="bg-gradient-to-br from-emerald-700 to-teal-900 text-white p-6 rounded-3xl shadow-md hover:shadow-xl transition-all cursor-pointer active:scale-[0.98] group relative overflow-hidden border-2 border-emerald-500/80 flex flex-col justify-between min-h-[170px]"
          >
            <div className="absolute -right-4 -bottom-4 text-emerald-400/20 pointer-events-none">
              <CalendarCheck className="w-32 h-32" />
            </div>

            <div className="relative z-10 flex items-start justify-between">
              <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <CalendarCheck className="w-7 h-7 text-amber-300" />
              </div>
              <span className="bg-amber-400 text-stone-950 text-xs font-black px-3 py-1 rounded-full uppercase shadow">
                Hoy
              </span>
            </div>

            <div className="relative z-10 mt-4">
              <h4 className="text-2xl font-black leading-tight text-white group-hover:text-amber-300 transition-colors">
                Tomar Asistencia Hoy 📝
              </h4>
              <p className="text-xs text-emerald-100 font-medium mt-1">
                {todayAttendance.length === 0
                  ? 'Aún no se ha tomado asistencia hoy. Toca aquí para registrar asistencia en pista.'
                  : `${presentTodayCount} presentes de ${activeStudents.length} alumnos registrados hoy.`}
              </p>
            </div>

            <div className="relative z-10 mt-3 pt-3 border-t border-emerald-500/50 flex items-center justify-between text-xs font-black text-amber-300">
              <span>Abrir Planilla de Asistencia</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. REGISTRAR NUEVO PAGO */}
          <div
            onClick={onOpenNewPaymentModal}
            className="bg-gradient-to-br from-red-950 via-red-900 to-stone-900 text-white p-6 rounded-3xl shadow-md hover:shadow-xl transition-all cursor-pointer active:scale-[0.98] group relative overflow-hidden border-2 border-amber-500/50 flex flex-col justify-between min-h-[170px]"
          >
            <div className="absolute -right-4 -bottom-4 text-amber-400/10 pointer-events-none">
              <CreditCard className="w-32 h-32" />
            </div>

            <div className="relative z-10 flex items-start justify-between">
              <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <Plus className="w-7 h-7 text-amber-300 stroke-[3]" />
              </div>
              <span className="bg-white/10 text-amber-200 border border-amber-300/30 text-xs font-bold px-3 py-1 rounded-full">
                Manual / Nequi
              </span>
            </div>

            <div className="relative z-10 mt-4">
              <h4 className="text-2xl font-black leading-tight text-white group-hover:text-amber-300 transition-colors">
                Registrar Pago 💳
              </h4>
              <p className="text-xs text-stone-300 font-medium mt-1">
                Ingresar recibo de mensualidad o matrícula por transferencia o efectivo.
              </p>
            </div>

            <div className="relative z-10 mt-3 pt-3 border-t border-amber-500/30 flex items-center justify-between text-xs font-black text-amber-300">
              <span>Registrar Pago de Alumno</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. ENVIAR LINK INSCRIPCIÓN PADRES */}
          <div
            onClick={onOpenShareModal}
            className="bg-gradient-to-br from-amber-700 via-amber-800 to-stone-900 text-white p-6 rounded-3xl shadow-md hover:shadow-xl transition-all cursor-pointer active:scale-[0.98] group relative overflow-hidden border-2 border-amber-500/60 flex flex-col justify-between min-h-[170px]"
          >
            <div className="absolute -right-4 -bottom-4 text-amber-300/10 pointer-events-none">
              <Link2 className="w-32 h-32" />
            </div>

            <div className="relative z-10 flex items-start justify-between">
              <div className="p-3.5 bg-stone-900 text-amber-300 rounded-2xl shadow border border-amber-400/40">
                <Link2 className="w-7 h-7 stroke-[2.5]" />
              </div>
              <span className="bg-amber-400 text-stone-950 text-xs font-black px-3 py-1 rounded-full shadow">
                WhatsApp
              </span>
            </div>

            <div className="relative z-10 mt-4">
              <h4 className="text-2xl font-black leading-tight text-white group-hover:text-amber-200 transition-colors">
                Inscribir Alumno por WhatsApp 🔗
              </h4>
              <p className="text-xs text-amber-100/90 font-medium mt-1">
                Copiar o compartir enlace directo para que el padre llene la ficha en su celular.
              </p>
            </div>

            <div className="relative z-10 mt-3 pt-3 border-t border-amber-400/30 flex items-center justify-between text-xs font-black text-amber-200">
              <span>Copiar Link / Enviar a Padres</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. DIRECTORIO DE ALUMNOS */}
          <div
            onClick={() => onNavigateTab('students')}
            className="bg-white hover:bg-red-50/60 text-stone-900 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98] group border-2 border-stone-200 hover:border-red-300 flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-red-100 text-red-800 rounded-2xl group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-red-800">
                {activeStudents.length} <span className="text-xs font-bold text-stone-500">activos</span>
              </span>
            </div>

            <div>
              <h4 className="text-xl font-extrabold text-stone-900 group-hover:text-red-800 transition-colors">
                Directorio de Alumnos
              </h4>
              <p className="text-xs text-stone-600 font-medium mt-1">
                Ver datos de contacto, tipo de patín, acudientes y estado del alumno.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-bold text-red-700">
              <span>Ver Lista Completa</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* 5. DOCUMENTOS Y FICHAS PDF */}
          <div
            onClick={() => onNavigateTab('documents')}
            className="bg-white hover:bg-amber-50/60 text-stone-900 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98] group border-2 border-stone-200 hover:border-amber-300 flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-1 rounded-full uppercase">
                Fichas PDF
              </span>
            </div>

            <div>
              <h4 className="text-xl font-extrabold text-stone-900 group-hover:text-amber-900 transition-colors">
                Documentos & Fichas de Inscripción
              </h4>
              <p className="text-xs text-stone-600 font-medium mt-1">
                Generar e imprimir fichas oficiales con firma digital del acudiente.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-bold text-amber-800">
              <span>Abrir Módulo Documentos</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* 6. PLANES Y MATRÍCULAS */}
          <div
            onClick={() => onNavigateTab('plans')}
            className="bg-white hover:bg-stone-100 text-stone-900 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98] group border-2 border-stone-200 hover:border-stone-400 flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-stone-200 text-stone-800 rounded-2xl group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6" />
              </div>
              <span className="text-xs font-black text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">
                {plans.length} Planes
              </span>
            </div>

            <div>
              <h4 className="text-xl font-extrabold text-stone-900 group-hover:text-red-800 transition-colors">
                Planes, Tarifas & Logo
              </h4>
              <p className="text-xs text-stone-600 font-medium mt-1">
                Configurar precios de mensualidad, cuota de matrícula y escudo del club.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-bold text-stone-700">
              <span>Gestionar Planes y Logo</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS & ALERTS SECTION */}
      <div className="pt-2">
        <MascotAssistant
          students={students}
          payments={payments}
          attendance={attendance}
          plans={plans}
          clubInfo={clubInfo}
          onNavigateTab={onNavigateTab}
        />
      </div>

      {/* QUICK OPERATIONAL METRICS BAR */}
      <div className="space-y-3 pt-2">
        <h3 className="text-lg font-black text-red-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Resumen de Cifras Clave ({currentMonthYear})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Alumnos Activos */}
          <div
            onClick={() => onNavigateTab('students')}
            className="bg-white p-5 rounded-2xl border-2 border-stone-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-stone-500 font-bold text-xs uppercase tracking-wider">
                Alumnos Activos
              </span>
              <Users className="w-5 h-5 text-red-700" />
            </div>
            <div className="text-3xl font-black text-red-800">
              {activeStudents.length}
            </div>
            <p className="text-[11px] text-stone-500 font-medium mt-0.5">
              Deportistas inscritos
            </p>
          </div>

          {/* Asistencia Hoy */}
          <div
            onClick={() => onNavigateTab('attendance')}
            className="bg-white p-5 rounded-2xl border-2 border-emerald-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-stone-500 font-bold text-xs uppercase tracking-wider">
                Asistencia Hoy
              </span>
              <CalendarCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-700">
              {presentTodayCount} <span className="text-lg text-stone-400">/ {activeStudents.length}</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
              {todayAttendance.length === 0 ? 'Falta tomar asistencia' : 'Asistencia en pista'}
            </p>
          </div>

          {/* Cobros Pendientes */}
          <div
            onClick={() => onNavigateTab('payments')}
            className="bg-white p-5 rounded-2xl border-2 border-rose-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-rose-700 font-bold text-xs uppercase tracking-wider">
                Pendientes de Pago
              </span>
              <Clock className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-3xl font-black text-rose-600">
              {pendingPaymentStudents.length}
            </div>
            <p className="text-[11px] text-rose-700 font-medium mt-0.5">
              Alumnos pendientes
            </p>
          </div>

          {/* Total Recaudado */}
          <div
            onClick={() => onNavigateTab('payments')}
            className="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-stone-500 font-bold text-xs uppercase tracking-wider">
                Recaudo del Mes
              </span>
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-red-800 truncate">
              ${totalIncomeMonth.toLocaleString('es-CO')}
            </div>
            <p className="text-[11px] text-stone-500 font-medium mt-0.5">
              Total pagado este mes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
