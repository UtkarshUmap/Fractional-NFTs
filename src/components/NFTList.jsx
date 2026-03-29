import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function NFTList() {
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNFTs()
  }, [])

  const loadNFTs = async () => {
    setLoading(true)
    setTimeout(() => {
      setNfts([])
      setLoading(false)
    }, 500)
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
        <Link to="/mint" className="btn-primary">
          + Mint New NFT
        </Link>
      </div>

      {nfts.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                  <span className="text-gray-500">Shares</span>
                  <span className="font-medium text-vault-700">
                    {nft.ownerShares} / {nft.totalShares}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-vault-600 h-2 rounded-full"
                    style={{ width: `${(nft.ownerShares / nft.totalShares) * 100}%` }}
                  ></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
