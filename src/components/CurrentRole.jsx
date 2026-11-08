import { useEffect, useRef } from 'react'
import { gsap, reducedMotion } from '../motion'

/* ────────────────────────────────────────────────────────────────────────────
 * « Aujourd'hui » — le poste actuel à la BRVM, mis en avant juste après le hero.
 *
 * Trois animations, toutes pilotées par GSAP + ScrollTrigger :
 *   1. un faisceau lumineux qui parcourt la bordure de la carte (« border
 *      beam ») — pur CSS, une seule propriété animée ;
 *   2. un motif de chandeliers qui se dessine à l'entrée dans l'écran. Il est
 *      volontairement décoratif et sans axe : afficher une fausse courbe
 *      étiquetée « BRVM Composite » serait trompeur sur un profil d'analyste ;
 *   3. des compteurs sur les chiffres réels du marché (même source et même
 *      date que le reste du site).
 * ──────────────────────────────────────────────────────────────────────────── */

// Bougies décoratives : [ouverture, clôture, plus haut, plus bas] en % de hauteur.
const CANDLES = [
  [62, 55, 66, 50], [55, 58, 61, 52], [58, 50, 60, 46], [50, 53, 57, 47],
  [53, 47, 55, 42], [47, 52, 54, 44], [52, 49, 56, 46], [49, 42, 51, 38],
  [42, 46, 48, 39], [46, 40, 47, 36], [40, 35, 43, 31], [35, 39, 41, 32],
  [39, 33, 40, 29], [33, 28, 35, 24], [28, 31, 33, 25], [31, 24, 32, 20],
  [24, 21, 27, 17], [21, 25, 27, 18], [25, 18, 26, 14], [18, 14, 20, 10],
]

const FACTS = [
  { to: 8, suffix: '', label: 'Pays de l’UEMOA', dec: 0 },
  { to: 47, suffix: '', label: 'Sociétés cotées', dec: 0 },
  { to: 18700, suffix: ' Mds', label: 'FCFA de capitalisation', dec: 0 },
]

const MISSIONS = [
  'Accompagnement des entreprises candidates à la cotation',
  'Promotion du marché financier régional en Côte d’Ivoire',
  'Veille et analyse des émetteurs de la zone UEMOA',
]

function CandleChart() {
  const svg = useRef(null)
  const W = 400
  const H = 220
  const step = W / CANDLES.length
  const y = (v) => (v / 100) * H

  // Ligne de tendance passant par les clôtures.
  const trend = CANDLES.map(([, c], i) => `${i === 0 ? 'M' : 'L'}${(i + 0.5) * step},${y(c)}`).join(' ')

  useEffect(() => {
    const el = svg.current
    if (!el) return
    const bodies = el.querySelectorAll('.cc-body')
    const wicks = el.querySelectorAll('.cc-wick')
    const line = el.querySelector('.cc-trend')
    const area = el.querySelector('.cc-area')
    if (reducedMotion()) return
    const len = line.getTotalLength()
    gsap.set(line, { strokeDasharray: len, strokeDashoffset: len })
    gsap.set([...bodies, ...wicks], { scaleY: 0, transformOrigin: '50% 50%', transformBox: 'fill-box' })
    gsap.set(area, { opacity: 0 })

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' },
    })
    tl.to(wicks, { scaleY: 1, duration: 0.5, stagger: 0.035, ease: 'power2.out' })
      .to(bodies, { scaleY: 1, duration: 0.5, stagger: 0.035, ease: 'back.out(2)' }, '<0.1')
      .to(line, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, '-=0.6')
      .to(area, { opacity: 1, duration: 0.8 }, '-=0.6')

    return () => { tl.scrollTrigger?.kill(); tl.kill() }
  }, [])

  return (
    <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="cc-chart" aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id="ccArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4AF6A" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#D4AF6A" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ccLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#B57BEE" />
          <stop offset="100%" stopColor="#F0D08A" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 6" />
      ))}
      <path className="cc-area" d={`${trend} L${W - step / 2},${H} L${step / 2},${H} Z`} fill="url(#ccArea)" />
      {CANDLES.map(([o, c, hi, lo], i) => {
        // Axe inversé (0 = haut) : une clôture plus basse en % est une hausse.
        const up = c < o
        const x = (i + 0.5) * step
        const color = up ? '#4ade80' : '#f87171'
        return (
          <g key={i}>
            <line className="cc-wick" x1={x} x2={x} y1={y(lo)} y2={y(hi)} stroke={color} strokeOpacity="0.6" strokeWidth="1" />
            <rect className="cc-body" x={x - step * 0.28} width={step * 0.56} y={y(Math.min(o, c))} height={Math.max(2, y(Math.abs(o - c)))} fill={color} fillOpacity="0.75" rx="1" />
          </g>
        )
      })}
      <path className="cc-trend" d={trend} fill="none" stroke="url(#ccLine)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function Fact({ to, suffix, label }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fmt = (v) => Math.round(v).toLocaleString('fr-FR').replace(/[\u202f\u00a0]/g, ' ') + suffix
    if (reducedMotion()) { el.textContent = fmt(to); return }
    const obj = { v: 0 }
    el.textContent = fmt(0)
    const tw = gsap.to(obj, {
      v: to,
      duration: 1.8,
      ease: 'power3.out',
      onUpdate: () => { el.textContent = fmt(obj.v) },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    })
    return () => { tw.scrollTrigger?.kill(); tw.kill() }
  }, [to, suffix])
  return (
    <div className="cr-fact">
      <div ref={ref} className="serif grad-gold cr-fact-num" />
      <div className="label" style={{ marginTop: 8 }}>{label}</div>
    </div>
  )
}

