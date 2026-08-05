import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, SplitText, reducedMotion, refreshSoon } from '../motion'

/* ────────────────────────────────────────────────────────────────────────────
 * Text Reveal Block — 21st.dev (@soralabs), porté en JSX.
 *
 * Chaque ligne du titre est balayée par un bloc de couleur : le bloc s'ouvre
 * par-dessus la ligne, le texte apparaît sous lui, puis le bloc se retire par
 * l'autre bord. Deux temps au lieu d'un simple fondu — c'est ce double
 * mouvement qui donne la sensation « imprimé » plutôt que « animé ».
 *
 * Écarts par rapport à l'original : dépendances `@gsap/react` et `lenis`
 * retirées (le projet n'a ni l'un ni l'autre), et ajout de `center` pour les
 * titres centrés — les wrappers en `width: max-content` s'alignaient à gauche.
 * ──────────────────────────────────────────────────────────────────────────── */

const DIRECTION_CONFIG = {
  down: { axis: 'scaleY', enterOrigin: 'bottom center', exitOrigin: 'top center' },
  left: { axis: 'scaleX', enterOrigin: 'left center', exitOrigin: 'right center' },
  right: { axis: 'scaleX', enterOrigin: 'right center', exitOrigin: 'left center' },
  up: { axis: 'scaleY', enterOrigin: 'top center', exitOrigin: 'bottom center' },
}

function setupLineReveal(container, blockColor, center) {
  const splits = []
  const lines = []
  const blocks = []

  const split = SplitText.create(container, {
    type: 'lines',
    linesClass: 'block-line++',
    lineThreshold: 0.1,
  })
  splits.push(split)

  for (const line of split.lines) {
    const parent = line.parentNode
    if (!parent) continue

    const wrapper = document.createElement('div')
    wrapper.className = 'text-reveal-block-line'
    wrapper.style.position = 'relative'
    wrapper.style.display = 'block'
    wrapper.style.width = 'max-content'
    wrapper.style.maxWidth = '100%'
    wrapper.style.overflow = 'hidden'
    if (center) {
      wrapper.style.marginLeft = 'auto'
      wrapper.style.marginRight = 'auto'
    }

    parent.insertBefore(wrapper, line)
    wrapper.appendChild(line)

    line.style.position = 'relative'
    line.style.display = 'block'

    const block = document.createElement('div')
    block.className = 'text-reveal-block-wipe'
    block.style.position = 'absolute'
    block.style.inset = '0'
    block.style.width = '101%'
    block.style.height = '101%'
    block.style.pointerEvents = 'none'
    block.style.willChange = 'transform'
    block.style.zIndex = '1'
    block.style.backgroundColor = blockColor

    wrapper.appendChild(block)
    lines.push(line)
    blocks.push(block)
  }

  return { splits, lines, blocks }
}

function restoreWrappers(container) {
  container.querySelectorAll('.text-reveal-block-line').forEach((wrapper) => {
    const firstChild = wrapper.firstChild
    if (wrapper.parentNode && firstChild) {
      wrapper.parentNode.insertBefore(firstChild, wrapper)
      wrapper.remove()
    }
  })
}

function buildTimeline(block, line, index, { delay, stagger, duration, direction }) {
  const { axis, exitOrigin } = DIRECTION_CONFIG[direction]
  const tl = gsap.timeline({ delay: delay + index * stagger, paused: true })
  tl.to(block, { [axis]: 1, duration, ease: 'power4.inOut' })
  tl.set(line, { opacity: 1 })
  tl.set(block, { transformOrigin: exitOrigin })
  tl.to(block, { [axis]: 0, duration, ease: 'power4.inOut' })
  return tl
}

export default function TextRevealBlock({
  as: Tag = 'h2',
  children,
  text,
  className,
  style,
  blockColor = 'rgba(212,175,106,0.85)',
  direction = 'left',
  stagger = 0.13,
  duration = 0.6,
  delay = 0,
  center = false,
  start = 'top 88%',
  ...rest
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let disposed = false
    let cleanup

    // Découper avant l'arrivée des polices fige des largeurs de ligne fausses.
    const fonts = document.fonts?.ready ?? Promise.resolve()
    const guard = new Promise((r) => setTimeout(r, 1200))

    Promise.race([fonts, guard]).then(() => {
      if (disposed || !containerRef.current) return

      const setup = setupLineReveal(containerRef.current, blockColor, center)
      const triggers = []

      if (reducedMotion()) {
        gsap.set(setup.lines, { opacity: 1 })
        gsap.set(setup.blocks, { display: 'none' })
      } else {
        const { axis, enterOrigin } = DIRECTION_CONFIG[direction]
        gsap.set(setup.lines, { opacity: 0 })
        gsap.set(setup.blocks, { [axis]: 0, transformOrigin: enterOrigin })

        setup.blocks.forEach((block, i) => {
          const line = setup.lines[i]
          if (!line) return
          const tl = buildTimeline(block, line, i, { delay, stagger, duration, direction })
          triggers.push(
            ScrollTrigger.create({
              trigger: containerRef.current,
              start,
              once: true,
              animation: tl,
              invalidateOnRefresh: true,
            })
          )
        })
        refreshSoon()
      }

      cleanup = () => {
        triggers.forEach((t) => t.kill())
        setup.splits.forEach((s) => s.revert())
        if (containerRef.current) restoreWrappers(containerRef.current)
      }
    })

    return () => {
      disposed = true
      cleanup?.()
    }
  }, [blockColor, direction, stagger, duration, delay, center, start])

  return (
    <Tag ref={containerRef} className={className} style={style} {...rest}>
      {children ?? text}
    </Tag>
  )
}
