import { ZodError } from "zod";
import {
  MalformedJsonError,
  MethodNotAllowedError,
  NotFoundError,
  TimeoutError,
} from "@billyen2012/next-api-router";
import NotAuthorizedError from "@/server/errors/NotAuthorizedError";
import ForbiddenError from "@/server/errors/ForbiddenError";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import ConflictError from "./errors/ConflictError";

/**@type {import("@billyen2012/next-api-router").NextApiErrorHandlerCallback} */
const errorHandler = (err, req, res) => {
  // add zod error to error handler
  if (err instanceof ZodError) {
    // below is just an example, but you should pass the info that is needed for your own client-side code
    const details = {};
    for (let issue of err.issues) {
      issue.path.shift();
      details[issue.path.join(".")] = {
        code: issue.code,
        message: issue.message,
      };
    }
    return res.status(400).json({
      code: 400,
      error: {
        type: "BadInput",
        details,
      },
    });
  }

  if (err instanceof ForbiddenError) {
    return res.status(401).send("Forbidden");
  }

  if (err instanceof NotAuthorizedError) {
    return res.status(403).send("Not authorized");
  }

  // below is default error handler
  if (err instanceof NotFoundError) {
    return res.status(404).send("Not found");
  }

  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        return res.status(409).send({
          error: "targeted field(s) already exist",
          details: {
            target: err.meta.target,
          },
        });
      }
      case "P2025":
      case "P2016": {
        return res.status(404).send("Not found");
      }
      default: {
      }
    }
  }

  if (err instanceof MalformedJsonError) {
    return res.status(400).send("Malformed json in body's payload");
  }

  if (err instanceof TimeoutError) {
    return res.status(408).send("Request timeout");
  }

  if (err instanceof MethodNotAllowedError) {
    return res.status(405).send("Method not allowed");
  }

  if (err instanceof ConflictError) {
    return res.status(409).send(err.message);
  }

  console.log(err);

  res
    .status(500)
    .send(process.env.NODE_ENV === "development" ? err.stack : "Server Error");
};

export const handleAsyncError = (error) => {
  console.log(error);
};

export default errorHandler;
