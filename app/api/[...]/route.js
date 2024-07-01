import app from "@/server/router";

const handler = app.handler();

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
  handler as UPDATE,
};
