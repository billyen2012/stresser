import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const getWhitelistDomainsQueryKey = ["getWhitelistDomains"];

/**
 *
 * @returns {import("@tanstack/react-query").UseQueryResult<string[], unknown>}
 */
export const getWhitelistDomains = () => {
  return useQuery({
    queryKey: getWhitelistDomainsQueryKey,
    queryFn: () => axios.get("/api/whitelist/domains").then((res) => res.data),
  });
};
