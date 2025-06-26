'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}