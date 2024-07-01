"use client";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Stack,
  useColorMode,
  Text,
  Button,
  Box,
  Divider,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Spinner,
  Tag,
  TagLabel,
  Switch,
} from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import { useFormik } from "formik";
import { handleEditorMount } from "./handleEditorMount";
import PlayIcon from "react-feather/dist/icons/play";
import axios from "axios";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ScriptSearch from "./ScriptSearch";
import { getDirtyValues } from "@/util/getDirtyValues";
import { sleep } from "@/util/sleep";
import Link from "next/link";
import LiveResult from "./LiveResult";
import { Resizable } from "re-resizable";
import LiveChart from "./LiveChart";
import { DEFAULT_SCRIPT } from "@/constant/default-script";
import DeleteScriptButton from "./DeleteScriptButton";
import LoadingOverlay from "@/components/LoadingOverlay";
import {
  getTestResultsByScriptId,
  getTestResultsByScriptIdQueryKey,
} from "@/hooks/getTestResultsByScriptId";
import { useQueryClient } from "@tanstack/react-query";
import ScriptResultsSidebar from "./ScriptResultsSideBar";
import useSession from "@/hooks/useSession";
import ForkIcon from "@/components/icons/Fork";
import { TYPE_DEFINITION_VERSION } from "@/constant/type-definition-version";
import { useMediaQuery } from "@chakra-ui/react";
import useTitle from "@/hooks/useTitle";
const DEFAULT = {
  id: "",
  name: "",
  script: DEFAULT_SCRIPT,
  isPublic: false,
};

const DEFAULT_TEST_RUNNING_RESULT = {
  logo: null,
  progresses: [],
  console: [],
  scenario: null,
  summary: null,
};

/**
 * @param {DEFAULT} values
 */
const validate = (values) => {
  const error = {};

  if (!values.name) {
    error.name = "name is required";
  }

  return error;
};

