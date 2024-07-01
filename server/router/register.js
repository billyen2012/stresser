import { z } from "zod";
import validate from "../util/validate";
import { prisma } from "../db";
import ConflictError from "../errors/ConflictError";
import sha256 from "crypto-js/sha256";
import { getSignature, isWhitelisted } from "../auth";

export const RegisterSchema = validate(
  z.object({
    data: z.object({
      email: z.string().email("not a valid email").toLowerCase(),
      password: z.string().min(8, "min password length is 8"),
      name: z.string().min(1, "name is required"),
    }),
  })
);

/**@type {import('@billyen2012/next-api-router').NextApiProcessCallback} */
export const register = async (req, res) => {
  const { email = "", password = "", name = "" } = req.data;

  // allow first user to be register without whitelist
  const hasUser =
    (await prisma.user.findFirst({ select: { id: true } })) != null;

  if (hasUser && (await isWhitelisted({ isAdmin: false, email })) == false) {
    return res.status(403).send("EmailNotAuthorized");
  }

  if (
    await prisma.user.findFirst({
      where: {
        email,
      },
    })
  ) {
    throw new ConflictError();
  }

  const signature = getSignature(email, password);

  const user = await prisma.user.create({
    data: {
      email,
      emailHash: sha256(email).toString(),
      password: signature,
      name,
      emailVerified: null,
      isSuspended: false,
      isLinkedToOAuthAccount: false,
      isAdmin: !hasUser,
    },
  });

  return { id: user.id, name: user.name, email: user.email };
};
