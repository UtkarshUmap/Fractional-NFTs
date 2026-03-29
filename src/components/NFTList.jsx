import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { viewNFT, viewPlatformStats } from '../lib/stellar'

export default function NFTList() {
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadNFTs()
  }, [])

  const loadNFTs = async () => {
    setLoading(true)
    setError(null)
    try {
      // Get total count from platform stats, then fetch each NFT by ID
      const stats = await viewPlatformStats()
      const total = stats?.totalNfts || 0

      if (total === 0) {
        setNfts([])
        setLoading(false)
        return
      }

      // Fetch all NFTs by ID (IDs are sequential 1..total)
      const results = await Promise.all(
        Array.from({ length: total }, (_, i) => viewNFT(i + 1))
      )

      // Filter out nulls (Not_Found defaults)
      setNfts(results.filter(n => n && n.nftId !== 0))
    } catch (err) {
      console.error('Failed to load NFTs:', err)
      setError('Failed to load NFTs from contract. Make sure your contract ID is set correctly.')
      setNfts([])
    }
    setLoading(false)
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Fractional NFTs</h1>
          <p className="text-gray-600 mt-1">Browse and manage your fractional NFT collection</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadNFTs} className="btn-secondary text-sm">
            ↻ Refresh
          </button>
          <Link to="/mint" className="btn-primary">
            + Mint New NFT
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
          {error}
        </div>
      )}

      {nfts.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No NFTs yet</h3>
          <p className="text-gray-600 mb-6">Mint your first fractional NFT to get started</p>
          <Link to="/mint" className="btn-primary inline-block">
            Mint Your First NFT
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <Link
              key={nft.nftId}
              to={`/nfts/${nft.nftId}`}
              className="glass rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-vault-100 to-vault-200 flex items-center justify-center">
                <span className="text-6xl">🎨</span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">{nft.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    nft.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {nft.isActive ? 'Active' : 'Burned'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{nft.descrip}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total Shares</span>
                  <span className="font-medium text-vault-700">{nft.totalShares}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}