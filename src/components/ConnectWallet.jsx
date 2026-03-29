import { useWallet } from '../App'
import { getRequestAccess, retrievePublicKey } from '../lib/stellarWallet'

export default function ConnectWallet() {
  const { walletAddress } = useWallet()

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleConnect = async () => {
    try {
      await getRequestAccess()
      const address = await retrievePublicKey()
      // The wallet context connectWallet function will be called by the App component
      // For now, we'll just set the address directly through context
      // In a real implementation, this would be handled by the wallet context
      window.dispatchEvent(new CustomEvent('wallet-connected', { detail: address }))
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      window.alert('Failed to connect wallet. Please make sure Freighter is installed and try again.')
    }
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="glass p-8 rounded-2xl max-w-md w-full text-center">
        <div className="w-20 h-20 bg-vault-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-vault-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 002 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
        <p className="text-gray-600 mb-6">
          Connect your Freighter wallet to mint, trade, and manage fractional NFTs on the Stellar network.
        </p>

        {walletAddress ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700 mb-2">Connected</p>
            <p className="font-mono text-sm">{formatAddress(walletAddress)}</p>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            className="btn-primary w-full py-3"
          >
            Connect Freighter Wallet
          </button>
        )}

        <p className="text-xs text-gray-500 mt-4">
          Don't have Freighter?{' '}
          <a 
            href="https://www.freighter.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-vault-600 hover:underline"
          >
            Download here
          </a>
        </p>
      </div>
    </div>
  )
}
