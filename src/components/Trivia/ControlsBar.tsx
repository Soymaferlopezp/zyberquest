"use client";

export default function ControlsBar() {
  return (
    <nav className="rounded-2xl border border-white/10 p-3 text-xs text-white/80 bg-white/5">
      <ul className="flex flex-wrap gap-4">
        <li><kbd className="px-2 py-1 rounded border border-white/20">1-4</kbd> elegir opción</li>
        <li><kbd className="px-2 py-1 rounded border border-white/20">Enter</kbd> confirmar</li>
        <li><kbd className="px-2 py-1 rounded border border-white/20">P</kbd> pausa</li>
        <li><kbd className="px-2 py-1 rounded border border-white/20">Esc</kbd> salir</li>
      </ul>
    </nav>
  );
}
