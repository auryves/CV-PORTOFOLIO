import { useEffect, useRef, useState } from 'react'
import { reducedMotion, isMobile } from '../motion'

/* ────────────────────────────────────────────────────────────────────────────
 * Globe des places boursières — Three.js, chargé à la demande.
 *
 * Abidjan (BRVM) est le point d'origine : des arcs lumineux partent vers les
 * places que suit le portfolio (Afrique puis monde). Le message est celui de la
 * section — « je pars de la BRVM et je me compare au reste du monde ».
 *
 * Coût maîtrisé :
 *   - `three` est importé dynamiquement, dans un chunk séparé, uniquement
 *     quand le globe approche de l'écran sur desktop ;
 *   - la boucle de rendu s'arrête dès que le globe sort du viewport ;
 *   - rien n'est monté sur mobile ni en `prefers-reduced-motion`.
 * ──────────────────────────────────────────────────────────────────────────── */

const ORIGIN = { name: 'BRVM · Abidjan', lat: 5.32, lon: -4.03 }
const PLACES = [
  { name: 'JSE', lat: -26.2, lon: 28.04, global: false },
  { name: 'NGX', lat: 6.45, lon: 3.39, global: false },
  { name: 'GSE', lat: 5.6, lon: -0.19, global: false },
  { name: 'NYSE', lat: 40.71, lon: -74.0, global: true },
  { name: 'LSE', lat: 51.5, lon: -0.12, global: true },
  { name: 'JPX', lat: 35.68, lon: 139.69, global: true },
  { name: 'Euronext', lat: 48.85, lon: 2.35, global: true },
]

const GOLD = 0xd4af6a
const LAV = 0xb57bee

