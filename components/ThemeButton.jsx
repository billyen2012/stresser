"use client";
import { IconButton, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";

export default function ThemeButton() {
  const { colorMode, toggleColorMode } = useColorMode();
  const color = useColorModeValue("white", "purple.200");
  const bg = useColorModeValue("transparent", "transparent");
  const hoverBg = useColorModeValue("purple.400", "purple.800");
  return (
    <IconButton
      size="sm"
      backgroundColor={bg}
      color={color}
      onClick={toggleColorMode}
      variant="outline"
      _hover={{
        backgroundColor: hoverBg,
      }}
    >
      {colorMode === "dark" ? <MoonIcon /> : <SunIcon />}
    </IconButton>
  );
}
