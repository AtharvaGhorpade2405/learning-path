const { z } = require('zod');

const quizOutputSchema = z.array(
  z.object({
    question: z.string(),
    options: z.array(z.string()).length(4),
    correctAnswerIndex: z.number().int().min(0).max(3)
  })
).length(3);

module.exports = { quizOutputSchema };
