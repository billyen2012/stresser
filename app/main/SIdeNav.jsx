"use client";
import { Box, useColorModeValue } from "@chakra-ui/react";
import SideNavItems from "./SideNavItems";

export const SIDE_NAV_WIDTH = "240px";

export default function SideNav() {
  const bgColor = useColorModeValue("gray.300", "gray.800");

  return (
    <Box
      as={"nav"}
      w={SIDE_NAV_WIDTH}
      overflow={"auto"}
      bg={bgColor}
      display={{
        base: "none",
        md: "block",
      }}
    >
      <Box padding={"8px 12px"}>
        <SideNavItems />
      </Box>
    </Box>
  );
}
