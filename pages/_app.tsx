import { MoralisProvider } from "react-moralis"

import type { AppProps } from "next/app"
import Head from "next/head"

import { NotificationProvider } from "@web3uikit/core"

import "@/styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <NotificationProvider>
        <Head>
          <title>RG Staking</title>
          <meta name="description" content="Ethereal Gallery" />
        </Head>
        <Component {...pageProps} />
      </NotificationProvider>
    </MoralisProvider>
  )
}
