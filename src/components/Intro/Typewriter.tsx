'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { TypewriterProps } from './types';

/**
 * Typewriter robusto + accesible:
 * - Avanza por índices (li/ci) para evitar closures obsoletos.
 * - Cursor parpadeante (desactivado en reduced motion).
 * - role="status" + aria-live="polite" + aria-atomic="true".
 * - onDone() al terminar todas las líneas.
 */
export default function Typewriter({
  lines,
  charSpeedMs = 18,
  lineDelayMs = 350,
  ariaLive = 'polite',
  onDone,
  className = '',
}: TypewriterProps) {
  const reduce = useReducedMotion();

  const [rendered, setRendered] = useState<string[]>(
    () => lines.map(() => '')
  );
  const [li, setLi] = useState(0);  // índice de línea
  const [ci, setCi] = useState(0);  // índice de carácter en la línea actual

  useEffect(() => {
    // Si cambia el array de líneas, resetea estados
    setRendered(lines.map(() => ''));
    setLi(0);
    setCi(0);
  }, [lines]);

  useEffect(() => {
    if (reduce) {
      // Reduced motion: muestra todo y finaliza
      setRendered([...lines]);
      setLi(lines.length);
      setCi(0);
      onDone?.();
      return;
    }

    // Fin: todas las líneas completas
    if (li >= lines.length) {
      onDone?.();
      return;
    }

    const target = lines[li];

    if (ci < target.length) {
      // escribe siguiente carácter
      const id = window.setTimeout(() => {
        setRendered(prev => {
          const copy = [...prev];
          copy[li] = target.slice(0, ci + 1);
          return copy;
        });
        setCi(ci + 1);
      }, Math.max(5, charSpeedMs));

      return () => window.clearTimeout(id);
    } else {
      // línea completa → delay y pasa a la siguiente
      const id = window.setTimeout(() => {
        setLi(li + 1);
        setCi(0);
      }, Math.max(150, lineDelayMs));

      return () => window.clearTimeout(id);
    }
  }, [li, ci, lines, charSpeedMs, lineDelayMs, reduce, onDone]);

  const activeLine = Math.min(li, lines.length - 1);
  const showCursor = !reduce && li < lines.length;

  return (
    <div
      data-testid="zq-typewriter"
      className={`text-sm md:text-base text-neutral-200 font-['Inter',sans-serif] ${className}`}
      role="status"
      aria-live={ariaLive}   // 'polite' por defecto
      aria-atomic="true"     // anuncia el párrafo entero cuando cambie
    >
      {rendered.map((text, i) => (
        <p key={i} className="mb-1">
          <span>{text}</span>
          {showCursor && i === activeLine && (
            <span
              aria-hidden="true"
              className="inline-block w-[0.6ch] h-[1.1em] align-[0.1em] bg-neutral-200/80 ml-[2px] animate-[cursorBlink_1s_steps(1)_infinite]"
            />
          )}
        </p>
      ))}

      <style jsx>{`
        @keyframes cursorBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
      `}</style>
    </div>
  );
}

