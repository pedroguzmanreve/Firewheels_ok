import React, { useState } from 'react';
import { Student, Plan, Payment } from '../types';
import { StorageService } from '../services/storageService';
import { CreditCard, Plus, MessageSquare, CheckCircle2, Clock, Search, DollarSign, Calendar, Trash2, Send, Filter, Check } from 'lucide-react';

interface PaymentsModuleProps {
  students: Student[];
  plans: Plan[];
  payments: Payment[];
  onPaymentAdded: () => void;
  onDeletePayment: (paymentId: string) => void;
  isNewPaymentModalOpen: boolean;
  setIsNewPaymentModalOpen: (open: boolean) => void;
}

export const PaymentsModule: React.FC<PaymentsModuleProps> = ({
  students,
  plans,
  payments,
  onPaymentAdded,
  onDeletePayment,
  isNewPaymentModalOpen,
  setIsNewPaymentModalOpen,
}) => {
  const currentMonthYear = 'Agosto 2026';
  const activeStudents = students.filter((s) => s.status === 'active');

  // Filter payments for current month
  const currentMonthPayments = payments.filter((p) => p.period_month.includes('Agosto') || p.payment_date.startsWith('2026-08'));
  const paidStudentIds = new Set(currentMonthPayments.map((p) => p.student_id));

  const pendingStudents = activeStudents.filter((s) => !paidStudentIds.has(s.id));
  const paidStudents = activeStudents.filter((s) => paidStudentIds.has(s.id));

  const [activeTab, setActiveTab] = useState<'pending' | 'paid' | 'history'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Form State
  const [selectedStudentId, setSelectedStudentId] = useState(activeStudents[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash'>('transfer');
  const [amount, setAmount] = useState<number>(50000);
  const [periodMonth, setPeriodMonth] = useState('Agosto 2026');
  const [notes, setNotes] = useState('');

  // Auto update amount when selected student changes
  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    const student = students.find((s) => s.id === studentId);
    if (student) {
      const studentPlan = plans.find((p) => p.id === student.plan_id);
      const planPrice = studentPlan?.price || 50000;
      const enrollmentFee = student.enrollment_fee_paid ? 0 : 15000;
      setAmount(planPrice + enrollmentFee);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    setIsSaving(true);
    try {
      await StorageService.addPayment({
        student_id: selectedStudentId,
        amount: Number(amount),
        payment_method: paymentMethod,
        payment_date: new Date().toISOString().split('T')[0],
        period_month: periodMonth,
        period_year: 2026,
        notes: notes,
      });

      onPaymentAdded();
      setIsNewPaymentModalOpen(false);
      setNotes('');
    } catch (err) {
      console.error('Error adding payment:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const totalCollected = currentMonthPayments.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-stone-900 text-white p-5 sm:p-7 rounded-3xl shadow-lg border-b-4 border-amber-500/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-amber-400 text-stone-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
            Regla: Pagos primeros 5 días hábiles del mes
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Gestión de Pagos y Cobros 💳
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm font-medium">
            Registre los pagos de mensualidad e inscripción o envíe avisos amigables a los acudientes por WhatsApp.
          </p>
        </div>

        <button
          onClick={() => {
            if (activeStudents.length > 0) handleStudentSelect(activeStudents[0].id);
            setIsNewPaymentModalOpen(true);
          }}
          className="w-full md:w-auto bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-base shrink-0 border-2 border-amber-300/80 active:scale-95"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>Registrar Pago</span>
        </button>
      </div>

      {/* METRIC BANNER - SPACIOUS & RESPONSIVE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-3xl border-2 border-amber-200/80 shadow-sm flex items-center gap-4 min-w-0">
          <div className="p-3.5 bg-amber-50 text-amber-800 rounded-2xl shrink-0 border border-amber-200/60">
            <DollarSign className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-black text-stone-500 uppercase tracking-wider block">
              Recaudado este Mes
            </span>
            <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight truncate my-0.5">
              ${totalCollected.toLocaleString('es-CO')}
            </div>
            <span className="text-xs font-bold text-emerald-700 block">
              Mes de {currentMonthYear}
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-3xl border-2 border-rose-200 shadow-sm flex items-center gap-4 min-w-0">
          <div className="p-3.5 bg-rose-50 text-rose-800 rounded-2xl shrink-0 border border-rose-200/60">
            <Clock className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-black text-stone-500 uppercase tracking-wider block">
              Pendientes de Pago
            </span>
            <div className="text-2xl sm:text-3xl font-black text-rose-700 tracking-tight leading-tight my-0.5">
              {pendingStudents.length} <span className="text-sm font-bold text-stone-500">alumnos</span>
            </div>
            <span className="text-xs font-bold text-rose-700 block">
              Envíe aviso por WhatsApp
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-3xl border-2 border-emerald-200 shadow-sm flex items-center gap-4 min-w-0 sm:col-span-2 lg:col-span-1">
          <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl shrink-0 border border-emerald-200/60">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-black text-stone-500 uppercase tracking-wider block">
              Al día este Mes
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight leading-tight my-0.5">
              {paidStudents.length} <span className="text-sm font-bold text-stone-500">alumnos</span>
            </div>
            <span className="text-xs font-bold text-emerald-700 block">
              Mensualidad al día
            </span>
          </div>
        </div>
      </div>

      {/* TABS SELECTOR - CLEAN GRID FOR MOBILE & DESKTOP */}
      <div className="bg-stone-100 p-1.5 rounded-2xl border-2 border-stone-200 shadow-inner grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`w-full py-3 px-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-stone-700 hover:bg-stone-200 bg-white sm:bg-transparent'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pendientes ({pendingStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('paid')}
          className={`w-full py-3 px-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'paid'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-stone-700 hover:bg-stone-200 bg-white sm:bg-transparent'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Al Día ({paidStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`w-full py-3 px-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'history'
              ? 'bg-red-700 text-white shadow-md'
              : 'text-stone-700 hover:bg-stone-200 bg-white sm:bg-transparent'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Historial de Pagos ({payments.length})</span>
        </button>
      </div>

      {/* TAB 1: PENDING PAYMENTS LIST */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingStudents.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border-2 border-stone-200 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold text-stone-800">¡Todos los alumnos están al día!</h3>
              <p className="text-stone-500 text-sm">No hay cobros pendientes para el mes de {currentMonthYear}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingStudents.map((student) => {
                const studentPlan = plans.find((p) => p.id === student.plan_id);
                const amountDue = (studentPlan?.price || 0) + (student.enrollment_fee_paid ? 0 : 15000);
                const guardianPhone = student.guardian_phone || student.phone;

                return (
                  <div
                    key={student.id}
                    className="bg-white p-5 rounded-3xl border-2 border-rose-200 shadow-sm flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-extrabold text-stone-900 text-lg">
                            {student.full_name}
                          </h3>
                          <span className="text-xs font-bold text-stone-500 block">
                            Acudiente: {student.guardian_name}
                          </span>
                        </div>
                        <span className="bg-rose-100 text-rose-800 border border-rose-300 font-extrabold text-xs px-2.5 py-1 rounded-full shrink-0">
                          PENDIENTE
                        </span>
                      </div>

                      <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-700">
                          Plan: {studentPlan?.name || '1 vez por semana'}
                        </span>
                        <span className="text-lg font-black text-rose-700">
                          ${amountDue.toLocaleString('es-CO')} COP
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const message = encodeURIComponent(
                            `Hola ${student.guardian_name}, te saludamos del Club Deportivo Fire Wheels 🛼. Te recordamos que la mensualidad de ${student.full_name} para el mes de ${currentMonthYear} está pendiente ($${amountDue.toLocaleString('es-CO')} COP). Método de pago: Transferencia o Efectivo. ¡Muchas gracias por tu valioso apoyo!`
                          );
                          const cleanPhone = guardianPhone.replace(/\D/g, '');
                          const targetPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;
                          window.open(`https://wa.me/${targetPhone}?text=${message}`, '_blank');
                        }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow transition-all active:scale-95"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Aviso WhatsApp</span>
                      </button>

                      <button
                        onClick={() => {
                          handleStudentSelect(student.id);
                          setIsNewPaymentModalOpen(true);
                        }}
                        className="bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center gap-1 shadow"
                      >
                        <Plus className="w-4 h-4 text-yellow-300" />
                        <span>Pagar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAID STUDENTS LIST */}
      {activeTab === 'paid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {paidStudents.map((student) => {
            const studentPlan = plans.find((p) => p.id === student.plan_id);
            const studentPayment = payments.find((p) => p.student_id === student.id);

            return (
              <div
                key={student.id}
                className="bg-white p-5 rounded-3xl border-2 border-emerald-200 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-base">
                      {student.full_name}
                    </h3>
                    <span className="text-xs text-stone-500 font-medium block">
                      Plan: {studentPlan?.name}
                    </span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Al Día
                  </span>
                </div>

                <div className="bg-emerald-50/60 p-3 rounded-2xl text-xs space-y-1 font-medium text-stone-700">
                  <div className="flex justify-between">
                    <span>Monto pagado:</span>
                    <span className="font-bold text-emerald-800">${studentPayment?.amount.toLocaleString('es-CO')} COP</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fecha de pago:</span>
                    <span className="font-semibold text-stone-800">{studentPayment?.payment_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medio de Pago:</span>
                    <span className="font-bold uppercase text-red-800">
                      {studentPayment?.payment_method === 'transfer' ? 'Transferencia' : 'Efectivo'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: PAYMENT HISTORY TABLE */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border-2 border-stone-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-800">
              <thead className="bg-red-700 text-white font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Deportista</th>
                  <th className="p-4">Período</th>
                  <th className="p-4">Método</th>
                  <th className="p-4">Monto</th>
                  <th className="p-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-medium">
                {payments.map((p) => {
                  const student = students.find((s) => s.id === p.student_id);

                  return (
                    <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                      <td className="p-4 font-bold text-stone-900">{p.payment_date}</td>
                      <td className="p-4 font-extrabold text-red-900">
                        {student ? student.full_name : 'Alumno Eliminado'}
                      </td>
                      <td className="p-4">{p.period_month}</td>
                      <td className="p-4">
                        <span className="bg-stone-100 text-stone-800 border px-2.5 py-1 rounded-lg text-xs font-bold uppercase">
                          {p.payment_method === 'transfer' ? 'Transferencia' : 'Efectivo'}
                        </span>
                      </td>
                      <td className="p-4 text-emerald-700 font-black text-base">
                        ${p.amount.toLocaleString('es-CO')} COP
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            if (confirm('¿Desea eliminar este registro de pago?')) {
                              onDeletePayment(p.id);
                            }
                          }}
                          className="text-rose-600 hover:text-rose-800 p-2 rounded-lg hover:bg-rose-50"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NEW PAYMENT FORM MODAL */}
      {isNewPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-stone-300 overflow-hidden my-auto">
            <div className="bg-red-700 text-white p-5 flex items-center justify-between border-b-4 border-yellow-400">
              <h3 className="text-xl font-black flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-yellow-300" />
                Registrar Nuevo Pago
              </h3>
              <button
                onClick={() => setIsNewPaymentModalOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-xl text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Seleccionar Deportista *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full bg-stone-50 border-2 border-stone-300 rounded-xl p-3 text-sm font-extrabold text-stone-900 focus:outline-none focus:border-red-600"
                >
                  {activeStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.guardian_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Método de Pago *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'transfer' | 'cash')}
                    className="w-full bg-stone-50 border-2 border-stone-300 rounded-xl p-3 text-sm font-bold text-stone-900"
                  >
                    <option value="transfer">Transferencia (Nequi/Bancolombia)</option>
                    <option value="cash">Efectivo en Pista</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Monto Recibido ($ COP) *
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    className="w-full bg-stone-50 border-2 border-stone-300 rounded-xl p-3 text-base font-black text-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Mes / Período *
                </label>
                <input
                  type="text"
                  value={periodMonth}
                  onChange={(e) => setPeriodMonth(e.target.value)}
                  placeholder="Ej. Agosto 2026"
                  required
                  className="w-full bg-stone-50 border-2 border-stone-300 rounded-xl p-3 text-sm font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Notas u Observaciones (Opcional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Comprobante de Nequi #12345"
                  className="w-full bg-stone-50 border-2 border-stone-300 rounded-xl p-3 text-sm text-stone-900"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewPaymentModalOpen(false)}
                  className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold py-3 rounded-xl text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-sm shadow"
                >
                  Guardar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
