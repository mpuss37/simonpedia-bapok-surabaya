import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useChartTheme } from "../../hooks/useChartTheme"

const predictionData = [
  {
    day: "Hari ini",
    actual: 68000,
    prediction: 68000,
  },
  {
    day: "Hari 1",
    actual: null,
    prediction: 69000,
  },
  {
    day: "Hari 2",
    actual: null,
    prediction: 70000,
  },
  {
    day: "Hari 3",
    actual: null,
    prediction: 71500,
  },
  {
    day: "Hari 4",
    actual: null,
    prediction: 73000,
  },
  {
    day: "Hari 5",
    actual: null,
    prediction: 74000,
  },
  {
    day: "Hari 6",
    actual: null,
    prediction: 74500,
  },
  {
    day: "Hari 7",
    actual: null,
    prediction: 75000,
  },
]

export default function PredictionChart() {
  const chartTheme = useChartTheme()

  return (
    <div className="h-[360px] w-full">

      <ResponsiveContainer width="100%" height="100%">

        <AreaChart
          data={predictionData}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 10,
          }}
        >

          <defs>

            <linearGradient
              id="predictionGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >

              <stop
                offset="0%"
                stopColor="#C93742"
                stopOpacity={0.25}
              />

              <stop
                offset="100%"
                stopColor="#C93742"
                stopOpacity={0}
              />

            </linearGradient>

          </defs>


          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={chartTheme.gridColor}
          />


          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: chartTheme.tickColor,
              fontSize: 12,
            }}
          />


          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: chartTheme.tickColor,
              fontSize: 12,
            }}
            tickFormatter={(value) => `${value / 1000}K`}
          />


          <Tooltip
            formatter={(value) =>
              value
                ? `Rp${Number(value).toLocaleString("id-ID")}`
                : "-"
            }
            contentStyle={{
              borderRadius: 12,
              border: chartTheme.tooltip.border,
              background: chartTheme.tooltip.background,
              color: chartTheme.tooltip.color,
              fontSize: 12,
            }}
            labelStyle={{ color: chartTheme.tooltip.color }}
          />


          <Area
            type="monotone"
            dataKey="prediction"
            stroke="#C93742"
            strokeWidth={4}
            fill="url(#predictionGradient)"
            dot={{
              r: 4,
              fill: "#C93742",
            }}
          />

        </AreaChart>

      </ResponsiveContainer>

    </div>
  )
}