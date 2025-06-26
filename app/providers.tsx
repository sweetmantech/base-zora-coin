'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';

// Create a stable query client instance
const queryClient = new QueryClient()

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_ID!}
          config={{
            // Disable email/SMS login methods, only allow external wallets
            loginMethods: ['wallet'],
            // Customize the appearance
            appearance: {
              theme: 'light',
              accentColor: '#676FFF',
            },
          }}
        >
          {children}
        </PrivyProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}