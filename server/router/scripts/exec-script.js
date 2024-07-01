import tpcPortUsed from "tcp-port-used";
import { memoryCache } from "@/server/cache";
import { prisma } from "@/server/db";
import { spawn } from "child_process";
import axios, { AxiosError } from "axios";
import { decrypt } from "@/server/auth";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { sleep } from "@/util/sleep";
import { handleAsyncError } from "@/server/errorHandler";

/**
 * @return {Promise<import('@/types/index').GetMetricsDataType>}
 */
const getMetrics = async (portNum) => {
  const map = {
    timestamp: new Date(),
    api: "/v1/metrics",
  };
  const response = await axios.get(`http://127.0.0.1:${portNum}/v1/metrics`);

  response.data.data.forEach((e) => {
    if (!map[e.type]) {
      map[e.type] = {};
    }
    map[e.type][e.id] = e.attributes;
  });

  return map;
};

const getPortNumKey = (portNum) => {
  return "port-num-in-use-" + portNum;
};

const getPortNum = async () => {
  for (let portNum = 6565; portNum < 29999; portNum++) {
    const portNumCacheKey = getPortNumKey(portNum);
    if (memoryCache.get(portNumCacheKey)) {
      continue;
    }
    if (await tpcPortUsed.check(portNum, "127.0.0.1")) {
      memoryCache.set(portNumCacheKey, true);
      continue;
    }
    return portNum;
  }
};

/**
 * @returns {Promise<{
 * portNum:number;
 * portNumCacheKey:string;
 * failed?:boolean;
 * }>}
 */
const getPortNumSafe = async () => {
  let tryCount = 0;
  let portNum = null;
  let portNumCacheKey = null;
  do {
    if (tryCount > 3) {
      return { failed: true };
    }
    tryCount += 1;
    portNum = await getPortNum();
    portNumCacheKey = getPortNumKey(portNum);
    if (memoryCache.get(portNumCacheKey)) {
      continue;
    }
    memoryCache.set(portNumCacheKey, true);
  } while (portNum == null);
  return {
    portNum,
    portNumCacheKey,
  };
};

/**
 * @type {import("@billyen2012/next-api-router").NextApiProcessCallback}
 */
export const execScript = async (req, res, next) => {
  const script = await prisma.script.findFirstOrThrow({
    where: {
      userId: req.session.user.id,
      id: String(req.params.id),
    },
    select: {
      id: true,
      name: true,
      script: true,
    },
  });

  const { portNum, portNumCacheKey, failed } = await getPortNumSafe();
  if (failed) {
    res.status(503);
    return "Server Busy";
  }

  let scriptRunningResult = await prisma.scriptRunningResult.create({
    data: {
      userId: req.session.user.id,
      scriptClone: script.script,
      scriptId: script.id,
    },
  });

  const writeDataToDb = async (data) => {
    return prisma.scriptRunningData.create({
      data: {
        scriptRunningResultId: scriptRunningResult.id,
        data,
      },
    });
  };

  delete scriptRunningResult.scriptClone;
  delete scriptRunningResult.errorMessage;

  const decryptedScript = decrypt(script.script);
  const scriptId = uuidv4();
  const scriptPath = process.cwd() + `/.next/${scriptId}.js`;
  try {
    // create script
    await fs.promises.writeFile(scriptPath, decryptedScript);

    // run script-
    const k6Process = spawn(`k6`, [
      "run",
      scriptPath,
      "--address",
      `127.0.0.1:${portNum}`,
    ]);

    let stopped = false;
    let interval = null;

    res.writeHead(200, { "content-type": "application/json" });

    k6Process.on("spawn", () => {
      interval = setInterval(async () => {
        if (stopped) {
          return;
        }
        try {
          const data = await getMetrics(portNum);
          writeDataToDb(data).catch(handleAsyncError);
          res.write(JSON.stringify(data));
        } catch (err) {
          if (err instanceof AxiosError) {
            if (err.code === "ECONNREFUSED") {
              return;
            }
          }
          handleAsyncError(err);
        }
      }, 500);
    });

    k6Process.stdout.on("data", async (buffer) => {
      /**@type {string} */
      const msg = buffer.toString("utf-8");

      const data = {
        timestamp: new Date(),
      };

      if (msg.includes("data_received")) {
        // something the last progress will comes with the  summary report
        const [summary, progress] = msg.split("running (");
        data.summary = summary;

        if (progress) {
          data.progress = `running (${progress}`
            .split("\n")
            .filter((e) => e)
            .map((e) => "  " + e)
            .join("\n");
        }

        writeDataToDb(data).catch(handleAsyncError);
        return res.write(JSON.stringify(data));
      }

      // progress info
      if (msg.includes("running (")) {
        data.progress = msg
          .split("\n")
          .filter((e) => e)
          .map((e) => "  " + e)
          .join("\n");
        writeDataToDb(data).catch(handleAsyncError);
        return res.write(JSON.stringify(data));
      }

      // scenario or execution info
      if (msg.includes("scenarios:")) {
        data.scenario = msg.replace(scriptPath, script.name);
        writeDataToDb(data).catch(handleAsyncError);
        return res.write(JSON.stringify(data));
      }
      // logo
      if (msg.includes("/ __________ \\  |__| \\__\\ \\_____/ .io")) {
        data.logo = msg;
        writeDataToDb(data).catch(handleAsyncError);
        return res.write(JSON.stringify(data));
      }

      data.message = msg;
      writeDataToDb(data).catch(handleAsyncError);
      res.write(JSON.stringify(data));
    });

    // for console.log
    k6Process.stderr.on("data", async (buffer) => {
      // the virtual user count is going to causes duplication of logs, so just take the first one.
      const msg = buffer.toString("utf-8").split("\n", 1)[0];
      const data = {
        timestamp: new Date(),
      };

      if (msg.includes("level=error")) {
        prisma.scriptRunningResult
          .update({
            where: {
              id: scriptRunningResult.id,
            },
            data: {
              isErroneous: true,
              errorMessage: msg,
            },
          })
          .catch(handleAsyncError);
        data.error = msg.replaceAll(scriptPath, script.name);

        writeDataToDb(data).catch(handleAsyncError);
        return res.write(JSON.stringify(data));
      }

      data.console = msg.replaceAll(scriptPath, script.name);

      writeDataToDb(data).catch(handleAsyncError);
      return res.write(JSON.stringify(data));
    });

    // for process error
    k6Process.on("error", async (err) => {
      const data = {
        timestamp: new Date(),
      };

      if (err.message.code === "ECONNREFUSED") {
        return;
      }

      prisma.scriptRunningResult
        .update({
          where: {
            id: scriptRunningResult.id,
          },
          data: {
            isErroneous: true,
            errorMessage: err.message,
          },
        })
        .catch(handleAsyncError);

      data.error = err.message;
      writeDataToDb(data).catch(handleAsyncError);
      res.write(JSON.stringify(data));
    });

    // exit
    k6Process.on("exit", async () => {
      stopped = true;
      clearInterval(interval);
      prisma.scriptRunningResult
        .update({
          where: {
            id: scriptRunningResult.id,
          },
          data: {
            isFinished: true,
          },
        })
        .catch(handleAsyncError);

      await sleep(500);
      res.end();

      fs.promises
        .unlink(scriptPath)
        // just log error if error happen during removal of file
        .catch(handleAsyncError);
    });

    // return scriptRunningResult;
  } catch (err) {
    next(err);
  } finally {
    memoryCache.del(portNumCacheKey);
  }
};
