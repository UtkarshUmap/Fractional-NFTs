import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../App'
import { simulateMintNFT } from '../lib/stellar'   // same import, now real

export default function MintNFTForm() {
  const { walletAddress } = useWallet()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '',
    descrip: '',
    totalShares: 100,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)
  const [txInfo, setTxInfo] = useState(null)   // shows minted NFT id on success

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalShares' ? parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setTxInfo(null)
    setLoading(true)

    try {
      if (!walletAddress) throw new Error('Connect your Freighter wallet first')
      if (!formData.title.trim()) throw new Error('Title is required')
      if (formData.totalShares <= 0) throw new Error('Total shares must be greater than 0')

      // Stellar addresses are base32 — last 8 chars may contain non-hex chars, use base36
      const rawId = parseInt(walletAddress.slice(-8), 36)
      const creatorId = Number.isFinite(rawId) && rawId > 0 ? rawId % 1000000 : 1

      // ── Real contract call ──────────────────────────────────────────────
      // simulateMintNFT now builds, simulates, signs via Freighter, and
      // submits to testnet. Returns the new nft_id (u64).
      const nftId = await simulateMintNFT(
        creatorId,
        formData.title,
        formData.descrip,
        formData.totalShares,
      )
      // ───────────────────────────────────────────────────────────────────

      setTxInfo({ nftId })
      setLoading(false)

      // Brief pause so user sees the success banner, then redirect
      setTimeout(() => navigate('/nfts'), 2000)

    } catch (err) {
      console.error('Mint error:', err)
      // Freighter rejection is a common case — surface a friendly message
      const msg = err?.message?.includes('User declined')
        ? 'Transaction rejected in Freighter.'
        : err.message
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mint Fractional NFT</h1>
        <p className="text-gray-600 mt-1">Create a new NFT and split it into fractional shares</p>
      </div>

      <div className="glass rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Success banner (replaces the window.alert) */}
          {txInfo && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
              ✅ NFT <strong>#{txInfo.nftId}</strong> minted on Testnet! Redirecting…
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Digital Art #1"
              required
            />
          </div>

          <div>
            <label htmlFor="descrip" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="descrip"
              name="descrip"
              value={formData.descrip}
              onChange={handleChange}
              className="input-field min-h-[100px]"
              placeholder="Describe your NFT..."
            />
          </div>

          <div>
            <label htmlFor="totalShares" className="block text-sm font-medium text-gray-700 mb-2">
              Total Shares *
            </label>
            <input
              type="number"
              id="totalShares"
              name="totalShares"
              value={formData.totalShares}
              onChange={handleChange}
              className="input-field"
              min="1"
              max="1000000"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Number of fractional shares to create. Higher shares = more divisible.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Title:</span>
                <span className="font-medium">{formData.title || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Shares:</span>
                <span className="font-medium">{formData.totalShares}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Your Ownership:</span>
                <span className="font-medium text-vault-700">100%</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/nfts')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!txInfo}
              className="btn-primary flex-1"
            >
              {loading ? 'Waiting for Freighter…' : 'Mint NFT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}