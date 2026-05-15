import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import './index.css'

// ── fade-up variant ────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] },
})
const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.9, delay },
})

// ── data ───────────────────────────────────────────────────────────────────────
const TITLES = ['Fintech Builder', 'Digital Finance Student', 'African FinTech Entrepreneur']

const PROJECTS = [
  {
    n: '01', name: 'My Invest', cat: 'Investissement Participatif',
    desc: "Plateforme permettant aux particuliers d'investir dans les TPE/PME africaines. Remboursement basé sur les revenus quotidiens des entreprises — revenue-based financing nouvelle génération.",
    tags: ['React Native', 'Supabase', 'Mobile Money', 'IA'],
    status: 'En développement', statusColor: '#4ade80',
  },
  {
    n: '02', name: 'My Invest Social', cat: 'Crowdfunding Solidaire',
    desc: "Plateforme africaine de solidarité digitale pour soutenir financièrement et émotionnellement des personnes en urgence médicale ou sociale. Crowdfunding communautaire.",
    tags: ['React Native', 'Mobile Money', 'Feed Social', 'IA'],
    status: 'En développement', statusColor: '#fb923c',
  },
  {
    n: '03', name: 'Projet Confidentiel', cat: 'Fintech · Bloomberg-style',
    desc: "Application mobile premium pour un leader de l'information financière africaine. Inspirée de Bloomberg et TradingView — pour les marchés africains.",
    tags: ['React Native', 'BRVM', 'Temps réel', 'Bloomberg'],
    status: 'Négociation en cours', statusColor: '#B57BEE', secret: true,
  },
]

const SKILLS = [
  { cat: 'Finance & Marchés', items: [
    { name: 'Marchés financiers africains / BRVM', pct: 90 },
    { name: 'Analyse financière', pct: 85 },
    { name: 'Gestion de portefeuille', pct: 80 },
    { name: 'OPCVM & produits financiers', pct: 75 },
  ]},
  { cat: 'Analyse & Outils', items: [
    { name: 'Excel (TCD)', pct: 82 },
    { name: 'Power BI', pct: 78 },
    { name: 'Sage Comptabilité', pct: 70 },
    { name: 'Kobotoolbox', pct: 68 },
  ]},
  { cat: 'Outils Digitaux', items: [
    { name: 'Lovable (No-code)', pct: 85 },
    { name: 'Claude Code (IA)', pct: 82 },
    { name: 'Canva / Notebooklm', pct: 80 },
    { name: 'React Native', pct: 70 },
  ]},
]

const TIMELINE = [
  { date: '2024 — Présent', title: 'Licence 3 Finance Digitale', sub: 'EMSP Abidjan', desc: "Spécialisation en marchés financiers africains, fintech et gestion d'actifs." },
  { date: '2024', title: 'Certification Microsoft Office', sub: 'Pack Complet', desc: 'Excel avancé, Power BI, Word, PowerPoint, Outlook.' },
  { date: '2024 — 2025', title: '3 Applications Fintech', sub: 'En développement', desc: 'MY INVEST, MY INVEST SOCIAL et un projet confidentiel en négociation avancée.' },
  { date: '2025', title: 'Partenariat Fintech Africain', sub: 'Négociation en cours', desc: "Accord avec un leader de l'information financière africaine pour une app Bloomberg-style." },
]

const PHOTOS = [
  { file: 'AB X DR FELIX EDOH.jpeg',      name: 'Dr Felix Edoh',        role: 'BRVM',                              event: 'Conférence BRVM' },
  { file: 'AB X EDITH BROU BLEU.jpeg',    name: 'Edith Brou',           role: 'Finance Africaine',                 event: 'Forum Économique' },
  { file: 'AB X JOSE DIE.jpeg',           name: 'José Dié',             role: 'Directeur Général',                 event: 'Forum Sika Finance' },
  { file: 'AB X PAUL HARRY AITHNARD.jpeg',name: 'Paul Harry Aithnard',  role: 'Leader Financier',                  event: 'Conférence Économique' },
  { file: 'AB X STAN ZEZE.jpeg',          name: 'Stan Zézé',            role: 'Bloomfield Intelligence',           event: 'Table Ronde 2025' },
  { file: 'AB X STEVEN BEDI.jpeg',        name: 'Steven Bédi',          role: 'Bloomfield Intelligence',           event: 'Forum Bloomfield' },
]

