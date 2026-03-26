// ============================================================
// PAGE ADMIN : Gestion des commandes
// Liste toutes les commandes et permet de changer leur statut
// ============================================================

import { useState, useEffect } from 'react'
import { supabase, updateStatutCommande, ecouterNouvellesCommandes } from '../lib/supabase'
import { formaterPrix } from '../lib/whatsapp'

const STATUTS = [
  { id: 'tous', label: 'Toutes' },
  { id: 'en_attente', label: '⏳ En attente' },
  { id: 'en_preparation', label: '👨‍🍳 Préparation' },
  { id: 'en_livraison', label: '🛵 Livraison' },
  { id: 'livre', label: '✅ Livrée' },
]

const TRANSITIONS_STATUT = {
  en_attente: { label: '▶️ Démarrer la préparation', prochain: 'en_preparation', couleur: 'bg-blue-600' },
  en_preparation: { label: '🛵 Envoyer en livraison', prochain: 'en_livraison', couleur: 'bg-orange-600' },
  en_livraison: { label: '✅ Marquer comme livré', prochain: 'livre', couleur: 'bg-green-600' },
  livre: null, // Pas d'action suivante
}

const COMMANDES_DEMO = [
  { id: 'CMD001', nom_client: 'Jean Moukala', telephone: '06 123 4567', statut: 'en_attente', total: 5500, mode_livraison: 'livraison', adresse: 'Bacongo, rue Moukanda', mode_paiement: 'cash', produits: [{ nom: 'Menu Big Man', quantite: 1, prix: 5500 }], created_at: new Date().toISOString() },
  { id: 'CMD002', nom_client: 'Marie Loemba', telephone: '05 987 6543', statut: 'en_preparation', total: 3000, mode_livraison: 'retrait', adresse: 'Retrait sur place', mode_paiement: 'mtn_momo', produits: [{ nom: 'Big Man Crispy', quantite: 1, prix: 3000 }], created_at: new Date().toISOString() },
]

export default function ManageOrders() {
  const [commandes, setCommandes] = useState([])
  const [filtre, setFiltre] = useState('tous')
  const [chargement, setChargement] = useState(true)
  const [commandeSelectionnee, setCommandeSelectionnee] = useState(null)
  const [miseAJour, setMiseAJour] = useState(null) // ID de la commande en cours de MAJ

  useEffect(() => {
    chargerCommandes()

    const seDesabonner = ecouterNouvellesCommandes((nouvelleCommande) => {
      setCommandes(prev => [nouvelleCommande, ...prev])
    })

    return seDesabonner
  }, [])

  async function chargerCommandes() {
    try {
      const { data, error } = await supabase
        .from('commandes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCommandes(data?.length > 0 ? data : COMMANDES_DEMO)
    } catch {
      setCommandes(COMMANDES_DEMO)
    } finally {
      setChargement(false)
    }
  }

  // Change le statut d'une commande
  async function changerStatut(commandeId, nouveauStatut) {
    setMiseAJour(commandeId)
    try {
      await updateStatutCommande(commandeId, nouveauStatut)
      // Met à jour localement sans recharger
      setCommandes(prev => prev.map(c =>
        c.id === commandeId ? { ...c, statut: nouveauStatut } : c
      ))
      if (commandeSelectionnee?.id === commandeId) {
        setCommandeSelectionnee(prev => ({ ...prev, statut: nouveauStatut }))
      }
    } catch (err) {
      alert('Erreur lors de la mise à jour du statut')
    } finally {
      setMiseAJour(null)
    }
  }

  const commandesFiltrees = filtre === 'tous'
    ? commandes
    : commandes.filter(c => c.statut === filtre)

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-black text-white mb-6">Commandes</h1>

      {/* ---- Filtres par statut ---- */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {STATUTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setFiltre(s.id)}
            className={`
              whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all
              ${filtre === s.id
                ? 'bg-rouge text-white'
                : 'bg-noir text-gray-400 border border-gray-700 hover:border-gray-600'
              }
            `}
          >
            {s.label}
            {s.id !== 'tous' && (
              <span className="ml-1 opacity-70">
                ({commandes.filter(c => c.statut === s.id).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ---- Liste des commandes ---- */}
      {chargement ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      ) : commandesFiltrees.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">📭</span>
          <p className="text-gray-400">Aucune commande dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-3">
          {commandesFiltrees.map((commande) => {
            const transition = TRANSITIONS_STATUT[commande.statut]

            return (
              <div key={commande.id} className="bg-noir rounded-xl border border-gray-800 overflow-hidden">
                {/* Infos commande */}
                <div
                  className="p-4 cursor-pointer hover:bg-noir-clair/30 transition-colors"
                  onClick={() => setCommandeSelectionnee(
                    commandeSelectionnee?.id === commande.id ? null : commande
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-white text-sm">{commande.nom_client}</span>
                      <span className="text-gray-500 text-xs ml-2">#{commande.id.toString().slice(-6)}</span>
                    </div>
                    <span className="text-jaune font-bold text-sm">
                      {formaterPrix(commande.total)} FCFA
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>📱 {commande.telephone}</span>
                      <span>{commande.mode_livraison === 'retrait' ? '🏪 Retrait' : '🛵 Livraison'}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(commande.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Détails expandables */}
                {commandeSelectionnee?.id === commande.id && (
                  <div className="border-t border-gray-800 p-4 bg-noir-clair/20">
                    {/* Produits */}
                    {commande.produits && (
                      <div className="mb-3">
                        <p className="text-gray-400 text-xs mb-2 font-medium">Produits :</p>
                        {(Array.isArray(commande.produits) ? commande.produits : []).map((p, i) => (
                          <p key={i} className="text-white text-xs">
                            {p.quantite}× {p.nom} — {formaterPrix(p.prix * p.quantite)} FCFA
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Adresse */}
                    <p className="text-gray-400 text-xs mb-1">
                      📍 {commande.adresse}
                    </p>
                    <p className="text-gray-400 text-xs mb-3">
                      💳 {commande.mode_paiement?.replace('_', ' ')}
                    </p>

                    {/* Bouton changer de statut */}
                    {transition && (
                      <button
                        onClick={() => changerStatut(commande.id, transition.prochain)}
                        disabled={miseAJour === commande.id}
                        className={`${transition.couleur} text-white text-xs font-bold px-4 py-2 rounded-lg w-full transition-opacity disabled:opacity-50`}
                      >
                        {miseAJour === commande.id ? 'Mise à jour...' : transition.label}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
