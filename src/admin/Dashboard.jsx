// ============================================================
// PAGE ADMIN : Tableau de bord
// Vue d'ensemble flexible : stats, top produits, répartitions,
// actions rapides et notifications sonores
// ============================================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, ecouterNouvellesCommandes, updateStatutCommande } from '../lib/supabase'
import { formaterPrix } from '../lib/whatsapp'

// ---- Constantes ----

const PERIODES = [
  { id: 'aujourd_hui', label: "Aujourd'hui" },
  { id: 'semaine',     label: '7 jours' },
  { id: 'mois',        label: '30 jours' },
]

const COULEURS_STATUT = {
  en_attente:     { bg: 'bg-yellow-400/10', texte: 'text-yellow-400', label: '⏳ En attente' },
  en_preparation: { bg: 'bg-blue-400/10',   texte: 'text-blue-400',   label: '👨‍🍳 En préparation' },
  en_livraison:   { bg: 'bg-orange-400/10', texte: 'text-orange-400', label: '🛵 En livraison' },
  livre:          { bg: 'bg-green-400/10',  texte: 'text-green-400',  label: '✅ Livré' },
}

const TRANSITIONS_STATUT = {
  en_attente:     { label: '▶ Préparer', prochain: 'en_preparation', couleur: 'bg-blue-600 hover:bg-blue-700' },
  en_preparation: { label: '🛵 Livrer',  prochain: 'en_livraison',   couleur: 'bg-orange-600 hover:bg-orange-700' },
  en_livraison:   { label: '✅ Livré',   prochain: 'livre',           couleur: 'bg-green-600 hover:bg-green-700' },
}

const LABELS_PAIEMENT = {
  cash:         '💵 Cash',
  mtn_momo:     '📱 MTN MoMo',
  airtel_money: '📲 Airtel Money',
}

const LABELS_LIVRAISON = {
  livraison: '🛵 Livraison à domicile',
  retrait:   '🏪 Retrait sur place',
}

// Données de démonstration
const COMMANDES_DEMO = [
  { id: 'CMD001', nom_client: 'Jean Moukala',   telephone: '06 123 4567', statut: 'en_attente',     total: 5500,  mode_livraison: 'livraison', mode_paiement: 'cash',         produits: [{ nom: 'Menu Big Man', quantite: 1, prix: 5500 }],                                                        created_at: new Date().toISOString() },
  { id: 'CMD002', nom_client: 'Marie Loemba',   telephone: '05 987 6543', statut: 'en_preparation', total: 3000,  mode_livraison: 'retrait',   mode_paiement: 'mtn_momo',     produits: [{ nom: 'Big Man Crispy', quantite: 1, prix: 3000 }],                                                      created_at: new Date().toISOString() },
  { id: 'CMD003', nom_client: 'Pierre Ndouki',  telephone: '06 555 1234', statut: 'en_livraison',   total: 11000, mode_livraison: 'livraison', mode_paiement: 'airtel_money', produits: [{ nom: 'Combo Famille', quantite: 1, prix: 18000 }, { nom: 'Coca-Cola', quantite: 2, prix: 500 }],          created_at: new Date().toISOString() },
  { id: 'CMD004', nom_client: 'Sophie Bakala',  telephone: '05 321 9876', statut: 'livre',          total: 5500,  mode_livraison: 'retrait',   mode_paiement: 'cash',         produits: [{ nom: 'Menu Big Man', quantite: 1, prix: 5500 }],                                                        created_at: new Date().toISOString() },
  { id: 'CMD005', nom_client: 'Alain Massamba', telephone: '06 789 0123', statut: 'livre',          total: 4000,  mode_livraison: 'livraison', mode_paiement: 'mtn_momo',     produits: [{ nom: 'Big Man Classic', quantite: 1, prix: 3500 }, { nom: 'Jus de Bissap', quantite: 1, prix: 500 }],  created_at: new Date().toISOString() },
]

// ---- Fonctions utilitaires ----

// Double bip sonore à la réception d'une nouvelle commande
function jouerSonNotification() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ;[0, 0.25].forEach((delai, i) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = i === 0 ? 880 : 660
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.4, ctx.currentTime + delai)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delai + 0.3)
      osc.start(ctx.currentTime + delai)
      osc.stop(ctx.currentTime + delai + 0.3)
    })
  } catch {
    // Navigateur sans AudioContext — silencieux
  }
}

function filtrerParPeriode(commandes, periode) {
  const maintenant = new Date()
  return commandes.filter(c => {
    const date = new Date(c.created_at)
    if (periode === 'aujourd_hui') return date.toDateString() === maintenant.toDateString()
    if (periode === 'semaine')     return (maintenant - date) < 7  * 24 * 60 * 60 * 1000
    if (periode === 'mois')        return (maintenant - date) < 30 * 24 * 60 * 60 * 1000
    return true
  })
}

