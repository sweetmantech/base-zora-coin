'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { useWriteContract, useSimulateContract, useWaitForTransactionReceipt } from 'wagmi';

import { createCoinCall, DeployCurrency, ValidMetadataURI } from '@zoralabs/coins-sdk';
import { baseSepolia } from 'wagmi/chains';
import { Address } from 'viem';

export function CreateCoin() {
  const { address, isConnected, chain } = useAccount();
  const [isCreating, setIsCreating] = useState(false);
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  // Hard-coded coin parameters for testing
  const coinParams = useMemo(() => {
    if (!address) return null;
    
    return {
      name: "Case Study 005 — New Day",
      symbol: "NDC", 
      uri: "https://arweave.net/6-QOxHXAK4wJ8s6I84FCEHJ-naFmwcP3uhwf1DhFUXI" as ValidMetadataURI,
      payoutRecipient: address as Address,
      chainId: baseSepolia.id,
      currency: DeployCurrency.ETH, // Using ETH since ZORA is not supported on Base Sepolia
    };
  }, [address]);

  // Get the contract call configuration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [contractCallParams, setContractCallParams] = useState<any>(null);
  
  // Create contract call params when coinParams change
  useEffect(() => {
    if (!coinParams) {
      setContractCallParams(null);
      return;
    }
    
    const createParams = async () => {
      try {
        const params = await createCoinCall(coinParams);
        console.log('Contract call params:', params);
        setContractCallParams(params);
      } catch (error) {
        console.error('Error creating coin call:', error);
        setContractCallParams(null);
      }
    };
    
    createParams();
  }, [coinParams]);

  // Simulate the contract call
  const { data: simulateData, error: simulateError, isLoading: isSimulating } = useSimulateContract({
    ...contractCallParams,
    query: {
      enabled: isConnected && !!address && !!contractCallParams,
    },
  });

  // Add logging for debugging
  console.log('CreateCoin Debug:', {
    isConnected,
    address,
    currentChain: chain,
    targetChain: baseSepolia,
    isCorrectChain: chain?.id === baseSepolia.id,
    coinParams,
    contractCallParams,
    simulateData,
    simulateError,
    isSimulating,
    isSwitchingChain
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
    if (!address || !contractCallParams) return;
    
    // Check if we're on the correct chain (Base Sepolia)
    if (chain?.id !== baseSepolia.id) {
      console.log(`Switching from chain ${chain?.id} to Base Sepolia (${baseSepolia.id})`);
      try {
        await switchChain({ chainId: baseSepolia.id });
        // The transaction will be triggered by the chain change effect
        return;
      } catch (error) {
        console.error('Error switching chain:', error);
        return;
      }
    }
    
    setIsCreating(true);
    try {
      if (simulateData) {
        // Use simulation data if available
        writeContract(simulateData.request);
      } else {
        // Proceed without simulation - use the contract call params directly
        console.log('Proceeding without simulation...');
        writeContract(contractCallParams);
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
          <span className="ml-2">{coinParams?.name || 'New Day Coin'}</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-600">Symbol:</span>
          <span className="ml-2">{coinParams?.symbol || 'NDC'}</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-600">Target Network:</span>
          <span className="ml-2">Base Sepolia (Testnet)</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-600">Current Network:</span>
          <span className={`ml-2 ${chain?.id === baseSepolia.id ? 'text-green-600' : 'text-orange-600'}`}>
            {chain?.name || 'Unknown'} {chain?.id === baseSepolia.id ? '✅' : '⚠️'}
          </span>
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

      {!contractCallParams && address && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            ❌ Failed to prepare contract parameters. Check console for details.
          </p>
        </div>
      )}

      {chain?.id !== baseSepolia.id && isConnected && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-600">
            ⚠️ Wrong Network: You&apos;re connected to {chain?.name || 'Unknown'}
          </p>
          <p className="text-xs text-yellow-500 mt-1">
            Click the button below to switch to Base Sepolia and deploy your coin.
          </p>
        </div>
      )}

      {simulateError && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-600">
            ⚠️ Simulation Warning: {simulateError.message}
          </p>
          <p className="text-xs text-yellow-500 mt-1">
            You can still try to deploy, but the transaction might fail.
          </p>
        </div>
      )}

      {isSimulating && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-600">
            🔄 Simulating transaction...
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
          !address || 
          isCreating || 
          isWritePending || 
          isConfirming ||
          isSwitchingChain
        }
        className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
          !address || isCreating || isWritePending || isConfirming || isSwitchingChain
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : chain?.id !== baseSepolia.id
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg'
            : simulateError
            ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg'
            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
        }`}
      >
        {isSwitchingChain ? (
          'Switching Network...'
        ) : isConfirming ? (
          'Confirming Transaction...'
        ) : isWritePending || isCreating ? (
          'Creating Coin...'
        ) : chain?.id !== baseSepolia.id ? (
          'Switch to Base Sepolia & Deploy'
        ) : isSimulating ? (
          'Simulating... (Click to proceed anyway)'
        ) : simulateError ? (
          'Deploy Anyway (Simulation Failed)'
        ) : simulateData ? (
          'Deploy Coin on Zora'
        ) : (
          'Deploy Coin on Zora'
        )}
      </button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        This will deploy a new ERC20 coin using the Zora protocol on Base Sepolia testnet.
        {chain?.id !== baseSepolia.id && (
          <span> Your wallet will be switched to the correct network automatically.</span>
        )}
      </p>
    </div>
  );
}