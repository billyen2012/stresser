import NotAuthorizedError from "../errors/NotAuthorizedError";

/**@type {import("@billyen2012/next-api-router").NextApiProcessCallback} */
export const isAdminMiddleware = async (req, res, next) => {
  if (req.session && req.session.user.isAdmin == false) {
    throw new NotAuthorizedError();
  }

  next();
};
