import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { useState } from 'react';
import './App.css';
import MintWidget from './components/MintWidget';
import Marketplace from './components/Marketplace';
import LoyaltyDashboard from './components/LoyaltyDashboard';

function App() {
  const currentAccount = useCurrentAccount();
  const [activeTab, setActiveTab] = useState<'mint' | 'market' | 'loyalty'>('mint');
  const [recentMintedNftId, setRecentMintedNftId] = useState<string | null>(null);

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="logo">
          <h1>Sui NFT Platform 🚀</h1>
        </div>
        <div className="nav-controls">
          <ConnectButton />
        </div>
      </header>

      <main className="main-content">
        {!currentAccount ? (
          <div className="hero-section">
            <h2 className="gradient-text">Next-Gen NFT Experience.</h2>
            <p>Connect your wallet to mint, trade, and earn loyalty points!</p>
            <div className="placeholder-connect">
              <ConnectButton />
            </div>
          </div>
        ) : (
          <div className="dashboard">
            <nav className="tab-menu">
              <button 
                className={activeTab === 'mint' ? 'active tab-btn' : 'tab-btn'} 
                onClick={() => setActiveTab('mint')}
              >
                Mint NFT
              </button>
              <button 
                className={activeTab === 'market' ? 'active tab-btn' : 'tab-btn'} 
                onClick={() => setActiveTab('market')}
              >
                Marketplace
              </button>
              <button 
                className={activeTab === 'loyalty' ? 'active tab-btn' : 'tab-btn'} 
                onClick={() => setActiveTab('loyalty')}
              >
                Loyalty Dashboard
              </button>
            </nav>

            <div className="tab-content glass-panel">
              {activeTab === 'mint' && (
                <MintWidget
                  onMinted={(nftId) => {
                    setRecentMintedNftId(nftId);
                    setActiveTab('market');
                  }}
                />
              )}
              {activeTab === 'market' && (
                <Marketplace
                  recentMintedNftId={recentMintedNftId}
                  onRecentMintHandled={() => setRecentMintedNftId(null)}
                />
              )}
              {activeTab === 'loyalty' && <LoyaltyDashboard />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
