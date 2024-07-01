import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const getWhitelistEmailsQueryKey = ["getWhitelistEmails"];

/**
 *
 * @returns {import("@tanstack/react-query").UseQueryResult<string[], unknown>}
 */
export const getWhitelistEmails = () => {
  return useQuery({
    queryKey: getWhitelistEmailsQueryKey,
    queryFn: () => axios.get("/api/whitelist/emails").then((res) => res.data),
  });
};
