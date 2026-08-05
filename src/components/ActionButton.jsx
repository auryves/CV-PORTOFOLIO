import { useMagnetic } from '../hooks/useMotionFx'

/**
 * Bouton d'action principal.
 *
 * Le halo radial animé précédent faisait virer le dégradé du violet à l'or au
 * survol : trop bavard pour un site qui tient sur des aplats sombres et des
 * filets fins. Ici la couleur ne bouge pas du tout — le mouvement fait le
 * travail :
 *   1. le libellé glisse vers le haut pendant qu'un double identique arrive par
 *      le bas (le texte se « rembobine » au lieu de clignoter) ;
 *   2. un remplissage de la même teinte monte depuis le bas ;
 *   3. la flèche part à droite et revient par la gauche.
 *
 * Les deux libellés sont superposés dans un masque : c'est ce qui rend la
 * substitution continue plutôt qu'un simple fondu.
 */
export default function ActionButton({
  as,
  href,
  children,
  className = '',
  variant = 'gold',
  arrow,
  magnetic = true,
  ...rest
}) {
  const Tag = as || (href ? 'a' : 'button')
  const magRef = useMagnetic(0.28)

  const content = (
    <span className="act-btn-line">
      {children}
      {arrow && <span className="act-btn-arrow" aria-hidden="true">{arrow}</span>}
    </span>
  )

  const btn = (
    <Tag
      href={href}
      className={`act-btn act-btn--${variant} ${className}`}
      type={Tag === 'button' ? 'button' : undefined}
      {...rest}
    >
      <span className="act-btn-fill" aria-hidden="true" />
      <span className="act-btn-mask">
        <span className="act-btn-label">{content}</span>
        {/* Doublon décoratif : déjà lu par le premier libellé. */}
        <span className="act-btn-label act-btn-label--in" aria-hidden="true">{content}</span>
      </span>
    </Tag>
  )

  if (!magnetic) return btn
  return <span className="magnetic" ref={magRef}>{btn}</span>
}
