import { useEffect, useRef } from 'react'
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl'
import { reducedMotion } from '../motion'

/* ────────────────────────────────────────────────────────────────────────────
 * Galerie circulaire WebGL (OGL)
 *
 * Portage JSX du composant « Circular Gallery » avec trois écarts assumés par
 * rapport à la version d'origine :
 *   1. la molette est écoutée sur le conteneur, pas sur `window` — sinon la
 *      galerie défile même quand elle est hors écran ;
 *   2. dérive automatique au repos, pour que la section vive sans interaction ;
 *   3. la boucle rAF est suspendue quand la section sort du viewport.
 * ──────────────────────────────────────────────────────────────────────────── */

const lerp = (a, b, t) => a + (b - a) * t

function debounce(fn, wait) {
  let t
  return function (...args) {
    clearTimeout(t)
    t = setTimeout(() => fn.apply(this, args), wait)
  }
}

function autoBind(instance) {
  const proto = Object.getPrototypeOf(instance)
  Object.getOwnPropertyNames(proto).forEach((key) => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance)
    }
  })
}

function createTextTexture(gl, text, font, color) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  context.font = font
  const metrics = context.measureText(text)
  const textWidth = Math.ceil(metrics.width)
  const textHeight = Math.ceil(parseInt(font, 10) * 1.2)
  canvas.width = textWidth + 20
  canvas.height = textHeight + 20
  context.font = font
  context.fillStyle = color
  context.textBaseline = 'middle'
  context.textAlign = 'center'
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillText(text, canvas.width / 2, canvas.height / 2)
  const texture = new Texture(gl, { generateMipmaps: false })
  texture.image = canvas
  return { texture, width: canvas.width, height: canvas.height }
}

class Title {
  constructor({ gl, plane, renderer, text, textColor, font }) {
    autoBind(this)
    this.gl = gl
    this.plane = plane
    this.renderer = renderer
    this.text = text
    this.textColor = textColor
    this.font = font
    this.createMesh()
  }

  createMesh() {
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor)
    const geometry = new Plane(this.gl)
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    })
    this.mesh = new Mesh(this.gl, { geometry, program })
    const aspect = width / height
    const textHeight = this.plane.scale.y * 0.14
    const textWidth = textHeight * aspect
    this.mesh.scale.set(textWidth, textHeight, 1)
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeight * 0.5 - 0.06
    this.mesh.setParent(this.plane)
  }
}

class Media {
  constructor({
    geometry, gl, image, index, length, renderer, scene, screen,
    text, viewport, bend, textColor, borderRadius = 0, font,
  }) {
    this.geometry = geometry
    this.gl = gl
    this.image = image
    this.index = index
    this.length = length
    this.renderer = renderer
    this.scene = scene
    this.screen = screen
    this.text = text
    this.viewport = viewport
    this.bend = bend
    this.textColor = textColor
    this.borderRadius = borderRadius
    this.font = font
    this.extra = 0
    this.widthTotal = 0
    this.width = 0
    this.x = 0
    this.scale = 1
    this.padding = 2
    this.speed = 0
    this.isBefore = false
    this.isAfter = false
    this.createShader()
    this.createMesh()
    this.createTitle()
    this.onResize()
  }

  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true })
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);

          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);

          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius },
      },
      transparent: true,
    })

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = this.image
    img.onload = () => {
      texture.image = img
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight]
    }
  }

  createMesh() {
    this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program })
    this.plane.setParent(this.scene)
  }

  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      font: this.font,
    })
  }

  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current - this.extra

    const x = this.plane.position.x
    const H = this.viewport.width / 2

    if (this.bend === 0) {
      this.plane.position.y = 0
      this.plane.rotation.z = 0
    } else {
      const B_abs = Math.abs(this.bend)
      const R = (H * H + B_abs * B_abs) / (2 * B_abs)
      const effectiveX = Math.min(Math.abs(x), H)
      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX)

      if (this.bend > 0) {
        this.plane.position.y = -arc
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R)
      } else {
        this.plane.position.y = arc
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R)
      }
    }

    this.speed = scroll.current - scroll.last
    this.program.uniforms.uTime.value += 0.04
    this.program.uniforms.uSpeed.value = this.speed

    const planeOffset = this.plane.scale.x / 2
    const viewportOffset = this.viewport.width / 2
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset

    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal
      this.isBefore = this.isAfter = false
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal
      this.isBefore = this.isAfter = false
    }
  }

  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen
    if (viewport) this.viewport = viewport
    this.scale = this.screen.height / 1500
    this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height
    this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width
    this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y]
    this.padding = 2
    this.width = this.plane.scale.x + this.padding
    this.widthTotal = this.width * this.length
    this.x = this.width * this.index
  }
}

