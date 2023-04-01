import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "@/components/Navbar";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { polygon } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { LensContextProvider } from "../context/LensContext";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "../constants/lensConstants";

const { chains, provider } = configureChains(
  [polygon],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <ApolloProvider client={apolloClient}>
          <LensContextProvider>
            <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
              <Navbar />
              <Component {...pageProps} />
            </div>
          </LensContextProvider>
        </ApolloProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
