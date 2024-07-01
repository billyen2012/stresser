import { NextApiRouteError } from "@billyen2012/next-api-router";

export default class ForbiddenError extends NextApiRouteError {
  name = "ForbiddenError";
}
