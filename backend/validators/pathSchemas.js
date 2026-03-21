const { z } = require('zod');

const generatePathSchema = z.object({
  topic: z
    .string({ required_error: 'Topic is required' })
    .min(2, 'Topic must be at least 2 characters')
    .max(100, 'Topic must be at most 100 characters')
    .trim(),
  level: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'Level is required',
    invalid_type_error: 'Level must be beginner, intermediate, or advanced',
  }),
  days: z
    .number({ required_error: 'Days is required', invalid_type_error: 'Days must be a number' })
    .int('Days must be a whole number')
    .min(1, 'At least 1 day is required')
    .max(365, 'Maximum 365 days allowed'),
});

// Schema to validate the structured output from the LLM
const llmOutputSchema = z.array(
  z.object({
    day: z.number(),
    title: z.string().min(1),
    lessons: z.array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        resources: z.array(
          z.object({
            title: z.string().min(1),
            url: z.string().url().min(1),
          })
        ).min(1).max(3),
      })
    ).min(1),
  })
).min(1, 'At least one day is required');

module.exports = { generatePathSchema, llmOutputSchema };
