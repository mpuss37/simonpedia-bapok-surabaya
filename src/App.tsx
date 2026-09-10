import { BrowserRouter, Route, Routes } from "react-router-dom"

import DashboardLayout from "./components/layout/DashboardLayout"

import CommodityDetail from "./pages/CommodityDetail"
import EWS from "./pages/EWS"
import Home from "./pages/Home"
import MapPage from "./pages/MapPage"
import Monitoring from "./pages/Monitoring"
import Pasar from "./pages/Pasar"
import Prediction from "./pages/Prediction"
import Recommendations from "./pages/Recommendations"


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* DASHBOARD LAYOUT */}

        <Route element={<DashboardLayout />}>

          {/* Dashboard */}

          <Route
            path="/"
            element={<Home />}
          />

          {/* Monitoring */}

          <Route
            path="/monitoring"
            element={<Monitoring />}
          />

          <Route 
            path="/monitoring/:commodity" 
            element={<CommodityDetail />} 
          />

          {/* Pasar */}

          <Route
            path="/pasar"
            element={<Pasar />}
          />


          {/* Peta */}

          <Route
            path="/peta"
            element={<MapPage />}
          />


          {/* Analisis */}

          <Route
            path="/analisis"
            element={<div>Halaman Analisis</div>}
          />


          {/* Prediksi */}

          <Route
            path="/prediksi"
            element={<Prediction />}
          />


          {/* Early Warning System */}

          <Route
            path="/ews"
            element={<EWS />}
          />


          {/* Rekomendasi */}

          <Route
            path="/rekomendasi"
            element={<Recommendations />}
          />


          {/* Notifikasi */}

          <Route
            path="/notifikasi"
            element={<div>Halaman Notifikasi</div>}
          />


          {/* Watchlist */}

          <Route
            path="/watchlist"
            element={<div>Halaman Watchlist</div>}
          />


          {/* Data */}

          <Route
            path="/data"
            element={<div>Halaman Data & Export</div>}
          />


          {/* Settings */}

          <Route
            path="/settings"
            element={<div>Halaman Pengaturan</div>}
          />

        </Route>

      </Routes>

    </BrowserRouter>

  )

}

export default App