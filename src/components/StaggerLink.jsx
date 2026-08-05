import { useState } from 'react'
import { motion } from 'framer-motion'
import { reducedMotion } from '../motion'

/**
 * Lien à substitution lettre par lettre — d'après `TextStaggerHover`
 * (`un texte plein damination.txt`).
 *
 * Au survol, chaque caractère s'échappe vers le haut pendant qu'un double doré
 * monte à sa place, avec un décalage croissant de gauche à droite. Le mot est
 * donc remplacé, pas souligné.
 *
 * Remplace le soulignement précédent, qui débordait largement du texte dans le
 * pied de page : les liens y sont en colonne flex, donc chaque <a> occupait
 * toute la largeur de la colonne et le filet avec.
 *
 * Les trois composants distincts de l'original (wrapper, calque actif, calque
 * caché reliés par un contexte React) sont fondus en un seul : ils n'étaient
 * jamais utilisés séparément ici, et le contexte imposait un fournisseur par
 * lien.
 */
const EASE = [0.25, 0.46, 0.45, 0.94]
const STAGGER = 0.022

function Row({ text, hovered, ghost }) {
  const chars = Array.from(text)
  return (
    <span className={ghost ? 'stagger-row stagger-row--ghost' : 'stagger-row'} aria-hidden={ghost}>
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          className="stagger-char"
          initial={false}
          animate={
            ghost
              ? { y: hovered ? '0%' : '105%', opacity: hovered ? 1 : 0 }
              : { y: hovered ? '-105%' : '0%', opacity: hovered ? 0 : 1 }
          }
          transition={{ delay: i * STAGGER, duration: 0.32, ease: EASE }}
        >
          {ch === ' ' ? ' ' : ch}
        </motion.span>
      ))}
    </span>
  )
}

export default function StaggerLink({
  as,
  href,
  children,
  className = '',
  active = false,
  onClick,
  ...rest
}) {
  const [hovered, setHovered] = useState(false)
  const Tag = as || 'a'
  const text = String(children)

  // Sans mouvement, un lien nu reste un lien : on rend le texte tel quel.
  if (reducedMotion()) {
    return (
      <Tag href={href} className={`stagger-link ${active ? 'is-active' : ''} ${className}`} onClick={onClick} {...rest}>
        {text}
      </Tag>
    )
  }

  return (
    <Tag
      href={href}
      className={`stagger-link ${active ? 'is-active' : ''} ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      aria-label={text}
      {...rest}
    >
      <Row text={text} hovered={hovered} />
      <Row text={text} hovered={hovered} ghost />
    </Tag>
  )
}