export default function CurrentRole() {
  const root = useRef(null)

  useEffect(() => {
    const el = root.current
    if (!el || reducedMotion()) return
    const items = el.querySelectorAll('[data-cr-reveal]')
    const tw = gsap.from(items, {
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.08,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 75%' },
    })
    return () => { tw.scrollTrigger?.kill(); tw.kill() }
  }, [])

  return (
    <section id="aujourdhui" ref={root} className="section-pad current-role" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', position: 'relative', overflow: 'hidden' }}>
      <div className="cr-grid">
        <div>
          <div data-cr-reveal className="label-gold" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="cr-live" aria-hidden="true" />
            Aujourd’hui
          </div>
          <div data-cr-reveal className="divider" />
          <h2 data-cr-reveal className="display-lg" style={{ marginTop: 32, marginBottom: 20 }}>
            Au cœur de la <span className="grad-gold shimmer-text">BRVM</span>
          </h2>
          <p data-cr-reveal style={{ fontSize: 16, lineHeight: 1.8, color: 'rgba(255,255,255,0.5)', fontWeight: 300, marginBottom: 12 }}>
            <strong style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>Listing &amp; Market Development Analyst Intern</strong> à la Bourse Régionale des Valeurs Mobilières, au sein de l’Antenne Nationale de Bourse de Côte d’Ivoire (ANB-CI).
          </p>
          <p data-cr-reveal style={{ fontSize: 13, color: 'rgba(212,175,106,0.6)', letterSpacing: '0.06em', marginBottom: 32 }}>
            Après un stage en Equity Research chez Sika Finance
          </p>
          <ul data-cr-reveal className="cr-missions">
            {MISSIONS.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </div>

        <div data-cr-reveal className="beam-card">
          <div className="beam-card-inner">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div className="label" style={{ marginBottom: 6 }}>Bourse Régionale</div>
                <div className="serif" style={{ fontSize: 26, color: 'white', fontWeight: 400 }}>BRVM · UEMOA</div>
              </div>
              <div className="cr-badge">ANB-CI</div>
            </div>
            <CandleChart />
            <div className="cr-facts">
              {FACTS.map((f) => <Fact key={f.label} {...f} />)}
            </div>
            <div style={{ marginTop: 16, fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>
              Chiffres : BRVM / richbourse.com, lejecos.com — août 2026. Graphique décoratif.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
