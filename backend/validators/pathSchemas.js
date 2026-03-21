import { z } from 'zod';

export const generatePathSchema = z.object({
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
export const llmOutputSchema = z.array(
  z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    resources: z.array(z.string()).min(1).max(2),
  })
).min(1, 'At least one step is required');
