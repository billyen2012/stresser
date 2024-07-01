import LineChart from "@/components/LineChart";
import dayjs from "dayjs";
import { useMemo } from "react";

function bytesToMegabytes(bytes) {
  if (typeof bytes !== "number" || isNaN(bytes)) {
    throw new Error("Input must be a valid number");
  }

  return bytes / (1024 * 1024);
}

/**
 *
 * @param {{
 * data:import('@/types').GetMetricsDataType[]
 * }} param0
 * @returns
 */
export default function LiveChart({ data = [] }) {
  const filtered = data
    .filter((e) => e.metrics)
    .map((e) => ({
      timestamp: e.timestamp,
      vus: e.metrics.vus?.sample.value ?? 0,
      http_reqs_rate: e.metrics.http_reqs?.sample.rate.toFixed(2) ?? 0,
      iterations: e.metrics.iterations?.sample.rate.toFixed(2) ?? 0,
      data_received_rate: e.metrics.data_received?.sample.rate
        ? bytesToMegabytes(e.metrics.data_received?.sample.rate).toFixed(8)
        : 0,
      data_sent: e.metrics.data_sent?.sample.rate
        ? bytesToMegabytes(e.metrics.data_received?.sample.rate).toFixed(8)
        : 0,
    }));

  return (
    data.length > 3 && (
      <LineChart
        showGrid={false}
        data={filtered}
        tooltipLabelFormatter={(label) =>
          dayjs(new Date(label)).format("mm:ss")
        }
        tooltipContentStyle={{
          backgroundColor: "rgba(120,120,120,0.3)",
          border: "none",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          lineHeight: "14px",
        }}
        xAxis={{
          dataKey: "timestamp",
          tickFormatter: (value) => dayjs(new Date(value)).format("mm:ss"),
          interval: "preserveStart",
        }}
        height="180px"
        margin={{
          // left: -30,
          right: 20,
        }}
        series={[
          {
            type: "monotone",
            dataKey: "vus",
            stroke: "#82ca9d",
            isAnimationActive: false,
            dot: false,
            name: "vus",
          },
          {
            type: "monotone",
            dataKey: "http_reqs_rate",
            stroke: "rgb(101 138 247)",
            isAnimationActive: false,
            dot: false,
            name: "http reqs rate (s)",
          },
          {
            type: "monotone",
            dataKey: "iterations",
            stroke: "rgb(89 223 247)",
            isAnimationActive: false,
            dot: false,
            name: "iterations rate (s)",
          },
          {
            type: "monotone",
            dataKey: "data_received_rate",
            stroke: "rgb(182 152 255)",
            isAnimationActive: false,
            dot: false,
            name: "data received rate (MB)",
          },
          {
            type: "monotone",
            dataKey: "data_received_rate",
            stroke: "rgb(110 190 221)",
            isAnimationActive: false,
            dot: false,
            name: "data sent rate (MB)",
          },
        ]}
      />
    )
  );
}
