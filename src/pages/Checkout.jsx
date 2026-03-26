// ============================================================
// PAGE : Commander (Checkout)
// Formulaire de commande : infos client + mode de livraison + paiement
// ============================================================

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../hooks/useOrders'
import PaymentMethod from '../components/payment/PaymentMethod'
import Button from '../components/ui/Button'
import { formaterPrix, calculerFraisLivraison } from '../lib/whatsapp'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, totalPanier, viderPanier } = useCart()
  const { utilisateur } = useAuth()
  const { passerCommande, chargement } = useOrders()

  // Formulaire avec les infos pré-remplies si l'utilisateur est connecté
  const [formulaire, setFormulaire] = useState({
    nom: utilisateur?.nom || '',
    telephone: utilisateur?.telephone || '',
    adresse: '',
    notes: '',
  })

  const [modeLivraison, setModeLivraison] = useState('livraison')
  const [modePaiement, setModePaiement] = useState('cash')
  const [erreurs, setErreurs] = useState({})

  // Redirige vers le panier si celui-ci est vide
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <span className="text-6xl mb-4">🛒</span>
        <h2 className="text-xl font-bold text-white mb-2">Panier vide</h2>
        <p className="text-gray-400 text-sm mb-6">Ajoutez des produits avant de commander</p>
        <Link to="/menu" className="btn-primary">Voir le menu</Link>
      </div>
    )
  }

  // Met à jour le champ du formulaire
  function handleChangement(champ, valeur) {
    setFormulaire(prev => ({ ...prev, [champ]: valeur }))
    // Efface l'erreur du champ modifié
    if (erreurs[champ]) {
      setErreurs(prev => ({ ...prev, [champ]: null }))
    }
  }

  // Valide le formulaire avant soumission
  function validerFormulaire() {
    const nouvellesErreurs = {}

    if (!formulaire.nom.trim()) {
      nouvellesErreurs.nom = 'Le nom est obligatoire'
    }
    if (!formulaire.telephone.trim()) {
      nouvellesErreurs.telephone = 'Le numéro de téléphone est obligatoire'
    } else if (!/^(\+?242)?\d{9}$/.test(formulaire.telephone.replace(/\s/g, ''))) {
      nouvellesErreurs.telephone = 'Numéro de téléphone invalide (ex: +242 06 XXXXXXX)'
    }
    if (modeLivraison === 'livraison' && !formulaire.adresse.trim()) {
      nouvellesErreurs.adresse = "L'adresse de livraison est obligatoire"
    }

    setErreurs(nouvellesErreurs)
    // Retourne true si aucune erreur
    return Object.keys(nouvellesErreurs).length === 0
  }

  // Soumet la commande
  async function handleSoumission(e) {
    e.preventDefault()

    if (!validerFormulaire()) return

    try {
      const commande = await passerCommande({
        panier: items,
        infosClient: { ...formulaire, modePaiement },
        modeLivraison,
        modePaiement,
        total,
      })

      // Vide le panier après commande réussie
      viderPanier()

      // Redirige vers le suivi de commande
      navigate(`/commandes/${commande.id}`, {
        state: { nouvelleCommande: true, commande }
      })
    } catch (err) {
      console.error('Erreur lors de la commande:', err)
    }
  }

  const fraisLivraison = calculerFraisLivraison(modeLivraison)
  const total = totalPanier + fraisLivraison

  return (
    <div className="min-h-screen pb-10">
      <div className="px-4 max-w-md mx-auto pt-5">

        {/* ---- En-tête ---- */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/panier" className="w-9 h-9 bg-noir-clair rounded-xl flex items-center justify-center text-white">
            ←
          </Link>
          <h1 className="text-2xl font-black text-white">Finaliser la commande</h1>
        </div>

        <form onSubmit={handleSoumission} className="space-y-6">

          {/* ---- Mode de livraison ---- */}
          <div>
            <h3 className="font-bold text-white mb-3">Mode de livraison</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'livraison', label: 'Livraison à domicile', emoji: '🛵', prix: '+500 FCFA' },
                { id: 'retrait', label: 'Retrait sur place', emoji: '🏪', prix: 'Gratuit' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setModeLivraison(mode.id)}
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all
                    ${modeLivraison === mode.id
                      ? 'border-rouge bg-rouge/10'
                      : 'border-gray-700 bg-noir-clair hover:border-gray-600'
                    }
                  `}
                >
                  <span className="text-2xl block mb-2">{mode.emoji}</span>
                  <p className={`text-xs font-semibold leading-tight ${modeLivraison === mode.id ? 'text-white' : 'text-gray-300'}`}>
                    {mode.label}
                  </p>
                  <p className={`text-xs mt-1 ${modeLivraison === mode.id ? 'text-jaune' : 'text-gray-500'}`}>
                    {mode.prix}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* ---- Informations client ---- */}
          <div>
            <h3 className="font-bold text-white mb-3">Vos informations</h3>
            <div className="space-y-3">
              {/* Nom */}
              <div>
                <label htmlFor="nom" className="text-gray-400 text-xs mb-1 block">
                  Nom complet *
                </label>
                <input
                  id="nom"
                  type="text"
                  value={formulaire.nom}
                  onChange={(e) => handleChangement('nom', e.target.value)}
                  placeholder="Ex: Jean-Pierre Moukala"
                  className={`input-field ${erreurs.nom ? 'border-rouge' : ''}`}
                  autoComplete="name"
                />
                {erreurs.nom && (
                  <p className="text-rouge text-xs mt-1">{erreurs.nom}</p>
                )}
              </div>

              {/* Téléphone */}
              <div>
                <label htmlFor="telephone" className="text-gray-400 text-xs mb-1 block">
                  Numéro de téléphone *
                </label>
                <input
                  id="telephone"
                  type="tel"
                  value={formulaire.telephone}
                  onChange={(e) => handleChangement('telephone', e.target.value)}
                  placeholder="Ex: 06 XXXXXXX"
                  className={`input-field ${erreurs.telephone ? 'border-rouge' : ''}`}
                  autoComplete="tel"
                />
                {erreurs.telephone && (
                  <p className="text-rouge text-xs mt-1">{erreurs.telephone}</p>
                )}
              </div>

              {/* Adresse (seulement si livraison) */}
              {modeLivraison === 'livraison' && (
                <div>
                  <label htmlFor="adresse" className="text-gray-400 text-xs mb-1 block">
                    Adresse de livraison *
                  </label>
                  <textarea
                    id="adresse"
                    value={formulaire.adresse}
                    onChange={(e) => handleChangement('adresse', e.target.value)}
                    placeholder="Ex: Quartier Bacongo, rue Moukanda, 3ème maison à gauche"
                    className={`input-field resize-none h-20 ${erreurs.adresse ? 'border-rouge' : ''}`}
                  />
                  {erreurs.adresse && (
                    <p className="text-rouge text-xs mt-1">{erreurs.adresse}</p>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="text-gray-400 text-xs mb-1 block">
                  Instructions spéciales (optionnel)
                </label>
                <input
                  id="notes"
                  type="text"
                  value={formulaire.notes}
                  onChange={(e) => handleChangement('notes', e.target.value)}
                  placeholder="Ex: Sans oignons, sonnez au portail..."
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* ---- Mode de paiement ---- */}
          <PaymentMethod
            modeSelectionne={modePaiement}
            onChange={setModePaiement}
          />

          {/* ---- Récapitulatif de commande ---- */}
          <div className="bg-noir-clair rounded-2xl p-4">
            <h3 className="font-bold text-white mb-3">Votre commande</h3>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    {item.quantite}× {item.nom}
                  </span>
                  <span className="text-white font-medium">
                    {formaterPrix(item.prix * item.quantite)} FCFA
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-700 pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Livraison</span>
                <span className="text-white">
                  {fraisLivraison === 0 ? 'Gratuit' : `+${formaterPrix(fraisLivraison)} FCFA`}
                </span>
              </div>
              <div className="flex justify-between font-black">
                <span className="text-white">Total</span>
                <span className="text-jaune text-lg">{formaterPrix(total)} FCFA</span>
              </div>
            </div>
          </div>

          {/* ---- Bouton de commande ---- */}
          <Button
            type="submit"
            variante="primary"
            pleineLargeur
            taille="grand"
            chargement={chargement}
          >
            {chargement ? 'Envoi en cours...' : `Confirmer la commande — ${formaterPrix(total)} FCFA`}
          </Button>

          {/* Info WhatsApp */}
          <p className="text-gray-500 text-xs text-center">
            📱 Votre commande sera également envoyée via WhatsApp pour confirmation
          </p>
        </form>
      </div>
    </div>
  )
}
