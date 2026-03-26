// ============================================================
// CONFIGURATION SUPABASE
// Supabase est notre backend : base de données + authentification
// + temps réel (pour le suivi des commandes)
// ============================================================

import { createClient } from '@supabase/supabase-js'

// Ces valeurs viennent du fichier .env (variables d'environnement)
// VITE_ devant le nom permet à Vite de les exposer côté navigateur
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Indique si Supabase est correctement configuré
// Si non, l'app utilise les données de démonstration intégrées
export const supabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

if (!supabaseConfigured) {
  console.warn(
    'ℹ️ Supabase non configuré — mode démonstration actif.\n' +
    'Pour activer la base de données, crée un fichier .env avec :\n' +
    'VITE_SUPABASE_URL=https://ton-projet.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=ta-cle-anon'
  )
}

// Crée le client Supabase uniquement si les variables sont présentes
// Sinon, on crée un faux client qui ne plante pas l'application
export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Garde l'utilisateur connecté même après fermeture du navigateur
        persistSession: true,
        // Stocke la session dans le localStorage du navigateur
        storage: window.localStorage,
      },
    })
  : creerClientFactice()

// Faux client Supabase — retourne toujours des résultats vides
// Utilisé quand les variables .env ne sont pas configurées
function creerClientFactice() {
  const reponseVide = { data: null, error: null }
  const requeteVide = {
    select: () => requeteVide,
    insert: () => requeteVide,
    update: () => requeteVide,
    delete: () => requeteVide,
    eq: () => requeteVide,
    order: () => requeteVide,
    limit: () => requeteVide,
    single: () => Promise.resolve(reponseVide),
    then: (fn) => Promise.resolve(reponseVide).then(fn),
  }
  // Rend toutes les méthodes chainables et résolvables
  Object.keys(requeteVide).forEach(cle => {
    requeteVide[cle] = () => requeteVide
  })
  requeteVide.single = () => Promise.resolve(reponseVide)
  requeteVide[Symbol.iterator] = undefined

  return {
    from: () => ({ ...requeteVide, select: () => Promise.resolve({ data: [], error: null }) }),
    channel: () => ({
      on: function() { return this },
      subscribe: () => ({}),
    }),
    removeChannel: () => {},
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  }
}

// ---- Fonctions utilitaires pour la base de données ----

// Récupère tous les produits du menu (actifs seulement)
export async function getProduits(categorie = null) {
  let query = supabase
    .from('produits')
    .select('*')
    .eq('actif', true)      // Seulement les produits disponibles
    .order('ordre', { ascending: true }) // Trie par ordre d'affichage

  // Si une catégorie est précisée, filtre par catégorie
  if (categorie) {
    query = query.eq('categorie', categorie)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erreur lors de la récupération des produits:', error)
    return []
  }

  return data
}

// Crée une nouvelle commande dans la base de données
export async function creerCommande(commande) {
  const { data, error } = await supabase
    .from('commandes')
    .insert([commande])
    .select()
    .single() // Retourne un seul objet au lieu d'un tableau

  if (error) {
    console.error('Erreur lors de la création de la commande:', error)
    throw error // On lance l'erreur pour la gérer dans le composant
  }

  return data
}

// Récupère les commandes d'un client par son numéro de téléphone
export async function getCommandesClient(telephone) {
  const { data, error } = await supabase
    .from('commandes')
    .select('*')
    .eq('telephone', telephone)
    .order('created_at', { ascending: false }) // Plus récentes en premier

  if (error) {
    console.error('Erreur lors de la récupération des commandes:', error)
    return []
  }

  return data
}

// Met à jour le statut d'une commande (utilisé par l'admin)
export async function updateStatutCommande(commandeId, nouveauStatut) {
  const { error } = await supabase
    .from('commandes')
    .update({ statut: nouveauStatut, updated_at: new Date().toISOString() })
    .eq('id', commandeId)

  if (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
    throw error
  }
}

// S'abonne aux changements en temps réel d'une commande spécifique
// Retourne une fonction pour se désabonner (important pour éviter les fuites mémoire)
export function ecouterCommande(commandeId, callback) {
  const subscription = supabase
    .channel(`commande-${commandeId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'commandes',
        filter: `id=eq.${commandeId}`,
      },
      (payload) => {
        // payload.new contient les nouvelles données
        callback(payload.new)
      }
    )
    .subscribe()

  // Retourne une fonction de nettoyage
  return () => supabase.removeChannel(subscription)
}

// S'abonne à toutes les nouvelles commandes (pour le dashboard admin)
export function ecouterNouvellesCommandes(callback) {
  const subscription = supabase
    .channel('nouvelles-commandes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'commandes',
      },
      (payload) => {
        callback(payload.new)
      }
    )
    .subscribe()

  return () => supabase.removeChannel(subscription)
}
