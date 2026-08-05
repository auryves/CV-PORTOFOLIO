import { useMagnetic } from '../hooks/useMotionFx'

/**
 * Bouton à halo radial animé — d'après `bouton/bouton contact.txt`
 * (dossier « animation code »), rethémé à la palette du portfolio.
 *
 * L'original virait bleu → teal → jaune acide et cassait l'identité ; le dégradé
 * suit désormais violet → lavande → or. Les angles restent nets (2 px) et le
 * libellé en capitales espacées, pour rester dans la même famille que
 * `.btn-prim` / `.btn-gold` au lieu d'introduire un bouton étranger.
 *
 * Le mouvement vient de propriétés CSS enregistrées via `@property` : ce sont
 * elles qui rendent un dégradé radial interpolable, donc animable au survol.
 */
export default function GlowButton({
  as,
  href,
  children,
  className = '',
  variant = 'gold',
  magnetic = true,
  ...rest
}) {
  const Tag = as || (href ? 'a' : 'button')
  const magRef = useMagnetic(0.3)

  const btn = (
    <Tag
      href={href}
      className={`glow-btn glow-btn--${variant} ${className}`}
      type={Tag === 'button' ? 'button' : undefined}
      {...rest}
    >
      <span className="glow-btn-shine" aria-hidden="true"><span /></span>
      <span className="glow-btn-bg" aria-hidden="true" />
      <span className="glow-btn-label">{children}</span>
    </Tag>
  )

  if (!magnetic) return btn
  return <span className="magnetic" ref={magRef}>{btn}</span>
}
