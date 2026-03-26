// ============================================================
// CONTEXTE D'AUTHENTIFICATION
// Gère l'état de connexion de l'utilisateur dans toute l'app
// L'utilisateur se connecte avec son numéro de téléphone
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react'

// Crée le contexte d'authentification
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // L'utilisateur connecté (null si pas connecté)
  const [utilisateur, setUtilisateur] = useState(null)
  // Indique si on est encore en train de vérifier la session
  const [chargement, setChargement] = useState(true)

  // Au démarrage de l'app, vérifie si un utilisateur était déjà connecté
  useEffect(() => {
    const utilisateurSauvegarde = localStorage.getItem('bigman_utilisateur')

    if (utilisateurSauvegarde) {
      try {
        setUtilisateur(JSON.parse(utilisateurSauvegarde))
      } catch {
        localStorage.removeItem('bigman_utilisateur')
      }
    }

    // Chargement terminé
    setChargement(false)
  }, [])

  // Connecte l'utilisateur (authentification légère par téléphone)
  const connexion = (infosUtilisateur) => {
    const utilisateurData = {
      id: Date.now().toString(), // ID temporaire simple
      nom: infosUtilisateur.nom,
      telephone: infosUtilisateur.telephone,
      createdAt: new Date().toISOString(),
    }

    // Sauvegarde dans localStorage pour persister la session
    localStorage.setItem('bigman_utilisateur', JSON.stringify(utilisateurData))
    setUtilisateur(utilisateurData)
  }

  // Met à jour les informations de l'utilisateur
  const mettreAJourProfil = (nouvellsInfos) => {
    const utilisateurMisAJour = { ...utilisateur, ...nouvellsInfos }
    localStorage.setItem('bigman_utilisateur', JSON.stringify(utilisateurMisAJour))
    setUtilisateur(utilisateurMisAJour)
  }

  // Déconnecte l'utilisateur
  const deconnexion = () => {
    localStorage.removeItem('bigman_utilisateur')
    setUtilisateur(null)
  }

  const valeur = {
    utilisateur,
    chargement,
    estConnecte: !!utilisateur, // true si utilisateur n'est pas null
    connexion,
    mettreAJourProfil,
    deconnexion,
  }

  return (
    <AuthContext.Provider value={valeur}>
      {/* N'affiche pas l'app pendant la vérification de session */}
      {!chargement && children}
    </AuthContext.Provider>
  )
}

// Hook pour utiliser l'auth : const { utilisateur, connexion } = useAuth()
export function useAuth() {
  const contexte = useContext(AuthContext)

  if (!contexte) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de <AuthProvider>')
  }

  return contexte
}
