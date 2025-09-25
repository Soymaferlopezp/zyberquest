# 🕹️ ZyberQuest — Cypherpunk Arcade

> Conecta nodos. Rompe cifrados. Domina el laberinto.  
> An off-chain arcade-style game to learn about privacy, ZK, and encryption.  

---

## ✨ Overview

ZyberQuest is a **2D cypherpunk arcade** experience with a **Matrix-like vibe**.  
It blends **retro visuals**, **educational gameplay**, and **privacy concepts** inspired by Zcash.

- 🎮 **Three modes**: Educational Trivias, Exploration Mazes, Cipher Simulators  
- ⚡ Built with **Next.js 14 + TypeScript + Tailwind CSS**  
- 🖥️ Neon green/cyan UI with terminal-like glow & scanline effects  
- 🔒 Focus on **privacy, zero-knowledge (ZK)**, and encryption basics  

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (custom theme), shadcn/ui (lightweight clone)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Inter (UI) + IBM Plex Mono (code/monospace) via `next/font`
- **SEO**: Next Metadata API + sitemap/robots (next-sitemap)
- **Accessibility**: High contrast, skip-to-content, keyboard navigation

---

## 🎨 Design System

**Colors (tokens)**  
```css
--zx-green:   #00FF9C; /* primary */
--zx-cyan:    #00E5FF; /* secondary */
--zx-magenta: #FF3DBE; /* accent */
--zx-ink:     #0A0D0A; /* deep background */
--zx-mid:     #0E1A16; /* panels */
--zx-grid:    rgba(0,255,156,0.08); /* ornaments */
Fonts

--font-inter → Inter (body/UI)

--font-plex-mono → IBM Plex Mono (titles, code)

Effects

Subtle scanline overlay

Neon glow borders

Animated code-rain particles (future)

🚀 Features
✅ Accessible: Focus states, high contrast, keyboard navigation

✅ Replayable: Randomized questions & levels

✅ Cypherpunk UI: Neon, grid, glow

✅ Educational: Learn ZK/crypto concepts via play

✅ 60 FPS gameplay, low-spec friendly

🎮 Game Modes
Trivias educativas — Answer Zcash privacy/security questions with tooltips

Laberintos de exploración — Top-down 2D mazes with doors, keys, ZK concepts

Simuladores de descifrado — Mini cipher games (Caesar, substitution, XOR)

🗺️ Roadmap (off-chain)
MVP — Core modes + basic UX ✅

Content — More questions, mazes, and cipher puzzles 🔄

Polishing — Animations, sounds, accessibility polish ⏳

On-chain integration — ZK/identity hooks & rewards (future) ⏳

## Pantalla Inicial — ZyberQuest (Intro)
Stack: Next.js 14 + TS + Tailwind + Framer Motion
Accesibilidad: prefers-reduced-motion, role="status", aria-live="polite", foco visible
Rutas: /intro (intro) → /menu (placeholder)

Estructura
app/intro/page.tsx
app/menu/page.tsx
components/Intro/{CodeRain,Logo,Typewriter,PlayButton,ControlsHint,audio,MuteToggle,useIntroShortcuts,types}.tsx

Editar contenido:
- app/intro/page.tsx → `introLines`
Ajustar lluvia:
- `<CodeRain density={0.6} speed={1.0} />`
Atajos:
- Enter = Play, M = Mute/Unmute (persistente), Esc = Saltar intro
Reduced Motion:
- Texto completo sin efectos; fondo estático; transiciones mínimas
Navegación:
- Termina o Play → anim salida + `router.push('/menu')`

## Menú principal (/menu)

Pantalla de selección con 3 modos (Trivias, Laberintos, Simuladores).
Stack: Next.js 14 + TypeScript + Tailwind + shadcn/ui + Framer Motion.

### Rutas
- `/menu` → esta pantalla
- `/intro` → pantalla anterior (Back)
- `/trivias`, `/laberintos`, `/simuladores` → placeholders (o flows reales)

### Accesibilidad
- Navegación con teclado: **Tab/Shift+Tab**, **Enter**, **Space**
- Atajos: **1** Trivias, **2** Laberintos, **3** Simuladores, **Esc** volver
- `prefers-reduced-motion`: desactiva animaciones no esenciales
- Roles/ARIA: `role="navigation"`, `aria-label`, `aria-disabled`, `aria-keyshortcuts`

### Añadir un cuarto modo
1. Edita `lib/modes.ts` y agrega un item al array `MODES`:
   ```ts
   {
     id: "nuevo",
     title: "Nuevo modo",
     desc: "Descripción breve.",
     href: "/nuevo",
     accent: "green" // o "cyan" | "magenta" | "#HEX"
   }

