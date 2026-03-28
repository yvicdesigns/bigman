// ============================================================
// COMPOSANT : ProductModal
// Fenêtre modale avec les détails d'un produit
// Permet d'ajouter au panier avec options (taille, suppléments)
// ============================================================

import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { useCart } from '../../context/CartContext'
import { formaterPrix } from '../../lib/whatsapp'
import { getAvisProduit } from '../../lib/supabase'

export default function ProductModal({ produit, ouvert, onFermer }) {
  const { ajouterAuPanier } = useCart()

  // Options sélectionnées par l'utilisateur
  const [tailleSelectee, setTailleSelectee] = useState(null)
  const [supplementsSelectionnes, setSupplementsSelectionnes] = useState([])
  const [quantite, setQuantite] = useState(1)
  const [avis, setAvis] = useState([])
  const [avisOuvert, setAvisOuvert] = useState(false)

  useEffect(() => {
    if (ouvert && produit) {
      getAvisProduit(produit.nom).then(setAvis)
      setAvisOuvert(false)
    }
  }, [ouvert, produit?.nom])

  // Si aucun produit n'est passé, ne rien afficher
  if (!produit) return null

  // Calcule le prix total avec les suppléments
  const prixSupplements = supplementsSelectionnes.reduce((total, supp) => {
    // Extrait le prix du supplément (format : "Bacon +500")
    const match = supp.match(/\+(\d+)/)
    return total + (match ? parseInt(match[1]) : 0)
  }, 0)
  const prixTotal = (produit.prix + prixSupplements) * quantite

  // Ajoute/retire un supplément de la sélection
  function toggleSupplements(supplement) {
    setSupplementsSelectionnes(prev =>
      prev.includes(supplement)
        ? prev.filter(s => s !== supplement) // Retire si déjà sélectionné
        : [...prev, supplement]              // Ajoute sinon
    )
  }

  // Ajoute le produit configuré au panier
  function handleAjouterAuPanier() {
    const produitConfigure = {
      ...produit,
      // Crée un ID unique si des options sont sélectionnées
      id: tailleSelectee || supplementsSelectionnes.length > 0
        ? `${produit.id}-${tailleSelectee}-${supplementsSelectionnes.join(',')}`
        : produit.id,
      nom: tailleSelectee
        ? `${produit.nom} (${tailleSelectee})`
        : produit.nom,
      prix: produit.prix + prixSupplements,
      supplements: supplementsSelectionnes,
      taille: tailleSelectee,
    }

    // Ajoute plusieurs fois selon la quantité
    for (let i = 0; i < quantite; i++) {
      ajouterAuPanier(produitConfigure)
    }

    // Ferme la modale et remet les options par défaut
    onFermer()
    setQuantite(1)
    setTailleSelectee(null)
    setSupplementsSelectionnes([])
  }

  const options = produit.options || {}

  return (
    <Modal ouvert={ouvert} onFermer={onFermer} taille='plein'>
      {/* Image du produit */}
      <div className="-m-5 mb-5">
        <div className="relative h-56 overflow-hidden">
          <img
            src={produit.image_url}
            alt={produit.nom}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 gradient-noir" />
          <div className="absolute bottom-4 left-4">
            <h2 className="text-2xl font-black text-white">{produit.nom}</h2>
            <p className="text-jaune font-bold text-lg">
              {formaterPrix(produit.prix)} FCFA
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-5 leading-relaxed">
        {produit.description}
      </p>

      {/* Sélection de taille */}
      {options.tailles && options.tailles.length > 0 && (
        <div className="mb-5">
          <h3 className="font-bold text-white mb-3">Choisir la taille</h3>
          <div className="flex gap-2">
            {options.tailles.map((taille) => (
              <button
                key={taille}
                onClick={() => setTailleSelectee(taille)}
                className={`
                  flex-1 py-2 rounded-xl text-sm font-semibold transition-all border-2
                  ${tailleSelectee === taille
                    ? 'border-rouge bg-rouge/20 text-rouge'
                    : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }
                `}
              >
                {taille}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suppléments */}
      {options.supplements && options.supplements.length > 0 && (
        <div className="mb-5">
          <h3 className="font-bold text-white mb-3">Ajouter des suppléments</h3>
          <div className="space-y-2">
            {options.supplements.map((supplement) => {
              const estSelectionne = supplementsSelectionnes.includes(supplement)
              return (
                <button
                  key={supplement}
                  onClick={() => toggleSupplements(supplement)}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all
                    ${estSelectionne
                      ? 'border-rouge bg-rouge/20'
                      : 'border-gray-700 hover:border-gray-600'
                    }
                  `}
                >
                  <span className={`text-sm font-medium ${estSelectionne ? 'text-white' : 'text-gray-300'}`}>
                    {supplement.replace(/\+\d+/, '').trim()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-jaune text-xs font-bold">
                      {supplement.match(/\+\d+/)?.[0]} FCFA
                    </span>
                    {/* Case à cocher visuelle */}
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${estSelectionne ? 'bg-rouge border-rouge' : 'border-gray-600'}`}>
                      {estSelectionne && <span className="text-white text-xs">✓</span>}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Sélecteur de quantité */}
      <div className="flex items-center justify-between mb-6">
        <span className="font-bold text-white">Quantité</span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setQuantite(Math.max(1, quantite - 1))}
            className="w-10 h-10 rounded-full bg-noir-gris flex items-center justify-center text-white hover:bg-gray-600 transition-colors font-bold text-xl"
          >
            −
          </button>
          <span className="text-white font-bold text-xl w-6 text-center">{quantite}</span>
          <button
            onClick={() => setQuantite(quantite + 1)}
            className="w-10 h-10 rounded-full bg-rouge flex items-center justify-center text-white hover:bg-rouge-sombre transition-colors font-bold text-xl"
          >
            +
          </button>
        </div>
      </div>

      {/* Avis clients — accordéon */}
      {avis.length > 0 && (
        <div className="mb-6 border border-gray-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setAvisOuvert(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-noir-clair transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-bold">Avis clients</span>
              <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full">{avis.length}</span>
              {produit.note_moyenne > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[1,2,3,4,5].map(n => (
                      <span key={n} className={`text-xs ${n <= Math.round(produit.note_moyenne) ? 'text-yellow-400' : 'text-gray-700'}`}>★</span>
                    ))}
                  </div>
                  <span className="text-gray-500 text-xs">{produit.note_moyenne}</span>
                </div>
              )}
            </div>
            <span className={`text-gray-500 text-xs transition-transform duration-200 ${avisOuvert ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {avisOuvert && (
            <div className="border-t border-gray-800 divide-y divide-gray-800">
              {avis.map(a => (
                <div key={a.id} className="px-4 py-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-xs font-semibold">{a.nom_client || 'Anonyme'}</span>
                    <div className="flex">
                      {[1,2,3,4,5].map(n => (
                        <span key={n} className={`text-xs ${n <= a.note ? 'text-yellow-400' : 'text-gray-700'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  {a.commentaire && (
                    <p className="text-gray-400 text-xs leading-relaxed">"{a.commentaire}"</p>
                  )}
                  {a.reponse_admin && (
                    <div className="bg-rouge/10 border border-rouge/20 rounded-lg px-2.5 py-1.5">
                      <p className="text-rouge text-[10px] font-bold mb-0.5">Réponse du restaurant</p>
                      <p className="text-gray-300 text-xs">{a.reponse_admin}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bouton d'ajout au panier */}
      <Button variante="primary" pleineLargeur taille="grand" onClick={handleAjouterAuPanier}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 7H4l1-7z" />
        </svg>
        Ajouter au panier — {formaterPrix(prixTotal)} FCFA
      </Button>
    </Modal>
  )
}
