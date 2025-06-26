'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider, cookieToInitialState } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';

// Create a stable query client instance
const queryClient = new QueryClient()

export default function Providers({
  children,
  cookie,
}: {
  children: React.ReactNode;
  cookie?: string | null;
}) {
  const initialState = cookieToInitialState(config, cookie);

  return (
    <WagmiProvider config={config} initialState={initialState}>
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