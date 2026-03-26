// ============================================================
// COMPOSANT : CategoryFilter
// Barre de filtres par catégorie — défilable horizontalement
// ============================================================

import { CATEGORIES } from '../../hooks/useMenu'

export default function CategoryFilter({ categorieActive, onChange }) {
  return (
    // overflow-x-auto : permet le défilement horizontal
    // scrollbar-hide : masque la scrollbar (défini dans tailwind)
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="flex gap-2 pb-2" style={{ width: 'max-content' }}>
        {CATEGORIES.map((categorie) => {
          const estActive = categorieActive === categorie.id

          return (
            <button
              key={categorie.id}
              onClick={() => onChange(categorie.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                whitespace-nowrap transition-all duration-200 active:scale-95 no-tap-highlight
                ${estActive
                  ? 'bg-jaune text-noir shadow-lg shadow-jaune/30'
                  : 'bg-noir-clair text-gray-400 hover:text-white hover:bg-gray-700'
                }
              `}
            >
              <span>{categorie.emoji}</span>
              <span>{categorie.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
