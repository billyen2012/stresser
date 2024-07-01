"use client";
import { Box } from "@chakra-ui/react";
import { ChakraProvider, cookieStorageManagerSSR } from "@chakra-ui/react";
import theme from "../app/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function AppContainer({ children, cookies }) {
  return (
    <ChakraProvider
      theme={theme}
      colorModeManager={cookieStorageManagerSSR(cookies)}
    >
      <QueryClientProvider client={queryClient}>
        <Box w={"100%"} height={"100vh"}>
          {children}
        </Box>
      </QueryClientProvider>
    </ChakraProvider>
  );
}
