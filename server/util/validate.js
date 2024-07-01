/**
 *
 * @param {import('zod').AnyZodObject} schema
 * @returns {import("@billyen2012/next-api-router").NextApiProcessCallback}
 */
const validate = (schema) => async (req, res, next) => {
  const result = await schema.parseAsync(req);
  Object.assign(req, result);
  next();
};

export default validate;
