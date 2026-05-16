import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion'
import { gsap } from 'gsap'
import { useForm, ValidationError } from '@formspree/react'
import './index.css'

// ── animation helpers ──────────────────────────────────────────────────────────
const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: isMobileDevice ? 16 : 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: isMobileDevice ? '-40px' : '-80px' },
  transition: {
    duration: isMobileDevice ? 0.5 : 0.9,
    delay: isMobileDevice ? delay * 0.4 : delay,
    ease: [0.16, 1, 0.3, 1],
  },
})

// ── scroll progress bar ────────────────────────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  return <motion.div className="scroll-progress" style={{ scaleX }} />
}

// ── magnetic hook ──────────────────────────────────────────────────────────────
function useMagnetic(strength = 0.35) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const x = e.clientX - (r.left + r.width / 2)
      const y = e.clientY - (r.top + r.height / 2)
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`
      el.style.transition = 'transform 0.1s ease'
    }
    const onLeave = () => {
      el.style.transform = ''
      el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave) }
  }, [strength])
  return ref
}

// ── animated counter ──────────────────────────────────────────────────────────
function Counter({ to, delay = 0, suffix = '' }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      setTimeout(() => {
        let start = null
        const dur = 1600
        const step = (ts) => {
          if (!start) start = ts
          const p = Math.min((ts - start) / dur, 1)
          const ease = 1 - Math.pow(1 - p, 4)
          setVal(Math.round(ease * to))
          if (p < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      }, delay)
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to, delay])
  return <span ref={ref}>{val}{suffix}</span>
}

// ── 3D tilt card ──────────────────────────────────────────────────────────────
function TiltCard({ children, style, className = '' }) {
  const el = useRef(null)
  const onMove = (e) => {
    const r = el.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.current.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) scale(1.015)`
    el.current.style.transition = 'transform 0.1s ease'
  }
  const onLeave = () => {
    el.current.style.transform = ''
    el.current.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
  }
  return (
    <div ref={el} className={`tilt-card ${className}`} style={style} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  )
}

// ── section number decoration ─────────────────────────────────────────────────
function SectionNum({ n, top = '0%', right }) {
  return (
    <motion.span
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      transition={{ duration: 1.2 }}
      className="section-num"
      style={{ top, right: right ?? '-2%', zIndex: 0 }}
    >{n}</motion.span>
  )
}

// ── magnetic button wrapper ───────────────────────────────────────────────────
function MagBtn({ href, className, children, download, style, onClick }) {
  const ref = useMagnetic(0.4)
  return (
    <div className="magnetic" ref={ref} style={{ display: 'inline-block' }}>
      <a href={href} className={className} download={download} style={style} onClick={onClick}>{children}</a>
    </div>
  )
}
// ── BRVM ticker ───────────────────────────────────────────────────────────────
// Source: brvm.org · african-markets.com · investing.com — Mai 2026
const TICKER = [
  { sym: 'BRVM Composite', val: '403.46', chg: '+16.69% YTD', up: true },
  { sym: 'BRVM 10', val: '248.52', chg: '+0.93%', up: true },
  { sym: 'SONATEL', val: '29 000', chg: '+2.10%', up: true },
  { sym: 'ORANGE CI', val: '14 660', chg: '-3.90%', up: false },
  { sym: 'BOA CI', val: '8 595', chg: '+2.38%', up: true },
  { sym: 'CORIS BANK', val: '17 000', chg: '+1.85%', up: true },
  { sym: 'SIB', val: '7 000', chg: '+0.29%', up: true },
  { sym: 'ECOBANK CI', val: '13.80', chg: '+0.48%', up: true },
  { sym: 'TOTAL CI', val: '3 100', chg: '+1.12%', up: true },
  { sym: 'NSIA Banque CI', val: '4 500', chg: '+0.45%', up: true },
  { sym: 'PALM CI', val: '6 800', chg: '+0.55%', up: true },
  { sym: 'SAPH', val: '4 200', chg: '-0.18%', up: false },
  { sym: 'CFAO CI', val: '1 050', chg: '+1.09%', up: true },
  { sym: 'S&P 500', val: '7 501', chg: '+0.77%', up: true },
]

// ── marchés africains + mondiaux de référence ─────────────────────────────────
const EXCHANGES = [
  // ── Afrique — Source: brvm.org, african-markets.com, Mai 2026 ──
  { name: 'BRVM', city: 'Abidjan', country: 'Zone UEMOA', flag: '🇨🇮', desc: '45+ titres cotés, 8 pays d\'Afrique de l\'Ouest', cap: '~7 000 Mds FCFA', idx: 'BRVM Composite · 403', featured: true },
  { name: 'JSE', city: 'Johannesburg', country: 'Afrique du Sud', flag: '🇿🇦', desc: 'Plus grande bourse africaine — 24,3 trillions ZAR de capitalisation', cap: '~1 350 Mds $', idx: 'JSE ALSI · 89 200' },
  { name: 'NGX', city: 'Lagos', country: 'Nigeria', flag: '🇳🇬', desc: 'ASI franchit 200 000 pts en mars 2026 — record historique', cap: '~117 Mds $', idx: 'NGX ASI · 200 000+' },
  { name: 'GSE', city: 'Accra', country: 'Ghana', flag: '🇬🇭', desc: 'GSE-CI franchit 15 000 pts pour la première fois en 2026', cap: '~23 Mds $', idx: 'GSE-CI · 15 185' },
  // ── Marchés mondiaux — Source: ETF Trends, investing.com, 11 Mai 2026 ──
  { name: 'NYSE', city: 'New York', country: 'États-Unis', flag: '🇺🇸', desc: 'Plus grande bourse mondiale — S&P 500, Dow Jones, NASDAQ', cap: '~30 000 Mds $', idx: 'S&P 500 · 7 501 pts', global: true },
  { name: 'LSE', city: 'Londres', country: 'Royaume-Uni', flag: '🇬🇧', desc: 'Hub financier mondial, premier marché européen coté en livre sterling', cap: '~3 800 Mds $', idx: 'FTSE 100 · 10 183 pts', global: true },
  { name: 'JPX', city: 'Tokyo', country: 'Japon', flag: '🇯🇵', desc: '3ème capitalisation mondiale — Nikkei à son plus haut historique en 2026', cap: '~6 500 Mds $', idx: 'Nikkei 225 · 61 409 pts', global: true },
  { name: 'Euronext', city: 'Paris', country: 'France', flag: '🇫🇷', desc: 'Première bourse continentale européenne, cœur de la finance de la zone euro', cap: '~3 300 Mds $', idx: 'CAC 40 · 7 957 pts', global: true },
]

// ── watchlist BRVM ────────────────────────────────────────────────────────────
const BRVM_WATCHLIST = [
  { name: 'SONATEL', sect: 'Télécoms', why: 'Leader télécoms UEMOA, dividendes stables, forte liquidité' },
  { name: 'ECOBANK CI', sect: 'Banque', why: 'Pan-africaine, exposition à 35 pays africains' },
  { name: 'TOTAL CI', sect: 'Énergie', why: 'Distribution pétrolière, croissance soutenue en CI' },
  { name: 'ORANGE CI', sect: 'Télécoms', why: 'Mobile Money (Orange Money), croissance fintech intégrée' },
  { name: 'CORIS BANK', sect: 'Banque', why: 'Banque régionale, forte expansion au Burkina et Mali' },
  { name: 'BOA CI', sect: 'Banque', why: 'Bank of Africa, réseau panafricain solide' },
]

// ── témoignages ───────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: 'Heureux de voir ta détermination dans la finance.',
    author: 'Daniel Aggré',
    role: 'Directeur · Sika Finance',
    context: 'Dédicace personnelle dans le magazine Sika Finance — Référence de l\'information financière en Côte d\'Ivoire',
    initial: 'DA',
  },
]

// ── publications LinkedIn ─────────────────────────────────────────────────────
const LINKEDIN_POSTS = [
  {
    title: 'Table Ronde Bloomfield — Assurance Vie & Fonds de Pension',
    excerpt: 'Une phrase de Stan Zézé-Bayard m\'a marqué : "Les populations voient encore l\'assurance comme une dépense, pas comme une protection." L\'éducation économique est essentielle pour construire une économie plus forte.',
    date: 'Mai 2025',
    tags: ['Assurance', 'CNPS', 'Finance africaine'],
    icon: '🏛️',
  },
  {
    title: 'Lancement de la Bloomfield Review',
    excerpt: 'Présent au lancement du premier magazine d\'intelligence économique. Échanges avec Paul-Harry Aithnard (DG Ecobank CI), José-Félix Dié (DG CGF Gestion), Steven Bédi (DG PUSH CI) et Edith Brou Bleu.',
    date: 'Avril 2025',
    tags: ['Intelligence économique', 'Networking', 'Finance CI'],
    icon: '📰',
  },
  {
    title: 'Salon de l\'Épargne, de l\'Investissement et du Patrimoine',
    excerpt: '"Épargner n\'est pas une question de montant, mais une question de réflexe." Rencontres avec Paul-Harry Aithnard (Ecobank) et Katier Bamba (DG Wave CI). Il faut oser approcher, oser poser des questions.',
    date: 'Mars 2025',
    tags: ['Épargne', 'Wave CI', 'Investissement'],
    icon: '💰',
  },
]

