import { prisma } from "@/server/db";
import ForbiddenError from "@/server/errors/ForbiddenError";
import { isAdminMiddleware } from "@/server/middlewares/isAdminMiddleware";
import validate from "@/server/util/validate";
import NextApiRouter from "@billyen2012/next-api-router";
import { z } from "zod";

const UsersRouter = NextApiRouter({ treatReturnAsResponse: true });

UsersRouter.use(isAdminMiddleware);

const AccountStateSchema = validate(
  z.object({
    data: z.object({
      isSuspended: z.boolean(),
    }),
  })
);

const UserRoleSchema = validate(
  z.object({
    data: z.object({
      isAdmin: z.boolean(),
    }),
  })
);

UsersRouter.get("/", async (req, res) => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      emailHash: true,
      isSuspended: true,
      isAdmin: true,
    },
  });
});

UsersRouter.put("/:id/suspend", AccountStateSchema, async (req, res) => {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: req.params.id,
    },
    select: {
      isSuspended: true,
      isAdmin: true,
    },
  });

  if (user.isAdmin) {
    throw new ForbiddenError("change admin's account state is not allowed");
  }

  await prisma.user.update({
    where: {
      id: req.params.id,
    },
    data: req.data,
  });
  return "ok";
});

UsersRouter.put("/:id/role", UserRoleSchema, async (req, res) => {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: req.params.id,
    },
    select: {
      isAdmin: true,
    },
  });

  if (user.isAdmin) {
    throw new ForbiddenError("change admin's role is not allowed");
  }

  await prisma.user.update({
    where: {
      id: req.params.id,
    },
    data: req.data,
  });
  return "ok";
});

UsersRouter.get("/:id", async (req, res) => {
  return await prisma.user.findFirstOrThrow({
    where: {
      id: req.params.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      emailHash: true,
      emailVerified: true,
      isAdmin: true,
      isSuspended: true,
      isLinkedToOAuthAccount: true,
    },
  });
});

export default UsersRouter;
