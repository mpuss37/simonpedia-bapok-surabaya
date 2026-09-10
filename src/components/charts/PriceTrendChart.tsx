import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const priceData = [
  { date: "1 Agu", price: 54000 },
  { date: "2 Agu", price: 55000 },
  { date: "3 Agu", price: 56500 },
  { date: "4 Agu", price: 58000 },
  { date: "5 Agu", price: 62000 },
  { date: "6 Agu", price: 65000 },
  { date: "7 Agu", price: 68000 },
]

export default function PriceTrendChart() {
  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={priceData}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 10,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#F1E1E3"
          />

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#6B6B6B",
              fontSize: 12,
            }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#6B6B6B",
              fontSize: 12,
            }}
            tickFormatter={(value) => `${value / 1000}K`}
          />

          <Tooltip
            formatter={(value) =>
              `Rp${Number(value).toLocaleString("id-ID")}`
            }
          />

          <Line
            type="monotone"
            dataKey="price"
            stroke="#C93742"
            strokeWidth={4}
            dot={{
              r: 4,
              fill: "#C93742",
            }}
            activeDot={{
              r: 7,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}