// ── certifications ────────────────────────────────────────────────────────────
const CERTIFICATIONS = [
  {
    title: 'Analyse des données — Kobotoolbox',
    issuer: 'British International University Abidjan',
    date: 'Avril 2026',
    badge: 'PECB · Microsoft Partner',
    color: '#B57BEE',
    icon: '📊',
    file: '/certs/kobotoolbox.pdf',
  },
  {
    title: 'Programme JA Social Equity',
    issuer: 'JA Africa · JA Worldwide · DigiFemmes CI',
    date: '28 Novembre 2025',
    badge: 'Zurich Foundation',
    color: '#D4AF6A',
    icon: '🌍',
    file: '/certs/Bedje Ahimon raphet jacques auryves.pdf',
  },
  {
    title: 'JA Digital Entrepreneurship Education',
    issuer: 'JA Deep · JA Africa',
    date: '27 Novembre 2025',
    badge: 'Certificat de Réussite',
    color: '#4ade80',
    icon: '🚀',
    file: '/certs/Certificate_of_Completion.pdf',
  },
  {
    title: 'Pack Microsoft Office Complet',
    issuer: 'Udemy — Dr. Firas · Europe Innovation',
    date: '4 Octobre 2024',
    badge: '22.5h · Débutant à Expert',
    color: '#60a5fa',
    icon: '💼',
    file: '/certs/certificat pack microsoft.pdf',
  },
  {
    title: 'Google Docs',
    issuer: 'Google Cloud · Coursera',
    date: '14 Mai 2025',
    badge: 'Course Certificate',
    color: '#4ade80',
    icon: '📝',
    file: '/certs/Coursera 6BH9WQOSCRDC.pdf',
  },
  {
    title: 'Google Sheets',
    issuer: 'Google Cloud · Coursera',
    date: '14 Mai 2025',
    badge: 'Course Certificate',
    color: '#4ade80',
    icon: '📈',
    file: '/certs/Coursera KJ1J40I8FRB5.pdf',
  },
  {
    title: 'Google Drive',
    issuer: 'Google Cloud · Coursera',
    date: '14 Mai 2025',
    badge: 'Course Certificate',
    color: '#4ade80',
    icon: '☁️',
    file: '/certs/Coursera QO8HDXXN96TT.pdf',
  },
  {
    title: 'Gmail',
    issuer: 'Google Cloud · Coursera',
    date: '14 Mai 2025',
    badge: 'Course Certificate',
    color: '#f87171',
    icon: '✉️',
    file: '/certs/Coursera ZUIGNYSR48U1.pdf',
  },
  {
    title: 'Getting Started with Microsoft Word',
    issuer: 'Coursera Project Network',
    date: '15 Mai 2025',
    badge: 'Project Certificate',
    color: '#60a5fa',
    icon: '📄',
    file: '/certs/Coursera F4I8U3R6I81G.pdf',
  },
]

// ── données ───────────────────────────────────────────────────────────────────
const TITLES = ['Fintech Builder', 'Étudiant Finance Digitale', 'Entrepreneur Fintech Africain', 'Analyste Marchés BRVM']

const PROJECTS = [
  { n: '01', name: 'My Invest', cat: 'Investissement Participatif', desc: "Plateforme permettant aux particuliers d'investir dans les TPE/PME africaines. Revenue-based financing — remboursement indexé sur les revenus quotidiens des entreprises.", tags: ['React Native', 'Supabase', 'Mobile Money', 'IA'], status: 'En développement', statusColor: '#4ade80' },
  { n: '02', name: 'My Invest Social', cat: 'Crowdfunding Solidaire', desc: "Plateforme africaine de solidarité digitale pour soutenir financièrement des personnes en urgence médicale ou sociale. Crowdfunding communautaire avec dimension virale.", tags: ['React Native', 'Mobile Money', 'Feed Social', 'IA'], status: 'En développement', statusColor: '#fb923c' },
  { n: '03', name: 'Projet Confidentiel', cat: 'Fintech · Bloomberg-style', desc: "Application mobile premium pour un leader de l'information financière africaine. Inspirée de Bloomberg et TradingView — données en temps réel pour les marchés africains.", tags: ['React Native', 'BRVM', 'Temps réel', 'Bloomberg'], status: 'Négociation en cours', statusColor: '#B57BEE', secret: true },
]

const SKILLS = [
  { cat: 'Finance & Marchés', items: [
    { name: 'Marchés financiers africains / BRVM', pct: 90 },
    { name: 'Analyse financière', pct: 85 },
    { name: 'Gestion de portefeuille', pct: 80 },
    { name: 'OPCVM & produits financiers', pct: 80 },
  ]},
  { cat: 'Analyse & Outils', items: [
    { name: 'Excel (TCD)', pct: 92 },
    { name: 'Power BI', pct: 92 },
    { name: 'Sage Comptabilité', pct: 70 },
    { name: 'Kobotoolbox', pct: 95 },
  ]},
  { cat: 'Outils Digitaux & IA', items: [
    { name: 'Lovable (No-code)', pct: 85 },
    { name: 'Claude Code (IA)', pct: 82 },
    { name: 'Canva / NotebookLM', pct: 94 },
    { name: 'React Native', pct: 80 },
  ]},
  { cat: 'Langues', items: [
    { name: 'Français — natif', pct: 100 },
    { name: 'Anglais — professionnel', pct: 58 },
  ]},
]

const TIMELINE = [
  { date: '2024 — Présent', title: 'Licence 3 Finance Digitale', sub: 'EMSP Abidjan', desc: "Spécialisation marchés financiers africains, fintech et gestion d'actifs. Suivi quotidien de la BRVM et des marchés continentaux." },
  { date: '2024', title: 'Certification Microsoft Office', sub: 'Pack Complet · Udemy', desc: 'Excel avancé, Power BI, Word, PowerPoint, Outlook — 22,5h de formation, niveau débutant à expert.' },
  { date: '2024 — 2025', title: '3 Applications Fintech', sub: 'En développement', desc: 'MY INVEST (investissement participatif), MY INVEST SOCIAL (crowdfunding solidaire) et un projet confidentiel en négociation avancée.' },
  { date: 'Mars 2025', title: "Salon de l'Épargne & de l'Investissement", sub: 'Abidjan', desc: "Rencontres avec Paul-Harry Aithnard (Ecobank CI) et Katier Bamba (DG Wave CI). « Épargner n'est pas une question de montant, mais une question de réflexe. »" },
  { date: 'Avril 2025', title: 'Lancement de la Bloomfield Review', sub: 'Bloomfield Investment Corporation', desc: "Premier magazine d'intelligence économique ivoirien. Échanges avec José-Félix Dié (CGF Gestion), Steven Bédi (PUSH CI) et Edith Brou Bleu." },
  { date: 'Mai 2025', title: 'Table Ronde Bloomfield — Assurance & Fonds de Pension', sub: 'Bloomfield Intelligence', desc: "Stan Zézé-Bayard : « Les populations voient encore l'assurance comme une dépense, pas comme une protection. » L'éducation économique est essentielle pour construire une économie plus forte." },
  { date: '2025', title: 'Partenariat Fintech Africain', sub: 'Négociation en cours', desc: "Accord avec un leader de l'information financière africaine pour développer une application Bloomberg-style dédiée aux marchés africains." },
]

const PHOTOS = [
  {
    file: 'AB X DR FELIX EDOH.jpeg',
    name: 'Dr. Félix Edoh',
    role: 'Directeur Général',
    org: 'BRVM — Bourse Régionale des Valeurs Mobilières',
    event: 'Conférence BRVM · Abidjan',
  },
  {
    file: 'AB X EDITH BROU BLEU.jpeg',
    name: 'Edith Brou Bleu',
    role: 'Journaliste & Actrice Économique',
    org: 'Médias économiques CI',
    event: 'Lancement Bloomfield Review',
  },
  {
    file: 'AB X JOSE DIE.jpeg',
    name: 'José-Félix Dié',
    role: 'Directeur Général',
    org: 'CGF Gestion — Gestion d\'Actifs',
    event: 'Lancement Bloomfield Review',
  },
  {
    file: 'AB X PAUL HARRY AITHNARD.jpeg',
    name: 'Paul-Harry Aithnard',
    role: 'DG Ecobank CI · Dir. Rég. Exécutif UEMOA',
    org: 'Ecobank — Pan-African Bank',
    event: 'Lancement Bloomfield Review',
  },
  {
    file: 'AB X STAN ZEZE.jpeg',
    name: 'Stan Zézé-Bayard',
    role: 'Directeur Général',
    org: 'Bloomfield Investment Corporation',
    event: 'Table Ronde Assurance & Fonds de Pension',
  },
  {
    file: 'AB X STEVEN BEDI.jpeg',
    name: 'Steven Bédi',
    role: 'Directeur Général',
    org: 'PUSH Côte d\'Ivoire — Fintech',
    event: 'Lancement Bloomfield Review',
  },
  {
    file: 'AB X KATIER BAMBA.jpeg',
    name: 'Katier Bamba',
    role: 'Directeur Général',
    org: 'Wave Côte d\'Ivoire — Mobile Money',
    event: 'Salon de l\'Épargne 2025',
  },
]

