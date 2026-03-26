// ============================================================
// HOOK : useOrders
// Gère la création et le suivi des commandes
// ============================================================

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ouvrirWhatsApp } from '../lib/whatsapp'

export function useOrders() {
  const [commandeEnCours, setCommandeEnCours] = useState(null)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState(null)

  // Crée une nouvelle commande
  async function passerCommande({ panier, infosClient, modeLivraison, modePaiement, total }) {
    setChargement(true)
    setErreur(null)

    try {
      // Prépare l'objet commande pour Supabase
      const nouvelleCommande = {
        nom_client: infosClient.nom,
        telephone: infosClient.telephone,
        adresse: modeLivraison === 'livraison' ? infosClient.adresse : 'Retrait sur place',
        mode_livraison: modeLivraison,
        mode_paiement: modePaiement,
        notes: infosClient.notes || null,
        statut: 'en_attente',
        total, // Total avec frais de livraison inclus, calculé dans Checkout
        produits: panier, // Stocké en JSON dans Supabase
        created_at: new Date().toISOString(),
      }

      // Tente de sauvegarder dans Supabase
      const { data, error } = await supabase
        .from('commandes')
        .insert([nouvelleCommande])
        .select()
        .single()

      if (error) throw error

      setCommandeEnCours(data)

      // Envoie aussi via WhatsApp (double confirmation)
      ouvrirWhatsApp(panier, infosClient, modeLivraison, total)

      return data

    } catch (err) {
      console.warn('Supabase non disponible, commande via WhatsApp uniquement:', err.message)

      // Si Supabase échoue, on commande quand même via WhatsApp
      const commandeLocale = {
        id: 'WA-' + Date.now(),
        ...infosClient,
        modeLivraison,
        modePaiement,
        statut: 'envoyee_whatsapp',
        produits: panier,
        total,
      }

      ouvrirWhatsApp(panier, infosClient, modeLivraison, total)
      setCommandeEnCours(commandeLocale)
      return commandeLocale

    } finally {
      setChargement(false)
    }
  }

  return {
    commandeEnCours,
    chargement,
    erreur,
    passerCommande,
  }
}
