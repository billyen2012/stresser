import rateLimit from "express-rate-limit";

/**
 * @param {Partial<import('express-rate-limit').Options>} options
 * @return {import("@billyen2012/next-api-router").NextApiProcessCallback}
 */
export const rateLimitMiddleware = (options = {}) => {
  const rateLimiter = rateLimit({
    standardHeaders: "draft-7",
    legacyHeaders: false,
    ...options,
  });
  return async (req, res, next) => {
    req.app = {
      get() {
        return false;
      },
    };
    rateLimiter(req, res, next);
  };
};
