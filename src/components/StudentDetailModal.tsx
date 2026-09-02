import React, { useState } from 'react';
import { Student, Plan, ClubInfo, AttachedDocument } from '../types';
import { INITIAL_CLUB_INFO } from '../data/initialData';
import { X, User, Phone, MapPin, HeartPulse, Users, ShieldCheck, Printer, Edit2, Trash2, FolderUp, FileText, Download, Eye, FileCheck } from 'lucide-react';
import { Logo } from './Logo';

interface StudentDetailModalProps {
  student: Student | null;
  plans: Plan[];
  clubInfo?: ClubInfo;
  onClose: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onToggleStatus: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  plans,
  clubInfo = INITIAL_CLUB_INFO,
  onClose,
  onEditStudent,
  onDeleteStudent,
  onToggleStatus,
}) => {
  if (!student) return null;

  const [previewDoc, setPreviewDoc] = useState<AttachedDocument | null>(null);

  const studentPlan = plans.find((p) => p.id === student.plan_id);

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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border-2 border-stone-300 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-stone-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0 border-b-4 border-amber-500/80">
          <div className="flex items-center gap-3">
            <Logo size="md" logoUrl={clubInfo?.logo_url || INITIAL_CLUB_INFO.logo_url} />
            <div>
              <h2 className="text-xl sm:text-2xl font-black">{student.full_name}</h2>
              <p className="text-amber-300 text-xs font-bold uppercase tracking-wider">
                Ficha de Inscripción Completa — Club Fire Wheels
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-stone-800">
          {/* Header info bar */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                student.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-stone-200 text-stone-700'
              }`}>
                Estado: {student.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
              </span>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold">
                Plan: {studentPlan?.name || '1 vez a la semana'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleStatus(student)}
                className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors"
              >
                {student.status === 'active' ? 'Marcar Inactivo' : 'Marcar Activo'}
              </button>
              <button
                onClick={() => window.print()}
                className="bg-yellow-400 hover:bg-yellow-300 text-red-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir
              </button>
            </div>
          </div>

          {/* 1. DATOS DEPORTISTA */}
          <div className="space-y-3">
            <h3 className="font-black text-red-900 text-lg flex items-center gap-2 border-b border-stone-200 pb-1">
              <User className="w-5 h-5 text-red-700" /> Datos del Deportista
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {student.photo_url && (
                <div className="w-24 h-32 rounded-xl overflow-hidden border-2 border-stone-300 shadow shrink-0">
                  <img src={student.photo_url} alt={student.full_name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm flex-1">
                <div>
                  <span className="text-stone-500 font-medium block text-xs">Documento de Identidad:</span>
                  <span className="font-bold text-stone-900">{student.document_number}</span>
                </div>
                <div>
                  <span className="text-stone-500 font-medium block text-xs">Fecha de Nacimiento:</span>
                  <span className="font-bold text-stone-900">{student.birth_date}</span>
                </div>
                <div>
                  <span className="text-stone-500 font-medium block text-xs">Entidad Médica (EPS):</span>
                  <span className="font-bold text-emerald-800">{student.medical_entity || 'No especificada'}</span>
                </div>
                <div>
                  <span className="text-stone-500 font-medium block text-xs">Dirección:</span>
                  <span className="font-bold text-stone-900">{student.address || 'No registrada'}</span>
                </div>
                <div>
                  <span className="text-stone-500 font-medium block text-xs">Barrio:</span>
                  <span className="font-bold text-stone-900">{student.neighborhood || 'No registrado'}</span>
                </div>
                <div>
                  <span className="text-stone-500 font-medium block text-xs">Teléfono Fijo:</span>
                  <span className="font-bold text-stone-900">{student.phone || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. ACUDIENTE Y CONTACTOS FAMILIARES */}
          <div className="space-y-3">
            <h3 className="font-black text-red-900 text-lg flex items-center gap-2 border-b border-stone-200 pb-1">
              <Users className="w-5 h-5 text-red-700" /> Datos de Contacto de Padres y Acudiente
            </h3>

            {/* Acudiente Responsable */}
            <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-300">
              <span className="text-xs font-bold text-red-950 uppercase block mb-1">
                ⭐ ACUDIENTE RESPONSABLE PRINCIPAL
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-stone-500 text-xs block">Nombre Acudiente:</span>
                  <span className="font-bold text-red-900">{student.guardian_name}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-xs block">Cédula de Ciudadanía:</span>
                  <span className="font-bold text-stone-900">{student.guardian_id_number || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-xs block">Celular WhatsApp:</span>
                  <a
                    href={`https://wa.me/57${student.guardian_phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-emerald-700 underline flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {student.guardian_phone}
                  </a>
                </div>
                <div>
                  <span className="text-stone-500 text-xs block">Empresa Laboral:</span>
                  <span className="font-semibold text-stone-800">{student.guardian_company || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-xs block">Teléfono Empresa:</span>
                  <span className="font-semibold text-stone-800">{student.guardian_landline || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Madre */}
            {student.mother_name && (
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs space-y-1">
                <span className="font-bold text-stone-700 block">Madre: {student.mother_name}</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-stone-600">
                  <span>Cel: {student.mother_cellphone || 'N/A'}</span>
                  <span>Empresa: {student.mother_company || 'N/A'}</span>
                  <span>Tel. Empresa: {student.mother_company_phone || 'N/A'}</span>
                </div>
              </div>
            )}

            {/* Padre */}
            {student.father_name && (
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs space-y-1">
                <span className="font-bold text-stone-700 block">Padre: {student.father_name}</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-stone-600">
                  <span>Cel: {student.father_cellphone || 'N/A'}</span>
                  <span>Empresa: {student.father_company || 'N/A'}</span>
                  <span>Tel. Empresa: {student.father_company_phone || 'N/A'}</span>
                </div>
              </div>
            )}
          </div>

          {/* 3. ACEPTACIÓN Y FIRMA DIGITAL */}
          <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <h3 className="font-black text-red-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Declaración de Aceptación y Firma
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              El acudiente ha aceptado formalmente el reglamento del club, uso obligatorio de protecciones, pago en los primeros 5 días hábiles y normativas médicas.
            </p>

            {student.guardian_signature && (
              <div className="mt-2 pt-2 border-t border-stone-300">
                <span className="text-xs font-bold text-stone-700 block mb-1">Registro de Firma:</span>
                {student.guardian_signature.startsWith('typed:') ? (
                  <div className="font-serif italic text-lg font-bold text-red-900">
                    {student.guardian_signature.replace('typed:', '')}
                  </div>
                ) : (
                  <img
                    src={student.guardian_signature}
                    alt="Firma del Acudiente"
                    className="max-h-16 border border-stone-300 rounded bg-white p-1"
                  />
                )}
              </div>
            )}
          </div>

          {/* 4. DOCUMENTOS Y ANEXOS CARGADOS */}
          <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-red-900 text-base flex items-center gap-2">
                <FolderUp className="w-5 h-5 text-red-700" /> Documentos y Anexos Adjuntos
              </h3>
              <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                {student.attached_documents?.length || 0} archivo(s)
              </span>
            </div>

            {student.attached_documents && student.attached_documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {student.attached_documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-xl p-3 border border-stone-200 shadow-sm flex items-center justify-between gap-2 hover:border-amber-400 transition-colors"
                  >
                    <div
                      onClick={() => setPreviewDoc(doc)}
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                    >
                      {isPdf(doc) ? (
                        <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-black text-xs shrink-0 border border-red-200">
                          PDF
                        </div>
                      ) : (
                        <img
                          src={doc.file_url}
                          alt={doc.name}
                          className="w-9 h-9 rounded-lg object-cover border border-stone-200 shrink-0 bg-stone-100"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold text-stone-900 truncate">
                          {doc.label || doc.name}
                        </p>
                        <p className="text-[11px] text-stone-500 truncate">
                          {doc.file_name} {formatFileSize(doc.file_size) && `• ${formatFileSize(doc.file_size)}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition-colors"
                        title="Ver vista previa"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={doc.file_url}
                        download={doc.file_name}
                        className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Descargar archivo"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic py-2">
                No se adjuntaron archivos adicionales en este registro de inscripción.
              </p>
            )}
          </div>
        </div>

        {/* Document Preview Modal */}
        {previewDoc && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
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

        {/* Modal Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-between items-center shrink-0">
          <button
            onClick={() => {
              if (confirm(`¿Está segura de eliminar al alumno ${student.full_name}?`)) {
                onDeleteStudent(student.id);
                onClose();
              }
            }}
            className="text-rose-700 hover:text-rose-900 text-xs font-bold flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" /> Eliminar Registro
          </button>

          <button
            onClick={onClose}
            className="bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm hover:bg-red-800 transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
