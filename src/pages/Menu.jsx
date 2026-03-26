// ============================================================
// PAGE : Menu
// Affiche tous les produits avec filtres par catégorie
// ============================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMenu } from '../hooks/useMenu'
import { useCart } from '../context/CartContext'
import MenuCard from '../components/menu/MenuCard'
import CategoryFilter from '../components/menu/CategoryFilter'
import ProductModal from '../components/menu/ProductModal'
import { SkeletonGrille } from '../components/ui/SkeletonLoader'
import { formaterPrix } from '../lib/whatsapp'

export default function Menu() {
  const {
    produits,
    categorieActive,
    setCategorieActive,
    chargement,
    erreur,
    recharger,
  } = useMenu()

  const { totalPanier, nombreArticles } = useCart()
  const [produitSelectionne, setProduitSelectionne] = useState(null)
  const [recherche, setRecherche] = useState('')

  // Filtre supplémentaire par recherche textuelle
  const produitsFiltres = recherche
    ? produits.filter(p =>
        p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
        p.description.toLowerCase().includes(recherche.toLowerCase())
      )
    : produits

  return (
    <div className="min-h-screen pb-28">
      {/* ---- En-tête ---- */}
      <div className="px-4 max-w-md mx-auto pt-5 pb-4">
        <h1 className="text-2xl font-black text-white mb-4">Notre menu</h1>

        {/* Barre de recherche */}
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Rechercher un produit..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="input-field pl-9"
          />
        </div>

        {/* Filtres de catégories */}
        <CategoryFilter
          categorieActive={categorieActive}
          onChange={(cat) => {
            setCategorieActive(cat)
            setRecherche('') // Réinitialise la recherche au changement de catégorie
          }}
        />
      </div>

      {/* ---- Contenu principal ---- */}
      <div className="px-4 max-w-md mx-auto">

        {/* Message d'erreur */}
        {erreur && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 mb-4 text-center">
            <p className="text-red-400 text-sm mb-2">Erreur de chargement</p>
            <button onClick={recharger} className="text-rouge text-sm font-bold">
              Réessayer →
            </button>
          </div>
        )}

        {/* Nombre de résultats */}
        {!chargement && (
          <p className="text-gray-500 text-sm mb-4">
            {produitsFiltres.length} produit{produitsFiltres.length > 1 ? 's' : ''}
            {categorieActive !== 'tous' && ` dans cette catégorie`}
          </p>
        )}

        {/* Grille de produits ou skeleton */}
        {chargement ? (
          <SkeletonGrille nombre={6} />
        ) : produitsFiltres.length === 0 ? (
          // Message si aucun résultat
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🔍</span>
            <p className="text-gray-400 text-sm">Aucun produit trouvé</p>
            {recherche && (
              <button
                onClick={() => setRecherche('')}
                className="text-rouge text-sm font-bold mt-2"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {produitsFiltres.map((produit) => (
              <MenuCard
                key={produit.id}
                produit={produit}
                onOuvrir={setProduitSelectionne}
              />
            ))}
          </div>
        )}
      </div>

      {/* ---- Bouton flottant panier ---- */}
      {nombreArticles > 0 && (
        <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-30 animate-slide-up">
          <Link
            to="/panier"
            className="flex items-center justify-between bg-jaune rounded-2xl p-4 shadow-2xl shadow-jaune/40 no-tap-highlight"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 bg-noir/20 rounded-full flex items-center justify-center text-noir text-xs font-bold">
                {nombreArticles}
              </span>
              <span className="text-noir font-bold">Voir mon panier</span>
            </div>
            <span className="text-noir font-black">{formaterPrix(totalPanier)} FCFA</span>
          </Link>
        </div>
      )}

      {/* Modale produit */}
      <ProductModal
        produit={produitSelectionne}
        ouvert={!!produitSelectionne}
        onFermer={() => setProduitSelectionne(null)}
      />
    </div>
  )
}
