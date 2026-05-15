import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import './index.css'

// ─── DATA ────────────────────────────────────────────────────────────────────

const PROJECTS = [
  {
    id: 1,
    name: 'MY INVEST',
    badge: 'Fintech • Investissement Participatif',
    badgeClass: 'from-lavender to-violet',
    description: "Plateforme d'investissement participatif permettant aux particuliers d'investir dans les TPE/PME africaines avec remboursement basé sur les revenus quotidiens des entreprises. Revenue-based financing nouvelle génération pour l'Afrique.",
    tags: ['React Native', 'Supabase', 'IA', 'Mobile Money'],
    status: 'En développement',
    statusDot: '#10B981',
    icon: '📈',
    glowColor: '#B57BEE',
  },
  {
    id: 2,
    name: 'MY INVEST SOCIAL',
    badge: 'Social • Crowdfunding Solidaire',
    badgeClass: 'from-orange-400 to-amber-500',
    description: "Plateforme africaine de solidarité digitale permettant de soutenir financièrement et émotionnellement des personnes en urgence médicale ou sociale. Crowdfunding avec dimension communautaire et virale.",
    tags: ['React Native', 'Mobile Money', 'Feed Social', 'IA'],
    status: 'En développement',
    statusDot: '#F97316',
    icon: '🤝',
    glowColor: '#F97316',
  },
  {
    id: 3,
    name: 'PROJET CONFIDENTIEL',
    badge: 'Fintech • Application Mobile',
    badgeClass: 'from-violet to-indigo-500',
    description: "Application mobile premium pour un leader de l'information financière africaine. Négociation en cours. Inspiré de Bloomberg et TradingView pour les marchés africains.",
    tags: ['React Native', 'BRVM', 'Temps réel', 'Bloomberg-style'],
    status: 'Négociation en cours 🔒',
    statusDot: '#B57BEE',
    icon: '🔒',
    glowColor: '#6C3AED',
    secret: true,
  },
]

const SKILLS_FINANCE = [
  { name: 'Marchés financiers africains', pct: 90 },
  { name: 'Analyse financière BRVM', pct: 85 },
  { name: 'Gestion de portefeuille', pct: 80 },
  { name: 'OPCVM & produits financiers', pct: 75 },
]

const SKILLS_TECH = [
  { name: 'Lovable (No-code)', pct: 85 },
  { name: 'Claude Code (IA)', pct: 80 },
  { name: 'Excel TCD', pct: 80 },
  { name: 'Power BI', pct: 75 },
  { name: 'React Native', pct: 70 },
]

const TIMELINE = [
  { date: '2024 — Présent', title: 'Licence 3 Finance Digitale', place: 'EMSP Abidjan', desc: "Spécialisation marchés financiers africains, fintech et gestion d'actifs." },
  { date: '2024', title: 'Certification Microsoft Office', place: 'Pack Complet', desc: 'Maîtrise avancée Excel, Power BI, Word, PowerPoint.' },
  { date: '2024 — 2025', title: 'Développement 3 apps fintech', place: 'Abidjan, Côte d\'Ivoire', desc: 'MY INVEST, MY INVEST SOCIAL et un projet confidentiel en négociation.' },
  { date: '2025', title: 'Partenariat Fintech Africain', place: 'Négociation en cours', desc: "Accord avec un leader de l'information financière africaine pour une app premium." },
]

const PHOTOS = [
  { file: 'AB X DR FELIX EDOH.jpeg', name: 'Dr Felix Edoh', role: 'BRVM — Bourse Régionale des Valeurs Mobilières', event: 'Conférence BRVM' },
  { file: 'AB X EDITH BROU BLEU.jpeg', name: 'Edith Brou', role: 'Leader Finance Africaine', event: 'Forum Économique' },
  { file: 'AB X JOSE DIE.jpeg', name: 'José Dié', role: 'Directeur Général', event: 'Forum Sika Finance' },
  { file: 'AB X PAUL HARRY AITHNARD.jpeg', name: 'Paul Harry Aithnard', role: 'Leader Financier Africain', event: 'Conférence Économique' },
  { file: 'AB X STAN ZEZE.jpeg', name: 'Stan Zézé', role: 'Bloomfield Intelligence — Table Ronde', event: 'La Table Ronde 2025' },
  { file: 'AB X STEVEN BEDI.jpeg', name: 'Steven Bédi', role: 'Bloomfield Intelligence', event: 'Forum Bloomfield' },
]

