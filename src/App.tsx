import { BrowserRouter, Route, Routes } from "react-router-dom"

import DashboardLayout from "./components/layout/DashboardLayout"
import AdminLayout from "./components/layout/AdminLayout"

import CommodityDetail from "./pages/CommodityDetail"
import DataExport from "./pages/DataExport"
import EWS from "./pages/EWS"
import Home from "./pages/Home"
import MapPage from "./pages/MapPage"
import Monitoring from "./pages/Monitoring"
import Pasar from "./pages/Pasar"
import Prediction from "./pages/Prediksi"
import Recommendations from "./pages/Recommendations"
import NotFound from "./pages/NotFound"

import AdminLogin from "./pages/admin/AdminLogin"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminInput from "./pages/admin/AdminInput"
import AdminRiwayat from "./pages/admin/AdminRiwayat"
import AdminHet from "./pages/admin/AdminHet"


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


          {/* Data */}

          <Route
            path="/data"
            element={<DataExport />}
          />


          {/* Settings */}

          <Route
            path="/settings"
            element={<div>Halaman Pengaturan</div>}
          />

        </Route>

        {/* ADMIN */}

        <Route
          path="/login-admin"
          element={<AdminLogin />}
        />

        <Route element={<AdminLayout />}>

          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/admin/input" element={<AdminInput />} />

          <Route path="/admin/riwayat" element={<AdminRiwayat />} />

          <Route path="/admin/het" element={<AdminHet />} />

        </Route>

        {/* 404 — route tak dikenal */}
        <Route path="*" element={<NotFound />} />

      </Routes>

    </BrowserRouter>

  )

}

export default App