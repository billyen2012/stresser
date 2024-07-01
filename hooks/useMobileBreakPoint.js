"use client";
import { useMediaQuery } from "@chakra-ui/react";

export default function useMobileBreakPoint() {
  const [isMobileBreakPoint] = useMediaQuery(`(max-width: 768px)`);
  return { isMobileBreakPoint };
}
