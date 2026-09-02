import React, { useState, useEffect } from 'react';
import { Student, AttendanceRecord } from '../types';
import { StorageService } from '../services/storageService';
import { Calendar, Check, X, AlertTriangle, CheckCircle2, Save, Sparkles, UserCheck, Search, RotateCcw } from 'lucide-react';

interface AttendanceModuleProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onSaveAttendance: (updatedRecords: AttendanceRecord[]) => void;
}

export const AttendanceModule: React.FC<AttendanceModuleProps> = ({
  students,
  attendanceRecords,
  onSaveAttendance,
}) => {
  const TODAY = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSavedToast, setIsSavedToast] = useState(false);

  const activeStudents = students.filter((s) => s.status === 'active');

  // Local state map for the current selected date: student_id -> 'present' | 'absent' | 'excused'
  const [attendanceState, setAttendanceState] = useState<Record<string, 'present' | 'absent' | 'excused'>>({});
  const [notesState, setNotesState] = useState<Record<string, string>>({});

  // Populate state whenever date changes
  useEffect(() => {
    const recordsForDate = attendanceRecords.filter((r) => r.date === selectedDate);
    const map: Record<string, 'present' | 'absent' | 'excused'> = {};
    const notesMap: Record<string, string> = {};

    activeStudents.forEach((s) => {
      const rec = recordsForDate.find((r) => r.student_id === s.id);
      map[s.id] = rec ? rec.status : 'present'; // Default to 'present' for ease of use
      if (rec?.notes) notesMap[s.id] = rec.notes;
    });

    setAttendanceState(map);
    setNotesState(notesMap);
  }, [selectedDate, attendanceRecords, students]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'excused') => {
    setAttendanceState((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setNotesState((prev) => ({ ...prev, [studentId]: note }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, 'present' | 'absent' | 'excused'> = {};
    activeStudents.forEach((s) => {
      updated[s.id] = 'present';
    });
    setAttendanceState(updated);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const recordsToSave = activeStudents.map((s) => ({
        student_id: s.id,
        status: attendanceState[s.id] || 'present',
        notes: notesState[s.id] || '',
      }));

      const updatedSaved = await StorageService.saveDateAttendance(selectedDate, recordsToSave);
      const allRecords = await StorageService.getAttendance();
      onSaveAttendance(allRecords);

      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 3000);
    } catch (err) {
      console.error('Error saving attendance:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredActiveStudents = activeStudents.filter((s) =>
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Counters
  const totalCount = activeStudents.length;
  const presentCount = Object.values(attendanceState).filter((st) => st === 'present').length;
  const absentCount = Object.values(attendanceState).filter((st) => st === 'absent').length;
  const excusedCount = Object.values(attendanceState).filter((st) => st === 'excused').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Quick Stats */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-stone-900 text-white p-6 rounded-3xl shadow-lg border-b-4 border-amber-500/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-400 text-stone-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 shadow-sm">
            Control de Asistencia Diario
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Toma de Asistencia de Clase 🛼
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm mt-1 font-medium">
            Seleccione la fecha y toque los botones grandes para registrar la presencia de cada deportista.
          </p>
        </div>

        {/* Date Selector */}
        <div className="bg-white/10 p-3 rounded-2xl border border-white/20 flex flex-col gap-1 shrink-0">
          <label className="text-amber-300 font-extrabold text-xs uppercase flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-300" /> Fecha de Clase:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white text-stone-900 font-black text-base py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* SUMMARY BANNER COUNTERS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border-2 border-stone-200 shadow-sm text-center">
          <span className="text-xs text-stone-500 font-bold uppercase block">Total Alumnos</span>
          <span className="text-3xl font-black text-red-800">{totalCount}</span>
        </div>

        <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-300 shadow-sm text-center">
          <span className="text-xs text-emerald-800 font-extrabold uppercase block">Presentes</span>
          <span className="text-3xl font-black text-emerald-700">{presentCount}</span>
        </div>

        <div className="bg-rose-50 p-4 rounded-2xl border-2 border-rose-300 shadow-sm text-center">
          <span className="text-xs text-rose-800 font-extrabold uppercase block">Ausentes</span>
          <span className="text-3xl font-black text-rose-700">{absentCount}</span>
        </div>

        <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-300 shadow-sm text-center">
          <span className="text-xs text-amber-900 font-extrabold uppercase block">Excusados</span>
          <span className="text-3xl font-black text-amber-700">{excusedCount}</span>
        </div>
      </div>

      {/* ACTIONS BAR & SEARCH */}
      <div className="bg-white p-4 rounded-2xl border-2 border-stone-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de alumno..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border-2 border-stone-300 rounded-xl text-stone-900 font-semibold focus:outline-none focus:border-red-600 text-sm"
          />
        </div>

        <button
          onClick={handleMarkAllPresent}
          className="w-full sm:w-auto bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-extrabold py-3 px-5 rounded-xl border-2 border-emerald-400 transition-all flex items-center justify-center gap-2 text-sm shadow-sm active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-emerald-700" />
          <span>Marcar Todos Presentes</span>
        </button>
      </div>

      {/* SUCCESS TOAST ALERT */}
      {isSavedToast && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between text-base font-extrabold animate-bounce">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7" />
            <span>¡Asistencia de la fecha {selectedDate} guardada exitosamente!</span>
          </div>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Guardado</span>
        </div>
      )}

      {/* LIST OF STUDENTS WITH GIANT TOUCH BUTTONS */}
      <div className="space-y-4">
        {filteredActiveStudents.map((student) => {
          const currentStatus = attendanceState[student.id] || 'present';

          return (
            <div
              key={student.id}
              className={`p-5 rounded-3xl border-3 shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                currentStatus === 'present'
                  ? 'bg-emerald-50/50 border-emerald-300'
                  : currentStatus === 'absent'
                  ? 'bg-rose-50/50 border-rose-300'
                  : 'bg-amber-50/50 border-amber-300'
              }`}
            >
              {/* Student info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-700 text-yellow-300 font-black text-xl flex items-center justify-center overflow-hidden shrink-0 shadow-md">
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
                  <h3 className="text-xl font-extrabold text-stone-900 leading-snug">
                    {student.full_name}
                  </h3>
                  <span className="text-xs text-stone-600 font-semibold block mt-0.5">
                    Acudiente: {student.guardian_name} ({student.guardian_phone || student.phone})
                  </span>
                </div>
              </div>

              {/* GIANT TOUCH TOGGLE BUTTONS */}
              <div className="flex items-center gap-2 w-full lg:w-auto">
                {/* PRESENTE BUTTON */}
                <button
                  type="button"
                  onClick={() => handleStatusChange(student.id, 'present')}
                  className={`flex-1 lg:w-36 py-4 px-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 border-2 active:scale-95 ${
                    currentStatus === 'present'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg ring-2 ring-emerald-500 scale-[1.02]'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-emerald-50'
                  }`}
                >
                  <Check className={`w-5 h-5 ${currentStatus === 'present' ? 'stroke-[3]' : ''}`} />
                  <span>Presente</span>
                </button>

                {/* AUSENTE BUTTON */}
                <button
                  type="button"
                  onClick={() => handleStatusChange(student.id, 'absent')}
                  className={`flex-1 lg:w-36 py-4 px-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 border-2 active:scale-95 ${
                    currentStatus === 'absent'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-lg ring-2 ring-rose-500 scale-[1.02]'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-rose-50'
                  }`}
                >
                  <X className={`w-5 h-5 ${currentStatus === 'absent' ? 'stroke-[3]' : ''}`} />
                  <span>Ausente</span>
                </button>

                {/* EXCUSA BUTTON */}
                <button
                  type="button"
                  onClick={() => handleStatusChange(student.id, 'excused')}
                  className={`flex-1 lg:w-36 py-4 px-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 border-2 active:scale-95 ${
                    currentStatus === 'excused'
                      ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-lg ring-2 ring-amber-400 scale-[1.02]'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-amber-50'
                  }`}
                >
                  <AlertTriangle className={`w-5 h-5 ${currentStatus === 'excused' ? 'stroke-[3]' : ''}`} />
                  <span>Excusa</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* BIG PRIMARY SAVE BUTTON */}
      <div className="sticky bottom-4 pt-4">
        <button
          onClick={handleSave}
          className="w-full bg-red-700 hover:bg-red-800 text-white font-black text-2xl py-5 px-8 rounded-3xl shadow-2xl transition-all flex items-center justify-center gap-3 border-4 border-yellow-400 active:scale-[0.99]"
        >
          <Save className="w-8 h-8 text-yellow-300" />
          <span>GUARDAR ASISTENCIA DE HOY</span>
        </button>
      </div>
    </div>
  );
};
