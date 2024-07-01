"use client";
import TestResultTag from "@/components/TestResultTag";
import {
  Box,
  Button,
  List,
  ListItem,
  useColorModeValue,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeftCircle, ArrowRightCircle } from "react-feather";
dayjs.extend(relativeTime);

/**
 *
 * @param {import("@chakra-ui/react").ButtonProps & {isCollapsed?:boolean}} props
 * @returns
 */
const CollapseButton = (props) => (
  <Button
    borderRadius={"50%"}
    w="2rem"
    h="2rem"
    minW={"0px"}
    p="0px"
    {...props}
  >
    {props.isCollapsed ? <ArrowRightCircle /> : <ArrowLeftCircle />}
  </Button>
);

/**
 *
 * @param {{
 *  scriptId:string;
 *  testResults: Omit<import("@/types").TestResult[], "errorMessage">;
 *  selectedTestResultId:string;
 * }} param0
 * @returns
 */
export default function ScriptResultsSidebar({
  scriptId = "",
  testResults = [],
  selectedTestResultId = "",
}) {
  const router = useRouter();
  const handleClick = (resultId) => {
    router.push(`/main/run-test/${scriptId}/test-results/${resultId}`);
  };

  const [sideBarCollapse, setSideBarCollapse] = useState(false);
  const containerRef = useRef(null);

  const hoverColor = useColorModeValue("#fff", "gray.700");
  useEffect(() => {
    containerRef.current.scrollTop = sessionStorage.getItem(
      "script-result-scroll-pos"
    );
  }, [containerRef.current]);

  return (
    <Box
      pos={"relative"}
      minHeight={{
        base: "200px",
        lg: "none",
      }}
      maxHeight={{
        base: "200px",
        lg: "none",
      }}
      flexBasis={0}
      minW={"fit-content"}
      overflowY={{
        base: "auto",
        lg: sideBarCollapse ? "hidden" : undefined,
      }}
      overflowX={"hidden"}
      ref={containerRef}
      onScroll={(e) => {
        sessionStorage.setItem("script-result-scroll-pos", e.target.scrollTop);
      }}
      pr={{
        base: "0",
        lg: "2rem",
      }}
    >
      <Box pos={"sticky"} top={"50%"} right={"0"}>
        <Box pos={"relative"}>
          <CollapseButton
            pos={"absolute"}
            right={"-2.0rem"}
            onClick={() => {
              setSideBarCollapse((current) => !current);
            }}
            isCollapsed={sideBarCollapse}
          />
        </Box>
      </Box>
      <List
        p={"4px 0"}
        display={"flex"}
        alignItems={"flex-start"}
        flexDir={"column"}
        gap={"2px"}
        {...(sideBarCollapse
          ? {
              w: {
                lg: "0px",
              },
              overflow: {
                lg: "hidden",
              },
            }
          : undefined)}
      >
        {testResults
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((testResult) => {
            return (
              <Button
                as={ListItem}
                variant={"ghost"}
                display={"flex"}
                alignItems={"center"}
                gap={"0.5rem"}
                key={testResult.id}
                w={"100%"}
                isDisabled={testResult.isFinished == false}
                _hover={{
                  cursor: "pointer",
                  bg: hoverColor,
                }}
                _disabled={{
                  pointerEvents: "none",
                  opacity: "0.5",
                }}
                onClick={() => {
                  if (testResult.isFinished == false) {
                    return;
                  }
                  handleClick(testResult.id);
                }}
                bg={selectedTestResultId === testResult.id ? hoverColor : ""}
                justifyContent={"flex-start"}
              >
                <TestResultTag testResult={testResult} />
                {dayjs().from(dayjs(testResult.createdAt))}
              </Button>
            );
          })}
      </List>
    </Box>
  );
}
