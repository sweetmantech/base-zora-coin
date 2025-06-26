'use client';

import { useAccount, useBalance, useEnsName } from 'wagmi';

export function WalletInfo() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });
  const { data: ensName } = useEnsName({
    address: address,
  });

  if (!isConnected) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg">
        <p className="text-gray-600">No wallet connected</p>
        <p className="text-sm text-gray-500 mt-1">
          Connect your wallet using Privy to see account details
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg space-y-2">
      <h3 className="font-semibold text-lg">Wallet Information</h3>
      
      <div>
        <span className="font-medium">Address: </span>
        <span className="font-mono text-sm">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
      </div>

      {ensName && (
        <div>
          <span className="font-medium">ENS Name: </span>
          <span>{ensName}</span>
        </div>
      )}

      <div>
        <span className="font-medium">Network: </span>
        <span>{chain?.name || 'Unknown'}</span>
      </div>

      {balance && (
        <div>
          <span className="font-medium">Balance: </span>
          <span>
            {Number(balance.formatted).toFixed(4)} {balance.symbol}
          </span>
        </div>
      )}
    </div>
  );
}