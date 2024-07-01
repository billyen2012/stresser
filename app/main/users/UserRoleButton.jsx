"use client";
import { InfoIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverTrigger,
  Portal,
  Text,
} from "@chakra-ui/react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * @param {{
 *  user:  import("@prisma/client/runtime/library").Optional<import("@prisma/client").User>;
 * }} param0
 */
export default function UserRoleButton({ user }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async ({ onClose = () => {} }) => {
    onClose();
    setIsSubmitting(true);
    const res = await axios
      .put("/api/users/" + user.id + "/role", {
        isAdmin: true,
      })
      .catch((err) => err);
    setIsSubmitting(false);
    if (res instanceof AxiosError) {
      return alert(res.message);
    }
    router.refresh();
  };

  return (
    <>
      {user.isAdmin ? (
        <Button p="1rem" isDisabled colorScheme={"green"} variant={"outline"}>
          ADMIN
        </Button>
      ) : (
        <Popover>
          {({ onClose, isOpen }) => (
            <>
              <PopoverTrigger placement="right">
                <Button
                  p="1rem"
                  colorScheme={"purple"}
                  variant={"outline"}
                  isLoading={isSubmitting}
                >
                  REGULAR
                </Button>
              </PopoverTrigger>
              <Portal>
                <PopoverContent w={"fit-content"}>
                  <PopoverCloseButton />
                  <PopoverBody display={"flex"}>
                    <Box
                      display={"flex"}
                      gap={"0.5rem"}
                      maxW={"360px"}
                      mt="1rem"
                    >
                      <Box alignItems={"flex-start"}>
                        <InfoIcon />
                      </Box>
                      <Text>
                        Once user is promoted to admin, it can not be demoted
                        back to regular user.
                      </Text>
                    </Box>
                  </PopoverBody>
                  <PopoverFooter display={"flex"} justifyContent={"flex-end"}>
                    <Button variant={"ghost"} onClick={onClose}>
                      CANCEL
                    </Button>
                    <Button
                      variant={"ghost"}
                      onClick={() => {
                        handleSubmit({ onClose });
                      }}
                      colorScheme={"green"}
                    >
                      PROMOTE
                    </Button>
                  </PopoverFooter>
                </PopoverContent>
              </Portal>
            </>
          )}
        </Popover>
      )}
    </>
  );
}
