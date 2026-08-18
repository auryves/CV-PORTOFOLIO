/**
 * Jeu d'icônes au trait.
 *
 * Remplace les emojis qui servaient de pictogrammes dans les données
 * (certifications, différenciateurs, publications). Trois raisons :
 *   1. un emoji est rendu par la police du système — il change d'aspect entre
 *      Windows, macOS, Android et iOS, et échappe donc à l'identité du site ;
 *   2. il arrive en couleurs pleines, étrangères à une palette or et lavande
 *      construite sur des aplats sombres ;
 *   3. il ne peut ni hériter de `currentColor` ni s'aligner sur la graisse des
 *      filets qui structurent la page.
 *
 * Tracés en `stroke` à 1,5 sur une grille de 24, pour rester dans la même
 * famille que les bordures à 1 px du reste de l'interface.
 */
const PATHS = {
  chart: <><path d="M3 3v18h18" /><path d="M7 15v-4M12 17V9M17 13V7" /></>,
  trend: <><path d="M3 3v18h18" /><path d="M6 15l4-4 3 3 5-6" /><path d="M14 8h4v4" /></>,
  bank: <><path d="M3 10L12 4l9 6" /><path d="M5 10v8M10 10v8M14 10v8M19 10v8" /><path d="M3 21h18" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z" /></>,
  rocket: <><path d="M12 2c3 2 5 6 5 10l-5 4-5-4c0-4 2-8 5-10z" /><circle cx="12" cy="9" r="1.6" /><path d="M8 17l-2 5 4-2M16 17l2 5-4-2" /></>,
  news: <><path d="M4 5h13v14H4z" /><path d="M17 9h3v8a2 2 0 0 1-3 1.7" /><path d="M7 9h7M7 13h7M7 16h4" /></>,
  doc: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /><path d="M9 12h6M9 16h4" /></>,
  file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /></>,
  briefcase: <><path d="M3 8h18v12H3z" /><path d="M8 8V5h8v3" /><path d="M3 13h18" /></>,
  money: <><circle cx="12" cy="12" r="9" /><path d="M12 7v10" /><path d="M14.5 9.5a2.5 2.5 0 0 0-5 .6c0 2.6 5 1.4 5 3.9a2.5 2.5 0 0 1-5 .5" /></>,
  mail: <><path d="M3 6h18v12H3z" /><path d="M3 7l9 6 9-6" /></>,
  cloud: <><path d="M7 18a4 4 0 0 1 .5-8a5.5 5.5 0 0 1 10.4 1.6A3.5 3.5 0 0 1 17.5 18z" /></>,
  sheet: <><path d="M4 4h16v16H4z" /><path d="M4 10h16M4 15h16M10 4v16" /></>,
  pin: <><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  cap: <><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11v5c0 1.6 2.7 3 6 3s6-1.4 6-3v-5" /></>,
  phone: <><path d="M6 3h5l2 5-2.5 1.5a12 12 0 0 0 5 5L17 12l5 2v5a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6 3z" /></>,
  chat: <><path d="M4 5h16v11H9l-5 4z" /></>,
}

export default function Icon({ name, size = 24, className = '', style, strokeWidth = 1.5 }) {
  const d = PATHS[name]
  if (!d) return null
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {d}
    </svg>
  )
}