// ── Particles (memo-ized, never re-renders) ────────────────────────────────────
const PDATA = Array.from({ length: 20 }, (_, i) => ({
  id: i, size: 1 + (i % 3),
  left: (i * 5.26) % 100,
  delay: (i * 1.1) % 20,
  dur: 14 + (i % 10),
  color: i % 4 === 0 ? '#D4AF6A' : '#B57BEE',
  opacity: 0.08 + (i % 4) * 0.05,
}))

function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {PDATA.map(p => (
        <div key={p.id} className="particle" style={{
          width: p.size, height: p.size, left: `${p.left}%`,
          background: p.color, opacity: p.opacity,
          animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`,
          boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
        }} />
      ))}
    </div>
  )
}

// ── Custom Cursor ──────────────────────────────────────────────────────────────
function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  const pos = useRef({ x: 0, y: 0 })
  const rpos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = e => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (dot.current) dot.current.style.transform = `translate(${e.clientX - 3}px,${e.clientY - 3}px)`
    }
    document.addEventListener('mousemove', onMove, { passive: true })

    let raf
    const loop = () => {
      rpos.current.x += (pos.current.x - rpos.current.x) * 0.1
      rpos.current.y += (pos.current.y - rpos.current.y) * 0.1
      if (ring.current) ring.current.style.transform = `translate(${rpos.current.x - 18}px,${rpos.current.y - 18}px)`
      raf = requestAnimationFrame(loop)
    }
    loop()

    const expand = () => ring.current?.classList.add('expand')
    const shrink = () => ring.current?.classList.remove('expand')
    document.querySelectorAll('a,button,[data-hover]').forEach(el => {
      el.addEventListener('mouseenter', expand)
      el.addEventListener('mouseleave', shrink)
    })

    return () => { document.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  return (<>
    <div ref={dot} className="cursor-dot" />
    <div ref={ring} className="cursor-ring" />
  </>)
}

// ── Loading ────────────────────────────────────────────────────────────────────
function Loader({ done }) {
  return (
    <AnimatePresence>
      {!done && (
        <motion.div className="loader" exit={{ opacity: 0 }} transition={{ duration: 1, ease: 'easeInOut' }}>
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

// ── Navbar ─────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = [['À propos','#about'],['Projets','#projects'],['Compétences','#skills'],['CV','#cv'],['Networking','#networking'],['Contact','#contact']]

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 inset-x-0 z-50 transition-all duration-500"
      style={{
        padding: scrolled ? '16px 0' : '28px 0',
        background: scrolled ? undefined : 'linear-gradient(to bottom, rgba(7,7,15,0.9) 0%, transparent 100%)',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="#hero" className="serif" style={{ fontSize: 22, fontWeight: 300, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
          Auryves <span className="grad-gold">Bedje</span>
        </a>

        <nav className="hidden md:flex items-center gap-10">
          {links.map(([l, h]) => <a key={h} href={h} className="nav-link">{l}</a>)}
        </nav>

        <a href="#contact" className="hidden md:inline-flex btn-prim" style={{ padding: '10px 28px' }}>
          Contact
        </a>

        <button onClick={() => setOpen(!open)} className="md:hidden" style={{ background: 'none', border: 'none', padding: 8, cursor: 'none' }}>
          <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.6)', marginBottom: 6, transition: 'all .3s', transform: open ? 'rotate(45deg) translate(0,5px)' : '' }} />
          <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.6)', transition: 'all .3s', transform: open ? 'rotate(-45deg) translate(0,-5px)' : '' }} />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden glass overflow-hidden" style={{ margin: '8px 16px', borderRadius: 4 }}>
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {links.map(([l, h]) => <a key={h} href={h} className="nav-link" onClick={() => setOpen(false)}>{l}</a>)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

// ── Hero ───────────────────────────────────────────────────────────────────────
function Hero() {
  const [titleIdx, setTitleIdx] = useState(0)
  const [text, setText] = useState('')
  const [del, setDel] = useState(false)
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref })
  const y = useTransform(scrollYProgress, [0, 1], [0, -80])
  const op = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    const cur = TITLES[titleIdx]
    const t = !del
      ? (text.length < cur.length
        ? setTimeout(() => setText(cur.slice(0, text.length + 1)), 75)
        : setTimeout(() => setDel(true), 2800))
      : (text.length > 0
        ? setTimeout(() => setText(text.slice(0, -1)), 40)
        : (() => { setDel(false); setTitleIdx(i => (i + 1) % TITLES.length) })())
    return () => clearTimeout(t)
  }, [text, del, titleIdx])

  return (
    <section id="hero" ref={ref} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '120px 24px 100px' }}>
      {/* Orbs */}
      <div className="orb" style={{ width: 500, height: 500, top: '10%', left: '-10%', background: '#B57BEE', animationDelay: '0s' }} />
      <div className="orb" style={{ width: 400, height: 400, bottom: '10%', right: '-8%', background: '#6C3AED', animationDelay: '3s' }} />
      <div className="orb" style={{ width: 300, height: 300, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#D4AF6A', animationDelay: '6s' }} />

      <motion.div style={{ y, opacity: op }} className="relative z-10 text-center" style={{ maxWidth: 900, width: '100%', position: 'relative', zIndex: 10 }}>
        {/* Label */}
        <motion.div {...fadeUp(1)} className="label" style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 1, background: 'rgba(212,175,106,0.4)' }} />
          Finance Digitale · EMSP Abidjan · Côte d'Ivoire 🇨🇮
          <div style={{ width: 40, height: 1, background: 'rgba(212,175,106,0.4)' }} />
        </motion.div>

        {/* Name */}
        <div style={{ overflow: 'hidden', marginBottom: 16 }}>
          <motion.h1
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="display-xl grad-mix"
          >
            Auryves Bedje
          </motion.h1>
        </div>

        {/* Typewriter */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
          style={{ height: 36, marginBottom: 32 }}
        >
          <span className="serif" style={{ fontSize: 22, fontWeight: 300, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
            {text}<span className="tw-cursor">|</span>
          </span>
        </motion.div>

        {/* Quote */}
        <motion.p {...fadeUp(2.1)} className="serif" style={{ fontSize: 18, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', marginBottom: 52, fontWeight: 300 }}>
          "Construire la finance africaine de demain"
        </motion.p>

        {/* CTAs */}
        <motion.div {...fadeUp(2.3)} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#projects" className="btn-prim">Découvrir mes projets</a>
          <a href="/CV-Auryves-Bedje.pdf" download className="btn-gold">Télécharger mon CV</a>
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp(2.6)} style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 64, paddingBottom: 24 }}>
          {[['3', 'Apps fintech'], ['19', 'Ans'], ['BRVM', 'Marchés africains']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div className="serif grad-gold" style={{ fontSize: 36, fontWeight: 300, lineHeight: 1 }}>{v}</div>
              <div className="label" style={{ marginTop: 8 }}>{l}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll hint — positionné proprement en bas */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5 }}
        style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, zIndex: 20 }}
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, rgba(212,175,106,0.5), transparent)' }} />
        <span className="label" style={{ fontSize: 10, letterSpacing: '0.3em' }}>Scroll</span>
      </motion.div>
    </section>
  )
}

// ── About ──────────────────────────────────────────────────────────────────────
function About() {
  return (
    <section id="about" className="section-pad">
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 80 }}>
          <div className="label-gold" style={{ marginBottom: 20 }}>Qui suis-je</div>
          <div className="divider" />
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 80, alignItems: 'center' }}>
          {/* Photo */}
          <motion.div {...fadeUp(0.1)} style={{ position: 'relative' }}>
            <div style={{ position: 'relative', maxWidth: 340, margin: '0 auto' }}>
              {/* Gold frame */}
              <div style={{ position: 'absolute', inset: -12, border: '1px solid rgba(212,175,106,0.2)', borderRadius: 4, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', inset: -6, border: '1px solid rgba(181,123,238,0.1)', borderRadius: 4, pointerEvents: 'none' }} />
              <img
                src="/photos/WhatsApp Image 2026-05-15 at 10.24.43.jpeg"
                alt="Auryves Bedje"
                style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 4, display: 'block' }}
              />
              {/* Badge */}
              <motion.div
                animate={{ y: [-6, 6, -6] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="glass-gold"
                style={{ position: 'absolute', bottom: -20, right: -20, padding: '14px 20px', borderRadius: 4 }}
              >
                <div className="label-gold" style={{ marginBottom: 4 }}>Fintech Builder</div>
                <div className="serif grad-gold" style={{ fontSize: 22, fontWeight: 300 }}>2025</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div {...fadeUp(0.2)}>
            <h2 className="display-lg" style={{ marginBottom: 28 }}>
              Bâtisseur de la <span className="grad-lav">finance digitale</span> africaine
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: 'rgba(255,255,255,0.5)', marginBottom: 36, fontWeight: 300 }}>
              Étudiant en Licence 3 de Finance Digitale à l'EMSP Abidjan, je développe des applications fintech qui transforment les marchés financiers africains. Passionné par la BRVM, l'investissement participatif et la technologie au service de la finance africaine.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, marginBottom: 40, border: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                ['📍', 'Localisation', 'Abidjan, Cocody Riviera Palmeraie'],
                ['🎓', 'Formation', 'Finance Digitale — EMSP'],
                ['📱', 'Téléphone', '+225 01 41 56 41 16'],
                ['✉️', 'Email', 'auryvesb@gmail.com'],
              ].map(([ico, l, v]) => (
                <div key={l} style={{ padding: '20px', borderRight: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="label" style={{ marginBottom: 8 }}>{l}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>{v}</div>
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

// ── Projects ───────────────────────────────────────────────────────────────────
function Projects() {
  return (
    <section id="projects" className="section-pad" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 80 }}>
          <div className="label-gold" style={{ marginBottom: 20 }}>Ce que je construis</div>
          <div className="divider" />
          <h2 className="display-lg" style={{ marginTop: 32 }}>Mes Projets</h2>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, border: '1px solid rgba(255,255,255,0.06)' }}>
          {PROJECTS.map((p, i) => (
            <motion.div key={p.n} {...fadeUp(i * 0.12)}
              style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 0, background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.3s', cursor: 'default', position: 'relative', overflow: 'hidden' }}
              whileHover={{ backgroundColor: 'rgba(181,123,238,0.04)' }}
            >
              {/* Number */}
              <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)', padding: '40px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                <span className="serif grad-gold" style={{ fontSize: 14, fontWeight: 300, letterSpacing: '0.1em' }}>{p.n}</span>
              </div>

              {/* Content */}
              <div style={{ padding: '40px 40px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                  <div>
                    <div className="label" style={{ marginBottom: 10, color: 'rgba(181,123,238,0.7)' }}>{p.cat}</div>
                    <h3 className="serif" style={{ fontSize: 28, fontWeight: 300, color: 'white', letterSpacing: '0.02em' }}>
                      {p.secret ? <span style={{ filter: 'blur(6px)', userSelect: 'none' }}>{p.name}</span> : p.name}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.statusColor, boxShadow: `0 0 8px ${p.statusColor}` }} />
                    <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{p.status}</span>
                  </div>
                </div>

                <p style={{ fontSize: 14, lineHeight: 1.8, color: 'rgba(255,255,255,0.45)', marginBottom: 24, fontWeight: 300, maxWidth: 600, filter: p.secret ? 'blur(4px)' : 'none' }}>
                  {p.desc}
                </p>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {p.tags.map(t => (
                    <span key={t} style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 14px', border: '1px solid rgba(181,123,238,0.2)', color: 'rgba(181,123,238,0.6)', borderRadius: 2 }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Skills ─────────────────────────────────────────────────────────────────────
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
    <section id="skills" className="section-pad" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
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

        {/* Soft skills */}
        <motion.div {...fadeUp(0.3)} style={{ marginTop: 64, paddingTop: 48, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="label" style={{ marginBottom: 24 }}>Qualités personnelles</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {['Sens de l\'initiative', 'Esprit d\'équipe', 'Adaptabilité', 'Rigueur', 'Motivation', 'Curiosité intellectuelle'].map(q => (
              <span key={q} className="glass" style={{ padding: '10px 20px', borderRadius: 2, fontSize: 13, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>
                {q}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── CV Section ─────────────────────────────────────────────────────────────────
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

          {/* Profil */}
          <motion.div {...fadeUp(0.1)} className="cv-section">
            <div className="label" style={{ marginBottom: 16 }}>Profil</div>
            <p style={{ fontSize: 14, lineHeight: 1.9, color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>
              Étudiant en Licence 3 de Finance Digitale à l'EMSP Abidjan. Je souhaite effectuer un stage en gestion d'actifs et fonctionnement du marché boursier régional (BRVM). Motivé et rigoureux, passionné par les marchés financiers africains et la fintech.
            </p>
          </motion.div>

          {/* Formation */}
          <motion.div {...fadeUp(0.15)} className="cv-section">
            <div className="label" style={{ marginBottom: 20 }}>Formation</div>
            <div style={{ marginBottom: 20 }}>
              <div className="serif" style={{ fontSize: 17, fontWeight: 400, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>Licence 3 Finance Digitale</div>
              <div style={{ fontSize: 13, color: '#D4AF6A', marginBottom: 4 }}>EMSP Abidjan — En cours</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Abidjan, Cocody Riviera Palmeraie</div>
            </div>
            <div>
              <div className="serif" style={{ fontSize: 17, fontWeight: 400, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>Pack Certification Microsoft Office</div>
              <div style={{ fontSize: 13, color: '#D4AF6A', marginBottom: 4 }}>Excel · Power BI · Word · PowerPoint · Outlook</div>
            </div>
          </motion.div>

          {/* Langues & Intérêts */}
          <motion.div {...fadeUp(0.2)} className="cv-section">
            <div className="label" style={{ marginBottom: 20 }}>Langues</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
              {[['Français', 'Langue maternelle', 100], ['Anglais', 'Intermédiaire', 55]].map(([l, n, p]) => (
                <div key={l}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{l}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>{n}</span>
                  </div>
                  <div className="skill-track" style={{ height: 1 }}>
                    <div style={{ height: 1, background: 'linear-gradient(90deg, #B57BEE, #D4AF6A)', width: `${p}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="label" style={{ marginBottom: 16 }}>Centres d'intérêt</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Marchés financiers', 'BRVM', 'Lecture économique', 'Veille technologique', 'Entrepreneuriat'].map(c => (
                <span key={c} style={{ fontSize: 11, padding: '6px 12px', border: '1px solid rgba(212,175,106,0.2)', color: 'rgba(212,175,106,0.7)', borderRadius: 2, letterSpacing: '0.08em' }}>
                  {c}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Download CTA */}
        <motion.div {...fadeUp(0.3)} style={{ marginTop: 64, paddingTop: 48, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div className="display-md" style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 8 }}>Télécharger le CV complet</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Format PDF · Auryves Bedje 2025</div>
          </div>
          <a href="/CV-Auryves-Bedje.pdf" download className="btn-gold" style={{ flexShrink: 0 }}>
            ↓ &nbsp;Télécharger PDF
          </a>
        </motion.div>
      </div>
    </section>
  )
}

// ── Timeline ───────────────────────────────────────────────────────────────────
function Timeline() {
  return (
    <section id="timeline" className="section-pad" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 80 }}>
          <div className="label-gold" style={{ marginBottom: 20 }}>Mon histoire</div>
          <div className="divider" />
          <h2 className="display-lg" style={{ marginTop: 32 }}>Parcours</h2>
        </motion.div>

        <div>
          {TIMELINE.map((t, i) => (
            <motion.div key={i} {...fadeUp(i * 0.12)} className="tl-item" style={{ marginBottom: 40 }}>
              <div className="tl-dot" />
              <div className="glass" style={{ padding: '28px 32px', borderRadius: 4, marginLeft: 8 }}>
                <div className="label" style={{ marginBottom: 8 }}>{t.date}</div>
                <div className="serif" style={{ fontSize: 22, fontWeight: 300, color: 'white', marginBottom: 6 }}>{t.title}</div>
                <div style={{ fontSize: 13, color: '#D4AF6A', marginBottom: 12, letterSpacing: '0.05em' }}>{t.sub}</div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, fontWeight: 300 }}>{t.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Networking ─────────────────────────────────────────────────────────────────
function Networking() {
  return (
    <section id="networking" className="section-pad" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 80 }}>
          <div className="label-gold" style={{ marginBottom: 20 }}>Mes connexions</div>
          <div className="divider" />
          <h2 className="display-lg" style={{ marginTop: 32 }}>Dans les cercles<br />de la finance africaine</h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
          {PHOTOS.map((p, i) => (
            <motion.div key={i} {...fadeIn(i * 0.08)}
              className="photo-card"
              style={{ aspectRatio: i === 0 || i === 3 ? '4/5' : '3/4', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <img src={`/photos/${p.file}`} alt={p.name} />
              <div className="photo-info">
                <div style={{ fontSize: 13, fontWeight: 500, color: 'white', marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#B57BEE', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{p.role}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>📍 {p.event}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeUp(0.4)} style={{ marginTop: 48, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {['Bloomfield Intelligence', 'BRVM', 'NSIA Assurances', 'Table Ronde de l\'Intelligence Économique', 'CNPS', 'Sika Finance'].map(o => (
            <span key={o} className="glass" style={{ padding: '8px 18px', borderRadius: 2, fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {o}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Contact ────────────────────────────────────────────────────────────────────
function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const submit = e => {
    e.preventDefault()
    const s = encodeURIComponent(`Contact Portfolio — ${form.name}`)
    const b = encodeURIComponent(`Bonjour Auryves,\n\nMessage de : ${form.name}\nEmail : ${form.email}\n\n${form.message}`)
    window.open(`mailto:auryvesb@gmail.com?subject=${s}&body=${b}`)
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <section id="contact" className="section-pad" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div {...fadeUp()} style={{ marginBottom: 80 }}>
          <div className="label-gold" style={{ marginBottom: 20 }}>Parlons ensemble</div>
          <div className="divider" />
          <h2 className="display-lg" style={{ marginTop: 32 }}>Travaillons Ensemble</h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64 }}>
          {/* Info */}
          <motion.div {...fadeUp(0.1)}>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.4)', fontWeight: 300, marginBottom: 48 }}>
              Vous avez un projet fintech, une opportunité de stage ou souhaitez simplement échanger ? Je suis disponible.
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
                  {c.h
                    ? <a href={c.h} target={c.h.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                        style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color .2s' }}
                        onMouseEnter={e => e.target.style.color = '#B57BEE'}
                        onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
                      >{c.v}</a>
                    : <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{c.v}</span>
                  }
                </div>
              ))}
            </div>
            <div style={{ marginTop: 32 }}>
              <a href="https://wa.me/2250141564116" target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 28px', borderRadius: 2, background: 'linear-gradient(135deg, rgba(37,211,102,0.12), rgba(18,140,78,0.12))', border: '1px solid rgba(37,211,102,0.25)', color: 'rgba(37,211,102,0.8)', textDecoration: 'none', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, transition: 'all .3s' }}>
                💬 &nbsp;Message WhatsApp direct
              </a>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div {...fadeUp(0.2)} className="glass" style={{ padding: '48px', borderRadius: 4 }}>
            <div className="label" style={{ marginBottom: 32 }}>Envoyer un message</div>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[['text', 'name', 'Votre nom', 'John Doe'], ['email', 'email', 'Votre email', 'john@exemple.com']].map(([type, key, label, ph]) => (
                <div key={key}>
                  <div className="label" style={{ marginBottom: 10 }}>{label}</div>
                  <input type={type} required placeholder={ph} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} className="input-field" />
                </div>
              ))}
              <div>
                <div className="label" style={{ marginBottom: 10 }}>Votre message</div>
                <textarea rows={5} required placeholder="Bonjour Auryves..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="input-field" style={{ resize: 'none' }} />
              </div>
              <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="btn-prim" style={{ justifyContent: 'center', marginTop: 8 }}>
                {sent ? '✓ Message envoyé' : 'Envoyer →'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '48px 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div className="serif grad-mix" style={{ fontSize: 36, fontWeight: 300, letterSpacing: '0.1em' }}>Auryves Bedje</div>
        <div className="divider" style={{ maxWidth: 200 }} />
        <div style={{ display: 'flex', gap: 32 }}>
          {[['Email', 'mailto:auryvesb@gmail.com'], ['WhatsApp', 'https://wa.me/2250141564116'], ['LinkedIn', 'https://linkedin.com/in/auryves-bedje-2981bb331']].map(([l, h]) => (
            <a key={l} href={h} target={h.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="nav-link">{l}</a>
          ))}
        </div>
        <p className="label" style={{ color: 'rgba(255,255,255,0.2)' }}>© 2026 · Abidjan, Côte d'Ivoire · Construire la finance africaine de demain 🌍</p>
      </div>
    </footer>
  )
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 2400); return () => clearTimeout(t) }, [])

  return (
    <div className="site-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      <Loader done={loaded} />
      <Cursor />
      <Particles />
      <AnimatePresence>
        {loaded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <Navbar />
            <main>
              <Hero />
              <About />
              <Projects />
              <Skills />
              <CVSection />
              <Timeline />
              <Networking />
              <Contact />
            </main>
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
