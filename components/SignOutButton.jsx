import { IconButton, Link } from "@chakra-ui/react";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <Link
      onClick={() => {
        signOut({
          redirect: "/auth/sign-in",
        });
      }}
    >
      Sign Out
    </Link>
  );
}
