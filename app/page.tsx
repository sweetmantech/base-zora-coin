'use client';

import { usePrivy } from '@privy-io/react-auth';
import { WalletInfo } from '@/components/wallet-info';
import { CreateCoin } from '@/components/create-coin';

// Coin metadata from the provided JSON
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

function CoinMetadataDisplay() {
  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Thumbnail/Image */}
      <div className="aspect-video w-full">
        <img 
          src={coinMetadata.image} 
          alt={coinMetadata.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Metadata Content */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">{coinMetadata.name}</h2>
        <div className="prose prose-sm max-w-none">
          {coinMetadata.description.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-gray-700 mb-3 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
        
        {/* Animation/Video Link */}
        {coinMetadata.animation_url && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <a 
              href={coinMetadata.animation_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              View Animation
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

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
        <CoinMetadataDisplay />
        
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
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Case Study 005 — New Day</h1>
        <p className="text-lg text-gray-600 mb-8">
          deploy the coin on zora
        </p>
      </div>
      
      {/* Coin Metadata Display for non-authenticated users */}
      <CoinMetadataDisplay />
      
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
