import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet"

import L from "leaflet"

import "leaflet/dist/leaflet.css"


const createMarkerIcon = (status: string) => {

  const color = {
    NORMAL: "#22C55E",
    SIAGA: "#EAB308",
    WASPADA: "#C93742",
  }[status]

  return L.divIcon({
    className: "",
    html: `
      <div
        style="
          width: 18px;
          height: 18px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        "
      ></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}


const markets = [
  {
    name: "Pasar Wonokromo",
    position: [-7.2917, 112.7341] as [number, number],
    status: "WASPADA",
    commodity: "Cabai Merah",
    price: "Rp68.000/kg",
  },

  {
    name: "Pasar Genteng",
    position: [-7.2506, 112.7508] as [number, number],
    status: "NORMAL",
    commodity: "Beras Premium",
    price: "Rp16.500/kg",
  },

  {
    name: "Pasar Pucang Anom",
    position: [-7.2855, 112.7560] as [number, number],
    status: "SIAGA",
    commodity: "Bawang Merah",
    price: "Rp42.000/kg",
  },

  {
    name: "Pasar Keputran",
    position: [-7.2744, 112.7385] as [number, number],
    status: "NORMAL",
    commodity: "Minyak Goreng",
    price: "Rp19.000/liter",
  },

  {
    name: "Pasar Tambahrejo",
    position: [-7.2372, 112.7524] as [number, number],
    status: "SIAGA",
    commodity: "Cabai Merah",
    price: "Rp62.000/kg",
  },
]


export default function SurabayaMap() {

  return (

    <div className="h-[520px] overflow-hidden rounded-[2rem]">

      <MapContainer
        center={[-7.2575, 112.7521]}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full"
      >

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {markets.map((market) => (

          <Marker
            key={market.name}
            position={market.position}
            icon={createMarkerIcon(market.status)}
          >

            <Popup>

              <div className="min-w-[220px]">

                <p className="text-base font-bold">
                  {market.name}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Kondisi harga pasar
                </p>


                <div className="mt-4 rounded-xl bg-gray-50 p-3">

                  <p className="text-xs text-gray-500">
                    Komoditas
                  </p>

                  <p className="mt-1 font-semibold">
                    {market.commodity}
                  </p>


                  <p className="mt-3 text-xs text-gray-500">
                    Harga
                  </p>

                  <p className="mt-1 font-bold">
                    {market.price}
                  </p>

                </div>


                <div className="mt-3 flex items-center justify-between">

                  <span className="text-xs text-gray-500">
                    Status
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                      market.status === "NORMAL"
                        ? "bg-green-100 text-green-700"
                        : market.status === "SIAGA"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {market.status}
                  </span>

                </div>

              </div>

            </Popup>

          </Marker>

        ))}

      </MapContainer>

    </div>

  )
}