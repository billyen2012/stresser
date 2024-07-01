"use client";
import { Box, Center, Text } from "@chakra-ui/react";

export default function Error({
  title = "Server Error (500)",
  subtitle = "An unknown error has occured, please try again later",
}) {
  return (
    <Center>
      <Box display={"flex"} flexDir={"column"} position={"relative"} top="1rem">
        <Text as="h3" textAlign={"center"} fontSize={"42px"}>
          {title}
        </Text>
        <Text as="p" textAlign={"center"} fontSize={"24px"}>
          {subtitle}
        </Text>
      </Box>
    </Center>
  );
}
