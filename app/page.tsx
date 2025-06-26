'use client';

import { usePrivy } from '@privy-io/react-auth';
import { WalletInfo } from '@/components/wallet-info';
import { CreateCoin } from '@/components/create-coin';

// Coin metadata
const coinMetadata = {
  "name": "Case Study 005 — New Day",
  "description": "This is a moment to break patterns, hold vision, and build what matters.\n\nFeaturing work from LGHT, Nicolas Sassoon, Number 3 | Paul Nicholson, graphixartiste, Crystal Zapata, Hassan Rahim , Gab Bois, MaxVOAO, and John Provencher.\n\nThis and future coins on Zora are not an official network or protocol token for Base, Coinbase, or any other related product. They are created solely for artistic and cultural purposes as collectibles, not as investments or financial instruments. Base 'posts' are similar to those already shared on X - do not expect profits or returns and no ongoing development or efforts will be made to increase their value. There is a significant risk of losing all funds spent on them. Purchase only for entertainment and creative purposes.\nBase will receive 10 million tokens out of a total supply of 1 billion as creators and will never sell these tokens. All fees generated will go to grants supporting builders on Base.",
  "animation_url": "https://arweave.net/qobqWWEyFe3Z3VqPot1wJWfEZ3VAFbeyc0Ngw61CXsk",
  "image": "https://arweave.net/nNk8QmNdlNuSa44GFuvgrF-Ns9mMVYmI5e8uMbPswu8",
  "content": {
    "uri": "https://arweave.net/qobqWWEyFe3Z3VqPot1wJWfEZ3VAFbeyc0Ngw61CXsk",
    "mime": "video/mp4"
  }
};

export default function Home() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  // Privy is still loading
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-medium">Loading...</div>
      </div>
    );
  }

  // User is authenticated
  if (authenticated && user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
          <p className="text-lg text-gray-600 mb-2">
            Connected with: {user.wallet?.address}
          </p>
        </div>
        
        {/* Coin Metadata Display */}
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Thumbnail */}
            <div className="flex-shrink-0">
              <img 
                src={coinMetadata.image} 
                alt={coinMetadata.name}
                className="w-48 h-48 md:w-32 md:h-32 object-cover rounded-lg border border-gray-300"
              />
            </div>
            
            {/* Metadata */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3 text-gray-900">{coinMetadata.name}</h2>
              <div className="text-sm text-gray-600 mb-4 leading-relaxed whitespace-pre-line">
                {coinMetadata.description.slice(0, 300)}...
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Symbol:</span>
                  <span className="ml-2 text-gray-600">CaseStudy005—NewDay</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Content Type:</span>
                  <span className="ml-2 text-gray-600">{coinMetadata.content.mime}</span>
                </div>
                {coinMetadata.animation_url && (
                  <div>
                    <a 
                      href={coinMetadata.animation_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 underline"
                    >
                      View Animation
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Wagmi wallet information component */}
        <div className="w-full max-w-md">
          <WalletInfo />
        </div>

        {/* Zora coin deployment component */}
        <div className="w-full max-w-md">
          <CreateCoin />
        </div>
        
        <button
          onClick={logout}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
        >
          Disconnect Wallet
        </button>
      </div>
    );
  }

  // User is not authenticated - show login button
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <div className="text-center max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">{coinMetadata.name}</h1>
        
        {/* Coin Metadata Display for Non-Authenticated Users */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Thumbnail */}
            <div className="flex-shrink-0">
              <img 
                src={coinMetadata.image} 
                alt={coinMetadata.name}
                className="w-64 h-64 md:w-48 md:h-48 object-cover rounded-lg border border-gray-300"
              />
            </div>
            
            {/* Metadata */}
            <div className="flex-1 text-left">
              <div className="text-gray-600 mb-4 leading-relaxed whitespace-pre-line">
                {coinMetadata.description.slice(0, 400)}...
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Symbol:</span>
                  <span className="ml-2 text-gray-600">CaseStudy005—NewDay</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Content Type:</span>
                  <span className="ml-2 text-gray-600">{coinMetadata.content.mime}</span>
                </div>
                {coinMetadata.animation_url && (
                  <div>
                    <a 
                      href={coinMetadata.animation_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 underline"
                    >
                      View Animation
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-lg text-gray-600 mb-8">
          deploy the coin on zora
        </p>
      </div>
      
      <button
        onClick={login}
        className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-medium text-lg rounded-lg transition-colors shadow-lg hover:shadow-xl"
      >
        Connect Wallet
      </button>
      
      {/* Show Wagmi component even when not connected to demonstrate it's working */}
      <div className="w-full max-w-md">
        <WalletInfo />
      </div>
    </div>
  );
}
