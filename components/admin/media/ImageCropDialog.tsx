"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface ImageCropDialogProps {
  file: File;
  onCancel: () => void;
  onConfirm: (cropped: File) => void;
  title?: string;
}

/** Lightweight center-crop dialog with zoom + rotate (no extra deps). */
export function ImageCropDialog({
  file,
  onCancel,
  onConfirm,
  title = "Crop Image",
}: ImageCropDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
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

    const rad = (rotation * Math.PI) / 180;
    const swapped = rotation % 180 !== 0;
    const srcW = swapped ? img.naturalHeight : img.naturalWidth;
    const srcH = swapped ? img.naturalWidth : img.naturalHeight;

    let sw: number;
    let sh: number;
    const aspect = srcW / srcH;
    if (aspect >= 1) {
      sh = srcH / zoom;
      sw = sh;
    } else {
      sw = srcW / zoom;
      sh = sw;
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(rad);

    const drawW = swapped ? size : size;
    const drawH = swapped ? size : size;
    // Map crop square in rotated space
    const crop = Math.min(img.naturalWidth, img.naturalHeight) / zoom;
    const sx = (img.naturalWidth - crop) / 2;
    const sy = (img.naturalHeight - crop) / 2;
    ctx.drawImage(img, sx, sy, crop, crop, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [zoom, rotation]);

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
        <p className="font-display text-lg text-luxury-gold">{title}</p>
        <p className="text-xs text-white/50">
          Adjust zoom or rotate, then confirm. The cropped square is saved as PNG.
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
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-luxury-gold/30 text-luxury-gold"
            onClick={() => setRotation((r) => (r + 90) % 360)}
          >
            Rotate 90°
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="button" variant="gold" onClick={handleConfirm} disabled={!ready}>
              Apply Crop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
