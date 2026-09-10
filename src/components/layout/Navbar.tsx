import { Link } from "react-router-dom"
import bridaLogo from "../../assets/brida-logo.png";

import {
  Bell,
  ChevronDown,
} from "lucide-react"


const menuItems = [
  {
    label: "Harga",
    path: "/monitoring",
  },
  {
    label: "Pasar",
    path: "/peta",
  },
  {
    label: "Peta",
    path: "/peta",
  },
  {
    label: "Prediksi",
    path: "/prediksi",
  },
  {
    label: "EWS",
    path: "/ews",
  },
  {
    label: "Rekomendasi",
    path: "/rekomendasi",
  },
]


export default function Navbar() {

  return (

    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#C93742]/95 backdrop-blur-md">

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">


        {/* LOGO */}

          <Link
            to="/"
            className="group flex items-center gap-3"
          >

            <img
              src={bridaLogo}
              alt="BRIDA Kota Surabaya"
              className="h-10 w-auto"
            />

            <div>

              <h1 className="text-xl font-extrabold tracking-tight text-white transition group-hover:opacity-80">
                SIMONPEDIA
              </h1>

              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/70">
                Bapok Surabaya
              </p>

            </div>

          </Link>

        {/* MENU */}

        <nav className="hidden items-center gap-8 lg:flex">

          {menuItems.map((item) => (

            <Link
              key={item.label}
              to={item.path}
              className="text-sm font-medium text-white/85 transition hover:text-white"
            >
              {item.label}
            </Link>

          ))}

        </nav>


        {/* RIGHT */}

        <div className="flex items-center gap-4">


          {/* NOTIFICATION */}

          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10"
            aria-label="Notifikasi"
          >

            <Bell size={19} />

            {/* Notification indicator */}

            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-white" />

          </button>


          {/* PROFILE */}

          <button
            className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-white transition hover:bg-white/15 sm:flex"
          >

            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-[#C93742]">
              A
            </div>

            <span className="text-sm font-medium">
              Admin
            </span>

            <ChevronDown size={15} />

          </button>


        </div>

      </div>

    </header>

  )
}