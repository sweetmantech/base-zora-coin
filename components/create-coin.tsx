"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import {
  useWriteContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
} from "wagmi";

import {
  createCoinCall,
  DeployCurrency,
  ValidMetadataURI,
} from "@zoralabs/coins-sdk";
import { base, baseSepolia } from "wagmi/chains";
import { Address } from "viem";

export function CreateCoin() {
  const { address, isConnected, chain } = useAccount();
  const [isCreating, setIsCreating] = useState(false);
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  // Determine target network based on environment
  const VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV || "development";
  const targetNetwork = VERCEL_ENV === "production" ? base : baseSepolia;
  const networkDisplayName = targetNetwork.id === base.id ? "Base (Mainnet)" : "Base Sepolia (Testnet)";

  // Hard-coded coin parameters for testing
  const coinParams = useMemo(() => {
    if (!address) return null;

    return {
      name: "Case Study 005 — New Day",
      symbol: "CaseStudy005—NewDay",
      uri: "ipfs://bafkreibs2did5lnnu4u4xwq72d6t5zgwvwzta6ppeoauyodq3joczg2rea" as ValidMetadataURI, // Actual metadata URI
      payoutRecipient: address as Address,
      chainId: targetNetwork.id,
      currency: DeployCurrency.ETH, // Using ETH since ZORA is not supported on Base Sepolia
    };
  }, [address, targetNetwork.id]);

  // Get the contract call configuration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [contractCallParams, setContractCallParams] = useState<any>(null);

  // Create contract call params when coinParams change or chain changes
  useEffect(() => {
    if (!coinParams || !isConnected || chain?.id !== targetNetwork.id) {
      setContractCallParams(null);
      return;
    }

    const createParams = async () => {
      try {
        console.log("Creating contract call params for chain:", chain?.id);
        const params = await createCoinCall(coinParams);
        console.log("Contract call params:", params);
        setContractCallParams(params);
      } catch (error) {
        console.error("Error creating coin call:", error);
        setContractCallParams(null);
      }
    };

    createParams();
  }, [coinParams, isConnected, chain?.id, targetNetwork.id]);

  // Simulate the contract call
  const {
    data: simulateData,
    error: simulateError,
    isLoading: isSimulating,
  } = useSimulateContract({
    ...contractCallParams,
    query: {
      enabled: isConnected && !!address && !!contractCallParams,
    },
  });

  // Add logging for debugging
  console.log("CreateCoin Debug:", {
    isConnected,
    address,
    currentChain: chain,
    targetChain: targetNetwork,
    isCorrectChain: chain?.id === targetNetwork.id,
    coinParams,
    contractCallParams,
    simulateData,
    simulateError,
    isSimulating,
    isSwitchingChain,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV,
  });

  // Write contract hook
  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  const handleCreateCoin = async () => {
    if (!address) {
      console.error("No address available");
      return;
    }

    // Check if we're on the correct chain
    if (chain?.id !== targetNetwork.id) {
      console.log(
        `Switching from chain ${chain?.id} to ${targetNetwork.name} (${targetNetwork.id})`
      );
      try {
        await switchChain({ chainId: targetNetwork.id });
        // After switching, we'll wait for the useEffect to prepare contract params
        return;
      } catch (error) {
        console.error("Error switching chain:", error);
        return;
      }
    }

    // If no contract params, try to prepare them now
    if (!contractCallParams && coinParams) {
      console.log("Preparing contract parameters...");
      try {
        const params = await createCoinCall(coinParams);
        console.log("Contract call params prepared:", params);
        setContractCallParams(params);

        // Now proceed with the transaction
        setIsCreating(true);
        if (params) {
          // @ts-expect-error - TODO: fix this
          writeContract(params);
        }
      } catch (error) {
        console.error("Error preparing contract parameters:", error);
        return;
      } finally {
        setIsCreating(false);
      }
      return;
    }

    // If we have contract params, proceed with transaction
    if (contractCallParams) {
      setIsCreating(true);
      try {
        if (simulateData) {
          // Use simulation data if available
          console.log("Using simulation data for transaction");
          writeContract(simulateData.request);
        } else {
          // Proceed without simulation - use the contract call params directly
          console.log("Proceeding without simulation...");
          writeContract(contractCallParams);
        }
      } catch (error) {
        console.error("Error creating coin:", error);
      } finally {
        setIsCreating(false);
      }
    } else {
      console.error("No contract parameters available");
    }
  };

  if (!isConnected) {
    return (
      <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Deploy Coin</h3>
        <p className="text-gray-600">
          Connect your wallet to deploy a coin on Zora
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Deploy Coin on Zora</h3>

      <div className="space-y-3 mb-6">
        <div className="text-sm">
          <span className="font-medium text-gray-600">Name:</span>
          <span className="ml-2">
            {coinParams?.name || "Case Study 005 — New Day"}
          </span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-600">Symbol:</span>
          <span className="ml-2">
            {coinParams?.symbol || "CaseStudy005—NewDay"}
          </span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-600">Target Network:</span>
          <span className="ml-2">{networkDisplayName}</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-600">Current Network:</span>
          <span
            className={`ml-2 ${
              chain?.id === targetNetwork.id
                ? "text-green-600"
                : "text-orange-600"
            }`}
          >
            {chain?.name || "Unknown"}{" "}
            {chain?.id === targetNetwork.id ? "✅" : "⚠️"}
          </span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-600">Currency:</span>
          <span className="ml-2">ETH</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-600">Payout Recipient:</span>
          <span className="ml-2 font-mono text-xs">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
      </div>

      {!contractCallParams && address && chain?.id === targetNetwork.id && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-600">
            ⚠️ Contract parameters not ready. They will be prepared when you
            click deploy.
          </p>
        </div>
      )}

      {!contractCallParams && address && chain?.id !== targetNetwork.id && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-600">
            ℹ️ Switch to {targetNetwork.name} to prepare contract parameters.
          </p>
        </div>
      )}

      {chain?.id !== targetNetwork.id && isConnected && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-600">
            ⚠️ Wrong Network: You&apos;re connected to{" "}
            {chain?.name || "Unknown"}
          </p>
          <p className="text-xs text-yellow-500 mt-1">
            Click the button below to switch to {targetNetwork.name} and deploy your
            coin.
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
          <p className="text-sm text-blue-600">🔄 Simulating transaction...</p>
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
          isSwitchingChain ||
          !coinParams
        }
        className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
          !address ||
          isCreating ||
          isWritePending ||
          isConfirming ||
          isSwitchingChain ||
          !coinParams
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : chain?.id !== targetNetwork.id
            ? "bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg"
            : simulateError
            ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg"
            : "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg"
        }`}
      >
        {isSwitchingChain
          ? "Switching Network..."
          : isConfirming
          ? "Confirming Transaction..."
          : isWritePending || isCreating
          ? "Creating Coin..."
          : chain?.id !== targetNetwork.id
          ? `Switch to ${targetNetwork.name} & Deploy`
          : isSimulating
          ? "Simulating... (Click to proceed anyway)"
          : simulateError
          ? "Deploy Anyway (Simulation Failed)"
          : simulateData
          ? "Deploy Coin on Zora"
          : !contractCallParams
          ? "Prepare & Deploy Coin"
          : "Deploy Coin on Zora"}
      </button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        This will deploy a new ERC20 coin using the Zora protocol on {networkDisplayName}.
        {chain?.id !== targetNetwork.id && (
          <span>
            {" "}
            Your wallet will be switched to the correct network automatically.
          </span>
        )}
      </p>
    </div>
  );
}
