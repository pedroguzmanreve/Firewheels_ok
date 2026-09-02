import React, { useState, useRef } from 'react';
import { AttachedDocument } from '../types';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Eye,
  Camera,
  Plus,
  FileCheck,
  AlertCircle,
  Download,
  X,
} from 'lucide-react';

interface DocumentUploaderProps {
  documents: AttachedDocument[];
  onChange: (docs: AttachedDocument[]) => void;
  disabled?: boolean;
}

interface DocSlot {
  type: AttachedDocument['type'];
  title: string;
  description: string;
  required?: boolean;
}

const DOCUMENT_SLOTS: DocSlot[] = [
  {
    type: 'identity_doc',
    title: '1. Documento del Deportista',
    description: 'Registro Civil o Tarjeta de Identidad (PDF o Foto legible)',
    required: true,
  },
  {
    type: 'medical_cert',
    title: '2. Certificado EPS o Salud',
    description: 'FOSYGA / ADRES o Certificación médica vigente',
    required: true,
  },
  {
    type: 'guardian_id',
    title: '3. Cédula del Acudiente',
    description: 'Cédula de ciudadanía del padre, madre o acudiente',
    required: true,
  },
  {
    type: 'payment_receipt',
    title: '4. Comprobante de Matrícula',
    description: 'Recibo o transferencia bancaria del pago inicial (Opcional)',
    required: false,
  },
];

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  documents,
  onChange,
  disabled = false,
}) => {
  const [previewDoc, setPreviewDoc] = useState<AttachedDocument | null>(null);
  const [activeSlotType, setActiveSlotType] = useState<AttachedDocument['type'] | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const genericInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = (file: File, type: AttachedDocument['type'], customLabel?: string) => {
    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      alert(`El archivo "${file.name}" supera los 10MB permitidos. Por favor suba un archivo más liviano.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const slotInfo = DOCUMENT_SLOTS.find((s) => s.type === type);
        const newDoc: AttachedDocument = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          type,
          name: file.name,
          label: customLabel || slotInfo?.title || 'Documento Adjunto',
          file_url: reader.result,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
          uploaded_at: new Date().toISOString(),
        };

        // Replace existing of same type if it's a fixed slot, or append if other
        if (type !== 'other') {
          const filtered = documents.filter((d) => d.type !== type);
          onChange([...filtered, newDoc]);
        } else {
          onChange([...documents, newDoc]);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = (type: AttachedDocument['type']) => {
    setActiveSlotType(type);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const triggerCamera = (type: AttachedDocument['type']) => {
    setActiveSlotType(type);
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
      cameraInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSlotType) {
      handleProcessFile(file, activeSlotType);
    }
  };

  const handleRemoveDoc = (docId: string) => {
    onChange(documents.filter((d) => d.id !== docId));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isPdf = (doc: AttachedDocument) => {
    return (
      doc.mime_type === 'application/pdf' ||
      doc.file_name.toLowerCase().endsWith('.pdf') ||
      doc.file_url.startsWith('data:application/pdf')
    );
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,application/pdf"
        className="hidden"
        onChange={handleFileInputChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileInputChange}
      />
      <input
        ref={genericInputRef}
        type="file"
        accept="image/*,.pdf,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleProcessFile(file, 'other', 'Documento Adicional');
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {DOCUMENT_SLOTS.map((slot) => {
          const uploaded = documents.find((d) => d.type === slot.type);

          return (
            <div
              key={slot.type}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverSlot(slot.type);
              }}
              onDragLeave={() => setDragOverSlot(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverSlot(null);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  handleProcessFile(file, slot.type);
                }
              }}
              className={`rounded-2xl border-2 p-4 transition-all duration-200 flex flex-col justify-between ${
                uploaded
                  ? 'bg-emerald-50/70 border-emerald-400 shadow-sm'
                  : dragOverSlot === slot.type
                  ? 'bg-amber-50 border-amber-500 border-dashed scale-[1.01]'
                  : 'bg-stone-50/80 border-stone-200 hover:border-amber-400 border-dashed'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {uploaded ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <FileText className="w-5 h-5 text-stone-400 shrink-0" />
                    )}
                    <span className="font-extrabold text-sm text-stone-900 leading-tight">
                      {slot.title}
                    </span>
                  </div>
                  {slot.required ? (
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                        uploaded
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {uploaded ? 'Cargado' : 'Requerido'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-stone-500 uppercase px-2 py-0.5 rounded-full bg-stone-200/70 shrink-0">
                      Opcional
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-500 font-medium mb-3">
                  {slot.description}
                </p>
              </div>

              {uploaded ? (
                /* Uploaded File Card */
                <div className="bg-white rounded-xl p-3 border border-emerald-300 shadow-sm flex items-center justify-between gap-2">
                  <div
                    onClick={() => setPreviewDoc(uploaded)}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                  >
                    {isPdf(uploaded) ? (
                      <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-black text-xs shrink-0 border border-red-200">
                        PDF
                      </div>
                    ) : (
                      <img
                        src={uploaded.file_url}
                        alt={uploaded.name}
                        className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0 bg-stone-100"
                        referrerPolicy="no-referrer"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-stone-900 truncate" title={uploaded.file_name}>
                        {uploaded.file_name}
                      </p>
                      <p className="text-[11px] text-stone-500 font-semibold">
                        {formatFileSize(uploaded.file_size)} • Clic para ver
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(uploaded)}
                      className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Ver vista previa"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(uploaded.id)}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar documento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Upload Trigger Buttons */
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => triggerUpload(slot.type)}
                    className="flex-1 bg-white hover:bg-amber-50 text-stone-800 hover:text-stone-950 font-bold text-xs py-2 px-3 rounded-xl border border-stone-300 hover:border-amber-400 shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-600" />
                    <span>Seleccionar Archivo / PDF</span>
                  </button>

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => triggerCamera(slot.type)}
                    className="bg-white hover:bg-amber-50 text-stone-800 font-bold text-xs p-2 rounded-xl border border-stone-300 hover:border-amber-400 shadow-sm transition-all flex items-center justify-center shrink-0 active:scale-95"
                    title="Tomar foto con la cámara del celular"
                  >
                    <Camera className="w-4 h-4 text-stone-700" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Documents Section (if any extra certificates are added) */}
      {documents.filter((d) => d.type === 'other').length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-bold text-stone-700 uppercase tracking-wide">
            Otros Documentos Adjuntos:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {documents
              .filter((d) => d.type === 'other')
              .map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl p-2.5 border border-stone-200 flex items-center justify-between gap-2 shadow-sm"
                >
                  <div
                    onClick={() => setPreviewDoc(doc)}
                    className="flex items-center gap-2 min-w-0 cursor-pointer flex-1"
                  >
                    <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-semibold text-stone-800 truncate">
                      {doc.file_name}
                    </span>
                  </div>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="p-1 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Add Extra Attachment Button */}
      {!disabled && (
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (genericInputRef.current) {
                genericInputRef.current.value = '';
                genericInputRef.current.click();
              }
            }}
            className="text-xs font-bold text-stone-600 hover:text-amber-800 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adjuntar otro documento adicional</span>
          </button>
        </div>
      )}

      {/* Document Modal Preview */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
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