const DIFFERENTIATORS = [
  { icon: '📊', title: '20 ans, 3 apps en cours', desc: "Rare à cet âge : je ne théorise pas, je construis. Trois applications fintech réelles, dont une en négociation avec un leader du marché." },
  { icon: '🏛️', title: 'Dans les cercles qui comptent', desc: "Présent aux Table Rondes Bloomfield Intelligence, en contact direct avec les dirigeants de la BRVM, CGF Gestion, Ecobank, Wave CI et les acteurs clés de la finance africaine." },
  { icon: '📈', title: 'Finance + Tech = ma dualité', desc: "Je comprends les marchés ET je construis des outils pour les analyser. Cette dualité est ma valeur ajoutée dans un secteur fintech en pleine explosion." },
  { icon: '🌍', title: 'Vision continentale', desc: "Je ne vois pas seulement la BRVM — je suis NYSE, LSE, JPX, CAC 40 et l'ensemble des marchés africains. L'Afrique financière mondiale est mon terrain de jeu." },
]

// ── particles ─────────────────────────────────────────────────────────────────
const PDATA = Array.from({ length: 18 }, (_, i) => ({
  id: i, size: 1 + (i % 3),
  left: (i * 5.55) % 100,
  delay: (i * 1.2) % 20,
  dur: 14 + (i % 10),
  color: i % 4 === 0 ? '#D4AF6A' : '#B57BEE',
  opacity: 0.07 + (i % 3) * 0.04,
}))

function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {PDATA.map(p => (
        <div key={p.id} className="particle" style={{ width: p.size, height: p.size, left: `${p.left}%`, background: p.color, opacity: p.opacity, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, boxShadow: `0 0 ${p.size * 4}px ${p.color}` }} />
      ))}
    </div>
  )
}

// ── cursor — GSAP quickTo (ultra-smooth, skill-grade) ─────────────────────────
function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  useEffect(() => {
    const d = dot.current, r = ring.current
    if (!d || !r) return
    // Skip cursor on touch devices — no pointer, no point
    if (window.matchMedia('(hover: none)').matches) return
    const xDot  = gsap.quickTo(d, 'x', { duration: 0.08, ease: 'power3.out' })
    const yDot  = gsap.quickTo(d, 'y', { duration: 0.08, ease: 'power3.out' })
    const xRing = gsap.quickTo(r, 'x', { duration: 0.55, ease: 'power3.out' })
    const yRing = gsap.quickTo(r, 'y', { duration: 0.55, ease: 'power3.out' })
    gsap.set([d, r], { xPercent: -50, yPercent: -50 })
    const onMove = (e) => {
      xDot(e.clientX); yDot(e.clientY)
      xRing(e.clientX); yRing(e.clientY)
    }
    const onEnter = () => gsap.to(r, { scale: 1.6, borderColor: 'rgba(212,175,106,0.7)', duration: 0.3, ease: 'power2.out' })
    const onLeave = () => gsap.to(r, { scale: 1, borderColor: 'rgba(181,123,238,0.5)', duration: 0.4, ease: 'power2.out' })
    document.addEventListener('mousemove', onMove, { passive: true })
    document.querySelectorAll('a,button,[data-hover]').forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })
    return () => document.removeEventListener('mousemove', onMove)
  }, [])
  return (<><div ref={dot} className="cursor-dot" /><div ref={ring} className="cursor-ring" /></>)
}

