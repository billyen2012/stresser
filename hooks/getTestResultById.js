import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const getTestResultsByScriptIdQueryKey = ["getTestResultByIdQueryKey"];

/**
 *
 * @param {{
 *   scriptId:string;
 *   testResultId:string;
 *   includeData:boolean
 * }} param0
 * @param {{enabled:boolean;refetchInterval:number;}} props
 * @returns {import("@tanstack/react-query").UseQueryResult<Omit<import('@/types').TestResult, 'errorMessage'> & { data?:{
 * data:{
 *  timestamp:string;
 *  logo?:string;
 *  progress?:string;
 *  api?:string;
 *  metrics?:import("@/types").Metrics;
 *  scenario?:string;
 *  console?:string;
 *  summary?:string;
 * }
 * }[]}>}
 */
export const getTestResultById = (
  { scriptId, testResultId, includeData = false },
  props = {}
) => {
  const searchParam = new URLSearchParams();
  if (includeData) {
    searchParam.append("include", "data");
  }

  return useQuery({
    ...props,
    queryKey: getTestResultsByScriptIdQueryKey,
    queryFn: () =>
      axios
        .get(
          `/api/scripts/${scriptId}/running-results/${testResultId}?` +
            searchParam.toString()
        )
        .then((res) => res.data),
  });
};
