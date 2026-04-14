const Groq = require('groq-sdk');
const { quizOutputSchema } = require('../validators/quizSchemas');

let _groq;
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

// @desc    Generate a micro-quiz for lesson completion
// @route   POST /api/quizzes/generate
const generateQuiz = async (req, res) => {
  try {
    const { lessonTitle, dayTitle, currentKnowledge } = req.body;

    if (!lessonTitle) {
      return res.status(400).json({ message: 'Lesson title is required' });
    }

    // Truncate currentKnowledge to avoid oversized requests
    const trimmedKnowledge = (currentKnowledge || 'Beginner').slice(0, 500);

    const systemPrompt = `You are an expert tutor conducting a quick "Active Recall" micro-quiz. 
Your goal is to test the user's understanding of a specific lesson.

Lesson Details:
- Lesson Title: "${lessonTitle}"
- Surrounding Context (Day Title): "${dayTitle || 'General Concept'}"
- User Background: "${trimmedKnowledge}"

Instructions:
1. Generate EXACTLY 3 multiple-choice questions testing key concepts from the lesson.
2. Each question MUST have exactly 4 options.
3. Precisely one option must be the correct answer.
4. IMPORTANT: Do not use markdown backticks around the json, and return ONLY the raw JSON array.

The output MUST be a strict JSON array of 3 objects in the following format:
[
  {
    "question": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correctAnswerIndex": 2
  }
]`;

    const chatCompletion = await getGroq().chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: 'Generate the active recall micro-quiz now. Return ONLY valid JSON.',
        },
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      response_format: { type: 'json_object' },
      max_tokens: 1024,
    });

    const rawContent = chatCompletion.choices[0]?.message?.content;
    
    if (!rawContent) {
      return res.status(502).json({ message: 'No response from AI model' });
    }

    // Parse JSON
    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return res.status(502).json({ message: 'AI returned invalid JSON' });
    }

    // Handle Groq object wrapping if it returns { "quiz": [...] }
    let quizArray = parsed;
    if (!Array.isArray(parsed)) {
       const firstKey = Object.keys(parsed)[0];
       if (firstKey && Array.isArray(parsed[firstKey])) {
         quizArray = parsed[firstKey];
       } else {
         return res.status(502).json({ message: 'AI response is not an array format' });
       }
    }

    // Validate with Zod
    const validation = quizOutputSchema.safeParse(quizArray);
    if (!validation.success) {
      console.error('Quiz validation failed:', validation.error.errors);
      return res.status(502).json({
        message: 'AI output failed validation',
        errors: validation.error.errors,
      });
    }

    res.status(200).json(validation.data);
  } catch (error) {
    console.error('Generate quiz error:', error);
    if (error.status === 401 || error.code === 'authentication_error') {
      return res.status(502).json({ message: 'Invalid Groq API key' });
    }
    res.status(500).json({ message: 'Failed to generate quiz' });
  }
};

module.exports = { generateQuiz };
