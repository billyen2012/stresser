import Link from "next/link";
import { Box } from "@chakra-ui/react";
import { ArrowLeft } from "react-feather";

/**
 * @param {import("next/link").LinkProps} props
 * @returns
 */
export default function PreviousPageLinK({ children, ...restProps }) {
  return (
    <Box as={Link} {...restProps}>
      <ArrowLeft size={28} />
    </Box>
  );
}
