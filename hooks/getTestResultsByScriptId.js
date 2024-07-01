import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const getTestResultsByScriptIdQueryKey = [
  "getTestResultsByScriptIdQueryKey",
];

/**
 *
 * @param {string} scriptId
 * @param {{enabled:boolean;refetchInterval:number;}} props
 * @returns {import("@tanstack/react-query").UseQueryResult<Array<Omit<import('@/types').TestResult, 'errorMessage'>>>}
 */
export const getTestResultsByScriptId = (scriptId, props = {}) => {
  return useQuery({
    ...props,
    queryKey: getTestResultsByScriptIdQueryKey,
    queryFn: () =>
      axios
        .get(`/api/scripts/${scriptId}/running-results`)
        .then((res) => res.data),
  });
};
