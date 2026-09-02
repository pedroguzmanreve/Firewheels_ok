import React, { useState } from 'react';
import { Student, Plan, ClubInfo, AttachedDocument } from '../types';
import { OfficialRegistrationDocument } from './OfficialRegistrationDocument';
import { StorageService } from '../services/storageService';
import { Search, Printer, FileText, UserCheck, CheckCircle2, AlertCircle, Camera, Share2, Link2, Download, MessageSquare, FolderUp, Eye, X, FileCheck } from 'lucide-react';
import { Logo } from './Logo';

interface DocumentsModuleProps {
  students: Student[];
  plans: Plan[];
  clubInfo: ClubInfo;
  onUpdateStudent?: () => void;
  onOpenShareModal?: () => void;
}

export const DocumentsModule: React.FC<DocumentsModuleProps> = ({
  students,
  plans,
  clubInfo,
  onUpdateStudent,
  onOpenShareModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );
  const [previewDoc, setPreviewDoc] = useState<AttachedDocument | null>(null);

  // Filter students
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.full_name.toLowerCase().includes(q) ||
      s.document_number.toLowerCase().includes(q) ||
      s.guardian_name.toLowerCase().includes(q) ||
      s.phone.includes(q)
    );
  });

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) || filteredStudents[0] || students[0];

  const selectedPlan = plans.find((p) => p.id === selectedStudent?.plan_id);

  const isPdf = (doc: AttachedDocument) => {
    return (
      doc.mime_type === 'application/pdf' ||
      doc.file_name.toLowerCase().endsWith('.pdf') ||
      doc.file_url.startsWith('data:application/pdf')
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Photo update handler from admin
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStudent) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const updated = { ...selectedStudent, photo_url: reader.result as string };
        StorageService.updateStudent(updated);
        if (onUpdateStudent) onUpdateStudent();
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-stone-900 text-white p-6 rounded-3xl shadow-lg border-b-4 border-amber-500/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo size="md" logoUrl={clubInfo.logo_url} />
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Módulo de Documentos y Fichas de Inscripción
            </h2>
            <p className="text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
              Club Deportivo Fire Wheels — Documentos Oficiales
            </p>
          </div>
        </div>

        {onOpenShareModal && (
          <button
            onClick={onOpenShareModal}
            className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold py-3 px-5 rounded-xl shadow transition-all flex items-center gap-2 text-sm shrink-0 active:scale-95"
          >
            <Share2 className="w-4 h-4 stroke-[2.5]" />
            <span>Compartir Link a Padres</span>
          </button>
        )}
      </div>

      {students.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border-2 border-stone-200 text-center space-y-4 shadow-sm">
          <FileText className="w-16 h-16 text-stone-300 mx-auto" />
          <h3 className="text-xl font-black text-stone-800">
            Aún no hay Fichas de Inscripción Registradas
          </h3>
          <p className="text-stone-600 max-w-md mx-auto text-sm font-medium">
            Envíe el enlace de inscripción por WhatsApp a los padres para que diligencien la ficha desde su celular. Todos los formularios completados aparecerán listos aquí.
          </p>
          {onOpenShareModal && (
            <button
              onClick={onOpenShareModal}
              className="bg-red-700 text-white font-bold py-3 px-6 rounded-xl text-sm shadow hover:bg-red-800 transition-all inline-flex items-center gap-2"
            >
              <Link2 className="w-4 h-4 text-yellow-300" />
              <span>Obtener Link de WhatsApp</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDEBAR: STUDENT LIST SELECTOR */}
          <div className="lg:col-span-4 bg-white p-5 rounded-3xl border-2 border-stone-200 shadow-md space-y-4 print:hidden">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-red-900 text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-yellow-500" />
                <span>Fichas Alumnos ({filteredStudents.length})</span>
              </h3>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por alumno, documento..."
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-stone-900 focus:outline-none focus:border-red-600"
              />
            </div>

            {/* LIST OF STUDENTS */}
            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {filteredStudents.map((s) => {
                const isSelected = selectedStudent?.id === s.id;
                const studentPlan = plans.find((p) => p.id === s.plan_id);

                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStudentId(s.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-red-700 text-white border-red-700 shadow-md'
                        : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* Avatar */}
                      <div className="w-10 h-12 bg-stone-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs">
                        {s.photo_url ? (
                          <img src={s.photo_url} alt={s.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className={isSelected ? 'text-white' : 'text-stone-500'}>
                            {s.full_name.charAt(0)}
                          </span>
                        )}
                      </div>

                      <div className="overflow-hidden">
                        <p className={`font-extrabold text-xs truncate ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                          {s.full_name}
                        </p>
                        <p className={`text-[10px] ${isSelected ? 'text-yellow-300' : 'text-stone-500'}`}>
                          Doc: {s.document_number || 'S.N'}
                        </p>
                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                          isSelected ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30' : 'bg-stone-200 text-stone-700'
                        }`}>
                          {studentPlan?.name || 'Plan Estándar'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {s.photo_url ? (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 block mb-1">
                          📷 Con Foto
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 block mb-1">
                          Sin Foto
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT DISPLAY: OFFICIAL DOCUMENT PREVIEW */}
          <div className="lg:col-span-8 space-y-4">
            {selectedStudent ? (
              <div className="space-y-4">
                {/* Admin Quick Options Header */}
                <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-stone-800 print:hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-red-900">
                      Gestión de Ficha: {selectedStudent.full_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Upload photo helper if missing */}
                    <label className="bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm transition-all">
                      <Camera className="w-3.5 h-3.5 text-amber-600" />
                      <span>{selectedStudent.photo_url ? 'Cambiar Foto 3x4' : 'Adjuntar Foto 3x4'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </label>

                    {/* WhatsApp Quick Link */}
                    <button
                      onClick={() => {
                        const rawPhone = selectedStudent.guardian_phone || selectedStudent.guardian_cellphone || selectedStudent.mother_cellphone || '';
                        const digits = rawPhone.replace(/\D/g, '');
                        let target = '';
                        if (digits.length === 10 && digits.startsWith('3')) {
                          target = `57${digits}`;
                        } else if (digits.length > 0) {
                          target = digits;
                        }
                        const text = encodeURIComponent(
                          `¡Hola ${selectedStudent.guardian_name}! Le enviamos la Ficha Oficial de Inscripción del deportista ${selectedStudent.full_name} confirmada en el Club Deportivo Fire Wheels.`
                        );
                        if (target) {
                          window.open(`https://wa.me/${target}?text=${text}`, '_blank');
                        } else {
                          window.open(`https://wa.me/?text=${text}`, '_blank');
                        }
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Enviar a Acudiente</span>
                    </button>
                  </div>
                </div>

                {/* ATTACHED DOCUMENTS SECTION (IF ANY) */}
                {selectedStudent.attached_documents && selectedStudent.attached_documents.length > 0 && (
                  <div className="bg-white border-2 border-stone-200 rounded-2xl p-4 space-y-3 shadow-sm print:hidden">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        <FolderUp className="w-5 h-5 text-red-700" />
                        <h4 className="font-extrabold text-sm text-stone-900">
                          Documentos y Anexos Cargados por el Acudiente ({selectedStudent.attached_documents.length})
                        </h4>
                      </div>
                      <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">
                        Adjuntos Online
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {selectedStudent.attached_documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="bg-stone-50 border border-stone-200 rounded-xl p-2.5 flex items-center justify-between gap-2 hover:border-amber-400 transition-colors"
                        >
                          <div
                            onClick={() => setPreviewDoc(doc)}
                            className="flex items-center gap-2 min-w-0 cursor-pointer flex-1"
                          >
                            {isPdf(doc) ? (
                              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-black text-[10px] shrink-0 border border-red-200">
                                PDF
                              </div>
                            ) : (
                              <img
                                src={doc.file_url}
                                alt={doc.name}
                                className="w-8 h-8 rounded-lg object-cover border border-stone-200 shrink-0 bg-stone-100"
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-stone-900 truncate">
                                {doc.label || doc.name}
                              </p>
                              <p className="text-[10px] text-stone-500 truncate">
                                {doc.file_name} {formatFileSize(doc.file_size) && `• ${formatFileSize(doc.file_size)}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(doc)}
                              className="p-1 text-stone-600 hover:text-stone-950 hover:bg-stone-200 rounded-lg"
                              title="Ver documento"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={doc.file_url}
                              download={doc.file_name}
                              className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 rounded-lg"
                              title="Descargar documento"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* THE DOCUMENT COMPONENT */}
                <OfficialRegistrationDocument
                  student={selectedStudent}
                  plan={selectedPlan}
                  clubInfo={clubInfo}
                />
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl border border-stone-200 text-center text-stone-500 font-medium">
                Seleccione un alumno de la lista para ver e imprimir su ficha.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-red-950 to-stone-900 text-white p-4 flex items-center justify-between border-b-2 border-amber-500">
              <div className="flex items-center gap-2 min-w-0">
                <FileCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-sm font-black truncate">{previewDoc.label}</h4>
                  <p className="text-[11px] text-stone-300 truncate">{previewDoc.file_name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto bg-stone-100 flex items-center justify-center">
              {isPdf(previewDoc) ? (
                <iframe
                  src={previewDoc.file_url}
                  title={previewDoc.file_name}
                  className="w-full h-[65vh] rounded-xl border border-stone-300 bg-white"
                />
              ) : (
                <img
                  src={previewDoc.file_url}
                  alt={previewDoc.file_name}
                  className="max-h-[65vh] max-w-full rounded-xl object-contain shadow-sm border border-stone-200"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>

            <div className="p-3 bg-white border-t border-stone-200 flex justify-between items-center text-xs font-semibold text-stone-600">
              <span>Tamaño: {formatFileSize(previewDoc.file_size)}</span>
              <a
                href={previewDoc.file_url}
                download={previewDoc.file_name}
                className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold py-1.5 px-3 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Archivo</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
