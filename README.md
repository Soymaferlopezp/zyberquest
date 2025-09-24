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