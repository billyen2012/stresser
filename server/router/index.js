import NextApiRouter, { compress } from "@billyen2012/next-api-router";
import errorHandler from "../errorHandler";
import ScriptsRouter from "./scripts";
import { sessionMiddleware } from "../middlewares/sessionMiddleware";
import { getTypesDef } from "./getTypesDef";
import { rateLimitMiddleware } from "../middlewares/rateLimitMiddleware";
import WhitelistRouter from "./whitelist";
import { isWhitelisted } from "../auth";
import SelfRouter from "./self";
import UsersRouter from "./users";
import { RegisterSchema, register } from "./register";

const app = NextApiRouter({ treatReturnAsResponse: true });

app.get(
  "/ping",
  rateLimitMiddleware({
    windowMs: 3 * 1000,
    limit: 1000,
  }),
  () => {
    return "pong";
  }
);

app.post(
  "/register",
  rateLimitMiddleware({
    windowMs: 60000,
    limit: 5,
  }),
  app.bodyParser.json(),
  RegisterSchema,
  register
);

app.use(sessionMiddleware);

app.use(async (req, res, next) => {
  if (!req.session.user.isAdmin) {
    // validate is user is suspended
    if (req.session.user.isSuspended) {
      res.status(403);
      return "Account Suspended";
    }

    // validate if user email is whitelisted
    if ((await isWhitelisted(req.session.user)) == false) {
      res.status(403);
      return "Email not authorized";
    }
  }
  next();
});

app.use(app.bodyParser.json());
app.use(app.bodyParser.form());

app.use(compress());
app.use("/self", SelfRouter);
app.get("/typedef/types/:version", getTypesDef);
app.use("/scripts", ScriptsRouter);
app.use("/whitelist/", WhitelistRouter);
app.use("/users", UsersRouter);

app.errorHandler(errorHandler);

export default app;
