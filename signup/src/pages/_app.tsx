import "@/styles/globals.css";
import Head from "next/head";
import { useState, useEffect } from "react";
import type { AppProps } from "next/app";
import { AnonAadhaarProvider } from "anon-aadhaar-react";
import {
  w3mConnectors,
  w3mProvider,
  EthereumClient,
} from "@web3modal/ethereum";
import { Header } from "../components/Header";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { scrollSepolia } from "wagmi/chains";
import { Web3Modal } from "@web3modal/react";
import { Footer } from "@/components/Footer";
import { UserStatus } from "@/interface";

const chains = [scrollSepolia];
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "";
const appId = process.env.NEXT_PUBLIC_APP_ID || "";

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});

const ethereumClient = new EthereumClient(wagmiConfig, chains);

export default function App({ Component, pageProps }: AppProps) {
  const [userStatus, setUserStatus] = useState<UserStatus>(
    UserStatus.LOGGED_OUT
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);
  return (
    <>
      <Head>
        <title>ZeroSwipes sign up</title>
        <meta property="og:title" content="Anon Aadhaar Example" key="title" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {ready ? (
        <WagmiConfig config={wagmiConfig}>
          <AnonAadhaarProvider _appId={appId}>
            <div className="flex flex-col h-screen bg-gray-100 justify-between">
              <Header />
              <Component {...pageProps} setUserStatus={setUserStatus} />
              <Footer text={userStatus} />
            </div>
          </AnonAadhaarProvider>
        </WagmiConfig>
      ) : null}
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}
