const { z } = require('zod');

// Validate the request body for profile analysis
const analyzeProfileSchema = z.object({
  backgroundText: z
    .string({ required_error: 'Background text is required' })
    .min(20, 'Please provide at least 20 characters of background info')
    .max(10000, 'Background text must be under 10,000 characters')
    .trim(),
});

// Validate the structured output from Groq for NSQF analysis
const nsqfAnalysisOutputSchema = z.object({
  parsedExperience: z.array(z.string()).min(1, 'At least one experience item is required'),
  estimatedBaseNsqf: z.number().int().min(1).max(10),
  justification: z.string().min(1),
});

module.exports = { analyzeProfileSchema, nsqfAnalysisOutputSchema };
