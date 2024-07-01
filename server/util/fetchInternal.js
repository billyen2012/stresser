import { headers } from "next/headers";

// get the baseUrl from environment variable
const BASE_URL =
  process.env.VERCEL_URL ?? // for people who are deploying to Vercel
  process.env.BASE_URL ?? // for local dev and/or self-hosted
  "http://127.0.0.1:3000";

/**
 * @param {string} url
 * @param {RequestInit} options
 * @returns
 */
export const fetchInternal = async (url, options = {}) => {
  return fetch(BASE_URL + url, {
    cache: "no-cache",
    ...options,
    /**
     * forward the headers that you need.
     * NOTE: very important not to forward the whole headers because
     * browser sometimes will set different thing to header based
     * on user's action (e.g. on Chromium based browsers, it will set `Sec-Fetch-Site` to a different value
     * if user were refreshing page v.s. just entered the page), which will cause returning the wrong cache value.
     */
    headers: {
      cookie: headers().get("cookie"),
      ...options.headers,
    },
  });
};