## Modo Trivias (ZyberQuest)

**Stack:** Next.js 14 (App Router) + TS + Tailwind + shadcn/ui + Zustand + Zod + Radix Tooltip + Framer Motion  
**Accesos rápidos:** `1-4` elegir • `Enter` confirmar/siguiente • `P` pausa • `Esc` salir

### Datos
- Banco en `src/data/trivia-zcash.json`
- Esquema Zod en `src/lib/triviaSchema.ts`
- Loader valida, baraja preguntas y **baraja choices** recalculando `answerIndex`: `src/lib/triviaLoader.ts`

**Formato por ítem:**
```json
{
  "id": "zcash-001",
  "category": "privacy",
  "type": "mcq",
  "question": "Texto...",
  "choices": ["A","B","C","D"],
  "answerIndex": 0,
  "explain": "1–3 líneas",
  "difficulty": "easy",
  "tags": ["zk"]
}


ZyberQuest — Laberintos de exploración 

Modo “Laberintos de exploración” con estética cypherpunk 2D, vibra Matrix, acento amarillo Zcash.
Stack: Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui + Framer Motion + Phaser 3.
Estado: MVP jugable con Tutorial y Mission, HUD, portales (minijuego César), trampas, dron, pausa y resultados.

0) Requisitos y scripts
# dependencias mínimas para el modo
npm i phaser zustand

# desarrollo
npm run dev

# build / start
npm run build
npm start


Ruta Intro: http://localhost:3000/laberintos

Juego:

http://localhost:3000/laberintos/play?mode=tutorial

http://localhost:3000/laberintos/play?mode=mission

1) Estructura
src/
  app/
    laberintos/
      page.tsx               # Intro + selección de modo + cápsula educativa César
      play/page.tsx          # Montaje Phaser (client component)
  game/labyrinth/
    index.ts                 # createPhaserGameWithMode() + destroyPhaserGame()
    config.ts                # Phaser.GameConfig (parent, scale, physics)
    scenes/
      Boot.ts
      Preload.ts
      LabPlay.ts             # Core del laberinto (tutorial/mission)
      PortalMiniGame.ts      # Minijuego César
      HUD.ts                 # Overlay (tiempo, llaves, score, minimapa)
      PauseOverlay.ts
      Results.ts
    systems/
      collisions.ts          # (placeholder)
      controls.ts            # (placeholder)
      lasers.ts              # (placeholder)
      drones.ts              # (placeholder)
      portals.ts             # (placeholder)
      minimap.ts             # (placeholder)
    data/
      nodes.json             # micro-píldoras educativas (2–3 líneas cada una)
    assets/
      tiles/                 # tiles básicos (placeholder)
      sfx/                   # sonidos opcionales
public/
  laberintos/char-m.png
  laberintos/char-f.png

2) Tokens de diseño
--zx-green:  #00FF9C;  /* primario */
--zx-cyan:   #00E5FF;  /* secundario */
--zx-yellow: #F4B728;  /* acento Zcash */
--zx-magenta:#FF3DBE;  /* alerta */
--zx-ink:    #0A0D0A;  /* bg */


Efectos: scanline sutil, code rain leve (opcional), glow controlado (drop-shadow).

3) Controles

Mover: WASD / Flechas

Interactuar: E (nodos, portales)

Dash: Space (CD 3s)

Pausa: P

Salir a menú: Esc

Intro (selección): T (Tutorial), M (Mission)

4) Flujo UX
Intro (/laberintos)

Selección Tutorial o Mission.

Cápsula educativa Zcash — Cifrado César (demo interactiva de shift).

Tutorial (/laberintos/play?mode=tutorial)

Sandbox sin tiempo ni hazards.

Objetivos: tomar 1 llave → abrir puerta; probar portal (palabra SHIELD); llegar al aro cian.

Texto/Panel educativo con E.

Mission (/laberintos/play?mode=mission)

Mapa centrado, elementos dispersos.

Llaves, nodos, portal (palabra PRIVACY), láser intermitente, zona de ruido (slow), dron patrulla, salida.

HUD

Tiempo (countdown), llaves, score, minimapa (revela posición).

Pausa y Resultados

PauseOverlay: Resume / Restart / Back to Menu.

Results: keys, portals, score y acciones (Retry / Back to Menu).

5) Mapas y tilemap

Tilemap JSON (Tiled) o generado en Preload.ts como placeholder.

Capas esperadas:

floors (piso)

walls (paredes, índice 1 colisiona)

Puerta: tile índice 2 en la parte superior central (se abre al cumplir llaves).

Escalado: SCALE = 2 en LabPlay.ts (capas y posicionamiento centrado).

Para reemplazar el mapa:

Exporta desde Tiled a JSON con tiles de 16×16 o 32×32 (ajusta en Preload.ts/LabPlay.ts).

Pon el JSON en src/game/labyrinth/assets/ y cárgalo en Preload.ts.

Sustituye el key: "L1" donde se crea el tilemap.

6) Añadir/editar contenido
Nodos educativos (nodes.json)
[
  { "id": "n1", "title": "Shielded addresses", "lines": ["Zcash supports t-addr and z-addr.", "z-addr provide privacy via zk-SNARKs."] },
  { "id": "n2", "title": "Viewing keys", "lines": ["You can share view-only access.", "Auditing without revealing spend keys."] }
]


Referencia de id se asigna al Container del nodo.

Llaves

En Mission, posiciones en LabPlay.ts → keyPositions[].

Para más llaves: empuja nuevos {x,y} y aumenta requiredKeys.

Puertas

Tile índice 2 en walls (se abre cambiando a 0 y quitando colisión).

Portales (minijuego)

En Mission: frase "PRIVACY", tiempo 20s.

En Tutorial: frase "SHIELD", tiempo 18s.

Cambia scene.launch("PortalMiniGame", { phrase, seconds }).

Trampas

Láser: staticGroup, toggle con time.addEvent (alpha 1/0.15).
Ajusta intervalo en LabPlay.ts (delay: 900).

Slow zone: rectángulo en HUD que reduce speed a 60%.

Dron: patrulla por waypoints (array droneWaypoints).

Minimapa

HUD dibuja un rectángulo y actualiza punto del jugador via eventos:

hud:minimap:init → (ancho, alto)

hud:minimap:update → (x, y)

7) Accesibilidad

prefers-reduced-motion respetado en animaciones (Framer).

Foco visible (Tailwind + outline custom en botones).

Contraste alto (texto en #E6FFE6 sobre #0A0D0A).

Inputs/outputs con label y aria-* en la cápsula César.

Atajos documentados y redundancia clic/tecla.

8) Performance

Phaser 60 FPS; arcade physics (barato para top-down).

Timers/tweens/listeners registrados y limpiados en LabPlay.cleanup() para evitar fugas al Retry/Restart.

pixelArt: false + setResolution(2) en textos para nitidez sin jank.

Colisión solo en walls y overlaps puntuales (llaves, láseres, dron).
---

👥 Team & Credits
Developed by BlockBears 🐻

Bear One — Gameplay

Bear Two — Crypto Edu

Bear Three — Frontend

Bear Four — Art & Audio

Bear Five — PM

You? — Contributor

Credits: Inspired by classic cryptography puzzles, cypherpunk aesthetics, and privacy tooling.

⚡ Getting Started
bash
Copiar código
# clone the repo
git clone https://github.com/your-username/zyberquest
cd zyberquest

# install dependencies
npm install

# run dev server
npm run dev
Visit http://localhost:3000.

📦 Scripts
npm run dev — Start dev server

npm run build — Production build

npm run start — Start production server

npm run lint — Lint code

npm run postbuild — Generate sitemap/robots

📈 SEO & Meta
/sitemap.xml and /robots.txt auto-generated with next-sitemap

Metadata API for OpenGraph & Twitter previews

📋 License
MIT © BlockBears Team