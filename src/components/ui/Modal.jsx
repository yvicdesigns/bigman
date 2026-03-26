// ============================================================
// COMPOSANT : Modal
// Fenêtre modale (popup) qui apparaît par-dessus le contenu
// ============================================================

import { useEffect } from 'react'

export default function Modal({ ouvert, onFermer, titre, children, taille = 'normal' }) {
  // Empêche le défilement de la page derrière la modale
  useEffect(() => {
    if (ouvert) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    // Nettoyage au démontage du composant
    return () => {
      document.body.style.overflow = ''
    }
  }, [ouvert])

  // Ferme la modale avec la touche Échap
  useEffect(() => {
    function gererTouche(e) {
      if (e.key === 'Escape') onFermer()
    }
    if (ouvert) document.addEventListener('keydown', gererTouche)
    return () => document.removeEventListener('keydown', gererTouche)
  }, [ouvert, onFermer])

  // Ne rend rien si la modale est fermée
  if (!ouvert) return null

  const taillesModale = {
    petit: 'max-w-sm',
    normal: 'max-w-md',
    grand: 'max-w-2xl',
    plein: 'max-w-full mx-4',
  }

  return (
    // Overlay sombre qui couvre toute la page
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 animate-fade-in"
      onClick={onFermer} // Clic sur l'overlay ferme la modale
    >
      {/* Contenu de la modale */}
      <div
        className={`
          w-full ${taillesModale[taille]} bg-noir-clair rounded-t-3xl sm:rounded-3xl
          max-h-[90vh] overflow-y-auto animate-slide-up
        `}
        onClick={(e) => e.stopPropagation()} // Empêche la fermeture au clic sur le contenu
      >
        {/* Poignée de glissement (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 bg-gray-600 rounded-full" />
        </div>

        {/* En-tête de la modale */}
        {titre && (
          <div className="flex items-center justify-between p-5 border-b border-gray-700">
            <h2 className="text-lg font-bold text-white">{titre}</h2>
            {/* Bouton fermeture */}
            <button
              onClick={onFermer}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Contenu passé en children */}
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  )
}
