import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../App'
import { simulateTransferShares } from '../lib/stellar'

export default function TransferForm() {
  const { walletAddress } = useWallet()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    nftId: '',
    toId: '',
    amount: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (walletAddress) {
      const fromId = parseInt(walletAddress.slice(-8), 16) % 1000000
      setFormData(prev => ({ ...prev, fromId }))
    }
  }, [walletAddress])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'nftId' || name === 'toId' || name === 'amount' 
        ? parseInt(value) || '' 
        : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!formData.nftId || formData.nftId <= 0) {
        throw new Error('Valid NFT ID is required')
      }
      if (!formData.toId || formData.toId <= 0) {
        throw new Error('Valid recipient ID is required')
      }
      if (!formData.amount || formData.amount <= 0) {
        throw new Error('Valid amount is required')
      }

      const fromId = walletAddress ? parseInt(walletAddress.slice(-8), 16) % 1000000 : 1

      const txData = await simulateTransferShares(
        formData.nftId,
        fromId,
        formData.toId,
        formData.amount
      )

      console.log('Transfer transaction prepared:', txData)
      
      setTimeout(() => {
        setLoading(false)
        window.alert(`Transferred ${formData.amount} shares successfully! (Demo mode)`)
        navigate('/nfts')
      }, 1000)

    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="nftId" className="block text-sm font-medium text-gray-700 mb-2">
              NFT ID *
            </label>
            <input
              type="number"
              id="nftId"
              name="nftId"
              value={formData.nftId}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., 1"
              min="1"
              required
            />
          </div>

          <div>
            <label htmlFor="toId" className="block text-sm font-medium text-gray-700 mb-2">
              Recipient ID *
            </label>
            <input
              type="number"
              id="toId"
              name="toId"
              value={formData.toId}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., 2"
              min="1"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              The wallet address or ID of the recipient
            </p>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount (Shares) *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., 50"
              min="1"
              required
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Transfer Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">NFT ID:</span>
                <span className="font-medium">{formData.nftId || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium text-vault-700">{formData.amount || '—'} shares</span>
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
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Transferring...' : 'Transfer Shares'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}