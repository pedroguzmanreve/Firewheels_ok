import React, { useState } from 'react';
import { Student, Plan, ClubInfo } from '../types';
import { Printer, Check, UserCheck, ShieldCheck, Download, Calendar, Phone, MapPin, Building, HeartPulse, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { CLUB_REGULATIONS, DIRECTRESS_INFO } from '../data/regulations';
import { Logo } from './Logo';

interface OfficialRegistrationDocumentProps {
  student: Student;
  plan?: Plan;
  clubInfo: ClubInfo;
  onPrint?: () => void;
}

export const OfficialRegistrationDocument: React.FC<OfficialRegistrationDocumentProps> = ({
  student,
  plan,
  clubInfo,
  onPrint,
}) => {
  const [showAnnexInPreview, setShowAnnexInPreview] = useState(true);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const formattedCreatedDate = student.created_at
    ? new Date(student.created_at).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('es-CO');

  return (
    <div className="space-y-4">
      {/* Top Action Bar (hidden in print) */}
      <div className="print:hidden bg-red-700 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md border-b-4 border-yellow-400">
        <div className="flex items-center gap-2.5">
          <Logo size="sm" logoUrl={clubInfo.logo_url} />
          <div>
            <p className="font-black text-base uppercase tracking-tight">Ficha Oficial de Inscripción</p>
            <p className="text-yellow-300 text-xs font-bold">Deportista: {student.full_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAnnexInPreview(!showAnnexInPreview)}
            className="bg-red-800 hover:bg-red-900 text-yellow-300 font-bold py-2 px-3 rounded-xl border border-red-500 text-xs flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-4 h-4 text-yellow-400" />
            <span>{showAnnexInPreview ? 'Ocultar Anexo 28 Puntos' : 'Ver Anexo 28 Puntos'}</span>
            {showAnnexInPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handlePrint}
            className="bg-yellow-400 hover:bg-yellow-300 text-red-950 font-black py-2.5 px-5 rounded-xl shadow transition-all flex items-center gap-2 text-sm active:scale-95"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Imprimir / Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT SHEET PRINT CONTAINER */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* PAGE 1: FICHA DE INSCRIPCIÓN DE 1 HOJA */}
        <div
          id="printable-document"
          className="bg-white text-stone-900 p-5 sm:p-7 border-2 border-stone-300 rounded-3xl shadow-xl print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none space-y-3 text-xs font-sans"
        >
          {/* PRINT CSS */}
          <style>{`
            @media print {
              @page {
                size: A4 portrait;
                margin: 4mm 6mm 4mm 6mm;
              }
              html, body {
                background: white !important;
                color: black !important;
              }
              .print\\:hidden {
                display: none !important;
              }
              .page-break {
                page-break-before: always !important;
                break-before: page !important;
              }
              #printable-document {
                width: 100% !important;
                max-width: 100% !important;
                border: none !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
                font-size: 8.5pt !important;
                line-height: 1.15 !important;
              }
              .print-avoid-break {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
            }
          `}</style>

          {/* HEADER SECTION WITH LOGO, TITLE, AND PHOTO FRAME */}
          <div className="border-b-2 border-red-700 pb-2.5 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Logo size="lg" logoUrl={clubInfo.logo_url} />
              <div>
                <h1 className="text-lg sm:text-xl font-black text-red-700 tracking-tight uppercase print:text-black print:text-base leading-tight">
                  {clubInfo.name}
                </h1>
                <p className="text-red-700 font-bold text-[11px] uppercase tracking-wide print:text-black leading-tight">
                  {clubInfo.subtitle}
                </p>
                <div className="mt-1 bg-yellow-400 text-red-950 inline-block px-2.5 py-0.5 rounded font-black text-[10px] uppercase print:border print:border-black print:bg-stone-100">
                  FICHA OFICIAL DE INSCRIPCIÓN Y MATRÍCULA
                </div>
                <p className="text-stone-500 text-[9px] mt-0.5 font-semibold">
                  Fecha de Registrado: {formattedCreatedDate}
                </p>
              </div>
            </div>

            {/* ATHLETE PHOTO BOX */}
            <div className="w-20 h-24 sm:w-24 sm:h-28 border-2 border-dashed border-red-700 rounded-lg overflow-hidden bg-stone-50 flex flex-col items-center justify-center text-center p-0.5 shrink-0 relative print:border-solid print:border-black print:w-20 print:h-24">
              {student.photo_url ? (
                <img
                  src={student.photo_url}
                  alt={student.full_name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="text-stone-400 space-y-0.5">
                  <div className="w-7 h-7 rounded-full bg-stone-200 mx-auto flex items-center justify-center text-stone-500 text-xs font-bold">
                    📷
                  </div>
                  <span className="text-[8px] font-bold block text-stone-500 leading-tight">
                    FOTO 3X4
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 1: DATOS DEL DEPORTISTA */}
          <div className="space-y-1">
            <div className="bg-red-700 text-white px-2.5 py-1 rounded font-black text-[11px] uppercase tracking-wider flex items-center justify-between print:bg-stone-800 print:text-white print:py-0.5">
              <span>1. DATOS DEL DEPORTISTA</span>
              <span className="text-yellow-300 text-[9px]">COD: {student.id.slice(0, 8)}</span>
            </div>

            <div className="grid grid-cols-12 gap-1.5 text-stone-800 font-medium bg-stone-50/80 p-2 rounded-lg border border-stone-200 print:bg-white print:border-stone-400 text-[10px]">
              <div className="col-span-8">
                <span className="text-[9px] font-bold text-stone-500 uppercase block leading-none">Nombres y Apellidos:</span>
                <span className="font-extrabold text-stone-900 text-xs uppercase">{student.full_name}</span>
              </div>
              <div className="col-span-4">
                <span className="text-[9px] font-bold text-stone-500 uppercase block leading-none">Documento Identidad:</span>
                <span className="font-extrabold text-stone-900 text-xs">{student.document_number || 'N/A'}</span>
              </div>

              <div className="col-span-4">
                <span className="text-[9px] font-bold text-stone-500 uppercase block leading-none">Fecha Nacimiento:</span>
                <span className="font-bold">{student.birth_date || 'N/A'}</span>
              </div>
              <div className="col-span-4">
                <span className="text-[9px] font-bold text-stone-500 uppercase block leading-none">Barrio / Sector:</span>
                <span className="font-bold">{student.neighborhood || 'N/A'}</span>
              </div>
              <div className="col-span-4">
                <span className="text-[9px] font-bold text-stone-500 uppercase block leading-none">EPS / Seguro:</span>
                <span className="font-bold text-emerald-800 uppercase">{student.medical_entity || 'N/A'}</span>
              </div>

              <div className="col-span-8">
                <span className="text-[9px] font-bold text-stone-500 uppercase block leading-none">Dirección Residencia:</span>
                <span className="font-bold">{student.address || 'N/A'}</span>
              </div>
              <div className="col-span-4">
                <span className="text-[9px] font-bold text-stone-500 uppercase block leading-none">Teléfono Casa:</span>
                <span className="font-bold">{student.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: PLAN SELECCIONADO */}
          <div className="space-y-1">
            <div className="bg-red-700 text-white px-2.5 py-1 rounded font-black text-[11px] uppercase tracking-wider print:bg-stone-800 print:py-0.5">
              2. PLAN DE ENTRENAMIENTO SELECCIONADO
            </div>

            <div className="grid grid-cols-12 gap-1.5 text-stone-800 font-medium bg-amber-50/50 p-2 rounded-lg border border-yellow-400 print:bg-white print:border-stone-400 text-[10px]">
              <div className="col-span-5">
                <span className="text-[9px] font-bold text-stone-500 uppercase block leading-none">Programa / Plan:</span>
                <span className="font-extrabold text-red-800 text-xs uppercase">
                  {plan?.name || 'Plan de Patinaje Formativo'}
                </span>
              </div>
              <div className="col-span-3">
                <span className="text-[9px] font-bold text-stone-500 uppercase block leading-none">Intensidad:</span>
                <span className="font-bold">
                  {plan?.weekly_classes || 2} {plan?.weekly_classes === 1 ? 'clase/semana' : 'clases/semana'}
                </span>
              </div>
              <div className="col-span-4">
                <span className="text-[9px] font-bold text-stone-500 uppercase block leading-none">Valor Mensualidad:</span>
                <span className="font-black text-emerald-800 text-xs">
                  ${plan?.price?.toLocaleString('es-CO') || '0'} COP
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: DATOS FAMILIARES Y ACUDIENTE */}
          <div className="space-y-1">
            <div className="bg-red-700 text-white px-2.5 py-1 rounded font-black text-[11px] uppercase tracking-wider print:bg-stone-800 print:py-0.5">
              3. DATOS FAMILIARES Y ACUDIENTE RESPONSABLE
            </div>

            <div className="space-y-1 text-[10px]">
              {/* MADRE Y PADRE EN 1 FILA COMPACTA */}
              <div className="grid grid-cols-12 gap-1.5 bg-stone-50 p-2 rounded-lg border border-stone-200 print:bg-white">
                <div className="col-span-6 border-r pr-1.5 border-stone-200">
                  <span className="text-[9px] font-black text-red-800 uppercase block border-b pb-0.5 mb-0.5">MADRE</span>
                  <span className="font-extrabold block text-stone-900 truncate">{student.mother_name || 'N/A'}</span>
                  <span className="text-[9px] text-stone-600 block">Cel: {student.mother_cellphone || 'N/A'}</span>
                </div>
                <div className="col-span-6">
                  <span className="text-[9px] font-black text-red-800 uppercase block border-b pb-0.5 mb-0.5">PADRE</span>
                  <span className="font-extrabold block text-stone-900 truncate">{student.father_name || 'N/A'}</span>
                  <span className="text-[9px] text-stone-600 block">Cel: {student.father_cellphone || 'N/A'}</span>
                </div>
              </div>

              {/* ACUDIENTE PRINCIPAL */}
              <div className="grid grid-cols-12 gap-1.5 bg-yellow-50/80 p-2 rounded-lg border border-yellow-400 print:bg-white print:border-black">
                <div className="col-span-12 text-[9px] font-black text-red-800 border-b border-yellow-300 pb-0.5 uppercase">
                  ACUDIENTE LEGAL O RESPONSABLE PRINCIPAL
                </div>
                <div className="col-span-5">
                  <span className="text-[9px] text-stone-600 block font-bold leading-none">Nombre Acudiente:</span>
                  <span className="font-extrabold text-stone-900">{student.guardian_name || 'N/A'}</span>
                </div>
                <div className="col-span-3">
                  <span className="text-[9px] text-stone-600 block font-bold leading-none">Cédula:</span>
                  <span className="font-black text-stone-900">{student.guardian_id_number || 'N/A'}</span>
                </div>
                <div className="col-span-4">
                  <span className="text-[9px] text-stone-600 block font-bold leading-none">Celular Contacto:</span>
                  <span className="font-black text-red-800">{student.guardian_phone || student.guardian_cellphone || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: REGLAMENTO Y NORMAS DEL CLUB */}
          <div className="space-y-1">
            <div className="bg-red-700 text-white px-2.5 py-1 rounded font-black text-[11px] uppercase tracking-wider print:bg-stone-800 print:py-0.5">
              4. TÉRMINOS Y REGLAMENTO INTERNO
            </div>

            <div className="bg-stone-50 p-2 rounded-lg border border-stone-300 text-[9px] leading-tight space-y-0.5 text-stone-700 print:bg-white print:border-stone-400">
              <p className="font-bold text-stone-900">
                El acudiente declara conocer y aceptar el reglamento interno de 28 puntos del Club Deportivo Fire Wheels:
              </p>
              <ul className="list-disc pl-3 space-y-0.5 text-stone-800">
                <li>Fotocopia de documento de identidad y seguro de salud EPS vigente.</li>
                <li>
                  <strong>Protecciones completas obligatorias:</strong> casco, muñequeras, coderas y rodilleras en cada clase.
                </li>
                <li>Puntualidad, ropa deportiva limpia y termo de hidratación personal (no gaseosas).</li>
                <li>
                  <strong>Pago de la mensualidad dentro de los primeros 5 días hábiles del mes.</strong>
                </li>
                <li>Sanción pedagógica de $1.000 COP por olvido de implementos (grupos avanzados).</li>
              </ul>
            </div>
          </div>

          {/* SECTION 5: FIRMA Y REGISTRO DE ACEPTACIÓN */}
          <div className="pt-1.5 border-t-2 border-stone-300">
            <div className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-7 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-[10px] bg-emerald-50 p-1.5 rounded-lg border border-emerald-300 print:bg-white print:border-stone-400">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Constancia Digital: Términos y reglamento de 28 puntos aceptados.</span>
                </div>
                <p className="text-[8.5px] text-stone-500 leading-tight">
                  Ficha oficial diligenciada a través de la plataforma web del Club Deportivo Fire Wheels.
                </p>
              </div>

              <div className="col-span-5 text-center space-y-0.5">
                <div className="h-12 border-b-2 border-stone-800 flex items-center justify-center p-0.5 bg-stone-50 rounded-t-md print:bg-white">
                  {student.guardian_signature && student.guardian_signature.startsWith('data:image') ? (
                    <img
                      src={student.guardian_signature}
                      alt="Firma del Acudiente"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="font-serif italic text-xs font-bold text-stone-800">
                      {student.guardian_name || 'Firma Digital Registrada'}
                    </span>
                  )}
                </div>
                <p className="font-black text-stone-900 text-[10px] uppercase leading-none">
                  FIRMA ACUDIENTE RESPONSABLE
                </p>
                <p className="text-[9px] font-bold text-stone-600 leading-none">
                  C.C. {student.guardian_id_number || '___________________________'}
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER BADGE */}
          <div className="text-center pt-1 border-t border-stone-200 text-[8px] text-stone-400 uppercase font-semibold flex items-center justify-between leading-none">
            <span>Club Deportivo Fire Wheels — Escuela Formativa de Patinaje</span>
            <span>DOCUMENTO OFICIAL DE CONTROL INTERNO (HOJA 1 DE 2)</span>
          </div>
        </div>

        {/* PAGE 2 / ANNEX: ANEXO DE REGLAMENTO INTERNO COMPLETO (28 PUNTOS) */}
        {(showAnnexInPreview || true) && (
          <div
            className={`bg-white text-stone-900 p-6 sm:p-8 border-2 border-stone-300 rounded-3xl shadow-xl print:shadow-none print:border-none print:p-0 print:m-0 print:rounded-none space-y-4 text-xs font-sans ${
              showAnnexInPreview ? 'block' : 'hidden print:block'
            } page-break`}
          >
            {/* ANNEX HEADER */}
            <div className="border-b-2 border-red-700 pb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-red-700 uppercase tracking-tight leading-tight">
                  ANEXO: INFORMACIÓN Y REGLAMENTACIÓN INTERNA (28 PUNTOS)
                </h2>
                <p className="text-stone-600 font-extrabold text-[11px] uppercase">
                  CLUB DEPORTIVO FIRE WHEELS — ESCUELA FORMATIVA DE PATINAJE Y MODALIDAD CARRERAS
                </p>
                <p className="text-stone-400 text-[10px]">COLSEGUROS ANDES CRA 31 CALLE 12</p>
              </div>
              <div className="bg-yellow-400 text-red-950 px-3 py-1 rounded-lg font-black text-xs uppercase shrink-0">
                28 REGLAS OFICIALES
              </div>
            </div>

            {/* ALL 28 RULES */}
            <div className="space-y-2 text-[10px] sm:text-xs leading-relaxed text-stone-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {CLUB_REGULATIONS.map((item, idx) => (
                  <div key={idx} className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 print:bg-white print:border-stone-300">
                    <p className="font-medium text-stone-900 leading-normal">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* DIRECTRESS SIGNATURE AND CONTACT INFO */}
            <div className="pt-4 border-t-2 border-red-700 mt-4 bg-red-50 p-4 rounded-2xl border border-red-200 print:bg-white print:border-stone-400 text-[10px] sm:text-xs">
              <p className="font-black text-red-900 uppercase text-xs sm:text-sm">{DIRECTRESS_INFO.name}</p>
              <p className="font-bold text-red-800">{DIRECTRESS_INFO.title}</p>
              <p className="italic text-stone-600 font-medium">"{DIRECTRESS_INFO.slogan}"</p>
              <div className="mt-2 text-stone-700 font-semibold flex flex-wrap gap-x-4 gap-y-1">
                <span>📱 Cel / WhatsApp: {DIRECTRESS_INFO.phones}</span>
                <span>📍 {DIRECTRESS_INFO.location}</span>
                <span>✉️ {DIRECTRESS_INFO.emails}</span>
              </div>
            </div>

            {/* ANNEX FOOTER */}
            <div className="text-center pt-2 border-t border-stone-200 text-[8px] text-stone-400 uppercase font-semibold flex items-center justify-between leading-none">
              <span>Club Deportivo Fire Wheels — Reglamento Interno Aceptado</span>
              <span>ANEXO OFICIAL (HOJA 2 DE 2)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

