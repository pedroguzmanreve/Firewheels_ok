import React, { useState, useRef } from 'react';
import { Camera } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  logoUrl?: string;
  editable?: boolean;
  onLogoChange?: (newLogoUrl: string) => void;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  logoUrl,
  editable = false,
  onLogoChange,
}) => {
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onLogoChange) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Por favor seleccione una imagen menor a 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageError(false);
          onLogoChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const showCustomImage = logoUrl && !imageError;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        onClick={triggerUpload}
        className={`relative shrink-0 ${sizeClasses[size]} ${
          editable ? 'cursor-pointer group' : ''
        }`}
        title={editable ? 'Haga clic para cambiar la foto del logo del club' : undefined}
      >
        {editable && (
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        )}

        {showCustomImage ? (
          <div className="w-full h-full rounded-2xl overflow-hidden bg-white border-2 border-yellow-400 p-0.5 shadow-md flex items-center justify-center">
            <img
              src={logoUrl}
              alt="Logo del Club"
              onError={() => setImageError(true)}
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
        ) : (
          <svg
            viewBox="0 0 200 220"
            className="w-full h-full drop-shadow-[0_4px_12px_rgba(220,38,38,0.5)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Fire Gradient 1 - Outer Flames */}
              <linearGradient id="fireOuter" x1="100" y1="0" x2="100" y2="220" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFEE00" />
                <stop offset="25%" stopColor="#FF7700" />
                <stop offset="60%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#7F1D1D" />
              </linearGradient>

              {/* Fire Gradient 2 - Inner Glow */}
              <linearGradient id="fireInner" x1="100" y1="20" x2="100" y2="200" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFF500" />
                <stop offset="40%" stopColor="#FF5500" />
                <stop offset="100%" stopColor="#B91C1C" />
              </linearGradient>

              {/* Yellow Wheel Glow */}
              <radialGradient id="wheelGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="100%" stopColor="#EAB308" />
              </radialGradient>

              {/* Path for Arched Text CLUB DEPORTIVO */}
              <path id="topArc" d="M 35,100 A 65,65 0 1,1 165,100" />
              {/* Path for Arched Text FIRE WHEELS */}
              <path id="bottomArc" d="M 32,100 A 68,68 0 0,0 168,100" />
            </defs>

            {/* BACK FLAMES (FIRE AURA) */}
            <path
              d="M100 2 C115 25 125 15 140 35 C155 20 165 45 178 60 C195 85 200 115 192 145 C182 182 150 215 100 218 C50 215 18 182 8 145 C0 115 5 85 22 60 C35 45 45 20 60 35 C75 15 85 25 100 2 Z"
              fill="url(#fireOuter)"
            />
            <path
              d="M100 15 C110 32 120 22 132 40 C145 30 152 50 162 65 C175 88 180 112 174 138 C165 168 138 195 100 198 C62 195 35 168 26 138 C20 112 25 88 38 65 C48 50 55 30 68 40 C80 22 90 32 100 15 Z"
              fill="url(#fireInner)"
            />

            {/* CENTRAL WHEEL CIRCLE */}
            <circle cx="100" cy="115" r="72" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="4" />
            <circle cx="100" cy="115" r="66" fill="url(#wheelGlow)" />
            <circle cx="100" cy="115" r="66" fill="none" stroke="#DC2626" strokeWidth="1.5" />

            {/* TOP CURVED TEXT: CLUB DEPORTIVO */}
            <text fill="#B91C1C" fontSize="13.5" fontWeight="900" letterSpacing="1.2">
              <textPath href="#topArc" startOffset="50%" textAnchor="middle">
                CLUB DEPORTIVO
              </textPath>
            </text>

            {/* BOTTOM CURVED TEXT: FIRE WHEELS */}
            <text fill="#B91C1C" fontSize="15" fontWeight="900" letterSpacing="1.8">
              <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">
                FIRE WHEELS
              </textPath>
            </text>

            {/* INLINE SKATE GRAPHIC */}
            <g transform="translate(100, 118)">
              {/* SKATE CHASSIS / FRAME */}
              <rect x="-38" y="16" width="76" height="7" rx="3.5" fill="#1F2937" />
              <rect x="-36" y="17" width="72" height="5" rx="2.5" fill="#4B5563" />

              {/* 4 INLINE WHEELS WITH ACCENTS */}
              {[-30, -10, 10, 30].map((cx, i) => (
                <g key={i}>
                  <circle cx={cx} cy="26" r="8" fill="#FFFFFF" stroke="#B91C1C" strokeWidth="2" />
                  <circle cx={cx} cy="26" r="4.5" fill="#DC2626" />
                  <circle cx={cx} cy="26" r="2" fill="#FEF08A" />
                </g>
              ))}

              {/* SKATE BOOT */}
              <path
                d="M -24 16 L -20 -10 Q -18 -26 -5 -28 Q 12 -28 16 -16 L 26 6 Q 30 16 22 16 Z"
                fill="#DC2626"
                stroke="#991B1B"
                strokeWidth="2"
              />
              <path d="M -16 -8 Q 0 -22 14 -12 L 20 6 L -16 6 Z" fill="#EF4444" />
              {/* Boot Cuff & Straps */}
              <rect x="-18" y="-22" width="26" height="6" rx="3" fill="#1F2937" />
              <rect x="-16" y="-12" width="28" height="5" rx="2.5" fill="#F59E0B" />
              <rect x="-14" y="-3" width="30" height="5" rx="2.5" fill="#1F2937" />

              {/* SPEED SKATER CHARACTER SILHOUETTE */}
              <path d="M-8 -30 L-2 -44 L10 -40 L4 -28 Z" fill="#FEF08A" />
              {/* Helmet with Fire Wings */}
              <ellipse cx="2" cy="-44" rx="10" ry="7" fill="#DC2626" />
              <path d="M-6 -46 Q2 -55 12 -46 Q4 -44 -6 -46 Z" fill="#F59E0B" />
              {/* Visor */}
              <path d="M4 -46 Q10 -46 11 -42 Q6 -40 3 -43 Z" fill="#1F2937" />

              {/* Arms Pumping */}
              <path d="M-5 -8 L-22 0 M5 -8 L20 -2" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
              <path d="M-5 -8 L-22 0 M5 -8 L20 -2" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="-22" cy="0" r="3.5" fill="#1F2937" />
              <circle cx="20" cy="-2" r="3.5" fill="#1F2937" />
            </g>
          </svg>
        )}

        {editable && (
          <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1">
            <Camera className="w-4 h-4 text-yellow-300" />
            <span className="text-[9px] font-black text-center leading-tight text-yellow-300 uppercase">Cambiar</span>
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-white text-lg tracking-tight leading-none uppercase">
            FIRE WHEELS
          </span>
          <span className="text-yellow-300 text-[10px] font-bold tracking-widest uppercase">
            Club Deportivo
          </span>
        </div>
      )}
    </div>
  );
};
