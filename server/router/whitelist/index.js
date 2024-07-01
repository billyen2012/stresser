import { prisma } from "@/server/db";
import validate from "@/server/util/validate";
import NextApiRouter from "@billyen2012/next-api-router";
import { z } from "zod";
import { isAdminMiddleware } from "@/server/middlewares/isAdminMiddleware";
import ConflictError from "@/server/errors/ConflictError";

const WhitelistRouter = NextApiRouter({ treatReturnAsResponse: true });

WhitelistRouter.use(isAdminMiddleware);

const CreateWhitelistDomainSchema = validate(
  z.object({
    data: z.object({
      domain: z.string().min(1).max(1024),
    }),
  })
);

const CreateWhitelistEmailSchema = validate(
  z.object({
    data: z.object({
      email: z.string().min(1).max(1024),
    }),
  })
);

WhitelistRouter.get("/domains", async (req, res) => {
  const data = await prisma.whitelistDomain.findMany({
    select: {
      domain: true,
    },
  });
  return data.map((e) => e.domain);
});

WhitelistRouter.post(
  "/domains",
  CreateWhitelistDomainSchema,
  async (req, res) => {
    return await prisma.whitelistDomain.create({
      data: req.data,
    });
  }
);

WhitelistRouter.delete("/domains/:domain", async (req) => {
  return await prisma.whitelistDomain.delete({
    where: {
      domain: String(req.params.domain),
    },
  });
});

WhitelistRouter.get("/emails", async (req, res) => {
  const data = await prisma.whitelistEmail.findMany({
    select: {
      email: true,
    },
  });
  return data.map((e) => e.email);
});

WhitelistRouter.post(
  "/emails",
  CreateWhitelistEmailSchema,
  async (req, res) => {
    if (
      await prisma.whitelistEmail.findFirst({
        where: {
          email: req.data.email,
        },
      })
    ) {
      throw new ConflictError("Email already exist");
    }
    return await prisma.whitelistEmail.create({
      data: req.data,
    });
  }
);

WhitelistRouter.delete("/emails/:email", async (req) => {
  return await prisma.whitelistEmail.delete({
    where: {
      email: String(req.params.email),
    },
  });
});

export default WhitelistRouter;
