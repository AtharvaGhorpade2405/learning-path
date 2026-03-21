/**
 * Generic Zod validation middleware factory.
 * Takes a Zod schema and returns Express middleware that validates req.body.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return res.status(400).json({
      message: 'Validation failed',
      errors,
    });
  }

  // Replace req.body with the parsed/transformed data
  req.body = result.data;
  next();
};

export default validate;
