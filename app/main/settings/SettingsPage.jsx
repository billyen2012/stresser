"use client";
import { Box, Divider, Stack } from "@chakra-ui/react";

import WhitelistEmailsAndForm from "./WhitelistEmailsAndForm";
import WhitelistDomainsAndForm from "./WhitelistDomainsAndForm";
import useSession from "@/hooks/useSession";
import SelfInfoAndForm from "./SelfInfoAndForm";
export default function SettingsPage({}) {
  const session = useSession();

  return (
    <Box p={"1rem"}>
      <Stack spacing={"2rem"}>
        <SelfInfoAndForm />
        {session.user.isAdmin && (
          <>
            <Divider />
            <WhitelistEmailsAndForm />
            <WhitelistDomainsAndForm />
          </>
        )}
      </Stack>
    </Box>
  );
}
