// ============================================================
// PAGE : Panier
// Affiche les articles du panier et permet de modifier les quantités
// ============================================================

import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Button from '../components/ui/Button'
import { formaterPrix, calculerFraisLivraison } from '../lib/whatsapp'

export default function CartPage() {
  const {
    items,
    nombreArticles,
    totalPanier,
    ajouterAuPanier,
    retirerDuPanier,
    supprimerDuPanier,
    viderPanier,
  } = useCart()

  // Frais de livraison (estimés ici, confirmés à la commande)
  const fraisLivraison = 500

  return (
    <div className="min-h-screen pb-32">
      <div className="px-4 max-w-md mx-auto pt-5">

        {/* ---- En-tête ---- */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-white">Mon panier</h1>
          {items.length > 0 && (
            <button
              onClick={viderPanier}
              className="text-gray-500 text-sm hover:text-rouge transition-colors"
            >
              Tout vider
            </button>
          )}
        </div>

        {/* ---- Panier vide ---- */}
        {items.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-7xl block mb-6">🛒</span>
            <h2 className="text-xl font-bold text-white mb-2">Votre panier est vide</h2>
            <p className="text-gray-400 text-sm mb-8">
              Ajoutez des produits pour commencer votre commande
            </p>
            <Link to="/menu" className="btn-primary inline-flex">
              Voir le menu
            </Link>
          </div>
        ) : (
          <>
            {/* ---- Liste des articles ---- */}
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.id} className="bg-noir-clair rounded-2xl p-4 flex gap-4">
                  {/* Image du produit */}
                  <img
                    src={item.image_url}
                    alt={item.nom}
                    className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                    loading="lazy"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/80/2D2D2D/E63946?text=🍔' }}
                  />

                  {/* Infos du produit */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm leading-tight mb-1 truncate">
                      {item.nom}
                    </h3>

                    {/* Suppléments si présents */}
                    {item.supplements && item.supplements.length > 0 && (
                      <p className="text-gray-500 text-xs mb-2">
                        + {item.supplements.map(s => s.replace(/\+\d+/, '').trim()).join(', ')}
                      </p>
                    )}

                    <p className="text-jaune font-bold text-sm mb-3">
                      {formaterPrix(item.prix)} FCFA
                    </p>

                    {/* Contrôle de quantité + suppression */}
                    <div className="flex items-center justify-between">
                      {/* Boutons +/- quantité */}
                      <div className="flex items-center gap-3 bg-noir rounded-full px-3 py-1.5">
                        <button
                          onClick={() => retirerDuPanier(item.id)}
                          className="text-white w-5 h-5 flex items-center justify-center font-bold text-lg leading-none"
                          aria-label="Diminuer la quantité"
                        >
                          −
                        </button>
                        <span className="text-white font-bold text-sm w-4 text-center">
                          {item.quantite}
                        </span>
                        <button
                          onClick={() => ajouterAuPanier(item)}
                          className="text-rouge w-5 h-5 flex items-center justify-center font-bold text-lg leading-none"
                          aria-label="Augmenter la quantité"
                        >
                          +
                        </button>
                      </div>

                      {/* Sous-total de l'article */}
                      <span className="text-white font-black text-sm">
                        {formaterPrix(item.prix * item.quantite)} FCFA
                      </span>

                      {/* Bouton supprimer */}
                      <button
                        onClick={() => supprimerDuPanier(item.id)}
                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-rouge transition-colors"
                        aria-label={`Supprimer ${item.nom} du panier`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ---- Résumé financier ---- */}
            <div className="bg-noir-clair rounded-2xl p-5 mb-4">
              <h3 className="font-bold text-white mb-4">Récapitulatif</h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Sous-total ({nombreArticles} article{nombreArticles > 1 ? 's' : ''})</span>
                  <span className="text-white font-medium">{formaterPrix(totalPanier)} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Livraison estimée</span>
                  <span className="text-green-400 font-medium">+{formaterPrix(fraisLivraison)} FCFA</span>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4 flex justify-between">
                <span className="text-white font-bold">Total estimé</span>
                <span className="text-jaune font-black text-lg">
                  {formaterPrix(totalPanier + fraisLivraison)} FCFA
                </span>
              </div>

              <p className="text-gray-500 text-xs mt-2">
                * Les frais de livraison définitifs seront confirmés lors de la commande
              </p>
            </div>

            {/* ---- Boutons d'action ---- */}
            <div className="space-y-3">
              <Link to="/commander" className="btn-primary w-full text-lg no-tap-highlight">
                Commander — {formaterPrix(totalPanier)} FCFA
              </Link>
              <Link to="/menu" className="btn-secondary w-full no-tap-highlight">
                Continuer mes achats
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
