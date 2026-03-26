// ============================================================
// COMPOSANT : PaymentMethod
// Sélection du mode de paiement disponible au Congo
// ============================================================

// Modes de paiement disponibles
const MODES_PAIEMENT = [
  {
    id: 'cash',
    label: 'Cash à la livraison',
    description: 'Payez en espèces à la réception',
    icone: '💵',
    couleur: 'text-green-400',
  },
  {
    id: 'mtn_momo',
    label: 'MTN Mobile Money',
    description: 'Paiement via MTN MoMo',
    icone: '📱',
    couleur: 'text-yellow-400',
  },
  {
    id: 'airtel_money',
    label: 'Airtel Money',
    description: 'Paiement via Airtel Money',
    icone: '📲',
    couleur: 'text-red-400',
  },
]

export default function PaymentMethod({ modeSelectionne, onChange }) {
  return (
    <div className="space-y-3">
      <h3 className="font-bold text-white text-base">Mode de paiement</h3>

      {MODES_PAIEMENT.map((mode) => {
        const estSelectionne = modeSelectionne === mode.id

        return (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            className={`
              w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all
              ${estSelectionne
                ? 'border-rouge bg-rouge/10'
                : 'border-gray-700 hover:border-gray-600 bg-noir-clair'
              }
            `}
          >
            {/* Icône du mode de paiement */}
            <span className="text-2xl">{mode.icone}</span>

            {/* Infos */}
            <div className="flex-1">
              <p className={`font-semibold text-sm ${estSelectionne ? 'text-white' : 'text-gray-300'}`}>
                {mode.label}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">{mode.description}</p>
            </div>

            {/* Radio visuel */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${estSelectionne ? 'border-rouge' : 'border-gray-600'}`}>
              {estSelectionne && (
                <div className="w-2.5 h-2.5 rounded-full bg-rouge" />
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
