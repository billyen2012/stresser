"use client";
import { Button } from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
/**
 *
 * @param {import("@chakra-ui/react").ButtonProps & {
 *  isActive:boolean;
 *  autoDetectActive:boolean;
 *  href:string;
 * }} param0
 * @returns
 */
export default function NavLinkButton({
  isActive = false,
  autoDetectActive = false,
  href = "",
  children,
  ...restProps
}) {
  const pathname = usePathname();

  return (
    <Button
      as={NextLink}
      href={href}
      variant={
        autoDetectActive && pathname.startsWith(href)
          ? "solid"
          : isActive
          ? "solid"
          : "ghost"
      }
      {...restProps}
    >
      {children}
    </Button>
  );
}
