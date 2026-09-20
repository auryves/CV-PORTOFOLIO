"use client";

import * as React from "react";
import { motion } from "framer-motion";

/* ────────────────────────────────────────────────────────────────────────────
 * Surbrillance glissante.
 *
 * Le Motion Navigation Menu importe `Highlight` / `HighlightItem` depuis
 * `@/components/unlumen-ui/primitives/highlight`, un primitif qui n'était pas
 * fourni avec le composant. Reconstruit ici d'après son usage : un bloc unique
 * qui se déplace et se redimensionne sur l'élément survolé, au lieu d'un fond
 * par élément qui apparaîtrait et disparaîtrait.
 *
 * Les positions sont mesurées par différence de rectangles entre l'élément et
 * le conteneur. `offsetLeft` ne convient pas : chaque lien du menu vit dans un
 * `<li class="relative">`, qui devient son `offsetParent` — le décalage valait
 * donc zéro pour tous, et la surbrillance restait collée au premier. La mesure
 * n'a lieu qu'au survol, pas à chaque frame.
 * ──────────────────────────────────────────────────────────────────────────── */

type Rect = { left: number; top: number; width: number; height: number };

const HighlightContext = React.createContext<{
  setRect: (r: Rect | null) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
} | null>(null);

export function Highlight({
  children,
  className,
  containerClassName,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  style?: React.CSSProperties;
  // Acceptés pour rester compatible avec l'appelant, sans effet ici : le mode
  // « parent » et le pilotage par survol sont le seul comportement implémenté.
  mode?: string;
  controlledItems?: boolean;
  hover?: boolean;
}) {
  const [rect, setRect] = React.useState<Rect | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const ctx = React.useMemo(() => ({ setRect, containerRef }), []);

  return (
    <HighlightContext.Provider value={ctx}>
      <div ref={containerRef} className={containerClassName} onMouseLeave={() => setRect(null)}>
        <motion.div
          aria-hidden="true"
          className={className}
          style={{ position: "absolute", ...style }}
          initial={false}
          animate={rect ? { ...rect, opacity: 1 } : { opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.6 }}
        />
        {children}
      </div>
    </HighlightContext.Provider>
  );
}

export function HighlightItem({
  children,
  asChild,
}: {
  children: React.ReactElement;
  asChild?: boolean;
}) {
  const ctx = React.useContext(HighlightContext);

  const onEnter = (el: HTMLElement) => {
    const container = ctx?.containerRef.current;
    if (!container) return;
    const a = el.getBoundingClientRect();
    const c = container.getBoundingClientRect();
    ctx.setRect({
      left: a.left - c.left,
      top: a.top - c.top,
      width: a.width,
      height: a.height,
    });
  };

  const child = children as React.ReactElement<Record<string, unknown>>;
  const merged = {
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
      (child.props.onMouseEnter as ((e: React.MouseEvent<HTMLElement>) => void) | undefined)?.(event);
      onEnter(event.currentTarget);
    },
    // Le focus clavier déplace la surbrillance comme le survol, sinon la
    // navigation au clavier se fait sans repère visuel.
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      (child.props.onFocus as ((e: React.FocusEvent<HTMLElement>) => void) | undefined)?.(event);
      onEnter(event.currentTarget);
    },
  };

  if (asChild) return React.cloneElement(child, merged);
  return <span {...merged}>{children}</span>;
}
