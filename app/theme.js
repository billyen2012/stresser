import { extendTheme } from "@chakra-ui/react";

/**@type {import("@chakra-ui/react").Theme} */
const theme = {
  config: {
    initialColorMode: "dark",
    useSystemColorMode: true,
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === "dark" ? "black" : "gray.200",
      },
      _disabled: {
        cursor: "default !important",
      },
    }),
  },
  components: {
    Input: {
      variants: {
        outline: (props) => {
          return {
            field: {
              borderColor: props.colorMode === "dark" ? "gray.600" : "gray.400",
              _hover: {
                borderColor:
                  props.colorMode === "dark" ? "gray.500" : "gray.600",
              },
            },
          };
        },
      },
    },
    Divider: {
      baseStyle: (props) => {
        return {
          opacity: "0.6",
          borderColor: props.colorMode === "dark" ? "gray.600" : "gray.400",
        };
      },
    },
    NumberInput: {
      variants: {
        outline: (props) => {
          return {
            field: {
              borderColor: props.colorMode === "dark" ? "gray.600" : "gray.400",
              _hover: {
                borderColor:
                  props.colorMode === "dark" ? "gray.500" : "gray.600",
              },
            },
          };
        },
      },
    },
    Table: {
      variants: {
        simple: (props) => {
          return {
            th: {
              borderColor: props.colorMode === "dark" ? "gray.600" : "gray.500",
            },
            td: {
              borderColor: props.colorMode === "dark" ? "gray.600" : "gray.500",
            },
          };
        },
      },
    },
  },
};

export default extendTheme(theme);
