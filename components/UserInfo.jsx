import useSession from "@/hooks/useSession";
import {
  Avatar,
  Box,
  HStack,
  Stack,
  Tag,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

/**
 * @param {{
 *  user: import("@prisma/client/runtime/library").Optional<import("@prisma/client").User>
 * }} param0
 * @returns
 */
export default function UserInfo({ user }) {
  const emailColor = useColorModeValue("gray.700", "gray.500");
  const session = useSession();
  return (
    <Box>
      <HStack spacing={"8px"}>
        <Avatar
          size="md"
          src={
            "https://2.gravatar.com/avatar/" + user.emailHash + "?d=identicon"
          }
        />
        <Stack spacing={"8px"}>
          <HStack>
            <Text>{user.name}</Text>
            {user.isAdmin && (
              <Tag variant={"outline"} colorScheme={"green"}>
                ADMIN
              </Tag>
            )}
            {session.user.id === user.id && (
              <Tag variant={"outline"} colorScheme={"purple"}>
                SELF
              </Tag>
            )}
          </HStack>
          <Text color={emailColor}>{user.email}</Text>
        </Stack>
      </HStack>
    </Box>
  );
}
