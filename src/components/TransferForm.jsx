import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../App'
import { simulateTransferShares } from '../lib/stellar'

export default function TransferForm() {
  const { walletAddress } = useWallet()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ nftId: '', toId: '', amount: '' })
  const [fromId, setFromId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (walletAddress) {
      const rawId = parseInt(walletAddress.slice(-8), 36)
      setFromId(Number.isFinite(rawId) && rawId > 0 ? rawId % 1000000 : 1)
    }
  }, [walletAddress])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: ['nftId', 'toId', 'amount'].includes(name) ? parseInt(value) || '' : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (!walletAddress) throw new Error('Connect your Freighter wallet first')
      if (!formData.nftId || formData.nftId <= 0) throw new Error('Valid NFT ID is required')
      if (!formData.toId  || formData.toId  <= 0) throw new Error('Valid recipient ID is required')
      if (!formData.amount || formData.amount <= 0) throw new Error('Valid amount is required')
      if (!fromId) throw new Error('Could not derive your holder ID from wallet address')

      await simulateTransferShares(formData.nftId, fromId, formData.toId, formData.amount)

      setSuccess(`Transferred ${formData.amount} shares of NFT #${formData.nftId} to holder #${formData.toId}`)
      setFormData({ nftId: '', toId: '', amount: '' })
      setTimeout(() => navigate('/nfts'), 2000)
    } catch (err) {
      const msg = err?.message?.includes('User declined')
        ? 'Transaction rejected in Freighter.'
        : err.message
      setError(msg)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transfer Shares</h1>
        <p className="text-gray-600 mt-1">Transfer fractional NFT shares to another holder</p>
      </div>

      <div className="glass rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
              ✅ {success} — Redirecting…
            </div>
          )}

          {fromId && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              Your Holder ID: <span className="font-mono font-medium text-gray-900">{fromId}</span>
            </div>
          )}

          <div>
            <label htmlFor="nftId" className="block text-sm font-medium text-gray-700 mb-2">NFT ID *</label>
            <input type="number" id="nftId" name="nftId"
              value={formData.nftId} onChange={handleChange}
              className="input-field" placeholder="e.g., 1" min="1" required />
          </div>

          <div>
            <label htmlFor="toId" className="block text-sm font-medium text-gray-700 mb-2">Recipient Holder ID *</label>
            <input type="number" id="toId" name="toId"
              value={formData.toId} onChange={handleChange}
              className="input-field" placeholder="e.g., 2" min="1" required />
            <p className="text-sm text-gray-500 mt-1">The numeric holder ID of the recipient</p>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">Amount (Shares) *</label>
            <input type="number" id="amount" name="amount"
              value={formData.amount} onChange={handleChange}
              className="input-field" placeholder="e.g., 50" min="1" required />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Transfer Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">NFT ID:</span>
                <span className="font-medium">{formData.nftId || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">From (you):</span>
                <span className="font-medium">{fromId || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-medium">{formData.toId || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium text-vault-700">{formData.amount || '—'} shares</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={() => navigate('/nfts')} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading || !!success} className="btn-primary flex-1">
              {loading ? 'Waiting for Freighter…' : 'Transfer Shares'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}