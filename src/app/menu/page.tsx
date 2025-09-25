"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import MenuLayout from "@/components/Menu/MenuLayout";
import ModeGrid from "@/components/Menu/ModeGrid";
import BackButton from "../common/BackButton";
import { MODES } from "@/lib/modes";

export default function MenuPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [leaving, setLeaving] = useState(false);
  const [targetHref, setTargetHref] = useState<string | null>(null);

  const isTypingContext = (el: Element | null) => {
    if (!el) return false;
    const tag = (el as HTMLElement).tagName?.toLowerCase();
    const editable = (el as HTMLElement).isContentEditable;
    return (
      editable ||
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      (el as HTMLElement).closest?.("[role='textbox']")
    );
  };

  const handleShortcut = useCallback(
    (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingContext(document.activeElement)) return;

      const key = e.key.toLowerCase();

      if (key === "escape") {
        e.preventDefault();
        router.push("/intro");
        return;
      }

      if (["1", "2", "3"].includes(key)) {
        const idx = Number(key) - 1;
        const mode = MODES[idx];
        if (mode) {
          e.preventDefault();
          onActivate(mode.href);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, reduceMotion]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [handleShortcut]);

  const onActivate = (href: string) => {
    if (reduceMotion) {
      router.push(href);
      return;
    }
    setTargetHref(href);
    setLeaving(true);
  };

  const variants = {
    initial: { opacity: 0, y: 8, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.98 },
  };

  return (
    <MenuLayout>
      <AnimatePresence
        mode="wait"
        onExitComplete={() => {
          if (targetHref) router.push(targetHref);
        }}
      >
        {!leaving && (
          <motion.div
            key="mode-grid"
            initial={reduceMotion ? false : "initial"}
            animate={reduceMotion ? false : "animate"}
            exit={reduceMotion ? undefined : "exit"}
            transition={{ duration: 0.22, ease: "easeOut" }}
            variants={variants}
          >
            <ModeGrid onActivate={onActivate} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6">
        <BackButton />
      </div>

      <p className="mt-6 text-xs text-neutral-400">
        Usa <span className="font-mono">Tab/Shift+Tab</span> to navigate •{" "}
        <span className="font-mono">Enter</span> to select •{" "}
        <span className="font-mono">1/2/3</span> quick shortcuts •{" "}
        <span className="font-mono">Esc</span> to return
      </p>
    </MenuLayout>
  );
}
