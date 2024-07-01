import { NextApiRouteError } from "@billyen2012/next-api-router";

export default class NotAuthorizedError extends NextApiRouteError {
  name = "NotAuthorizedError";
}
