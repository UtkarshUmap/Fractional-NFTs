import { Link, useLocation } from 'react-router-dom'
import { useWallet } from '../App'

export default function Layout({ children }) {
  const { walletAddress, disconnectWallet } = useWallet()
  const location = useLocation()

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const navItems = [
    { path: '/nfts', label: 'NFTs', icon: 'grid' },
    { path: '/stats', label: 'Stats', icon: 'chart' },
    { path: '/mint', label: 'Mint', icon: 'plus' },
    { path: '/transfer', label: 'Transfer', icon: 'arrow' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-vault-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NV</span>
              </div>
              <span className="text-xl font-bold text-gray-900">NFT Vault</span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-vault-100 text-vault-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              {walletAddress ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-mono text-gray-600">
                    {formatAddress(walletAddress)}
                  </span>
                  <button
                    onClick={disconnectWallet}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Disconnect
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="md:hidden border-t border-gray-200">
          <div className="flex justify-around py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === item.path
                    ? 'text-vault-600 bg-vault-50'
                    : 'text-gray-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            NFT Vault — Fractional NFT Dashboard on Stellar
          </p>
        </div>
      </footer>
    </div>
  )
}
