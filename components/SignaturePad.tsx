'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

interface SignaturePadProps {
  label: string;
  onSignature: (data: { dataUrl: string; timestamp: string; method: 'draw' | 'upload' | 'type' }) => void;
  className?: string;
}

export default function SignaturePad({ label, onSignature, className = '' }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [mode, setMode] = useState<'draw' | 'upload' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution for retina
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Style
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [mode]);

  const getPos = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  }, []);

  const startDraw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [getPos]);

  const draw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSignature(true);
  }, [isDrawing, getPos]);

  const endDraw = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasSignature(false);
    setSignaturePreview(null);
  };

  const confirmSignature = () => {
    const timestamp = new Date().toISOString();

    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      setSignaturePreview(dataUrl);
      onSignature({ dataUrl, timestamp, method: 'draw' });
    } else if (mode === 'type') {
      // Render typed name to canvas as signature font
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 600;
      tempCanvas.height = 200;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#faf9f6';
      ctx.fillRect(0, 0, 600, 200);
      ctx.font = 'italic 48px "Georgia", "Times New Roman", serif';
      ctx.fillStyle = '#1a1a1a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName, 300, 100);
      const dataUrl = tempCanvas.toDataURL('image/png');
      setSignaturePreview(dataUrl);
      onSignature({ dataUrl, timestamp, method: 'type' });
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setSignaturePreview(dataUrl);
      setHasSignature(true);
      onSignature({ dataUrl, timestamp: new Date().toISOString(), method: 'upload' });
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    clearCanvas();
    setTypedName('');
    setSignaturePreview(null);
  };

  if (signaturePreview) {
    return (
      <div className={`space-y-3 ${className}`}>
        <p className="text-xs font-semibold text-[#6b7f3e] uppercase tracking-wider">{label}</p>
        <div className="rounded-lg border-2 border-[#6b7f3e] bg-white p-3">
          <img src={signaturePreview} alt="Unterschrift" className="max-h-24 mx-auto" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#6b7f3e] inline-block" />
            Unterschrieben am {new Date().toLocaleDateString('de-DE')} um {new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            type="button"
            onClick={reset}
            className="text-xs text-red-500 hover:underline cursor-pointer"
          >
            Zurücksetzen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <p className="text-xs font-semibold text-[#6b7f3e] uppercase tracking-wider">{label}</p>

      {/* Mode Tabs */}
      <div className="flex gap-1 rounded-lg bg-[#f5f5f0] p-1">
        {([
          ['draw', 'Zeichnen'],
          ['upload', 'Hochladen'],
          ['type', 'Eintippen'],
        ] as const).map(([m, lbl]) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); clearCanvas(); }}
            className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
              mode === m
                ? 'bg-white text-[#6b7f3e] shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* Draw Mode */}
      {mode === 'draw' && (
        <div className="space-y-2">
          <div className="relative rounded-lg border-2 border-dashed border-border bg-white overflow-hidden"
            style={{ touchAction: 'none' }}
          >
            <canvas
              ref={canvasRef}
              className="w-full cursor-crosshair"
              style={{ height: '160px', display: 'block' }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
            {!hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-sm text-muted-foreground/50">Hier unterschreiben...</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearCanvas}
              className="rounded-lg border border-border bg-white px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-[#f5f5f0] transition-colors cursor-pointer"
            >
              Löschen
            </button>
            <button
              type="button"
              onClick={confirmSignature}
              disabled={!hasSignature}
              className={`flex-1 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                hasSignature
                  ? 'bg-[#6b7f3e] text-white hover:opacity-90'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Vertrag rechtskräftig unterschreiben
            </button>
          </div>
        </div>
      )}

      {/* Upload Mode */}
      {mode === 'upload' && (
        <div className="space-y-2">
          <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-white p-8 cursor-pointer hover:border-[#6b7f3e] hover:bg-[#f0f4e8] transition-colors">
            <svg className="w-8 h-8 text-muted-foreground mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
            <span className="text-sm font-medium text-foreground">Unterschrift hochladen</span>
            <span className="text-xs text-muted-foreground mt-1">PNG, JPG oder SVG · Transparenter Hintergrund empfohlen</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Type Mode */}
      {mode === 'type' && (
        <div className="space-y-3">
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Vor- und Nachname eingeben"
            className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]"
          />
          {typedName && (
            <div className="rounded-lg border border-border bg-white p-4 text-center">
              <p className="text-3xl italic text-foreground" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                {typedName}
              </p>
              <p className="text-[10px] text-muted-foreground mt-2">Vorschau der getippten Unterschrift</p>
            </div>
          )}
          <button
            type="button"
            onClick={confirmSignature}
            disabled={!typedName.trim()}
            className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              typedName.trim()
                ? 'bg-[#6b7f3e] text-white hover:opacity-90'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Vertrag rechtskräftig unterschreiben
          </button>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Mit Ihrer Vertrag rechtskräftig unterschreiben Sie, dass Sie die Vertragsbedingungen gelesen und akzeptiert haben.
        Die elektronische Unterschrift ist gemäß eIDAS-Verordnung (EU) Nr. 910/2014 als einfache elektronische Signatur rechtsgültig.
      </p>
    </div>
  );
}
