'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useWriteContract, useSimulateContract, useWaitForTransactionReceipt } from 'wagmi';
import { createCoinCall, DeployCurrency, ValidMetadataURI } from '@zoralabs/coins-sdk';
import { baseSepolia } from 'wagmi/chains';
import { Address } from 'viem';

export function CreateCoin() {
  const { address, isConnected } = useAccount();
  const [isCreating, setIsCreating] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  // Hard-coded coin parameters for testing
  const coinParams = {
    name: "New Day Coin",
    symbol: "NDC", 
    uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI, // Example metadata URI
    payoutRecipient: address as Address,
    chainId: baseSepolia.id,
    currency: DeployCurrency.ETH, // Using ETH since ZORA is not supported on Base Sepolia
  };

  // Get the contract call configuration
  const contractCallParams = createCoinCall(coinParams);

  // Simulate the contract call
  const { data: simulateData, error: simulateError } = useSimulateContract({
    ...contractCallParams,
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Write contract hook
  const { 
    writeContract, 
    data: txHash, 
    isPending: isWritePending,
    error: writeError 
  } = useWriteContract();

  // Wait for transaction receipt
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleCreateCoin = async () => {
    if (!simulateData || !address) return;
    
    setIsCreating(true);
    try {
      writeContract(simulateData.request);
      if (txHash) {
        setLastTxHash(txHash);
      }
    } catch (error) {
      console.error('Error creating coin:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Deploy Coin</h3>
        <p className="text-gray-600">Connect your wallet to deploy a coin on Zora</p>
      </div>
    );
  }

  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Deploy Coin on Zora</h3>
      
      <div className="space-y-3 mb-6">
        <div className="text-sm">
          <span className="font-medium text-gray-600">Name:</span>
          <span className="ml-2">{coinParams.name}</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-600">Symbol:</span>
          <span className="ml-2">{coinParams.symbol}</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-600">Network:</span>
          <span className="ml-2">Base Sepolia (Testnet)</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-600">Currency:</span>
          <span className="ml-2">ETH</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-600">Payout Recipient:</span>
          <span className="ml-2 font-mono text-xs">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
      </div>

      {simulateError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            Simulation Error: {simulateError.message}
          </p>
        </div>
      )}

      {writeError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            Transaction Error: {writeError.message}
          </p>
        </div>
      )}

      {isConfirmed && txHash && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">
            ✅ Coin deployed successfully!
          </p>
          <p className="text-xs text-green-500 font-mono mt-1">
            Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </p>
        </div>
      )}

      <button
        onClick={handleCreateCoin}
        disabled={
          !simulateData || 
          isCreating || 
          isWritePending || 
          isConfirming ||
          !!simulateError
        }
        className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
          !simulateData || isCreating || isWritePending || isConfirming || !!simulateError
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
        }`}
      >
        {isConfirming ? (
          'Confirming Transaction...'
        ) : isWritePending || isCreating ? (
          'Creating Coin...'
        ) : simulateError ? (
          'Cannot Deploy (Error)'
        ) : !simulateData ? (
          'Preparing Transaction...'
        ) : (
          'Deploy Coin on Zora'
        )}
      </button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        This will deploy a new ERC20 coin using the Zora protocol on Base Sepolia testnet
      </p>
    </div>
  );
}