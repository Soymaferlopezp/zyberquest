export type ModeAccent = "green" | "cyan" | "magenta";

export type Mode = {
  id: "trivias" | "laberintos" | "simuladores";
  title: string;
  desc: string;
  href: string;
  accent: ModeAccent;
};

export const MODES: Mode[] = [
  {
    id: "trivias",
    title: "Trivias educativas",
    desc: "Responde preguntas del ecosistema Zcash con tooltips explicativos.",
    href: "/trivias",
    accent: "green",
  },
  {
    id: "laberintos",
    title: "Laberintos de exploración",
    desc: "Explora nodos, reúne llaves y desbloquea puertas conceptuales de ZK.",
    href: "/laberintos",
    accent: "cyan",
  },
  {
    id: "simuladores",
    title: "Simuladores de descifrado",
    desc: "Rompe cifrados (César, sustitución, XOR visual) contra reloj.",
    href: "/simuladores",
    accent: "magenta",
  },
];
