"user client";
import { Center, Spinner, useColorModeValue } from "@chakra-ui/react";
import { useEffect } from "react";

export default function LoadingOverlay({ show = true, loaderMessage }) {
  const bgcolor = useColorModeValue("rgba(255,255,255,0.6)", "rgba(0,0,0,0.6)");

  useEffect(() => {
    const main = document.getElementsByTagName("main")[0];
    if (show) {
      if (main) {
        main.style.overflow = "hidden";
      }
    } else {
      if (main) {
        main.style.overflow = "";
      }
    }

    return () => {
      if (main) {
        main.style.overflow = "";
      }
    };
  }, [show]);

  return show ? (
    <Center
      position={"absolute"}
      w={"100%"}
      h="100%"
      bgColor={bgcolor}
      zIndex={"2"}
      top={0}
      left={0}
    >
      {loaderMessage ?? <Spinner />}
    </Center>
  ) : (
    ""
  );
}
