import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { checkConnection, retrievePublicKey, getRequestAccess } from './lib/stellarWallet'
import Layout from './components/Layout'
import PlatformStats from './components/PlatformStats'
import NFTList from './components/NFTList'
import MintNFTForm from './components/MintNFTForm'
import TransferForm from './components/TransferForm'
import NFTDetail from './components/NFTDetail'
import ConnectWallet from './components/ConnectWallet'

export const WalletContext = createContext(null)

export function useWallet() {
  return useContext(WalletContext)
}

function App() {
  const [walletAddress, setWalletAddress] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkWallet()
    
    // Listen for wallet connection events
    const handleWalletConnected = (event) => {
      setWalletAddress(event.detail)
    }
    
    window.addEventListener('wallet-connected', handleWalletConnected)
    
    return () => {
      window.removeEventListener('wallet-connected', handleWalletConnected)
    }
  }, [])

  const checkWallet = async () => {
    try {
      const allowed = await checkConnection()
      if (allowed) {
        const address = await retrievePublicKey()
        setWalletAddress(address)
      }
    } catch (error) {
      console.log('Wallet not connected')
    } finally {
      setIsLoading(false)
    }
  }

  const connectWallet = async () => {
    try {
      await getRequestAccess()
      const address = await retrievePublicKey()
      setWalletAddress(address)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const disconnectWallet = () => {
    setWalletAddress(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vault-600"></div>
      </div>
    )
  }

  return (
    <WalletContext.Provider value={{ walletAddress, connectWallet, disconnectWallet }}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/nfts" replace />} />
            <Route path="/stats" element={<PlatformStats />} />
            <Route path="/nfts" element={<NFTList />} />
            <Route path="/nfts/:nftId" element={<NFTDetail />} />
            <Route path="/mint" element={walletAddress ? <MintNFTForm /> : <ConnectWallet />} />
            <Route path="/transfer" element={walletAddress ? <TransferForm /> : <ConnectWallet />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </WalletContext.Provider>
  )
}

export default App