// Configuration de Tailwind CSS — le système de style utilisé dans l'app
/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind ne génère que le CSS des classes utilisées dans ces fichiers
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Palette de couleurs Big Man — tirée du vrai logo
      // Logo : fond jaune #FFCC00, bordure rouge #CC1626, texte noir #0A0A0A
      colors: {
        jaune: {
          DEFAULT: '#FFCC00', // Jaune dominant du logo — boutons principaux
          sombre: '#E6B800',  // Jaune foncé — hover des boutons
          clair: '#FFF3B0',   // Jaune très clair — fonds légers
        },
        rouge: {
          DEFAULT: '#CC1626', // Rouge bordure du logo — accents, badges
          sombre: '#A8101E',  // Rouge foncé — hover
          clair: '#E63946',   // Rouge clair — notifications
        },
        noir: {
          DEFAULT: '#0A0A0A', // Noir profond du logo — fond général
          clair: '#1C1C1C',   // Noir légèrement clair — cartes
          gris: '#3A3A3A',    // Gris foncé — textes secondaires
        },
      },
      // Police principale de l'application
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // Tailles minimales pour les boutons (accessibilité tactile)
      minHeight: {
        'btn': '48px', // Taille minimum recommandée pour les boutons tactiles
      },
      // Animation personnalisée pour le skeleton loader
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
