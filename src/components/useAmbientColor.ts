import { useEffect, useState } from 'react';

/**
 * Extracts the dominant color from an image URL using an offscreen canvas.
 * Returns an rgba color string for use as an ambient background glow.
 * Falls back to null on error.
 */
export default function useAmbientColor(imageUrl: string | undefined): string | null {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) { setColor(null); return; }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement('canvas');
        // Sample at low resolution for performance
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        // Accumulate color values, skipping very dark and very bright pixels
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 16) { // sample every 4th pixel
          const pr = data[i], pg = data[i + 1], pb = data[i + 2];
          const brightness = (pr + pg + pb) / 3;
          if (brightness > 30 && brightness < 220) {
            r += pr; g += pg; b += pb; count++;
          }
        }
        if (count > 0) {
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          // Boost saturation slightly for a more vivid glow
          const max = Math.max(r, g, b);
          const boost = max > 0 ? Math.min(255 / max, 1.4) : 1;
          r = Math.min(255, Math.round(r * boost));
          g = Math.min(255, Math.round(g * boost));
          b = Math.min(255, Math.round(b * boost));
          setColor(`${r}, ${g}, ${b}`);
        }
      } catch {
        // CORS or canvas error — silently fall back
      }
    };
    img.onerror = () => { /* thumbnail failed to load, no ambient */ };
    img.src = imageUrl;
    return () => { cancelled = true; };
  }, [imageUrl]);

  return color;
}