// ── loader ────────────────────────────────────────────────────────────────────
function Loader({ done }) {
  return (
    <AnimatePresence>
      {!done && (
        <motion.div className="loader" exit={{ opacity: 0 }} transition={{ duration: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="loader-logo">AB</div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <div className="loader-bar" />
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            style={{ fontSize: 11, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>
            Auryves Bedje
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── BRVM ticker ───────────────────────────────────────────────────────────────
function BRVMTicker() {
  const items = [...TICKER, ...TICKER]
  return (
    <div className="brvm-ticker">
      <div className="ticker-label">
        <span style={{ color: '#D4AF6A', fontWeight: 600 }}>BRVM</span>
        <span style={{ width: 1, height: 10, background: 'rgba(255,255,255,0.2)', display: 'inline-block', margin: '0 8px' }} />
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9 }}>EN DIRECT</span>
      </div>
      <div className="ticker-scroll-wrap">
        <div className="ticker-scroll">
          {items.map((t, i) => (
            <span key={i} className="ticker-item">
              <span style={{ color: 'rgba(255,255,255,0.55)', marginRight: 6 }}>{t.sym}</span>
              <span style={{ color: 'white', fontWeight: 500, marginRight: 5 }}>{t.val}</span>
              <span style={{ color: t.up ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                {t.up ? '▲' : '▼'} {t.chg}
              </span>
              <span className="ticker-sep">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  useEffect(() => {
    const ids = ['hero', 'about', 'projects', 'marches', 'skills', 'certifications', 'networking', 'contact']
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) })
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    )
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])
  // lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  const links = [['À propos', '#about', 'about'], ['Projets', '#projects', 'projects'], ['Marchés', '#marches', 'marches'], ['Compétences', '#skills', 'skills'], ['Certifs', '#certifications', 'certifications'], ['Networking', '#networking', 'networking'], ['Contact', '#contact', 'contact']]
  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 z-50 transition-all duration-500"
        style={{
          top: 'var(--ticker-h)',
          padding: scrolled ? '10px 0' : '20px 0',
          background: scrolled || open ? 'rgba(7,7,15,0.97)' : 'linear-gradient(to bottom, rgba(7,7,15,0.85), transparent)',
          backdropFilter: scrolled || open ? 'blur(24px)' : 'none',
          borderBottom: scrolled || open ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px, 4vw, 32px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="#hero" className="serif" style={{ fontSize: 20, fontWeight: 300, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
            Auryves <span className="grad-gold">Bedje</span>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {links.map(([l, h, id]) => <a key={h} href={h} className={`nav-link${activeSection === id ? ' active' : ''}`}>{l}</a>)}
          </nav>
          <a href="#contact" className="hidden md:inline-flex btn-prim" style={{ padding: '9px 24px', fontSize: 11 }}>Contact</a>
          {/* Hamburger — large touch area */}
          <button
            onClick={() => setOpen(o => !o)}
            aria-label="Menu"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 5, width: 44, height: 44, background: 'none', border: 'none', padding: 0, cursor: 'none', flexShrink: 0 }}
            className="md:hidden"
          >
            <span style={{ display: 'block', width: 22, height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.85)', transition: 'transform .35s ease, opacity .35s ease', transform: open ? 'translateY(7px) rotate(45deg)' : '' }} />
            <span style={{ display: 'block', width: 22, height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.85)', transition: 'opacity .35s ease', opacity: open ? 0 : 1 }} />
            <span style={{ display: 'block', width: 22, height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.85)', transition: 'transform .35s ease, opacity .35s ease', transform: open ? 'translateY(-7px) rotate(-45deg)' : '' }} />
          </button>
        </div>
      </motion.header>

      {/* Mobile menu — full overlay, below header */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="mobile-menu-overlay md:hidden"
            style={{
              background: 'rgba(7,7,15,0.98)',
              backdropFilter: 'blur(24px)',
              display: 'flex',
              flexDirection: 'column',
              padding: '32px 24px 40px',
              overflowY: 'auto',
            }}
          >
            {links.map(([l, h], i) => (
              <motion.a
                key={h}
                href={h}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.055, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: 'block',
                  padding: '18px 0',
                  fontSize: 22,
                  fontWeight: 300,
                  color: 'rgba(255,255,255,0.88)',
                  textDecoration: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  letterSpacing: '0.04em',
                }}
              >
                {l}
              </motion.a>
            ))}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="btn-prim"
              style={{ marginTop: 32, padding: '14px 24px', fontSize: 13, textAlign: 'center' }}
            >
              Me contacter
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Three.js WebGL network background — desktop only ─────────────────────────
function HeroWebGL() {
  const canvas = useRef(null)
  useEffect(() => {
    const el = canvas.current
    if (!el) return
    // Skip WebGL on mobile — too heavy, causes visible jank
    if (window.matchMedia('(max-width: 768px)').matches) return
    let raf, renderer
    import('three').then((THREE) => {
      const W = el.offsetWidth, H = el.offsetHeight
      renderer = new THREE.WebGLRenderer({ canvas: el, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(W, H)
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
      camera.position.z = 5

      const N = 60
      const positions = new Float32Array(N * 3)
      const colors = new Float32Array(N * 3)
      const lavender = new THREE.Color('#B57BEE'), gold = new THREE.Color('#D4AF6A')
      const nodeData = Array.from({ length: N }, () => ({
        x: (Math.random() - 0.5) * 14,
        y: (Math.random() - 0.5) * 8,
        z: (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 0.004,
        vy: (Math.random() - 0.5) * 0.004,
      }))
      nodeData.forEach((n, i) => {
        positions[i*3] = n.x; positions[i*3+1] = n.y; positions[i*3+2] = n.z
        const c = i % 3 === 0 ? gold : lavender
        colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b
      })
      const ptGeo = new THREE.BufferGeometry()
      ptGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      ptGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      scene.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: 0.65 })))

      const linePos = []
      for (let i = 0; i < N; i++)
        for (let j = i + 1; j < N; j++) {
          const dx = nodeData[i].x - nodeData[j].x, dy = nodeData[i].y - nodeData[j].y
          if (Math.sqrt(dx*dx + dy*dy) < 2.8)
            linePos.push(nodeData[i].x, nodeData[i].y, nodeData[i].z, nodeData[j].x, nodeData[j].y, nodeData[j].z)
        }
      const lineGeo = new THREE.BufferGeometry()
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3))
      scene.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: '#B57BEE', transparent: true, opacity: 0.09 })))

      const animate = () => {
        raf = requestAnimationFrame(animate)
        nodeData.forEach((n, i) => {
          n.x += n.vx; n.y += n.vy
          if (Math.abs(n.x) > 7) n.vx *= -1
          if (Math.abs(n.y) > 4) n.vy *= -1
          positions[i*3] = n.x; positions[i*3+1] = n.y
        })
        ptGeo.attributes.position.needsUpdate = true
        scene.rotation.y += 0.0004
        renderer.render(scene, camera)
      }
      animate()

      const onResize = () => {
        const w = el.offsetWidth, h = el.offsetHeight
        camera.aspect = w / h; camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      window.addEventListener('resize', onResize)
    })
    return () => {
      cancelAnimationFrame(raf)
      renderer?.dispose()
    }
  }, [])
  return <canvas ref={canvas} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />
}

// ── hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const [titleIdx, setTitleIdx] = useState(0)
  const [text, setText] = useState('')
  const [del, setDel] = useState(false)
  const ref = useRef(null)
  // Faster reveal on mobile — halve all delays
  const mob = typeof window !== 'undefined' && window.innerWidth < 768
  const d = (v) => mob ? v * 0.5 : v
  const { scrollYProgress } = useScroll({ target: ref })
  const yAnim = useTransform(scrollYProgress, [0, 1], [0, -60])
  const opAnim = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  // Parallax désactivé sur mobile — recalcule à chaque frame de scroll sinon
  const y = mob ? 0 : yAnim
  const op = mob ? 1 : opAnim

  useEffect(() => {
    const cur = TITLES[titleIdx]
    const t = !del
      ? (text.length < cur.length ? setTimeout(() => setText(cur.slice(0, text.length + 1)), 70) : setTimeout(() => setDel(true), 2600))
      : (text.length > 0 ? setTimeout(() => setText(text.slice(0, -1)), 38) : (() => { setDel(false); setTitleIdx(i => (i + 1) % TITLES.length) })())
    return () => clearTimeout(t)
  }, [text, del, titleIdx])

  return (
    <section id="hero" ref={ref} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: 'clamp(100px, 15vw, 140px) clamp(16px, 4vw, 32px) 80px' }}>
      <HeroWebGL />
      <div className="orb" style={{ width: 500, height: 500, top: '5%', left: '-12%', background: '#B57BEE' }} />
      <div className="orb" style={{ width: 350, height: 350, bottom: '10%', right: '-8%', background: '#6C3AED', animationDelay: '3s' }} />
      <div className="orb" style={{ width: 250, height: 250, top: '40%', right: '30%', background: '#D4AF6A', animationDelay: '6s' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto' }} className="hero-grid">
        <motion.div style={{ y, opacity: op }}>
          {/* Photo circulaire mobile uniquement */}
          <div className="hero-photo-mobile">
            <img src="/photos/auryves-hero.jpeg" alt="Auryves Bedje — Fintech Builder" loading="eager" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d(0.9) }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, border: '1px solid rgba(212,175,106,0.35)', borderRadius: 2, padding: '8px 18px', marginBottom: 32, flexWrap: 'wrap', maxWidth: '100%' }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D4AF6A', lineHeight: 1.6 }}>
              Disponible pour un stage · Gestion d'actifs & Finance de marchés
            </span>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d(1) }}
            className="label" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 1, background: 'rgba(212,175,106,0.4)' }} />
            Finance Digitale · EMSP Abidjan · Côte d'Ivoire 🇨🇮
          </motion.div>

          <div style={{ overflow: 'hidden', marginBottom: 12 }}>
            <motion.h1
              initial={{ y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: mob ? 0.7 : 1, delay: d(1.1), ease: [0.16, 1, 0.3, 1] }}
              className="display-xl grad-mix" style={{ lineHeight: 0.92 }}
            >
              Auryves<br />Bedje
            </motion.h1>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d(1.8) }}
            style={{ height: 32, marginBottom: 28 }}>
            <span className="serif" style={{ fontSize: 20, fontWeight: 300, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>
              {text}<span className="tw-cursor">|</span>
            </span>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d(2.1) }}
            className="serif" style={{ fontSize: 17, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', marginBottom: 48, fontWeight: 300 }}>
            "Construire la finance africaine de demain"
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d(2.3) }}
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 64 }}>
            <MagBtn href="#projects" className="btn-prim">
              <span>Voir mes projets</span>
              <span style={{ transition: 'transform 0.3s' }} className="btn-arrow">→</span>
            </MagBtn>
            <MagBtn href="/CV-Auryves-Bedje.pdf" download className="btn-gold">
              <span>↓</span>
              <span>Télécharger mon CV</span>
            </MagBtn>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d(2.6) }}
            style={{ display: 'flex', gap: 'clamp(16px, 5vw, 40px)', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24 }}>
            {[{ v: 3, l: 'Apps fintech', num: true }, { v: 20, l: 'Ans', num: true }, { v: 'BRVM', l: '+ marchés mondiaux', num: false }].map(({ v, l, num }) => (
              <div key={l}>
                <div className="serif grad-gold" style={{ fontSize: 32, fontWeight: 300, lineHeight: 1 }}>
                  {num ? <Counter to={v} delay={2600} /> : v}
                </div>
                <div className="label" style={{ marginTop: 8, maxWidth: 160 }}>{l}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.1, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'relative', flexShrink: 0 }}
          className="hero-photo-desktop"
        >
          <div style={{ position: 'relative', width: 320 }}>
            <div style={{ position: 'absolute', inset: -16, border: '1px solid rgba(212,175,106,0.18)', borderRadius: 4, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: -8, border: '1px solid rgba(181,123,238,0.1)', borderRadius: 4, pointerEvents: 'none' }} />
            <img
              src="/photos/auryves-hero.jpeg"
              alt="Auryves Bedje — Fintech Builder, Abidjan"
              loading="eager"
              style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', objectPosition: 'top', borderRadius: 4, display: 'block', filter: 'contrast(1.02) brightness(0.96)' }}
            />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(to top, rgba(7,7,15,0.6), transparent)', borderRadius: '0 0 4px 4px' }} />
            <motion.div
              animate={{ y: [-5, 5, -5] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="glass-gold"
              style={{ position: 'absolute', bottom: -16, right: -16, padding: '12px 18px', borderRadius: 4 }}
            >
              <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(212,175,106,0.6)', textTransform: 'uppercase', marginBottom: 4 }}>Spécialiste</div>
              <div className="grad-gold serif" style={{ fontSize: 16, fontWeight: 400 }}>Marchés BRVM</div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2 }}
        style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, zIndex: 20 }}>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ width: 1, height: 32, background: 'linear-gradient(to bottom, rgba(212,175,106,0.5), transparent)' }} />
        <span className="label" style={{ fontSize: 9, letterSpacing: '0.3em' }}>Scroll</span>
      </motion.div>
    </section>
  )
}

