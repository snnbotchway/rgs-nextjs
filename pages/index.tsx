import { Inter } from "next/font/google"
import Head from "next/head"

import Header from "@/components/Header"
import RGStaking from "@/components/RGStaking"

const inter = Inter({ subsets: ["latin"] })

export default function Home() {
  return (
    <main className={inter.className}>
      <Head>
        <title>RG Staking</title>
      </Head>
      <div className="zoom">
        <Header />
        <RGStaking />
      </div>
    </main>
  )
}
