"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Brain, KeySquare, LockKeyhole } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } },
});

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section id="hero" className="container-zx pt-16 pb-12">
        <motion.h1
          {...fadeUp(0)}
          className="text-4xl md:text-6xl font-mono tracking-tight text-zx-green"
        >
          ZyberQuest — Conecta nodos. Rompe cifrados. Domina el laberinto.
        </motion.h1>

        <motion.p
          {...fadeUp(0.08)}
          className="mt-4 max-w-2xl text-zinc-300"
        >
          Arcade cypherpunk para aprender privacidad, ZK y encriptación.
        </motion.p>

        <motion.div
          {...fadeUp(0.16)}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <Link href="#modes" aria-label="See game modes">
            <Button className="bg-zx-green text-zx-ink hover:bg-zx-cyan transition-colors">
              Play <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>

          <Link href="#modes" aria-label="View modes">
            <Button variant="secondary" className="border border-zx-green/30 hover:border-zx-cyan/50">
              View modes
            </Button>
          </Link>
        </motion.div>

        {/* Línea decorativa */}
        <div className="mt-10 h-px w-full bg-[rgba(0,255,156,0.18)]" />
      </section>

      {/* MODOS DE JUEGO */}
      <section id="modes" className="container-zx py-12">
        <motion.h2 {...fadeUp(0)} className="text-2xl md:text-3xl font-mono text-zx-cyan">
          Game Modes
        </motion.h2>
        <p className="mt-2 text-zinc-400 max-w-2xl">
          Aprende jugando: trivias, laberintos top-down y minisimuladores de cifrado.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Trivias */}
          <motion.div {...fadeUp(0.05)}>
            <Card className="bg-zx-mid/40 border-zx-green/25 glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="text-zx-green" /> Trivias educativas
                </CardTitle>
              </CardHeader>
              <CardContent className="text-zinc-300">
                Preguntas de privacidad/seguridad del ecosistema Zcash con tooltips explicativos.
                <div className="mt-4">
                  <Link href="/trivias" aria-label="Go to Trivias mode">
                    <Button size="sm" className="bg-zx-green text-zx-ink hover:bg-zx-cyan">
                      Start
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Laberintos */}
          <motion.div {...fadeUp(0.1)}>
            <Card className="bg-zx-mid/40 border-zx-green/25 glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeySquare className="text-zx-green" /> Laberintos de exploración
                </CardTitle>
              </CardHeader>
              <CardContent className="text-zinc-300">
                Top-down 2D con puertas/llaves y conceptos ZK a encontrar y desbloquear.
                <div className="mt-4">
                  <Link href="/laberintos" aria-label="Go to Laberintos mode">
                    <Button size="sm" className="bg-zx-green text-zx-ink hover:bg-zx-cyan">
                      Start
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Simuladores */}
          <motion.div {...fadeUp(0.15)}>
            <Card className="bg-zx-mid/40 border-zx-green/25 glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LockKeyhole className="text-zx-green" /> Simuladores de descifrado
                </CardTitle>
              </CardHeader>
              <CardContent className="text-zinc-300">
                Minijuegos (César, sustitución, XOR visual) inspirados en encriptación.
                <div className="mt-4">
                  <Link href="/simuladores" aria-label="Go to Simuladores mode">
                    <Button size="sm" className="bg-zx-green text-zx-ink hover:bg-zx-cyan">
                      Start
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="how" className="container-zx py-12">
        <motion.h2 {...fadeUp(0)} className="text-2xl md:text-3xl font-mono text-zx-cyan">
          How it works
        </motion.h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <motion.div {...fadeUp(0.05)} className="rounded-xl border border-zx-green/25 bg-zx-mid/30 p-5 glow">
            <p className="font-mono text-zx-green">1. Enter</p>
            <p className="mt-2 text-zinc-300">Open the game and get into the grid.</p>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="rounded-xl border border-zx-green/25 bg-zx-mid/30 p-5 glow">
            <p className="font-mono text-zx-green">2. Choose a mode</p>
            <p className="mt-2 text-zinc-300">Trivias, Laberintos, or Simuladores.</p>
          </motion.div>

          <motion.div {...fadeUp(0.15)} className="rounded-xl border border-zx-green/25 bg-zx-mid/30 p-5 glow">
            <p className="font-mono text-zx-green">3. Complete challenges</p>
            <p className="mt-2 text-zinc-300">Beat levels and learn privacy & crypto basics.</p>
          </motion.div>
        </div>
      </section>

      <section id="features" className="container-zx py-12">
        <h2 className="text-2xl md:text-3xl font-mono text-zx-cyan">Features</h2>
        <p className="mt-2 text-zinc-400">Fast, accessible, and replayable — built for the grid.</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {/* usa nuestro Badge */}
          {/* Accesible */}
          <span className="sr-only">Feature list</span>
          {/* Si preferías import: import { Badge } from "../components/ui/badge"; */}
          {/* Pero para inline rápido: */}
          <span className="inline-flex items-center rounded-md border border-zx-green/35 px-2.5 py-1 text-xs font-mono text-zx-green bg-zx-mid/30 shadow-[0_0_10px_rgba(0,255,156,0.15)]">Accessible</span>
          <span className="inline-flex items-center rounded-md border border-zx-green/35 px-2.5 py-1 text-xs font-mono text-zx-green bg-zx-mid/30 shadow-[0_0_10px_rgba(0,255,156,0.15)]">Replayable</span>
          <span className="inline-flex items-center rounded-md border border-zx-green/35 px-2.5 py-1 text-xs font-mono text-zx-green bg-zx-mid/30 shadow-[0_0_10px_rgba(0,255,156,0.15)]">Cypherpunk UI</span>
          <span className="inline-flex items-center rounded-md border border-zx-green/35 px-2.5 py-1 text-xs font-mono text-zx-green bg-zx-mid/30 shadow-[0_0_10px_rgba(0,255,156,0.15)]">Educational</span>
          <span className="inline-flex items-center rounded-md border border-zx-green/35 px-2.5 py-1 text-xs font-mono text-zx-green bg-zx-mid/30 shadow-[0_0_10px_rgba(0,255,156,0.15)]">60 FPS</span>
          <span className="inline-flex items-center rounded-md border border-zx-green/35 px-2.5 py-1 text-xs font-mono text-zx-green bg-zx-mid/30 shadow-[0_0_10px_rgba(0,255,156,0.15)]">Low-spec friendly</span>
        </div>
      </section>

      {/* --- CAPTURAS / MOCKUPS (placeholders) --- */}
      <section id="shots" className="container-zx py-12">
        <h2 className="text-2xl md:text-3xl font-mono text-zx-cyan">Screenshots & Mockups</h2>
        <p className="mt-2 text-zinc-400">Preview the vibe. Assets are placeholders for now.</p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map((n) => (
            <div
              key={n}
              className="relative h-56 rounded-xl border border-zx-green/25 bg-zx-mid/30 glow overflow-hidden"
              role="img"
              aria-label={`Mockup ${n}`}
            >
              {/* malla/ornamento */}
              <div className="absolute inset-0 bg-[radial-gradient(transparent,rgba(0,0,0,0.35))]" />
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-mono text-zinc-400">Mockup {n}</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          ))}
        </div>
      </section>

      {/* --- ROADMAP (off-chain) --- */}
      <section id="roadmap" className="container-zx py-12">
        <h2 className="text-2xl md:text-3xl font-mono text-zx-cyan">Roadmap (off-chain)</h2>
        <ol className="mt-6 relative border-s border-zx-green/25 pl-6">
          {[
            { title: "MVP", desc: "Core modes + basic UX.", status: "done" },
            { title: "Content", desc: "More questions, mazes, and ciphers.", status: "in-progress" },
            { title: "Polishing", desc: "Animations, sounds, accessibility polish.", status: "todo" },
            { title: "On-chain integration", desc: "ZK/identity hooks & rewards.", status: "todo" },
          ].map((it, idx) => (
            <li key={idx} className="mb-6">
              <div className="absolute -left-1.5 mt-1 size-3 rounded-full
                bg-zx-green/70 ring-2 ring-zx-ink
                data-[state=todo]:bg-zinc-500 data-[state=in-progress]:bg-zx-cyan/80"
                data-state={it.status}
                aria-hidden
              />
              <p className="font-mono text-white">{it.title}</p>
              <p className="text-sm text-zinc-400">{it.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* --- TEAM & CREDITS (placeholders) --- */}
      <section id="team" className="container-zx py-12">
        <h2 className="text-2xl md:text-3xl font-mono text-zx-cyan">Team & Credits</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "Bear One", role: "PM" },
            { name: "Bear Two", role: "BizDev" },
            { name: "Bear Three", role: "Developer" },
          ].map((m, i) => (
            <article key={i} className="flex items-center gap-4 rounded-xl border border-zx-green/25 bg-zx-mid/30 p-4 glow">
              <div className="grid size-12 place-items-center rounded-full bg-zx-green/20 text-zx-green font-mono">
                {m.name.split(" ").map((s)=>s[0]).slice(0,2).join("")}
              </div>
              <div>
                <p className="font-mono text-white">{m.name}</p>
                <p className="text-sm text-zinc-400">{m.role}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm text-zinc-400">
          Credits: gameplay & content inspired by classic ciphers and privacy tooling.
        </p>
      </section>

      {/* --- CTA FINAL --- */}
      <section id="cta" className="container-zx py-16">
        <div className="rounded-2xl border border-zx-green/35 bg-gradient-to-b from-zx-mid/40 to-transparent p-8 glow">
          <h3 className="text-2xl font-mono text-white">Ready to enter the grid?</h3>
          <p className="mt-2 text-zinc-300 max-w-xl">
            Play the MVP, give feedback, and help us shape the next levels.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#modes" className="inline-flex items-center rounded-md bg-zx-green px-4 py-2 text-zx-ink hover:bg-zx-cyan transition-colors glow">
              Play now
            </a>
            <a href="https://github.com/tu-repo" target="_blank" rel="noreferrer"
              className="inline-flex items-center rounded-md border border-zx-green/35 px-4 py-2 text-white hover:border-zx-cyan/50 transition-colors">
              View repo
            </a>
          </div>
        </div>
      </section>




    </>
  );
}
