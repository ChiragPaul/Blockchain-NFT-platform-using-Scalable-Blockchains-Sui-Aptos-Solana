import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App"

import { BrowserRouter } from "react-router-dom"
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react"
import { APTOS_NETWORK } from "./constants/aptos"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ network: APTOS_NETWORK }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AptosWalletAdapterProvider>
  </StrictMode>
)
