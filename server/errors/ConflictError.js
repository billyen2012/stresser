import { NextApiRouteError } from "@billyen2012/next-api-router";

export default class ConflictError extends NextApiRouteError {
  name = "ConflictError";
}
