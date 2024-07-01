import { auth } from "../auth";
import NotAuthorizedError from "../errors/NotAuthorizedError";

/**@type {import("@billyen2012/next-api-router").NextApiProcessCallback} */
export const sessionMiddleware = async (req, res, next) => {
  const session = await auth();
  if (!session) {
    throw new NotAuthorizedError();
  }

  req.session = session;

  next();
};
