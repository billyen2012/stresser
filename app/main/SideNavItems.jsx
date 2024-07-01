"use client";
import NavLinkButton from "@/components/NavLinkButton";
import { Stack, useColorModeValue, Box } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlask } from "@fortawesome/free-solid-svg-icons";
import GridIcon from "react-feather/dist/icons/grid";
import SettingIcon from "react-feather/dist/icons/settings";
import { Users as UsersIcon } from "react-feather";
import useSession from "@/hooks/useSession";

const LIST_ITEMS = [
  // {
  //   href: "/main/dashboard",
  //   icon: <GridIcon />,
  //   text: "Dashboard",
  // },
  {
    href: "/main/run-test",
    icon: <FontAwesomeIcon icon={faFlask} size="lg" />,
    text: "Run Test",
    admin: false,
  },
  {
    href: "/main/users",
    icon: <UsersIcon />,
    text: "Users",
    admin: true,
  },
  {
    href: "/main/settings",
    icon: <SettingIcon />,
    text: "Settings",
    admin: false,
  },
];

export default function SideNavItems({ onItemClick = () => {} }) {
  // const bgColor = useColorModeValue("gray.300", "gray.800");
  const session = useSession();
  return (
    <>
      <Stack>
        {LIST_ITEMS.filter(({ admin }) => {
          if (!session.user.isAdmin && admin) {
            return false;
          }
          return true;
        }).map(({ href, icon, text, admin }) => {
          return (
            <NavLinkButton
              key={"side-nav-link-" + href}
              href={href}
              w={"100%"}
              height={"2.5rem"}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"flex-start"}
              leftIcon={
                <Box
                  w="24px"
                  height="24px"
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  {icon}
                </Box>
              }
              autoDetectActive
              onClick={onItemClick}
            >
              {text.toUpperCase()}
            </NavLinkButton>
          );
        })}
      </Stack>
    </>
  );
}
