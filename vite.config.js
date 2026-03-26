// Configuration de Vite — l'outil qui compile et optimise notre code React
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Découpe le bundle en morceaux plus petits pour un chargement plus rapide
    rollupOptions: {
      output: {
        manualChunks: {
          // Sépare les librairies externes du code de l'app pour le cache navigateur
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
  // Permet d'importer les fichiers sans écrire le chemin complet
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
