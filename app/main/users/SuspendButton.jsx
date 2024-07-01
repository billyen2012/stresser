"use client";
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
} from "@chakra-ui/react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * @param {{
 *  user:  import("@prisma/client/runtime/library").Optional<import("@prisma/client").User>;
 * }} param0
 */
export default function SuspendButton({ user }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async ({ onClose = () => {} }) => {
    onClose();
    setIsSubmitting(true);
    const res = await axios
      .put("/api/users/" + user.id + "/suspend", {
        isSuspended: !user.isSuspended,
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
      <Popover>
        {({ onClose, isOpen }) => (
          <>
            <PopoverTrigger placement="right">
              <Button
                p="1rem"
                isDisabled={user.isAdmin}
                colorScheme={user.isSuspended ? "orange" : "green"}
                variant={"outline"}
                isLoading={isSubmitting}
              >
                {user.isSuspended ? "SUSPENDED" : "ACTIVE"}
              </Button>
            </PopoverTrigger>
            <Portal>
              <PopoverContent w={"fit-content"}>
                <PopoverCloseButton />
                <PopoverBody>
                  <Box height={"1rem"}></Box>
                </PopoverBody>
                <PopoverFooter>
                  <Button variant={"ghost"} onClick={onClose}>
                    CANCEL
                  </Button>
                  <Button
                    variant={"ghost"}
                    onClick={() => {
                      handleSubmit({ onClose });
                    }}
                    colorScheme={user.isSuspended ? "green" : "orange"}
                  >
                    {user.isSuspended ? "ACTIVATE" : "SUSPEND"}
                  </Button>
                </PopoverFooter>
              </PopoverContent>
            </Portal>
          </>
        )}
      </Popover>
    </>
  );
}