// ── about ─────────────────────────────────────────────────────────────────────
function About() {
  return (
    <section id="about" className="section-pad" style={{ position: 'relative', overflow: 'hidden' }}>
      <SectionNum n="01" top="-8%" right="-1%" />
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 80 }}>
          <div className="label-gold" style={{ marginBottom: 20 }}>Qui suis-je</div>
          <div className="divider" />
        </motion.div>
        <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 80, alignItems: 'center' }}>
          <motion.div {...fadeUp(0.1)} style={{ position: 'relative' }}>
            <div style={{ position: 'relative', maxWidth: 340, margin: '0 auto', overflow: 'visible' }}>
              <div style={{ position: 'absolute', inset: -12, border: '1px solid rgba(212,175,106,0.2)', borderRadius: 4, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', inset: -6, border: '1px solid rgba(181,123,238,0.1)', borderRadius: 4, pointerEvents: 'none' }} />
              <img src="/photos/auryves-event.jpeg" alt="Auryves Bedje — événement finance Abidjan" loading="lazy" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 4, display: 'block' }} />
              <motion.div animate={{ y: [-6, 6, -6] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="glass-gold about-badge" style={{ position: 'absolute', bottom: -20, right: -20, padding: '14px 20px', borderRadius: 4 }}>
                <div className="label-gold" style={{ marginBottom: 4 }}>Fintech Builder</div>
                <div className="serif grad-gold" style={{ fontSize: 22, fontWeight: 300 }}>2025</div>
              </motion.div>
            </div>
          </motion.div>
          <motion.div {...fadeUp(0.2)}>
            <h2 className="display-lg" style={{ marginBottom: 28 }}>
              Bâtisseur de la <span className="grad-lav">finance digitale</span> africaine
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: 'rgba(255,255,255,0.5)', marginBottom: 36, fontWeight: 300 }}>
              Étudiant en Licence 3 de Finance Digitale à l'EMSP Abidjan. Je développe des applications fintech qui transforment les marchés financiers africains, tout en suivant au quotidien les indices de la BRVM et les places boursières du continent et du monde.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, marginBottom: 40, border: '1px solid rgba(255,255,255,0.06)' }}>
              {[['📍', 'Localisation', 'Abidjan, Cocody Riviera Palmeraie'], ['🎓', 'Formation', 'Finance Digitale — EMSP'], ['📱', 'Téléphone', '+225 01 41 56 41 16'], ['✉️', 'Email', 'auryvesb@gmail.com']].map(([, l, v]) => (
                <div key={l} style={{ padding: '20px', borderRight: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="label" style={{ marginBottom: 8 }}>{l}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="mailto:auryvesb@gmail.com" className="btn-prim">✉️ Email</a>
              <a href="https://linkedin.com/in/auryves-bedje-2981bb331" target="_blank" rel="noreferrer" className="btn-gold">💼 LinkedIn</a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ── projects ──────────────────────────────────────────────────────────────────
function Projects() {
  return (
    <section id="projects" className="section-pad" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', position: 'relative', overflow: 'hidden' }}>
      <SectionNum n="02" top="-5%" right="-1%" />
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 80 }}>
          <div className="label-gold" style={{ marginBottom: 20 }}>Ce que je construis</div>
          <div className="divider" />
          <h2 className="display-lg" style={{ marginTop: 32 }}>Mes Projets</h2>
        </motion.div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, border: '1px solid rgba(255,255,255,0.06)' }}>
          {PROJECTS.map((p) => (
            <TiltCard key={p.n} className="project-card" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden', transition: 'background 0.3s' }}>
              <div className="project-num-col" style={{ borderRight: '1px solid rgba(255,255,255,0.06)', padding: '40px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                <span className="serif grad-gold" style={{ fontSize: 14, fontWeight: 300, letterSpacing: '0.1em' }}>{p.n}</span>
              </div>
              <div className="project-body" style={{ padding: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                  <div>
                    <div className="label" style={{ marginBottom: 10, color: 'rgba(181,123,238,0.7)' }}>{p.cat}</div>
                    <h3 className="serif" style={{ fontSize: 28, fontWeight: 300, color: 'white' }}>{p.secret ? <span style={{ filter: 'blur(5px)', userSelect: 'none' }}>{p.name}</span> : p.name}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.statusColor, boxShadow: `0 0 8px ${p.statusColor}` }} />
                    <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{p.status}</span>
                  </div>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: 'rgba(255,255,255,0.45)', marginBottom: 24, fontWeight: 300, maxWidth: 600, filter: p.secret ? 'blur(3px)' : 'none' }}>{p.desc}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {p.tags.map(t => <span key={t} style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 14px', border: '1px solid rgba(181,123,238,0.2)', color: 'rgba(181,123,238,0.6)', borderRadius: 2 }}>{t}</span>)}
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── marchés africains + mondiaux ──────────────────────────────────────────────
function MarchesAfricains() {
  const african = EXCHANGES.filter(e => !e.global)
  const global = EXCHANGES.filter(e => e.global)
  return (
    <section id="marches" className="section-pad" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 80 }}>
          <div className="label-gold" style={{ marginBottom: 20 }}>Ma passion</div>
          <div className="divider" />
          <h2 className="display-lg" style={{ marginTop: 32 }}>Les Marchés Financiers</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', marginTop: 16, maxWidth: 600, fontWeight: 300, lineHeight: 1.7 }}>
            Je suis les marchés africains au quotidien, tout en me comparant aux grandes places mondiales — NYSE, LSE, Nikkei et CAC 40.
          </p>
        </motion.div>

        {/* Bourses africaines */}
        <div style={{ marginBottom: 64 }}>
          <motion.div {...fadeUp(0.05)} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="label">🌍 Bourses africaines</div>
            <div className="divider-gold" />
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 1, border: '1px solid rgba(255,255,255,0.06)' }}>
            {african.map((ex, i) => (
              <ExchangeCard key={ex.name} ex={ex} i={i} />
            ))}
          </div>
        </div>

        {/* Marchés mondiaux de référence */}
        <div style={{ marginBottom: 80 }}>
          <motion.div {...fadeUp(0.05)} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="label">🌐 Marchés mondiaux de référence</div>
            <div style={{ width: 60, height: 1, background: 'linear-gradient(90deg, transparent, rgba(181,123,238,0.4), transparent)' }} />
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 1, border: '1px solid rgba(181,123,238,0.08)' }}>
            {global.map((ex, i) => (
              <ExchangeCard key={ex.name} ex={ex} i={i + african.length} />
            ))}
          </div>
        </div>

        {/* Watchlist */}
        <div>
          <motion.div {...fadeUp(0.1)} style={{ marginBottom: 32 }}>
            <div className="label" style={{ marginBottom: 16 }}>Ma watchlist BRVM — Valeurs suivies</div>
            <div className="divider-gold" />
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1, border: '1px solid rgba(255,255,255,0.06)' }}>
            {BRVM_WATCHLIST.map((v, i) => (
              <motion.div key={v.name} {...fadeUp(i * 0.08)}
                style={{ padding: '24px 28px', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', transition: 'background 0.3s' }}
                whileHover={{ backgroundColor: 'rgba(181,123,238,0.05)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span className="serif" style={{ fontSize: 20, fontWeight: 400, color: 'white' }}>{v.name}</span>
                  <span style={{ fontSize: 10, padding: '4px 10px', border: '1px solid rgba(181,123,238,0.25)', color: 'rgba(181,123,238,0.7)', borderRadius: 2, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{v.sect}</span>
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, fontWeight: 300 }}>{v.why}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp(0.3)} className="glass-gold" style={{ marginTop: 24, padding: '28px 32px', borderRadius: 4, borderLeft: '2px solid rgba(212,175,106,0.5)' }}>
            <div className="label-gold" style={{ marginBottom: 12 }}>Ma conviction — BRVM 2025</div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, fontWeight: 300, maxWidth: 800 }}>
              "La BRVM reste sous-valorisée par rapport aux marchés émergents mondiaux. Avec la digitalisation des services financiers en Afrique de l'Ouest et la croissance du Mobile Money, les valeurs télécoms (SONATEL, ORANGE CI) et les banques régionales constituent selon moi les meilleurs vecteurs de performance à moyen terme."
            </p>
            <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(212,175,106,0.5)', letterSpacing: '0.1em' }}>— Auryves Bedje, Étudiant Finance Digitale · EMSP Abidjan</div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function ExchangeCard({ ex, i }) {
  return (
    <motion.div {...fadeUp(i * 0.07)}
      style={{
        padding: '24px',
        background: ex.featured ? 'rgba(212,175,106,0.05)' : ex.global ? 'rgba(181,123,238,0.03)' : 'rgba(255,255,255,0.02)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        transition: 'background 0.3s',
      }}
      whileHover={{ backgroundColor: ex.featured ? 'rgba(212,175,106,0.09)' : ex.global ? 'rgba(181,123,238,0.08)' : 'rgba(181,123,238,0.05)' }}
    >
      {ex.featured && (
        <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#D4AF6A', border: '1px solid rgba(212,175,106,0.4)', padding: '3px 8px', borderRadius: 2 }}>
          Primaire
        </div>
      )}
      {ex.global && (
        <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(181,123,238,0.7)', border: '1px solid rgba(181,123,238,0.25)', padding: '3px 8px', borderRadius: 2 }}>
          Mondial
        </div>
      )}
      <div style={{ fontSize: 28, marginBottom: 10 }}>{ex.flag}</div>
      <div className="serif" style={{ fontSize: 22, fontWeight: 400, color: ex.featured ? '#D4AF6A' : 'white', marginBottom: 4 }}>{ex.name}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 10, letterSpacing: '0.05em' }}>{ex.city} · {ex.country}</div>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 10, fontWeight: 300 }}>{ex.desc}</p>
      <div style={{ fontSize: 11, color: 'rgba(212,175,106,0.6)', letterSpacing: '0.05em', marginBottom: 4 }}>Cap. : {ex.cap}</div>
      {ex.idx && <div style={{ fontSize: 11, color: ex.global ? 'rgba(181,123,238,0.7)' : 'rgba(212,175,106,0.5)', letterSpacing: '0.04em' }}>↗ {ex.idx}</div>}
    </motion.div>
  )
}

// ── "pourquoi moi" ────────────────────────────────────────────────────────────
function PourquoiMoi() {
  return (
    <section className="section-pad" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(181,123,238,0.02)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 80, textAlign: 'center' }}>
          <div className="label-gold" style={{ marginBottom: 20 }}>Ma valeur ajoutée</div>
          <div className="divider" style={{ maxWidth: 200, margin: '0 auto' }} />
          <h2 className="display-lg" style={{ marginTop: 32 }}>Pourquoi moi ?</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', marginTop: 16, fontWeight: 300 }}>
            Ce qui me différencie à 20 ans dans l'écosystème fintech africain
          </p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 1, border: '1px solid rgba(255,255,255,0.06)' }}>
          {DIFFERENTIATORS.map((d, i) => (
            <motion.div key={d.title} {...fadeUp(i * 0.1)}
              style={{ padding: '40px 32px', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)', transition: 'background 0.3s' }}
              whileHover={{ backgroundColor: 'rgba(181,123,238,0.06)' }}
            >
              <div style={{ fontSize: 36, marginBottom: 20 }}>{d.icon}</div>
              <h3 className="serif" style={{ fontSize: 20, fontWeight: 400, color: 'white', marginBottom: 16, lineHeight: 1.3 }}>{d.title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, fontWeight: 300 }}>{d.desc}</p>
            </motion.div>
          ))}
        </div>
        <motion.div {...fadeUp(0.4)} style={{ marginTop: 48, padding: '32px 40px', border: '1px solid rgba(212,175,106,0.2)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, background: 'rgba(212,175,106,0.03)' }}>
          <div>
            <div className="label-gold" style={{ marginBottom: 8 }}>Objectif 2025</div>
            <div className="serif" style={{ fontSize: 24, fontWeight: 300, color: 'white', marginBottom: 6 }}>Stage en Gestion d'Actifs / Analyse Financière</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>CGF Gestion · Sika Finance · BRVM · Bloomfield · Toute structure de la finance africaine</div>
          </div>
          <a href="#contact" className="btn-gold" style={{ flexShrink: 0 }}>Me contacter →</a>
        </motion.div>
      </div>
    </section>
  )
}