export default function RunTestPage({
  defaultValues = DEFAULT,
  scriptOwner = { id: "", emailHash: "", name: "" },
  isNew = false,
}) {
  const { setTitle } = useTitle(
    isNew ? "Create new test" : "Run Test | " + defaultValues.name
  );
  const session = useSession();
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();
  const [_defaultValues, setDefaultValues] = useState(defaultValues);
  const [isRunningTest, setIsRunningTest] = useState(false);
  // const { isMobileBreakPoint } = useMobileBreakPoint();
  const [metricsDataCollection, setMetricsDataCollection] = useState([]);
  const { data: scriptTestResults = [] } = getTestResultsByScriptId(
    defaultValues.id,
    { enabled: _defaultValues.id ? true : false }
  );
  const [isMobileBreakPoint] = useMediaQuery(`(max-width: 992px)`);
  const urlParams = useParams();

  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [isErroneous, setIsErroneous] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [runningResult, setRunningResult] = useState(
    DEFAULT_TEST_RUNNING_RESULT
  );
  const [width, setWidth] = useState("60%");

  const router = useRouter();
  const form = useFormik({
    initialValues: _defaultValues,
    validate,
    onSubmit: async (values) => {
      // create if is new or user fork the script
      if (isNew || isEditDisabled) {
        const res = await axios.post("/api/scripts", values);
        router.push("/main/run-test/" + res.data.id);
        // prevent submitting state being resolved before route change
        await sleep(1e4);
      }

      if (!form.dirty) {
        return;
      }

      // else update data
      await axios.put(
        `/api/scripts/${values.id}`,
        getDirtyValues(form.values, _defaultValues)
      );
      setDefaultValues({ ...form.values });
      setTitle("Run Test | " + form.values.name);
    },
    enableReinitialize: true,
  });

  const handleScriptSearchChange = async ({ value: scriptId }) => {
    if (scriptId === defaultValues.id) {
      return;
    }
    router.push("/main/run-test/" + scriptId + "?t=" + new Date().valueOf());
    setIsLoadingScript(true);
  };

  const handleRunClick = async () => {
    await form.submitForm();
    setIsErroneous(false);
    setIsRunningTest(true);
    setIsCompleted(false);
    setRunningResult(DEFAULT_TEST_RUNNING_RESULT);
    setMetricsDataCollection([]);
    const res = await fetch("/api/scripts/exec/" + form.values.id);
    queryClient.invalidateQueries({
      queryKey: getTestResultsByScriptIdQueryKey,
    });
    if (!res.ok) {
      return alert(await res.text());
    }
    const reader = res.body.getReader();

    let hasError = false;
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const data = new TextDecoder().decode(value);

      try {
        const json = JSON.parse(data);

        if (json.api === "/v1/metrics") {
          setMetricsDataCollection((current) => [...current, json]);
          continue;
        }

        if (json.error) {
          hasError = true;
          setIsErroneous(true);
        }

        setRunningResult((current) => {
          if (json.progress) {
            return {
              ...current,
              progresses: [...current.progresses, json.progress],
              summary: json.summary ?? current.summary,
            };
          }

          if (json.console) {
            return {
              ...current,
              console: [...current.console, json.console],
            };
          }

          return {
            ...current,
            ...json,
          };
        });
      } catch (err) {
        console.log(err);
      }
    }

    setIsRunningTest(false);
    if (!hasError) {
      setIsCompleted(true);
    }

    queryClient.invalidateQueries({
      queryKey: getTestResultsByScriptIdQueryKey,
    });
  };

  const handleDeleteSuccess = () => {
    router.push("/main/run-test");
  };

  useEffect(() => {
    if (isNew) {
      return;
    }
    document.title = "Run Test | " + form.values.name;
  }, []);

  useEffect(() => {
    if (isMobileBreakPoint) {
      setWidth("100%");
    } else {
      setWidth("40%");
    }
  }, [isMobileBreakPoint]);

  const { isOwner, isEditDisabled } = useMemo(() => {
    return {
      isOwner: session.user.id === scriptOwner.id,
      isEditDisabled: !isNew && session.user.id !== scriptOwner.id,
    };
  }, [isNew, session]);

  return (
    <>
      {<LoadingOverlay show={isLoadingScript} />}

      <Box p="1rem">
        <Box display={"flex"} flexDir={"column"}>
          {!isNew && (
            <Breadcrumb separator="/" mb="1rem">
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} href="/main/run-test">
                  tests
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink href={"/main/run-test/" + defaultValues.id}>
                  {form.values.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          )}

          <FormControl>
            <FormLabel display={"flex"} alignItems={"center"} gap={"8px"}>
              Search script:
            </FormLabel>
            <ScriptSearch
              onChange={handleScriptSearchChange}
              currentScriptId={urlParams.scriptId}
            />
          </FormControl>
        </Box>
        <Divider mt="1.5rem" mb="1.5rem" />
        <Box
          display={"flex"}
          mb="1rem"
          maxH={"760px"}
          flexDirection={{ base: "column", lg: "row" }}
          rowGap={{ base: "1rem", lg: "0" }}
        >
          {scriptTestResults.length > 0 && _defaultValues.id && (
            <ScriptResultsSidebar
              scriptId={urlParams.scriptId}
              testResults={scriptTestResults}
            />
          )}

          <Box
            overflow={{ base: "auto", lg: "hidden" }}
            pr="1rem"
            flex={1}
            pl="0.5rem"
          >
            <form onSubmit={form.handleSubmit}>
              <Stack>
                <Box
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"flex-end"}
                  gap={"1rem"}
                >
                  {!isNew && isOwner && (
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor={"public-switch"} mb={0}>
                        Public:
                      </FormLabel>
                      <Switch
                        id={"public-switch"}
                        value={form.values.isPublic}
                        isChecked={form.values.isPublic}
                        name="isPublic"
                        onChange={form.handleChange}
                        isDisabled={isEditDisabled}
                      />
                    </FormControl>
                  )}
                  {!isNew && isOwner && (
                    <Button
                      type="button"
                      colorScheme={"purple"}
                      maxWidth={"120px"}
                      variant={"outline"}
                      display={"flex"}
                      alignItems={"center"}
                      gap={"8px"}
                      onClick={handleRunClick}
                      isDisabled={
                        isRunningTest || form.isSubmitting || isEditDisabled
                      }
                      minW={"fit-content"}
                    >
                      Run
                      {isRunningTest ? <Spinner /> : <PlayIcon size="20px" />}
                    </Button>
                  )}

                  <Button
                    type="submit"
                    colorScheme={"green"}
                    maxWidth={"120px"}
                    variant={"outline"}
                    isLoading={form.isSubmitting}
                    isDisabled={isEditDisabled ? false : !form.dirty}
                    minW={"fit-content"}
                  >
                    {isNew ? "Create" : isOwner ? "Save" : "Fork"}
                    {isEditDisabled && <ForkIcon />}
                  </Button>
                  {!isNew && isOwner && (
                    <DeleteScriptButton
                      scriptId={form.values.id}
                      onSuccess={handleDeleteSuccess}
                      isDisabled={isEditDisabled}
                    />
                  )}
                </Box>
                <FormControl isInvalid={form.errors.name && form.touched.name}>
                  <FormLabel display={"flex"} alignItems={"center"} gap={"8px"}>
                    Test Name
                  </FormLabel>
                  <Input
                    defaultValue={form.values.name}
                    name="name"
                    onChange={form.handleChange}
                    isDisabled={isEditDisabled}
                  />
                  <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                </FormControl>
                <Text as="label" fontWeight={"600"} htmlFor="code-editor">
                  Script{" "}
                  {isEditDisabled && <Tag colorScheme={"green"}>Readonly</Tag>}
                </Text>
                <Editor
                  id="code-editor"
                  name="script"
                  onChange={(value, event) => {
                    form.setFieldValue("script", value);
                  }}
                  defaultValue={form.values.script}
                  language="typescript"
                  theme={colorMode === "dark" ? "vs-dark" : "vs-light"}
                  height={"600px"}
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
                    if (!isNew && !isOwner) {
                      editor.updateOptions({ readOnly: true });
                    }

                    const res = await fetch(
                      "/api/typedef/types/" + TYPE_DEFINITION_VERSION
                    );

                    if (!res.ok) {
                      return alert(
                        "Web IDE initialization failed, " + (await res.text())
                      );
                    }

                    const typeDefinitions = await res.json();

                    return handleEditorMount(
                      editor,
                      monaco,
                      typeDefinitions,
                      form.submitForm
                    );
                  }}
                />
              </Stack>
            </form>
          </Box>

          <Box
            pl={{ base: "0.5rem", lg: "0" }}
            maxH={{ base: "360px", lg: "none" }}
            overflowY={{ base: "auto", lg: "hidden" }}
            flex={1.2}
          >
            <Box
              p={"0.5rem"}
              h={"100% !important"}
              overflowY={"auto"}
              overflowX={"hidden"}
              css={{
                pre: {
                  whiteSpace: "pre-wrap",
                },
              }}
              bg={"gray.800"}
              // as={Resizable}
              enable={{
                left: isMobileBreakPoint ? false : true,
              }}
              size={{
                width: width,
              }}
              onResizeStop={(e, direction, ref, d) => {
                setWidth((current) => {
                  return current + d.width;
                });
              }}
              minW={"200px"}
            >
              <Box flex={0.3} height={"240px"}>
                <Text fontWeight={"600"} color="gray.100">
                  LIVE CHART:
                </Text>
                <LiveChart data={metricsDataCollection} />
              </Box>
              <Box flex={0.7} overflow={"auto"} color="gray.100">
                <Text
                  fontWeight={"600"}
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"flex-start"}
                  gap={"0.5rem"}
                  color="gray.100"
                >
                  LIVE RESULT:
                  {isErroneous && (
                    <Tag size={"lg"} variant="outline" colorScheme="red">
                      <TagLabel>ERROR</TagLabel>
                    </Tag>
                  )}
                  {isCompleted && !isErroneous && (
                    <Tag size={"lg"} variant="outline" colorScheme="purple">
                      <TagLabel>FINISHED</TagLabel>
                    </Tag>
                  )}
                </Text>
                <LiveResult data={runningResult} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
