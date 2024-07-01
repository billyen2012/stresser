import { Box } from "@chakra-ui/react";

export default function LiveResult({
  data = {
    logo: "",
    progresses: [],
    console: [],
    scenario: "",
    summary: "",
    error: "",
  },
}) {
  return (
    <Box
      css={{
        pre: {
          textWrap: "wrap",
        },
      }}
    >
      <pre>{data.logo}</pre>
      <pre>{data.scenario}</pre>
      {data.summary && <pre>{data.summary}</pre>}
      <pre>{data.progresses[data.progresses.length - 1] ?? ""}</pre>
      <pre>{data.error ? `Error: ` + data.error : ""}</pre>
      <div>
        {data.console.map((txt, i) => {
          return <pre key={"run-test-console-log-" + i}>{txt}</pre>;
        })}
      </div>
    </Box>
  );
}
