import { sleep } from "@/util/sleep";
import { useEffect, useState } from "react";

export const useMetricDataFeed = ({ start = false, scriptId = "" }) => {
  const [metricData, setMetricData] = useState(undefined);

  useEffect(() => {
    let isTornDown = false;
    const controller = new AbortController();
    const fetchData = async () => {
      while (start && !isTornDown) {
        const res = await fetch("/api/scripts/metrics/" + scriptId, {
          signal: controller.signal,
        });
        if (!res.ok) {
          return;
        }

        const data = await res.json();
        setMetricData(data);
        await sleep(200);
        fetchData();
      }
      return () => {
        isTornDown = true;
        controller.abort();
      };
    };
    if (scriptId) {
      fetchData();
    }
  }, [start, scriptId, setMetricData]);

  return {
    metricData,
    setMetricData,
  };
};
