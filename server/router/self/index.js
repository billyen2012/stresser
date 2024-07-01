import { prisma } from "@/server/db";
import validate from "@/server/util/validate";
import NextApiRouter from "@billyen2012/next-api-router";
import { z } from "zod";

const SelfRouter = NextApiRouter({ treatReturnAsResponse: true });

const UpdateSchema = validate(
  z.object({
    data: z.object({
      name: z.string().min(1).max(1024),
    }),
  })
);

SelfRouter.get("/", (req, res) => {
  return req.session.user;
});

SelfRouter.put("/", UpdateSchema, async (req, res) => {
  await prisma.user.update({
    where: {
      id: req.session.user.id,
    },
    data: req.data,
  });

  return "ok";
});

export default SelfRouter;
