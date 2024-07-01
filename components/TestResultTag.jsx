"use client";
import { Tag } from "@chakra-ui/react";

const css = {
  display: "flex",
  alignItem: "center",
  justifyContent: "center",
  width: "68px",
};

/**
 * @param {{
 * testResult:import("@/types").TestResult
 * }} param0
 * @returns
 */
export default function TestResultTag({ testResult = {} }) {
  if (testResult.isErroneous) {
    return (
      <Tag variant="outline" colorScheme={"red"} css={css}>
        Error
      </Tag>
    );
  }

  if (testResult.isManuallyStop) {
    return (
      <Tag variant="outline" colorScheme={"orange"} css={css}>
        Stopped
      </Tag>
    );
  }

  if (testResult.isFinished) {
    return (
      <Tag variant="outline" colorScheme={"purple"} css={css}>
        Finished
      </Tag>
    );
  }

  return (
    <Tag variant="outline" colorScheme={"green"} css={css}>
      Running
    </Tag>
  );
}
