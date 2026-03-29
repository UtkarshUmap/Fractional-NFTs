import { useState, useEffect } from 'react'
import { viewPlatformStats } from '../lib/stellar'

export default function PlatformStats() {
  const [stats, setStats] = useState({ totalNfts: 0, totalTransfers: 0, activeNfts: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await viewPlatformStats()
      if (data) setStats(data)
    } catch (err) {
      console.error('Failed to load stats:', err)
      setError('Failed to load stats from contract.')
    }
    setLoading(false)
  }

  const statCards = [
    { label: 'Total NFTs',      value: stats.totalNfts,      icon: '🖼️', color: 'bg-vault-50 border-vault-200',  textColor: 'text-vault-700'  },
    { label: 'Active NFTs',     value: stats.activeNfts,     icon: '✨', color: 'bg-green-50 border-green-200',  textColor: 'text-green-700'  },
    { label: 'Total Transfers', value: stats.totalTransfers, icon: '🔄', color: 'bg-amber-50 border-amber-200',  textColor: 'text-amber-700'  },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-vault-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Statistics</h1>
          <p className="text-gray-600 mt-1">Live data from the Soroban contract on Testnet</p>
        </div>
        <button onClick={loadStats} className="btn-secondary text-sm">↻ Refresh</button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className={`${card.color} border rounded-xl p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.label}</p>
                <p className={`text-3xl font-bold ${card.textColor} mt-2`}>{card.value}</p>
              </div>
              <span className="text-4xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 glass rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { n: 1, title: 'Mint NFT',     desc: 'Create a new fractional NFT and define total shares' },
            { n: 2, title: 'Trade Shares', desc: 'Transfer fractional shares to other holders' },
            { n: 3, title: 'Burn & Claim', desc: 'Burn NFT when you hold all shares' },
          ].map(({ n, title, desc }) => (
            <div key={n} className="text-center p-4">
              <div className="w-12 h-12 bg-vault-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">{n}</span>
              </div>
              <h3 className="font-medium text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}