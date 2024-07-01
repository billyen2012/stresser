"use client";
import { createContext } from "react";

const DEFAULT_VALUE = {
  user: {
    name: "",
    email: "",
    image: "",
    id: "",
    emailHash: "",
  },
  expires: "",
};

export const SessionContext = createContext(DEFAULT_VALUE);

/**
 * @param {{
 *  session:import('next-auth').Session
 * }} param0
 * @returns
 */
export const SessionProvider = ({ session, children }) => {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
};