// ── témoignages ───────────────────────────────────────────────────────────────
function Testimonials() {
  return (
    <section id="temoignages" className="section-pad" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 80 }}>
          <div className="label-gold" style={{ marginBottom: 20 }}>Ce qu'ils disent</div>
          <div className="divider" />
          <h2 className="display-lg" style={{ marginTop: 32 }}>Témoignages</h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i} {...fadeUp(i * 0.12)}
              className="glass"
              style={{ padding: '36px', borderRadius: 4, position: 'relative', overflow: 'hidden' }}
              whileHover={{ borderColor: 'rgba(212,175,106,0.25)' }}
            >
              {/* grand guillemet décoratif */}
              <div style={{ position: 'absolute', top: 16, right: 24, fontSize: 80, fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, color: 'rgba(212,175,106,0.08)', lineHeight: 1, pointerEvents: 'none' }}>"</div>

              <div style={{ fontSize: 24, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 300, marginBottom: 24, lineHeight: 1.5, color: 'rgba(255,255,255,0.75)', position: 'relative', zIndex: 1 }}>
                "{t.quote}"
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* initiales */}
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(181,123,238,0.2), rgba(212,175,106,0.2))', border: '1px solid rgba(212,175,106,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#D4AF6A', letterSpacing: '0.05em' }}>{t.initial}</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginBottom: 3 }}>{t.author}</div>
                  <div style={{ fontSize: 11, color: '#D4AF6A', letterSpacing: '0.06em', marginBottom: 4 }}>{t.role}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>{t.context}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── skills ────────────────────────────────────────────────────────────────────
function Bar({ name, pct, delay }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setOn(true) }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 300 }}>{name}</span>
        <span style={{ fontSize: 12, color: '#B57BEE', letterSpacing: '0.05em' }}>{pct}%</span>
      </div>
      <div className="skill-track">
        <div className={`skill-fill ${on ? 'on' : ''}`} style={{ width: `${pct}%`, transitionDelay: `${delay}s` }} />
      </div>
    </div>
  )
}

