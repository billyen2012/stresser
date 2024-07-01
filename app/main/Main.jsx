"use client";
import { Box } from "@chakra-ui/react";

export default function Main({ children }) {
  return (
    <Box as={"main"} w={"100%"} overflow={"auto"} flex={"1"} pos={"relative"}>
      {children}
    </Box>
  );
}
