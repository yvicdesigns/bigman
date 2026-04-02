export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center text-center px-6">
      <div className="text-7xl mb-6">🔧</div>
      <h1 className="text-3xl font-black text-white mb-3">Maintenance en cours</h1>
      <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
        Nous effectuons une mise à jour. L'application sera de nouveau disponible très bientôt.
      </p>
      <p className="text-gray-600 text-xs mt-8">Merci de votre patience 🙏</p>
    </div>
  )
}
