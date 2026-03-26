// ============================================================
// COMPOSANT : SkeletonLoader
// Affichage pendant le chargement — remplace les spinners
// par des formes grises qui ressemblent au contenu à venir
// ============================================================

// Skeleton d'une carte produit
export function SkeletonCarte() {
  return (
    <div className="bg-noir-clair rounded-2xl overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="skeleton h-48 w-full" />
      <div className="p-4 space-y-3">
        {/* Titre skeleton */}
        <div className="skeleton h-5 w-3/4 rounded" />
        {/* Description skeleton */}
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        {/* Prix et bouton skeleton */}
        <div className="flex justify-between items-center pt-2">
          <div className="skeleton h-6 w-20 rounded" />
          <div className="skeleton h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// Grille de skeletons (pour la page menu)
export function SkeletonGrille({ nombre = 6 }) {
  // Array(nombre).fill(0) crée un tableau de N éléments vides
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array(nombre).fill(0).map((_, index) => (
        <SkeletonCarte key={index} />
      ))}
    </div>
  )
}

// Skeleton pour une ligne de commande
export function SkeletonCommande() {
  return (
    <div className="bg-noir-clair rounded-xl p-4 animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="skeleton h-5 w-1/3 rounded" />
        <div className="skeleton h-5 w-20 rounded" />
      </div>
      <div className="skeleton h-4 w-1/2 rounded" />
      <div className="skeleton h-4 w-2/3 rounded" />
    </div>
  )
}
