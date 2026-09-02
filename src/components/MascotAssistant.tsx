import React, { useState } from 'react';
import { Student, Payment, AttendanceRecord, Plan, ClubInfo } from '../types';
import {
  MessageCircle,
  AlertTriangle,
  CalendarX,
  CreditCard,
  CheckCircle2,
  Bell,
  ChevronRight,
  Sparkles,
  User,
  ExternalLink,
  Zap,
  ShieldAlert,
} from 'lucide-react';

interface MascotAssistantProps {
  students: Student[];
  payments: Payment[];
  attendance: AttendanceRecord[];
  plans: Plan[];
  clubInfo: ClubInfo;
  onNavigateTab: (tab: string) => void;
  compactMode?: boolean;
}

export const MascotAssistant: React.FC<MascotAssistantProps> = ({
  students,
  payments,
  attendance,
  plans,
  clubInfo,
  onNavigateTab,
  compactMode = false,
}) => {
  const [filter, setFilter] = useState<'all' | 'absence' | 'payment'>('all');

  const activeStudents = students.filter((s) => s.status === 'active');
  const TODAY = new Date().toISOString().split('T')[0];

  // Helper for parent contact info
  const getParentPhone = (student: Student) => {
    return (
      student.guardian_phone ||
      student.guardian_cellphone ||
      student.mother_cellphone ||
      student.father_cellphone ||
      student.phone ||
      ''
    );
  };

  const getParentName = (student: Student) => {
    return (
      student.guardian_name ||
      student.mother_name ||
      student.father_name ||
      'Padre / Acudiente'
    );
  };

  const cleanPhoneForWhatsApp = (phoneStr: string) => {
    let digits = phoneStr.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length === 10 && !digits.startsWith('57')) {
      digits = '57' + digits;
    }
    return digits;
  };

  const sendWhatsApp = (student: Student, message: string) => {
    const rawPhone = getParentPhone(student);
    const cleaned = cleanPhoneForWhatsApp(rawPhone);
    if (!cleaned) {
      alert(
        `⚠️ No se encontró un número de celular registrado para el acudiente de ${student.full_name}. Por favor verifique la ficha del alumno.`
      );
      return;
    }
    const url = `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // 1. Calculate Attendance Alerts
  const uniqueDates = Array.from(new Set(attendance.map((a) => a.date))).sort().reverse();
  const latestDate = uniqueDates[0] || TODAY;

  interface AbsenceAlert {
    student: Student;
    totalAbsences: number;
    totalClasses: number;
    missedLatest: boolean;
    consecutiveAbsences: number;
    whatsappMessage: string;
  }

  const absenceAlerts: AbsenceAlert[] = [];

  activeStudents.forEach((student) => {
    const studentRecords = attendance.filter((a) => a.student_id === student.id);
    const totalAbsences = studentRecords.filter((a) => a.status === 'absent').length;
    const totalClasses = studentRecords.length;

    const latestRecord = studentRecords.find((a) => a.date === latestDate);
    const missedLatest = latestRecord?.status === 'absent';

    let consecutiveAbsences = 0;
    for (const d of uniqueDates) {
      const rec = studentRecords.find((a) => a.date === d);
      if (rec?.status === 'absent') {
        consecutiveAbsences++;
      } else if (rec?.status === 'present') {
        break;
      }
    }

    if (totalAbsences >= 2 || missedLatest || consecutiveAbsences >= 2) {
      const parentName = getParentName(student);
      const msg = `Hola ${parentName}, le saluda la dirección del ${clubInfo.name} 🛼. Notamos que ${student.full_name} ha registrado ${totalAbsences} ausencia(s) en sus clases de patinaje. Nos hace mucha falta en la pista. ¿Se encuentra todo bien con el deportista? ¡Los esperamos con mucho entusiasmo en la próxima clase! 🔥🛼`;

      absenceAlerts.push({
        student,
        totalAbsences,
        totalClasses,
        missedLatest,
        consecutiveAbsences,
        whatsappMessage: msg,
      });
    }
  });

  absenceAlerts.sort((a, b) => b.consecutiveAbsences - a.consecutiveAbsences || b.totalAbsences - a.totalAbsences);

  // 2. Calculate Payment Alerts
  const currentMonthPayments = payments.filter(
    (p) => p.period_month.includes('Agosto') || p.payment_date.startsWith('2026-08')
  );
  const paidStudentIds = new Set(currentMonthPayments.map((p) => p.student_id));

  interface PaymentAlert {
    student: Student;
    planName: string;
    amountDue: number;
    type: 'monthly' | 'enrollment' | 'both';
    whatsappMessage: string;
  }

  const paymentAlerts: PaymentAlert[] = [];

  activeStudents.forEach((student) => {
    const hasPaidMonthly = paidStudentIds.has(student.id);
    const studentPlan = plans.find((p) => p.id === student.plan_id);
    const planPrice = studentPlan?.price || 50000;
    const needsEnrollmentFee = !student.enrollment_fee_paid;

    if (!hasPaidMonthly || needsEnrollmentFee) {
      let amountDue = 0;
      let alertType: 'monthly' | 'enrollment' | 'both' = 'monthly';

      if (!hasPaidMonthly && needsEnrollmentFee) {
        amountDue = planPrice + clubInfo.enrollment_fee;
        alertType = 'both';
      } else if (!hasPaidMonthly) {
        amountDue = planPrice;
        alertType = 'monthly';
      } else {
        amountDue = clubInfo.enrollment_fee;
        alertType = 'enrollment';
      }

      const parentName = getParentName(student);
      let detailTxt = `la cuota de la mensualidad (Agosto 2026)`;
      if (alertType === 'enrollment') detailTxt = `el valor de la matrícula inicial`;
      if (alertType === 'both') detailTxt = `la mensualidad de Agosto 2026 ($${planPrice.toLocaleString('es-CO')}) + la matrícula ($${clubInfo.enrollment_fee.toLocaleString('es-CO')})`;

      const msg = `Hola ${parentName}, le saludamos con mucho cariño del ${clubInfo.name} 🛼. Le recordamos cordialmente que ${student.full_name} tiene pendiente ${detailTxt} por un valor total de $${amountDue.toLocaleString('es-CO')} COP. Puede realizar el pago al Nequi/Bancolombia: ${clubInfo.bank_details}. Quedamos atentos para registrar su comprobante. ¡Muchas gracias por apoyar a su deportista! 🛼✨`;

      paymentAlerts.push({
        student,
        planName: studentPlan?.name || 'Plan Estándar',
        amountDue,
        type: alertType,
        whatsappMessage: msg,
      });
    }
  });

  const totalAlertsCount = absenceAlerts.length + paymentAlerts.length;

  return (
    <div className="space-y-6">
      {/* CLEAN ALERTS BANNER CARD */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-stone-900 text-white p-5 sm:p-7 rounded-3xl shadow-lg border-b-4 border-amber-500/80 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 text-amber-400/10 pointer-events-none">
          <Bell className="w-56 h-56" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-300/40 px-3 py-1 rounded-full text-xs font-black text-amber-300 uppercase tracking-wide">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Centro de Novedades del Club
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Notificaciones & Contacto Directo WhatsApp
            </h2>

            <p className="text-stone-300 text-xs sm:text-sm font-medium max-w-xl">
              Monitoreo automático de inasistencias acumuladas y cobros pendientes del mes. Toca cualquier ficha para notificar al acudiente por WhatsApp.
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow ${
                filter === 'all'
                  ? 'bg-amber-400 text-stone-950 border-2 border-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Todas ({totalAlertsCount})</span>
            </button>

            <button
              onClick={() => setFilter('absence')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow ${
                filter === 'absence'
                  ? 'bg-amber-400 text-stone-950 border-2 border-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <CalendarX className="w-4 h-4 text-amber-300" />
              <span>Faltas ({absenceAlerts.length})</span>
            </button>

            <button
              onClick={() => setFilter('payment')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow ${
                filter === 'payment'
                  ? 'bg-amber-400 text-stone-950 border-2 border-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-300" />
              <span>Cobros ({paymentAlerts.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TOUCH INSTRUCTION */}
      {totalAlertsCount > 0 && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex items-center gap-3 text-amber-900 shadow-sm">
          <div className="p-2.5 bg-yellow-400 text-red-950 rounded-xl shrink-0 font-black">
            <Zap className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm font-extrabold leading-snug">
            <span className="text-red-800 uppercase block sm:inline mr-1">
              📱 Envío Rápido por Celular:
            </span>
            Toca <strong>CUALQUIER PARTE DE LA TARJETA</strong> para abrir WhatsApp y enviar la notificación formateada directamente al acudiente.
          </div>
        </div>
      )}

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-4">
        {/* ABSENCE ALERTS SECTION */}
        {(filter === 'all' || filter === 'absence') && absenceAlerts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Alumnos con inasistencias recientes ({absenceAlerts.length})</span>
              </h3>
              <button
                onClick={() => onNavigateTab('attendance')}
                className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-1 underline"
              >
                Ir a Asistencia <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {absenceAlerts.map((alertItem) => {
                const { student, totalAbsences, totalClasses, missedLatest, consecutiveAbsences, whatsappMessage } = alertItem;
                const parentName = getParentName(student);
                const parentPhone = getParentPhone(student);

                return (
                  <div
                    key={`abs-${student.id}`}
                    onClick={() => sendWhatsApp(student, whatsappMessage)}
                    className="w-full bg-white hover:bg-rose-50/90 border-2 border-rose-300 hover:border-rose-500 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98] group flex flex-col justify-between gap-4 select-none relative overflow-hidden"
                    title="Toca aquí para enviar mensaje de WhatsApp al acudiente"
                  >
                    {/* Top Alert Tag */}
                    <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                      <div className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-extrabold uppercase">
                        <CalendarX className="w-3.5 h-3.5 stroke-[3]" />
                        <span>
                          {consecutiveAbsences >= 2
                            ? `¡${consecutiveAbsences} Clases Seguidas Faltando!`
                            : `${totalAbsences} Inasistencias Registradas`}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
                        <User className="w-3 h-3 text-stone-400" /> {parentName}
                      </span>
                    </div>

                    {/* Student Info */}
                    <div className="flex items-start gap-3.5">
                      {student.photo_url ? (
                        <img
                          src={student.photo_url}
                          alt={student.full_name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-yellow-400 shrink-0 shadow"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white font-black text-xl flex items-center justify-center shrink-0 border-2 border-yellow-400 shadow">
                          {student.full_name.charAt(0)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-black text-stone-900 group-hover:text-red-700 transition-colors leading-tight truncate">
                          {student.full_name}
                        </h4>
                        <p className="text-xs text-stone-600 font-medium mt-0.5">
                          Acudiente: <strong className="text-stone-800">{parentName}</strong> {parentPhone ? `(${parentPhone})` : ''}
                        </p>
                        <p className="text-xs text-rose-700 font-extrabold mt-1.5 flex items-center gap-1">
                          ⚠️ Asistencia: {totalClasses - totalAbsences} de {totalClasses} clases.
                        </p>
                      </div>
                    </div>

                    {/* WhatsApp Action Button */}
                    <div className="w-full bg-emerald-600 group-hover:bg-emerald-500 text-white p-3.5 rounded-2xl font-black text-sm flex items-center justify-between gap-2 shadow-md transition-all">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 fill-white text-emerald-600 shrink-0" />
                        <span>Enviar Notificación por WhatsApp</span>
                      </div>
                      <ExternalLink className="w-4 h-4 shrink-0 opacity-80" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PAYMENT ALERTS SECTION */}
        {(filter === 'all' || filter === 'payment') && paymentAlerts.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-red-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-rose-600" />
                <span>Cobros y Mensualidades Pendientes ({paymentAlerts.length})</span>
              </h3>
              <button
                onClick={() => onNavigateTab('payments')}
                className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-1 underline"
              >
                Módulo de Pagos <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentAlerts.map((payItem) => {
                const { student, planName, amountDue, type, whatsappMessage } = payItem;
                const parentName = getParentName(student);
                const parentPhone = getParentPhone(student);

                return (
                  <div
                    key={`pay-${student.id}`}
                    onClick={() => sendWhatsApp(student, whatsappMessage)}
                    className="w-full bg-white hover:bg-amber-50/90 border-2 border-amber-300 hover:border-amber-500 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98] group flex flex-col justify-between gap-4 select-none relative overflow-hidden"
                    title="Toca aquí para enviar cobro recordatorio por WhatsApp"
                  >
                    {/* Top Tag */}
                    <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                      <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-black uppercase">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>
                          {type === 'both' && 'Mensualidad + Matrícula'}
                          {type === 'monthly' && 'Mensualidad Pendiente'}
                          {type === 'enrollment' && 'Matrícula Inicial'}
                        </span>
                      </div>
                      <span className="text-lg font-black text-red-800">
                        ${amountDue.toLocaleString('es-CO')} <span className="text-xs font-bold text-stone-500">COP</span>
                      </span>
                    </div>

                    {/* Student Info */}
                    <div className="flex items-start gap-3.5">
                      {student.photo_url ? (
                        <img
                          src={student.photo_url}
                          alt={student.full_name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-yellow-400 shrink-0 shadow"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white font-black text-xl flex items-center justify-center shrink-0 border-2 border-yellow-400 shadow">
                          {student.full_name.charAt(0)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-black text-stone-900 group-hover:text-red-700 transition-colors leading-tight truncate">
                          {student.full_name}
                        </h4>
                        <p className="text-xs text-stone-600 font-semibold mt-0.5">
                          Plan: <span className="text-red-800 font-bold">{planName}</span>
                        </p>
                        <p className="text-xs text-stone-600 font-medium">
                          Acudiente: <strong className="text-stone-800">{parentName}</strong> {parentPhone ? `(${parentPhone})` : ''}
                        </p>
                      </div>
                    </div>

                    {/* WhatsApp Action Button */}
                    <div className="w-full bg-emerald-600 group-hover:bg-emerald-500 text-white p-3.5 rounded-2xl font-black text-sm flex items-center justify-between gap-2 shadow-md transition-all">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 fill-white text-emerald-600 shrink-0" />
                        <span>Enviar Recordatorio de Pago</span>
                      </div>
                      <ExternalLink className="w-4 h-4 shrink-0 opacity-80" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ALL CLEAR STATE */}
        {totalAlertsCount === 0 && (
          <div className="bg-white p-8 rounded-3xl border-2 border-emerald-200 text-center space-y-3 shadow-sm">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <h3 className="text-2xl font-black text-stone-900">¡Todo marcha al día!</h3>
            <p className="text-stone-600 text-sm max-w-md mx-auto font-medium">
              No hay alumnos con inasistencias acumuladas ni cobros pendientes para este mes en el club.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
