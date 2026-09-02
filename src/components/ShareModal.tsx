import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, ExternalLink, Link2, Phone } from 'lucide-react';
import { Logo } from './Logo';
import { ClubInfo } from '../types';
import { INITIAL_CLUB_INFO } from '../data/initialData';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTogglePublicMode: () => void;
  clubInfo?: ClubInfo;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, onTogglePublicMode, clubInfo }) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Derive current registration link
  const currentOrigin = window.location.origin + window.location.pathname;
  const publicRegistrationUrl = `${currentOrigin}#/inscribirse`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicRegistrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendWhatsApp = () => {
    let rawDigits = phoneNumber.replace(/\D/g, '');
    let targetPhone = '';

    if (rawDigits.length === 10 && rawDigits.startsWith('3')) {
      // Standard 10-digit Colombian mobile number
      targetPhone = `57${rawDigits}`;
    } else if (rawDigits.length > 0) {
      targetPhone = rawDigits;
    }

    const text = encodeURIComponent(
      `¡Hola! 👋 Te compartimos el enlace para diligenciar la Ficha de Inscripción oficial del Club Deportivo Fire Wheels (Escuela Formativa de Patinaje 🛼):\n\n${publicRegistrationUrl}\n\n📌 Podrás completar los datos del deportista, adjuntar los documentos requeridos (documento de identidad, certificado EPS, etc.) y firmar digitalmente desde tu celular.\n\n¡Cualquier inquietud con gusto te asesoramos!`
    );

    if (targetPhone) {
      window.open(`https://wa.me/${targetPhone}?text=${text}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-stone-300 overflow-hidden my-auto space-y-0">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-stone-900 text-white p-6 flex items-center justify-between border-b-4 border-amber-500/80">
          <div className="flex items-center gap-3">
            <Logo size="md" logoUrl={clubInfo?.logo_url || INITIAL_CLUB_INFO.logo_url} />
            <div>
              <h3 className="text-xl font-extrabold">Link de Inscripción para Padres</h3>
              <p className="text-amber-300 text-xs font-bold uppercase">Club Deportivo Fire Wheels</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-stone-800">
          <p className="text-sm text-stone-700 leading-relaxed font-medium">
            Envíe este link directo por WhatsApp a los padres de familia para que completen la Ficha de Inscripción desde su celular sin necesidad de usuario ni contraseña.
          </p>

          {/* LINK DISPLAY BOX */}
          <div className="bg-stone-50 border-2 border-stone-300 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2 overflow-hidden">
              <Link2 className="w-5 h-5 text-red-700 shrink-0" />
              <span className="text-xs font-mono font-bold text-stone-800 truncate">
                {publicRegistrationUrl}
              </span>
            </div>

            <button
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-red-700 hover:bg-red-800 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copiar
                </>
              )
            }
            </button>
          </div>

          {/* WHATSAPP PHONE NUMBER INPUT */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-extrabold text-red-800 uppercase tracking-wide">
              Número de WhatsApp del Acudiente (Opcional):
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Ej: 3146919369 o +57 3146919369"
                className="w-full bg-stone-50 border-2 border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-xs font-extrabold text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>
            <p className="text-[11px] text-stone-500 font-medium">
              Si ingresa el número, el mensaje se abrirá directamente para ese destinatario. De lo contrario, podrá elegir el contacto en WhatsApp.
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleSendWhatsApp}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Enviar Formulario por WhatsApp</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onTogglePublicMode();
              }}
              className="w-full bg-stone-100 hover:bg-stone-200 text-red-800 font-extrabold text-sm py-3 px-6 rounded-2xl border-2 border-stone-300 flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4 text-red-700" />
              <span>Abrir Vista Previa del Formulario</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