function calculerTopProduits(commandes) {
  const compteur = {}
  commandes.forEach(c => {
    const produits = Array.isArray(c.produits) ? c.produits : []
    produits.forEach(p => {
      compteur[p.nom] = (compteur[p.nom] || 0) + (p.quantite || 1)
    })
  })
  return Object.entries(compteur)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([nom, quantite]) => ({ nom, quantite }))
}

function calculerRepartition(commandes, champ) {
  if (!commandes.length) return []
  const compteur = {}
  commandes.forEach(c => {
    const val = c[champ] || 'inconnu'
    compteur[val] = (compteur[val] || 0) + 1
  })
  const total = commandes.length
  return Object.entries(compteur)
    .map(([label, count]) => ({ label, count, pourcentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count)
}

// ---- Composant principal ----

export default function Dashboard() {
  const [commandes, setCommandes]           = useState([])
  const [chargement, setChargement]         = useState(true)
  const [periode, setPeriode]               = useState('aujourd_hui')
  const [nouvelleNotif, setNouvelleNotif]   = useState(null)
  const [miseAJour, setMiseAJour]           = useState(null)

  useEffect(() => {
    chargerCommandes()

    const seDesabonner = ecouterNouvellesCommandes((nouvelleCommande) => {
      setCommandes(prev => [nouvelleCommande, ...prev])
      setNouvelleNotif(nouvelleCommande)
      jouerSonNotification()
      setTimeout(() => setNouvelleNotif(null), 5000)
    })

    return seDesabonner
  }, [])

  async function chargerCommandes() {
    try {
      const { data, error } = await supabase
        .from('commandes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

      if (error) throw error
      setCommandes(data?.length > 0 ? data : COMMANDES_DEMO)
    } catch {
      setCommandes(COMMANDES_DEMO)
    } finally {
      setChargement(false)
    }
  }

  async function changerStatut(commandeId, nouveauStatut) {
    setMiseAJour(commandeId)
    try {
      await updateStatutCommande(commandeId, nouveauStatut)
      setCommandes(prev => prev.map(c =>
        c.id === commandeId ? { ...c, statut: nouveauStatut } : c
      ))
    } catch {
      alert('Erreur lors de la mise à jour du statut')
    } finally {
      setMiseAJour(null)
    }
  }

  // ---- Calculs dérivés ----
  const commandesFiltrees    = filtrerParPeriode(commandes, periode)
  const chiffreAffaires      = commandesFiltrees.reduce((t, c) => t + (c.total || 0), 0)
  const commandesEnCours     = commandes.filter(c => ['en_attente', 'en_preparation', 'en_livraison'].includes(c.statut))
  const topProduits          = calculerTopProduits(commandesFiltrees)
  const repartitionPaiement  = calculerRepartition(commandesFiltrees, 'mode_paiement')
  const repartitionLivraison = calculerRepartition(commandesFiltrees, 'mode_livraison')
  const maxQuantite          = topProduits[0]?.quantite || 1

  return (
    <div className="p-4 md:p-6 max-w-5xl space-y-6">

      {/* ---- Notification nouvelle commande ---- */}
      {nouvelleNotif && (
        <div className="fixed top-4 right-4 bg-green-600 text-white rounded-2xl p-4 shadow-2xl z-50 animate-slide-up flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <div>
            <p className="font-bold text-sm">Nouvelle commande !</p>
            <p className="text-xs opacity-80">
              {nouvelleNotif.nom_client} — {formaterPrix(nouvelleNotif.total)} FCFA
            </p>
          </div>
        </div>
      )}

      {/* ---- En-tête + filtre de période ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Tableau de bord</h1>
          <p className="text-gray-400 text-sm">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Sélecteur de période */}
        <div className="flex gap-1 bg-noir rounded-xl p-1 border border-gray-800 self-start">
          {PERIODES.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriode(p.id)}
              className={`
                px-4 py-2 rounded-lg text-xs font-semibold transition-all
                ${periode === p.id
                  ? 'bg-rouge text-white shadow'
                  : 'text-gray-400 hover:text-white'
                }
              `}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---- Stats principales ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Commandes',      valeur: commandesFiltrees.length,                                          couleur: 'text-rouge',    emoji: '📋' },
          { label: "Chiffre d'aff.", valeur: `${formaterPrix(chiffreAffaires)} F`,                              couleur: 'text-jaune',    emoji: '💰' },
          { label: 'En cours',       valeur: commandesEnCours.length,                                           couleur: 'text-blue-400', emoji: '⚡' },
          { label: 'Livrées',        valeur: commandesFiltrees.filter(c => c.statut === 'livre').length,        couleur: 'text-green-400',emoji: '✅' },
        ].map(stat => (
          <div key={stat.label} className="bg-noir rounded-2xl p-4 border border-gray-800">
            <p className="text-gray-400 text-xs mb-2">{stat.emoji} {stat.label}</p>
            <p className={`text-2xl font-black ${stat.couleur}`}>{stat.valeur}</p>
          </div>
        ))}
      </div>

      {/* ---- Top produits + Répartitions ---- */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Top produits */}
        <div className="bg-noir rounded-2xl border border-gray-800 p-5">
          <h2 className="font-bold text-white text-sm mb-4">🏆 Top produits</h2>
          {chargement ? (
            <div className="space-y-3">
              {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-7 rounded-lg" />)}
            </div>
          ) : topProduits.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">Aucune commande sur cette période</p>
          ) : (
            <div className="space-y-3">
              {topProduits.map((produit, index) => (
                <div key={produit.nom}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-300 truncate pr-2">
                      <span className="text-gray-600 mr-1.5">{index + 1}.</span>
                      {produit.nom}
                    </span>
                    <span className="text-white font-bold flex-shrink-0">{produit.quantite}×</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-jaune rounded-full transition-all duration-500"
                      style={{ width: `${(produit.quantite / maxQuantite) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Répartitions */}
        <div className="space-y-4">

          {/* Paiement */}
          <div className="bg-noir rounded-2xl border border-gray-800 p-5">
            <h2 className="font-bold text-white text-sm mb-4">💳 Mode de paiement</h2>
            {repartitionPaiement.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucune donnée</p>
            ) : (
              <div className="space-y-2.5">
                {repartitionPaiement.map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">{LABELS_PAIEMENT[item.label] || item.label}</span>
                      <span className="text-white font-bold">
                        {item.pourcentage}% <span className="text-gray-500">({item.count})</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rouge rounded-full transition-all duration-500"
                        style={{ width: `${item.pourcentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Livraison */}
          <div className="bg-noir rounded-2xl border border-gray-800 p-5">
            <h2 className="font-bold text-white text-sm mb-4">🚀 Mode de livraison</h2>
            {repartitionLivraison.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucune donnée</p>
            ) : (
              <div className="space-y-2.5">
                {repartitionLivraison.map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">{LABELS_LIVRAISON[item.label] || item.label}</span>
                      <span className="text-white font-bold">
                        {item.pourcentage}% <span className="text-gray-500">({item.count})</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${item.pourcentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ---- Commandes récentes avec actions rapides ---- */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white text-lg">Commandes récentes</h2>
          <Link to="/admin/commandes" className="text-rouge text-sm font-semibold">
            Tout voir →
          </Link>
        </div>

        {chargement ? (
          <div className="space-y-3">
            {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
        ) : commandes.length === 0 ? (
          <p className="text-center py-12 text-gray-500">Aucune commande</p>
        ) : (
          <div className="space-y-2">
            {commandes.slice(0, 8).map(commande => {
              const styles     = COULEURS_STATUT[commande.statut] || COULEURS_STATUT.en_attente
              const transition = TRANSITIONS_STATUT[commande.statut]
              const enMaj      = miseAJour === commande.id

              return (
                <div
                  key={commande.id}
                  className="bg-noir rounded-xl border border-gray-800 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-white text-sm">{commande.nom_client}</p>
                      <span className="text-gray-600 text-xs">#{commande.id.toString().slice(-6)}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      <span>{commande.mode_livraison === 'retrait' ? '🏪 Retrait' : '🛵 Livraison'}</span>
                      <span className="text-gray-700">•</span>
                      <span>📱 {commande.telephone}</span>
                      <span className="text-gray-700">•</span>
                      <span>{new Date(commande.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Badge statut + prix */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`badge text-xs ${styles.bg} ${styles.texte}`}>
                      {styles.label}
                    </span>
                    <span className="text-jaune font-black text-sm">
                      {formaterPrix(commande.total)} FCFA
                    </span>
                  </div>

                  {/* Action rapide */}
                  {transition && (
                    <button
                      onClick={() => changerStatut(commande.id, transition.prochain)}
                      disabled={enMaj}
                      className={`
                        ${transition.couleur} text-white text-xs font-bold px-4 py-2 rounded-lg
                        transition-all flex-shrink-0 disabled:opacity-50 whitespace-nowrap
                      `}
                    >
                      {enMaj ? '...' : transition.label}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
