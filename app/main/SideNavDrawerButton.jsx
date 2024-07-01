import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useRef } from "react";
import SideNavItems from "./SideNavItems";
import { SIDE_NAV_WIDTH } from "./SIdeNav";

import { Menu as MenuIcon } from "react-feather";

export default function SideNavDrawerButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef(null);

  return (
    <Box
      display={{
        base: "",
        md: "none",
      }}
    >
      <Button
        ref={btnRef}
        colorScheme="white"
        onClick={onOpen}
        variant={"ghost"}
      >
        <MenuIcon />
      </Button>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent maxW={SIDE_NAV_WIDTH}>
          <DrawerCloseButton />
          <DrawerHeader mb="1rem"></DrawerHeader>
          <DrawerBody as="nav">
            <SideNavItems onItemClick={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
