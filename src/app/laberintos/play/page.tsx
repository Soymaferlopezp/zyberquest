'use client';

import { useEffect, useRef } from "react";
import { createPhaserGame, destroyPhaserGame } from "@/game/labyrinth";

export default function LaberintosPlayPage(){
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    // Crear el juego cuando el contenedor está listo
    if (mountRef.current){
      createPhaserGame(mountRef.current);
    }
    // Limpieza al salir de la página
    return ()=> {
      destroyPhaserGame();
    };
  },[]);

  return (
    <main className="min-h-screen zx-scanline flex items-center justify-center">
      <div
        ref={mountRef}
        id="phaser-mount"
        className="w-[960px] h-[540px] border border-zinc-800 rounded-lg"
        aria-label="Zona de juego Phaser"
      />
    </main>
  );
}
