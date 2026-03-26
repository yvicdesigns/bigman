// PostCSS traite notre CSS et applique Tailwind + Autoprefixer
export default {
  plugins: {
    tailwindcss: {},      // Génère les classes Tailwind
    autoprefixer: {},     // Ajoute automatiquement -webkit-, -moz- pour la compatibilité navigateurs
  },
}
