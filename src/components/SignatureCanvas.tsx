import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, Edit3 } from 'lucide-react';

interface SignatureCanvasProps {
  onSaveSignature: (signatureDataUrl: string) => void;
  guardianName: string;
  initialSignature?: string;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSaveSignature,
  guardianName,
  initialSignature,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!initialSignature);
  const [useTyped, setUseTyped] = useState(initialSignature?.startsWith('typed:') || false);
  const [typedSignature, setTypedSignature] = useState(
    initialSignature?.startsWith('typed:')
      ? initialSignature.replace('typed:', '')
      : guardianName || ''
  );

  useEffect(() => {
    if (useTyped && typedSignature.trim()) {
      onSaveSignature(`typed:${typedSignature}`);
    }
  }, [typedSignature, useTyped]);

  // Load initial graphic signature onto canvas if present
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#7F1D1D';

    if (initialSignature && initialSignature.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasSignature(true);
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSignature(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        onSaveSignature(canvas.toDataURL());
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSaveSignature('');
  };

  return (
    <div className="bg-stone-50 border-2 border-stone-300 rounded-2xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <label className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
          <Edit3 className="w-4 h-4 text-red-700" />
          Firma del Padre / Acudiente Responsable *
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setUseTyped(!useTyped);
              if (!useTyped && typedSignature) {
                onSaveSignature(`typed:${typedSignature}`);
              }
            }}
            className="text-xs font-semibold text-red-700 underline hover:text-red-900"
          >
            {useTyped ? '✍️ Dibujar firma' : '⌨️ Escribir firma con teclado'}
          </button>
        </div>
      </div>

      {useTyped ? (
        <div className="space-y-2">
          <input
            type="text"
            value={typedSignature}
            onChange={(e) => {
              setTypedSignature(e.target.value);
              onSaveSignature(`typed:${e.target.value}`);
            }}
            placeholder="Escriba su nombre completo como firma"
            className="w-full bg-white border-2 border-stone-300 rounded-xl px-4 py-3 text-lg font-serif italic font-bold text-red-900 focus:outline-none focus:border-red-600"
          />
          <p className="text-xs text-stone-500">
            Al escribir su nombre completo declara la validez de su firma digital.
          </p>
        </div>
      ) : (
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={130}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full bg-white border border-stone-300 rounded-xl cursor-crosshair touch-none shadow-inner"
          />
          {!hasSignature && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-stone-400 text-sm font-medium">
              Firme aquí con el dedo o mouse
            </div>
          )}
          {hasSignature && (
            <button
              type="button"
              onClick={clearCanvas}
              className="mt-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Eraser className="w-3.5 h-3.5" />
              Borrar firma
            </button>
          )}
        </div>
      )}
    </div>
  );
};
