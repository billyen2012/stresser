"use client";
import {
  FormControl,
  FormLabel,
  Input,
  Stack,
  useColorMode,
  Text,
  Box,
  Divider,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Tag,
  TagLabel,
  useMediaQuery,
} from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Resizable } from "re-resizable";
import LoadingOverlay from "@/components/LoadingOverlay";
import { getTestResultsByScriptId } from "@/hooks/getTestResultsByScriptId";
import { getTestResultById } from "@/hooks/getTestResultById";
import { handleEditorMount } from "../../../handleEditorMount";
import LiveResult from "../../../LiveResult";
import LiveChart from "../../../LiveChart";
import ScriptResultsSidebar from "../../../ScriptResultsSideBar";
import DeleteTestResultButton from "./DeleteTestResultButton";
import useSession from "@/hooks/useSession";
import { TYPE_DEFINITION_VERSION } from "@/constant/type-definition-version";
import PreviousPageLinK from "@/components/PreviousPageLink";
import useTitle from "@/hooks/useTitle";
/**
 *
 * @param {{
 *  scriptData:import("@prisma/client/runtime/library").Optional<import("@prisma/client").Script>
 * }} param0
 * @returns
 */
export default function TestResultPage({ scriptData }) {
  useTitle("Test Result | " + scriptData.name);
  const router = useRouter();
  const urlParams = useParams();
  const { colorMode } = useColorMode();
  const [isMobileBreakPoint] = useMediaQuery(`(max-width: 992px)`);
  const { data: scriptTestResults = [] } = getTestResultsByScriptId(
    urlParams.scriptId
  );
  const session = useSession();
  const { isLoading: isLoadingTestResult, data: testResult = null } =
    getTestResultById({
      scriptId: urlParams.scriptId,
      testResultId: urlParams.testResultId,
      includeData: true,
    });

  const { formattedTestResult, metricsData } = useMemo(() => {
    const formattedTestResult = {
      logo: null,
      progresses: [],
      console: [],
      scenario: null,
      summary: null,
    };
    const metricsData = [];
    if (testResult) {
      testResult.data.forEach(({ data }) => {
        const {
          logo,
          progress,
          scenario,
          console,
          metrics,
          api,
          timestamp,
          summary,
        } = data;
        if (logo) {
          formattedTestResult.logo = logo;
        }
        if (progress) {
          formattedTestResult.progresses.push(progress);
        }
        if (scenario) {
          formattedTestResult.scenario = scenario;
        }
        if (console) {
          formattedTestResult.console.push(console);
        }
        if (metrics) {
          metricsData.push({ metrics, api, timestamp });
        }

        if (summary) {
          formattedTestResult.summary = summary;
        }
      });
    }
    return { formattedTestResult, metricsData };
  }, [testResult]);

  const [width, setWidth] = useState("");

  // useEffect(() => {
  //   if (isMobileBreakPoint) {
  //     setWidth("100%");
  //   } else {
  //     setWidth("40%");
  //   }
  // }, [isMobileBreakPoint]);

  useEffect(() => {
    if (width) {
      sessionStorage.setItem("initial-result-container-width", width);
    }
  }, [width]);

  useEffect(() => {
    if (sessionStorage.getItem("initial-result-container-width")) {
      setWidth(sessionStorage.getItem("initial-result-container-width"));
    } else {
      setWidth("40%");
    }
  }, []);

  const isOwner = scriptData.user?.id === session.user.id;

  return (
    <>
      {<LoadingOverlay show={isLoadingTestResult} />}

      <Box p="1rem">
        <Box>
          <Breadcrumb separator="/" mb="1rem">
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} href="/main/run-test">
                tests
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink
                as={Link}
                href={"/main/run-test/" + urlParams.scriptId}
              >
                {scriptData.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>result ({urlParams.testResultId})</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <PreviousPageLinK href={"/main/run-test/" + urlParams.scriptId} />
            <DeleteTestResultButton
              scriptId={urlParams.scriptId}
              testResultId={urlParams.testResultId}
              onSuccess={() => {
                if (scriptTestResults.length > 1) {
                  router.push(
                    `/main/run-test/${urlParams.scriptId}/test-results/` +
                      // go to the first non-current result
                      scriptTestResults.filter(
                        (e) => e.id !== urlParams.testResultId
                      )[0].id
                  );
                } else {
                  router.push(`/main/run-test/${urlParams.scriptId}`);
                }
              }}
              isDisabled={!isOwner}
            />
          </Box>
        </Box>
        <Divider mt="1.5rem" mb="1.5rem" />
        <Box
          display={"flex"}
          mb="1rem"
          maxH={"760px"}
          flexDir={{ base: "column", lg: "row" }}
          gap={{ base: "1rem", lg: "0" }}
        >
          {scriptTestResults.length > 0 && (
            <ScriptResultsSidebar
              scriptId={urlParams.scriptId}
              testResults={scriptTestResults}
              selectedTestResultId={urlParams.testResultId}
            />
          )}

          <Box
            overflow={"auto"}
            pr="1rem"
            flex={1}
            pl="0.5rem"
            minHeight={{ base: "600px", lg: "auto" }}
          >
            <Stack h={{ base: "600px", lg: "100%" }}>
              <FormControl>
                <FormLabel display={"flex"} alignItems={"center"} gap={"8px"}>
                  Test Name
                </FormLabel>
                <Input defaultValue={scriptData.name} isDisabled />
              </FormControl>
              <Text as="label" fontWeight={"600"} htmlFor="code-editor">
                Script <Tag colorScheme={"green"}>Readonly</Tag>
              </Text>
              <Editor
                value={testResult?.scriptClone || ""}
                language="typescript"
                theme={colorMode === "dark" ? "vs-dark" : "vs-light"}
                height={"100%"}
                options={{
                  padding: {
                    top: "10px",
                    bottom: "10px",
                    left: "12px",
                    right: "12px",
                  },

                  minimap: {
                    enabled: false,
                  },
                }}
                path="file:///"
                onMount={async (editor, monaco) => {
                  editor.updateOptions({ readOnly: true });
                  const res = await fetch(
                    "/api/typedef/types/" + TYPE_DEFINITION_VERSION
                  );

                  if (!res.ok) {
                    return alert(
                      "Web IDE initialization failed, " + (await res.text())
                    );
                  }

                  const typeDefinitions = await res.json();

                  return handleEditorMount(editor, monaco, typeDefinitions);
                }}
              />
            </Stack>
          </Box>

          <Box
            p="0.5rem"
            overflow={"auto"}
            css={{
              pre: {
                whiteSpace: "pre-wrap",
              },
            }}
            bg={"gray.800"}
            as={Resizable}
            enable={{
              left: isMobileBreakPoint ? false : true,
            }}
            size={{
              width: isMobileBreakPoint ? "100%" : width,
            }}
            onResizeStop={(e, direction, ref, d) => {
              setWidth((current) => {
                return ref.style.width;
              });
            }}
            minW={"200px"}
            color="gray.100"
          >
            <Box flex={0.3} height={"240px"}>
              <Text fontWeight={"600"}>LIVE CHART:</Text>
              <LiveChart data={metricsData} />
            </Box>
            <Box flex={0.7} overflow={"auto"}>
              <Text
                fontWeight={"600"}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"flex-start"}
                gap={"0.5rem"}
              >
                LIVE RESULT:
                {!isLoadingTestResult && testResult.isErroneous && (
                  <Tag size={"lg"} variant="outline" colorScheme="red">
                    <TagLabel>ERROR</TagLabel>
                  </Tag>
                )}
                {!isLoadingTestResult && !testResult.isErroneous && (
                  <Tag size={"lg"} variant="outline" colorScheme="purple">
                    <TagLabel>FINISHED</TagLabel>
                  </Tag>
                )}
              </Text>
              <LiveResult data={formattedTestResult} />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
