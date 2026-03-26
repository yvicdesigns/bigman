// ============================================================
// COMPOSANT : Button
// Bouton réutilisable avec plusieurs variantes de style
// ============================================================

// "children" représente le texte ou les éléments à l'intérieur du bouton
// "variante" détermine le style : 'primary', 'secondary', 'jaune', 'danger'
// "...props" capture tous les autres attributs HTML (onClick, disabled, type, etc.)
export default function Button({
  children,
  variante = 'primary',
  taille = 'normal',
  pleineLargeur = false,
  chargement = false,
  className = '',
  ...props
}) {
  // Styles de base communs à tous les boutons
  const stylesBase = `
    inline-flex items-center justify-center gap-2 font-bold rounded-xl
    transition-all duration-200 active:scale-95 select-none cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
    no-tap-highlight
  `

  // Styles selon la variante
  const stylesVariante = {
    primary: 'bg-jaune hover:bg-jaune-sombre text-noir',
    secondary: 'border-2 border-rouge text-rouge hover:bg-rouge hover:text-white',
    jaune: 'bg-jaune hover:bg-yellow-400 text-noir',
    danger: 'bg-red-700 hover:bg-red-800 text-white',
    ghost: 'text-gray-400 hover:text-white hover:bg-noir-clair',
    whatsapp: 'bg-green-500 hover:bg-green-600 text-white',
  }

  // Styles selon la taille
  const stylesTaille = {
    petit: 'px-4 py-2 text-sm min-h-[40px]',
    normal: 'px-6 py-3 text-base min-h-[48px]',
    grand: 'px-8 py-4 text-lg min-h-[56px]',
  }

  return (
    <button
      className={`
        ${stylesBase}
        ${stylesVariante[variante] || stylesVariante.primary}
        ${stylesTaille[taille] || stylesTaille.normal}
        ${pleineLargeur ? 'w-full' : ''}
        ${className}
      `}
      // Désactive le bouton pendant le chargement
      disabled={chargement || props.disabled}
      {...props}
    >
      {/* Spinner de chargement */}
      {chargement && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
