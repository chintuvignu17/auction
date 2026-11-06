import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Upload, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw, 
  Check, 
  RefreshCw, 
  Camera, 
  Crop 
} from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (base64DataUrl: string) => void;
  initialFile?: File | null;
  cropShape?: 'round' | 'rect';
  title?: string;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  onClose,
  onCropComplete,
  initialFile = null,
  cropShape = 'round',
  title = 'Crop & Position Player Photo'
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imgElementRef = useRef<HTMLImageElement | null>(null);

  const CANVAS_SIZE = 340; // Viewport size in px
  const EXPORT_SIZE = 400; // Output high-res crop size

  // Load file into imageSrc
  const loadFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        imgElementRef.current = img;
        setImageSrc(src);
        setZoom(1);
        setRotation(0);
        setOffset({ x: 0, y: 0 });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    if (initialFile && isOpen) {
      loadFile(initialFile);
    }
  }, [initialFile, isOpen, loadFile]);

  // Handle local file selection
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadFile(e.target.files[0]);
    }
  };

  // Render canvas preview
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgElementRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgElementRef.current;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Dark backdrop
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.save();
    // Center transformation
    ctx.translate(CANVAS_SIZE / 2 + offset.x, CANVAS_SIZE / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate aspect scale to cover the canvas
    const imgAspect = img.width / img.height;
    let drawWidth = CANVAS_SIZE;
    let drawHeight = CANVAS_SIZE;
    if (imgAspect > 1) {
      drawWidth = CANVAS_SIZE * imgAspect;
    } else {
      drawHeight = CANVAS_SIZE / imgAspect;
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();

    // Draw Mask Overlay (Dark outside crop boundary)
    ctx.save();
    ctx.fillStyle = 'rgba(5, 8, 17, 0.75)';

    const cropRadius = (CANVAS_SIZE * 0.8) / 2;
    const centerX = CANVAS_SIZE / 2;
    const centerY = CANVAS_SIZE / 2;

    ctx.beginPath();
    ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (cropShape === 'round') {
      ctx.arc(centerX, centerY, cropRadius, 0, Math.PI * 2, true);
    } else {
      const rectSize = cropRadius * 2;
      const rx = centerX - cropRadius;
      const ry = centerY - cropRadius;
      // Counter-clockwise rectangle cutout
      ctx.rect(rx + rectSize, ry, -rectSize, rectSize);
    }
    ctx.fill();

    // Draw Gold Crop Guide Ring
    ctx.beginPath();
    if (cropShape === 'round') {
      ctx.arc(centerX, centerY, cropRadius, 0, Math.PI * 2);
    } else {
      const rx = centerX - cropRadius;
      const ry = centerY - cropRadius;
      ctx.rect(rx, ry, cropRadius * 2, cropRadius * 2);
    }
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();
  }, [offset, zoom, rotation, cropShape]);

  useEffect(() => {
    if (imageSrc) {
      drawPreview();
    }
  }, [imageSrc, drawPreview]);

  // Mouse / Touch Pan Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!imageSrc || e.touches.length === 0) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length === 0) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  // Perform Final High-Res Export
  const handleApplyCrop = () => {
    if (!imgElementRef.current) return;
    const img = imgElementRef.current;

    // Create offscreen export canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = EXPORT_SIZE;
    exportCanvas.height = EXPORT_SIZE;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    const scaleFactor = EXPORT_SIZE / CANVAS_SIZE;

    ctx.save();
    // Center on export canvas
    ctx.translate(
      EXPORT_SIZE / 2 + offset.x * scaleFactor, 
      EXPORT_SIZE / 2 + offset.y * scaleFactor
    );
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom * scaleFactor, zoom * scaleFactor);

    const imgAspect = img.width / img.height;
    let drawWidth = CANVAS_SIZE;
    let drawHeight = CANVAS_SIZE;
    if (imgAspect > 1) {
      drawWidth = CANVAS_SIZE * imgAspect;
    } else {
      drawHeight = CANVAS_SIZE / imgAspect;
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();

    // Export as compressed high quality JPEG (88% quality keeps size around ~35-50KB)
    const dataUrl = exportCanvas.toDataURL('image/jpeg', 0.88);
    onCropComplete(dataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1222] border-2 border-amber-500/40 rounded-3xl max-w-sm w-full shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-[#080d19] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm text-white">{title}</h3>
              <p className="text-[10px] text-slate-400">Drag to reposition, slider to zoom</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Canvas Area */}
        <div className="p-4 flex flex-col items-center justify-center bg-slate-950/60 select-none">
          {imageSrc ? (
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 cursor-grab active:cursor-grabbing">
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                className="block max-w-full h-auto"
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] text-slate-300 pointer-events-none backdrop-blur-xs">
                Drag to center face
              </span>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-[300px] h-[240px] rounded-2xl border-2 border-dashed border-amber-500/40 bg-slate-900/60 hover:bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition space-y-2 group"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition border border-amber-500/20">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-white block">
                Choose Image from Device
              </span>
              <p className="text-[10px] text-slate-400 max-w-[200px]">
                Supports JPG, PNG, WEBP files. Crop and center cleanly.
              </p>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Interactive Controls Bar */}
        {imageSrc && (
          <div className="p-3.5 border-t border-slate-800 bg-[#080d19] space-y-3">
            
            {/* Zoom Slider */}
            <div className="flex items-center space-x-2 text-xs">
              <button
                type="button"
                onClick={() => setZoom(prev => Math.max(0.6, prev - 0.1))}
                className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <input
                type="range"
                min="0.6"
                max="3"
                step="0.05"
                value={zoom}
                onChange={e => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />

              <button
                type="button"
                onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
                className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <span className="text-[10px] font-mono text-amber-400 w-8 text-right font-bold">
                {zoom.toFixed(1)}x
              </span>
            </div>

            {/* Quick Action Tools */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer flex items-center space-x-1 text-[11px] border border-slate-800"
                  title="Rotate clockwise"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Rotate</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                    setOffset({ x: 0, y: 0 });
                  }}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer flex items-center space-x-1 text-[11px] border border-slate-800"
                  title="Reset alignment"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition cursor-pointer text-[11px] font-bold border border-cyan-500/20"
              >
                Change File
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-slate-800 bg-[#0a0f1d] flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>

          {imageSrc && (
            <button
              type="button"
              onClick={handleApplyCrop}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Crop & Use Photo</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

