import { decrypt, encrypt } from "@/server/auth";
import { prisma } from "@/server/db";
import validate from "@/server/util/validate";
import NextApiRouter, {
  NotFoundError,
  compress,
} from "@billyen2012/next-api-router";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { execScript } from "./exec-script";
import { rateLimitMiddleware } from "@/server/middlewares/rateLimitMiddleware";

const ScriptsRouter = NextApiRouter({ treatReturnAsResponse: true });

const CreateSchema = validate(
  z.object({
    data: z.object({
      name: z.string().min(1).max(64),
      script: z.string().min(0).max(1e6),
    }),
  })
);

const UpdateSchema = validate(
  z.object({
    data: z.object({
      name: z.string().min(1).max(64).optional(),
      isPublic: z.boolean().optional(),
      script: z.string().min(0).max(1e6).optional(),
    }),
  })
);

ScriptsRouter.get("/", async (req, res) => {
  return await prisma.script.findMany({
    where: {
      OR: [{ userId: req.session.user.id }, { isPublic: true }],
    },
    select: {
      id: true,
      name: true,
      isPublic: true,
      createdAt: true,
      updatedAt: true,
      user:
        req.query.include === "user"
          ? {
              select: {
                id: true,
                emailHash: true,
                name: true,
              },
            }
          : undefined,
    },
  });
});

ScriptsRouter.get("/:id", async (req, res) => {
  let data = await prisma.script.findFirstOrThrow({
    where: {
      OR: [
        {
          userId: req.session.user.id,
          id: String(req.params.id),
        },
        {
          id: String(req.params.id),
          isPublic: true,
        },
      ],
    },
    select: {
      id: true,
      name: true,
      script: true,
      isPublic: true,
      createdAt: true,
      updatedAt: true,
      user:
        req.query.include === "user"
          ? {
              select: {
                id: true,
                name: true,
                emailHash: true,
              },
            }
          : undefined,
    },
  });

  data.script = decrypt(data.script);
  return data;
});

ScriptsRouter.put("/:id", UpdateSchema, async (req, res) => {
  if (typeof req.data.script !== "undefined") {
    req.data.script = encrypt(req.data.script);
  }
  const data = await prisma.script.update({
    where: {
      userId: req.session.user.id,
      id: String(req.params.id),
    },
    data: req.data,
    select: {
      id: true,
      updatedAt: true,
    },
  });

  return data;
});

ScriptsRouter.delete("/:id", async (req, res) => {
  await prisma.script.delete({
    where: {
      userId: req.session.user.id,
      id: String(req.params.id),
    },
    select: {
      id: true,
    },
  });

  return "ok";
});

ScriptsRouter.post(
  "/",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
  CreateSchema,
  async (req, res) => {
    req.data.script = encrypt(req.data.script);
    return await prisma.script.create({
      data: {
        ...req.data,
        userId: req.session.user.id,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });
  }
);

ScriptsRouter.post(
  "/run",
  rateLimitMiddleware({
    windowMs: 3000,
    limit: 10,
  }),
  CreateSchema,
  async (req, res) => {
    req.data.script = encrypt(req.data.script);
    return await prisma.script.create({
      data: {
        ...req.data,
        userId: req.session.user.id,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });
  }
);

ScriptsRouter.get(
  "/running-instanceId",
  rateLimitMiddleware({
    windowMs: 3000,
    limit: 20,
  }),
  CreateSchema,
  async (req, res) => {
    req.data.script = encrypt(req.data.script);
    return await prisma.script.create({
      data: {
        ...req.data,
        userId: req.session.user.id,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });
  }
);

ScriptsRouter.get("/:id/running-results", async (req, res) => {
  const { runningResults } = await prisma.script.findFirstOrThrow({
    where: {
      OR: [
        { id: String(req.params.id), userId: req.session.user.id },
        { id: String(req.params.id), isPublic: true },
      ],
    },
    select: {
      runningResults: {
        select: {
          id: true,
          isFinished: true,
          isManuallyStop: true,
          isErroneous: true,
          createdAt: true,
        },
      },
    },
  });

  return runningResults;
});

ScriptsRouter.get("/:scriptId/running-results/:resultId", async (req, res) => {
  const { runningResults } = await prisma.script.findFirstOrThrow({
    where: {
      OR: [
        {
          id: String(req.params.scriptId),
          userId: req.session.user.id,
        },
        {
          id: String(req.params.scriptId),
          isPublic: true,
        },
      ],
    },
    select: {
      runningResults: {
        where: {
          id: String(req.params.resultId),
        },
        select: {
          id: true,
          scriptClone: true,
          isFinished: true,
          isManuallyStop: false,
          isErroneous: true,
          errorMessage: true,
          createdAt: true,
          data:
            req.query.include === "data"
              ? {
                  select: {
                    data: true,
                  },
                }
              : undefined,
        },
      },
    },
  });

  if (!runningResults[0]) {
    throw new NotFoundError();
  }

  runningResults[0].scriptClone = decrypt(runningResults[0].scriptClone);

  return runningResults[0];
});

ScriptsRouter.delete(
  "/:scriptId/running-results/:resultId",
  async (req, res) => {
    await prisma.script.findFirstOrThrow({
      where: {
        id: String(req.params.scriptId),
        userId: req.session.user.id,
      },
      select: {
        id: true,
      },
    });

    await prisma.scriptRunningResult.delete({
      where: {
        id: req.params.resultId,
      },
    });

    return "OK";
  }
);

ScriptsRouter.get(
  "/:scriptId/running-results/:resultId/data",
  async (req, res) => {
    const { runningResults } = await prisma.script.findFirstOrThrow({
      where: {
        id: String(req.params.scriptId),
        userId: req.session.user.id,
      },
      select: {
        runningResults: {
          where: {
            id: String(req.params.resultId),
          },
          select: {
            data: {
              select: {
                data: true,
              },
            },
          },
        },
      },
    });

    if (!runningResults[0]) {
      throw new NotFoundError();
    }

    return runningResults[0].data.map((e) => e.data);
  }
);

ScriptsRouter.get("/exec/:id", compress({ noCompression: true }), execScript);

export default ScriptsRouter;
