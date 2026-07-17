"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface ImageCropDialogProps {
  file: File;
  onCancel: () => void;
  onConfirm: (cropped: File) => void;
}

/** Lightweight center-crop dialog for payment logos (no extra deps). */
export function ImageCropDialog({ file, onCancel, onConfirm }: ImageCropDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [ready, setReady] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.naturalWidth) return;

    const size = 320;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let sw: number;
    let sh: number;
    const aspect = img.naturalWidth / img.naturalHeight;
    if (aspect >= 1) {
      sh = img.naturalHeight / zoom;
      sw = sh;
    } else {
      sw = img.naturalWidth / zoom;
      sh = sw;
    }
    const sx = (img.naturalWidth - sw) / 2;
    const sy = (img.naturalHeight - sh) / 2;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
  }, [zoom]);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setReady(true);
    };
    img.src = url;
    return () => {
      URL.revokeObjectURL(url);
      imgRef.current = null;
    };
  }, [file]);

  useEffect(() => {
    if (ready) draw();
  }, [ready, draw]);

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const name = file.name.replace(/\.[^.]+$/, "") + "-cropped.png";
        onConfirm(new File([blob], name, { type: "image/png" }));
      },
      "image/png",
      0.95
    );
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md space-y-4 border border-luxury-gold/20 bg-[#0F1C18] p-6 shadow-xl">
        <p className="font-display text-lg text-luxury-gold">Crop Payment Logo</p>
        <p className="text-xs text-white/50">
          Adjust zoom, then confirm. The cropped square is saved as PNG.
        </p>
        <div className="flex justify-center bg-white/5 p-3">
          <canvas
            ref={canvasRef}
            className="h-64 w-64 rounded border border-luxury-gold/20 bg-white"
          />
        </div>
        <label className="block text-xs text-white/60">
          Zoom
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="mt-2 w-full accent-luxury-gold"
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="gold" onClick={handleConfirm} disabled={!ready}>
            Apply Crop
          </Button>
        </div>
      </div>
    </div>
  );
}
