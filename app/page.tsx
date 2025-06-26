'use client';

import { usePrivy } from '@privy-io/react-auth';
import { WalletInfo } from '@/components/wallet-info';
import { CreateCoin } from '@/components/create-coin';

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
