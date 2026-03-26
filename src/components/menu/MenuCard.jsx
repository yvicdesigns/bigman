// ============================================================
// COMPOSANT : MenuCard
// Carte d'un produit dans le menu
// ============================================================

import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { formaterPrix } from '../../lib/whatsapp'

export default function MenuCard({ produit, onOuvrir }) {
  // État local pour l'animation du bouton d'ajout
  const [ajoutAnimation, setAjoutAnimation] = useState(false)
  const { ajouterAuPanier, items } = useCart()

  // Vérifie si ce produit est déjà dans le panier
  const quantiteDansPanier = items.find(item => item.id === produit.id)?.quantite || 0

  // Gère l'ajout au panier avec animation
  function handleAjouter(e) {
    // Empêche l'ouverture de la modale produit
    e.stopPropagation()

    ajouterAuPanier(produit)

    // Animation de confirmation
    setAjoutAnimation(true)
    setTimeout(() => setAjoutAnimation(false), 600)
  }

  return (
    <article
      className="carte-produit cursor-pointer"
      onClick={() => onOuvrir && onOuvrir(produit)}
    >
      {/* Image du produit avec lazy loading */}
      <div className="relative overflow-hidden h-44">
        <img
          src={produit.image_url}
          alt={produit.nom}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy" // Chargement différé : l'image se charge quand elle entre dans le viewport
          onError={(e) => {
            // Si l'image ne charge pas, affiche un placeholder
            e.target.src = 'https://via.placeholder.com/400x300/2D2D2D/E63946?text=🍔'
          }}
        />

        {/* Overlay gradient pour lisibilité */}
        <div className="absolute inset-0 gradient-noir opacity-40" />

        {/* Badge "Populaire" */}
        {produit.populaire && (
          <span className="absolute top-2 left-2 badge bg-jaune text-noir text-[10px]">
            ⭐ Populaire
          </span>
        )}

        {/* Badge quantité si dans le panier */}
        {quantiteDansPanier > 0 && (
          <span className="absolute top-2 right-2 badge bg-rouge text-white text-[10px]">
            {quantiteDansPanier} dans le panier
          </span>
        )}
      </div>

      {/* Infos produit */}
      <div className="p-3">
        <h3 className="font-bold text-white text-sm leading-tight mb-1 line-clamp-1">
          {produit.nom}
        </h3>
        <p className="text-gray-400 text-xs line-clamp-2 mb-3 leading-relaxed">
          {produit.description}
        </p>

        {/* Prix et bouton d'ajout */}
        <div className="flex items-center justify-between">
          <span className="font-black text-jaune text-base">
            {formaterPrix(produit.prix)} <span className="text-xs font-normal text-gray-400">FCFA</span>
          </span>

          {/* Bouton d'ajout au panier */}
          <button
            onClick={handleAjouter}
            className={`
              w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200
              ${ajoutAnimation
                ? 'bg-green-500 scale-125'
                : 'bg-jaune hover:bg-jaune-sombre active:scale-90'
              }
            `}
            aria-label={`Ajouter ${produit.nom} au panier`}
          >
            {ajoutAnimation ? (
              <span className="text-noir text-sm">✓</span>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
