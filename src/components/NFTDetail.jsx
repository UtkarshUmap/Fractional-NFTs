import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useWallet } from '../App'
import { simulateBurnNFT } from '../lib/stellar'

export default function NFTDetail() {
  const { nftId } = useParams()
  const { walletAddress } = useWallet()
  const navigate = useNavigate()
  
  const [nft, setNft] = useState(null)
  const [holders, setHolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [burning, setBurning] = useState(false)

  useEffect(() => {
    loadNFTDetails()
  }, [nftId])

  const loadNFTDetails = async () => {
    setLoading(true)
    setTimeout(() => {
      setNft(null)
      setHolders([])
      setLoading(false)
    }, 500)
  }

  const handleBurn = async () => {
    if (!window.confirm('Are you sure you want to burn this NFT? This action cannot be undone.')) {
      return
    }

    setBurning(true)
    try {
      const burnerId = walletAddress ? parseInt(walletAddress.slice(-8), 16) % 1000000 : 1
      
      const txData = await simulateBurnNFT(parseInt(nftId), burnerId)
      console.log('Burn transaction prepared:', txData)

      setTimeout(() => {
        setBurning(false)
        alert('NFT burned successfully! (Demo mode)')
        navigate('/nfts')
      }, 1000)
    } catch (err) {
      alert(err.message)
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

  if (!nft) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">NFT Not Found</h2>
        <p className="text-gray-600 mb-6">The NFT with ID {nftId} doesn't exist</p>
        <Link to="/nfts" className="btn-primary">
          Back to NFTs
        </Link>
      </div>
    )
  }

  const ownershipPercent = nft.totalShares > 0 
    ? ((nft.ownerShares / nft.totalShares) * 100).toFixed(1) 
    : 0

  return (
    <div>
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
                  nft.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ownership</h2>
            
            <div className="mb-4">
              <div className="justify-between text-sm mb-2">
                <span className="text-gray-600">Your ownership</span>
                <span className="font-medium text-vault-700">{ownershipPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-vault-600 h-3 rounded-full transition-all"
                  style={{ width: `${ownershipPercent}%` }}
                ></div>
              </div>
            </div>

            {nft.isActive && ownershipPercent === 100 && (
              <button
                onClick={handleBurn}
                disabled={burning}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium
                         hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {burning ? 'Burning...' : 'Burn NFT (Requires 100% ownership)'}
              </button>
            )}
          </div>

          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Share Holders</h2>
            
            {holders.length === 0 ? (
              <p className="text-gray-500 text-sm">No share holders yet</p>
            ) : (
              <div className="space-y-3">
                {holders.map((holder, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Holder #{holder.holderId}</p>
                      <p className="text-xs text-gray-500">{holder.shares} shares</p>
                    </div>
                    <span className="text-sm text-vault-700">
                      {((holder.shares / nft.totalShares) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              <Link
                to="/transfer"
                className="block w-full text-center btn-secondary"
              >
                Transfer Shares
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}