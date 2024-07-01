"use client";
import Spacer from "@/components/Spacer";
import ThemeButton from "@/components/ThemeButton";
import useSession from "@/hooks/useSession";
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorModeValue,
  Text,
} from "@chakra-ui/react";
import { signOut } from "next-auth/react";
import { SIGN_IN_PAGE_URL } from "../../constant/sign-in-page-url";
import SideNavDrawerButton from "./SideNavDrawerButton";
import { useState } from "react";
import LoadingOverlay from "@/components/LoadingOverlay";

export const TOP_NAV_HEIGHT = "72px";

export default function TopNav() {
  const bg = useColorModeValue("purple.700", "gray.900");
  const color = useColorModeValue("white", "gray.300");
  const menuItemColor = useColorModeValue("gray.600", "gray.300");
  const session = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  return (
    <Box
      as={"header"}
      p="24px"
      w={"100%"}
      color={color}
      bg={bg}
      display={"flex"}
      alignItems={"center"}
      h={TOP_NAV_HEIGHT}
    >
      <Box>
        <SideNavDrawerButton />
      </Box>
      <Spacer />
      <Box display={"flex"} alignItems={"center"} gap="12px">
        <ThemeButton />
        <Menu>
          <MenuButton as={IconButton} width="48px" height={"48px"} isRound>
            <Avatar
              size="md"
              name={session.user.name}
              src={
                "https://2.gravatar.com/avatar/" +
                session.user.emailHash +
                "?d=identicon"
              }
            />
          </MenuButton>

          <MenuList color={menuItemColor}>
            <MenuItem
              onClick={async () => {
                setIsSigningOut(true);
                await signOut({
                  redirect: SIGN_IN_PAGE_URL,
                }).catch((err) => {
                  setIsSigningOut(false);
                });
              }}
            >
              <Text> Sign Out</Text>
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
      {isSigningOut && <LoadingOverlay />}
    </Box>
  );
}
