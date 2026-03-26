// ============================================================
// PAGE ADMIN : Gestion du menu
// Ajouter, modifier et désactiver les produits
// ============================================================

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { formaterPrix } from '../lib/whatsapp'
import Modal from '../components/ui/Modal'

const CATEGORIES_OPTIONS = ['burgers', 'menus', 'accompagnements', 'boissons', 'combos']

const PRODUIT_VIDE = {
  nom: '',
  description: '',
  prix: '',
  categorie: 'burgers',
  image_url: '',
  populaire: false,
  actif: true,
  ordre: 1,
}

export default function ManageMenu() {
  const [produits, setProduits] = useState([])
  const [chargement, setChargement] = useState(true)
  const [modalOuverte, setModalOuverte] = useState(false)
  const [produitEnEdition, setProduitEnEdition] = useState(null)
  const [formulaire, setFormulaire] = useState(PRODUIT_VIDE)
  const [sauvegarde, setSauvegarde] = useState(false)
  const [categorieFiltre, setCategorieFiltre] = useState('tous')

  useEffect(() => {
    chargerProduits()
  }, [])

  async function chargerProduits() {
    try {
      const { data, error } = await supabase
        .from('produits')
        .select('*')
        .order('categorie')
        .order('ordre')

      if (error) throw error
      setProduits(data || [])
    } catch {
      // Données démo si Supabase non dispo
      setProduits([
        { id: 1, nom: 'Big Man Classic', prix: 3500, categorie: 'burgers', actif: true, populaire: true, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80' },
        { id: 2, nom: 'Menu Big Man', prix: 5500, categorie: 'menus', actif: true, populaire: true, image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=80' },
      ])
    } finally {
      setChargement(false)
    }
  }

  // Ouvre le formulaire pour ajouter un nouveau produit
  function ouvrirAjout() {
    setProduitEnEdition(null)
    setFormulaire(PRODUIT_VIDE)
    setModalOuverte(true)
  }

  // Ouvre le formulaire pour modifier un produit existant
  function ouvrirEdition(produit) {
    setProduitEnEdition(produit)
    setFormulaire({ ...produit })
    setModalOuverte(true)
  }

  // Sauvegarde le produit (création ou modification)
  async function sauvegarderProduit(e) {
    e.preventDefault()
    setSauvegarde(true)

    try {
      const donnees = {
        ...formulaire,
        prix: parseInt(formulaire.prix),
        ordre: parseInt(formulaire.ordre) || 1,
      }

      if (produitEnEdition) {
        // Modification
        const { error } = await supabase
          .from('produits')
          .update(donnees)
          .eq('id', produitEnEdition.id)
        if (error) throw error
        setProduits(prev => prev.map(p => p.id === produitEnEdition.id ? { ...p, ...donnees } : p))
      } else {
        // Création
        const { data, error } = await supabase
          .from('produits')
          .insert([donnees])
          .select()
          .single()
        if (error) throw error
        setProduits(prev => [...prev, data])
      }

      setModalOuverte(false)
    } catch (err) {
      alert('Erreur lors de la sauvegarde : ' + err.message)
    } finally {
      setSauvegarde(false)
    }
  }

  // Active/désactive un produit
  async function toggleActif(produit) {
    try {
      await supabase
        .from('produits')
        .update({ actif: !produit.actif })
        .eq('id', produit.id)

      setProduits(prev => prev.map(p =>
        p.id === produit.id ? { ...p, actif: !p.actif } : p
      ))
    } catch (err) {
      alert('Erreur : ' + err.message)
    }
  }

  const produitsFiltres = categorieFiltre === 'tous'
    ? produits
    : produits.filter(p => p.categorie === categorieFiltre)

  return (
    <div className="p-4 md:p-6">
      {/* ---- En-tête ---- */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Gérer le menu</h1>
        <button onClick={ouvrirAjout} className="btn-primary text-sm px-4 py-2 min-h-0">
          + Ajouter
        </button>
      </div>

      {/* ---- Filtre catégorie ---- */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {['tous', ...CATEGORIES_OPTIONS].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategorieFiltre(cat)}
            className={`
              whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all capitalize
              ${categorieFiltre === cat
                ? 'bg-rouge text-white'
                : 'bg-noir text-gray-400 border border-gray-700'
              }
            `}
          >
            {cat === 'tous' ? 'Tous' : cat}
          </button>
        ))}
      </div>

      {/* ---- Liste des produits ---- */}
      {chargement ? (
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {produitsFiltres.map((produit) => (
            <div
              key={produit.id}
              className={`bg-noir rounded-xl border border-gray-800 p-4 flex items-center gap-4 transition-opacity ${!produit.actif ? 'opacity-50' : ''}`}
            >
              {/* Image miniature */}
              <img
                src={produit.image_url}
                alt={produit.nom}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/48/2D2D2D/E63946?text=🍔' }}
              />

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white text-sm truncate">{produit.nom}</p>
                  {produit.populaire && <span className="text-jaune text-xs">⭐</span>}
                  {!produit.actif && <span className="text-gray-500 text-xs">(Désactivé)</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-jaune font-bold text-xs">{formaterPrix(produit.prix)} FCFA</span>
                  <span className="text-gray-600 text-xs">•</span>
                  <span className="text-gray-500 text-xs capitalize">{produit.categorie}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActif(produit)}
                  className={`text-xs px-2 py-1 rounded-lg transition-colors ${produit.actif ? 'text-green-400 bg-green-400/10 hover:bg-green-400/20' : 'text-gray-500 bg-gray-800 hover:bg-gray-700'}`}
                >
                  {produit.actif ? 'Actif' : 'Inactif'}
                </button>
                <button
                  onClick={() => ouvrirEdition(produit)}
                  className="text-xs text-gray-400 hover:text-white bg-noir-clair px-2 py-1 rounded-lg transition-colors"
                >
                  ✏️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---- Modal formulaire produit ---- */}
      <Modal
        ouvert={modalOuverte}
        onFermer={() => setModalOuverte(false)}
        titre={produitEnEdition ? 'Modifier le produit' : 'Ajouter un produit'}
      >
        <form onSubmit={sauvegarderProduit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Nom *</label>
            <input
              type="text"
              value={formulaire.nom}
              onChange={e => setFormulaire(p => ({ ...p, nom: e.target.value }))}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Description</label>
            <textarea
              value={formulaire.description}
              onChange={e => setFormulaire(p => ({ ...p, description: e.target.value }))}
              className="input-field resize-none h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Prix (FCFA) *</label>
              <input
                type="number"
                value={formulaire.prix}
                onChange={e => setFormulaire(p => ({ ...p, prix: e.target.value }))}
                className="input-field"
                required min="0"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Catégorie *</label>
              <select
                value={formulaire.categorie}
                onChange={e => setFormulaire(p => ({ ...p, categorie: e.target.value }))}
                className="input-field"
              >
                {CATEGORIES_OPTIONS.map(c => (
                  <option key={c} value={c} className="bg-noir">{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">URL de l'image</label>
            <input
              type="url"
              value={formulaire.image_url}
              onChange={e => setFormulaire(p => ({ ...p, image_url: e.target.value }))}
              placeholder="https://..."
              className="input-field"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formulaire.populaire}
                onChange={e => setFormulaire(p => ({ ...p, populaire: e.target.checked }))}
                className="w-4 h-4 accent-rouge"
              />
              <span className="text-gray-300 text-sm">⭐ Populaire</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formulaire.actif}
                onChange={e => setFormulaire(p => ({ ...p, actif: e.target.checked }))}
                className="w-4 h-4 accent-rouge"
              />
              <span className="text-gray-300 text-sm">Actif</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={sauvegarde}
            className="btn-primary w-full"
          >
            {sauvegarde ? 'Sauvegarde...' : produitEnEdition ? 'Enregistrer' : 'Ajouter le produit'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
