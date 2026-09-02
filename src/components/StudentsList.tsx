import React, { useState } from 'react';
import { Student, Plan, Payment, ClubInfo } from '../types';
import { StudentDetailModal } from './StudentDetailModal';
import { Search, Plus, User, Phone, CheckCircle2, AlertCircle, Eye, Filter, UserCheck, UserX } from 'lucide-react';

interface StudentsListProps {
  students: Student[];
  plans: Plan[];
  payments: Payment[];
  clubInfo?: ClubInfo;
  onOpenNewStudentForm: () => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  students,
  plans,
  payments,
  clubInfo,
  onOpenNewStudentForm,
  onUpdateStudent,
  onDeleteStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const currentMonthYear = 'Agosto 2026';
  const currentMonthPayments = payments.filter((p) => p.period_month.includes('Agosto') || p.payment_date.startsWith('2026-08'));
  const paidStudentIds = new Set(currentMonthPayments.map((p) => p.student_id));

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.document_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.guardian_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.guardian_phone.includes(searchTerm);

    if (statusFilter === 'active') return matchesSearch && s.status === 'active';
    if (statusFilter === 'inactive') return matchesSearch && s.status === 'inactive';
    return matchesSearch;
  });

  const handleToggleStatus = (student: Student) => {
    const newStatus = student.status === 'active' ? 'inactive' : 'active';
    const updated = { ...student, status: newStatus as 'active' | 'inactive' };
    onUpdateStudent(updated);
    if (selectedStudent?.id === student.id) {
      setSelectedStudent(updated);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
            Listado de Deportistas ({students.length})
          </h2>
          <p className="text-stone-600 text-sm font-medium">
            Consulte las fichas de inscripción, planes asignados y estado de cada estudiante.
          </p>
        </div>

        <button
          onClick={onOpenNewStudentForm}
          className="bg-red-700 hover:bg-red-800 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-base active:scale-95 border-2 border-yellow-400"
        >
          <Plus className="w-5 h-5 text-yellow-300 stroke-[3]" />
          <span>Inscribir Nuevo Alumno</span>
        </button>
      </div>

      {/* SEARCH AND FILTER CONTROLS */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-stone-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, documento o acudiente..."
            className="w-full pl-11 pr-4 py-3 bg-stone-50 border-2 border-stone-300 rounded-2xl text-stone-900 font-semibold focus:outline-none focus:border-red-600 focus:bg-white text-sm"
          />
        </div>

        {/* Status Filter Toggle */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'active'
                ? 'bg-red-700 text-white shadow'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Activos ({students.filter((s) => s.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'inactive'
                ? 'bg-red-700 text-white shadow'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <UserX className="w-4 h-4" /> Inactivos ({students.filter((s) => s.status === 'inactive').length})
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-red-700 text-white shadow'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            Todos ({students.length})
          </button>
        </div>
      </div>

      {/* STUDENTS TABLE / CARDS GRID */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-stone-300 text-center space-y-3">
          <User className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="text-xl font-bold text-stone-800">No se encontraron deportistas</h3>
          <p className="text-stone-500 text-sm max-w-md mx-auto">
            Pruebe modificando el término de búsqueda o registre un nuevo alumno con el botón de inscripción.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((student) => {
            const studentPlan = plans.find((p) => p.id === student.plan_id);
            const isPaid = paidStudentIds.has(student.id);

            return (
              <div
                key={student.id}
                className="bg-white rounded-3xl border-2 border-stone-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar Card */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-red-700/10 border border-red-700/20 text-red-900 font-black text-xl flex items-center justify-center overflow-hidden shrink-0">
                        {student.photo_url ? (
                          <img
                            src={student.photo_url}
                            alt={student.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>🛼</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-stone-900 text-lg leading-snug">
                          {student.full_name}
                        </h3>
                        <span className="text-xs font-semibold text-stone-500 block">
                          Doc: {student.document_number}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Badge & Payment Status */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold px-3 py-1 rounded-full">
                      {studentPlan?.name || '1 vez a la semana'}
                    </span>

                    {isPaid ? (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pago al día
                      </span>
                    ) : (
                      <span className="bg-rose-100 text-rose-800 border border-rose-300 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Pago Pendiente
                      </span>
                    )}
                  </div>

                  {/* Contact Summary */}
                  <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs space-y-1.5 text-stone-700 font-medium">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Acudiente:</span>
                      <span className="font-bold text-stone-900">{student.guardian_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Celular:</span>
                      <a
                        href={`https://wa.me/57${(student.guardian_phone || student.phone).replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-emerald-700 underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        {student.guardian_phone || student.phone}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">EPS/Seguro:</span>
                      <span className="font-semibold text-stone-800">{student.medical_entity || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-3 border-t border-stone-200 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="flex-1 bg-red-700 hover:bg-red-800 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
                  >
                    <Eye className="w-4 h-4 text-yellow-300" />
                    <span>Ver Ficha Completa</span>
                  </button>

                  <button
                    onClick={() => handleToggleStatus(student)}
                    className={`px-3 py-2.5 rounded-xl font-extrabold text-xs border transition-colors ${
                      student.status === 'active'
                        ? 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                    }`}
                    title={student.status === 'active' ? 'Marcar inactivo' : 'Reactivar'}
                  >
                    {student.status === 'active' ? 'Inactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STUDENT DETAIL MODAL */}
      <StudentDetailModal
        student={selectedStudent}
        plans={plans}
        clubInfo={clubInfo}
        onClose={() => setSelectedStudent(null)}
        onEditStudent={onUpdateStudent}
        onDeleteStudent={onDeleteStudent}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
};
