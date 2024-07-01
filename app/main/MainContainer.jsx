"use client";
import { Box } from "@chakra-ui/react";
import { TOP_NAV_HEIGHT } from "./TopNav";

export default function MainContainer({ children }) {
  return (
    <Box
      as={"div"}
      w={"100%"}
      height={`calc(100% - ${TOP_NAV_HEIGHT})`}
      maxH={`calc(100% - ${TOP_NAV_HEIGHT})`}
      overflow={"auto"}
      display={"flex"}
    >
      {children}
    </Box>
  );
}