export default function MarketGlobe({ height = 420 }) {
  const host = useRef(null)
  const [enabled, setEnabled] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (isMobile() || reducedMotion() || !host.current) return
    // Le chunk Three.js n'est téléchargé qu'à l'approche du globe.
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setEnabled(true); io.disconnect() }
    }, { rootMargin: '300px' })
    io.observe(host.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!enabled) return
    let disposed = false
    let cleanup = () => {}

    import('three').then((THREE) => {
      const el = host.current
      if (disposed || !el) return

      const w = el.clientWidth
      const h = el.clientHeight
      let renderer
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      } catch {
        // WebGL indisponible (désactivé, pilote en liste noire…) : pas de globe.
        setFailed(true)
        return
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(w, h)
      el.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100)
      camera.position.set(0, 0.25, 7.4)

      const R = 1.6
      const globe = new THREE.Group()
      // Abidjan face à la caméra, légèrement incliné : le golfe de Guinée au
      // centre, l'Europe au-dessus — la lecture « Afrique d'abord ».
      globe.rotation.x = 0.18
      scene.add(globe)

      const toVec = (lat, lon, r = R) => {
        const phi = (lat * Math.PI) / 180
        const lam = (lon * Math.PI) / 180
        return new THREE.Vector3(
          r * Math.cos(phi) * Math.sin(lam),
          r * Math.sin(phi),
          r * Math.cos(phi) * Math.cos(lam),
        )
      }

      // ── sphère pointillée (répartition de Fibonacci : densité uniforme)
      const N = 2600
      const pos = new Float32Array(N * 3)
      const golden = Math.PI * (3 - Math.sqrt(5))
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2
        const rad = Math.sqrt(1 - y * y)
        const t = golden * i
        pos[i * 3] = Math.cos(t) * rad * R
        pos[i * 3 + 1] = y * R
        pos[i * 3 + 2] = Math.sin(t) * rad * R
      }
      const dotsGeo = new THREE.BufferGeometry()
      dotsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      const dotsMat = new THREE.PointsMaterial({ color: LAV, size: 0.02, transparent: true, opacity: 0.7 })
      globe.add(new THREE.Points(dotsGeo, dotsMat))

      // ── noyau sombre : masque les points de la face arrière
      const coreGeo = new THREE.SphereGeometry(R * 0.985, 48, 48)
      const coreMat = new THREE.MeshBasicMaterial({ color: 0x0a0a18 })
      globe.add(new THREE.Mesh(coreGeo, coreMat))

      // ── halo atmosphérique (fresnel)
      const haloGeo = new THREE.SphereGeometry(R * 1.12, 48, 48)
      const haloMat = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        uniforms: { uColor: { value: new THREE.Color(LAV) } },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          uniform vec3 uColor;
          varying vec3 vNormal;
          void main() {
            float i = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
            gl_FragColor = vec4(uColor, 1.0) * i;
          }`,
      })
      scene.add(new THREE.Mesh(haloGeo, haloMat))

      // ── marqueurs
      const disposables = [dotsGeo, dotsMat, coreGeo, coreMat, haloGeo, haloMat]
      const markerGeo = new THREE.SphereGeometry(0.035, 16, 16)
      const ringGeo = new THREE.RingGeometry(0.06, 0.075, 32)
      disposables.push(markerGeo, ringGeo)
      const pulses = []

      const addMarker = (lat, lon, color, big = false) => {
        const p = toVec(lat, lon, R * 1.005)
        const mat = new THREE.MeshBasicMaterial({ color })
        const m = new THREE.Mesh(markerGeo, mat)
        m.position.copy(p)
        if (big) m.scale.setScalar(1.6)
        globe.add(m)
        const rMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
        const ring = new THREE.Mesh(ringGeo, rMat)
        ring.position.copy(p)
        // Orientation en repère local (tangente à la sphère) : `lookAt` prend
        // une cible en coordonnées monde et ignorait l'inclinaison du globe.
        ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), p.clone().normalize())
        globe.add(ring)
        pulses.push({ ring, mat: rMat, phase: Math.random(), big })
        disposables.push(mat, rMat)
      }

      addMarker(ORIGIN.lat, ORIGIN.lon, GOLD, true)
      PLACES.forEach((pl) => addMarker(pl.lat, pl.lon, pl.global ? LAV : GOLD))

      // ── arcs Abidjan → place, tracés progressivement
      const arcs = []
      const start = toVec(ORIGIN.lat, ORIGIN.lon)
      PLACES.forEach((pl, i) => {
        const end = toVec(pl.lat, pl.lon)
        const dist = start.distanceTo(end)
        const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(R + dist * 0.55)
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
        const pts = curve.getPoints(80)
        const geo = new THREE.BufferGeometry().setFromPoints(pts)
        geo.setDrawRange(0, 0)
        const mat = new THREE.LineBasicMaterial({ color: pl.global ? LAV : GOLD, transparent: true, opacity: 0.85 })
        globe.add(new THREE.Line(geo, mat))
        arcs.push({ geo, mat, n: pts.length, delay: i * 0.35 })
        disposables.push(geo, mat)
      })

      // ── interaction : glisser pour tourner, inertie au relâchement
      let dragging = false
      let lastX = 0
      let lastMove = 0
      let velocity = 0 // rad par image de référence (60 Hz)
      let spin = 0 // rotation accumulée par l'utilisateur
      const onDown = (e) => { dragging = true; velocity = 0; lastX = e.clientX; lastMove = performance.now(); el.setPointerCapture?.(e.pointerId) }
      const onMove = (e) => {
        if (!dragging) return
        const dx = e.clientX - lastX
        lastX = e.clientX
        lastMove = performance.now()
        velocity = dx * 0.005
        spin += velocity
      }
      const onUp = () => {
        // Relâché après un temps d'arrêt : pas d'inertie résiduelle.
        if (performance.now() - lastMove > 80) velocity = 0
        dragging = false
      }
      el.addEventListener('pointerdown', onDown)
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerup', onUp)
      el.addEventListener('pointerleave', onUp)
      el.addEventListener('pointercancel', onUp)

      const onResize = () => {
        const nw = el.clientWidth
        const nh = el.clientHeight
        if (!nw || !nh) return
        renderer.setSize(nw, nh)
        camera.aspect = nw / nh
        camera.updateProjectionMatrix()
      }
      // Le conteneur suit la grille (colonne, barre de défilement…), pas
      // seulement la fenêtre.
      const ro = new ResizeObserver(onResize)
      ro.observe(el)

      const clock = new THREE.Clock()
      let t = 0 // temps de rendu cumulé, figé tant que le globe est hors champ
      let raf = null
      const tick = () => {
        // Pas indexés sur le temps réel : même rendu à 60, 120 ou 144 Hz.
        const dt = Math.min(clock.getDelta(), 0.1)
        const frames = dt * 60
        t += dt
        if (!dragging) {
          spin += velocity * frames
          velocity *= Math.pow(0.94, frames)
        }
        // Oscillation lente centrée sur Abidjan plutôt qu'une rotation complète :
        // la BRVM reste visible, les autres places entrent et sortent du champ.
        globe.rotation.y = spin + Math.sin(t * 0.25) * 0.3
        arcs.forEach((a) => {
          const p = Math.min(1, Math.max(0, (t - 0.4 - a.delay) / 1.4))
          const eased = 1 - Math.pow(1 - p, 3)
          a.geo.setDrawRange(0, Math.floor(eased * a.n))
        })
        pulses.forEach((p) => {
          const k = ((t * 0.6 + p.phase) % 1)
          p.ring.scale.setScalar(1 + k * (p.big ? 2.6 : 1.8))
          p.mat.opacity = 0.8 * (1 - k)
        })
        renderer.render(scene, camera)
        raf = requestAnimationFrame(tick)
      }

      const vis = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { if (!raf) { clock.getDelta(); tick() } }
        else { cancelAnimationFrame(raf); raf = null }
      })
      vis.observe(el)

      cleanup = () => {
        cancelAnimationFrame(raf)
        vis.disconnect()
        ro.disconnect()
        el.removeEventListener('pointerdown', onDown)
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerup', onUp)
        el.removeEventListener('pointerleave', onUp)
        el.removeEventListener('pointercancel', onUp)
        disposables.forEach((d) => d.dispose())
        renderer.dispose()
        // Libère le contexte tout de suite : sinon chaque remontage (passage
        // mobile ↔ desktop) en laisse un vivant jusqu'à la limite du navigateur.
        renderer.forceContextLoss()
        renderer.domElement.remove()
      }
    }).catch(() => { if (!disposed) setFailed(true) })

    return () => { disposed = true; cleanup() }
  }, [enabled])

  if (failed) return null

  return (
    <div className="market-globe" style={{ height }} aria-hidden="true">
      <div ref={host} className="market-globe-canvas" aria-hidden="true" />
      <div className="market-globe-legend">
        <span><i style={{ background: '#D4AF6A' }} />BRVM &amp; Afrique</span>
        <span><i style={{ background: '#B57BEE' }} />Places mondiales</span>
      </div>
    </div>
  )
}
