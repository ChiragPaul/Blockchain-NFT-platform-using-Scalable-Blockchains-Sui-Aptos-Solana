import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Create from "./pages/Create"
import MarketplacePage from "./pages/MarketplacePage"

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/create" element={<Create />} />
      </Routes>
    </>
  )
}

export default App