class App {
  constructor(container, { items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase, autoDrift, tips }) {
    this.container = container
    this.scrollSpeed = scrollSpeed
    this.autoDrift = autoDrift
    this.tips = tips || []
    this.itemCount = items.length
    this.hoverIndex = -1
    this.pointer = null
    this.rect = null
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0, position: 0 }
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200)
    this.isDown = false
    this.start = 0
    this.visible = true
    this.idle = 0

    autoBind(this)

    this.createRenderer()
    this.createCamera()
    this.createScene()
    this.onResize()
    this.createGeometry()
    this.createMedias(items, bend, textColor, borderRadius, font)
    this.createTip()
    this.update()
    this.addEventListeners()
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    })
    this.gl = this.renderer.gl
    this.gl.clearColor(0, 0, 0, 0)
    this.container.appendChild(this.gl.canvas)
  }

  createCamera() {
    this.camera = new Camera(this.gl)
    this.camera.fov = 45
    this.camera.position.z = 20
  }

  createScene() {
    this.scene = new Transform()
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, { heightSegments: 50, widthSegments: 100 })
  }

  createMedias(items, bend, textColor, borderRadius, font) {
    // Doublé pour que la boucle se referme sans trou visible.
    this.mediasImages = [...items, ...items]
    this.medias = this.mediasImages.map((data, index) =>
      new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font,
      })
    )
  }

  onTouchDown(e) {
    this.isDown = true
    this.idle = 0
    this.scroll.position = this.scroll.current
    this.start = 'touches' in e ? e.touches[0].clientX : e.clientX
  }

  onTouchMove(e) {
    if (!this.isDown) return
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX
    const distance = (this.start - x) * (this.scrollSpeed * 0.025)
    this.scroll.target = this.scroll.position + distance
  }

  onTouchUp() {
    if (!this.isDown) return
    this.isDown = false
    this.onCheck()
  }

  onWheel(e) {
    const delta = e.deltaY || e.wheelDelta || e.detail
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2
    this.idle = 0
    this.onCheckDebounce()
  }

  onCheck() {
    if (!this.medias || !this.medias[0]) return
    const width = this.medias[0].width
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width)
    const item = width * itemIndex
    this.scroll.target = this.scroll.target < 0 ? -item : item
  }


  /* ──────────────────────────────────────────────────────────────────────────
   * Infobulle pilotée en DOM direct, jamais par React.
   *
   * La version précédente remontait l'index survolé à un `useState` : chaque
   * changement relançait un rendu de toute la section networking, galerie
   * comprise, et la faisait saccader. Ici le nœud est créé une fois puis mis à
   * jour par `textContent` et `transform` — aucun rendu React n'est déclenché.
   * ────────────────────────────────────────────────────────────────────────── */
  createTip() {
    const el = document.createElement('div')
    el.className = 'photo-tip photo-tip--gl'
    el.innerHTML = '<div class="photo-tip-name serif"></div><div class="photo-tip-role"></div><div class="photo-tip-org"></div>'
    this.container.appendChild(el)
    this.tip = el
    this.tipName = el.querySelector('.photo-tip-name')
    this.tipRole = el.querySelector('.photo-tip-role')
    this.tipOrg = el.querySelector('.photo-tip-org')
  }

  /**
   * Quelle carte se trouve sous le curseur ?
   *
   * Il n'y a pas d'élément HTML par photo : les plans vivent dans la scène.
   * On repasse des pixels écran aux unités de la scène — le viewport couvre
   * `viewport.width × viewport.height` unités centrées sur l'origine — puis on
   * teste l'appartenance à chaque plan.
   *
   * La rotation induite par la courbure est ignorée : la boîte reste droite.
   * L'écart tient en quelques pixels sur les bords, invisible pour décider
   * quelle fiche afficher, et évite un test polygone par frame.
   */
  hitTest(clientX, clientY) {
    if (!this.medias || !this.viewport) return -1
    // Rectangle mis en cache : le relire à chaque frame forcerait un recalcul de
    // mise en page pendant que la scène rend. Invalidé au redimensionnement.
    const rect = this.rect || (this.rect = this.gl.canvas.getBoundingClientRect())
    if (!rect.width || !rect.height) return -1
    const wx = (((clientX - rect.left) / rect.width) * 2 - 1) * (this.viewport.width / 2)
    const wy = -((((clientY - rect.top) / rect.height) * 2 - 1)) * (this.viewport.height / 2)
    let best = -1, bestDist = Infinity
    this.medias.forEach((m, i) => {
      const dx = wx - m.plane.position.x, dy = wy - m.plane.position.y
      if (Math.abs(dx) <= m.plane.scale.x / 2 && Math.abs(dy) <= m.plane.scale.y / 2) {
        const d = dx * dx + dy * dy
        if (d < bestDist) { bestDist = d; best = i }
      }
    })
    return best
  }

  onPointerHover(e) {
    // On ne mémorise que la position : le test est fait une fois par frame,
    // un mousemove pouvant arriver plusieurs fois entre deux rendus.
    if (this.pointer && this.pointer.x === e.clientX && this.pointer.y === e.clientY) return
    this.pointer = { x: e.clientX, y: e.clientY }
    this.pointerMoved = true
  }

  onPointerOut() {
    this.pointer = null
    this.hoverIndex = -1
    if (this.tip) this.tip.classList.remove('is-on')
  }

  resolveHover() {
    if (!this.tip || !this.pointer) return
    // Inutile de retester tant que ni la souris ni la galerie n'ont bougé :
    // le résultat serait identique.
    const drifting = Math.abs(this.scroll.current - this.scroll.last) > 0.001
    if (!this.pointerMoved && !drifting && this.hoverIndex !== -1) return
    // Pendant un glissement l'utilisateur déplace la galerie : une fiche qui
    // saute de carte en carte parasiterait le geste.
    const idx = this.isDown ? -1 : this.hitTest(this.pointer.x, this.pointer.y)

    if (idx !== this.hoverIndex) {
      this.hoverIndex = idx
      if (idx === -1) this.tip.classList.remove('is-on')
      else {
        const t = this.tips[idx % this.itemCount]
        if (t) {
          this.tipName.textContent = t.name || ''
          this.tipRole.textContent = t.role || ''
          this.tipOrg.textContent = t.org || ''
          this.tip.classList.add('is-on')
        }
      }
    }

    // Le `transform` n'est réécrit que si la souris a bougé. Le curseur est
    // souvent immobile pendant que la galerie dérive : écrire la même valeur à
    // chaque frame invalidait le style pour rien.
    if (this.pointerMoved && this.hoverIndex !== -1 && this.rect) {
      this.pointerMoved = false
      const x = this.pointer.x - this.rect.left + 20
      const y = this.pointer.y - this.rect.top + 20
      this.tip.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }
  }

  onResize() {
    this.rect = null
    this.screen = {
      width: this.container.clientWidth || 1,
      height: this.container.clientHeight || 1,
    }
    this.renderer.setSize(this.screen.width, this.screen.height)
    this.camera.perspective({ aspect: this.screen.width / this.screen.height })
    const fov = (this.camera.fov * Math.PI) / 180
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z
    const width = height * this.camera.aspect
    this.viewport = { width, height }
    if (this.medias) {
      this.medias.forEach((media) => media.onResize({ screen: this.screen, viewport: this.viewport }))
    }
  }

  update() {
    this.raf = window.requestAnimationFrame(this.update)
    if (!this.visible) return

    // Dérive au repos : reprend la main ~1s après la dernière interaction.
    if (this.autoDrift && !this.isDown) {
      this.idle += 1
      if (this.idle > 60) this.scroll.target += this.autoDrift
    }

    this.resolveHover()
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease)
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left'
    if (this.medias) this.medias.forEach((media) => media.update(this.scroll, direction))
    this.renderer.render({ scene: this.scene, camera: this.camera })
    this.scroll.last = this.scroll.current
  }

  addEventListeners() {
    this.boundOnResize = this.onResize
    this.boundOnPointerHover = this.onPointerHover
    this.boundOnPointerOut = this.onPointerOut
    this.boundOnWheel = this.onWheel
    this.boundOnTouchDown = this.onTouchDown
    this.boundOnTouchMove = this.onTouchMove
    this.boundOnTouchUp = this.onTouchUp


    window.addEventListener('resize', this.boundOnResize)
    // Molette limitée au conteneur : la page continue de défiler normalement.
    this.container.addEventListener('wheel', this.boundOnWheel, { passive: true })
    this.container.addEventListener('mousemove', this.boundOnPointerHover, { passive: true })
    this.container.addEventListener('mouseleave', this.boundOnPointerOut)
    this.container.addEventListener('mousedown', this.boundOnTouchDown)
    window.addEventListener('mousemove', this.boundOnTouchMove)
    window.addEventListener('mouseup', this.boundOnTouchUp)
    this.container.addEventListener('touchstart', this.boundOnTouchDown, { passive: true })
    window.addEventListener('touchmove', this.boundOnTouchMove, { passive: true })
    window.addEventListener('touchend', this.boundOnTouchUp)

    // Ne pas brûler de GPU quand la section n'est pas à l'écran.
    this.observer = new IntersectionObserver(
      ([entry]) => { this.visible = entry.isIntersecting },
      { rootMargin: '120px' }
    )
    this.observer.observe(this.container)
  }

  destroy() {
    window.cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.boundOnResize)
    this.container.removeEventListener('wheel', this.boundOnWheel)
    this.container.removeEventListener('mousemove', this.boundOnPointerHover)
    this.container.removeEventListener('mouseleave', this.boundOnPointerOut)
    this.container.removeEventListener('mousedown', this.boundOnTouchDown)
    window.removeEventListener('mousemove', this.boundOnTouchMove)
    window.removeEventListener('mouseup', this.boundOnTouchUp)
    this.container.removeEventListener('touchstart', this.boundOnTouchDown)
    window.removeEventListener('touchmove', this.boundOnTouchMove)
    window.removeEventListener('touchend', this.boundOnTouchUp)
    this.observer?.disconnect()
    this.tip?.remove()

    const canvas = this.renderer?.gl?.canvas
    if (canvas?.parentNode) canvas.parentNode.removeChild(canvas)
    this.gl?.getExtension('WEBGL_lose_context')?.loseContext()
  }
}

export default function CircularGallery({
  items = [],
  bend = 3,
  borderRadius = 0.05,
  scrollSpeed = 2,
  scrollEase = 0.045,
  autoDrift = 0.06,
  tips = [],
  textColor = '#D4AF6A',
  font = '500 26px "Plus Jakarta Sans", sans-serif',
  className = '',
  style,
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el || items.length === 0) return
    // Pas de WebGL décoratif quand l'utilisateur demande moins d'animation.
    if (reducedMotion()) return

    const app = new App(el, {
      items,
      bend,
      textColor,
      borderRadius,
      font,
      scrollSpeed,
      scrollEase,
      autoDrift,
      tips,
    })
    return () => app.destroy()
  }, [items, bend, borderRadius, scrollSpeed, scrollEase, autoDrift, textColor, font, tips])

  return <div ref={containerRef} className={`circular-gallery ${className}`} style={style} />
}
