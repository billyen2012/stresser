"use client";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Center,
  Divider,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import bgSrc from "@/public/sign-in-page-bg.jpg";
import GoogleLogo from "@/components/icons/GoogleLogo";
import RegisterAccountForm from "./RegisterAccountForm";
import CredentialSignInForm from "./CredentialSignInForm";
import { ERROR_CODES } from "@/constant/error-code";
import { ArrowLeft } from "react-feather";
import Link from "next/link";

const PROVIDER_ID_TO_COMPONENT_MAP = {
  google: (provider) => {
    return (
      <Button
        onClick={async () => {
          signIn(provider.id, { redirect: true });
        }}
        display={"flex"}
        alignItems={"center"}
        gap={"8px"}
        w={"100%"}
      >
        <GoogleLogo />
        Sign In with Google
      </Button>
    );
  },
};

/**
 * @type {{
 *  [key:string]:{
 *    title:string;
 *    message:string;
 *  }
 * }}
 */
const ERROR_TYPE_TO_MESSAGE_MAP = {
  [ERROR_CODES.EMAIL_NOT_AUTHORIZED]: {
    title: "Email not authorized",
    message: "Your email is not authorized.",
  },
  [ERROR_CODES.ACCOUNT_SUSPENDED]: {
    title: "Account suspended",
    message: "Your account has been suspended.",
  },
  [ERROR_CODES.IS_LINKED_TO_OAUTH_ACCOUNT]: {
    title: "OAuth Account Linked",
    message:
      "Your account is linked to an OAuth Account, please use your OAuth account to sign-in.",
  },
  [ERROR_CODES.INVALID_SIGN_IN]: {
    title: "Invalid Sign-in",
    message: "Invalid combination of username / password.",
  },
};

export default function SingIn({
  providers = [],
  error = "",
  isRegisterAccount = false,
  appVersion = "",
}) {
  const bgColor = useColorModeValue(
    "rgba(255, 255, 255, 0.3)",
    "rgba(0, 0, 0, 0.4)"
  );
  const dividerColor = useColorModeValue(
    "rgba(255, 255, 255, 0.6)",
    "rgba(255, 255, 255, 0.2)"
  );
  const gradientBg = useColorModeValue(
    "linear-gradient(to right top, #051937, #002768, #273199, #5f30c6, #9f12eb)",
    "linear-gradient(to right top, #051937, #002768, #273199, #5f30c6, #9f12eb)"
  );
  const fontColor = useColorModeValue("gray.100", "gray.100");

  return (
    <>
      <Image fill src={bgSrc.src} alt="background image" />
      <Center p="8px">
        <Box
          w="100%"
          maxW={"460px"}
          p={"12px 24px"}
          top={"2rem"}
          position={"relative"}
          boxShadow={"0 4px 30px rgba(0, 0, 0, 0.1)"}
          borderRadius={"16px"}
          bg={gradientBg}
          color={fontColor}
        >
          <Text
            as="h3"
            fontSize={"42px"}
            lineHeight={"42px"}
            mb="8px"
            textAlign={"center"}
          >
            STRESS IT
          </Text>
          <Text
            as="p"
            fontSize={"24px"}
            lineHeight={"24px"}
            mb="8px"
            textAlign={"center"}
          >
            One step away from confidence
          </Text>
          <Text as="p" textAlign={"right"}>
            v{appVersion}
          </Text>
          {ERROR_TYPE_TO_MESSAGE_MAP[error] && isRegisterAccount == false && (
            <Alert status="error" mb="1rem">
              <AlertIcon />
              <Box>
                <AlertTitle>
                  {ERROR_TYPE_TO_MESSAGE_MAP[error].title}
                </AlertTitle>
                <AlertDescription>
                  {ERROR_TYPE_TO_MESSAGE_MAP[error].message}
                </AlertDescription>
              </Box>
            </Alert>
          )}
          <Box
            borderRadius={"8px"}
            background={bgColor}
            backdropFilter={"blur(5px)"}
          >
            {isRegisterAccount == false ? (
              <>
                <Text
                  as="h4"
                  fontSize={"24px"}
                  display={"flex"}
                  align={"center"}
                  justifyContent={"center"}
                  p="12px"
                >
                  Sign In
                </Text>
                <Divider borderColor={dividerColor} />
                <Box p="12px">
                  {Object.values(providers).map(
                    (provider) =>
                      PROVIDER_ID_TO_COMPONENT_MAP[provider.id] && (
                        <div key={provider.name}>
                          {PROVIDER_ID_TO_COMPONENT_MAP[provider.id](provider)}
                        </div>
                      )
                  )}
                </Box>
                <Divider borderColor={dividerColor} />
                <Box p="12px">
                  <CredentialSignInForm
                    isInvalidSignIn={error === "InvalidSignIn"}
                  />
                  <Box
                    mt="1rem"
                    mb="1rem"
                    display={"flex"}
                    justifyContent={"center"}
                  >
                    <Button
                      variant={"link"}
                      color={"#78d6e3"}
                      as={Link}
                      href="/auth/sign-in?registerAccount=1"
                    >
                      Register new account
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
              <>
                <Divider borderColor={dividerColor} />
                <Text
                  as="h4"
                  fontSize={"24px"}
                  display={"flex"}
                  align={"center"}
                  justifyContent={"center"}
                  p="8px"
                >
                  Register
                </Text>
                <Divider borderColor={dividerColor} mt={"4px"} />
                <Box p="12px">
                  <RegisterAccountForm />
                  <Box
                    mt="1rem"
                    mb="1rem"
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                  >
                    <Button
                      variant={"ghost"}
                      color={"#78d6e3"}
                      href={"/auth/sign-in?registerAccount=0"}
                      as={Link}
                      display={"flex"}
                      alignItems={"center"}
                      gap={"0.5rem"}
                      css={{
                        "&:hover": {
                          backgroundColor: "transparent",
                          opacity: "0.7",
                        },
                      }}
                    >
                      <ArrowLeft size={18} />
                      Back to sign-in
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Center>
    </>
  );
}
