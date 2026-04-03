import { useNavigate } from "react-router-dom"
import heroImage from "../assets/hero.png"
import Marketplace from "../components/Marketplace" // ✅ IMPORTANT

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="bg-[#0b0b0f] text-white min-h-screen font-sans relative">

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 blur-3xl opacity-40 pointer-events-none" />

      {/* HERO */}
      <section className="relative pt-28 px-6 lg:px-20 pb-24">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* LEFT */}
          <div className="flex-1">
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.05]">
              Next-Gen NFT <br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Marketplace
              </span>
              <br />
              on Aptos
            </h1>

            <p className="mt-6 text-gray-400 text-lg max-w-xl">
              Experience lightning-fast NFT transactions with Aptos. Mint, trade, and explore a modern decentralized marketplace.
            </p>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 hover:scale-105 transition"
              >
                Explore
              </button>

              <button
                onClick={() => navigate("/create")}
                className="px-6 py-3 rounded-xl border border-white/20 hover:border-white/40 transition"
              >
                Mint NFT
              </button>
            </div>

            {/* FEATURES */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: "Parallel Execution", desc: "High throughput" },
                { title: "Low Latency", desc: "Sub-second finality" },
                { title: "High TPS", desc: "160k+ transactions" },
              ].map((f, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur"
                >
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-sm text-gray-400">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex-1 flex justify-center">
            <img
              src={heroImage}
              alt="NFT"
              className="w-[350px] lg:w-[450px] rounded-3xl shadow-2xl"
            />
          </div>

        </div>
      </section>

      {/* 🔥 MARKETPLACE (THIS WAS MISSING) */}
      <section className="px-6 lg:px-20 pb-20">
        <Marketplace />
      </section>

      {/* PERFORMANCE */}
      <section className="px-6 lg:px-20 py-24 grid lg:grid-cols-2 gap-12">
        <div>
          <p className="text-blue-400 text-sm mb-2">REAL-TIME PERFORMANCE</p>
          <h2 className="text-4xl font-bold mb-6">Aptos-Powered Velocity</h2>

          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
              0.9s Finality
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
              160k+ TPS
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
            840k+ Wallets
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
            2.4M NFTs
          </div>
        </div>
      </section>

    </div>
  )
}