function Skills() {
  return (
    <section id="skills" className="section-pad" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', position: 'relative', overflow: 'hidden' }}>
      <SectionNum n="03" top="-5%" right="-1%" />
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 80 }}>
          <div className="label-gold" style={{ marginBottom: 20 }}>Mon expertise</div>
          <div className="divider" />
          <h2 className="display-lg" style={{ marginTop: 32 }}>Compétences</h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48 }}>
          {SKILLS.map((s, si) => (
            <motion.div key={s.cat} {...fadeUp(si * 0.1)}>
              <div style={{ marginBottom: 32 }}>
                <div className="label" style={{ marginBottom: 12 }}>{s.cat}</div>
                <div className="divider-gold" />
              </div>
              {s.items.map((it, ii) => <Bar key={it.name} name={it.name} pct={it.pct} delay={ii * 0.12} />)}
            </motion.div>
          ))}
        </div>
        <motion.div {...fadeUp(0.3)} style={{ marginTop: 64, paddingTop: 48, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="label" style={{ marginBottom: 24 }}>Qualités personnelles</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {["Sens de l'initiative", "Esprit d'équipe", 'Adaptabilité', 'Rigueur', 'Motivation', 'Curiosité intellectuelle'].map(q => (
              <span key={q} className="glass" style={{ padding: '10px 20px', borderRadius: 2, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{q}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── CV ────────────────────────────────────────────────────────────────────────
function CVSection() {
  return (
    <section id="cv" className="section-pad" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 80 }}>
          <div className="label-gold" style={{ marginBottom: 20 }}>Mon dossier</div>
          <div className="divider" />
          <h2 className="display-lg" style={{ marginTop: 32 }}>Curriculum Vitae</h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48 }}>
          <motion.div {...fadeUp(0.1)} className="cv-section">
            <div className="label" style={{ marginBottom: 16 }}>Profil</div>
            <p style={{ fontSize: 14, lineHeight: 1.9, color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>
              Étudiant en Licence 3 de Finance Digitale à l'EMSP Abidjan. Je souhaite effectuer un stage en gestion d'actifs et analyse de marchés financiers, notamment la BRVM. Motivé, rigoureux, passionné par les marchés boursiers africains et la fintech.
            </p>
          </motion.div>
          <motion.div {...fadeUp(0.15)} className="cv-section">
            <div className="label" style={{ marginBottom: 20 }}>Formation & Certifications</div>
            <div style={{ marginBottom: 20 }}>
              <div className="serif" style={{ fontSize: 17, fontWeight: 400, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>Licence 3 Finance Digitale</div>
              <div style={{ fontSize: 13, color: '#D4AF6A', marginBottom: 4 }}>EMSP Abidjan — En cours</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Abidjan, Cocody Riviera Palmeraie</div>
            </div>
            <div>
              <div className="serif" style={{ fontSize: 17, fontWeight: 400, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>Pack Certification Microsoft Office</div>
              <div style={{ fontSize: 13, color: '#D4AF6A' }}>Excel · Power BI · Word · PowerPoint · Outlook</div>
            </div>
          </motion.div>
          <motion.div {...fadeUp(0.2)} className="cv-section">
            <div className="label" style={{ marginBottom: 20 }}>Langues</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
              {[['Français', 'Langue maternelle', 100], ['Anglais', 'Intermédiaire', 55]].map(([l, n, p]) => (
                <div key={l}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{l}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>{n}</span>
                  </div>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }}>
                    <div style={{ height: 1, background: 'linear-gradient(90deg, #B57BEE, #D4AF6A)', width: `${p}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="label" style={{ marginBottom: 16 }}>Centres d'intérêt</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Marchés financiers', 'BRVM', 'Lecture économique', 'Veille technologique', 'Entrepreneuriat'].map(c => (
                <span key={c} style={{ fontSize: 11, padding: '6px 12px', border: '1px solid rgba(212,175,106,0.2)', color: 'rgba(212,175,106,0.7)', borderRadius: 2 }}>{c}</span>
              ))}
            </div>
          </motion.div>
        </div>
        <motion.div {...fadeUp(0.3)} style={{ marginTop: 64, paddingTop: 48, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div className="display-md" style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 8 }}>Télécharger le CV complet</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Format PDF · Auryves Bedje 2025</div>
          </div>
          <a href="/CV-Auryves-Bedje.pdf" download className="btn-gold">↓ &nbsp;Télécharger PDF</a>
        </motion.div>
      </div>
    </section>
  )
}

// ── certifications ────────────────────────────────────────────────────────────
function Certifications() {
  const scrollRef = useRef(null)
  const paused = useRef(false)
  const rafRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // Auto-scroll désactivé sur mobile — les utilisateurs swipent naturellement
    if (window.matchMedia('(max-width: 768px)').matches) return
    let pos = 0
    const speed = 0.5
    const animate = () => {
      if (!paused.current && el) {
        pos += speed
        if (pos >= el.scrollWidth / 2) pos = 0
        el.scrollLeft = pos
      }
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const items = [...CERTIFICATIONS, ...CERTIFICATIONS]

  return (
    <section id="certifications" className="section-pad" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 60 }}>
          <div className="label-gold" style={{ marginBottom: 20 }}>Mes accréditations</div>
          <div className="divider" />
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginTop: 32 }}>
            <h2 className="display-lg">Certifications</h2>
            <div className="label" style={{ color: 'rgba(255,255,255,0.25)' }}>{CERTIFICATIONS.length} certificats · Cliquer pour télécharger</div>
          </div>
        </motion.div>

        {/* Carousel auto-scroll */}
        <div
          ref={scrollRef}
          onMouseEnter={() => { paused.current = true }}
          onMouseLeave={() => { paused.current = false }}
          style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: 4 }}
        >
          {items.map((c, i) => (
            <a
              key={i}
              href={c.file}
              target="_blank"
              rel="noreferrer"
              style={{ flexShrink: 0, width: 260, textDecoration: 'none', display: 'block' }}
            >
              <motion.div
                whileHover={{ translateY: -4, borderColor: c.color.replace(')', ', 0.5)').replace('rgb', 'rgba') }}
                style={{
                  padding: '28px 24px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 4,
                  height: '100%',
                  transition: 'border-color 0.3s, transform 0.3s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* barre colorée en haut */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: c.color, opacity: 0.6 }} />

                <div style={{ fontSize: 28, marginBottom: 16 }}>{c.icon}</div>

                <div style={{ fontSize: 14, fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, color: 'rgba(255,255,255,0.85)', marginBottom: 8, lineHeight: 1.4 }}>
                  {c.title}
                </div>

                <div style={{ fontSize: 11, color: c.color, letterSpacing: '0.06em', marginBottom: 6, opacity: 0.9 }}>
                  {c.issuer}
                </div>

                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                  {c.date}
                </div>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 10px', border: `1px solid ${c.color}40`, color: c.color, borderRadius: 2, opacity: 0.8 }}>
                  {c.badge}
                </div>

                {/* icône téléchargement */}
                <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 12, color: 'rgba(255,255,255,0.15)' }}>↗</div>
              </motion.div>
            </a>
          ))}
        </div>

        {/* Compteur */}
        <motion.div {...fadeUp(0.3)} style={{ marginTop: 32, display: 'flex', gap: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
          {[['9', 'Certificats obtenus'], ['3', 'Plateformes (Udemy · Coursera · JA)'], ['2026', 'Dernière certification']].map(([v, l]) => (
            <div key={l}>
              <div className="serif grad-gold" style={{ fontSize: 28, fontWeight: 300, lineHeight: 1 }}>{v}</div>
              <div className="label" style={{ marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── timeline ──────────────────────────────────────────────────────────────────
function Timeline() {
  return (
    <section id="timeline" className="section-pad" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 80 }}>
          <div className="label-gold" style={{ marginBottom: 20 }}>Mon histoire</div>
          <div className="divider" />
          <h2 className="display-lg" style={{ marginTop: 32 }}>Parcours</h2>
        </motion.div>
        {TIMELINE.map((t, i) => (
          <motion.div key={i} {...fadeUp(i * 0.12)} className="tl-item" style={{ marginBottom: 40 }}>
            <div className="tl-dot" />
            <div className="glass" style={{ padding: '28px 32px', borderRadius: 4, marginLeft: 8 }}>
              <div className="label" style={{ marginBottom: 8 }}>{t.date}</div>
              <div className="serif" style={{ fontSize: 22, fontWeight: 300, color: 'white', marginBottom: 6 }}>{t.title}</div>
              <div style={{ fontSize: 13, color: '#D4AF6A', marginBottom: 12 }}>{t.sub}</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, fontWeight: 300 }}>{t.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ── networking (carousel) ─────────────────────────────────────────────────────
function Networking() {
  const scrollRef = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)
  const paused = useRef(false)
  const rafRef = useRef(null)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })

    // Auto-scroll désactivé sur mobile — swipe natif
    if (window.matchMedia('(max-width: 768px)').matches) return
    let pos = 0
    const speed = 0.6
    const animate = () => {
      if (!paused.current && el) {
        pos += speed
        if (pos >= el.scrollWidth / 2) pos = 0
        el.scrollLeft = pos
      }
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      el.removeEventListener('scroll', checkScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [checkScroll])

  const scroll = dir => {
    paused.current = true
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })
    setTimeout(() => { paused.current = false }, 3000)
  }

  const orgMap = {
    'Dr. Félix Edoh': 'Directeur Général de la BRVM (Bourse Régionale des Valeurs Mobilières de l\'Afrique de l\'Ouest)',
    'Edith Brou Bleu': 'Journaliste spécialisée en économie, actrice des médias économiques en Côte d\'Ivoire',
    'José-Félix Dié': 'Directeur Général de CGF Gestion, société de gestion d\'actifs de premier plan en CI',
    'Paul-Harry Aithnard': 'Directeur Général d\'Ecobank Côte d\'Ivoire et Directeur Régional Exécutif de la zone UEMOA',
    'Stan Zézé-Bayard': 'Directeur Général de Bloomfield Investment Corporation, première agence de notation africaine',
    'Steven Bédi': 'Directeur Général de PUSH Côte d\'Ivoire, acteur majeur de la fintech ivoirienne',
    'Katier Bamba': 'Directeur Général de Wave Côte d\'Ivoire, leader du Mobile Money en Afrique de l\'Ouest',
  }

  return (
    <section id="networking" className="section-pad" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 60 }}>
          <div className="label-gold" style={{ marginBottom: 20 }}>Mes connexions</div>
          <div className="divider" />
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginTop: 32 }}>
            <h2 className="display-lg">Dans les cercles<br />de la finance africaine</h2>
            <div style={{ display: 'flex', gap: 12 }}>
              <motion.button
                onClick={() => scroll(-1)}
                disabled={!canLeft}
                whileHover={canLeft ? { scale: 1.05 } : {}}
                whileTap={canLeft ? { scale: 0.95 } : {}}
                className="carousel-btn"
                style={{ opacity: canLeft ? 1 : 0.25 }}
              >
                ←
              </motion.button>
              <motion.button
                onClick={() => scroll(1)}
                disabled={!canRight}
                whileHover={canRight ? { scale: 1.05 } : {}}
                whileTap={canRight ? { scale: 0.95 } : {}}
                className="carousel-btn"
                style={{ opacity: canRight ? 1 : 0.25 }}
              >
                →
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div
          ref={scrollRef}
          onMouseEnter={() => { paused.current = true }}
          onMouseLeave={() => { paused.current = false }}
          style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: 8 }}
        >
          {[...PHOTOS, ...PHOTOS].map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              style={{ flexShrink: 0, width: 280 }}
            >
              <div className="photo-card" style={{ aspectRatio: '3/4', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 0 }}>
                <img src={`/photos/${p.file}`} alt={`Auryves Bedje avec ${p.name} — ${p.event}`} loading="lazy" />
                <div className="photo-info">
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#D4AF6A', letterSpacing: '0.06em', marginBottom: 6 }}>{p.role}</div>
                  <div style={{ fontSize: 11, color: 'rgba(181,123,238,0.8)', letterSpacing: '0.04em', marginBottom: 6 }}>{p.org}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>📍 {p.event}</div>
                </div>
              </div>
              {/* Fiche sous la photo */}
              <div style={{ marginTop: 12, padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#D4AF6A', marginBottom: 6 }}>{p.org}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>{orgMap[p.name] || p.role}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Organisations */}
        <motion.div {...fadeUp(0.4)} style={{ marginTop: 48, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {['Bloomfield Intelligence', 'BRVM', 'CGF Gestion', 'Ecobank', 'Wave CI', "Table Ronde Intelligence Éco.", 'CNPS', 'PUSH CI'].map(o => (
            <span key={o} className="glass" style={{ padding: '8px 18px', borderRadius: 2, fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{o}</span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── publications LinkedIn ─────────────────────────────────────────────────────
function Publications() {
  return (
    <section id="publications" className="section-pad" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(212,175,106,0.015)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 64 }}>
          <div className="label-gold" style={{ marginBottom: 20 }}>Présence digitale</div>
          <div className="divider" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginTop: 32 }}>
            <h2 className="display-lg">Publications LinkedIn</h2>
            <a href="https://linkedin.com/in/auryves-bedje-2981bb331" target="_blank" rel="noreferrer" className="btn-gold" style={{ padding: '10px 24px', fontSize: 11 }}>
              Voir le profil →
            </a>
          </div>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 1, border: '1px solid rgba(255,255,255,0.06)' }}>
          {LINKEDIN_POSTS.map((post, i) => (
            <motion.div key={i} {...fadeUp(i * 0.1)}
              style={{ padding: '36px 32px', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)', transition: 'background 0.3s', position: 'relative', overflow: 'hidden' }}
              whileHover={{ backgroundColor: 'rgba(181,123,238,0.04)' }}
            >
              <div style={{ position: 'absolute', top: 20, right: 20, fontSize: 28 }}>{post.icon}</div>
              <div className="label" style={{ marginBottom: 16, color: 'rgba(212,175,106,0.6)' }}>{post.date}</div>
              <h3 className="serif" style={{ fontSize: 20, fontWeight: 300, color: 'white', marginBottom: 16, lineHeight: 1.4, paddingRight: 40 }}>{post.title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, marginBottom: 20, fontStyle: 'italic' }}>
                "{post.excerpt}"
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {post.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 10px', border: '1px solid rgba(212,175,106,0.2)', color: 'rgba(212,175,106,0.6)', borderRadius: 2 }}>{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── contact ───────────────────────────────────────────────────────────────────
function Contact() {
  const [state, handleSubmit] = useForm('mwvzevdv')
  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, padding: '14px 18px', color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, outline: 'none', transition: 'border-color 0.3s' }
  const errStyle = { fontSize: 11, color: '#f87171', marginTop: 6, letterSpacing: '0.04em' }
  return (
    <section id="contact" className="section-pad" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 80 }}>
          <div className="label-gold" style={{ marginBottom: 20 }}>Parlons ensemble</div>
          <div className="divider" />
          <h2 className="display-lg" style={{ marginTop: 32 }}>Travaillons Ensemble</h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64 }}>
          <motion.div {...fadeUp(0.1)}>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.4)', fontWeight: 300, marginBottom: 48 }}>
              Un projet fintech, une opportunité de stage en gestion d'actifs, ou simplement envie d'échanger sur les marchés africains ? Je suis disponible.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                { l: 'Email', v: 'auryvesb@gmail.com', h: 'mailto:auryvesb@gmail.com' },
                { l: 'WhatsApp', v: '+225 01 41 56 41 16', h: 'https://wa.me/2250141564116' },
                { l: 'LinkedIn', v: 'Auryves Bedje', h: 'https://linkedin.com/in/auryves-bedje-2981bb331' },
                { l: 'Localisation', v: 'Abidjan, Cocody Riviera Palmeraie', h: null },
              ].map(c => (
                <div key={c.l} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 20 }}>
                  <div className="label" style={{ marginBottom: 8 }}>{c.l}</div>
                  {c.h ? <a href={c.h} target={c.h.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                    style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
                    onMouseEnter={e => e.target.style.color = '#B57BEE'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
                  >{c.v}</a> : <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{c.v}</span>}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 32 }}>
              <a href="https://wa.me/2250141564116" target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 28px', borderRadius: 2, background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', color: 'rgba(37,211,102,0.8)', textDecoration: 'none', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
                💬 &nbsp;Message WhatsApp direct
              </a>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.2)} className="glass contact-glass" style={{ padding: '48px', borderRadius: 4 }}>
            <div className="label" style={{ marginBottom: 32 }}>Envoyer un message</div>

            {state.succeeded ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', padding: '48px 0' }}
              >
                <div style={{ fontSize: 40, marginBottom: 20 }}>✓</div>
                <div className="serif" style={{ fontSize: 22, fontWeight: 300, color: 'rgba(255,255,255,0.85)', marginBottom: 12 }}>Message envoyé !</div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>Je te réponds dans les plus brefs délais.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div className="label" style={{ marginBottom: 10 }}>Votre nom</div>
                  <input type="text" name="name" required placeholder="John Doe" style={inputStyle} />
                  <ValidationError field="name" errors={state.errors} style={errStyle} />
                </div>
                <div>
                  <div className="label" style={{ marginBottom: 10 }}>Votre email</div>
                  <input type="email" name="email" required placeholder="john@exemple.com" style={inputStyle} />
                  <ValidationError field="email" errors={state.errors} style={errStyle} />
                </div>
                <div>
                  <div className="label" style={{ marginBottom: 10 }}>Votre message</div>
                  <textarea name="message" rows={5} required placeholder="Bonjour Auryves..." style={{ ...inputStyle, resize: 'none' }} />
                  <ValidationError field="message" errors={state.errors} style={errStyle} />
                </div>
                <ValidationError errors={state.errors} style={errStyle} />
                <motion.button
                  type="submit"
                  disabled={state.submitting}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  className="btn-prim"
                  style={{ justifyContent: 'center', marginTop: 8, opacity: state.submitting ? 0.7 : 1 }}
                >
                  {state.submitting ? 'Envoi en cours…' : 'Envoyer →'}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ── footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const navLinks = [['À propos', '#about'], ['Projets', '#projects'], ['Marchés', '#marches'], ['Compétences', '#skills'], ['Networking', '#networking'], ['Contact', '#contact']]
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '64px 32px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 48 }}>
          <div>
            <div className="serif grad-mix" style={{ fontSize: 32, fontWeight: 300, letterSpacing: '0.1em', marginBottom: 16 }}>Auryves Bedje</div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.7, fontWeight: 300, maxWidth: 240 }}>
              Étudiant Finance Digitale · EMSP Abidjan · Fintech Builder · Analyste BRVM
            </p>
          </div>
          <div>
            <div className="label" style={{ marginBottom: 20 }}>Navigation</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {navLinks.map(([l, h]) => (
                <a key={l} href={h} className="nav-link" style={{ fontSize: 13 }}>{l}</a>
              ))}
            </div>
          </div>
          <div>
            <div className="label" style={{ marginBottom: 20 }}>Contact</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[['✉️ Email', 'mailto:auryvesb@gmail.com'], ['💬 WhatsApp', 'https://wa.me/2250141564116'], ['💼 LinkedIn', 'https://linkedin.com/in/auryves-bedje-2981bb331']].map(([l, h]) => (
                <a key={l} href={h} target={h.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                  style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.3s' }}
                  onMouseEnter={e => e.target.style.color = '#B57BEE'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
                >{l}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="divider" />
        <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <p className="label" style={{ color: 'rgba(255,255,255,0.2)' }}>© 2026 · Abidjan, Côte d'Ivoire</p>
          <p className="label" style={{ color: 'rgba(255,255,255,0.15)' }}>Construire la finance africaine de demain 🌍</p>
        </div>
      </div>
    </footer>
  )
}

// ── whatsapp floating button ──────────────────────────────────────────────────
function WhatsAppFloat() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href="https://wa.me/2250141564116"
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.95 }}
          title="Message WhatsApp"
          className="float-wa"
          style={{
            position: 'fixed', bottom: 88, right: 32, width: 48, height: 48,
            borderRadius: '50%', background: 'rgba(37,211,102,0.12)',
            border: '1px solid rgba(37,211,102,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, zIndex: 41,
            boxShadow: '0 4px 24px rgba(37,211,102,0.18)',
            textDecoration: 'none',
          }}
        >
          💬
        </motion.a>
      )}
    </AnimatePresence>
  )
}

// ── back to top ───────────────────────────────────────────────────────────────
function BackToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="glass-gold float-top"
          style={{ position: 'fixed', bottom: 32, right: 32, width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'none', zIndex: 40, fontSize: 16 }}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  )
}

// ── app ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const delay = window.matchMedia('(max-width: 768px)').matches ? 1400 : 2400
    const t = setTimeout(() => setLoaded(true), delay)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="site-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      <Loader done={loaded} />
      <Cursor />
      <Particles />
      <ScrollProgress />
      <AnimatePresence>
        {loaded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <BRVMTicker />
            <Navbar />
            <main>
              <Hero />
              <About />
              <Projects />
              <MarchesAfricains />
              <PourquoiMoi />
              <Testimonials />
              <Skills />
              <CVSection />
              <Certifications />
              <Timeline />
              <Networking />
              <Publications />
              <Contact />
            </main>
            <Footer />
            <WhatsAppFloat />
            <BackToTop />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
