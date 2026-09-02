import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plan, Student, ClubInfo, AttachedDocument } from '../types';
import { StorageService } from '../services/storageService';
import { SignatureCanvas } from './SignatureCanvas';
import { DocumentUploader } from './DocumentUploader';
import { CheckCircle2, AlertCircle, ShieldCheck, HeartPulse, User, Users, Calendar, DollarSign, Send, Printer, Camera, Upload, Trash2, Image as ImageIcon, FileText, ChevronDown, ChevronUp, FolderUp, Save, RefreshCw, Sparkles } from 'lucide-react';
import { CLUB_REGULATIONS, DIRECTRESS_INFO } from '../data/regulations';
import { INITIAL_PLANS } from '../data/initialData';
import { Logo } from './Logo';

const DRAFT_STORAGE_KEY = 'firewheels_registration_draft_v2';

const loadSavedDraft = () => {
  try {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed;
    }
  } catch (e) {
    console.warn('Error reading saved registration draft:', e);
  }
  return null;
};

interface PublicRegistrationProps {
  plans: Plan[];
  clubInfo: ClubInfo;
  onSuccessSubmit?: (newStudent: Student) => void;
}

export const PublicRegistration: React.FC<PublicRegistrationProps> = ({ plans, clubInfo, onSuccessSubmit }) => {
  const activePlans = plans && plans.length > 0 ? plans : INITIAL_PLANS;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Check for saved draft on initial render
  const initialDraft = useRef(loadSavedDraft()).current;

  const [showFullRegulations, setShowFullRegulations] = useState(false);
  const [attachedDocs, setAttachedDocs] = useState<AttachedDocument[]>(
    initialDraft?.attachedDocs || []
  );

  const [formData, setFormData] = useState({
    photo_url: initialDraft?.formData?.photo_url || '',
    full_name: initialDraft?.formData?.full_name || '',
    birth_date: initialDraft?.formData?.birth_date || '',
    document_number: initialDraft?.formData?.document_number || '',
    phone: initialDraft?.formData?.phone || '',
    address: initialDraft?.formData?.address || '',
    neighborhood: initialDraft?.formData?.neighborhood || '',
    medical_entity: initialDraft?.formData?.medical_entity || '',
    plan_id: initialDraft?.formData?.plan_id || activePlans[0]?.id || '',

    // Madre
    mother_name: initialDraft?.formData?.mother_name || '',
    mother_company: initialDraft?.formData?.mother_company || '',
    mother_company_phone: initialDraft?.formData?.mother_company_phone || '',
    mother_landline: initialDraft?.formData?.mother_landline || '',
    mother_cellphone: initialDraft?.formData?.mother_cellphone || '',

    // Padre
    father_name: initialDraft?.formData?.father_name || '',
    father_company: initialDraft?.formData?.father_company || '',
    father_company_phone: initialDraft?.formData?.father_company_phone || '',
    father_landline: initialDraft?.formData?.father_landline || '',
    father_cellphone: initialDraft?.formData?.father_cellphone || '',

    // Acudiente
    guardian_name: initialDraft?.formData?.guardian_name || '',
    guardian_company: initialDraft?.formData?.guardian_company || '',
    guardian_phone: initialDraft?.formData?.guardian_phone || '',
    guardian_landline: initialDraft?.formData?.guardian_landline || '',
    guardian_cellphone: initialDraft?.formData?.guardian_cellphone || '',

    // Términos
    accepts_terms: initialDraft?.formData?.accepts_terms || false,
    guardian_id_number: initialDraft?.formData?.guardian_id_number || '',
    guardian_signature: initialDraft?.formData?.guardian_signature || '',
  });

  const [restoredDraftTime, setRestoredDraftTime] = useState<string | null>(
    initialDraft?.savedAt || null
  );
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string | null>(null);

  const [submittedStudent, setSubmittedStudent] = useState<Student | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Background Auto-save to localStorage
  const saveDraftToStorage = useCallback(() => {
    // Only save if there's at least some user data entered
    const hasData =
      formData.full_name.trim() ||
      formData.document_number.trim() ||
      formData.phone.trim() ||
      formData.guardian_name.trim() ||
      formData.guardian_phone.trim() ||
      attachedDocs.length > 0 ||
      formData.guardian_signature;

    if (!hasData) return;

    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          formData,
          attachedDocs,
          savedAt: timeStr,
        })
      );
      setLastAutoSaveTime(timeStr);
    } catch (err) {
      console.warn('LocalStorage quota limit reached for full draft, attempting lightweight save:', err);
      try {
        // Lightweight save without heavy base64 strings if storage quota is full
        const lightweightDocs = attachedDocs.map((d) => ({
          ...d,
          file_url: d.file_url.startsWith('data:') && d.file_url.length > 500000 ? '' : d.file_url,
        }));
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            formData: {
              ...formData,
              photo_url: formData.photo_url.length > 500000 ? '' : formData.photo_url,
            },
            attachedDocs: lightweightDocs,
            savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          })
        );
      } catch (innerErr) {
        console.error('Failed to save lightweight draft:', innerErr);
      }
    }
  }, [formData, attachedDocs]);

  // Debounced auto-save on state change
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraftToStorage();
    }, 1000);
    return () => clearTimeout(timer);
  }, [saveDraftToStorage]);

  // Save draft immediately on page hide, visibility change, or background switch
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveDraftToStorage();
      }
    };

    const handlePageHide = () => {
      saveDraftToStorage();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
    };
  }, [saveDraftToStorage]);

  // Clear draft handler
  const handleClearDraft = () => {
    if (window.confirm('¿Desea borrar todos los datos ingresados y comenzar un formulario nuevo desde cero?')) {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {}
      setRestoredDraftTime(null);
      setLastAutoSaveTime(null);
      setAttachedDocs([]);
      setFormData({
        photo_url: '',
        full_name: '',
        birth_date: '',
        document_number: '',
        phone: '',
        address: '',
        neighborhood: '',
        medical_entity: '',
        plan_id: activePlans[0]?.id || '',
        mother_name: '',
        mother_company: '',
        mother_company_phone: '',
        mother_landline: '',
        mother_cellphone: '',
        father_name: '',
        father_company: '',
        father_company_phone: '',
        father_landline: '',
        father_cellphone: '',
        guardian_name: '',
        guardian_company: '',
        guardian_phone: '',
        guardian_landline: '',
        guardian_cellphone: '',
        accepts_terms: false,
        guardian_id_number: '',
        guardian_signature: '',
      });
    }
  };

  const selectedPlan = activePlans.find((p) => p.id === formData.plan_id) || activePlans[0];
  const totalPrice = (selectedPlan?.price || 0) + clubInfo.enrollment_fee;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen seleccionada supera los 5MB. Por favor seleccione una foto más liviana.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, photo_url: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic Validation
    if (!formData.full_name.trim()) {
      setErrorMsg('Por favor ingrese los Nombres y Apellidos del Deportista.');
      return;
    }
    if (!formData.document_number.trim()) {
      setErrorMsg('Por favor ingrese el número de Documento o Registro del deportista.');
      return;
    }
    if (!formData.birth_date) {
      setErrorMsg('Por favor seleccione la Fecha de Nacimiento del deportista.');
      return;
    }
    if (!formData.guardian_name.trim()) {
      setErrorMsg('Por favor ingrese el nombre del Padre o Acudiente responsable.');
      return;
    }
    if (!formData.guardian_phone.trim()) {
      setErrorMsg('Por favor ingrese un Celular de contacto del Acudiente.');
      return;
    }
    if (!formData.guardian_id_number.trim()) {
      setErrorMsg('Por favor ingrese la Cédula de Ciudadanía del Acudiente.');
      return;
    }
    if (!formData.accepts_terms) {
      setErrorMsg('Debe aceptar los términos y el reglamento de 28 puntos del Club para continuar.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create student object
      const newStudentData: Omit<Student, 'id' | 'created_at'> = {
        photo_url: formData.photo_url || undefined,
        full_name: formData.full_name,
        birth_date: formData.birth_date,
        document_number: formData.document_number,
        phone: formData.phone || formData.guardian_phone,
        address: formData.address,
        neighborhood: formData.neighborhood,
        medical_entity: formData.medical_entity,

        mother_name: formData.mother_name,
        mother_company: formData.mother_company,
        mother_company_phone: formData.mother_company_phone,
        mother_landline: formData.mother_landline,
        mother_cellphone: formData.mother_cellphone,

        father_name: formData.father_name,
        father_company: formData.father_company,
        father_company_phone: formData.father_company_phone,
        father_landline: formData.father_landline,
        father_cellphone: formData.father_cellphone,

        guardian_name: formData.guardian_name,
        guardian_company: formData.guardian_company,
        guardian_phone: formData.guardian_phone,
        guardian_landline: formData.guardian_landline,
        guardian_cellphone: formData.guardian_cellphone || formData.guardian_phone,

        accepts_terms: formData.accepts_terms,
        guardian_signature: formData.guardian_signature || `typed:${formData.guardian_name}`,
        guardian_id_number: formData.guardian_id_number,

        // Documentos y anexos cargados
        attached_documents: attachedDocs,

        status: 'active',
        plan_id: formData.plan_id || (activePlans[0]?.id ?? 'plan-1'),
        enrollment_fee_paid: false,
      };

      const createdStudent = await StorageService.submitPublicRegistration(newStudentData);
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {}
      setSubmittedStudent(createdStudent);
      if (onSuccessSubmit) {
        onSuccessSubmit(createdStudent);
      }
    } catch (err: any) {
      console.error('Error al guardar inscripción:', err);
      setErrorMsg('Hubo un inconveniente al enviar la inscripción a la base de datos. Por favor revise su conexión e intente de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedStudent) {
    return (
      <div className="max-w-3xl mx-auto my-8 px-4">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-4 border-emerald-500 shadow-xl text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-extrabold text-red-800">
            ¡Inscripción Exitosa!
          </h2>
          <p className="text-stone-800 text-lg mt-2 font-medium">
            El deportista <strong className="text-red-700">{submittedStudent.full_name}</strong> ha sido registrado correctamente en el <strong>Club Deportivo Fire Wheels</strong>.
          </p>

          {/* Resumen de cobro inicial */}
          <div className="mt-6 bg-stone-50 p-6 rounded-2xl border border-stone-200 text-left">
            <h3 className="text-red-800 font-extrabold text-lg mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-500" />
              Resumen de Matrícula y Primer Pago:
            </h3>
            <div className="space-y-2 text-stone-800 font-medium">
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span>Plan Seleccionado: {selectedPlan?.name}</span>
                <span className="font-bold">${selectedPlan?.price.toLocaleString('es-CO')} COP</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span>Derecho de Inscripción / Matrícula</span>
                <span className="font-bold">${clubInfo.enrollment_fee.toLocaleString('es-CO')} COP</span>
              </div>
              <div className="flex justify-between py-2 text-xl font-black text-red-900">
                <span>Total a Cancelar:</span>
                <span className="text-emerald-700">${totalPrice.toLocaleString('es-CO')} COP</span>
              </div>
            </div>

            <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded-xl p-3 text-xs text-yellow-950 font-medium">
              📌 <strong>Medios de Pago:</strong> Transferencia Nequi / Bancolombia al <span className="font-bold">{clubInfo.bank_details}</span> o en efectivo al iniciar la primera clase.
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                const text = encodeURIComponent(
                  `¡Hola! Acabo de completar la Ficha de Inscripción en Fire Wheels para mi hijo(a) ${submittedStudent.full_name}. Quedo atento a las indicaciones.`
                );
                window.open(`https://wa.me/573146919369?text=${text}`, '_blank');
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Enviar Confirmación por WhatsApp
            </button>
            <button
              onClick={() => window.print()}
              className="bg-stone-200 hover:bg-stone-300 text-stone-800 text-lg font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Imprimir Ficha
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-6 px-4 pb-12">
      {/* Header Form Card */}
      <div className="bg-red-700 text-white p-6 sm:p-8 rounded-t-3xl shadow-lg border-b-4 border-yellow-400">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3.5">
            <Logo size="lg" logoUrl={clubInfo.logo_url} />
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                FICHA DE INSCRIPCIÓN OFICIAL
              </h2>
              <p className="text-yellow-300 font-bold text-sm uppercase tracking-wider">
                {clubInfo.name} — {clubInfo.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-black/30 border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Auto-guardado activo {lastAutoSaveTime ? `(${lastAutoSaveTime})` : 'en segundo plano'}</span>
          </div>
        </div>
        <p className="text-red-100 text-sm mt-2 leading-relaxed">
          Por favor complete todos los datos requeridos para matricular al deportista en la escuela de patinaje. Los datos que digite se guardan en tiempo real en su dispositivo para no perder ningún avance.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-b-3xl shadow-xl border border-stone-200 space-y-8">
        {/* Banner de Borrador Recuperado Automáticamente */}
        {restoredDraftTime && (
          <div className="bg-emerald-50 border-2 border-emerald-400 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-950 shadow-sm">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-emerald-700 shrink-0" />
              <div>
                <p className="font-black text-sm text-emerald-900">
                  ¡Borrador recuperado automáticamente!
                </p>
                <p className="text-xs text-emerald-800 font-medium">
                  Restauramos los datos, documentos y anexos que estabas diligenciando para que no tengas que comenzar de nuevo tras salir de Chrome.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearDraft}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 bg-white hover:bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-300 transition-all shrink-0 shadow-sm"
            >
              Borrar y empezar de cero
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border-2 border-rose-400 text-rose-800 p-4 rounded-2xl flex items-center gap-3 text-base font-bold animate-pulse">
            <AlertCircle className="w-6 h-6 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. DATOS DEL DEPORTISTA */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-red-700">
            <User className="w-6 h-6 text-red-700" />
            <h3 className="text-xl font-black text-red-800">
              1. DATOS DEL DEPORTISTA
            </h3>
          </div>

          {/* PHOTO UPLOAD / CAMERA CAPTURE SECTION */}
          <div className="bg-stone-50 border-2 border-dashed border-stone-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
            {/* Hidden inputs */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handlePhotoSelect}
            />

            {/* Photo Preview Thumbnail */}
            <div className="w-28 h-36 border-2 border-stone-300 rounded-xl overflow-hidden bg-white shadow-inner flex items-center justify-center shrink-0 relative group">
              {formData.photo_url ? (
                <>
                  <img
                    src={formData.photo_url}
                    alt="Foto Deportista"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, photo_url: '' }))}
                    className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-lg shadow transition-all opacity-90 group-hover:opacity-100"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="text-center text-stone-400 p-2 space-y-1">
                  <ImageIcon className="w-8 h-8 mx-auto text-stone-300" />
                  <span className="text-[10px] font-bold block leading-tight text-stone-500">
                    Foto 3x4 (Opcional)
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <label className="block text-sm font-extrabold text-red-800">
                Fotografía del Deportista (Ficha de Inscripción)
              </label>
              <p className="text-xs text-stone-600 leading-relaxed">
                Puede tomar una foto directa desde el celular o adjuntar una imagen de su galería para la ficha oficial.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="bg-red-700 hover:bg-red-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 shadow transition-all"
                >
                  <Camera className="w-4 h-4 text-yellow-300" />
                  <span>Tomar Foto con Cámara</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 transition-all border border-stone-300"
                >
                  <Upload className="w-4 h-4 text-stone-700" />
                  <span>Subir Foto de Galería</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-stone-900 mb-1">
                Nombres y Apellidos Completos del Deportista *
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Ej. Valentina Gómez Ramos"
                required
                className="w-full bg-stone-50 border-2 border-stone-300 rounded-xl p-3.5 text-base font-semibold text-stone-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-900 mb-1">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                required
                className="w-full bg-stone-50 border-2 border-stone-300 rounded-xl p-3.5 text-base font-semibold text-stone-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-900 mb-1">
                Registro Civil / Tarjeta de Identidad (T.I) *
              </label>
              <input
                type="text"
                name="document_number"
                value={formData.document_number}
                onChange={handleChange}
                placeholder="Ej. TI 1098234567"
                required
                className="w-full bg-stone-50 border-2 border-stone-300 rounded-xl p-3.5 text-base font-semibold text-stone-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-900 mb-1">
                Dirección de Residencia
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Ej. Carrera 14 # 35-20"
                className="w-full bg-stone-50 border-2 border-stone-300 rounded-xl p-3.5 text-base font-semibold text-stone-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-900 mb-1">
                Barrio
              </label>
              <input
                type="text"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleChange}
                placeholder="Ej. San Francisco"
                className="w-full bg-stone-50 border-2 border-stone-300 rounded-xl p-3.5 text-base font-semibold text-stone-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-emerald-600" />
                Entidad Médica (EPS / Seguro de Salud) *
              </label>
              <input
                type="text"
                name="medical_entity"
                value={formData.medical_entity}
                onChange={handleChange}
                placeholder="Ej. Sura EPS / Sanitas / Salud Total"
                className="w-full bg-stone-50 border-2 border-stone-300 rounded-xl p-3.5 text-base font-semibold text-stone-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-900 mb-1">
                Teléfono Fijo / Residencia
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ej. 607 6891234"
                className="w-full bg-stone-50 border-2 border-stone-300 rounded-xl p-3.5 text-base font-semibold text-stone-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* 2. PLAN DE ENTRENAMIENTO */}
        <div className="space-y-4 bg-yellow-50/70 p-5 rounded-2xl border-2 border-yellow-400">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-yellow-400">
            <DollarSign className="w-6 h-6 text-red-700" />
            <h3 className="text-xl font-black text-red-800">
              2. SELECCIÓN DE PLAN DE ENTRENAMIENTO
            </h3>
          </div>

          <div>
            <label className="block text-base font-extrabold text-red-900 mb-2">
              Elija la intensidad horaria deseada: *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activePlans.map((p) => {
                const isSelected = formData.plan_id === p.id;
                return (
                  <label
                    key={p.id}
                    onClick={() => setFormData((prev) => ({ ...prev, plan_id: p.id }))}
                    className={`cursor-pointer p-4 rounded-2xl border-3 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-red-700 shadow-lg ring-2 ring-red-600'
                        : 'bg-stone-50 border-stone-300 hover:border-yellow-400'
                    }`}
                  >
                    <div>
                      <span className="font-extrabold text-stone-900 text-lg block">
                        {p.name}
                      </span>
                      <span className="text-stone-600 text-xs font-medium">
                        {p.weekly_classes} {p.weekly_classes === 1 ? 'clase por semana' : 'clases por semana'}
                      </span>
                    </div>
                    <div className="mt-3 text-emerald-700 font-black text-xl">
                      ${p.price.toLocaleString('es-CO')} <span className="text-xs font-normal text-stone-600">COP/mes</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-yellow-300 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="text-sm font-bold text-stone-800">Derecho de Inscripción Única:</span>
              <p className="text-xs text-stone-500">Incluye carné y registro en el club</p>
            </div>
            <span className="text-lg font-black text-red-800">
              + ${clubInfo.enrollment_fee.toLocaleString('es-CO')} COP
            </span>
          </div>
        </div>

        {/* 3. DATOS FAMILIARES */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-red-700">
            <Users className="w-6 h-6 text-red-700" />
            <h3 className="text-xl font-black text-red-800">
              3. DATOS FAMILIARES Y ACUDIENTE
            </h3>
          </div>

          {/* MADRE */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
            <h4 className="font-bold text-stone-800 text-base border-b pb-1">DATOS DE LA MADRE</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">Nombre Completo de la Madre</label>
                <input
                  type="text"
                  name="mother_name"
                  value={formData.mother_name}
                  onChange={handleChange}
                  placeholder="Ej. Carolina Ramos"
                  className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-sm font-semibold text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Celular de la Madre</label>
                <input
                  type="tel"
                  name="mother_cellphone"
                  value={formData.mother_cellphone}
                  onChange={handleChange}
                  placeholder="Ej. 3158901234"
                  className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-sm font-semibold text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Empresa donde labora</label>
                <input
                  type="text"
                  name="mother_company"
                  value={formData.mother_company}
                  onChange={handleChange}
                  placeholder="Ej. Almacenes Éxito"
                  className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-sm font-semibold text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Teléfono Empresa</label>
                <input
                  type="tel"
                  name="mother_company_phone"
                  value={formData.mother_company_phone}
                  onChange={handleChange}
                  placeholder="Ej. 607 6345678"
                  className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-sm font-semibold text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Teléfono Fijo Madre</label>
                <input
                  type="tel"
                  name="mother_landline"
                  value={formData.mother_landline}
                  onChange={handleChange}
                  placeholder="Ej. 607 6891234"
                  className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-sm font-semibold text-stone-900"
                />
              </div>
            </div>
          </div>

          {/* PADRE */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
            <h4 className="font-bold text-stone-800 text-base border-b pb-1">DATOS DEL PADRE</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">Nombre Completo del Padre</label>
                <input
                  type="text"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleChange}
                  placeholder="Ej. Carlos Gómez"
                  className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-sm font-semibold text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Celular del Padre</label>
                <input
                  type="tel"
                  name="father_cellphone"
                  value={formData.father_cellphone}
                  onChange={handleChange}
                  placeholder="Ej. 3104567890"
                  className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-sm font-semibold text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Empresa donde labora</label>
                <input
                  type="text"
                  name="father_company"
                  value={formData.father_company}
                  onChange={handleChange}
                  placeholder="Ej. Independiente"
                  className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-sm font-semibold text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Teléfono Empresa Padre</label>
                <input
                  type="tel"
                  name="father_company_phone"
                  value={formData.father_company_phone}
                  onChange={handleChange}
                  placeholder="Ej. 607 6223344"
                  className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-sm font-semibold text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Teléfono Fijo Padre</label>
                <input
                  type="tel"
                  name="father_landline"
                  value={formData.father_landline}
                  onChange={handleChange}
                  placeholder="Ej. 607 6891234"
                  className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-sm font-semibold text-stone-900"
                />
              </div>
            </div>
          </div>

          {/* ACUDIENTE PRINCIPAL */}
          <div className="bg-red-50/60 p-5 rounded-2xl border-2 border-red-200 space-y-3">
            <h4 className="font-extrabold text-red-900 text-base border-b border-red-200 pb-1">
              ACUDIENTE O PARIENTE RESPONSABLE *
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-900 mb-1">
                  Nombre Completo del Acudiente Principal *
                </label>
                <input
                  type="text"
                  name="guardian_name"
                  value={formData.guardian_name}
                  onChange={handleChange}
                  placeholder="Ej. Carolina Ramos"
                  required
                  className="w-full bg-white border-2 border-stone-300 rounded-xl p-3 text-sm font-semibold text-stone-900 focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-900 mb-1">
                  Cédula de Ciudadanía del Acudiente *
                </label>
                <input
                  type="text"
                  name="guardian_id_number"
                  value={formData.guardian_id_number}
                  onChange={handleChange}
                  placeholder="Ej. 63.542.890"
                  required
                  className="w-full bg-white border-2 border-stone-300 rounded-xl p-3 text-sm font-semibold text-stone-900 focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-900 mb-1">
                  Celular WhatsApp Principal *
                </label>
                <input
                  type="tel"
                  name="guardian_phone"
                  value={formData.guardian_phone}
                  onChange={handleChange}
                  placeholder="Ej. 3158901234"
                  required
                  className="w-full bg-white border-2 border-stone-300 rounded-xl p-3 text-sm font-semibold text-stone-900 focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-900 mb-1">
                  Empresa donde labora
                </label>
                <input
                  type="text"
                  name="guardian_company"
                  value={formData.guardian_company}
                  onChange={handleChange}
                  placeholder="Ej. Almacenes Éxito"
                  className="w-full bg-white border border-stone-300 rounded-xl p-3 text-sm font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Teléfono de Trabajo
                </label>
                <input
                  type="tel"
                  name="guardian_landline"
                  value={formData.guardian_landline}
                  onChange={handleChange}
                  placeholder="Ej. 607 6345678"
                  className="w-full bg-white border border-stone-300 rounded-xl p-3 text-sm font-semibold text-stone-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. CARGA DE DOCUMENTOS Y ANEXOS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-red-700">
            <div className="flex items-center gap-2">
              <FolderUp className="w-6 h-6 text-red-700" />
              <h3 className="text-xl font-black text-red-800">
                4. CARGA DE DOCUMENTOS Y ANEXOS
              </h3>
            </div>
            <span className="text-xs font-bold bg-amber-100 text-amber-950 px-3 py-1 rounded-full border border-amber-300">
              {attachedDocs.length} archivo(s) adjunto(s)
            </span>
          </div>

          <div className="bg-amber-50/70 border border-amber-300 p-4 rounded-2xl text-xs text-amber-950 space-y-1">
            <p className="font-extrabold text-amber-900 text-sm">
              📄 Adjunte la documentación requerida para formalizar la matrícula:
            </p>
            <p className="font-medium text-stone-700 leading-relaxed">
              Puede cargar archivos en formato <strong>PDF</strong> o <strong>fotografías legibles</strong> desde su celular o computador (documento de identidad del deportista, certificado médico/EPS y cédula del acudiente). También puede tomar fotos directamente con la cámara.
            </p>
          </div>

          <DocumentUploader
            documents={attachedDocs}
            onChange={setAttachedDocs}
          />
        </div>

        {/* 5. TÉRMINOS Y REGLAMENTO DEL CLUB */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-red-700">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-red-700" />
              <h3 className="text-xl font-black text-red-800">
                5. INFORMACIÓN Y REGLAMENTACIÓN INTERNA
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowFullRegulations(!showFullRegulations)}
              className="bg-yellow-400 hover:bg-yellow-300 text-red-950 font-extrabold text-xs py-1.5 px-3 rounded-xl border border-yellow-500 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>{showFullRegulations ? 'Ver Vista Resumida' : 'Leer los 28 Puntos Completos'}</span>
              {showFullRegulations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {!showFullRegulations ? (
            <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-5 text-stone-800 text-sm space-y-2.5 leading-relaxed font-medium">
              <div className="flex items-center justify-between border-b pb-2">
                <p className="font-extrabold text-red-800 text-base">
                  Resumen del Reglamento del Club Deportivo Fire Wheels (28 Puntos):
                </p>
                <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Anexo Oficial
                </span>
              </div>
              <ul className="list-disc pl-5 space-y-1.5 marker:text-yellow-500 text-xs sm:text-sm">
                <li><strong>Pago mensual:</strong> primeros 5 días hábiles del mes.</li>
                <li><strong>Protecciones obligatorias:</strong> casco, muñequeras, coderas y rodilleras.</li>
                <li>Puntualidad (máximo 10 minutos de retraso) e indumentaria deportiva adecuada.</li>
                <li>Seguridad social/EPS vigente y póliza deportiva.</li>
                <li>Sanción pedagógica de $1.000 COP por olvido o alquiler de protecciones.</li>
                <li>Conducto regular y respeto en entrenamientos y competencias.</li>
              </ul>
              <button
                type="button"
                onClick={() => setShowFullRegulations(true)}
                className="text-red-700 hover:text-red-900 font-extrabold text-xs underline mt-2 block"
              >
                Haga clic aquí para desplegar y leer cada uno de los 28 artículos del reglamento interno completos.
              </button>
            </div>
          ) : (
            <div className="bg-stone-50 border-2 border-red-300 rounded-2xl p-5 space-y-4 max-h-[500px] overflow-y-auto">
              <div className="bg-red-700 text-white p-3 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-black uppercase text-sm">INFORMACIÓN Y REGLAMENTACIÓN INTERNA COMPLETA</h4>
                  <p className="text-yellow-300 text-xs font-bold">28 Artículos Oficiales — Club Deportivo Fire Wheels</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFullRegulations(false)}
                  className="bg-white/20 hover:bg-white/30 text-white p-1 rounded-lg text-xs"
                >
                  Cerrar
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-stone-800">
                {CLUB_REGULATIONS.map((rule, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                    <p className="font-medium leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-100 p-3 rounded-xl border border-yellow-300 text-xs text-yellow-950">
                <p className="font-bold">{DIRECTRESS_INFO.name} — {DIRECTRESS_INFO.title}</p>
                <p className="italic text-stone-600">{DIRECTRESS_INFO.slogan}</p>
              </div>
            </div>
          )}

          {/* CHECKBOX DE ACEPTACIÓN */}
          <label className="flex items-start gap-3 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-2xl cursor-pointer hover:bg-yellow-100/50 transition-colors">
            <input
              type="checkbox"
              name="accepts_terms"
              checked={formData.accepts_terms}
              onChange={handleChange}
              className="mt-1 w-6 h-6 text-red-700 rounded border-stone-300 focus:ring-red-600 shrink-0"
            />
            <span className="text-sm sm:text-base font-extrabold text-stone-900 leading-snug">
              He leído, comprendo y estoy de acuerdo con todo lo anteriormente relacionado: SÍ, acepto la totalidad de los 28 puntos del Reglamento Interno del Club Deportivo Fire Wheels. *
            </span>
          </label>

          {/* FIRMA DIGITAL */}
          <SignatureCanvas
            guardianName={formData.guardian_name}
            initialSignature={formData.guardian_signature}
            onSaveSignature={(sigUrl) => setFormData((prev) => ({ ...prev, guardian_signature: sigUrl }))}
          />
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-red-950 via-red-900 to-stone-900 hover:from-red-900 hover:to-stone-900 text-white font-black text-xl py-5 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 border-2 border-amber-500/80 active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Guardando Inscripción en la Base de Datos...</span>
            ) : (
              <>
                <Send className="w-6 h-6 text-amber-300" />
                <span>ENVIAR FORMULARIO DE INSCRIPCIÓN</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

