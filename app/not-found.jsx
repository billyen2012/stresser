"use client";
import { Box, Center, Text } from "@chakra-ui/react";

export default function NotFound({
  title = "Page Not Found 404",
  subtitle = "The page you are looking for does not exist",
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
