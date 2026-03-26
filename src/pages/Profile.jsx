// ============================================================
// PAGE : Profil client
// Infos de l'utilisateur et historique des commandes
// ============================================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCommandesClient } from '../lib/supabase'
import { formaterPrix } from '../lib/whatsapp'

// Couleurs selon le statut de commande
const COULEURS_STATUT = {
  en_attente: 'text-yellow-400 bg-yellow-400/10',
  en_preparation: 'text-blue-400 bg-blue-400/10',
  en_livraison: 'text-orange-400 bg-orange-400/10',
  livre: 'text-green-400 bg-green-400/10',
  envoyee_whatsapp: 'text-green-400 bg-green-400/10',
}

const LABELS_STATUT = {
  en_attente: 'En attente',
  en_preparation: 'En préparation',
  en_livraison: 'En livraison',
  livre: 'Livré',
  envoyee_whatsapp: 'Via WhatsApp',
}

export default function Profile() {
  const { utilisateur, connexion, deconnexion } = useAuth()
  const [commandes, setCommandes] = useState([])
  const [chargement, setChargement] = useState(false)

  // Formulaire de connexion
  const [formulaire, setFormulaire] = useState({ nom: '', telephone: '' })
  const [erreurs, setErreurs] = useState({})

  // Charge les commandes si l'utilisateur est connecté
  useEffect(() => {
    if (utilisateur) {
      chargerCommandes()
    }
  }, [utilisateur])

  async function chargerCommandes() {
    setChargement(true)
    const data = await getCommandesClient(utilisateur.telephone)
    setCommandes(data)
    setChargement(false)
  }

  function handleConnexion(e) {
    e.preventDefault()
    const nouvellesErreurs = {}

    if (!formulaire.nom.trim()) nouvellesErreurs.nom = 'Nom obligatoire'
    if (!formulaire.telephone.trim()) nouvellesErreurs.telephone = 'Téléphone obligatoire'

    if (Object.keys(nouvellesErreurs).length > 0) {
      setErreurs(nouvellesErreurs)
      return
    }

    connexion(formulaire)
  }

  // ---- Formulaire de connexion (si non connecté) ----
  if (!utilisateur) {
    return (
      <div className="min-h-screen pb-24">
        <div className="px-4 max-w-md mx-auto pt-5">
          <h1 className="text-2xl font-black text-white mb-2">Mon compte</h1>
          <p className="text-gray-400 text-sm mb-8">
            Connectez-vous pour accéder à votre historique de commandes
          </p>

          <form onSubmit={handleConnexion} className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Votre nom</label>
              <input
                type="text"
                value={formulaire.nom}
                onChange={(e) => setFormulaire(p => ({ ...p, nom: e.target.value }))}
                placeholder="Ex: Jean-Pierre Moukala"
                className={`input-field ${erreurs.nom ? 'border-rouge' : ''}`}
              />
              {erreurs.nom && <p className="text-rouge text-xs mt-1">{erreurs.nom}</p>}
            </div>

            <div>
              <label className="text-gray-400 text-xs mb-1 block">Numéro de téléphone</label>
              <input
                type="tel"
                value={formulaire.telephone}
                onChange={(e) => setFormulaire(p => ({ ...p, telephone: e.target.value }))}
                placeholder="Ex: 06 XXXXXXX"
                className={`input-field ${erreurs.telephone ? 'border-rouge' : ''}`}
              />
              {erreurs.telephone && <p className="text-rouge text-xs mt-1">{erreurs.telephone}</p>}
            </div>

            <button type="submit" className="btn-primary w-full mt-6">
              Se connecter
            </button>
          </form>

          {/* Avantages */}
          <div className="mt-8 space-y-3">
            {[
              { emoji: '📋', texte: 'Historique de vos commandes' },
              { emoji: '⚡', texte: 'Commande plus rapide (infos pré-remplies)' },
              { emoji: '🔔', texte: 'Suivi en temps réel' },
            ].map((item) => (
              <div key={item.texte} className="flex items-center gap-3 text-sm text-gray-400">
                <span>{item.emoji}</span>
                <span>{item.texte}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ---- Profil connecté ----
  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 max-w-md mx-auto pt-5">

        {/* ---- En-tête profil ---- */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 gradient-rouge rounded-2xl flex items-center justify-center text-white text-2xl font-black">
            {utilisateur.nom.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black text-white">{utilisateur.nom}</h1>
            <p className="text-gray-400 text-sm">📱 {utilisateur.telephone}</p>
          </div>
          <button
            onClick={deconnexion}
            className="text-gray-500 text-xs hover:text-rouge transition-colors"
          >
            Déconnexion
          </button>
        </div>

        {/* ---- Statistiques rapides ---- */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-noir-clair rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-rouge">{commandes.length}</p>
            <p className="text-gray-400 text-xs mt-1">Commandes</p>
          </div>
          <div className="bg-noir-clair rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-jaune">
              {commandes.filter(c => c.statut === 'livre').length}
            </p>
            <p className="text-gray-400 text-xs mt-1">Livrées</p>
          </div>
          <div className="bg-noir-clair rounded-2xl p-4 text-center">
            <p className="text-lg font-black text-white">
              {formaterPrix(commandes.reduce((t, c) => t + (c.total || 0), 0))}
            </p>
            <p className="text-gray-400 text-xs mt-1">FCFA total</p>
          </div>
        </div>

        {/* ---- Historique des commandes ---- */}
        <div>
          <h2 className="font-black text-white text-lg mb-4">Mes commandes</h2>

          {chargement ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-rouge border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : commandes.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl block mb-4">📋</span>
              <p className="text-gray-400 text-sm">Aucune commande pour l'instant</p>
              <Link to="/menu" className="btn-primary inline-flex mt-4">Commander maintenant</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {commandes.map((commande) => (
                <Link
                  key={commande.id}
                  to={`/commandes/${commande.id}`}
                  className="block bg-noir-clair rounded-2xl p-4 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold text-sm">
                      Commande #{commande.id.toString().slice(-6)}
                    </span>
                    <span className={`badge text-xs ${COULEURS_STATUT[commande.statut] || 'text-gray-400'}`}>
                      {LABELS_STATUT[commande.statut] || commande.statut}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mb-2">
                    {new Date(commande.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">
                      {commande.mode_livraison === 'retrait' ? '🏪 Retrait' : '🛵 Livraison'}
                    </span>
                    <span className="text-jaune font-bold text-sm">
                      {formaterPrix(commande.total)} FCFA
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
