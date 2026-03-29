import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useWallet } from '../App'
import { viewNFT, viewShares, simulateBurnNFT } from '../lib/stellar'

export default function NFTDetail() {
  const { nftId } = useParams()
  const { walletAddress } = useWallet()
  const navigate = useNavigate()

  const [nft, setNft] = useState(null)
  const [myShares, setMyShares] = useState(null)
  const [loading, setLoading] = useState(true)
  const [burning, setBurning] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadNFTDetails()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftId, walletAddress])

  const loadNFTDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const nftData = await viewNFT(parseInt(nftId))
      setNft(nftData)

      if (nftData && walletAddress) {
        const rawId = parseInt(walletAddress.slice(-8), 36)
        const holderId = Number.isFinite(rawId) && rawId > 0 ? rawId % 1000000 : 1
        const shareData = await viewShares(parseInt(nftId), holderId)
        setMyShares(shareData)
      }
    } catch (err) {
      console.error('Failed to load NFT:', err)
      setError('Failed to load NFT details from contract.')
    }
    setLoading(false)
  }

  const handleBurn = async () => {
    if (!window.confirm('Are you sure you want to burn this NFT? This cannot be undone.')) return
    setBurning(true)
    setError(null)
    try {
      const rawId = parseInt(walletAddress.slice(-8), 36)
      const burnerId = Number.isFinite(rawId) && rawId > 0 ? rawId % 1000000 : 1
      await simulateBurnNFT(parseInt(nftId), burnerId)
      navigate('/nfts')
    } catch (err) {
      setError(err.message)
      setBurning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-vault-600"></div>
      </div>
    )
  }

  if (!nft || nft.nftId === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">NFT Not Found</h2>
        <p className="text-gray-600 mb-6">The NFT with ID {nftId} doesn't exist</p>
        <Link to="/nfts" className="btn-primary">Back to NFTs</Link>
      </div>
    )
  }

  const myShareCount   = myShares?.shares ?? 0
  const ownershipPct   = nft.totalShares > 0
    ? ((myShareCount / nft.totalShares) * 100).toFixed(1)
    : 0
  const holdsAll       = myShareCount === nft.totalShares && nft.totalShares > 0

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">{error}</div>
      )}

      <div className="mb-6">
        <Link to="/nfts" className="text-vault-600 hover:underline flex items-center gap-2">
          ← Back to NFTs
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="glass rounded-xl overflow-hidden">
            <div className="h-64 bg-gradient-to-br from-vault-100 to-vault-200 flex items-center justify-center">
              <span className="text-8xl">🎨</span>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{nft.title}</h1>
                  <p className="text-sm text-gray-500">ID: {nft.nftId}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  nft.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {nft.isActive ? 'Active' : 'Burned'}
                </span>
              </div>
              <p className="text-gray-600 mb-6">{nft.descrip || 'No description'}</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Shares</span>
                  <span className="font-medium">{nft.totalShares}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">
                    {nft.createdAt ? new Date(nft.createdAt * 1000).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Ownership</h2>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Your shares</span>
                <span className="font-medium text-vault-700">
                  {myShareCount} / {nft.totalShares} ({ownershipPct}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-vault-600 h-3 rounded-full transition-all"
                  style={{ width: `${ownershipPct}%` }}
                />
              </div>
            </div>
            {nft.isActive && holdsAll && (
              <button
                onClick={handleBurn}
                disabled={burning}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium
                           hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {burning ? 'Burning…' : 'Burn NFT (You hold 100%)'}
              </button>
            )}
          </div>

          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              <Link to="/transfer" className="block w-full text-center btn-secondary">
                Transfer Shares
              </Link>
              <button
                onClick={loadNFTDetails}
                className="block w-full text-center btn-secondary"
              >
                ↻ Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}