const TITLES = ['Fintech Builder', 'Digital Finance Student', 'African FinTech Entrepreneur']

// ─── CUSTOM CURSOR ────────────────────────────────────────────────────────────

function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const mouse = useRef({ x: 0, y: 0 })
  const ring = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`
      }
    }

    let raf
    const animate = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.12
      ring.current.y += (mouse.current.y - ring.current.y) * 0.12
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x - 20}px, ${ring.current.y - 20}px)`
      }
      raf = requestAnimationFrame(animate)
    }

    document.addEventListener('mousemove', onMove)
    animate()
    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  )
}

// ─── PARTICLES ────────────────────────────────────────────────────────────────

const PARTICLE_DATA = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  size: (i % 4) + 1.5,
  left: (i * 4.17) % 100,
  delay: (i * 0.9) % 18,
  duration: 12 + (i % 8),
  color: i % 3 === 0 ? '#F59E0B' : '#B57BEE',
  opacity: 0.15 + (i % 3) * 0.1,
}))

function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {PARTICLE_DATA.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            background: p.color,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
        />
      ))}
    </div>
  )
}

// ─── LOADING ──────────────────────────────────────────────────────────────────

function LoadingScreen({ done }) {
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="loading-screen"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-5xl font-black mb-2"
              style={{ background: 'linear-gradient(135deg, #B57BEE, #6C3AED, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              AB
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/30 text-xs tracking-widest uppercase mb-6"
            >
              Auryves Bedje
            </motion.p>
            <div className="loading-ring mx-auto mb-4" />
            <p className="text-white/20 text-xs">Chargement du portfolio...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = [
    ['À propos', '#about'],
    ['Projets', '#projects'],
    ['Compétences', '#skills'],
    ['Parcours', '#timeline'],
    ['Networking', '#networking'],
    ['Contact', '#contact'],
  ]

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'glass-dark py-3 shadow-lg shadow-black/20' : 'py-5'}`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#hero" className="text-xl font-black" style={{ background: 'linear-gradient(135deg, #B57BEE, #6C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Auryves Bedje
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="nav-link">{label}</a>
          ))}
        </div>

        <a href="#contact" className="hidden md:inline-flex btn-primary py-2.5 px-6 text-sm">
          Me contacter
        </a>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-white/70">
          <div style={{ width: 22, height: 1.5, background: 'currentColor', transition: 'all .3s', transform: open ? 'rotate(45deg) translate(0, 6px)' : '' }} />
          <div style={{ width: 22, height: 1.5, background: 'currentColor', margin: '5px 0', transition: 'all .3s', opacity: open ? 0 : 1 }} />
          <div style={{ width: 22, height: 1.5, background: 'currentColor', transition: 'all .3s', transform: open ? 'rotate(-45deg) translate(0, -6px)' : '' }} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden glass-dark mx-4 mt-2 rounded-2xl overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4">
              {links.map(([label, href]) => (
                <a key={href} href={href} className="nav-link text-base" onClick={() => setOpen(false)}>{label}</a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function Hero() {
  const [titleIdx, setTitleIdx] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  useEffect(() => {
    const current = TITLES[titleIdx]
    let timer
    if (!deleting) {
      if (text.length < current.length) {
        timer = setTimeout(() => setText(current.slice(0, text.length + 1)), 80)
      } else {
        timer = setTimeout(() => setDeleting(true), 2500)
      }
    } else {
      if (text.length > 0) {
        timer = setTimeout(() => setText(text.slice(0, -1)), 45)
      } else {
        setDeleting(false)
        setTitleIdx(i => (i + 1) % TITLES.length)
      }
    }
    return () => clearTimeout(timer)
  }, [text, deleting, titleIdx])

  const nameLetters = 'Auryves Bedje'.split('')

  return (
    <section id="hero" ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full blur-3xl animate-breathe"
          style={{ background: 'rgba(181,123,238,0.12)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full blur-3xl animate-breathe"
          style={{ background: 'rgba(108,58,237,0.1)', animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-56 h-56 rounded-full blur-3xl animate-breathe"
          style={{ background: 'rgba(245,158,11,0.06)', animationDelay: '4s' }} />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto w-full">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="inline-flex items-center gap-2 glass rounded-full px-5 py-2.5 mb-10 text-sm font-medium"
          style={{ color: '#B57BEE' }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#B57BEE' }} />
          Étudiant Entrepreneur · Abidjan, Côte d'Ivoire 🇨🇮
        </motion.div>

        {/* Name — letter by letter */}
        <div className="flex flex-wrap justify-center mb-6" style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', fontWeight: 900, lineHeight: 1, gap: '0 0.05em' }}>
          {nameLetters.map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 80, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.7, delay: 1.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              style={char === ' '
                ? { display: 'inline-block', width: '0.3em' }
                : { background: 'linear-gradient(135deg, #B57BEE, #6C3AED, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }
              }
            >
              {char === ' ' ? ' ' : char}
            </motion.span>
          ))}
        </div>

        {/* Typewriter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-xl md:text-2xl font-light mb-5"
          style={{ color: 'rgba(255,255,255,0.6)', minHeight: '2rem' }}
        >
          <span style={{ color: '#B57BEE', fontWeight: 600 }}>{text}</span>
          <span className="typewriter-cursor ml-0.5">|</span>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          className="text-lg italic mb-12"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          "Construire la finance africaine de demain 🌍"
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a href="#projects" className="btn-primary text-base">
            Voir mes projets &nbsp;→
          </a>
          <a href="#contact" className="btn-outline text-base">
            Me contacter
          </a>
        </motion.div>

        {/* Mini stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8 }}
          className="mt-16 flex justify-center gap-6"
        >
          {[
            { n: '3', label: 'Apps fintech' },
            { n: '19', label: 'Ans' },
            { n: 'BRVM', label: 'Marchés africains' },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl px-6 py-4 text-center">
              <div className="text-2xl font-black" style={{ background: 'linear-gradient(135deg, #B57BEE, #6C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.n}</div>
              <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
          style={{ border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <div className="w-1 h-2 rounded-full" style={{ background: '#B57BEE' }} />
        </motion.div>
      </motion.div>
    </section>
  )
}

// ─── ABOUT ────────────────────────────────────────────────────────────────────

function About() {
  return (
    <section id="about" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: '#B57BEE' }}>Qui suis-je ?</div>
          <h2 className="section-title">À Propos</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center"
          >
            <div className="relative w-72 md:w-80">
              <div className="absolute -inset-1.5 rounded-3xl blur-sm animate-spin-slow opacity-60"
                style={{ background: 'linear-gradient(135deg, #B57BEE, #6C3AED, #F59E0B)' }} />
              <div className="relative rounded-3xl overflow-hidden glass p-1">
                <img
                  src="/photos/WhatsApp Image 2026-05-15 at 10.24.43.jpeg"
                  alt="Auryves Bedje"
                  className="w-full rounded-2xl object-cover"
                  style={{ aspectRatio: '3/4' }}
                />
              </div>
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-5 -right-5 glass rounded-2xl p-4"
                style={{ boxShadow: '0 0 20px rgba(181,123,238,0.3)' }}
              >
                <div className="text-2xl mb-1">🏆</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Fintech Builder</div>
                <div className="text-sm font-bold" style={{ color: '#B57BEE' }}>2025</div>
              </motion.div>
              <motion.div
                animate={{ y: [6, -6, 6] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-5 -left-5 glass rounded-2xl p-4"
                style={{ boxShadow: '0 0 20px rgba(245,158,11,0.2)' }}
              >
                <div className="text-2xl mb-1">🌍</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Abidjan, CI</div>
                <div className="text-sm font-bold" style={{ color: '#F59E0B' }}>EMSP</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h3 className="text-3xl font-bold text-white mb-6">
              Bâtisseur de la{' '}
              <span style={{ background: 'linear-gradient(135deg, #B57BEE, #6C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                finance digitale
              </span>{' '}
              africaine
            </h3>

            <p className="text-lg leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
              À 19 ans, étudiant en Finance Digitale à l'EMSP Abidjan, je construis les applications
              fintech qui vont transformer les marchés financiers africains. Passionné par la BRVM,
              l'investissement participatif et la technologie au service de la finance africaine.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { value: '3', label: 'Applications en développement', icon: '📱' },
                { value: '19', label: 'Ans, étudiant entrepreneur', icon: '⚡' },
                { value: 'EMSP', label: 'Finance Digitale — Abidjan', icon: '🎓' },
                { value: 'BRVM', label: 'Marchés Financiers Africains', icon: '📊' },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="glass rounded-2xl p-4"
                >
                  <div className="text-xl mb-2">{s.icon}</div>
                  <div className="text-xl font-black" style={{ color: '#B57BEE' }}>{s.value}</div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <a href="mailto:auryvesb@gmail.com" className="btn-primary text-sm">
                ✉️ auryvesb@gmail.com
              </a>
              <a href="https://linkedin.com/in/auryves-bedje-2981bb331" target="_blank" rel="noreferrer" className="btn-outline text-sm">
                💼 LinkedIn
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── PROJECTS ─────────────────────────────────────────────────────────────────

function Projects() {
  return (
    <section id="projects" className="py-32 px-6 relative">
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(181,123,238,0.3), transparent)' }} />
      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(181,123,238,0.3), transparent)' }} />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: '#B57BEE' }}>Ce que je construis</div>
          <h2 className="section-title">Mes Projets</h2>
          <p className="section-subtitle">Trois applications fintech pour révolutionner la finance africaine</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {PROJECTS.map((proj, i) => (
            <motion.div
              key={proj.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="relative glass rounded-3xl p-7 overflow-hidden group"
              style={{ cursor: 'default' }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 60px ${proj.glowColor}18` }} />

              {proj.secret && (
                <div className="absolute inset-0 rounded-3xl z-10 flex flex-col items-center justify-end pb-8"
                  style={{ background: 'linear-gradient(to top, rgba(10,10,26,0.5) 0%, transparent 60%)' }}>
                  <div className="text-3xl">🔐</div>
                  <div className="text-xs font-medium mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Confidentiel</div>
                </div>
              )}

              <div className="relative z-5">
                <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110 inline-block">{proj.icon}</div>

                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold text-white mb-4 block"
                  style={{ background: proj.id === 1 ? 'linear-gradient(135deg, #B57BEE, #6C3AED)' : proj.id === 2 ? 'linear-gradient(135deg, #FB923C, #F59E0B)' : 'linear-gradient(135deg, #6C3AED, #4F46E5)' }}>
                  {proj.badge}
                </span>

                <h3 className="text-xl font-black text-white mb-3">{proj.name}</h3>

                <p className={`text-sm leading-relaxed mb-5 ${proj.secret ? 'blur-sm select-none' : ''}`} style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {proj.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {proj.tags.map(tag => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full glass" style={{ color: '#B57BEE', border: '1px solid rgba(181,123,238,0.25)' }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: proj.statusDot, boxShadow: `0 0 8px ${proj.statusDot}` }} />
                  <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>{proj.status}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── SKILLS ───────────────────────────────────────────────────────────────────

function SkillBar({ name, pct, delay = 0 }) {
  const ref = useRef(null)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimate(true) }, { threshold: 0.4 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="mb-5">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{name}</span>
        <span className="text-sm font-bold" style={{ color: '#B57BEE' }}>{pct}%</span>
      </div>
      <div className="skill-bar">
        <div className="skill-fill" style={{
          transform: animate ? `scaleX(${pct / 100})` : 'scaleX(0)',
          transitionDelay: `${delay}s`,
        }} />
      </div>
    </div>
  )
}

function Skills() {
  return (
    <section id="skills" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: '#B57BEE' }}>Mon expertise</div>
          <h2 className="section-title">Compétences</h2>
          <p className="section-subtitle">Finance & Technologie au service de l'Afrique</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="glass rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'linear-gradient(135deg, #B57BEE, #6C3AED)' }}>📊</div>
              <h3 className="text-lg font-bold text-white">Finance & Marchés</h3>
            </div>
            {SKILLS_FINANCE.map((s, i) => (
              <SkillBar key={s.name} name={s.name} pct={s.pct} delay={i * 0.15} />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="glass rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>💻</div>
              <h3 className="text-lg font-bold text-white">Tech & Outils</h3>
            </div>
            {SKILLS_TECH.map((s, i) => (
              <SkillBar key={s.name} name={s.name} pct={s.pct} delay={i * 0.15} />
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex flex-wrap justify-center gap-3"
        >
          {['Finance Digitale', 'BRVM', 'Revenue-Based Financing', 'Mobile Money', 'Crowdfunding', 'IA & No-Code', 'React Native', 'Supabase', 'Power BI', 'Bloomberg-style'].map(tag => (
            <span key={tag} className="glass px-4 py-2.5 rounded-full text-sm transition-all hover:border-lavender/50 hover:text-lavender"
              style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(181,123,238,0.2)' }}>
              {tag}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── TIMELINE ─────────────────────────────────────────────────────────────────

function Timeline() {
  return (
    <section id="timeline" className="py-32 px-6 relative">
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(181,123,238,0.3), transparent)' }} />
      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(181,123,238,0.3), transparent)' }} />

      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: '#B57BEE' }}>Mon histoire</div>
          <h2 className="section-title">Parcours</h2>
          <p className="section-subtitle">Une trajectoire construite avec intention</p>
        </motion.div>

        <div>
          {TIMELINE.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="timeline-item pb-8"
            >
              <div className="timeline-dot" />
              <div className="glass rounded-2xl p-6 ml-2">
                <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#B57BEE' }}>{item.date}</div>
                <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                <div className="text-sm font-medium mb-3" style={{ color: '#F59E0B' }}>{item.place}</div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── NETWORKING ───────────────────────────────────────────────────────────────

function Networking() {
  return (
    <section id="networking" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: '#B57BEE' }}>Mes connexions</div>
          <h2 className="section-title">Dans les cercles<br />de la finance africaine</h2>
          <p className="section-subtitle mt-4">Présent dans les forums et événements qui façonnent la finance africaine</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {PHOTOS.map((photo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="photo-card glass"
              style={{ aspectRatio: '3/4' }}
            >
              <img
                src={`/photos/${photo.file}`}
                alt={`Auryves Bedje avec ${photo.name}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="photo-overlay">
                <div>
                  <div className="text-sm font-bold text-white">{photo.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#B57BEE' }}>{photo.role}</div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>📍 {photo.event}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 flex flex-wrap justify-center gap-3"
        >
          {['Bloomfield Intelligence', 'BRVM', 'NSIA Assurances', "Table Ronde de l'Intelligence Économique", 'CNPS', 'Sika Finance', 'EMSP Abidjan'].map(org => (
            <span key={org} className="glass px-4 py-2 rounded-full text-xs" style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(181,123,238,0.2)' }}>
              {org}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── CONTACT ──────────────────────────────────────────────────────────────────

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const sub = encodeURIComponent(`Contact Portfolio — ${form.name}`)
    const body = encodeURIComponent(`Bonjour Auryves,\n\nMessage de : ${form.name}\nEmail : ${form.email}\n\n${form.message}`)
    window.open(`mailto:auryvesb@gmail.com?subject=${sub}&body=${body}`)
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '12px 16px',
    color: 'white',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  }

  return (
    <section id="contact" className="py-32 px-6 relative">
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(181,123,238,0.4), transparent)' }} />

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: '#B57BEE' }}>Parlons ensemble</div>
          <h2 className="section-title">Travaillons Ensemble</h2>
          <p className="section-subtitle">Un projet fintech, une opportunité ou simplement envie d'échanger ?</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="text-2xl font-bold text-white mb-8">Mes coordonnées</h3>

            <div className="space-y-4 mb-8">
              {[
                { icon: '✉️', label: 'Email', value: 'auryvesb@gmail.com', href: 'mailto:auryvesb@gmail.com' },
                { icon: '📱', label: 'Téléphone / WhatsApp', value: '+225 01 41 56 41 16', href: 'https://wa.me/2250141564116' },
                { icon: '💼', label: 'LinkedIn', value: 'linkedin.com/in/auryves-bedje-2981bb331', href: 'https://linkedin.com/in/auryves-bedje-2981bb331' },
                { icon: '📍', label: 'Localisation', value: 'Abidjan, Cocody Riviera Palmeraie', href: null },
              ].map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  {c.href ? (
                    <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                      className="flex items-center gap-4 glass rounded-2xl p-4 group transition-all"
                      style={{ textDecoration: 'none', display: 'flex' }}>
                      <span className="text-2xl flex-shrink-0">{c.icon}</span>
                      <div>
                        <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{c.label}</div>
                        <div className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.75)' }}>{c.value}</div>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 glass rounded-2xl p-4">
                      <span className="text-2xl flex-shrink-0">{c.icon}</span>
                      <div>
                        <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{c.label}</div>
                        <div className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{c.value}</div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <a
              href="https://wa.me/2250141564116"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 justify-center w-full py-4 rounded-2xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', boxShadow: '0 0 25px rgba(37,211,102,0.25)', textDecoration: 'none' }}
            >
              <span className="text-xl">💬</span>
              WhatsApp — Message direct
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="glass rounded-3xl p-8"
          >
            <h3 className="text-xl font-bold text-white mb-6">Envoyer un message</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Votre nom</label>
                <input type="text" required placeholder="John Doe"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  style={inputStyle} />
              </div>
              <div className="mb-4">
                <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Votre email</label>
                <input type="email" required placeholder="john@exemple.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  style={inputStyle} />
              </div>
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Votre message</label>
                <textarea rows={5} required placeholder="Bonjour Auryves, je souhaite vous contacter au sujet de..."
                  value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  style={{ ...inputStyle, resize: 'none' }} />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full justify-center"
                style={{ fontSize: 16 }}
              >
                {sent ? '✓ Message envoyé !' : 'Envoyer le message →'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="py-12 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="text-2xl font-black mb-1"
              style={{ background: 'linear-gradient(135deg, #B57BEE, #6C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Auryves Bedje
            </div>
            <div className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Construire la finance africaine de demain 🌍
            </div>
          </div>

          <div className="flex items-center gap-6">
            {[
              { label: 'Email', href: 'mailto:auryvesb@gmail.com' },
              { label: 'WhatsApp', href: 'https://wa.me/2250141564116' },
              { label: 'LinkedIn', href: 'https://linkedin.com/in/auryves-bedje-2981bb331' },
            ].map(l => (
              <a key={l.label} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
                {l.label}
              </a>
            ))}
          </div>

          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            © 2026 — Abidjan, Côte d'Ivoire
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="h-px w-96 max-w-full"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(181,123,238,0.3), transparent)' }} />
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.15)' }}>
          Fintech Builder · Digital Finance Student · Abidjan 🇨🇮
        </p>
      </div>
    </footer>
  )
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 2200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="animated-bg min-h-screen relative">
      <LoadingScreen done={loaded} />
      <CustomCursor />
      <Particles />

      <AnimatePresence>
        {loaded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <Navbar />
            <main>
              <Hero />
              <About />
              <Projects />
              <Skills />
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
