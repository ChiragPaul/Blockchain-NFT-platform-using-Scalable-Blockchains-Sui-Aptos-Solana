import WalletButton from "./WalletButton"
import { NavLink } from "react-router-dom"

export default function Navbar() {
  const baseStyle = "text-gray-400 hover:text-white transition"
  const activeStyle = "text-purple-300 border-b border-purple-300 pb-1"

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl h-20 flex justify-between items-center px-8">
      
      <div className="flex items-center gap-10">
        <h1 className="text-xl font-bold text-purple-300">
          Aptos NFT Marketplace
        </h1>

        <div className="hidden md:flex gap-6 text-sm">

          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? activeStyle : baseStyle
            }
          >
            Explore
          </NavLink>

          <NavLink
            to="/create"
            className={({ isActive }) =>
              isActive ? activeStyle : baseStyle
            }
          >
            Mint
          </NavLink>

          <span className={baseStyle}>
            Activity
          </span>

        </div>
      </div>

      <div className="flex items-center">
        <WalletButton />
      </div>

    </nav>
  )
}